/**
 * Documento: stub web del módulo nativo de sonido de `react-native-svg`.
 *
 * `SvgTouchableMixin` hace `require('../fabric/NativeSvgSoundModule')` dentro de
 * una rama `Platform.OS === 'android'`. Rolldown lo resuelve igual al bundlear
 * para web, pero `react-native-web` no exporta `TurboModuleRegistry`. En web
 * esa rama nunca se ejecuta, así que basta con un no-op.
 */
export default {
  playTouchSound() {},
};
