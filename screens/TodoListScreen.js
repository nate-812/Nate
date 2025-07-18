import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function PhotoAlbumScreen() {
  return (
    <View style={styles.container}>
      <Text>这里是甜蜜相册页面</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
}); 