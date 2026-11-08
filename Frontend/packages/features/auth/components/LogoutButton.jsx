/**
 * Documento: acción de cierre de sesión con confirmación.
 * Reutilizable en web y móvil: pide confirmación antes de revocar la sesión.
 */
import { useState } from 'react';
import { Button, ConfirmDialog } from '@agrodoc/ui';
import { useLogout } from '../hooks/useLogout.js';

/**
 * @param {string} [label] Texto del botón.
 * @param {'primary'|'secondary'|'danger'|'ghost'} [variant] Estilo del botón.
 */
export function LogoutButton({ label = 'Cerrar sesión', variant = 'ghost' }) {
    const [visible, setVisible] = useState(false);
    const logout = useLogout();

    return (
        <>
            <Button title={label} variant={variant} onPress={() => setVisible(true)} />
            <ConfirmDialog
                visible={visible}
                title="Cerrar sesión"
                message="¿Seguro que quieres salir de tu cuenta?"
                confirmLabel="Cerrar sesión"
                destructive
                loading={logout.isPending}
                onConfirm={() =>
                    logout.mutate(undefined, {
                        onSettled: () => setVisible(false),
                    })
                }
                onCancel={() => setVisible(false)}
            />
        </>
    );
}
