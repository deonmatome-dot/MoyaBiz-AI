# MoyaBiz AI

MoyaBiz AI is a mobile-friendly toolkit for South African small businesses. It includes a ZAR profit calculator, a quotation builder with print/PDF support, and a WhatsApp/Facebook marketing caption assistant.

## Run in Replit

1. Open the project in Replit and install workspace dependencies with `pnpm install`.
2. Start the **API Server** and **MoyaBiz AI: web** workflows. Their commands are `pnpm --filter @workspace/api-server run dev` and `pnpm --filter @workspace/moyabiz-ai run dev`.
3. Open the MoyaBiz AI web preview. The API Server workflow provides the `/api` endpoints used by the marketing assistant.

Run the commands through their Replit workflows so Replit supplies the required service ports and preview paths.

The web app and API server need to be running together. The profit calculator and quotation builder work without an API key or database.

## Optional Muse Spark setup

Marketing generation runs in clearly labeled **demo mode** until the server has a valid Meta Model API key. To enable live generation:

1. Create a key in the [Meta Model API dashboard](https://dev.meta.ai/) and confirm it has access to Muse Spark.
2. In the Replit mobile app, open this project and its workspace. Open **Tools**, then **Setup → Secrets**. Tap **New Secret**, enter `MODEL_API_KEY` in **Key**, paste the Meta key into **Value**, and tap **Add Secret**. If the mobile app does not show the Tools pane, open the project in a mobile browser and switch to the desktop-site view; the same **Tools → Setup → Secrets** flow is documented for the Project Editor.
3. Restart the **API Server** workflow, return to MoyaBiz AI, and submit a marketing request. The app labels a result as AI-generated only after the server receives and validates a successful response.

Meta Model API usage may incur charges under the account's plan. Before each live generation request, the app asks the user to acknowledge possible usage charges. Live generation is optional; the other tools and demo captions work without it. If a configured model request fails, the app shows an error rather than presenting demo text as live AI output.

The API uses Muse Spark `muse-spark-1.3` through Meta's server-side [Responses API](https://developer.meta.ai/docs/protocols/responses), following Meta's documented `POST /v1/responses` request format and [model ID](https://developer.meta.ai/docs/models). The key is read only by the API server and is never sent to the browser. Live generation must be confirmed with a successful request after the key is configured.

## Checks

```sh
pnpm run typecheck
pnpm --filter @workspace/api-server run typecheck
pnpm --filter @workspace/api-server run test:marketing
pnpm --filter @workspace/moyabiz-ai run typecheck
pnpm --filter @workspace/moyabiz-ai run test:math
```

The marketing test uses a mocked upstream response to verify the server-side request, demo fallback, validation, and error handling. It does **not** verify Meta credentials, account access, or a live model response; only a successful generation with your own key confirms live access.

## Project layout

- `artifacts/moyabiz-ai/` — React + Vite application
- `artifacts/api-server/` — Express API, including the server-side Meta Model API integration
- `lib/api-spec/openapi.yaml` — API contract; regenerate clients with `pnpm --filter @workspace/api-spec run codegen`

No database is required for the requested features.
