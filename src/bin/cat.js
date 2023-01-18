import { getAbsPath, getFile } from "../lib/lib.js";

export function cat(programBlock) {
  let out = getFile(getAbsPath(programBlock.out, programBlock.wPath));
  let inf;
  if (typeof programBlock.others[0] === "undefined") {
    inf = getFile(getAbsPath(programBlock.in, programBlock.wPath));
    out.addContent(inf.getContent(), false);
  } else {
    let append = false;
    programBlock.others.forEach((element) => {
      inf = getFile(getAbsPath(element, programBlock.wPath));
      out.addContent(`${inf.getContent()}<br>`, append);
      if (!append) append = true;
    });
  }

  return true;
}
