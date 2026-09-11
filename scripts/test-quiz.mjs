import assert from "node:assert/strict";

function grade(q, choices) {
  if (q.flags?.noAnswer) return null;
  const a = [...q.answer].sort().join(",");
  const b = [...new Set(choices)].sort().join(",");
  return a === b;
}

assert.equal(grade({ answer: ["가"], flags: {} }, ["가"]), true);
assert.equal(grade({ answer: ["가"], flags: {} }, ["나"]), false);
assert.equal(grade({ answer: ["다", "라"], flags: {} }, ["라", "다"]), true);
assert.equal(grade({ answer: ["다", "라"], flags: {} }, ["다"]), false);
assert.equal(grade({ answer: [], flags: { noAnswer: true } }, ["가"]), null);
console.log("quiz grade ok");
