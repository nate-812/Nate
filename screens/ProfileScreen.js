import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { db } from '../firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
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

export default function ProfileScreen({ route }) {
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
}); 