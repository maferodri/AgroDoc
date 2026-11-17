/**
 * Documento: pruebas de la acción de fotografía móvil.
 */
import { fireEvent, render, screen } from '@testing-library/react-native';
import { ThemeProvider } from '@agrodoc/ui';
import { light } from '@agrodoc/tokens';
import { NavAction } from './NavAction';

const renderWithTheme = (ui) =>
    render(<ThemeProvider theme={light}>{ui}</ThemeProvider>);

describe('NavAction', () => {
    it('dispara la acción de fotografía', async () => {
        const onPress = jest.fn();
        await renderWithTheme(<NavAction onPress={onPress} />);

        await fireEvent.press(
            screen.getByRole('button', { name: 'Fotografía' })
        );
        expect(onPress).toHaveBeenCalledTimes(1);
    });
});
