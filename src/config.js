const env = require("./env");
const SecretManager = require("./secretManager");

class BaseConfig {
  #initialized = false;
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
    if (this.initialized) return this.config;

    try {
      env.validate();
      await this._loadSecrets();
      this.initialized = true;
      return this.config;
    } catch (error) {
      throw new Error(`Failed to initialize config: ${error.message}`);
    }
  }

  get() {
    if (!this.initialized) {
      throw new Error("Config not initialized. Call initialize() first.");
    }
    return this.config;
  }

  async _loadSecrets() {
    throw new Error("_loadSecrets must be implemented by subclass");
  }
}

class DefaultConfig extends BaseConfig {
  async _loadSecrets() {
    const { environment } = this.options;

    this.config = {
      database: {
        uri: await this.secretManager.getSecret(
          `ATTENDME_${environment}_MONGODB_URI`
        ),
      },
      jwt: {
        secret: await this.secretManager.getSecret(
          `ATTENDME_${environment}_JWT_SECRET`
        ),
      },
    };
  }
}

module.exports = { BaseConfig, DefaultConfig };
