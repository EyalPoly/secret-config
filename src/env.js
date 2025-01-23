class EnvironmentValidator {
  constructor() {
    this.requiredVars = ["GOOGLE_CLOUD_PROJECT_ID"];
    this.optionalVars = {
      NODE_ENV: "development",
      SECRET_CACHE_TTL: "3600000",
    };
  }

  validate() {
    const missing = this.requiredVars.filter(
      (varName) => !process.env[varName]
    );
    if (missing.length > 0) {
      throw new Error(
        `Missing required environment variables: ${missing.join(", ")}`
      );
    }
  }

  getEnvWithDefaults() {
    return {
      ...this.optionalVars,
      ...Object.fromEntries(
        Object.entries(process.env).filter(
          ([key]) =>
            this.requiredVars.includes(key) ||
            Object.keys(this.optionalVars).includes(key)
        )
      ),
    };
  }
}

module.exports = new EnvironmentValidator();
