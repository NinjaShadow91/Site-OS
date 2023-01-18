import { getAbsPath, getFile } from "../lib/lib.js";
import { cError } from "../lib/libError.js";
import { exec } from "../lib/lib.js";

export function nano(programBlock) {
  const shellEnv = document.getElementsByClassName("shellMainContainer")[0];
  shellEnv.classList.add("invisible");
  const nanoDiv = document.getElementsByClassName("nano")[0];
  nanoDiv.classList.remove("invisible");

  let file = getFile(getAbsPath(programBlock.others[0], programBlock.wPath));
  if (file.isDirectory()) {
    try {
      getFile(getAbsPath(programBlock.err, programBlock.wPath)).addContent(
        "File is Directory.",
        false
      );
    } catch (e) {
      nanoDiv.classList.add("invisible");
      nanoDiv.textContent = "";
      shellEnv.classList.remove("invisible");
      throw new cError("File is Directory.", 2, 5, null, null);
    }

    nanoDiv.classList.add("invisible");
    nanoDiv.textContent = "";
    shellEnv.classList.remove("invisible");
    throw new cError("File is Directory.", 2, 5, null, null);
  } else if (file === null) {
    let programBlockTouch = programBlock;
    programBlockTouch.program = "touch";
    exec(programBlock);
    file = getFile(getAbsPath(programBlock.others[0], programBlock.wPath));
  }
  nanoDiv.textContent = file.getContent();

  nanoDiv.addEventListener("keydown", (e) => {
    if (e.ctrlKey && e.key === "x") {
      nanoDiv.classList.add("invisible");
      nanoDiv.textContent = "";
      shellEnv.classList.remove("invisible");
      // change . to o for saving
    } else if (e.ctrlKey && e.key === ".") {
      file.addContent(
        document.getElementsByClassName("nano")[0].textContent,
        false
      );
    }
  });
}
