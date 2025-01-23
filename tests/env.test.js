const EnvironmentValidator = require("../src/env");

describe("EnvironmentValidator", () => {
  let originalEnv;

  // Clear all environment variables before running the tests
  beforeAll(() => {
    originalEnv = { ...process.env };
    process.env = {};
  });

  // Reset the environment variables before each test
  beforeEach(() => {
    process.env = {};
  });

  // Restore the original environment variables after all tests
  afterAll(() => {
    process.env = originalEnv;
  });

  describe("validate", () => {
    it("should not throw an error if all required variables are present", () => {
      process.env.GOOGLE_CLOUD_PROJECT_ID = "test-project";

      expect(() => EnvironmentValidator.validate()).not.toThrow();
    });

    it("should throw an error if a required variable is missing", () => {
      // Clear the required environment variable
      delete process.env.GOOGLE_CLOUD_PROJECT_ID;

      expect(() => EnvironmentValidator.validate()).toThrow(
        "Missing required environment variables: GOOGLE_CLOUD_PROJECT_ID"
      );
    });
  });

  describe("getEnvWithDefaults", () => {
    it("should return default values when no environment variables are set", () => {
      // Clear all relevant environment variables
      delete process.env.GOOGLE_CLOUD_PROJECT_ID;
      delete process.env.NODE_ENV;
      delete process.env.SECRET_CACHE_TTL;

      const result = EnvironmentValidator.getEnvWithDefaults();

      expect(result).toEqual({
        NODE_ENV: "development",
        SECRET_CACHE_TTL: "3600000",
      });
    });

    it("should override defaults with existing environment variables", () => {
      // Set some environment variables
      process.env.GOOGLE_CLOUD_PROJECT_ID = "custom-project";
      process.env.NODE_ENV = "production";
      process.env.SECRET_CACHE_TTL = "7200000";

      const result = EnvironmentValidator.getEnvWithDefaults();

      expect(result).toEqual({
        GOOGLE_CLOUD_PROJECT_ID: "custom-project",
        NODE_ENV: "production",
        SECRET_CACHE_TTL: "7200000",
      });
    });

    it("should include only relevant environment variables", () => {
      // Set some environment variables, including an unrelated one
      process.env.GOOGLE_CLOUD_PROJECT_ID = "test-project";
      process.env.NODE_ENV = "staging";
      process.env.SECRET_CACHE_TTL = "7200000";
      process.env.UNRELATED_VAR = "some-value";

      const result = EnvironmentValidator.getEnvWithDefaults();

      expect(result).toEqual({
        GOOGLE_CLOUD_PROJECT_ID: "test-project",
        NODE_ENV: "staging",
        SECRET_CACHE_TTL: "7200000",
      });

      // Ensure the unrelated variable is not included
      expect(result).not.toHaveProperty("UNRELATED_VAR");
    });

    it("should merge defaults with existing variables correctly", () => {
      // Set only some environment variables
      process.env.NODE_ENV = "production";

      const result = EnvironmentValidator.getEnvWithDefaults();

      expect(result).toEqual({
        NODE_ENV: "production",
        SECRET_CACHE_TTL: "3600000",
      });
    });
  });
});
