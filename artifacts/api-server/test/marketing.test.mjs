import assert from "node:assert/strict";
import { once } from "node:events";
import http from "node:http";
import express from "express";
import { test } from "node:test";
import marketingRouter from "../src/routes/marketing.ts";

const validInput = {
  businessType: "Home bakery",
  productOrService: "fresh vetkoek",
  targetCustomers: "families in Soweto",
  platform: "Both",
  tone: "Friendly and helpful",
};

test("marketing endpoint handles demo, validation, and Meta API responses", async (t) => {
  const app = express();
  app.use(express.json());
  app.use((req, _res, next) => {
    req.log = { warn() {}, error() {} };
    next();
  });
  app.use(marketingRouter);

  const server = app.listen(0);
  await once(server, "listening");
  const address = server.address();
  assert.ok(address && typeof address === "object");

  const originalKey = process.env.MODEL_API_KEY;
  const originalFetch = globalThis.fetch;

  async function request(method, path, body) {
    return new Promise((resolve, reject) => {
      const request = http.request(
        {
          hostname: "127.0.0.1",
          port: address.port,
          path,
          method,
          headers: body
            ? { "content-type": "application/json" }
            : undefined,
        },
        (response) => {
          const chunks = [];
          response.on("data", (chunk) => chunks.push(chunk));
          response.on("end", () => {
            const text = Buffer.concat(chunks).toString("utf8");
            resolve({
              status: response.statusCode,
              body: text ? JSON.parse(text) : null,
            });
          });
        },
      );
      request.on("error", reject);
      if (body) request.write(JSON.stringify(body));
      request.end();
    });
  }

  t.after(async () => {
    globalThis.fetch = originalFetch;
    if (originalKey === undefined) delete process.env.MODEL_API_KEY;
    else process.env.MODEL_API_KEY = originalKey;
    await new Promise((resolve) => server.close(resolve));
  });

  await t.test("reports missing key and produces clearly labeled demo captions", async () => {
    delete process.env.MODEL_API_KEY;
    const status = await request("GET", "/marketing/status");
    assert.deepEqual(status.body, { configured: false, model: null });

    const response = await request(
      "POST",
      "/marketing/generate",
      validInput,
    );
    assert.equal(response.status, 200);
    assert.equal(response.body.mode, "demo");
    assert.match(response.body.whatsappCaption, /fresh vetkoek/);
    assert.match(response.body.facebookCaption, /families in Soweto/);
  });

  await t.test("returns field-specific errors for invalid requests", async () => {
    const response = await request("POST", "/marketing/generate", {
      ...validInput,
      businessType: "",
      platform: "Instagram",
    });
    assert.equal(response.status, 400);
    assert.match(response.body.error, /Business type is required/);
    assert.match(response.body.error, /Platform must be WhatsApp, Facebook, or Both/);
  });

  await t.test("sends a server-side Responses API request and validates its result", async () => {
    process.env.MODEL_API_KEY = "server-only-test-key";
    let receivedRequest;
    globalThis.fetch = async (url, options) => {
      receivedRequest = { url: String(url), options };
      return {
        ok: true,
        status: 200,
        json: async () => ({
          output_text: JSON.stringify({
            whatsappCaption: "Fresh vetkoek, made today!",
            facebookCaption: "Treat your family to fresh vetkoek today.",
          }),
        }),
      };
    };

    const response = await request(
      "POST",
      "/marketing/generate",
      validInput,
    );
    assert.equal(response.status, 200);
    assert.equal(response.body.mode, "ai");
    assert.equal(response.body.model, "muse-spark-1.3");
    assert.equal(response.body.whatsappCaption, "Fresh vetkoek, made today!");
    assert.equal(
      receivedRequest.url,
      "https://api.meta.ai/v1/responses",
    );
    assert.equal(receivedRequest.options.method, "POST");
    assert.equal(
      receivedRequest.options.headers.Authorization,
      "Bearer server-only-test-key",
    );
    const apiBody = JSON.parse(receivedRequest.options.body);
    assert.equal(apiBody.model, "muse-spark-1.3");
    assert.match(apiBody.input, /fresh vetkoek/);
    assert.match(apiBody.input, /Friendly and helpful/);
    assert.doesNotMatch(JSON.stringify(response.body), /server-only-test-key/);
  });

  await t.test("returns a useful upstream failure without exposing the key", async () => {
    process.env.MODEL_API_KEY = "server-only-test-key";
    globalThis.fetch = async () => ({
      ok: false,
      status: 401,
    });

    const response = await request(
      "POST",
      "/marketing/generate",
      validInput,
    );
    assert.equal(response.status, 502);
    assert.match(response.body.error, /HTTP 401/);
    assert.match(response.body.error, /API key/);
    assert.doesNotMatch(response.body.error, /server-only-test-key/);
  });

  await t.test("explains connection failures", async () => {
    process.env.MODEL_API_KEY = "server-only-test-key";
    globalThis.fetch = async () => {
      throw new TypeError("offline");
    };

    const response = await request(
      "POST",
      "/marketing/generate",
      validInput,
    );
    assert.equal(response.status, 502);
    assert.match(response.body.error, /could not be reached/);
  });
});
