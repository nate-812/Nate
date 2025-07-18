import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // We use icons for a cute touch

export default function LoginScreen({ onLogin }) {
  const [userId, setUserId] = useState('');
  const [secretCode, setSecretCode] = useState('');

  const handleLogin = () => {
    onLogin(userId, secretCode);
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView contentContainerStyle={styles.content}>
        <Ionicons name="heart" size={80} color="#FF6B6B" style={styles.icon} />
        <Text style={styles.title}>欢迎回家</Text>
        
        <Text style={styles.subtitle}>请输入你的专属编号</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="♡"
            placeholderTextColor="#FFBDBD"
            keyboardType="numeric"
            value={userId}
            onChangeText={setUserId}
            maxLength={3}
            textAlign="center"
          />
        </View>

        <Text style={styles.subtitle}>和我们的情侣密语</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="暗号"
            placeholderTextColor="#FFBDBD"
            secureTextEntry // This hides the password
            value={secretCode}
            onChangeText={setSecretCode}
            textAlign="center"
          />
        </View>

        <TouchableOpacity style={styles.buttonContainer} onPress={handleLogin}>
          <Text style={styles.buttonText}>进入我们的小窝</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF0F5', // Soft pink background
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  icon: {
    marginBottom: 20,
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 3,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#333',
    fontFamily: Platform.OS === 'ios' ? 'Avenir-Heavy' : 'sans-serif-condensed',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
    marginBottom: 40,
  },
  inputContainer: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#333',
    shadowColor: '#000',
    shadowOffset: {
      width: 4,
      height: 4,
    },
    shadowOpacity: 1,
    shadowRadius: 0,
    marginBottom: 30,
    elevation: 5, // for Android shadow
  },
  input: {
    width: '100%',
    height: 70,
    paddingHorizontal: 15,
    fontSize: 40,
    fontWeight: 'bold',
    color: '#333',
  },
  buttonContainer: {
    width: '80%',
    backgroundColor: '#FF6B6B',
    paddingVertical: 20,
    borderRadius: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#333',
    shadowColor: '#000',
    shadowOffset: {
      width: 4,
      height: 4,
    },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 5, // for Android shadow
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
}); 