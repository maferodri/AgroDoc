/**
 * Documento: historias de ConfidenceBar.
 * Cubren confianza alta, media y baja con sus umbrales reales.
 */
import { View } from 'react-native';
import { ConfidenceBar } from './ConfidenceBar';
import { useTheme } from '../../theme/useTheme';

export default {
    title: 'Moléculas/ConfidenceBar',
    component: ConfidenceBar,
    tags: ['autodocs'],
    argTypes: {
        value: { control: { type: 'range', min: 0, max: 100 } },
    },
};

export const Alta = { args: { value: 92.8 } };
export const Media = { args: { value: 64.2 } };
export const Baja = { args: { value: 34.7 } };

function AllLevels() {
    const theme = useTheme();

    return (
        <View style={{ gap: theme.spacing.lg, width: 420 }}>
            <ConfidenceBar value={92.8} />
            <ConfidenceBar value={64.2} />
            <ConfidenceBar value={34.7} />
        </View>
    );
}

export const TodosLosNiveles = {
    render: () => <AllLevels />,
};
