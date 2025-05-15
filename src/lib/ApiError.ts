/**
 * Custom error class for API-related errors.
 * It includes the HTTP status code and any data returned in the error response body.
 */
export class ApiError extends Error {
  status?: number
  data?: any // Parsed error response body from the API

  constructor(message: string, status?: number, data?: any) {
    super(message) // Pass message to the base Error class constructor
    this.name = 'ApiError' // Set the error name (useful for instanceof checks)
    this.status = status
    this.data = data

    // This line is needed to restore the prototype chain in ES5
    // It's generally good practice for custom errors extending built-in ones.
    Object.setPrototypeOf(this, ApiError.prototype)
  }
}
