/**
 * Documento: Playground de componentes (solo desarrollo).
 * Catálogo por niveles (átomos, moléculas, organismos y feedback) para
 * revisar y probar los componentes de @agrodoc/ui.
 */
import { useState } from 'react';
import { Image, Pressable, View } from 'react-native';
import {
    AGRODOC_LOGO,
    Avatar,
    Button,
    Checkbox,
    CheckboxInput,
    Divider,
    DynamicBar,
    FormField,
    Icon,
    ICON_NAMES,
    Input,
    OrDivider,
    PasswordInput,
    StepIndicator,
    Text,
    useTheme,
} from '@agrodoc/ui';

/** Cabecera grande que separa cada nivel de composición. */
const LevelSection = ({ title, description, children }) => {
    const theme = useTheme();
    const titleSize = theme.typography.fontSize.xxxl;

    return (
        <View style={{ marginBottom: theme.spacing.xxl }}>
            <View
                style={{
                    backgroundColor: theme.colors.primary,
                    borderRadius: theme.radius.card,
                    paddingVertical: theme.spacing.md,
                    paddingHorizontal: theme.spacing.md,
                    marginBottom: theme.spacing.lg,
                }}
            >
                <Text
                    variant="title"
                    color="textOnPrimary"
                    style={{
                        fontSize: titleSize,
                        lineHeight: Math.round(
                            titleSize * theme.typography.lineHeight.tight
                        ),
                    }}
                >
                    {title}
                </Text>
                <Text variant="caption" color="textOnPrimary">
                    {description}
                </Text>
            </View>

            <View style={{ gap: theme.spacing.lg }}>
                {children}
            </View>
        </View>
    );
};

/** Bloque de un componente concreto dentro de su nivel. */
const CatalogItem = ({ name, children }) => {
    const theme = useTheme();

    return (
        <View style={{ gap: theme.spacing.sm }}>
            <Text variant="subtitle">{name}</Text>
            <View style={{ gap: theme.spacing.sm }}>
                {children}
            </View>
        </View>
    );
};

/** Etiqueta auxiliar para separar ejemplos dentro de un componente. */
const SubTitle = ({ children }) => (
    <Text variant="label" color="notselected">
        {children}
    </Text>
);

/** Mensaje para niveles que todavía no tienen componentes. */
const ComingSoon = ({ children }) => {
    const theme = useTheme();

    return (
        <View
            style={{
                padding: theme.spacing.md,
                borderRadius: theme.radius.card,
                backgroundColor: theme.colors.background,
            }}
        >
            <Text variant="body" color="notselected">
                Próximamente: {children}
            </Text>
        </View>
    );
};

/** Ejemplo de uso del logotipo exportado desde `@agrodoc/ui`. */
const LogoDemo = () => {
    const theme = useTheme();

    return (
        <>
            <SubTitle>Tamaños</SubTitle>
            <View
                style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: theme.spacing.lg,
                }}
            >
                {[48, 72, 120].map((size) => (
                    <View
                        key={size}
                        style={{
                            alignItems: 'center',
                            gap: theme.spacing.xs,
                        }}
                    >
                        <Image
                            source={AGRODOC_LOGO}
                            style={{ width: size, height: size }}
                            resizeMode="contain"
                            accessibilityLabel="Logotipo de AgroDoc"
                        />
                        <Text variant="caption" color="notselected">
                            {size} px
                        </Text>
                    </View>
                ))}
            </View>
        </>
    );
};

const IconGallery = () => {
    const theme = useTheme();

    return (
        <View
            style={{
                flexDirection: 'row',
                flexWrap: 'wrap',
                gap: theme.spacing.sm,
            }}
        >
            {ICON_NAMES.map((name) => (
                <View
                    key={name}
                    style={{
                        width: 76,
                        alignItems: 'center',
                        gap: theme.spacing.xs,
                    }}
                >
                    <Icon name={name} color={theme.colors.primary} />
                    <Text variant="caption" color="notselected" align="center">
                        {name}
                    </Text>
                </View>
            ))}
        </View>
    );
};

const TabBarDemo = () => {
    const theme = useTheme();
    const [selected, setSelected] = useState('home');

    const tabs = [
        { name: 'home', label: 'Inicio' },
        { name: 'leaf', label: 'Cultivos' },
        { name: 'bell', label: 'Alertas' },
        { name: 'settings', label: 'Ajustes' },
    ];

    return (
        <View
            style={{
                flexDirection: 'row',
                paddingVertical: theme.spacing.sm,
                paddingHorizontal: theme.spacing.md,
                borderRadius: theme.radius.card,
                backgroundColor: theme.colors.background,
            }}
        >
            {tabs.map((tab) => {
                const active = selected === tab.name;

                return (
                    <Pressable
                        key={tab.name}
                        onPress={() => setSelected(tab.name)}
                        style={{
                            flex: 1,
                            alignItems: 'center',
                            gap: theme.spacing.xs,
                        }}
                    >
                        <Icon name={tab.name} active={active} />
                        <Text
                            variant="caption"
                            color={active ? 'primary' : 'notselected'}
                            style={
                                active && {
                                    fontWeight: theme.typography.button.fontWeight,
                                }
                            }
                        >
                            {tab.label}
                        </Text>
                    </Pressable>
                );
            })}
        </View>
    );
};

const AvatarDemo = () => {
    const theme = useTheme();
    const image = '/avatar-demo.svg';

    return (
        <>
            <SubTitle>Tamaños por preset</SubTitle>
            <View
                style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: theme.spacing.md,
                }}
            >
                {['sm', 'md', 'lg', 'xl'].map((size) => (
                    <Avatar key={size} source={image} size={size} />
                ))}
            </View>

            <SubTitle>Tamaño paramétrico</SubTitle>
            <View
                style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: theme.spacing.md,
                }}
            >
                <Avatar source={image} size={32} />
                <Avatar source={image} size={64} />
                <Avatar source={image} size={96} />
            </View>

            <SubTitle>Variantes</SubTitle>
            <View
                style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: theme.spacing.md,
                }}
            >
                <Avatar source={image} size="lg" variant="plain" />
                <Avatar source={image} size="lg" variant="ring" />
            </View>

            <SubTitle>Sin imagen (fallback)</SubTitle>
            <View
                style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: theme.spacing.md,
                }}
            >
                <Avatar name="Ana Gómez" size="lg" />
                <Avatar size="lg" />
                <Avatar
                    size="lg"
                    fallback={
                        <Icon
                            name="leaf"
                            size={theme.typography.fontSize.xxl}
                            color={theme.colors.primary}
                        />
                    }
                />
            </View>

            <SubTitle>Edición de foto</SubTitle>
            <View
                style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: theme.spacing.lg,
                }}
            >
                <Avatar
                    source={image}
                    size="xl"
                    badge
                    onBadgePress={() => alert('Cambiar foto')}
                />
                <Avatar source={image} size="lg" variant="ring" badge />
                <Avatar name="Ana Gómez" size="lg" variant="ring" badge />
            </View>
        </>
    );
};

const TextDemo = () => {
    const theme = useTheme();

    return (
        <>
            <SubTitle>Variantes</SubTitle>
            <Text variant="title">Título de sección</Text>
            <Text variant="subtitle">Subtítulo de tarjeta</Text>
            <Text variant="body">
                Texto de cuerpo para descripciones, instrucciones y contenido
                principal de una pantalla.
            </Text>
            <Text variant="caption">Texto auxiliar o metadata</Text>
            <Text variant="label">Etiqueta</Text>

            <SubTitle>Colores semánticos</SubTitle>
            <View
                style={{
                    flexDirection: 'row',
                    flexWrap: 'wrap',
                    gap: theme.spacing.md,
                }}
            >
                <Text color="text">text</Text>
                <Text color="primary">primary</Text>
                <Text color="danger">danger</Text>
                <Text color="success">success</Text>
                <Text color="warning">warning</Text>
            </View>

            <SubTitle>Alineación</SubTitle>
            <View style={{ alignSelf: 'stretch', gap: theme.spacing.xs }}>
                <Text align="left">Izquierda</Text>
                <Text align="center">Centro</Text>
                <Text align="right">Derecha</Text>
            </View>

            <SubTitle>Recorte con numberOfLines</SubTitle>
            <View
                style={{
                    maxWidth: 280,
                    padding: theme.spacing.sm,
                    borderRadius: theme.radius.card,
                    backgroundColor: theme.colors.background,
                }}
            >
                <Text numberOfLines={2}>
                    Monitoreo de humedad del lote norte con alertas automáticas
                    para detectar estrés hídrico durante la temporada de siembra.
                </Text>
            </View>

            <SubTitle>Enlace</SubTitle>
            <Text variant="link" onPress={() => alert('Abrir enlace')}>
                Iniciar Sesión
            </Text>
            <Text variant="body">
                ¿No tienes cuenta?{' '}
                <Text variant="link" onPress={() => alert('Registrarse')}>
                    Regístrate
                </Text>
            </Text>
        </>
    );
};

const CheckboxDemo = () => {
    const theme = useTheme();
    const [checked, setChecked] = useState(true);

    return (
        <>
            <SubTitle>Estados</SubTitle>
            <View
                style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: theme.spacing.lg,
                }}
            >
                <View
                    style={{
                        alignItems: 'center',
                        gap: theme.spacing.xs,
                    }}
                >
                    <Checkbox />
                    <Text variant="caption" color="notselected">
                        unchecked
                    </Text>
                </View>
                <View
                    style={{
                        alignItems: 'center',
                        gap: theme.spacing.xs,
                    }}
                >
                    <Checkbox checked />
                    <Text variant="caption" color="notselected">
                        checked
                    </Text>
                </View>
                <View
                    style={{
                        alignItems: 'center',
                        gap: theme.spacing.xs,
                    }}
                >
                    <Checkbox checked disabled />
                    <Text variant="caption" color="notselected">
                        disabled
                    </Text>
                </View>
            </View>

            <SubTitle>Tamaño paramétrico</SubTitle>
            <View
                style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: theme.spacing.md,
                }}
            >
                {[16, 24, 32, 40].map((size) => (
                    <Checkbox key={size} checked size={size} />
                ))}
            </View>

            <SubTitle>Interactivo</SubTitle>
            <View
                style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: theme.spacing.sm,
                }}
            >
                <Checkbox
                    checked={checked}
                    onPress={() => setChecked((current) => !current)}
                />
                <Text variant="body" color="notselected">
                    {checked ? 'Marcado' : 'Sin marcar'}
                </Text>
            </View>
        </>
    );
};

/** Ejemplo del átomo Divider suelto y dentro de una fila. */
const DividerDemo = () => {
    const theme = useTheme();

    return (
        <>
            <SubTitle>Suelto</SubTitle>
            <Divider />

            <SubTitle>Dentro de una fila</SubTitle>
            <View
                style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: theme.spacing.sm,
                }}
            >
                <Text variant="caption" color="notselected">
                    Izquierda
                </Text>
                <Divider style={{ flex: 1 }} />
                <Text variant="caption" color="notselected">
                    Derecha
                </Text>
            </View>
        </>
    );
};

/** Ejemplo del átomo DynamicBar como barra de progreso y de cantidad. */
const DynamicBarDemo = () => {
    const theme = useTheme();

    return (
        <>
            <SubTitle>Porcentaje ocupado</SubTitle>
            <View style={{ gap: theme.spacing.sm }}>
                {[0, 25, 50, 75, 100].map((value) => (
                    <View key={value} style={{ gap: theme.spacing.xs }}>
                        <DynamicBar
                            value={value}
                            accessibilityLabel={`Progreso ${value}%`}
                        />
                        <Text variant="caption" color="notselected">
                            {value}%
                        </Text>
                    </View>
                ))}
            </View>

            <SubTitle>Altura</SubTitle>
            <View style={{ gap: theme.spacing.sm }}>
                <DynamicBar value={60} height={4} />
                <DynamicBar value={60} height={8} />
                <DynamicBar value={60} height={16} />
                <DynamicBar value={75} color="secondary" />
            </View>
        </>
    );
};

const FormFieldDemo = () => {
    const [email, setEmail] = useState('');
    const [lotName, setLotName] = useState('');

    return (
        <>
            <SubTitle>Con etiqueta, obligatorio y ayuda</SubTitle>
            <FormField
                label="Correo Electrónico"
                placeholder="nombre@ejemplo.com"
                value={email}
                onChangeText={setEmail}
                helperText="Usaremos este correo para las notificaciones."
                required
            />

            <SubTitle>Con error (mensaje del esquema Zod)</SubTitle>
            <FormField
                label="Nombre del lote"
                placeholder="Ej. Lote Norte 05"
                value={lotName}
                onChangeText={setLotName}
                error="El nombre del lote es obligatorio"
                required
            />

            <SubTitle>Sin etiqueta y deshabilitado</SubTitle>
            <FormField placeholder="Solo placeholder" />
            <FormField label="Variedad" value="Maíz amarillo" disabled />
        </>
    );
};

const PasswordInputDemo = () => {
    const [password, setPassword] = useState('');
    const [confirmation, setConfirmation] = useState('secreto123');

    return (
        <>
            <SubTitle>Login</SubTitle>
            <PasswordInput
                label="Contraseña"
                placeholder="Ingresa tu contraseña"
                value={password}
                onChangeText={setPassword}
                required
            />

            <SubTitle>Ayuda y error</SubTitle>
            <PasswordInput
                label="Nueva contraseña"
                placeholder="Mínimo 8 caracteres"
                helperText="Usa al menos 8 caracteres."
                required
            />
            <PasswordInput
                label="Confirmación"
                placeholder="Repite la contraseña"
                value={confirmation}
                onChangeText={setConfirmation}
                error="Las contraseñas no coinciden"
                required
            />
        </>
    );
};

const CheckboxInputDemo = () => {
    const [accepted, setAccepted] = useState(false);

    return (
        <>
            <SubTitle>Interactivo</SubTitle>
            <CheckboxInput
                checked={accepted}
                onChange={setAccepted}
                label="Acepto que mis fotos se usen para mejorar el modelo (opcional)"
            />

            <SubTitle>Deshabilitado</SubTitle>
            <CheckboxInput
                checked
                disabled
                label="Esta opción está bloqueada"
            />
        </>
    );
};

/** Ejemplo de la molécula OrDivider para separar métodos de acceso. */
const OrDividerDemo = () => (
    <>
        <SubTitle>Etiqueta por defecto</SubTitle>
        <OrDivider />

        <SubTitle>Etiqueta personalizada</SubTitle>
        <OrDivider label="o continúa con" />
    </>
);

/** Ejemplo de la molécula StepIndicator con barras al 0% o al 100%. */
const StepIndicatorDemo = () => {
    const theme = useTheme();
    const [completed, setCompleted] = useState(2);

    return (
        <>
            <SubTitle>Pasos completados</SubTitle>
            <View style={{ gap: theme.spacing.md }}>
                {[0, 2, 5].map((step) => (
                    <View key={step} style={{ gap: theme.spacing.xs }}>
                        <Text variant="caption" color="notselected">
                            {step} de 5
                        </Text>
                        <StepIndicator steps={5} completed={step} />
                    </View>
                ))}
            </View>

            <SubTitle>Interactivo</SubTitle>
            <View style={{ gap: theme.spacing.sm }}>
                <StepIndicator steps={4} completed={completed} />
                <Button
                    title={completed >= 4 ? 'Reiniciar' : 'Avanzar paso'}
                    variant="secondary"
                    onPress={() =>
                        setCompleted((current) =>
                            current >= 4 ? 0 : current + 1
                        )
                    }
                />
            </View>
        </>
    );
};

export default function Playground() {
    const theme = useTheme();

    return (
        <View
            style={{
                minHeight: '100vh',
                alignItems: 'center',
                backgroundColor: theme.colors.surface,
                padding: theme.spacing.screenPadding,
            }}
        >
            <View style={{ width: '100%', maxWidth: 480 }}>
                <Text
                    variant="title"
                    style={{ marginBottom: theme.spacing.xs }}
                >
                    Catálogo de componentes
                </Text>
                <Text
                    variant="body"
                    color="notselected"
                    style={{ marginBottom: theme.spacing.xxl }}
                >
                    Explora los átomos, moléculas y organismos disponibles en
                    @agrodoc/ui.
                </Text>

                <LevelSection
                    title="Átomos"
                    description="Piezas indivisibles: botones, campos, texto, avatares e iconos."
                >
                    <CatalogItem name="Button">
                        <Button title="Primary" onPress={() => alert('ok')} />
                        <Button title="Secondary" variant="secondary" />
                        <Button title="Danger" variant="danger" />
                        <Button title="Ghost" variant="ghost" />
                        <Button title="Disabled" disabled />
                        <Button title="Loading" loading />
                        <Button title="Full width" fullWidth />
                        <Button
                            title="Agregar"
                            icon={
                                <Icon
                                    name="plus"
                                    size={theme.typography.button.fontSize}
                                    color={theme.colors.textOnPrimary}
                                />
                            }
                        />
                    </CatalogItem>

                    <CatalogItem name="Input">
                        <Input placeholder="nombre@ejemplo.com" />
                        <Input placeholder="nombre@ejemplo.com" symbol="✉" />
                        <Input
                            placeholder="Buscar cultivo"
                            symbol={
                                <Icon
                                    name="leaf"
                                    size={theme.typography.body.fontSize}
                                    color={theme.colors.notselected}
                                />
                            }
                            trailing={
                                <Icon
                                    name="camera"
                                    size={theme.typography.body.fontSize}
                                    color={theme.colors.notselected}
                                />
                            }
                        />
                        <Input placeholder="Con error" status="error" />
                        <Input placeholder="Deshabilitado" disabled />
                    </CatalogItem>

                    <CatalogItem name="Text">
                        <TextDemo />
                    </CatalogItem>

                    <CatalogItem name="Checkbox">
                        <CheckboxDemo />
                    </CatalogItem>

                    <CatalogItem name="Divider">
                        <DividerDemo />
                    </CatalogItem>

                    <CatalogItem name="DynamicBar">
                        <DynamicBarDemo />
                    </CatalogItem>

                    <CatalogItem name="Avatar">
                        <AvatarDemo />
                    </CatalogItem>

                    <CatalogItem name="Logo AgroDoc">
                        <LogoDemo />
                    </CatalogItem>

                    <CatalogItem name="Icon">
                        <SubTitle>Todos los iconos</SubTitle>
                        <IconGallery />

                        <SubTitle>Estados</SubTitle>
                        <View
                            style={{
                                flexDirection: 'row',
                                gap: theme.spacing.lg,
                            }}
                        >
                            <View
                                style={{
                                    alignItems: 'center',
                                    gap: theme.spacing.xs,
                                }}
                            >
                                <Icon name="home" active />
                                <Text variant="caption" color="notselected">
                                    active
                                </Text>
                            </View>
                            <View
                                style={{
                                    alignItems: 'center',
                                    gap: theme.spacing.xs,
                                }}
                            >
                                <Icon name="home" active={false} />
                                <Text variant="caption" color="notselected">
                                    inactive
                                </Text>
                            </View>
                            <View
                                style={{
                                    alignItems: 'center',
                                    gap: theme.spacing.xs,
                                }}
                            >
                                <Icon name="home" color={theme.colors.danger} />
                                <Text variant="caption" color="notselected">
                                    color
                                </Text>
                            </View>
                        </View>

                        <SubTitle>Composición</SubTitle>
                        <Button
                            title="Agregar"
                            icon={
                                <Icon
                                    name="plus"
                                    size={theme.typography.button.fontSize}
                                    color={theme.colors.textOnPrimary}
                                />
                            }
                        />

                        <SubTitle>Barra de tareas</SubTitle>
                        <TabBarDemo />
                    </CatalogItem>
                </LevelSection>

                <LevelSection
                    title="Moléculas"
                    description="Composición de átomos con una función concreta, como los campos de formulario."
                >
                    <CatalogItem name="FormField">
                        <FormFieldDemo />
                    </CatalogItem>

                    <CatalogItem name="PasswordInput">
                        <PasswordInputDemo />
                    </CatalogItem>

                    <CatalogItem name="CheckboxInput">
                        <CheckboxInputDemo />
                    </CatalogItem>

                    <CatalogItem name="OrDivider">
                        <OrDividerDemo />
                    </CatalogItem>

                    <CatalogItem name="StepIndicator">
                        <StepIndicatorDemo />
                    </CatalogItem>
                </LevelSection>

                <LevelSection
                    title="Organismos"
                    description="Secciones completas formadas por átomos y moléculas."
                >
                    <ComingSoon>
                        card de cultivo, header y navegación.
                    </ComingSoon>
                </LevelSection>

                <LevelSection
                    title="Feedback"
                    description="Estados de respuesta para el usuario."
                >
                    <ComingSoon>alert, toast y estados vacíos.</ComingSoon>
                </LevelSection>
            </View>
        </View>
    );
}
