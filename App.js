import 'react-native-gesture-handler';
import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth, db } from './firebaseConfig';
import { signInWithEmailAndPassword, onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, updateDoc } from "firebase/firestore";


import HomeScreen from './screens/HomeScreen';
import ChatScreen from './screens/ChatScreen';
import CalendarScreen from './screens/CalendarScreen';
import SettingsScreen from './screens/SettingsScreen';
import LoginScreen from './screens/LoginScreen';
import ProfileScreen from './screens/ProfileScreen';
import ThingsToDoMenuScreen from './screens/ThingsToDoMenuScreen';
import ThingsToDoScreen from './screens/ThingsToDoScreen';
import TimesToDoScreen from './screens/TimesToDoScreen';

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
    </AppStack.Navigator>
  );
}


export default function App() {
    const [user, setUser] = useState(null); // This will hold the entire Firebase user object
    const [userId, setUserId] = useState(null); // This holds just the ID '812' or '917'
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (authenticatedUser) => {
            if (authenticatedUser) {
                // If a user is authenticated, we trust AsyncStorage to tell us WHO they are.
                const storedUserId = await AsyncStorage.getItem('userToken');
                setUser(authenticatedUser);
                setUserId(storedUserId);
            } else {
                // No user is signed in.
                setUser(null);
                setUserId(null);
            }
            setIsLoading(false);
        });

        return unsubscribe; // Unsubscribe on unmount
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

        const email = `user${code}@our-nest.com`;
        const password = secretCode;

        // Set loading state to give user feedback
        setIsLoading(true);

        try {
            // --- The critical change is here ---
            // 1. First, set the user token. This is our "intent".
            await AsyncStorage.setItem('userToken', code);

            // 2. Then, attempt to sign in.
            const userCredential = await signInWithEmailAndPassword(auth, email, password);

            // 3. If successful, update the state directly for a fast UI response.
            // The onAuthStateChanged listener will also fire and correctly set the state,
            // but this makes the login feel instantaneous.
            setUser(userCredential.user);
            setUserId(code);

        } catch (error) {
            console.error("Login Failed", error);
            alert('登录失败，请检查你的编号和密语。');
            // 4. If login fails, clear the token we tried to set.
            await AsyncStorage.removeItem('userToken');
        } finally {
            // Whether it succeeds or fails, we're done loading.
            setIsLoading(false);
        }
    };

    const handleLogout = async () => {
        try {
            await signOut(auth);
            // Clear local storage
            await AsyncStorage.removeItem('userToken');
            // onAuthStateChanged will handle setting user and userId to null
        } catch (error) {
            console.error('Sign Out Error', error);
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
