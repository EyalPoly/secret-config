const { SecretManagerServiceClient } = require("@google-cloud/secret-manager");

class SecretManager {
  constructor(options = {}) {
    this.client = new SecretManagerServiceClient();
    this.cache = new Map();
    this.projectId = options.projectId || process.env.GOOGLE_CLOUD_PROJECT_ID;
  }

  async getSecret(secretName, maxAge = 3600000) {
    const cached = this.cache.get(secretName);
    if (cached && Date.now() - cached.timestamp < maxAge) {
      return cached.value;
    }

    const name = `projects/${this.projectId}/secrets/${secretName}/versions/latest`;
    const [version] = await this.client.accessSecretVersion({ name });
    const value = version.payload.data.toString("utf8");

    this.cache.set(secretName, {
      value,
      timestamp: Date.now(),
    });

    return value;
  }
}

module.exports = SecretManager;
