// apps/web/src/pages/Playground.jsx
import React from 'react';
import { View, Text } from 'react-native';
import { Button } from '@agrodoc/ui';

const Section = ({ title, children }) => (
    <View style={{ marginBottom: 24, gap: 8 }}>
        <Text style={{ fontWeight: 'bold' }}>{title}</Text>
        {children}
    </View>
);

export default function Playground() {
    return (
        <View style={{ padding: 24, maxWidth: 400 }}>
        <Section title="Button">
            <Button title="Primary" onPress={() => alert('ok')} />
            <Button title="Secondary" variant="secondary" />
            <Button title="Danger" variant="danger" />
            <Button title="Ghost" variant="ghost" />
            <Button title="Disabled" disabled />
            <Button title="Loading" loading />
            <Button title="Full width" fullWidth />
        </Section>
        </View>
    );
}