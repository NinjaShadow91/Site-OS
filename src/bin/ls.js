import { getAbsPath, getFile } from "../lib/lib.js";

function recurseDir(dir, includeHidden = false) {
  let ret = { [dir.getName()]: dir.getContent() };
  let content = dir.getContent();
  content.forEach((element) => {
    if (includeHidden || element.getName().charAt(0) !== ".") {
      if (element.isDirectory()) {
        ret = { ...ret, ...recurseDir(element) };
      }
    }
  });
  return ret;
}

export function ls(programBlock) {
  let directory = getFile(
    getAbsPath(programBlock.others[0], programBlock.wPath)
  );
  let flags = programBlock.flags;
  let files;
  if (flags.includes("R")) files = recurseDir(directory);
  else files = { [directory.getName()]: directory.getContent() };

  console.log(recurseDir(directory));

  let outputHTML = "";
  for (const dir in files) {
    if (flags.includes("R"))
      outputHTML = outputHTML.concat(`Directory: ${dir}<br>`);
    files[dir].forEach((file) => {
      if (flags.includes("a") || file.getName().charAt(0) !== ".") {
        if (flags.includes("l")) {
          let detailString;
          if (file.isDirectory()) {
            detailString = "d"
              .concat(file.getPermissions())
              .concat("   ")
              .concat(file.getCreationTime());
            // .concat(file.getCreationTime().toDateString());
          } else
            detailString = file
              .getPermissions()
              .concat("   ")
              .concat(file.getCreationTime());
          // .concat(file.getCreationTime().toDateString());
          // console.log(`${detailString} ${file.getName()}\n`);
          if (file.isDirectory()) {
            outputHTML = outputHTML.concat(
              `<pre style="color:blue;margin:0px;padding:0px">${detailString}     ${file.getSize()}      ${file.getName()}</pre>`
            );
          } else {
            outputHTML = outputHTML.concat(
              `<pre>${detailString}     ${file.getSize()}       ${file.getName()}</pre>`
            );
          }
        } else {
          if (file.isDirectory()) {
            outputHTML = outputHTML.concat(
              `<span style="color:blue;">${file.getName()}</span> `
            );
          } else {
            outputHTML = outputHTML.concat(`${file.getName()} `);
          }
        }
      }
    });

    if (flags.includes("R")) outputHTML = outputHTML.concat(`<br>`);
  }
  getFile(getAbsPath(programBlock.out, programBlock.wPath)).addContent(
    outputHTML,
    programBlock.appendOutput
  );
  return true;
}
