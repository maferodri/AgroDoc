module.exports = {
  source: ['src/primitives/**/*.json', 'src/semantic/light.json'],
  platforms: {
    js: {
      transformGroup: 'react-native',
      buildPath: 'build/',
      files: [{ destination: 'light.js', format: 'javascript/esm' }]  // 👈
    }
  }
};