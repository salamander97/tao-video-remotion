import { test } from "node:test";
import assert from "node:assert/strict";
import { handheld } from "../shake";

test("handheld is deterministic for the same frame", () => {
  assert.deepEqual(handheld(37), handheld(37));
});

test("handheld amplitude stays bounded by ~1.6x amp", () => {
  const amp = 0.02;
  for (let f = 0; f < 300; f++) {
    const [x, y, z] = handheld(f, amp);
    assert.ok(Math.abs(x) <= amp * 1.6);
    assert.ok(Math.abs(y) <= amp * 1.6);
    assert.equal(z, 0);
  }
});
