import js from "@eslint/js";
import stylistic from "@stylistic/eslint-plugin";
import jest from "eslint-plugin-jest";

export default [
  // Base configuration
  js.configs.recommended,
  
  // Stylistic rules
  {
    plugins: {
      "@stylistic": stylistic
    },
    rules: {
      // Consistent spacing and formatting
      "@stylistic/indent": ["error", 2],
      "@stylistic/quotes": ["error", "single"],
      "@stylistic/semi": ["error", "always"],
      "@stylistic/comma-dangle": ["error", "always-multiline"],
      "@stylistic/max-len": ["warn", { 
        code: 100, 
        tabWidth: 2, 
        ignoreUrls: true 
      }],
    }
  },
  
  // Node.js specific rules
  {
    env: {
      node: true,
      es2021: true,
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