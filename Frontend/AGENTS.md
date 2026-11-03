# AGENTS.md — Frontend AgroDoc

Guía operativa para agentes. Leer antes de tocar `Frontend/`.
Al terminar una tarea, actualizar este archivo (ver **Mantenimiento de este archivo**).
Contexto amplio: `../docs/AgroDoc_Frontend_Estructura.md`.
Si trabajas en `apps/mobile`, lee también `apps/mobile/AGENTS.md` (reglas de Expo).

## Contexto obligatorio con graphify

**Toda tarea empieza consultando el grafo de conocimiento**, no leyendo el código a ciegas.
El grafo vive en `graphify-out/` y sus reglas en `.agents/rules/graphify.md`
(`trigger: always_on`); el flujo está en `.agents/workflows/graphify.md`.

Antes de explorar o modificar archivos:

1. `graphify query "<pregunta>"` para ubicar código y arquitectura (o `query_graph` por MCP).
2. `graphify path "<A>" "<B>"` para relaciones y `graphify explain "<concepto>"` para un nodo.
3. Si existe `graphify-out/wiki/index.md`, navegar la wiki antes que leer archivos crudos.
4. Usar `graphify-out/GRAPH_REPORT.md` solo para revisión de arquitectura amplia o cuando
   query/path/explain no alcancen.

Si `graphify-out/graph.json` no existe, generarlo con `graphify .` antes de continuar.
Tras modificar código, ejecutar `graphify update .` (solo AST, sin costo de API) para mantener
el grafo al día. El grafo es la fuente de contexto; este archivo solo resume reglas y estado.

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
- **Estilo de código — skill `ponytail`**: actuar como dev senior perezoso; el cambio más pequeño que resuelve la tarea completa (incluyendo callers y tests), sin abstracciones, opciones ni features no pedidas. Cerrar cada respuesta con lo omitido y el riesgo relevante.

## Estructura

```
Frontend/
├─ apps/
│  ├─ web/        React + Vite · Playground en /playground (solo DEV)
│  └─ mobile/     Expo + React Native
├─ packages/
│  ├─ tokens/     Style Dictionary → build/light.js
│  ├─ ui/         átomos/moléculas/organismos + tema + Storybook
│  ├─ features/   lógica por épica (auth, diagnóstico, suscripciones, admin)
│  ├─ api/        cliente HTTP + handlers MSW compartidos
│  ├─ utils/      utilidades puras (confianza)
│  └─ store/      scaffold de estado global
├─ turbo.json
└─ pnpm-workspace.yaml
```

## Pruebas

| Capa | Herramienta | Ubicación |
|---|---|---|
| Unitarias | Vitest | `packages/utils`, `packages/features/*/schemas`, `apps/web` |
| Componentes web | Vitest + RTL | `packages/ui`, `apps/web` |
| Componentes móvil | Jest + jest-expo + RNTL | `apps/mobile` |
| API simulada | MSW | `packages/api/src/mocks` (`@agrodoc/api/mocks`) |
| E2E web | Playwright | `apps/web/e2e` |
| E2E móvil | Maestro | `apps/mobile/.maestro` |
| Visual | Storybook | `packages/ui/.storybook` + `*.stories.jsx` |

- Los handlers MSW cubren login por rol, registro, diagnóstico alto/medio/bajo, consultas, pagos, suscripción y administración.
- Playwright intercepta `**/api/v1/**` con `apps/web/e2e/fixtures.js`; no requiere backend.
- En Vitest, `react-native` se aliasa a `react-native-web` y `react-native-svg` a su build web.
- Si una prueba de UI falla por versiones de React, revisar que `react` y `react-dom` estén fijados a `19.2.3` en ui/features/web (misma versión que Expo).

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

# Pruebas automatizadas
pnpm lint                     # ESLint raíz (apps + paquetes + pruebas)
pnpm test                     # Vitest/Jest vía Turborepo
pnpm --filter web test:e2e    # Playwright (levanta Vite)
pnpm --filter mobile test     # Jest + jest-expo
pnpm --filter ui storybook    # catálogo visual en :6006
maestro test apps/mobile/.maestro

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
- `pnpm test` solo ejecuta paquetes con script `test`; la tarea está en `turbo.json` y usa caché.

## Dónde tocar según la tarea

| Tarea | Ruta |
|---|---|
| Nuevo token | `packages/tokens/src/{primitives,semantic}/` + build |
| Nuevo átomo | `packages/ui/src/atoms/X/` + exportar en `packages/ui/index.js` |
| Probar visualmente | `apps/web/src/pages/Playground.jsx` (catálogo por niveles) |
| Nueva página web | `apps/web/src/pages/<área>/` + ruta en `apps/web/src/router/AppRouter.jsx` |
| Nueva pantalla móvil | `apps/mobile/src/screens/<área>/` |
| Lógica de una épica | `packages/features/<épica>/` (hooks, esquemas, servicios) |

## Estado actual

| Área | Estado | Nota |
|---|---|---|
| Tokens | ✅ | build exporta valores planos y números |
| Tema | ✅ | `ThemeProvider` + `useTheme` |
| UI atoms | 🟡 | `Button`, `Input`, `Icon`, `Avatar`, `Text`, `Checkbox`, `DynamicBar`, `Divider`, `Badge`; falta `Switch` |
| UI assets | ✅ | logotipo (`AGRODOC_LOGO`) y fondos de auth (`LOGIN_BACKGROUND`, `REGISTER_BACKGROUND`) |
| UI moléculas | ✅ | `FormField`, `PasswordInput`, `CheckboxInput`, `StepIndicator`, `OrDivider`, `ConfidenceBar` |
| UI organismos | 🟡 | `LoginForm`, `RegisterForm`, `Alert`, `ConfirmDialog`; faltan header/navegación |
| Playground web | ✅ | catálogo por niveles con Badge, ConfidenceBar, Alert y ConfirmDialog |
| App web | ✅ | login, registro, guard por rol, panel admin (activar/desactivar) y bandeja del agrónomo |
| App móvil | ✅ | login, registro, bloqueo admin y flujo agricultor foto → preview → diagnóstico |
| Feature auth | ✅ | esquemas, servicios, hooks (401/409), store, `RoleGuard`, recuperación y `LogoutButton` |
| Feature diagnóstico | ✅ | análisis con MSW, confianza alta/media/baja, consulta con agrónomo |
| Feature suscripciones | ✅ | plan básico sin muro de pago y registro de pagos |
| Feature admin | ✅ | lista de usuarios y cambio de estado |
| api / store / utils | 🟡 | `@agrodoc/api` con cliente y MSW; `utils` con confianza; `store` sigue como scaffold |
| Pruebas | ✅ | `pnpm lint`, `pnpm test`, Playwright y Storybook funcionan |

## Mantenimiento de este archivo

Todo agente debe actualizarlo al terminar una tarea que cambie el proyecto:

1. **Estado actual**: actualizar solo si cambió el estado real de un área (✅ / 🟡 / ⏳).
2. **Pendientes**: quitar lo completado y agregar lo nuevo.
3. **Reglas / estructura / comandos / trampas**: modificar solo si el cambio afecta cómo se trabaja.
4. **Playground**: si creaste o modificaste un componente visual, actualizarlo en `apps/web/src/pages/Playground.jsx` bajo su categoría.
5. **Grafo**: ejecutar `graphify update .` para reflejar los cambios de código.

Reglas de escritura:

- Sin bitácora ni historial de cambios: este archivo describe el presente, no el pasado.
- No incluir crónicas, diffs, código ni historial de conversaciones.
- Si el archivo supera ~150 líneas, consolidar secciones en vez de seguir agregando.
- Si el código y este archivo difieren, **corregir este archivo** antes de finalizar.

## Pendientes

- Configurar `setApiBaseUrl` de `@agrodoc/api` al arrancar en web y móvil.
- Persistir la sesión móvil con almacenamiento seguro (hoy queda en memoria).
- Crear pantalla y ruta web de recuperación de contraseña (el hook ya existe).
- Implementar cámara real en móvil (hoy el flujo usa una foto local de ejemplo).
- Crear átomo `Switch` y moléculas restantes de navegación.
- Añadir script `watch` de tokens para desarrollo.
- Eliminar `apps/web/src/App.css` (resto del template Vite, ya sin uso).
- Ejecutar el flujo Maestro contra un backend/emulador real en CI.

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
- Los hooks de `@agrodoc/features` (React Query) fallan sin `QueryClientProvider`; la app debe montarlo antes del router.

<!-- BEGIN:turborepo-agent-rules -->

# This is NOT the Turborepo you know

Turborepo configuration, task behavior, and CLI commands can vary between installed versions and may differ from your training data. Resolve the `turbo` package from this file's directory or relevant workspace; in monorepos, it may not be visible from the repository root. For example, run `node -p "require.resolve('turbo/package.json')"` from a workspace that depends on `turbo`.

Read `docs/README.md` inside that installed package first, then read the relevant pages from its `docs/` directory before changing Turborepo configuration or commands. Heed deprecation notices. These bundled docs match the installed package version and are available without network access.

This block is written and re-added by `turbo` before repository-scoped commands when an AI agent is detected. In the Turborepo source repository, its template is defined in `crates/turborepo-cli/src/cli/agent_guidance.rs`. Removing the managed block while updates are enabled means a later qualifying invocation will add it again. Set `"agentGuidance": false` in the root `turbo.json` or `turbo.jsonc` to opt out; this does not remove an existing block. Keep the block committed with your work to avoid an uncommitted change on the next agent invocation.
<!-- END:turborepo-agent-rules -->
