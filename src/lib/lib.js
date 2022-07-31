export function getAbsPath(path, wPath) {
  if (typeof path === "string" && path !== "") {
    if (path.charAt(0) === "/") return path;
    else return wPath.concat(path);
  } else {
    return wPath;
  }
}
