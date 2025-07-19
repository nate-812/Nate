import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator, FlatList } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useHeaderHeight } from '@react-navigation/elements';
import { SafeAreaView } from 'react-native-safe-area-context';
import DatabaseService from '../services/DatabaseService';
import { Ionicons } from '@expo/vector-icons';
import { formatMessageTimestamp } from '../utils/dateFormatter';

// 3. 设计时间戳卡片UI组件
const TimestampCard = ({ timestamp }) => (
    <View style={styles.timestampContainer}>
        <Text style={styles.timestampText}>{timestamp}</Text>
    </View>
);

const MessageBubble = ({ message, userId }) => {
    // 因为现在 item 可能是时间戳，它没有 .user 属性，需要加个判断
    if (!message.user) {
        return null;
    }
    const isMyMessage = message.user._id === userId;
    
    return (
        <View style={[
            styles.messageContainer,
            isMyMessage ? styles.myMessageContainer : styles.theirMessageContainer
        ]}>
            {/* 3. 在你发送的消息旁边，显示已读状态 */}
            {isMyMessage && message.isRead && (
                <Text style={styles.readReceipt}>已读</Text>
            )}
            <View style={[
                styles.messageBubble,
                isMyMessage ? styles.myMessageBubble : styles.theirMessageBubble
            ]}>
                <Text style={styles.messageText}>{message.text}</Text>
            </View>
        </View>
    );
};


export default function ChatScreen({ route }) {
    const { userId } = route.params;
    const [shoutoutText, setShoutoutText] = useState('');
    const [partnerId, setPartnerId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    
    // Chat states
    const [messages, setMessages] = useState([]);
    const [chatId, setChatId] = useState(null);
    const [newMessageText, setNewMessageText] = useState('');
    const flatListRef = useRef();
    const headerHeight = useHeaderHeight();

    // Reverting to the simple, reliable version of onSendMessage
    const onSendMessage = useCallback(async () => {
        if (newMessageText.trim() === '' || !chatId) {
            return;
        }
    
        const messageData = {
            _id: `${Date.now()}-${Math.random()}`,
            text: newMessageText,
            createdAt: new Date(), // 直接使用Date对象
            user: {
                _id: userId,
            },
            isRead: false, // 1. 为每条新消息增加 isRead 字段
        };
    
        try {
            const chatDocRef = DatabaseService.doc('chats', chatId);
            const chatDoc = await DatabaseService.getDoc(chatDocRef);
            
            let existingMessages = [];
            if (chatDoc && chatDoc.data && chatDoc.data.messages) {
                existingMessages = chatDoc.data.messages;
            }
            
            const updatedMessages = [...existingMessages, messageData];
            await DatabaseService.setDoc(chatDocRef, { messages: updatedMessages });
            
            // Clear the input AFTER the message is sent
            setNewMessageText('');
        } catch (error) {
            console.error("Error sending message: ", error);
            alert('消息发送失败，请重试。');
        }
    }, [chatId, userId, newMessageText]);

    const handleKeyPress = (e) => {
        if (e.nativeEvent.key === 'Enter' && !e.nativeEvent.shiftKey) {
            e.preventDefault();
            onSendMessage();
        }
    };


    // --- 2. 标记消息为已读的核心逻辑 ---
    const markMessagesAsRead = useCallback(async (messagesToMark) => {
        if (!chatId || messagesToMark.length === 0) {
            return;
        }
        
        try {
            const chatDocRef = DatabaseService.doc('chats', chatId);
            const chatDocSnap = await DatabaseService.getDoc(chatDocRef);
            
            if (chatDocSnap && chatDocSnap.data && chatDocSnap.data.messages) {
                const existingMessages = chatDocSnap.data.messages;
                
                // 创建一个消息ID到索引的映射，以提高效率
                const messageIdToIndex = {};
                existingMessages.forEach((msg, index) => {
                    messageIdToIndex[msg._id] = index;
                });

                // 标记需要更新的消息
                let updatesMade = false;
                messagesToMark.forEach(msgToMark => {
                    if (messageIdToIndex.hasOwnProperty(msgToMark._id)) {
                        const index = messageIdToIndex[msgToMark._id];
                        // 确保消息存在且 isRead 为 false
                        if (existingMessages[index] && existingMessages[index].isRead === false) {
                            existingMessages[index].isRead = true;
                            updatesMade = true;
                        }
                    }
                });

                // 如果有任何更新，则写回数据库
                if (updatesMade) {
                    await DatabaseService.updateDoc(chatDocRef, { messages: existingMessages });
                }
            }
        } catch (error) {
            console.error("标记消息已读失败: ", error);
        }
    }, [chatId]);

    // 2. 这是核心逻辑：处理并插入时间戳
    const processedMessages = useMemo(() => {
        if (messages.length === 0) {
            return [];
        }

        // --- 核心逻辑修正 ---
        // 1. 先按时间正序排列 (从旧到新)
        const sortedMessages = [...messages].sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

        const items = [];
        let lastTimestamp = null;

        // 2. 遍历正序的数组，按正常逻辑插入时间戳
        sortedMessages.forEach((message, index) => {
            const currentTimestamp = message.createdAt;

            if (index === 0 || (lastTimestamp && currentTimestamp.getTime() - lastTimestamp.getTime() > 3 * 60 * 1000)) {
                items.push({
                    _id: `ts-${currentTimestamp.getTime()}`,
                    type: 'timestamp',
                    timestamp: formatMessageTimestamp(currentTimestamp),
                });
            }

            items.push({
                ...message,
                type: 'message',
            });

            lastTimestamp = currentTimestamp;
        });

        // 3. 将处理好的、正序的数组整体倒置，以适应 inverted 列表
        return items.reverse();
    }, [messages]);


    useFocusEffect(
        useCallback(() => {
            const initChat = async () => {
                setLoading(true);
                if (userId) {
                    const newPartnerId = userId === '812' ? '917' : '812';
                    const newChatId = [userId, newPartnerId].sort().join('_');
                    setPartnerId(newPartnerId);
                    setChatId(newChatId);

                    try {
                        const partnerDocRef = DatabaseService.doc("users", newPartnerId);
                        const partnerDocSnap = await DatabaseService.getDoc(partnerDocRef);
                        if (partnerDocSnap && partnerDocSnap.data) {
                            const data = partnerDocSnap.data;
                            setShoutoutText(data.shoutout || '');
                        }
                    } catch (error) {
                        console.error("ChatScreen: 获取伴侣信息失败:", error);
                    }
                }
                setLoading(false);
            };

            initChat();
        }, [userId])
    );

    useEffect(() => {
        if (!chatId) return;

        const chatDocRef = DatabaseService.doc('chats', chatId);
        const unsubscribe = DatabaseService.onSnapshot(chatDocRef, (docSnap) => {
            if (docSnap.exists() && docSnap.data() && docSnap.data().messages) {
                const data = docSnap.data();
                const formattedMessages = data.messages.map(msg => ({
                    ...msg,
                    createdAt: msg.createdAt instanceof Date ? msg.createdAt : new Date(msg.createdAt),
                }));
                setMessages(formattedMessages);

                // --- 2b. 收到新消息时，检查并标记为已读 ---
                const unreadMessages = formattedMessages.filter(
                    msg => msg.user._id !== userId && msg.isRead === false
                );
                if (unreadMessages.length > 0) {
                    markMessagesAsRead(unreadMessages);
                }
            } else {
                setMessages([]);
            }
        });

        return () => unsubscribe();
    }, [chatId, userId, markMessagesAsRead]);

    const handleSendShoutout = async () => {
        if (!partnerId) return;
        setSending(true);
        try {
            const partnerDocRef = DatabaseService.doc("users", partnerId);
            await DatabaseService.updateDoc(partnerDocRef, { shoutout: shoutoutText });
            alert('发送成功！');
        } catch (error) {
            console.error("更新主页文字失败: ", error);
            alert('发送失败，请检查网络后重试。');
        } finally {
            setSending(false);
        }
    };
    

    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#2980b9" />
                <Text>正在加载悄悄话...</Text>
            </View>
        );
    }

    return (
        // 2. 使用 SafeAreaView 并通过 edges 精确控制其作用范围
        <SafeAreaView style={styles.container} edges={['right', 'bottom', 'left']}>
            <KeyboardAvoidingView 
                style={styles.keyboardAvoidingContainer}
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                keyboardVerticalOffset={headerHeight}
            >
                <View style={styles.shoutoutContainer}>
                    <Text style={styles.shoutoutTitle}>我说的话</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="想对Ta说点什么，会显示在Ta的主页哦..."
                        value={shoutoutText}
                        onChangeText={setShoutoutText}
                    />
                    <TouchableOpacity style={styles.sendButton} onPress={handleSendShoutout} disabled={sending}>
                        {sending ? <ActivityIndicator color="white" /> : <Text style={styles.sendButtonText}>更新到Ta的主页</Text>}
                    </TouchableOpacity>
                </View>
            
                <FlatList
                    ref={flatListRef}
                    data={processedMessages} // 使用我们处理过的新数组
                    // 4. 更新渲染逻辑，让它能识别不同类型的item
                    renderItem={({ item }) => {
                        if (item.type === 'timestamp') {
                            return <TimestampCard timestamp={item.timestamp} />;
                        }
                        return <MessageBubble message={item} userId={userId} />;
                    }}
                    keyExtractor={item => item._id}
                    inverted // 使用 inverted 属性，让列表从下往上显示，更像聊天应用
                    style={styles.flatList}
                    contentContainerStyle={styles.chatListContainer}
                />
                <View style={styles.inputToolbar}>
                    <TextInput
                        style={styles.chatInput}
                        placeholder="开始你们的悄悄话..."
                        value={newMessageText}
                        onChangeText={setNewMessageText}
                        multiline
                        returnKeyType="send"
                        onSubmitEditing={onSendMessage} // 保留这个，对某些移动键盘仍然有用
                        onKeyPress={handleKeyPress} // 添加键盘事件监听
                    />
                    <TouchableOpacity style={styles.chatSendButton} onPress={onSendMessage}>
                        <Ionicons name="arrow-up-circle" size={36} color="#2980b9" />
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f2f2f7',
    },
    keyboardAvoidingContainer: {
        flex: 1,
    },
    flatList: {
        flex: 1,
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f2f2f7',
    },
    shoutoutContainer: {
        marginHorizontal: 15,
        // 现在布局由外部控制，我们可以把上边距改回一个更合理的值，或者直接去掉
        marginTop: 10, 
        padding: 20,
        backgroundColor: 'white',
        borderRadius: 15,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
    },
    shoutoutTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#333',
    },
    input: {
        backgroundColor: '#f9f9f9',
        padding: 15,
        borderRadius: 10,
        fontSize: 16,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#eee',
    },
    sendButton: {
        backgroundColor: '#2980b9',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
    },
    sendButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    chatListContainer: {
        paddingBottom: 10,
        paddingHorizontal: 10,
    },
    // 5. 添加时间戳卡片的样式
    timestampContainer: {
        alignSelf: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.2)',
        borderRadius: 12,
        paddingVertical: 5,
        paddingHorizontal: 12,
        marginVertical: 10,
    },
    timestampText: {
        color: 'white',
        fontSize: 12,
        fontWeight: '500',
    },
    messageContainer: {
        marginVertical: 5,
        paddingHorizontal: 10, // 把边距从 chatListContainer 移到这里，更好地控制
    },
    myMessageContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-end', // 把内容（气泡和已读）推到右边
        alignItems: 'flex-end',    // 垂直方向上，底部对齐
        marginLeft: 'auto',        // 让容器本身也靠右
    },
    theirMessageContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-start', // 把内容推到左边
        marginRight: 'auto',       // 让容器本身也靠左
    },
    // 4. 添加已读标记的样式
    readReceipt: {
        fontSize: 12,
        color: '#999',
        marginRight: 8,
        marginBottom: 2,
    },
    messageBubble: {
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 20,
        maxWidth: '75%',
    },
    myMessageBubble: {
        backgroundColor: '#FFD166',
        borderBottomRightRadius: 5,
    },
    theirMessageBubble: {
        backgroundColor: '#FFF',
        borderBottomLeftRadius: 5,
    },
    messageText: {
        fontSize: 16,
        color: '#333',
    },
    inputToolbar: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 5,
        backgroundColor: 'white',
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
    },
    chatInput: {
        flex: 1,
        backgroundColor: '#f2f2f7',
        borderRadius: 20,
        paddingHorizontal: 15,
        paddingVertical: 10,
        fontSize: 16,
        maxHeight: 100,
    },
    chatSendButton: {
        marginLeft: 10,
    },
}); 
