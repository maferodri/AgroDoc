# AGENTS.md — Frontend AgroDoc

Guía operativa para agentes. Leer antes de tocar `Frontend/`.
Al terminar una tarea, actualizar este archivo (ver **Mantenimiento de este archivo**).
Contexto amplio: `../docs/AgroDoc_Frontend_Estructura.md`.
Si trabajas en `apps/mobile`, lee también `apps/mobile/AGENTS.md` (reglas de Expo).

## Reglas no negociables

- **JavaScript** (`.js` / `.jsx`). No TypeScript, no archivos `.ts` / `.tsx`.
- **Componentes UI puros**: sin llamadas a API ni acceso a stores. Todo entra por props.
- **Comentarios en español**: todo documento/archivo, clase, función, método o bloque complejo debe explicar con comentarios qué hace y con qué finalidad.
- **Estilos solo con tokens**: `useTheme()` + `StyleSheet`. Nada de colores/espaciados fijos.
- Usar **tokens semánticos** (`colors.primary`), nunca primitivos (`color.green.500`).
- **No editar** `packages/tokens/build/` (es generado).
- Las apps importan solo la API pública: `@agrodoc/ui`, `@agrodoc/tokens`.
- Cada componente en su carpeta: `Componente.jsx`, `Componente.styles.js`, `index.js`.
- Variantes por props (`variant`, `size`, `status`), no duplicar componentes.
- Código específico de plataforma: `Componente.web.jsx` / `Componente.native.jsx`.
- **Playground como catálogo**: todo componente visual nuevo debe agregarse a `apps/web/src/pages/Playground.jsx` bajo su categoría (`Átomo`, `Molécula`, `Organismo`, `Feedback`). Sin excepción.

## Estructura

```
Frontend/
├─ apps/
│  ├─ web/        React + Vite · Playground en /playground (solo DEV)
│  └─ mobile/     Expo + React Native
├─ packages/
│  ├─ tokens/     Style Dictionary → build/light.js
│  ├─ ui/         átomos/moléculas/organismos + tema
│  ├─ features/   lógica por épica (scaffold)
│  ├─ api/ store/ utils/   (scaffold)
├─ turbo.json
└─ pnpm-workspace.yaml
```

## Flujo tokens → UI → app

```
src/primitives/*.json + src/semantic/light.json
  └─ pnpm --filter @agrodoc/tokens build
       └─ build/light.js  (objeto plano y numérico)
            └─ @agrodoc/tokens exporta { light }
                 └─ <ThemeProvider theme={light}> en la app
                      └─ useTheme() en componentes de @agrodoc/ui
```

- `packages/ui` **no importa tokens**: recibe el tema por contexto.
- Web: Vite aliasa `react-native` → `react-native-web` (`apps/web/vite.config.js`).
- Móvil: Metro resuelve `react-native` nativo. Sin alias.
- Mismo `Button.jsx` sirve para ambas plataformas.

## Comandos

```bash
cd Frontend
pnpm install

# Web (dev)
pnpm --filter @agrodoc/web dev

# Tokens (OBLIGATORIO tras editar JSON de tokens)
pnpm --filter @agrodoc/tokens build

# Build producción web
pnpm --filter @agrodoc/web build

# Móvil (Expo)
pnpm --filter @agrodoc/mobile start
```

- Para dependencias de Expo usar `npx expo install` dentro de `apps/mobile`.
- Tras agregar dependencias workspace, ejecutar `pnpm install`.
- No existe `pnpm build` en la raíz; usar filtros o `pnpm turbo build`.

## Dónde tocar según la tarea

| Tarea | Ruta |
|---|---|
| Nuevo token | `packages/tokens/src/{primitives,semantic}/` + build |
| Nuevo átomo | `packages/ui/src/atoms/X/` + exportar en `packages/ui/index.js` |
| Probar visualmente | `apps/web/src/pages/Playground.jsx` (catálogo por niveles) |
| Nueva página web | `apps/web/src/pages/` + ruta en `apps/web/src/router/AppRouter.jsx` |
| Tema / contexto | `packages/ui/src/theme/` |
| Pantalla móvil | `apps/mobile/` (seguir `apps/mobile/AGENTS.md`) |

## Estado actual

| Área | Estado | Nota |
|---|---|---|
| Tokens | ✅ | build exporta valores planos y números |
| Tema | ✅ | `ThemeProvider` + `useTheme` |
| UI átomos | 🟡 | `Button`, `Input`, `Icon`, `Avatar`, `Text`, `Checkbox`, `DynamicBar`, `Divider` |
| UI assets | ✅ | logotipo AgroDoc (`AGRODOC_LOGO`) con SVG en web y PNG en móvil |
| UI moléculas | 🟡 | `FormField`, `PasswordInput`, `CheckboxInput`, `StepIndicator`, `OrDivider` |
| Playground web | ✅ | catálogo por niveles con cabeceras grandes |
| App web | 🟡 | rutas base + Playground |
| App móvil | ⏳ | template Expo, sin tema ni Button |
| features/api/store/utils | ⏳ | scaffolds vacíos |

## Mantenimiento de este archivo

Todo agente debe actualizarlo al terminar una tarea que cambie el proyecto:

1. **Bitácora**: agregar una línea al inicio (más reciente primero) con `YYYY-MM-DD · área: cambio`. No borrar ni reescribir entradas anteriores.
2. **Estado actual**: actualizar solo si cambió el estado real de un área (✅ / 🟡 / ⏳).
3. **Pendientes**: quitar lo completado y agregar lo nuevo.
4. **Reglas / estructura / comandos / trampas**: modificar solo si el cambio afecta cómo se trabaja.
5. **Playground**: si creaste o modificaste un componente visual, actualizarlo en `apps/web/src/pages/Playground.jsx` bajo su categoría.

Reglas de escritura:

- Máximo ~5 líneas nuevas por tarea; una sola línea por hito.
- No incluir crónicas, diffs, código ni historial de conversaciones.
- Si el archivo supera ~150 líneas, consolidar secciones en vez de seguir agregando.
- Si el código y este archivo difieren, **corregir este archivo** antes de finalizar.

## Bitácora ligera

- `2026-10-31` · **Divider/OrDivider/Text**: átomo `Divider`, molécula `OrDivider` y `Text` con `fontFamily` de tokens más fallback sans en web.
- `2026-10-28` · **DynamicBar**: radio circular fijo para todas las barras; se elimina la prop `radius` y se agrega el token `radius.dynamicBar`.
- `2026-10-28` · **DynamicBar/StepIndicator**: barra con relleno paramétrico (0-100) y molécula de pasos con barras al 0/100%; tokens `colors.track` y `size.dynamicBar`; ejemplos en Playground.
- `2026-10-28` · **Assets**: logotipo AgroDoc en `packages/ui/src/assets` (SVG y PNG de respaldo); `@agrodoc/ui` exporta `AGRODOC_LOGO` y el Playground lo muestra en 48/72/120 px.
- `2026-10-27` · **Checkbox**: átomo con marcado, disabled y tamaño paramétrico; molécula `CheckboxInput` con fila completa presionable. `Text` gana variante `link` con `onPress`; tokens `size.checkbox`, `typography.link` e icono `check`.
- `2026-10-27` · **Moléculas**: `FormField` (etiqueta, Input, error/ayuda y borde `danger`) y `PasswordInput` (ojo local para alternar visibilidad, HU1.2). `Input` gana `trailing` y `status`; Playground con cabeceras grandes por nivel.
- `2026-10-27` · **Text**: átomo con variantes `title/subtitle/body/caption/label`, colores semánticos, alineación y `numberOfLines`. Tokens `colors.success` y `lineHeight` por variante; `Input` deja de exponer la variante de contraseña.
- `2026-10-27` · **Avatar**: átomo con imagen paramétrica, tamaños `sm/md/lg/xl` o px, variantes `plain/ring`, badge de cámara y fallback con iniciales o icono. Tokens `size.avatar*` e icono `person`.
- `2026-10-27` · **Docs**: regla de comentarios en español y encabezados de documento en los archivos fuente; sin cambios de código.
- `2026-10-26` · **Web**: `react-native-svg` apunta a su entry web; Vite 8 requiere declarar `.web.js` en `optimizeDeps.rolldownOptions.resolve.extensions`.
- `2026-10-26` · **Icon**: átomo `Icon` con 23 iconos SVG (paths de Bootstrap Icons) vía `react-native-svg`; props `name`, `size`, `color` y `active`. `Button` acepta `icon` y `Input` acepta un `Icon` como `symbol`.
- `2026-10-26` · **Input**: átomo `Input` con `placeholder` y `symbol` parametrizables, foco y estado deshabilitado. Tokens nuevos: `colors.text`, `colors.surface`, `colors.border`; `radius.input` pasa a forma pill.
- `2026-10-26` · **Playground**: reorganizado como catálogo por nivel (`Átomo`) y fondo basado en `colors.surface`.
- `2026-10-26` · **Tokens**: build corregido; genera tema plano (`colors.primary`, `spacing.buttonY`, etc.) y convierte strings numéricos a números. `buttonX/Y` movidos de `radius` a `spacing`.
- `2026-10-26` · **UI**: `Button` operativo en web con `primary`, `secondary`, `danger`, `ghost`, `disabled`, `loading` y `fullWidth`. Spinner toma color del tema.
- `2026-10-26` · **Web**: build de producción OK; alias `react-native` → `react-native-web`; dependencias de `@agrodoc/ui` resueltas.
- `2026-10-20` · **Base**: monorepo pnpm + Turborepo, estructura de paquetes y primer `Button`.

## Pendientes

- Conectar móvil: `ThemeProvider` + `@agrodoc/tokens` (falta declararlo en `apps/mobile/package.json`).
- Crear átomos restantes: `Badge`, `Switch`, `Divider`.
- Crear moléculas restantes de formularios y navegación.
- Añadir script `watch` de tokens para desarrollo.
- Limpiar CSS del template Vite (hoy fuerza modo oscuro y no coincide con el tema claro).

## Trampas conocidas

- **Botones sin estilos** → `build/light.js` desactualizado o tokens exportados como objetos. Ejecutar build de tokens.
- `useTheme()` lanza error si el componente no está dentro de `<ThemeProvider>`.
- No importar rutas internas (`@agrodoc/ui/src/...`); usar `@agrodoc/ui`.
- No usar `react-native-web` directamente en componentes compartidos.
- Los iconos se referencian por `name`; usar `ICON_NAMES` para validar nombres disponibles y no importar SVG sueltos.
- El átomo `Text` choca con el `Text` de `react-native`; importarlo como alias (p. ej. `Text as UIText`).
- **Iconos no cargan en dev** → Vite 8 no aplica `resolve.extensions` al optimizer; revisar `optimizeDeps.rolldownOptions.resolve.extensions` y el alias de `react-native-svg` en `apps/web/vite.config.js`.
- El Playground no existe en producción (`import.meta.env.DEV`).
- `packages/ui/src/theme/tokens.js` existe pero **no** está exportado en `index.js`; no asumir que está disponible.
- `Text` resuelve su `fontFamily` con `fontFamily.web.js`; en web agrega fallback sans porque Inter no se carga por defecto.
