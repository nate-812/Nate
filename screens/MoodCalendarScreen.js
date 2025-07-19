import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function MoodCalendarScreen({ route }) {
    const { userId } = route.params;

    return (
        <View style={styles.container}>
            <Text style={styles.title}>心情日历</Text>
            <Text style={styles.subtitle}>功能开发中...</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f2f2f7',
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
    },
});