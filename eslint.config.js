import js from "@eslint/js";
import jest from "eslint-plugin-jest";
import globals from "globals";

export default [
  // Base configuration
  js.configs.recommended,
  
  // Node.js specific configuration
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.es2022
      },
      sourceType: 'module'
    },
    rules: {
      // Node.js best practices
      "no-console": "warn",
      "no-unused-vars": ["error", { 
        argsIgnorePattern: "^_",
        varsIgnorePattern: "^_"
      }],
    }
  },
  
  // Jest testing rules
  {
    files: ['**/*.test.js', '**/*.spec.js'],
    ...jest.configs['flat/recommended'],
    languageOptions: {
      globals: {
        ...globals.jest
      }
    },
    rules: {
      ...jest.configs['flat/recommended'].rules,
      "jest/prefer-expect-assertions": "off"
    }
  },
  
  // Ignore patterns
  {
    ignores: [
      "node_modules/",
      "dist/",
      "coverage/",
      ".github/",
    ]
  }
];