import { test } from "node:test";
import assert from "node:assert/strict";
import { Easing, seg } from "../easing";

test("all easing functions map 0->0 and 1->1 (except elastic edge cases already 0/1)", () => {
  for (const [name, fn] of Object.entries(Easing)) {
    assert.ok(Math.abs(fn(0) - 0) < 1e-9, `${name}(0) should be ~0`);
    assert.ok(Math.abs(fn(1) - 1) < 1e-9, `${name}(1) should be ~1`);
  }
});

test("seg clamps before t0 and after t1", () => {
  assert.equal(seg(-5, 10, 20), 0);
  assert.equal(seg(25, 10, 20), 1);
});

test("seg applies easing mid-range", () => {
  const mid = seg(15, 10, 20, Easing.linear);
  assert.equal(mid, 0.5);
});

test("seg handles zero-length segment", () => {
  assert.equal(seg(5, 10, 10), 0);
  assert.equal(seg(10, 10, 10), 1);
});
