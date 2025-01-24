# secret-config

A flexible and secure configuration management library for Node.js applications, designed to simplify environment variable handling and secret management in Google Secrets Manager

## Features

- 🔒 Secure environment variable validation
- 🔑 Secret management with flexible configuration
- 🌍 Environment-aware configuration loading
- 📦 Easy integration with Google Cloud

## Installation

```bash
npm install @eyal-poly/secret-config
```

## Quick Start

```javascript
const SecretConfig = require("./secretConfig");

async function initializeApp() {
  try {
    const config = new SecretConfig();

    config
      .addSecret("databaseUri", "DATABASE_URI")
      .addSecret("apiKey", "API_KEY");

    await config.initialize();

    const configuration = config.get();
    console.log(configuration.databaseUri);
  } catch (error) {
    console.error("Configuration initialization failed", error);
  }
}
```

## Configuration Options

### Environment Variables

The library supports the following environment variables:

| Variable                  | Description                          | Default            |
| ------------------------- | ------------------------------------ | ------------------ |
| `GOOGLE_CLOUD_PROJECT_ID` | **Required** Google Cloud Project ID | None               |
| `NODE_ENV`                | Application environment              | `development`      |
| `SECRET_CACHE_TTL`        | Secret caching time-to-live          | `3600000` (1 hour) |

### Custom Initialization

You can customize the configuration during initialization:

```javascript
const config = new SecretConfig({
  projectId: "custom-project-id",
  environment: "staging",
  secretCacheTTL: 7200000, // 2 hours
});
```

## Methods

- addSecret(key, secretNamePostfix): Add a secret to be loaded
- initialize(): Load secrets and prepare configuration
- get(): Retrieve the loaded configuration

## Error Handling

The library provides clear error messages for:

- Missing required environment variables
- Secret loading failures
- Uninitialized configuration access

## Security

- Validates required environment variables
- Supports secret caching
- Designed for secure secret management

## Compatible Environments

- Node.js 18.x and above
- Google Cloud
- Various cloud and on-premises environments

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

[Your License - e.g., MIT]

## Support

For issues, please file a GitHub issue in the repository.
