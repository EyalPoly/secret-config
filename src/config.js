const env = require("./env");
const SecretManager = require("./secretManager");

class SecretConfig {
  #initialized = false;
  #secrets = {};

  constructor(options = {}) {
    this.config = {};

    // Combine environment variables with provided options
    const envVars = env.getEnvWithDefaults();
    this.options = {
      projectId: options.projectId || envVars.GOOGLE_CLOUD_PROJECT_ID,
      environment: options.environment || envVars.NODE_ENV,
      secretCacheTTL: parseInt(
        options.secretCacheTTL || envVars.SECRET_CACHE_TTL
      ),
    };

    this.secretManager = new SecretManager({
      projectId: this.options.projectId,
    });
  }

  async initialize() {
    if (this.#initialized) return this.config;

    try {
      env.validate();
      await this._loadSecrets();
      this.#initialized = true;
      return this.config;
    } catch (error) {
      throw new Error(`Failed to initialize config: ${error.message}`);
    }
  }

  get() {
    if (!this.#initialized) {
      throw new Error("Config not initialized. Call initialize() first.");
    }
    return this.config;
  }

  async addSecret(key, secretNamePostfix) {
    if (this.#initialized) {
      throw new Error("Cannot add secrets after initialization");
    }
    const { environment } = this.options;

    this.#secrets[key] = `ATTENDME_${environment}_` + secretNamePostfix;
    return this;
  }

  async _loadSecrets() {
    for (const [key, secretName] of Object.entries(this.#secrets)) {
      this.config[key] = await this.secretManager.getSecret(secretName);
    }
  }
}

module.exports = SecretConfig;
