import React from 'react';
import { View, Button, StyleSheet } from 'react-native';

export default function SettingsScreen({ onLogout }) {
  return (
    <View style={styles.container}>
      <Button title="退出登录" onPress={onLogout} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
}); 