import { getAbsPath, getFile, File } from "../lib/lib.js";
import { cError } from "../lib/libError.js";

export function touch(programBlock) {
  try {
    if (programBlock.others[0].includes("/")) {
      new File(
        programBlock.others[0].slice(
          programBlock.others[0].lastIndexOf("/") + 1,
          programBlock.others[0].length
        ),
        getAbsPath(
          programBlock.others[0].slice(
            0,
            programBlock.others[0].lastIndexOf("/")
          ),
          programBlock.wPath
        ),
        "text"
      );
    } else {
      new File(
        programBlock.others[0],
        getAbsPath("", programBlock.wPath),
        "text"
      );
    }
    return true;
  } catch (e) {
    console.log(e);
    getFile(getAbsPath(programBlock.err, programBlock.wPath)).addContent(
      e.getMessage(),
      false
    );
    throw new cError(e.getMessage(), 2, 0, e, null);
  }
}
