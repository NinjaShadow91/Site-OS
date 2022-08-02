import { getAbsPath, getFile } from "../lib/lib.js";
import { cError } from "../lib/libError.js";
import { exec } from "../lib/lib.js";

export function nano(programBlock) {
  const shellEnv = document.getElementsByClassName("shellMainContainer")[0];
  shellEnv.classList.add("invisible");
  const nanoDiv = document.getElementsByClassName("nano")[0];
  nanoDiv.classList.remove("invisible");

  let file = getFile(getAbsPath(programBlock.others[0], programBlock.wPath));
  if (file === null) {
    let programBlockTouch = programBlock;
    programBlockTouch.program = "touch";
    exec(programBlock);
    file = getFile(getAbsPath(programBlock.others[0], programBlock.wPath));
  }
  console.log(file);
  nanoDiv.textContent = file.getContent();

  nanoDiv.addEventListener("keydown", (e) => {
    if (e.ctrlKey && e.key === "x") {
      // console.log("exiting");
      nanoDiv.classList.add("invisible");
      nanoDiv.textContent = "";
      shellEnv.classList.remove("invisible");
      // change . to o for saving
    } else if (e.ctrlKey && e.key === ".") {
      // console.log("saving");
      console.log(file);
      file.addContent(
        document.getElementsByClassName("nano")[0].textContent,
        false
      );
    }
  });
}
