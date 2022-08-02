import { pathParser, cFile } from "../sys/fs.js";
import { loader } from "../sys/main.js";

// Allows to get file using the pathParser function implemented in fs.js(filesystem)
export function getFile(path) {
  return pathParser(path);
}

export const File = cFile;

export function exec(programBlock) {
  return loader(programBlock);
}

export function getAbsPath(path, wPath) {
  if (typeof path === "string" && path !== "") {
    if (path.charAt(0) === "/") return path;
    else return wPath.concat(path);
  } else {
    return wPath;
  }
}
