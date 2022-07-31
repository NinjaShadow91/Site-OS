import { getAbsPath } from "../lib/lib.js";
import { pathParser } from "../sys/fs.js";

export function ls(command) {
  let directory = pathParser(getAbsPath(command.others[0], command.wPath));
  let flags = command.flags;
  // let workingDirectory = command.workingDirectory
  let files = { [directory.getName()]: directory.getFiles() };
  let subDirectories = directory.getSubDirectories();
  // cons
  subDirectories.forEach((subDir) => {
    files[subDir.getParent()].push(subDir);
    if (flags.includes("R")) files[subDir.getName()] = subDir.getFiles();
  });

  let outputHTML = "";
  if (flags.includes("a")) {
    for (const dir in files) {
      // console.log(`${dir}`);
      outputHTML = outputHTML.concat(`<b>Directory: ${dir}</b><br>`);
      files[dir].forEach((file) => {
        // console.log(`${dir}\n\n`);
        if (flags.includes("l")) {
          let detailString;
          //   if (file.isDirectory()) {
          //     detailString = "d".concat(file.getPermissions());
          //   } else detailString = file.getPermissions();
          // console.log(`${detailString} ${file.getName()}\n`);
          outputHTML = outputHTML.concat(`${file.getName()}<br>`);
        }
      });
    }
    // console.log(outputHTML);
    // console.log(pathParser(command.out));
    pathParser(getAbsPath(command.out, command.wPath)).addContent(
      outputHTML,
      command.appendOutput
    );
    return true;
  } else {
    console.log("Not implemented");
  }
}
