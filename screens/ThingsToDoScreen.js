import React, { useState, useEffect, useCallback } from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    FlatList, 
    TouchableOpacity, 
    TextInput, 
    Alert,
    ActivityIndicator,
    Modal
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { 
    doc, 
    onSnapshot, 
    updateDoc, 
    arrayUnion, 
    arrayRemove,
    getDoc,
    setDoc
} from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { auth } from '../firebaseConfig';

export default function ThingsToDoScreen({ route }) {
    const { userId } = route.params;
    const [things, setThings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [newThingText, setNewThingText] = useState('');
    const [adding, setAdding] = useState(false);

    const partnerId = userId === '812' ? '917' : '812';
    const thingsDocId = [userId, partnerId].sort().join('_');

    // 监听数据变化
    useEffect(() => {
        const thingsDocRef = doc(db, 'thingsToDo', thingsDocId);
        const unsubscribe = onSnapshot(thingsDocRef, (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                setThings(data.items || []);
            } else {
                setThings([]);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, [thingsDocId]);

    // 添加新事项
    const addNewThing = async () => {
        if (newThingText.trim() === '') {
            Alert.alert('提示', '请输入要添加的事项');
            return;
        }

        setAdding(true);
        try {
            const newItem = {
                id: `${Date.now()}-${Math.random()}`,
                text: newThingText.trim(),
                completed: false,
                createdAt: new Date(),
                createdBy: userId
            };

            const thingsDocRef = doc(db, 'thingsToDo', thingsDocId);
            
            // 检查文档是否存在
            const docSnap = await getDoc(thingsDocRef);
            
            if (docSnap.exists()) {
                // 文档存在，添加到现有数组
                const currentItems = docSnap.data().items || [];
                await updateDoc(thingsDocRef, {
                    items: [...currentItems, newItem]
                });
            } else {
                // 文档不存在，创建新文档
                await setDoc(thingsDocRef, {
                    items: [newItem]
                });
            }

            setNewThingText('');
            setModalVisible(false);
        } catch (error) {
            console.error('添加事项失败:', error);
            Alert.alert('错误', `添加失败：${error.message}`);
        } finally {
            setAdding(false);
        }
    };

    // 切换完成状态
    const toggleComplete = async (item) => {
        try {
            const thingsDocRef = doc(db, 'thingsToDo', thingsDocId);
            const docSnap = await getDoc(thingsDocRef);
            
            if (docSnap.exists()) {
                const currentItems = docSnap.data().items || [];
                const updatedItems = currentItems.map(thing => 
                    thing.id === item.id 
                        ? { ...thing, completed: !thing.completed }
                        : thing
                );
                
                await updateDoc(thingsDocRef, { items: updatedItems });
            }
        } catch (error) {
            console.error('更新状态失败:', error);
            Alert.alert('错误', '更新失败，请重试');
        }
    };

    // 删除事项
    const deleteThing = (item) => {
        Alert.alert(
            '确认删除',
            `确定要删除"${item.text}"吗？`,
            [
                { text: '取消', style: 'cancel' },
                { 
                    text: '删除', 
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            const thingsDocRef = doc(db, 'thingsToDo', thingsDocId);
                            await updateDoc(thingsDocRef, {
                                items: arrayRemove(item)
                            });
                        } catch (error) {
                            console.error('删除失败:', error);
                            Alert.alert('错误', '删除失败，请重试');
                        }
                    }
                }
            ]
        );
    };

    // 计算进度
    const completedCount = things.filter(item => item.completed).length;
    const totalCount = things.length;
    const progress = totalCount > 0 ? (completedCount / totalCount * 100).toFixed(1) : 0;

    const renderItem = ({ item }) => (
        <View style={styles.itemContainer}>
            <TouchableOpacity 
                style={styles.itemContent}
                onPress={() => toggleComplete(item)}
            >
                <Ionicons 
                    name={item.completed ? "checkmark-circle" : "ellipse-outline"} 
                    size={24} 
                    color={item.completed ? "#27ae60" : "#bdc3c7"} 
                />
                <Text style={[
                    styles.itemText,
                    item.completed && styles.completedText
                ]}>
                    {item.text}
                </Text>
            </TouchableOpacity>
            <TouchableOpacity 
                style={styles.deleteButton}
                onPress={() => deleteThing(item)}
            >
                <Ionicons name="trash-outline" size={20} color="#e74c3c" />
            </TouchableOpacity>
        </View>
    );

    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#2980b9" />
                <Text>正在加载约定...</Text>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={['right', 'bottom', 'left']}>
            {/* 进度显示 */}
            <View style={styles.progressContainer}>
                <Text style={styles.progressTitle}>100件事</Text>
                <Text style={styles.progressText}>
                    已完成 {completedCount}/{totalCount} 件事 ({progress}%)
                </Text>
                <View style={styles.progressBar}>
                    <View style={[styles.progressFill, { width: `${progress}%` }]} />
                </View>
            </View>

            {/* 事项列表 */}
            <FlatList
                data={things}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                style={styles.list}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="heart-outline" size={48} color="#bdc3c7" />
                        <Text style={styles.emptyText}>还没有添加任何约定</Text>
                        <Text style={styles.emptySubtext}>点击下方按钮开始添加吧！</Text>
                    </View>
                }
            />

            {/* 添加按钮 */}
            <TouchableOpacity 
                style={styles.addButton}
                onPress={() => setModalVisible(true)}
            >
                <Ionicons name="add" size={24} color="white" />
            </TouchableOpacity>

            {/* 添加事项弹窗 */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>添加新约定</Text>
                        <TextInput
                            style={styles.modalInput}
                            placeholder="我们想一起做的事..."
                            value={newThingText}
                            onChangeText={setNewThingText}
                            multiline
                            autoFocus
                        />
                        <View style={styles.modalButtons}>
                            <TouchableOpacity 
                                style={[styles.modalButton, styles.cancelButton]}
                                onPress={() => {
                                    setModalVisible(false);
                                    setNewThingText('');
                                }}
                            >
                                <Text style={styles.cancelButtonText}>取消</Text>
                            </TouchableOpacity>
                            <TouchableOpacity 
                                style={[styles.modalButton, styles.confirmButton]}
                                onPress={addNewThing}
                                disabled={adding}
                            >
                                {adding ? (
                                    <ActivityIndicator color="white" />
                                ) : (
                                    <Text style={styles.confirmButtonText}>添加</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
    },
    progressContainer: {
        backgroundColor: 'white',
        margin: 15,
        padding: 20,
        borderRadius: 15,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
    },
    progressTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 10,
        color: '#333',
    },
    progressText: {
        fontSize: 16,
        textAlign: 'center',
        color: '#666',
        marginBottom: 15,
    },
    progressBar: {
        height: 8,
        backgroundColor: '#ecf0f1',
        borderRadius: 4,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        backgroundColor: '#27ae60',
        borderRadius: 4,
    },
    list: {
        flex: 1,
    },
    listContent: {
        padding: 15,
        paddingBottom: 80,
    },
    itemContainer: {
        backgroundColor: 'white',
        borderRadius: 12,
        marginBottom: 10,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 1,
    },
    itemContent: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
    },
    itemText: {
        fontSize: 16,
        marginLeft: 12,
        flex: 1,
        color: '#333',
    },
    completedText: {
        textDecorationLine: 'line-through',
        color: '#95a5a6',
    },
    deleteButton: {
        padding: 15,
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
    },
    emptyText: {
        fontSize: 18,
        color: '#7f8c8d',
        marginTop: 15,
        fontWeight: '500',
    },
    emptySubtext: {
        fontSize: 14,
        color: '#95a5a6',
        marginTop: 5,
    },
    addButton: {
        position: 'absolute',
        bottom: 30,
        right: 30,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#2980b9',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 25,
        width: '85%',
        maxWidth: 400,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 20,
        color: '#333',
    },
    modalInput: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 10,
        padding: 15,
        fontSize: 16,
        minHeight: 80,
        textAlignVertical: 'top',
        marginBottom: 20,
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    modalButton: {
        flex: 1,
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        marginHorizontal: 5,
    },
    cancelButton: {
        backgroundColor: '#ecf0f1',
    },
    confirmButton: {
        backgroundColor: '#2980b9',
    },
    cancelButtonText: {
        color: '#7f8c8d',
        fontSize: 16,
        fontWeight: '500',
    },
    confirmButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '500',
    },
}); 
