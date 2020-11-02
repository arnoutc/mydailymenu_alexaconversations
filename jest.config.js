
// jest.config.js
// Sync object
module.exports = {
    rootDir: '.',
    roots: ['<rootDir>', './test/unit'],
    verbose: true,
    testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.[jt]sx?$',
  };
  
  // Or async function
  module.exports = async () => {
    return {
      rootDir: '.',
      roots: ['<rootDir>', './test/unit'],
      verbose: true,
      testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.[jt]sx?$',
    };
  };