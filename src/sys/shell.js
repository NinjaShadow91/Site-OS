import { processManager } from "./main.js";
import { sFile, pathParser } from "./fs.js";
import { getAbsPath } from "../lib/lib.js";

// !! Global Variable !!
var globalShellVariables = {};

const STDIN = "/root/var/stdin";
const STDOUT = "/root/var/stdout";
const STDERR = "/root/var/stderr";

// const keywords = ["=", "export", "clear", "hclear"];
// const strChars = ["'", '"', "`"];

function commandParser(commandStr, wPath) {
  let command = {
    program: "",
    flags: [],
    others: [],
    isPiped: false,
    in: STDIN,
    appendOutput: false,
    out: STDOUT,
    appendError: false,
    err: STDERR,
    envVar: [],
    wPath: wPath,
  };
  let cArr = commandStr.split(" ");
  cArr = cArr.filter((e) => {
    if (e !== "") return true;
    else return false;
  });

  command.program = cArr[0];
  for (let i = 1; i < cArr.length; ++i) {
    if (cArr[i].charAt(0) == "-" && cArr[i].charAt(1) !== "-") {
      const itr = cArr[i][Symbol.iterator]();
      itr.next();
      let subStr = itr.next();
      while (!subStr.done) {
        command.flags.push(subStr.value);
        subStr = itr.next();
      }
    } else if (cArr[i].charAt(0) == "-" && cArr[i].charAt(1) === "-") {
      command.flags.push(cArr[i].slice(2));
    } else if (cArr[i].includes("<")) {
      command.in = cArr[i].slice(1);
    } else if (cArr[i].includes("2>>")) {
      command.err = cArr[i].slice(3);
      command.appendError = true;
    } else if (cArr[i].includes("2>")) {
      command.err = cArr[i].slice(2);
      command.appendError = false;
    } else if (cArr[i].includes("&>>")) {
      command.out = cArr[i].slice(3);
      command.appendOutput = true;
      command.err = cArr[i].slice(3);
      command.appendError = true;
    } else if (cArr[i].includes("&>")) {
      command.out = cArr[i].slice(2);
      command.appendOutput = false;
      command.err = cArr[i].slice(2);
      command.appendError = false;
    } else if (cArr[i].includes(">>")) {
      command.out = cArr[i].slice(2);
      command.appendOutput = true;
    } else if (cArr[i].includes(">")) {
      command.out = cArr[i].slice(1);
      command.appendOutput = false;
    } else {
      command.others.push(cArr[i]);
    }
  }
  return command;
}

// const nthIndex = (str, pat, n) => {
//   let L = str.length,
//     i = -1;
//   while (n-- && i++ < L) {
//     i = str.indexOf(pat, i);
//     if (i < 0) break;
//   }
//   return i;
// };

// function keywordFinder(keyword, str) {
//   let strPosn = [];
//   let strChar = "";
//   for (let i = 0; i < str.length; ++i) {
//     console.log(str.charAt(isRealToken));
//     if (
//       strChar === "" &&
//       (str.charAt(i) === '"' || str.charAt(i) === "'" || str.charAt(i) === "`")
//     ) {
//       strChar = str.charAt(i);
//       strPosn.push(i);
//     } else if (strChar === str.charAt(i)) {
//       strChar = "";
//       strPosn.push(i);
//     }
//   }

//   let found = false;
//   let n = 1;
//   while (nthIndex(str, keyword, n) !== -1) {
//     let p = nthIndex(str, keyword, n);
//     ++n;
//     for (let j = 0; j < strPosn.length; ++j) {
//       console.log(p, strPosn[j], strPosn[j + 1]);
//       if (!(p > strPosn[j] && p < strPosn[++j])) {
//         found = true;
//       } else {
//         found = false;
//       }
//     }
//     if (found) break;
//   }
//   return found;
// }

function parseCommandString(commandStr, wPath) {
  let commnadTokens = commandStr.split(" ");
  commnadTokens = commnadTokens.filter((token) => {
    if (token !== "") return true;
    else return false;
  });

  if (commnadTokens[0] === "export") {
    // syntax supported export var=value not export var = value ,etc
    return {
      program: "Internal Command",
      others: [
        "export",
        commandStr.split(" ")[1].split("=")[0],
        commandStr.split(" ")[1].split("=")[1],
      ],
    };
  } else if (commnadTokens[0] === "clear") {
    return { program: "Internal Command", others: ["clear"] };
  } else if (commnadTokens[0] === "hclear") {
    return { program: "Internal Command", others: ["hclear"] };
  } else if (commnadTokens[0] === "cd") {
    return { program: "Internal Command", others: ["cd", commnadTokens[1]] };
  } else {
    return commandParser(commandStr, wPath);
  }
}

function parser(strToParse, wPath) {
  //   console.log(wPath);
  try {
    let commandStrs = strToParse.split("|");
    let commands = [];
    commands.push(parseCommandString(commandStrs[0], wPath));
    for (let i = 1; i < commandStrs.length; ++i) {
      let nCommand = parseCommandString(commandStrs[i], wPath);
      nCommand.isPiped = true;
      commands.push(nCommand);
    }

    return commands;
  } catch (e) {
    throw new Error("Bash Syntax Error", { cause: e });
  }
}

export default function shell(ROOT_DIR) {
  let shellHistory = [];
  let c = shellHistory.length;

  if (!(ROOT_DIR instanceof sFile) || !ROOT_DIR.isDirectory())
    throw new Error("File System Error: ROOT_DIR is not a directory.");
  let wDir = ROOT_DIR;

  shellInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      const shellInput = document.getElementById("shellInput");
      const shellOutputContainer = document.getElementById(
        "shellOutputContainer"
      );
      let newDiv = document.createElement("div");
      newDiv.className = "shellOutput";
      newDiv.innerHTML = "$ ".concat(shellInput.innerHTML);
      shellOutputContainer.appendChild(newDiv);
      newDiv = document.createElement("div");
      newDiv.className = "shellOutput";

      shellHistory.push(shellInput.textContent);
      c = shellHistory.length;
      let commands = parser(
        shellInput.textContent,
        wDir.getLocation().concat(wDir.getName().concat("/"))
      );
      commands.forEach((command) => {
        // console.log("wDir is", wDir.getLocation());
        if (command.program === "Internal Command") {
          try {
            switch (command.others[0]) {
              case "cd":
                let nWDir;
                if (command.others[1] === "..") {
                  nWDir = pathParser(wDir.getLocation());
                  if (nWDir !== null) wDir = nWDir;
                  else {
                    newDiv.textContent = "Invalid directory";
                    shellOutputContainer.appendChild(newDiv);
                  }
                } else if (command.others[1].charAt(0) !== "/") {
                  // console.log(command.others[1], ROOT_DIR.getLocation());
                  nWDir = pathParser(
                    getAbsPath(
                      command.others[1],
                      wDir.getLocation().concat(wDir.getName().concat("/"))
                    )
                  );
                  if (nWDir !== null) wDir = nWDir;
                  else {
                    newDiv.textContent = "Invalid directory";
                    shellOutputContainer.appendChild(newDiv);
                  }
                  // console.log(wDir);
                } else {
                  nWDir = pathParser(command.others[1]);
                  if (nWDir !== null) wDir = nWDir;
                  else {
                    newDiv.textContent = "Invalid directory";
                    shellOutputContainer.appendChild(newDiv);
                  }
                }
                break;
              case "hclear":
                shellHistory = [];
                c = 0;
                break;
              case "clear":
                document.getElementById("shellOutputContainer").innerHTML = "";
                break;
              case "export":
                globalShellVariables[command.others[1]] = command.others[2];
                break;
              default:
                throw new Error("Bash Error :Undefined Internal Command");
            }
          } catch (e) {
            console.log(e);
            newDiv.textContent = "Something went wrong";
            shellOutputContainer.appendChild(newDiv);
          } finally {
            shellInput.textContent = "";
          }
        } else {
          try {
            processManager(command);
            newDiv.innerHTML = pathParser(STDOUT).getContent();
          } catch (e) {
            newDiv.innerHTML = pathParser(STDERR).getContent();
          } finally {
            shellOutputContainer.appendChild(newDiv);
            shellInput.textContent = "";
          }
        }
      });
    } else if (e.key === "ArrowUp") {
      --c;
      if (c >= 0) shellInput.textContent = shellHistory[c];
      else ++c;
    } else if (e.key === "ArrowDown") {
      ++c;
      if (c < shellHistory.length) shellInput.textContent = shellHistory[c];
      else {
        c = shellHistory.length;
        shellInput.textContent = "";
      }
    }
  });
}

export { shell, globalShellVariables };
