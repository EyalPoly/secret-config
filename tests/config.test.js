const SecretConfig = require("../src/config");
const env = require("../src/env");
const SecretManager = require("../src/secretManager");

jest.mock("../src/env");
jest.mock("../src/secretManager");

describe("SecretConfig", () => {
  let mockEnvVars;

  beforeEach(() => {
    jest.clearAllMocks();

    mockEnvVars = {
      GOOGLE_CLOUD_PROJECT_ID: "test-project",
      NODE_ENV: "test",
      SECRET_CACHE_TTL: "3600",
    };

    env.getEnvWithDefaults.mockReturnValue(mockEnvVars);
    env.validate.mockImplementation(() => {});
  });

  describe("constructor", () => {
    it("should initialize with default values from environment", () => {
      const secretConfig = new SecretConfig();

      expect(secretConfig.options).toEqual({
        projectId: "test-project",
        environment: "test",
        secretCacheTTL: 3600,
      });
      expect(secretConfig.initialized).toBeFalsy();
      expect(secretConfig.config).toEqual({});
    });

    it("should override defaults with provided options", () => {
      const options = {
        projectId: "custom-project",
        environment: "production",
        secretCacheTTL: 7200,
      };

      const secretConfig = new SecretConfig(options);

      expect(secretConfig.options).toEqual(options);
    });
  });

  describe("initialize", () => {
    it("should validate environment variables", async () => {
      const secretConfig = new SecretConfig();

      try {
        await secretConfig.initialize();
      } catch {
        // Expected to throw since _loadSecrets is not implemented
      }

      expect(env.validate).toHaveBeenCalled();
    });

    it("should return existing config if already initialized", async () => {
      const secretConfig = new SecretConfig();
      await secretConfig.initialize();

      const result = await secretConfig.initialize();

      expect(result).toEqual(secretConfig.config);
      expect(env.validate).toHaveBeenCalledTimes(1);
    });

    it("should throw error if initialization fails", async () => {
      const secretConfig = new SecretConfig();
      const testError = new Error("Test error");
      env.validate.mockImplementation(() => {
        throw testError;
      });

      await expect(secretConfig.initialize()).rejects.toThrow(
        "Failed to initialize config: Test error"
      );
    });
  });

  describe("get", () => {
    it("should return config if initialized", async () => {
      const config = new SecretConfig();
      await config.initialize();

      expect(config.get()).toEqual({});
    });

    it("should throw error if not initialized", () => {
      const config = new SecretConfig();

      expect(() => config.get()).toThrow(
        "Config not initialized. Call initialize() first."
      );
    });
  });

  describe("_loadSecrets", () => {
    let mockSecretManager = {
      getSecret: jest.fn(),
    };
    SecretManager.mockImplementation(() => mockSecretManager);

    const mongoUri = "mongodb://test-uri";
    const mongoNamePostfix = "MONGODB_URI";
    const jwtSecret = "test-jwt-secret";
    const jwtNamePostfix = "JWT_SECRET";

    it("should load all required secrets", async () => {
      const secretConfig = new SecretConfig();
      secretConfig.addSecret("databaseUri", mongoNamePostfix);
      secretConfig.addSecret("jwtSecret", jwtNamePostfix);

      mockSecretManager.getSecret
        .mockResolvedValueOnce(mongoUri)
        .mockResolvedValueOnce(jwtSecret);

      await secretConfig.initialize();

      expect(mockSecretManager.getSecret).toHaveBeenCalledWith(
        "ATTENDME_test_MONGODB_URI"
      );
      expect(mockSecretManager.getSecret).toHaveBeenCalledWith(
        "ATTENDME_test_JWT_SECRET"
      );

      expect(secretConfig.config).toEqual({
        databaseUri: mongoUri,
        jwtSecret: jwtSecret,
      });
    });

    it("should throw error if secret loading fails", async () => {
      const secretConfig = new SecretConfig();
      secretConfig.addSecret("database.uri", mongoNamePostfix);

      const testError = new Error("Failed to load secret");
      mockSecretManager.getSecret.mockRejectedValue(testError);

      await expect(secretConfig.initialize()).rejects.toThrow(
        "Failed to initialize config: Failed to load secret"
      );
    });
  });
});
