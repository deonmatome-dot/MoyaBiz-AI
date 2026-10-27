import assert from "node:assert/strict";
import test from "node:test";
import {
  calculateProfitSummary,
  calculateQuoteLineTotal,
  calculateQuoteTotal,
  parseCurrencyInput,
  parsePositiveQuantity,
} from "./business-math.ts";

test("parses non-negative rand values with at most two decimals", () => {
  assert.equal(parseCurrencyInput("0"), 0);
  assert.equal(parseCurrencyInput("120.50"), 120.5);
  assert.equal(parseCurrencyInput(""), null);
  assert.equal(parseCurrencyInput("-5"), null);
  assert.equal(parseCurrencyInput("1.999"), null);
  assert.equal(parseCurrencyInput("Infinity"), null);
  assert.equal(parseCurrencyInput("999999999999999999999"), null);
});

test("accepts only whole positive quantities", () => {
  assert.equal(parsePositiveQuantity("1"), 1);
  assert.equal(parsePositiveQuantity("12"), 12);
  assert.equal(parsePositiveQuantity("01"), 1);
  assert.equal(parsePositiveQuantity("0"), null);
  assert.equal(parsePositiveQuantity("1.5"), null);
  assert.equal(parsePositiveQuantity("-2"), null);
});

test("calculates revenue, total cost, gross profit and margin", () => {
  assert.deepEqual(calculateProfitSummary(120, 250, 1), {
    revenue: 250,
    totalCost: 120,
    grossProfit: 130,
    profitMargin: 52,
  });
  assert.deepEqual(calculateProfitSummary(200, 250, 2), {
    revenue: 500,
    totalCost: 200,
    grossProfit: 300,
    profitMargin: 60,
  });
});

test("handles a loss and rejects invalid calculator values", () => {
  assert.deepEqual(calculateProfitSummary(300, 100, 2), {
    revenue: 200,
    totalCost: 300,
    grossProfit: -100,
    profitMargin: -50,
  });
  assert.equal(calculateProfitSummary(-1, 100, 1), null);
  assert.equal(calculateProfitSummary(10, 0, 1), null);
  assert.equal(calculateProfitSummary(10, 100, 0), null);
  assert.equal(calculateProfitSummary(10, 100, 1.5), null);
});

test("calculates quotation line and grand totals in cents", () => {
  assert.equal(calculateQuoteLineTotal("3", "19.99"), 59.97);
  assert.equal(
    calculateQuoteTotal([
      { quantity: "3", unitPrice: "19.99" },
      { quantity: "1", unitPrice: "10.05" },
    ]),
    70.02,
  );
  assert.equal(calculateQuoteLineTotal("0", "5.00"), null);
  assert.equal(calculateQuoteLineTotal("2", "-5.00"), null);
  assert.equal(
    calculateQuoteTotal([
      { quantity: "1.5", unitPrice: "8.00" },
    ]),
    null,
  );
  assert.equal(calculateQuoteTotal([]), null);
});
