/**
 * Documento: panel del administrador (web).
 * Lista usuarios, permite activar/desactivar cuentas con confirmación y
 * cerrar sesión. El backend se consume solo a través de @agrodoc/features.
 */
import { useMemo, useState } from 'react';
import { ScrollView, View } from 'react-native';
import {
    useAdminUsers,
    useAuth,
    useLogout,
    useSetUserActive,
} from '@agrodoc/features';
import {
    Badge,
    Button,
    ConfirmDialog,
    Text,
    useTheme,
} from '@agrodoc/ui';
import { getStyles } from './AdminLobby.styles';

export default function AdminLobby() {
    const theme = useTheme();
    const styles = useMemo(() => getStyles(theme), [theme]);
    const { user: currentUser } = useAuth();
    const usersQuery = useAdminUsers();
    const setUserActive = useSetUserActive();
    const logout = useLogout();
    const [action, setAction] = useState(null);

    const users = usersQuery.data ?? [];
    const pendingUser = action?.type === 'toggle' ? action.user : null;
    const isLogout = action?.type === 'logout';

    const closeDialog = () => setAction(null);

    const confirmAction = () => {
        if (pendingUser) {
            setUserActive.mutate(
                {
                    userId: pendingUser.id,
                    isActive: !pendingUser.is_active,
                },
                { onSettled: closeDialog }
            );
            return;
        }

        logout.mutate(undefined, { onSettled: closeDialog });
    };

    return (
        <ScrollView
            testID="admin-dashboard"
            style={styles.screen}
            contentContainerStyle={styles.content}
        >
            <View style={styles.header}>
                <View style={styles.headerText}>
                    <Text variant="title">Panel de administración</Text>
                    <Text variant="body" color="notselected">
                        {currentUser?.full_name ?? 'Administrador'}
                    </Text>
                </View>
                <Button
                    title="Cerrar sesión"
                    variant="ghost"
                    onPress={() => setAction({ type: 'logout' })}
                />
            </View>

            <View style={styles.section}>
                <Text variant="subtitle">Usuarios</Text>

                {usersQuery.isLoading ? (
                    <Text color="notselected">Cargando usuarios…</Text>
                ) : null}

                {usersQuery.isError ? (
                    <Text color="danger">
                        No se pudieron cargar los usuarios.
                    </Text>
                ) : null}

                {users.map((user) => (
                    <View key={user.id} style={styles.userCard}>
                        <View style={styles.userInfo}>
                            <Text variant="label">{user.full_name}</Text>
                            <Text variant="caption" color="notselected">
                                {user.email}
                            </Text>
                            <View style={styles.badges}>
                                <Badge
                                    variant={
                                        user.is_active ? 'healthy' : 'danger'
                                    }
                                >
                                    {user.is_active ? 'Activo' : 'Inactivo'}
                                </Badge>
                                <Badge variant="premium">{user.role}</Badge>
                            </View>
                        </View>

                        <Button
                            title={user.is_active ? 'Desactivar' : 'Activar'}
                            variant={user.is_active ? 'danger' : 'secondary'}
                            onPress={() =>
                                setAction({ type: 'toggle', user })
                            }
                        />
                    </View>
                ))}
            </View>

            <ConfirmDialog
                visible={Boolean(action)}
                title={
                    isLogout
                        ? 'Cerrar sesión'
                        : pendingUser?.is_active
                          ? `Desactivar a ${pendingUser.full_name}`
                          : `Activar a ${pendingUser?.full_name ?? ''}`
                }
                message={
                    isLogout
                        ? '¿Seguro que quieres salir de tu cuenta?'
                        : pendingUser?.is_active
                          ? 'La cuenta no podrá iniciar sesión hasta que vuelvas a activarla.'
                          : 'La cuenta podrá volver a iniciar sesión.'
                }
                confirmLabel={isLogout ? 'Cerrar sesión' : 'Confirmar'}
                destructive={Boolean(pendingUser?.is_active) || isLogout}
                loading={setUserActive.isPending || logout.isPending}
                onConfirm={confirmAction}
                onCancel={closeDialog}
            />
        </ScrollView>
    );
}
