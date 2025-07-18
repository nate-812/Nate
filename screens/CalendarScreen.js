import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, TextInput, Button, Animated, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { GestureHandlerRootView, Swipeable } from 'react-native-gesture-handler';

import { db } from '../firebaseConfig'; // Import the db object
import { collection, addDoc, onSnapshot, deleteDoc, doc, query, orderBy } from 'firebase/firestore';

const AnniversaryItem = ({ item, onDelete }) => {
  const daysLeft = Math.ceil((new Date(item.date) - new Date()) / (1000 * 60 * 60 * 24));
  const daysAgo = -daysLeft;

  const renderRightActions = (progress, dragX) => {
    const trans = dragX.interpolate({
      inputRange: [-80, 0],
      outputRange: [0, 80],
      extrapolate: 'clamp',
    });
    return (
      <TouchableOpacity onPress={onDelete} style={styles.deleteButton}>
        <Animated.Text style={[styles.deleteButtonText, { transform: [{ translateX: trans }] }]}>
          删除
        </Animated.Text>
      </TouchableOpacity>
    );
  };

  return (
    <Swipeable renderRightActions={renderRightActions}>
        <View style={styles.itemContainer}>
        <View style={styles.itemTextContainer}>
            <Text style={styles.itemTitle}>{item.title}</Text>
            <Text style={styles.itemDate}>{item.date}</Text>
        </View>
        <View style={styles.itemDaysContainer}>
            {daysLeft >= 0 ? (
            <>
                <Text style={styles.daysNumber}>{daysLeft}</Text>
                <Text style={styles.daysText}>天后</Text>
            </>
            ) : (
            <>
                <Text style={styles.daysNumber}>{daysAgo}</Text>
                <Text style={styles.daysText}>天前</Text>
            </>
            )}
        </View>
        </View>
    </Swipeable>
  );
};

export default function CalendarScreen() {
  const [modalVisible, setModalVisible] = useState(false);
  const [anniversaries, setAnniversaries] = useState([]);
  const [newName, setNewName] = useState('');
  const [newDate, setNewDate] = useState('');

  // Listen for real-time updates from Firestore
  useEffect(() => {
    const q = query(collection(db, "anniversaries"), orderBy("date", "desc"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const anniversariesData = [];
      querySnapshot.forEach((doc) => {
        anniversariesData.push({ ...doc.data(), id: doc.id });
      });
      setAnniversaries(anniversariesData);
    });

    return () => unsubscribe(); // Cleanup on unmount
  }, []);

  const handleAddAnniversary = async () => {
    if (newName.trim() === '' || newDate.trim() === '') {
      alert('请填写名称和日期哦！');
      return;
    }
    try {
      await addDoc(collection(db, 'anniversaries'), {
        title: newName,
        date: newDate,
      });
      setNewName('');
      setNewDate('');
      setModalVisible(false);
    } catch (error) {
      console.error("Error adding document: ", error);
      alert('添加失败，请稍后再试');
    }
  };

  const handleDeleteAnniversary = async (id) => {
    try {
      await deleteDoc(doc(db, 'anniversaries', id));
    } catch (error) {
      console.error("Error removing document: ", error);
      alert('删除失败，请稍后再试');
    }
  };


  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
        <View style={styles.container}>
        <FlatList
            data={anniversaries}
            renderItem={({ item }) => <AnniversaryItem item={item} onDelete={() => handleDeleteAnniversary(item.id)} />}
            keyExtractor={item => item.id}
            contentContainerStyle={{ paddingTop: 20 }}
        />
        <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)}>
            <Ionicons name="add" size={30} color="white" />
        </TouchableOpacity>

        <Modal
            animationType="fade"
            transparent={true}
            visible={modalVisible}
            onRequestClose={() => setModalVisible(false)}
        >
            {Platform.OS === 'ios' ? (
                <BlurView
                style={styles.absolute}
                tint="light"
                intensity={90}
                />
            ) : (
                <View style={[styles.absolute, { backgroundColor: 'rgba(255, 255, 255, 0.8)' }]} />
            )}
            <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>新的纪念日</Text>
                <TextInput
                style={styles.input}
                placeholder="名称 (如：我们的定情日)"
                value={newName}
                onChangeText={setNewName}
                />
                <TextInput
                style={styles.input}
                placeholder="日期 (格式：YYYY-MM-DD)"
                value={newDate}
                onChangeText={setNewDate}
                />
                <View style={styles.buttonContainer}>
                    <Button title="取消" onPress={() => setModalVisible(false)} color="#FF6B6B" />
                    <Button title="添加" onPress={handleAddAnniversary} />
                </View>
            </View>
            </View>
        </Modal>
        </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f2f2f7',
    },
    itemContainer: {
        backgroundColor: 'white',
        padding: 20,
        marginVertical: 8,
        marginHorizontal: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderRadius: 10,
    },
    itemTextContainer: {
        flex: 1,
    },
    itemTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    itemDate: {
        fontSize: 14,
        color: 'gray',
        marginTop: 5,
    },
    itemDaysContainer: {
        alignItems: 'center',
        marginLeft: 20,
    },
    daysNumber: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#2980b9',
    },
    daysText: {
        fontSize: 12,
        color: 'gray',
    },
    deleteButton: {
        backgroundColor: '#FF6B6B',
        justifyContent: 'center',
        alignItems: 'center',
        width: 80,
        marginVertical: 8,
        marginRight: 16,
        borderRadius: 10,
    },
    deleteButtonText: {
        color: 'white',
        fontWeight: 'bold',
    },
    fab: {
        position: 'absolute',
        margin: 16,
        right: 0,
        bottom: 0,
        backgroundColor: '#2980b9',
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
    },
    absolute: {
        position: 'absolute',
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        width: '90%',
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        borderRadius: 20,
        padding: 20,
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    input: {
        width: '100%',
        height: 50,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#ddd',
        paddingHorizontal: 15,
        marginBottom: 15,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
        marginTop: 10,
    }
}); 