import { ROOT_DIR } from "./fs.js";
import { ls } from "../bin/ls.js";

new sFile("var", "/root/", "DIR");
new sFile("stdin", "/root/var/");
new sFile("stderr", "/root/var/");
new sFile("stdout", "/root/var/");

import { sFile, pathParser } from "./fs.js";
import { shell } from "./shell.js";

export function processManager(command) {
  let cFile;
  switch (command.program) {
    case "ls":
      return ls(command);
    case "uname":
      return uname();
      break;
    case "mkdir":
      // cDir = pathParser(command.others[0], workingDirectory);
      return mkdir(workingDirectory, command.others[0]);
    case "touch":
      return touch(workingDirectory, command.others[0]);
    case "cd":
      // console.log(command.others[0]);
      workingDirectory = cd(command.others[0]);
    case "pwd":
      newDiv.innerHTML = pwd(workingDirectory);
      break;
    case "cat":
      cFile = pathParser(command.others[0], workingDirectory);
      newDiv.innerHTML = cat(cFile);
      break;
    case "nano":
      cFile = pathParser(command.others[0], workingDirectory);
      nano(cFile);
      break;
    default:
      throw new Error(`$ Program not found.\n`, { program: command });
  }
  shellOutputContainer.appendChild(newDiv);
  shellInput.innerHTML = "";
}

function startOS() {
  shell(ROOT_DIR);
}

startOS();
