function fixerAgent(issue, config) {
  let updatedConfig = { ...config };

  // Fix for wrong endpoint (demo logic)
  if (issue && issue.includes("Endpoint")) {
    updatedConfig.url = config.url.replace("wrong", "posts");
  }

  return updatedConfig;
}

module.exports = fixerAgent;