import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function ThingsToDoScreen() {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>我们的约定</Text>
            <Text style={styles.subtitle}>这里将记录我们想一起完成的100件事...</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
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