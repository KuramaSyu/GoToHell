export class UploadError extends Error {
  constructor(message: string) {
    super(message);

    // Set the prototype explicitly to maintain the correct prototype chain
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
