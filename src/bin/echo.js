import { getAbsPath, getFile } from "../lib/lib.js";

export function echo(programBlock) {
  let out = getFile(getAbsPath(programBlock.out, programBlock.wPath));
  //   console.log(out);
  let append = false;
  programBlock.others.forEach((element) => {
    out.addContent(`${element}&nbsp`, append);
    if (!append) append = true;
  });
  return true;
}
