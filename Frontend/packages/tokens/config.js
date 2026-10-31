/**
 * Documento: configuración de Style Dictionary.
 * Genera build/light.js como tema plano y numérico para React Native.
 */
const StyleDictionary = require('style-dictionary').default;

const NUMERIC = /^-?\d+(\.\d+)?$/;

/**
 * Convierte los valores numéricos de los tokens (que están guardados como
 * strings en JSON) a números, que es lo que espera React Native.
 */
function normalize(value) {
  if (typeof value === 'string' && NUMERIC.test(value)) {
    return Number(value);
  }
  if (Array.isArray(value)) {
    return value.map(normalize);
  }
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, nested]) => [key, normalize(nested)])
    );
  }
  return value;
}

/**
 * Convierte la lista plana de tokens de Style Dictionary en un objeto anidado
 * que los componentes pueden consumir directamente: colors.primary, spacing.sm...
 */
function toTheme(tokens) {
  const theme = {};

  for (const token of tokens) {
    let target = theme;

    token.path.forEach((part, index) => {
      if (index === token.path.length - 1) {
        target[part] = normalize(token.value);
      } else {
        target[part] = target[part] || {};
        target = target[part];
      }
    });
  }

  return theme;
}

StyleDictionary.registerFormat({
  name: 'javascript/theme',
  format: ({ dictionary }) =>
    `/**\n * Do not edit directly, this file was auto-generated.\n */\n\n` +
    `export default ${JSON.stringify(toTheme(dictionary.allTokens), null, 2)};\n`,
});

module.exports = {
  source: ['src/primitives/**/*.json', 'src/semantic/light.json'],
  platforms: {
    js: {
      transformGroup: 'react-native',
      buildPath: 'build/',
      files: [{ destination: 'light.js', format: 'javascript/theme' }],
    },
  },
};
