/**
 * @param {string} message Description of Error
 * @param {Number} ErrorCategory Category of Error, for now -1 means undefined category, 0 means System category, 1 means shell category and 2 means program category
 * @param {Number} ErrorCode Specific Error in that category.
 * @param {Error} cause Error
 *
 * System Category:
 *    0 -> program not found
 *    1 -> Not a file objecct
 *    2 -> Not a directory
 *    3 -> Not a valid path
 *    4  -> File with same name already present
 *    5 -> Not valid name
 *    6 -> Not a valid append value, file system error
 *    7 -> Root Directory cant be deleted
 *
 * Shell Category:
 *    0 -> Invalid Syntax
 *    1 -> Internal Command Not found
 *
 * Program Category:
 */
export class cError extends Error {
  #ErrorCategory = -1;
  #ErrorCode = -1;
  #Extra = null;
  constructor(message, ErrorCategory, ErrorCode, cause = null, Extra = []) {
    super(message, { cause: cause });
    this.#ErrorCategory = ErrorCategory;
    this.#ErrorCode = ErrorCode;
    this.#Extra = Extra;
  }

  getErrorCategory() {
    return this.#ErrorCategory;
  }

  getErrorCode() {
    return this.#ErrorCode;
  }

  getMessage() {
    return this.message;
  }

  getExtra() {
    return this.#Extra;
  }

  getCause() {
    return this.cause;
  }
}
