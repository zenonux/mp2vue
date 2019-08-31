#!/usr/bin/env node
const program = require("commander");

program
  .command("clone <source> [destination]")
  .description("clone a repository into a newly created directory")
  .action((source, destination) => {
    console.log("clone command called");
  });
