const { BaseConfig, DefaultConfig } = require("../src/config");
const env = require("../src/env");
const SecretManager = require("../src/secretManager");

jest.mock("../src/env");
jest.mock("../src/secretManager");

describe("BaseConfig", () => {
  let mockEnvVars;

  beforeEach(() => {
    jest.clearAllMocks();

    mockEnvVars = {
      GOOGLE_CLOUD_PROJECT_ID: "test-project",
      NODE_ENV: "test",
      SECRET_CACHE_TTL: "3600",
    };

    env.getEnvWithDefaults.mockReturnValue(mockEnvVars);
  });

  describe("constructor", () => {
    it("should initialize with default values from environment", () => {
      const config = new BaseConfig();

      expect(config.options).toEqual({
        projectId: "test-project",
        environment: "test",
        secretCacheTTL: 3600,
      });
      expect(config.initialized).toBeFalsy();
      expect(config.config).toEqual({});
    });

    it("should override defaults with provided options", () => {
      const options = {
        projectId: "custom-project",
        environment: "production",
        secretCacheTTL: 7200,
      };

      const config = new BaseConfig(options);

      expect(config.options).toEqual(options);
    });
  });

  describe("initialize", () => {
    class TestConfig extends BaseConfig {
      async _loadSecrets() {
        this.config = { test: "value" };
      }
    }

    it("should validate environment variables", async () => {
      const config = new BaseConfig();

      try {
        await config.initialize();
      } catch (error) {
        // Expected to throw since _loadSecrets is not implemented
      }

      expect(env.validate).toHaveBeenCalled();
    });

    it("should throw an error if not _loadSecrets is not implemented", async () => {
      const config = new BaseConfig();

      await expect(config.initialize()).rejects.toThrow(
        "_loadSecrets must be implemented by subclass"
      );
    });

    it("should return existing config if already initialized", async () => {
      const config = new TestConfig();
      await config.initialize();

      const result = await config.initialize();

      expect(result).toEqual({ test: "value" });
      expect(env.validate).toHaveBeenCalledTimes(1);
    });

    it("should throw error if initialization fails", async () => {
      const config = new BaseConfig();
      const testError = new Error("Test error");
      env.validate.mockImplementation(() => {
        throw testError;
      });

      await expect(config.initialize()).rejects.toThrow(
        "Failed to initialize config: Test error"
      );
    });
  });

  describe("get", () => {
    it("should return config if initialized", () => {
      const config = new BaseConfig();
      config.initialized = true;
      config.config = { test: "value" };

      expect(config.get()).toEqual({ test: "value" });
    });

    it("should throw error if not initialized", () => {
      const config = new BaseConfig();

      expect(() => config.get()).toThrow(
        "Config not initialized. Call initialize() first."
      );
    });
  });
});

describe("DefaultConfig", () => {
  let mockSecretManager;

  beforeEach(() => {
    jest.clearAllMocks();

    mockSecretManager = {
      getSecret: jest.fn(),
    };

    SecretManager.mockImplementation(() => mockSecretManager);

    env.getEnvWithDefaults.mockReturnValue({
      GOOGLE_CLOUD_PROJECT_ID: "test-project",
      NODE_ENV: "test",
      SECRET_CACHE_TTL: "3600",
    });

    env.validate.mockImplementation(() => {});
  });

  describe("_loadSecrets", () => {
    it("should load all required secrets", async () => {
      const config = new DefaultConfig();

      mockSecretManager.getSecret
        .mockResolvedValueOnce("mongodb://test-uri")
        .mockResolvedValueOnce("test-jwt-secret");

      await config.initialize();

      expect(mockSecretManager.getSecret).toHaveBeenCalledWith(
        "ATTENDME_test_MONGODB_URI"
      );
      expect(mockSecretManager.getSecret).toHaveBeenCalledWith(
        "ATTENDME_test_JWT_SECRET"
      );

      expect(config.config).toEqual({
        database: {
          uri: "mongodb://test-uri",
        },
        jwt: {
          secret: "test-jwt-secret",
        },
      });
    });
    it("should throw error if secret loading fails", async () => {
      const config = new DefaultConfig();
      const testError = new Error("Failed to load secret");

      mockSecretManager.getSecret.mockRejectedValue(testError);

      await expect(config.initialize()).rejects.toThrow(
        "Failed to initialize config: Failed to load secret"
      );
    });
  });
});
