#!/usr/bin/env node
const program = require("commander");
const fileDisplay = require("./libs/index");

program.option("-p, --path <dir>", "需要转换的路径", "./pages");
program.parse(process.argv);

let path = program.path;
fileDisplay(path);
