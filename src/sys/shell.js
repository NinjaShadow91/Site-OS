import { File, getAbsPath, getFile, exec } from "../lib/lib.js";
import { cError } from "../lib/libError.js";

const STDIN = "/root/var/stdin";
const STDOUT = "/root/var/stdout";
const STDERR = "/root/var/stderr";

// const keywords = ["=", "export", "clear", "hclear", "pwd"];

function throwInvalidSyntax(str) {
  throw new cError("Bash Syntax Error", 1, 0, null, [str]);
}

function commandParser(commandTokens, wPath) {
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
    envVar: {},
    wPath: wPath,
  };

  command.program = commandTokens[0];
  for (let i = 1; i < commandTokens.length; ++i) {
    if (
      commandTokens[i].charAt(0) == "-" &&
      commandTokens[i].charAt(1) !== "-"
    ) {
      const itr = commandTokens[i][Symbol.iterator]();
      itr.next();
      let subStr = itr.next();
      while (!subStr.done) {
        command.flags.push(subStr.value);
        subStr = itr.next();
      }
    } else if (
      commandTokens[i].charAt(0) == "-" &&
      commandTokens[i].charAt(1) === "-"
    ) {
      command.flags.push(commandTokens[i].slice(2));
    } else if (commandTokens[i].includes("<")) {
      command.in = commandTokens[i].slice(1);
    } else if (commandTokens[i].includes("2>>")) {
      command.err = commandTokens[i].slice(3);
      command.appendError = true;
    } else if (commandTokens[i].includes("2>")) {
      command.err = commandTokens[i].slice(2);
      command.appendError = false;
    } else if (commandTokens[i].includes("&>>")) {
      command.out = commandTokens[i].slice(3);
      command.appendOutput = true;
      command.err = commandTokens[i].slice(3);
      command.appendError = true;
    } else if (commandTokens[i].includes("&>")) {
      command.out = commandTokens[i].slice(2);
      command.appendOutput = false;
      command.err = commandTokens[i].slice(2);
      command.appendError = false;
    } else if (commandTokens[i].includes(">>")) {
      command.out = commandTokens[i].slice(2);
      command.appendOutput = true;
    } else if (commandTokens[i].includes(">")) {
      command.out = commandTokens[i].slice(1);
      command.appendOutput = false;
    } else {
      command.others.push(commandTokens[i]);
    }
  }
  return command;
}

function nthIndex(str, pat, n) {
  if (typeof str !== "string") throw new TypeError();
  var L = str.length,
    i = -1;
  while (n-- && i++ < L) {
    i = str.indexOf(pat, i);
    if (i < 0) break;
  }
  return i;
}

function replaceShellVariables(commnadTokens, shellVariables) {
  let nCommandTokens = [];
  commnadTokens.filter((token) => {
    let n = 1;
    let p = nthIndex(token, "$", n);
    if (p !== -1) {
      let prefix = token.slice(0, p);
      while (p !== -1) {
        let np = nthIndex(token, "$", ++n);
        let svar =
          shellVariables[token.slice(p + 1, np === -1 ? token.length : np)];
        if (typeof svar !== "undefined") prefix = prefix.concat(svar);
        p = np;
      }
      nCommandTokens.push(prefix);
    } else nCommandTokens.push(token);
  });
  return nCommandTokens;
}

function parseCommandString(commandStr, wPath, shellVariables) {
  let commnadTokens = commandStr.split(" ");
  commnadTokens = commnadTokens.map((token) => {
    return token.trim();
  });

  commnadTokens = commnadTokens.filter((token) => {
    if (token !== "") return true;
  });

  commnadTokens = replaceShellVariables(commnadTokens, shellVariables);

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
    if (typeof commnadTokens[1] === "undefined" || commnadTokens[1] === "")
      throwInvalidSyntax(commandStr);
    return { program: "Internal Command", others: ["cd", commnadTokens[1]] };
  } else if (commnadTokens[0] === "pwd") {
    return { program: "Internal Command", others: ["pwd"] };
  } else {
    return commandParser(commnadTokens, wPath);
  }
}

function parser(strToParse, wPath, shellVariables) {
  try {
    let commandStrs = strToParse.split("|");
    let commands = [];
    commands.push(parseCommandString(commandStrs[0], wPath, shellVariables));
    for (let i = 1; i < commandStrs.length; ++i) {
      let nCommand = parseCommandString(commandStrs[i], wPath, shellVariables);
      nCommand.isPiped = true;
      nCommand.in = STDOUT;
      commands.push(nCommand);
    }
    return commands;
  } catch (e) {
    throwInvalidSyntax(strToParse);
  }
}

export default function shell(ROOT_DIR) {
  let globalShellVariables = {};
  let shellHistory = [];
  let c = shellHistory.length;

  if (!(ROOT_DIR instanceof File))
    throw new cError(
      "File System Error: ROOT_DIR is not a file object.",
      0,
      1,
      null,
      [ROOT_DIR]
    );
  if (!ROOT_DIR.isDirectory())
    throw new cError(
      "File System Error: ROOT_DIR is not a direectory.",
      0,
      2,
      null,
      [ROOT_DIR]
    );

  let wDir = ROOT_DIR;

  // focus prompt logic
  document
    .querySelector(".shellMainContainer")
    .addEventListener("click", (e) => {
      e.preventDefault();
      document.querySelector("#shellInput").focus();
    });

  shellInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      const shellInput = document.getElementById("shellInput");
      const shellOutputContainer = document.getElementById(
        "shellOutputContainer"
      );

      let newDiv = document.createElement("div");
      newDiv.className = "shellOutput";
      newDiv.innerHTML = wDir
        .getLocation()
        .concat(" $ ".concat(shellInput.innerHTML));
      shellOutputContainer.appendChild(newDiv);

      newDiv = document.createElement("div");
      newDiv.className = "shellOutput";
      if (shellInput.textContent === "") {
        shellInput.textContent = "";
        return;
      }

      shellHistory.push(shellInput.textContent);
      c = shellHistory.length;
      try {
        let commands = parser(
          shellInput.textContent,
          wDir.getLocation(),
          globalShellVariables
        );
        commands.forEach((command) => {
          if (!command.isPiped) {
            const out = getFile(STDOUT);
            out.addContent("", false);
            const err = getFile(STDERR);
            err.addContent("", false);
          }
          command.wPath = wDir.getLocation();
          if (command.program === "Internal Command") {
            try {
              switch (command.others[0]) {
                case "cd":
                  let nWDir = getFile(
                    getAbsPath(command.others[1], wDir.getLocation())
                  );
                  if (nWDir !== null) wDir = nWDir;
                  else {
                    newDiv.textContent = "Invalid directory";
                    shellOutputContainer.appendChild(newDiv);
                  }
                  document.getElementById("shellInputPrompt").textContent = wDir
                    .getLocation()
                    .concat(" $ ");
                  break;
                case "pwd":
                  newDiv.textContent = wDir.getLocation();
                  shellOutputContainer.appendChild(newDiv);
                  break;
                case "hclear":
                  shellHistory = [];
                  c = 0;
                  break;
                case "clear":
                  document.getElementById("shellOutputContainer").innerHTML =
                    "";

                  // Not working, current command also gets cleared
                  if (commands.length > 1) {
                    newDiv.innerHTML = "$ ".concat(shellInput.innerHTML);
                    shellOutputContainer.appendChild(newDiv);
                  }
                  break;
                case "export":
                  globalShellVariables[command.others[1]] = command.others[2];
                  break;
                default:
                  throw new cError(
                    "Bash Error :Undefined Internal Command",
                    1,
                    1,
                    null,
                    [command]
                  );
              }
            } catch (e) {
              console.log(e);
              newDiv.textContent = e.messaage;
              shellOutputContainer.appendChild(newDiv);
            } finally {
              shellInput.textContent = "";
            }
          } else {
            try {
              command.envVar = { ...globalShellVariables, ...command.envar };
              exec(command);
              newDiv.innerHTML = getFile(STDOUT).getContent();
            } catch (e) {
              console.log(e);
              if (e.getErrorCategory() === 0) {
                newDiv.innerHTML = e.getMessage();
              } else if (e.getErrorCategory() === 2) {
                newDiv.innerHTML = getFile(STDERR).getContent();
              } else {
                newDiv.innerHTML = "Something went wrong.";
              }
            } finally {
              shellOutputContainer.appendChild(newDiv);
              shellInput.textContent = "";
            }
          }
        });
      } catch (e) {
        console.log(e);
        if (e.getErrorCategory() === 1) {
          newDiv.innerHTML = e.getMessage();
        } else {
          newDiv.innerHTML = "Something went wrong.";
        }
      } finally {
        shellOutputContainer.appendChild(newDiv);
        shellInput.textContent = "";
      }
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

export { shell };
