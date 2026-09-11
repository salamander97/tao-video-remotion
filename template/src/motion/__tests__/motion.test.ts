import { test } from "node:test";
import assert from "node:assert/strict";
import { velocityAt, lagged, dampedSettle } from "../motion";

test("velocityAt returns zero speed for a static position", () => {
  const pos = () => ({ x: 5, y: 5 });
  const { vx, vy, speed } = velocityAt(pos, 10);
  assert.equal(vx, 0);
  assert.equal(vy, 0);
  assert.equal(speed, 0);
});

test("velocityAt detects constant horizontal motion", () => {
  const pos = (f: number) => ({ x: f * 2, y: 0 });
  const { vx, speed } = velocityAt(pos, 10);
  assert.equal(vx, 2);
  assert.equal(speed, 2);
});

test("lagged samples the earlier frame", () => {
  const stateAt = (f: number) => f * 10;
  assert.equal(lagged(stateAt, 20, 4), 160);
});

test("dampedSettle is zero at or before t=0 and decays toward 0", () => {
  assert.equal(dampedSettle(0, 0.1, 0.15), 0);
  assert.equal(dampedSettle(-5, 0.1, 0.15), 0);
  const early = Math.abs(dampedSettle(2, 0.1, 0.15));
  const late = Math.abs(dampedSettle(40, 0.1, 0.15));
  assert.ok(late < early);
});
