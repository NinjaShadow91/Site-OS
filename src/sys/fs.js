import { cError } from "../lib/libError.js";

export class cFile {
  #name;
  #content;
  #contentType;
  #properties = {
    // Can be implemented latter if required
    // Directories requrie execute permission to traverse
    permissionString: "rwx",
    location: "",
    creationTime: null,
    lastModificationTime: null,
    lastAccessTime: null,
    // Can be used to store index storage space used
    size: "123",
  };

  #throwNotValidLocation(path) {
    throw new cError("File System Error: Not a valid location.", 0, 3, null, [
      path,
    ]);
  }

  #throwNotValidName(name) {
    throw new cError("File System Error: Not a valid name.", 0, 5, null, [
      name,
    ]);
  }

  #throwNotDirectory(file) {
    throw new Error("File System Error: Not a directory.", 0, 2, null, [file]);
  }

  #throwSameNameFileAlreadyPresent(name) {
    throw new cError(
      "File System Error: Same name file already  present.",
      0,
      4,
      null,
      [name]
    );
  }

  #throwNotFileObject(file) {
    throw new cError(
      "File System Error: File is not a file object.",
      0,
      1,
      null,
      [file]
    );
  }

  constructor(name, location, contentType) {
    if (!(typeof location === "string") || location === "")
      this.#throwNotValidLocation(location);

    if (name === "root" && location == "/") {
      this.#name = name;
      this.#properties.location = location;
    } else {
      const pDir = pathParser(location);

      if (pDir !== undefined) {
        if (!(typeof name === "string") || name === "")
          this.#throwNotValidName(name);
        const sameName = pDir.getContent().filter((file) => {
          if (file.getName() === name) return true;
          else return false;
        });
        if (sameName.length === 0) {
          this.#name = name;
          pDir.addContent(this, true);
        } else {
          this.#throwSameNameFileAlreadyPresent(name);
        }
      } else {
        this.#throwNotValidLocation(location);
      }

      this.#properties.location = location;
    }
    this.#contentType = contentType;
    this.#properties.creationTime = new Date();
    this.#properties.lastModificationTime = this.#properties.creationTime;
    if (contentType === "DIR") this.#content = [];
    else this.#content = "";
  }

  // setters
  addContent(content, append) {
    if (!(typeof append === "boolean"))
      throw Error("File System Error: Not a valid append value.", 0, 6, null, [
        append,
      ]);

    if (content instanceof cFile && this.isDirectory()) {
      if (append) {
        let fileAlreadyPresent = false;

        // convert into normal  for each loop for optimization
        this.#content.forEach((file) => {
          if (
            file.getName() === content.getName() &&
            file.getDirectoryStatus() === content.getDirectoryStatus()
          ) {
            fileAlreadyPresent = true;
            return;
          }
        });

        if (!fileAlreadyPresent) {
          this.#content.push(content);
          return 0;
        } else {
          return 1;
        }
      } else {
        this.#content.splice(0, this.#content.length);
        this.#content.push(content);
      }
    } else if (typeof content === "string" && !this.isDirectory()) {
      if (append) {
        this.#content = this.#content.concat(content);
      } else {
        this.#content = content;
      }
    } else {
      this.#throwNotFileObject(this);
    }
  }

  delete() {
    // root can be deleted using delete if needed, change const to let in declaration of root dir
    if (this.#name === "root") {
      throw new cError(
        "File System Error: Root can't be deleted.",
        0,
        7,
        null,
        []
      );
    } else {
      const cDir = pathParser(this.#properties.location);
      cDir.deleteContent(this.#name);
      //   delete this;
    }
  }

  // Add code to delete from index storage if implemented
  deleteContent(name) {
    if (this.#contentType !== "DIR") this.#throwNotDirectory(this);

    if (!(typeof name === "string") || name === "") {
      this.#throwNotValidName(name);
    }

    this.#content = this.#content.filter((file) => {
      if (file.getName() === name) return false;
      else return true;
    });
  }

  /*
   * Copy, move and rename need not be implemented in filesystem but this is a simple program so we implemented these here only.
   */

  rename(newName) {
    if (!(typeof newName === "string") || newName === "")
      this.#throwNotValidName(newName);

    const pDir = pathParser(this.#properties.location);

    if (pDir !== undefined) {
      const sameName = pDir.getContent().filter((file) => {
        if (file.getName() === newName) return true;
        else return false;
      });
      if (sameName.length === 0) {
        this.#name = newName;
        this.#properties.lastModificationTime = new Date();
        return true;
      } else {
        this.#throwSameNameFileAlreadyPresent(newName);
      }
    } else {
      this.#throwNotValidLocation(this.#properties.location);
    }
  }

  copy(location) {
    const nDir = pathParser(location);
    if (nDir !== none) {
      const cDir = pathParser(this.#properties.location);

      const sameName = nDir.getContent().filter((file) => {
        if (file.getName() === this.#name) return true;
        else return false;
      });
      if (sameName.length === 0) {
        this.#properties.location = location;
        nDir.addContent(this, true);
        this.#properties.lastModificationTime = new Date();
        return true;
      } else {
        this.#throwSameNameFileAlreadyPresent(this.#name);
      }
    } else {
      this.#throwNotValidLocation(location);
    }
  }

  move(location) {
    this.copy(location);
    this.delete();
  }

  // getters
  getName() {
    return this.#name;
  }

  getSize() {
    return this.#properties.size;
  }

  getDetails() {
    return {
      name: this.#name,
      contentType: this.#contentType,
      location: this.#properties.location,
      size: this.#properties.size,
      lastAccessTime: this.#properties.lastAccessTime,
      lastModificationTime: this.#properties.lastModificationTime,
      creationTime: this.#properties.creationTime,
    };
  }

  getContent() {
    this.#properties.lastAccessTime = new Date();
    return this.#content;
  }

  getLocation() {
    return this.#properties.location;
  }

  isDirectory() {
    return this.#contentType === "DIR" ? true : false;
  }

  getParent() {
    let rArr = this.#properties.location.split("/");
    return rArr[rArr.length - 2];
  }

  getPermissions() {
    return this.#properties.permissionString;
  }

  getCreationTime() {
    return this.#properties.creationTime;
  }

  // // Returns empty array in case directory dont have any files
  getFiles() {
    if (this.#contentType !== "DIR") this.#throwNotDirectory(this);

    return this.#content.filter((file) => {
      return !file.isDirectory();
    });
  }

  // Returns undefined in case file not found
  getFile(name) {
    if (this.#contentType !== "DIR") this.#throwNotDirectory(this);

    if (!(typeof name === "string") || name === "")
      this.#throwNotValidName(name);

    return this.#content.filter((file) => {
      if (file.name === name && !file.isDirectory()) return true;
      else return false;
    })[0];
  }

  // // Returns empty array in case directory dont have any sub directories
  getSubDirectories() {
    if (this.#contentType !== "DIR") this.#throwNotDirectory(this);

    return this.#content.filter((file) => {
      return file.isDirectory();
    });
  }

  // Returns undefined in case directory not found
  getSubDirectory(name) {
    if (this.#contentType !== "DIR") this.#throwNotDirectory(this);

    if (!(typeof name === "string") || name === "")
      this.#throwNotValidName(name);

    return this.#content.filter((file) => {
      if (file.name === name && file.isDirectory()) return true;
      else return false;
    })[0];
  }
}

export const ROOT_DIR = new cFile("root", "/", "DIR");

//
/**
 * pathParser
 * Returns null in case not found else returns file found
 * @param {string} path Path to search or parse
 * @returns null | cFile
 */
export function pathParser(path) {
  if (!(typeof path === "string") || path === "")
    throw new cError("File System Error: Not a valid path.", 0, 3, null, [
      path,
    ]);

  let pDir = ROOT_DIR;

  let subDirs = [];
  path.split("/").forEach((i) => {
    if (i !== "") subDirs.push(i);
  });

  // console.log(subDirs);

  for (let i = 0; i < subDirs.length; ++i) {
    let isPresent = false;
    if (!(pDir.getName() === subDirs[i])) {
      for (let j = 0; j < pDir.getContent().length; ++j) {
        if (pDir.getContent()[j].getName() === subDirs[i]) {
          pDir = pDir.getContent()[j];
          if (!pDir.isDirectory() && i !== subDirs.length - 1) return null;
          // console.log("for", i, pDir);
          isPresent = true;
          break;
        }
      }
      if (!isPresent) {
        // console.log("ret", pDir);
        return null;
      }
    }
  }
  return pDir;
}
