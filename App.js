import 'react-native-gesture-handler';

import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AuthService from './services/AuthService';
import DatabaseService from './services/DatabaseService';
import { createUsers } from './utils/InitUsers';

import HomeScreen from './screens/HomeScreen';
import ChatScreen from './screens/ChatScreen';
import CalendarScreen from './screens/CalendarScreen';
import SettingsScreen from './screens/SettingsScreen';
import LoginScreen from './screens/LoginScreen';
import ProfileScreen from './screens/ProfileScreen';
import ThingsToDoMenuScreen from './screens/ThingsToDoMenuScreen';
import ThingsToDoScreen from './screens/ThingsToDoScreen';
import TimesToDoScreen from './screens/TimesToDoScreen';
import MoodCalendarScreen from './screens/MoodCalendarScreen';

const AppStack = createStackNavigator();

// 这是登录后的主应用导航
function AppNavigator({ onLogout, userId }) {
  return (
    <AppStack.Navigator initialRouteName="Home">
      <AppStack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} initialParams={{ userId }}/>
      <AppStack.Screen name="Profile" component={ProfileScreen} options={{ title: '个人资料' }} initialParams={{ userId }}/>
      <AppStack.Screen name="Chat" component={ChatScreen} options={{ title: '悄悄话' }} initialParams={{ userId }}/>
      <AppStack.Screen name="Calendar" component={CalendarScreen} options={{ title: '纪念日' }} initialParams={{ userId }}/>
      <AppStack.Screen name="ThingsToDoMenu" component={ThingsToDoMenuScreen} options={{ title: '我们的约定' }} initialParams={{ userId }}/>
      <AppStack.Screen name="ThingsToDo" component={ThingsToDoScreen} options={{ title: '100件事' }} initialParams={{ userId }}/>
      <AppStack.Screen name="TimesToDo" component={TimesToDoScreen} options={{ title: '100次' }} initialParams={{ userId }}/>
      <AppStack.Screen name="Settings" options={{ title: '设置' }}>
        {(props) => <SettingsScreen {...props} onLogout={onLogout} />}
      </AppStack.Screen>
      <AppStack.Screen name="MoodCalendar" component={MoodCalendarScreen} options={{ title: '心情日历' }} initialParams={{ userId }}/>
    </AppStack.Navigator>
  );
}


export default function App() {
  const [user, setUser] = useState(null);
  const [userId, setUserId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 创建用户（第一次运行后可以注释掉）
    createUsers();

    const unsubscribe = AuthService.onAuthStateChanged((user) => {
      setUser(user);
      if (user) {
        const email = user.email || '';
        const userIdMatch = email.match(/user(\d+)@/);
        if (userIdMatch) {
          setUserId(userIdMatch[1]);
        }
      } else {
        setUserId(null);
      }
      setIsLoading(false);
    });

    return unsubscribe;
  }, []);

  const handleLogin = async (code, secretCode) => {
    if (!code || !secretCode || (code !== '812' && code !== '917')) {
      alert('请输入正确的专属编号和密语哦！');
      return;
    }

    if (secretCode !== '511511') {
      alert('情侣密语不正确！');
      return;
    }

    setIsLoading(true);

    try {
      await AsyncStorage.setItem('userToken', code);
      const userCredential = await AuthService.signIn(code, secretCode);
      setUser(userCredential.user);
      setUserId(code);
    } catch (error) {
      console.error('Login error:', error);
      await AsyncStorage.removeItem('userToken');
      alert('登录失败：' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await AuthService.signOut();
      await AsyncStorage.removeItem('userToken');
      setUser(null);
      setUserId(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {user && userId ? (
        <AppNavigator onLogout={handleLogout} userId={userId} />
      ) : (
        <LoginScreen onLogin={handleLogin} />
      )}
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  }
}); 
