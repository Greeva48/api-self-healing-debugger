function analyzerAgent(errorMessage, statusCode) {
  switch (statusCode) {
    case 404:
      return {
        issue: "Endpoint not found",
        suggestion: "Verify the URL path and ensure the endpoint exists on the server.",
      };
    case 401:
      return {
        issue: "Authentication failed",
        suggestion: "Check that a valid API key or token is included in the request headers.",
      };
    case 500:
      return {
        issue: "Internal server error",
        suggestion: "The server encountered an error. Check server logs or retry later.",
      };
    default:
      return {
        issue: `Unknown error (${statusCode})`,
        suggestion: `Unexpected status code. Error details: ${errorMessage}`,
      };
  }
}

module.exports = analyzerAgent;
