export class sFile {
  #name;
  #content;
  #contentType;
  #properties = {
    // Can be implemented latter if required
    // Directories requrie execute permission to traverse
    // permissionString: "rw",
    location: "",
    creationTime: null,
    lastModificationTime: null,
    lastAccessTime: null,
    // Can be used to store index storage space used
    size: null,
  };

  constructor(name, location, contentType) {
    if (!(typeof location === "string") || location === "")
      throw new Error("File System Error: Not a valid location.");

    if (name === "root" && location == "/") {
      this.#name = name;
      this.#properties.location = location;
    } else {
      const pDir = pathParser(location);

      if (pDir !== undefined) {
        if (!(typeof name === "string") || name === "")
          throw new Error("File System Error: Not a valid name.");
        const sameName = pDir.getContent().filter((file) => {
          if (file.getName() === name) return true;
          else return false;
        });
        if (sameName.length === 0) {
          this.#name = name;
          pDir.addContent(this, true);
        } else {
          throw new Error(
            "File System Error: File with same name already present."
          );
        }
      } else {
        throw new Error("File System Error: Not a valid location");
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
      throw Error("File System Error: Not a valid append value.");

    if (content instanceof sFile && this.isDirectory()) {
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
      throw new Error("File System Error: Object not a file.");
    }
  }

  delete() {
    // root can be deleted using delete if needed, change const to let in declaration of root dir
    if (this.#name === "root") {
      throw new Error("File System Error: Root can't be deleted.");
    } else {
      const cDir = pathParser(this.#properties.location);
      cDir.deleteContent(this.#name);
      //   delete this;
    }
  }

  // Add code to delete from index storage if implemented
  deleteContent(name) {
    if (this.#contentType !== "DIR")
      throw new Error("File System Error: Object is a file and not directory.");

    if (!(typeof name === "string") || name === "") {
      throw new Error("File System Error: Not a valid name.");
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
      throw new Error("File System Error: Not a valid name.");

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
        throw new Error(
          "File System Error: File with same name already present."
        );
      }
    } else {
      throw new Error("File System Error: Not a valid location");
    }
  }

  copy(location, wDir) {
    const nDir = pathParser(location, wDir);
    if (nDir !== undefined) {
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
        return false;
      }
    } else {
      return false;
    }
  }

  move(location, wDir) {
    this.copy(location, wDir);
    this.delete();
  }

  // getters
  getName() {
    return this.#name;
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

  // getPermissions(){
  //   return this.#properties.permissions;
  // }

  // // Returns empty array in case directory dont have any files
  getFiles() {
    if (this.#contentType !== "DIR")
      throw new Error("File System Error: Object is a file and not directory.");

    return this.#content.filter((file) => {
      return !file.isDirectory();
    });
  }

  // Returns undefined in case file not found
  getFile(name) {
    if (this.#contentType !== "DIR")
      throw new Error("File System Error: Object is a file and not directory.");

    if (!(typeof name === "string") || name === "")
      throw new Error("File System Error: Not a valid name.");

    return this.#content.filter((file) => {
      if (file.name === name && !file.isDirectory()) return true;
      else return false;
    })[0];
  }

  // // Returns empty array in case directory dont have any sub directories
  getSubDirectories() {
    if (this.#contentType !== "DIR")
      throw new Error("File System Error: Object is a file and not directory.");

    return this.#content.filter((file) => {
      return file.isDirectory();
    });
  }

  // Returns undefined in case directory not found
  getSubDirectory(name) {
    if (this.#contentType !== "DIR")
      throw new Error("File System Error: Object is a file and not directory.");

    if (!(typeof name === "string") || name === "")
      throw new Error("File System Error: Not a valid name.");

    return this.#content.filter((file) => {
      if (file.name === name && file.isDirectory()) return true;
      else return false;
    })[0];
  }
}

export const ROOT_DIR = new sFile("root", "/", "DIR");

//
/**
 * pathParser
 * Returns null in case not found else returns file found
 * @param {string} path Path variable description
 * @param {sFile} rDir Root directory
 * @returns null | sFile
 */
export function pathParser(path) {
  if (!(typeof path === "string") || path === "")
    throw new Error("File System Error: Not a valid path.");

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
