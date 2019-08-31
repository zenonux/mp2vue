#!/usr/bin/env node
const program = require("commander");

program.option(
  "-c, --cheese <type>",
  "add the specified type of cheese",
  "blue"
);

program.parse(process.argv);

console.log(`cheese: ${program.cheese}`);
