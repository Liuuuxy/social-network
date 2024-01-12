module.exports = {
  testEnvironment: "jsdom",
  setupFiles: ["jest-fetch-mock"],
  setupFilesAfterEnv: ["<rootDir>/src/setupTests.js"],
  testMatch: ["**/src/tests/**/*.test.js"],
  transform: {
    "^.+\\.[t|j]sx?$": "babel-jest",
    "\\.css$": "jest-transform-css",
  },
};
