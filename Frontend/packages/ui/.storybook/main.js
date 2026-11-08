/**
 * Documento: configuración de Storybook para @agrodoc/ui.
 * Reutiliza React Native Web y los alias de Vite que usa la app web.
 */
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const reactNativeSvgWeb = path.join(
    path.dirname(require.resolve('react-native-svg/package.json')),
    'lib/module/ReactNativeSVG.web.js'
);

export default {
    stories: ['../src/**/*.stories.@(js|jsx)'],
    framework: {
        name: '@storybook/react-vite',
        options: {},
    },
    docs: {
        autodocs: 'tag',
    },
    async viteFinal(config) {
        config.resolve = config.resolve || {};
        config.resolve.alias = [
            { find: /^react-native-svg$/, replacement: reactNativeSvgWeb },
            { find: /^react-native$/, replacement: 'react-native-web' },
        ];
        config.resolve.extensions = [
            '.web.jsx',
            '.web.js',
            '.jsx',
            '.js',
            '.json',
        ];

        return config;
    },
};
