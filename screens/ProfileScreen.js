import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { db, auth } from '../firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

const calculateAge = (birthday) => {
    if (!birthday) return null;
    const birthDate = new Date(birthday);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
};

export default function ProfileScreen({ route, navigation }) {
    const { userId } = route.params;
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUserData = async () => {
            if (userId) {
                try {
                    const docRef = doc(db, "users", userId);
                    const docSnap = await getDoc(docRef);

                    if (docSnap.exists()) {
                        setUserData(docSnap.data());
                    } else {
                        console.log("No such document!");
                    }
                } catch (error) {
                    console.error("Error fetching user data:", error);
                } finally {
                    setLoading(false);
                }
            }
        };

        fetchUserData();
    }, [userId]);

    const handleLogout = async () => {
        Alert.alert(
            '确认退出',
            '确定要退出登录吗？',
            [
                { text: '取消', style: 'cancel' },
                { 
                    text: '退出', 
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await signOut(auth);
                            await AsyncStorage.removeItem('userToken');
                        } catch (error) {
                            console.error('退出登录失败:', error);
                            Alert.alert('错误', '退出登录失败，请重试');
                        }
                    }
                }
            ]
        );
    };

    if (loading) {
        return <ActivityIndicator size="large" style={styles.loader} />;
    }

    if (!userData) {
        return <View style={styles.container}><Text>找不到用户资料</Text></View>;
    }

    const age = calculateAge(userData.birthday);

    return (
        <View style={styles.container}>
            <View style={styles.card}>
                <Ionicons name="person-circle-outline" size={80} color="#333" style={styles.avatar} />
                <Text style={styles.name}>{userData.name}</Text>
                
                <View style={styles.infoRow}>
                    <Ionicons name="balloon-outline" size={24} color="#666" />
                    <Text style={styles.infoText}>{age ? `${age} 岁` : 'N/A'}</Text>
                </View>

                <View style={styles.infoRow}>
                    <Ionicons name="calendar-outline" size={24} color="#666" />
                    <Text style={styles.infoText}>{userData.birthday || 'N/A'}</Text>
                </View>

                <View style={styles.divider} />

                <Text style={styles.settingsTitle}>设置</Text>
                
                <TouchableOpacity style={styles.settingItem} onPress={handleLogout}>
                    <Ionicons name="log-out-outline" size={24} color="#e74c3c" />
                    <Text style={styles.settingText}>退出登录</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f2f2f7',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    loader: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    card: {
        width: '100%',
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 25,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
    },
    avatar: {
        marginBottom: 15,
    },
    name: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 25,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        marginBottom: 15,
    },
    infoText: {
        fontSize: 18,
        marginLeft: 15,
        color: '#333',
    },
    divider: {
        width: '100%',
        height: 1,
        backgroundColor: '#e0e0e0',
        marginVertical: 20,
    },
    settingsTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        alignSelf: 'flex-start',
        marginBottom: 15,
        color: '#333',
    },
    settingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        paddingVertical: 10,
    },
    settingText: {
        fontSize: 18,
        marginLeft: 15,
        color: '#e74c3c',
    },
}); 
