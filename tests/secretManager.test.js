const { SecretManagerServiceClient } = require("@google-cloud/secret-manager");
const SecretManager = require("../src/secretManager");
jest.mock("@google-cloud/secret-manager");

describe("SecretManager", () => {
  let secretManager;
  const PROJECT_ID = "test-project-id";

  beforeEach(() => {
    jest.clearAllMocks();

    secretManager = new SecretManager({ projectId: PROJECT_ID });
  });

  describe("getSecret", () => {
    it("should fetch and cache a secret", async () => {
      const mockSecret = "test-secret-value";
      const secretName = "TEST_SECRET";

      SecretManagerServiceClient.prototype.accessSecretVersion.mockResolvedValueOnce(
        [
          {
            payload: {
              data: Buffer.from(mockSecret),
            },
          },
        ]
      );

      const result = await secretManager.getSecret(secretName);

      expect(result).toBe(mockSecret);
      expect(
        SecretManagerServiceClient.prototype.accessSecretVersion
      ).toHaveBeenCalledWith({
        name: `projects/${PROJECT_ID}/secrets/${secretName}/versions/latest`,
      });
    });

    it("should return cached value if not expired", async () => {
      const mockSecret = "test-secret-value";
      const secretName = "TEST_SECRET";

      SecretManagerServiceClient.prototype.accessSecretVersion.mockResolvedValueOnce(
        [
          {
            payload: {
              data: Buffer.from(mockSecret),
            },
          },
        ]
      );

      await secretManager.getSecret(secretName);
      const result = await secretManager.getSecret(secretName);

      expect(result).toBe(mockSecret);
      expect(
        SecretManagerServiceClient.prototype.accessSecretVersion
      ).toHaveBeenCalledTimes(1);
    });

    it("should fetch new value if cache is expired", async () => {
      jest.useFakeTimers();
      const mockSecret = "test-secret-value";
      const newMockSecret = "new-secret-value";
      const secretName = "TEST_SECRET";

      SecretManagerServiceClient.prototype.accessSecretVersion
        .mockResolvedValueOnce([
          {
            payload: {
              data: Buffer.from(mockSecret),
            },
          },
        ])
        .mockResolvedValueOnce([
          {
            payload: {
              data: Buffer.from(newMockSecret),
            },
          },
        ]);

      await secretManager.getSecret(secretName);

      // Fast-forward time past cache expiration
      jest.advanceTimersByTime(3600001); // 1 hour + 1ms

      const result = await secretManager.getSecret(secretName);

      expect(result).toBe(newMockSecret);
      expect(
        SecretManagerServiceClient.prototype.accessSecretVersion
      ).toHaveBeenCalledTimes(2);

      jest.useRealTimers();
    });

    it("should throw error if fetch fails and no cache exists", async () => {
      const secretName = "TEST_SECRET";
      const errorMessage = "Failed to fetch";

      SecretManagerServiceClient.prototype.accessSecretVersion.mockRejectedValueOnce(
        new Error(errorMessage)
      );

      await expect(secretManager.getSecret(secretName)).rejects.toThrow(
        errorMessage
      );
    });
  });
});
