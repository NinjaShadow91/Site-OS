import { ROOT_DIR, cFile } from "./fs.js";
import { shell } from "./shell.js";
import { cError } from "../lib/libError.js";

// Program imports
import { ls } from "../bin/ls.js";
import { echo } from "../bin/echo.js";
import { uname } from "../bin/uname.js";
import { touch } from "../bin/touch.js";
import { mkdir } from "../bin/mkdir.js";
import { cat } from "../bin/cat.js";
import { nano } from "../bin/nano.js";

// Setting up File System
new cFile("var", "/root/", "DIR");
new cFile("stdin", "/root/var/");
new cFile("stderr", "/root/var/");
new cFile("stdout", "/root/var/");
new cFile("diri", "/root/var/", "DIR");
new cFile(".diri1", "/root/var/", "DIR");
new cFile("diriii", "/root/var/diri", "DIR");
new cFile("stdout1", "/root/var/diri");
new cFile("stdout", "/root/var/diri");
new cFile(".hidden", "/root/var/").addContent("Checking cat", false);

function processManager(programBlock) {
  console.log(programBlock);
  switch (programBlock.program) {
    case "ls":
      return ls(programBlock);
    case "echo":
      return echo(programBlock);
    case "uname":
      return uname(programBlock);
    case "mkdir":
      return mkdir(programBlock);
    case "touch":
      return touch(programBlock);
    case "cat":
      return cat(programBlock);
    case "nano":
      return nano(programBlock);
    default:
      throw new cError(`$ Program not found.\n`, 0, 0, null, [programBlock]);
  }
}

export function loader(programBlock) {
  return processManager(programBlock);
}

// Authentication can be implemented here
function startOS() {
  shell(ROOT_DIR);
}

startOS();
