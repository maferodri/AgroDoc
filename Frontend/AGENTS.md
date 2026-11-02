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
| Nueva página web | `apps/web/src/pages/<área>/` + ruta en `apps/web/src/router/AppRouter.jsx` |
| Nueva pantalla móvil | `apps/mobile/src/screens/<área>/` |
| Lógica de una épica | `packages/features/<épica>/` (hooks, esquemas, servicios) |

## Estado actual

| Área | Estado | Nota |
|---|---|---|
| Tokens | ✅ | build exporta valores planos y números |
| Tema | ✅ | `ThemeProvider` + `useTheme` |
| UI atoms | 🟡 | `Button`, `Input`, `Icon`, `Avatar`, `Text`, `Checkbox`, `DynamicBar`, `Divider` |
| UI assets | ✅ | logotipo (`AGRODOC_LOGO`) y fondos de auth (`LOGIN_BACKGROUND`) |
| UI moléculas | 🟡 | `FormField`, `PasswordInput`, `CheckboxInput`, `StepIndicator`, `OrDivider` |
| UI organismos | 🟡 | `LoginForm` con variantes `mobile`/`web`; falta el resto de organismos |
| Playground web | ✅ | catálogo por niveles con cabeceras grandes |
| App web | 🟡 | rutas base, login en `/login` y Playground |
| App móvil | 🟡 | login con tema y React Query; falta navegación |
| Feature auth | 🟡 | esquemas, servicios, hooks (incl. `useLoginForm`), store y `RoleGuard`; falta registro y recuperación |
| api / store / utils | 🟡 | `@agrodoc/api` tiene cliente HTTP; store y utils siguen vacíos |

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
- Crear pantallas de registro y recuperación de contraseña, con sus rutas.
- Crear átomos restantes: `Badge`, `Switch`.
- Crear moléculas restantes de formularios y navegación.
- Añadir script `watch` de tokens para desarrollo.
- Eliminar `apps/web/src/App.css` (resto del template Vite, ya sin uso).

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
