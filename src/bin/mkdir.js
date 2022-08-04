import { getAbsPath, getFile, File } from "../lib/lib.js";
import { cError } from "../lib/libError.js";

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

export function mkdir(programBlock) {
  try {
    if (programBlock.flags.includes("p")) {
      // To implement
    } else {
      new File(getAbsPath(programBlock.others[0], programBlock.wPath), "DIR");
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
