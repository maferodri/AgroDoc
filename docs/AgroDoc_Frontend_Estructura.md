# AgroDoc — Estructura del Frontend

Documento de planificación de la arquitectura frontend de AgroDoc.

## 1. Visión general

El proyecto tiene dos salidas frontend:

- **Móvil (React Native):** la versión más completa. Usada por agricultores (acceso completo) y agrónomos (atención de consultas).
- **Web (React):** funciona como panel de control. Usada por administradores (exclusivo de web), agrónomos y agricultores (solo seguimiento, sin cámara ni diagnóstico).

Para reutilizar código se usa **React + React Native** dentro de un **monorepo**, con una clasificación amplia de componentes visuales reutilizables.

## 2. Decisiones técnicas

| Decisión                | Detalle                                                              |
| ----------------------- | -------------------------------------------------------------------- |
| Lenguaje                | **JavaScript** (`.js` / `.jsx`), **no TypeScript**                   |
| Móvil                   | React Native con Expo                                                |
| Web                     | React con Vite                                                       |
| Componentes compartidos | `react-native-web` para que un mismo componente corra en móvil y web |
| Monorepo                | pnpm + Turborepo                                                     |
| Tokens de diseño        | Style Dictionary                                                     |
| Datos y estado          | React Query (datos del servidor) y Zustand (estado global)           |
| Validaciones            | Zod (funciona en JavaScript)                                         |
| Documentación de datos  | JSDoc opcional, en lugar de tipos                                    |

### Correcciones aplicadas

- **Sin TypeScript:** se elimina el archivo `types.ts` de cada feature. Todo el código usa `.js` / `.jsx`. Los esquemas con Zod y JSDoc opcional cubren la validación y la documentación de datos.
- **Administrador sin vista móvil:** el rol administrador solo existe en web.

## 3. Estructura del monorepo

```
agrodoc/
├─ apps/
│  ├─ mobile/            # React Native (Expo): agricultor y agrónomo
│  └─ web/               # React (Vite): administrador, agrónomo y agricultor
├─ packages/
│  ├─ tokens/            # Style Dictionary (colores, tipografía, espaciado)
│  ├─ ui/                # Componentes compartidos
│  ├─ features/          # Lógica por épica
│  ├─ api/               # Cliente HTTP y hooks (React Query)
│  ├─ store/             # Estado global (Zustand): sesión, rol, preferencias
│  └─ utils/             # Validaciones, formateo, constantes
```

## 4. `packages/tokens`

### 4.1 Qué son los tokens

Los tokens son los valores de diseño (colores, tipografía, espaciados, bordes, sombras) guardados como datos en un único lugar, en vez de escritos a mano en cada componente.

**Para qué sirven**

- Una única fuente de verdad: cambiar un color una vez lo actualiza en móvil y web.
- Consistencia con lo definido en Figma.
- Permiten temas (claro/oscuro) sin modificar componentes.

**Tipos**

- **Primitivos:** valores crudos (`green-500: #2E7D32`).
- **Semánticos:** significado (`color.primary`, `color.danger`, `color.premium`), que apuntan a un primitivo.

Los componentes usan **solo tokens semánticos**. Para cambiar de tema o de marca basta cambiar a qué primitivo apuntan.

### 4.2 Estructura

```
packages/tokens/
├─ package.json            # Script: "build": "style-dictionary build"
├─ config.js               # Configuración de Style Dictionary
├─ src/
│  ├─ primitives/
│  │  ├─ color.json        # Paleta cruda (green-500, red-500...)
│  │  ├─ spacing.json
│  │  ├─ typography.json
│  │  ├─ radius.json
│  │  └─ shadow.json
│  └─ semantic/
│     ├─ light.json        # Tokens semánticos del tema claro
│     └─ dark.json         # Tema oscuro (opcional)
├─ build/                  # Generado, no se edita
│  ├─ light.js
│  ├─ dark.js
│  └─ tokens.css           # Variables CSS (opcional, web)
└─ index.js                # Exporta los temas
```

### 4.3 Ejemplos

**Primitivo (`color.json`)**

```json
{
  "color": {
    "green": { "500": { "value": "#2E7D32" } },
    "red":   { "500": { "value": "#D32F2F" } }
  }
}
```

**Semántico (`light.json`)**

```json
{
  "colors": {
    "primary": { "value": "{color.green.500}" },
    "danger":  { "value": "{color.red.500}" }
  }
}
```

**Configuración (`config.js`)**

```js
module.exports = {
  source: ['src/primitives/**/*.json', 'src/semantic/light.json'],
  platforms: {
    js: {
      transformGroup: 'js',
      buildPath: 'build/',
      files: [{ destination: 'light.js', format: 'javascript/es6' }]
    }
  }
};
```

### 4.4 Categorías para AgroDoc

| Categoría | Tokens |
|---|---|
| `colors` | `primary`, `background`, `surface`, `text`, `border`, `success`, `warning`, `danger`, `premium`, `weatherAlert` |
| `spacing` | `xs`, `sm`, `md`, `lg`, `xl` |
| `typography` | `fontFamily`, `fontSize` (`sm` a `xxl`), `fontWeight`, `lineHeight` |
| `radius` | `sm`, `md`, `lg`, `full` |
| `shadow` | `sm`, `md`, `lg` |

### 4.5 Flujo de trabajo

1. Los valores salen de Figma (exportados con un plugin de tokens) o se escriben a mano.
2. `pnpm build` genera la carpeta `build/`.
3. `packages/ui` los consume mediante `ThemeProvider` y `useTheme()`.

### 4.6 Reglas

- Nunca editar `build/`; solo `src/`.
- Los componentes usan solo tokens semánticos.
- Los números van sin unidad (React Native no usa `px`); el formato CSS se genera aparte.

### 4.7 Uso en un componente

```js
// Button.styles.js
const { colors, spacing } = useTheme();

backgroundColor: colors.primary,
padding: spacing.md,
```

## 5. `packages/ui`

### 5.1 Estructura

```
packages/ui/
├─ package.json
├─ index.js                 # Exporta todo
└─ src/
   ├─ theme/
   │  ├─ ThemeProvider.jsx  # Provee tokens a toda la app
   │  ├─ useTheme.js
   │  └─ tokens.js          # Re-exporta packages/tokens
   ├─ atoms/
   │  ├─ Button/
   │  │  ├─ Button.jsx
   │  │  ├─ Button.styles.js
   │  │  └─ index.js
   │  ├─ Input/ Text/ Icon/ Avatar/ Badge/ Switch/ Checkbox/ Divider/
   ├─ molecules/
   │  ├─ FormField/ PasswordInput/ SearchBar/ ConfidenceBar/
   │  ├─ StatCard/ ListItem/ SelectField/ PhotoPicker/
   ├─ organisms/
   │  ├─ CropCard/ DiagnosisCard/ TreatmentList/ PreventionList/
   │  ├─ ConsultItem/ PaymentForm/ PlanComparison/ NotificationItem/
   ├─ templates/
   │  ├─ AuthLayout/ ScreenLayout/ (móvil) ContentLayout/ (web)
   ├─ feedback/
   │  ├─ Modal/ Toast/ ConfirmDialog/ EmptyState/ Loader/ Alert/
   └─ utils/
      ├─ platform.js        # Helpers Platform.OS
      └─ responsive.js
```

### 5.2 Clasificación (Atomic Design)

| Nivel | Descripción | Ejemplos |
|---|---|---|
| **atoms** | Elementos básicos indivisibles | Button, Input, Text, Icon, Avatar, Badge, Switch, Checkbox, Divider |
| **molecules** | Combinación de átomos | FormField, PasswordInput, SearchBar, ConfidenceBar, StatCard, ListItem, SelectField, PhotoPicker |
| **organisms** | Bloques con significado de negocio | CropCard, DiagnosisCard, TreatmentList, PreventionList, ConsultItem, PaymentForm, PlanComparison, NotificationItem |
| **templates** | Estructuras de página | AuthLayout, ScreenLayout (móvil), ContentLayout (web) |
| **feedback** | Respuestas del sistema al usuario | Modal, Toast, ConfirmDialog, EmptyState, Loader, Alert |

### 5.3 Convenciones

- Cada componente en su carpeta: `Componente.jsx`, `Componente.styles.js` (StyleSheet) e `index.js`.
- Variantes por props (`variant`, `size`, `status`), no por componentes duplicados.
- Estilos solo con `StyleSheet` de React Native y valores de `useTheme()`; nada de colores o espacios fijos.
- Código específico de plataforma: `Componente.native.jsx` / `Componente.web.jsx`.
- Los componentes no hacen llamadas a la API ni leen el store: reciben todo por props.

### 5.4 Componentes con variantes clave de AgroDoc

- **Badge:** `healthy`, `warning`, `danger`, `premium` (estado de cultivo, plan, prioridad de tratamiento).
- **ConfidenceBar:** muestra el porcentaje en número entero y cambia de color según el umbral de confianza.
- **Alert:** `info`, `weather`, `critical` (notificaciones críticas).

## 6. `packages/features`

Cada feature es un módulo autocontenido, **sin pantallas** (esas viven en `apps/`).

### 6.1 Estructura interna de un feature

```
features/<nombre>/
├─ api/          # Llamadas al backend (services)
├─ hooks/        # useLogin, useDiagnosis... (React Query)
├─ schemas/      # Validaciones (Zod)
├─ store/        # Estado local del feature (si aplica)
├─ components/   # Componentes propios del feature (usan packages/ui)
└─ index.js      # API pública: lo único que importan las apps
```

### 6.2 Features por épica

```
features/
├─ auth/            # Épica 1: registro, login, recuperar contraseña, 2FA, roles
├─ diagnosis/       # Épica 2: captura/subida de foto, resultado, confianza, clima
├─ recommendations/ # Épica 3: tratamientos, dosis, prevención, consulta
├─ settings/        # Épica 4: perfil, preferencias, seguridad
├─ dashboard/       # Épica 4 y 10: resumen del agricultor y métricas del admin
├─ crops/           # Épica 5: registro, detalle, edición, historial
├─ subscriptions/   # Épica 6: planes, comparativa, upgrade, cancelación
├─ payments/        # Épica 7: métodos de pago, historial, facturas
├─ consultations/   # Épica 9: bandeja, detalle, respuesta, historial
├─ admin/           # Épica 10: gestión de usuarios y reportes
├─ notifications/   # Épica 11: configuración, historial, críticas
└─ consent/         # Épica 8: consentimiento de uso de fotos
```

### 6.3 Reglas

- Un feature solo importa de `ui`, `api`, `store`, `utils` y, si es necesario, de otro feature mediante su `index.js`.
- Lo que cambia por plataforma (cámara en `diagnosis`, gráficos en `admin`) va en `.native.jsx` / `.web.jsx` dentro de `components/`.
- El acceso por rol se centraliza en `auth` (`useRole`, `RoleGuard`).

## 7. `apps/mobile` (Expo + React Native)

### 7.1 Estructura

```
apps/mobile/
├─ app.json
├─ App.jsx                  # Providers: QueryClient, tema, navegación
├─ index.js
└─ src/
   ├─ navigation/
   │  ├─ RootNavigator.jsx       # Decide el flujo según sesión y rol
   │  ├─ AuthNavigator.jsx       # Login, registro, recuperar contraseña
   │  ├─ FarmerNavigator.jsx     # Tabs: Inicio, Cultivos, Cámara, Pagos, Ajustes
   │  ├─ AgronomistNavigator.jsx # Bandeja, detalle, historial
   │  └─ routes.js               # Nombres de rutas centralizados
   ├─ screens/
   │  ├─ auth/                   # LoginScreen, RegisterScreen, RecoverScreen...
   │  ├─ farmer/
   │  │  ├─ home/ crops/ diagnosis/ payments/ settings/
   │  └─ agronomist/             # InboxScreen, ConsultDetailScreen, HistoryScreen
   ├─ providers/                 # AppProviders.jsx
   ├─ hooks/                     # useCamera, usePermissions
   ├─ services/                  # Notificaciones push, cámara, almacenamiento seguro
   ├─ config/                    # env, constantes de la app
   └─ assets/                    # Imágenes, fuentes
```

### 7.2 Navegación por rol

- `RootNavigator` lee la sesión del `store`: sin sesión → `AuthNavigator`; con sesión → navegador según `role`.
- Los administradores no tienen vista móvil (solo web).
- La cámara es una pestaña central del `FarmerNavigator`; el flujo de diagnóstico (captura → previsualización → resultado) es un stack propio.

## 8. `apps/web` (React + Vite)

### 8.1 Estructura

```
apps/web/
├─ index.html
├─ vite.config.js           # Alias de react-native-web y de packages/*
└─ src/
   ├─ main.jsx
   ├─ App.jsx               # Providers: QueryClient, tema, router
   ├─ router/
   │  ├─ AppRouter.jsx      # Rutas públicas y privadas
   │  ├─ ProtectedRoute.jsx # Valida sesión y rol (usa RoleGuard de auth)
   │  └─ routes.js          # Rutas centralizadas
   ├─ layouts/
   │  ├─ AuthLayout.jsx
   │  └─ PanelLayout.jsx    # Sidebar + header (menú según rol)
   ├─ pages/
   │  ├─ auth/              # Login, registro, recuperar contraseña
   │  ├─ admin/
   │  │  ├─ DashboardPage.jsx      # Métricas del sistema
   │  │  ├─ UsersPage.jsx          # Gestión de usuarios y roles
   │  │  └─ SubscriptionsPage.jsx  # Reporte gráfico
   │  ├─ agronomist/        # Bandeja, detalle de consulta, historial
   │  └─ farmer/            # Perfil, historial de diagnósticos, cultivos, suscripción, consultas
   ├─ components/           # Solo piezas exclusivas de web: DataTable, Sidebar, Charts
   ├─ providers/
   ├─ config/
   └─ assets/
```

### 8.2 Rutas por rol

- `/admin/*` → solo administrador (aterriza en el dashboard).
- `/agronomo/*` → agrónomo.
- `/agricultor/*` → agricultor (seguimiento, sin cámara ni diagnóstico).
- `ProtectedRoute` redirige al login o a la ruta propia del rol si no hay permiso.

### 8.3 Particularidades web

- Tablas con filtros y paginación (usuarios, historiales) y gráficos (Recharts) en `components/`, ya que no se comparten con móvil.
- Layout de dos paneles para el agrónomo: lista de consultas a la izquierda, detalle a la derecha.

## 9. Reglas generales

- Las **screens/pages solo ensamblan**: la lógica viene de `features/` y lo visual de `ui/`.
- Los componentes de `ui` son puros: sin llamadas a API ni acceso al store.
- Los estilos salen siempre de tokens semánticos.
- Todo el código es JavaScript (`.js` / `.jsx`).

## 10. Pendiente

- Flujo de datos: `packages/api` y `packages/store`.
- Detalle de componentes de `packages/ui` (props y variantes).
- Definición de valores reales de tokens a partir del Figma del proyecto.
