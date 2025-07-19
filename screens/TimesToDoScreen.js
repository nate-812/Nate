import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    TextInput,
    Modal,
    Alert,
    ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import DatabaseService from '../services/DatabaseService';

export default function TimesToDoScreen({ route }) {
    const { userId } = route.params;
    const [times, setTimes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [statsModalVisible, setStatsModalVisible] = useState(false);
    const [newTimeText, setNewTimeText] = useState('');
    const [adding, setAdding] = useState(false);

    const partnerId = userId === '812' ? '917' : '812';
    const timesDocId = [userId, partnerId].sort().join('_');

    // 监听数据变化
    useEffect(() => {
        const timesDocRef = DatabaseService.doc('timesToDo', timesDocId);
        const unsubscribe = DatabaseService.onSnapshot(timesDocRef, (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                setTimes(data.items || []);
            } else {
                setTimes([]);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, [timesDocId]);

    // 添加新事项
    const addNewTime = async () => {
        if (newTimeText.trim() === '') {
            Alert.alert('提示', '请输入要添加的事项');
            return;
        }

        setAdding(true);
        try {
            const newItem = {
                id: `${Date.now()}-${Math.random()}`,
                text: newTimeText.trim(),
                count: 0,
                createdAt: new Date(),
                createdBy: userId
            };

            const timesDocRef = DatabaseService.doc('timesToDo', timesDocId);
            
            const docSnap = await DatabaseService.getDoc(timesDocRef);
            
            if (docSnap.exists()) {
                const currentItems = docSnap.data().items || [];
                await DatabaseService.updateDoc(timesDocRef, {
                    items: [...currentItems, newItem]
                });
            } else {
                await DatabaseService.setDoc(timesDocRef, {
                    items: [newItem]
                });
            }

            setNewTimeText('');
            setModalVisible(false);
        } catch (error) {
            console.error('添加事项失败:', error);
            Alert.alert('错误', `添加失败：${error.message}`);
        } finally {
            setAdding(false);
        }
    };

    // 增加次数
    const incrementCount = async (item) => {
        try {
            const timesDocRef = DatabaseService.doc('timesToDo', timesDocId);
            const docSnap = await DatabaseService.getDoc(timesDocRef);
            
            if (docSnap.exists()) {
                const currentItems = docSnap.data().items || [];
                const updatedItems = currentItems.map(time => 
                    time.id === item.id 
                        ? { ...time, count: time.count + 1 }
                        : time
                );
                
                await DatabaseService.updateDoc(timesDocRef, { items: updatedItems });
            }
        } catch (error) {
            console.error('更新次数失败:', error);
            Alert.alert('错误', '更新失败，请重试');
        }
    };

    // 减少次数
    const decrementCount = async (item) => {
        if (item.count <= 0) return;
        
        try {
            const timesDocRef = DatabaseService.doc('timesToDo', timesDocId);
            const docSnap = await DatabaseService.getDoc(timesDocRef);
            
            if (docSnap.exists()) {
                const currentItems = docSnap.data().items || [];
                const updatedItems = currentItems.map(time => 
                    time.id === item.id 
                        ? { ...time, count: time.count - 1 }
                        : time
                );
                
                await DatabaseService.updateDoc(timesDocRef, { items: updatedItems });
            }
        } catch (error) {
            console.error('更新次数失败:', error);
            Alert.alert('错误', '更新失败，请重试');
        }
    };

    // 删除事项
    const deleteTime = (item) => {
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
                            const timesDocRef = DatabaseService.doc('timesToDo', timesDocId);
                            const docSnap = await DatabaseService.getDoc(timesDocRef);
                            
                            if (docSnap.exists()) {
                                const currentItems = docSnap.data().items || [];
                                const updatedItems = currentItems.filter(time => time.id !== item.id);
                                await DatabaseService.updateDoc(timesDocRef, { items: updatedItems });
                            }
                        } catch (error) {
                            console.error('删除失败:', error);
                            Alert.alert('错误', '删除失败，请重试');
                        }
                    }
                }
            ]
        );
    };

    // 计算总次数
    const totalCount = times.reduce((sum, item) => sum + item.count, 0);

    // 渲染事项
    const renderTimeItem = ({ item }) => (
        <View style={styles.timeItem}>
            <View style={styles.timeContent}>
                <Text style={styles.timeText}>{item.text}</Text>
                <Text style={styles.countText}>{item.count} 次</Text>
            </View>
            <View style={styles.timeActions}>
                <TouchableOpacity 
                    style={styles.countButton}
                    onPress={() => decrementCount(item)}
                >
                    <Ionicons name="remove" size={20} color="#FF6B6B" />
                </TouchableOpacity>
                <TouchableOpacity 
                    style={styles.countButton}
                    onPress={() => incrementCount(item)}
                >
                    <Ionicons name="add" size={20} color="#4ECDC4" />
                </TouchableOpacity>
                <TouchableOpacity 
                    style={styles.deleteButton}
                    onPress={() => deleteTime(item)}
                >
                    <Ionicons name="trash-outline" size={18} color="#FF6B6B" />
                </TouchableOpacity>
            </View>
        </View>
    );

    // 渲染统计弹窗
    const renderStatsModal = () => (
        <Modal
            animationType="slide"
            transparent={true}
            visible={statsModalVisible}
            onRequestClose={() => setStatsModalVisible(false)}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.statsModal}>
                    <View style={styles.statsHeader}>
                        <Text style={styles.statsTitle}>完成统计</Text>
                        <TouchableOpacity onPress={() => setStatsModalVisible(false)}>
                            <Ionicons name="close" size={24} color="#666" />
                        </TouchableOpacity>
                    </View>
                    <FlatList
                        data={times.filter(item => item.count > 0)}
                        keyExtractor={item => item.id}
                        renderItem={({ item }) => (
                            <View style={styles.statsItem}>
                                <Text style={styles.statsItemText}>{item.text}</Text>
                                <Text style={styles.statsItemCount}>{item.count} 次</Text>
                            </View>
                        )}
                        ListEmptyComponent={
                            <Text style={styles.emptyStatsText}>还没有完成任何事项</Text>
                        }
                    />
                </View>
            </View>
        </Modal>
    );

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#4ECDC4" />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={['right', 'bottom', 'left']}>
            {/* 进度显示 */}
            <TouchableOpacity 
                style={styles.progressContainer}
                onPress={() => setStatsModalVisible(true)}
            >
                <Text style={styles.progressTitle}>100次</Text>
                <Text style={styles.progressText}>
                    总共完成了 {totalCount} 次
                </Text>
                <View style={styles.progressBar}>
                    <LinearGradient 
                        colors={['#4ECDC4', '#44A08D']} 
                        style={styles.progressFill}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                    />
                </View>
                <Text style={styles.tapHint}>点击查看详细统计</Text>
            </TouchableOpacity>

            {/* 事项列表 */}
            <FlatList
                data={times}
                keyExtractor={item => item.id}
                renderItem={renderTimeItem}
                contentContainerStyle={styles.listContainer}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="refresh-outline" size={64} color="#ccc" />
                        <Text style={styles.emptyText}>还没有添加任何事项</Text>
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
                        <Text style={styles.modalTitle}>添加新事项</Text>
                        <TextInput
                            style={styles.textInput}
                            placeholder="输入要重复做的事情..."
                            value={newTimeText}
                            onChangeText={setNewTimeText}
                            multiline
                            maxLength={100}
                        />
                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.cancelButton]}
                                onPress={() => setModalVisible(false)}
                            >
                                <Text style={styles.cancelButtonText}>取消</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.addModalButton]}
                                onPress={addNewTime}
                                disabled={adding}
                            >
                                {adding ? (
                                    <ActivityIndicator size="small" color="white" />
                                ) : (
                                    <Text style={styles.addButtonText}>添加</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {renderStatsModal()}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    progressContainer: {
        margin: 20,
        padding: 20,
        backgroundColor: 'white',
        borderRadius: 15,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    progressTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        textAlign: 'center',
        marginBottom: 10,
    },
    progressText: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginBottom: 15,
    },
    progressBar: {
        height: 8,
        backgroundColor: '#e0e0e0',
        borderRadius: 4,
        overflow: 'hidden',
        marginBottom: 10,
    },
    progressFill: {
        height: '100%',
        width: '100%',
    },
    tapHint: {
        fontSize: 12,
        color: '#999',
        textAlign: 'center',
        fontStyle: 'italic',
    },
    listContainer: {
        padding: 20,
        paddingTop: 0,
    },
    timeItem: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 15,
        marginBottom: 10,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    timeContent: {
        flex: 1,
    },
    timeText: {
        fontSize: 16,
        color: '#333',
        marginBottom: 5,
    },
    countText: {
        fontSize: 14,
        color: '#4ECDC4',
        fontWeight: 'bold',
    },
    timeActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    countButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#f0f0f0',
        justifyContent: 'center',
        alignItems: 'center',
    },
    deleteButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#ffebee',
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
    },
    emptyText: {
        fontSize: 18,
        color: '#999',
        marginTop: 20,
        marginBottom: 5,
    },
    emptySubtext: {
        fontSize: 14,
        color: '#ccc',
    },
    addButton: {
        position: 'absolute',
        right: 20,
        bottom: 20,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#4ECDC4',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 8,
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
        padding: 20,
        width: '85%',
        maxWidth: 400,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        textAlign: 'center',
        marginBottom: 20,
    },
    textInput: {
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
        gap: 10,
    },
    modalButton: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 10,
        alignItems: 'center',
    },
    cancelButton: {
        backgroundColor: '#f0f0f0',
    },
    addModalButton: {
        backgroundColor: '#4ECDC4',
    },
    cancelButtonText: {
        color: '#666',
        fontSize: 16,
        fontWeight: 'bold',
    },
    addButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    statsModal: {
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 20,
        width: '85%',
        maxWidth: 400,
        maxHeight: '70%',
    },
    statsHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    statsTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
    },
    statsItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    statsItemText: {
        fontSize: 16,
        color: '#333',
        flex: 1,
    },
    statsItemCount: {
        fontSize: 16,
        color: '#4ECDC4',
        fontWeight: 'bold',
    },
    emptyStatsText: {
        textAlign: 'center',
        color: '#999',
        fontSize: 16,
        paddingVertical: 40,
    },
});
