import run, { test } from "good-vibes";
import parse from "../app";

test("My first test", (context) => {
  const expected = {};
  context.log("Lets do this!");
  context.check(expected, parse("Hello"));
  context.done();
});

run();
