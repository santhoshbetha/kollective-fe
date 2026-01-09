export class HTTPError extends Error {
  constructor(response, request) {
    super(response.statusText);
    this.response = response;
    this.request = request;
  }
}