import { test } from "node:test";
import assert from "node:assert/strict";
import { mulberry32 } from "../rand";

test("mulberry32 is deterministic for the same seed", () => {
  const a = mulberry32(42);
  const b = mulberry32(42);
  const seqA = [a(), a(), a()];
  const seqB = [b(), b(), b()];
  assert.deepEqual(seqA, seqB);
});

test("mulberry32 produces values in [0,1)", () => {
  const rand = mulberry32(7);
  for (let i = 0; i < 50; i++) {
    const v = rand();
    assert.ok(v >= 0 && v < 1);
  }
});

test("different seeds diverge", () => {
  const a = mulberry32(1)();
  const b = mulberry32(2)();
  assert.notEqual(a, b);
});
