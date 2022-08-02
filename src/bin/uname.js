import { getAbsPath, getFile } from "../lib/lib.js";

// Implement it properly by taking input from syscalls or lib alternative
export function uname(programBlock) {
  const out = "SiteOS XXXXX x.x.x-x-amd64 XXXXXX y-y-y-y-y xYY_XX";
  getFile(getAbsPath(programBlock.out, programBlock.wPath)).addContent(
    out,
    false
  );
  return true;
}
