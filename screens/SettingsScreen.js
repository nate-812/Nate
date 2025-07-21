import React from 'react';
import { View, Button, StyleSheet } from 'react-native';
import { colors, globalStyles } from '../styles/globalStyles';

export default function SettingsScreen({ onLogout }) {
  return (
    <View style={styles.container}>
      <Button title="退出登录" onPress={onLogout} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...globalStyles.container,
  },
  backgroundLiquid: {
    ...globalStyles.backgroundLiquid,
  },
  settingItem: {
    ...globalStyles.glassCardSmall,
    marginHorizontal: 20,
    marginVertical: 8,
  },
  settingContent: {
    ...globalStyles.cardContent,
  },
  settingTitle: {
    ...globalStyles.subtitleText,
  },
  logoutButton: {
    ...globalStyles.glassButton,
    backgroundColor: colors.gradients.settings[0],
    marginHorizontal: 20,
    marginTop: 20,
  },
}); 
