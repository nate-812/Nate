import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, TextInput, Button, Animated, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { GestureHandlerRootView, Swipeable } from 'react-native-gesture-handler';
import solarLunar from 'solarlunar';

import DatabaseService from '../services/DatabaseService';
import { colors, globalStyles } from '../styles/globalStyles';

const AnniversaryItem = ({ item, onDelete, onEdit }) => {
  // 格式化数字显示
  const formatNumber = (num) => {
    if (num >= 10000 && num % 10000 === 0) {
      return `${num / 10000}万`;
    }
    if (num >= 1000 && num % 1000 === 0) {
      return `${num / 1000}千`;
    }
    if (num >= 100 && num % 100 === 0) {
      return `${num / 100}百`;
    }
    return num.toString();
  };

  const calculateTimeDifference = (targetDate, isYearly = false, isLunar = false) => {
    const now = new Date();
    let target = new Date(targetDate);
    
    // 如果是农历日期且每年重复
    if (isLunar && isYearly) {
      const [year, month, day] = targetDate.split('-').map(Number);
      const currentYear = now.getFullYear();
      
      try {
        // 转换今年的农历日期为公历
        const solarDate = solarLunar.lunar2solar(currentYear, month, day);
        target = new Date(solarDate.cYear, solarDate.cMonth - 1, solarDate.cDay);
        
        // 如果今年已过，计算明年
        if (target < now) {
          const nextSolarDate = solarLunar.lunar2solar(currentYear + 1, month, day);
          target = new Date(nextSolarDate.cYear, nextSolarDate.cMonth - 1, nextSolarDate.cDay);
        }
      } catch (error) {
        console.error('农历转换失败:', error);
        // 如果转换失败，回退到普通日期处理
        target = new Date(targetDate);
        if (isYearly) {
          target.setFullYear(now.getFullYear());
          if (target < now) {
            target.setFullYear(now.getFullYear() + 1);
          }
        }
      }
    } else if (isYearly) {
      // 普通公历每年重复
      target.setFullYear(now.getFullYear());
      if (target < now) {
        target.setFullYear(now.getFullYear() + 1);
      }
    }
    
    // 计算年份差
    const yearDiff = target.getFullYear() - now.getFullYear();
    const monthDiff = target.getMonth() - now.getMonth();
    const dayDiff = target.getDate() - now.getDate();
    
    // 精确计算总月数差
    let totalMonths = yearDiff * 12 + monthDiff;
    if (dayDiff < 0) {
      totalMonths -= 1;
    }
    
    const isPast = totalMonths < 0;
    const absMonths = Math.abs(totalMonths);
    
    // 大于12个月：显示年
    if (absMonths >= 12) {
      const years = Math.floor(absMonths / 12);
      return {
        number: formatNumber(years),
        unit: isPast ? '年前' : '年后'
      };
    }
    
    // 大于4个月：显示月
    if (absMonths >= 4) {
      return {
        number: formatNumber(absMonths),
        unit: isPast ? '月前' : '月后'
      };
    }
    
    // 小于4个月：显示天
    const diffInMs = target - now;
    const diffInDays = Math.ceil(diffInMs / (1000 * 60 * 60 * 24));
    const absDays = Math.abs(diffInDays);
    
    return {
      number: formatNumber(absDays),
      unit: diffInDays < 0 ? '天前' : '天后'
    };
  };

  const timeDiff = calculateTimeDifference(item.date, item.isYearly, item.isLunar);

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
        <TouchableOpacity onPress={() => onEdit(item)}>
            <View style={styles.itemContainer}>
            <View style={styles.itemTextContainer}>
                <Text style={styles.itemTitle}>{item.title}</Text>
                <Text style={styles.itemDate}>
                  {item.note && item.note.trim() !== '' ? item.note : item.date}
                </Text>
            </View>
            <View style={styles.itemDaysContainer}>
                <Text style={styles.daysNumber}>{timeDiff.number}</Text>
                <Text style={styles.daysText}>{timeDiff.unit}</Text>
            </View>
            </View>
        </TouchableOpacity>
    </Swipeable>
  );
};

export default function CalendarScreen() {
  const [modalVisible, setModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [anniversaries, setAnniversaries] = useState([]);
  const [newName, setNewName] = useState('');
  const [newDate, setNewDate] = useState('');
  const [newNote, setNewNote] = useState('');
  const [newIsYearly, setNewIsYearly] = useState(false);
  const [newIsLunar, setNewIsLunar] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [editName, setEditName] = useState('');
  const [editDate, setEditDate] = useState('');
  const [editNote, setEditNote] = useState('');
  const [editIsYearly, setEditIsYearly] = useState(false);
  const [editIsLunar, setEditIsLunar] = useState(false);

  // Listen for real-time updates
  useEffect(() => {
    const loadAnniversaries = async () => {
      try {
        const docRef = DatabaseService.doc("anniversaries", "812_917");
        const doc = await DatabaseService.getDoc(docRef);
        
        if (doc && doc.data && doc.data.items) {
          const anniversariesData = doc.data.items.map((item, index) => ({
            ...item,
            id: item.id || `anniversary_${index}`
          }));
          
          // 手动排序：有 createdAt 的按时间排序，没有的放在前面
          anniversariesData.sort((a, b) => {
            if (!a.createdAt && !b.createdAt) return 0;
            if (!a.createdAt) return -1; // 旧数据放前面
            if (!b.createdAt) return 1;
            return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          });
          
          setAnniversaries(anniversariesData);
        } else {
          setAnniversaries([]);
        }
      } catch (error) {
        console.error("加载纪念日失败:", error);
        setAnniversaries([]);
      }
    };

    loadAnniversaries();
  }, []);

  // 验证日期格式的函数
  const validateDate = (dateString) => {
    // 检查格式是否为 YYYY-MM-DD，年份不能以0开头
    const dateRegex = /^[1-9]\d{3,}-\d{2}-\d{2}$/;
    if (!dateRegex.test(dateString)) {
      return { valid: false, message: '日期格式必须为 YYYY-MM-DD，年份不能以0开头' };
    }

    // 检查日期是否有效
    const date = new Date(dateString);
    const [year, month, day] = dateString.split('-').map(Number);
    
    if (date.getFullYear() !== year || 
        date.getMonth() + 1 !== month || 
        date.getDate() !== day) {
      return { valid: false, message: '请输入有效的日期' };
    }

    return { valid: true };
  };

  const handleAddAnniversary = async () => {
    if (newName.trim() === '') {
      alert('请填写纪念日名称！');
      return;
    }

    if (newDate.trim() === '') {
      alert('请填写日期！');
      return;
    }

    // 验证日期格式
    const validation = validateDate(newDate.trim());
    if (!validation.valid) {
      alert(validation.message);
      return;
    }

    try {
      const newAnniversary = {
        id: `anniversary_${Date.now()}`,
        title: newName.trim(),
        date: newDate.trim(),
        note: newNote.trim(),
        isYearly: newIsYearly,
        isLunar: newIsLunar,
        createdAt: new Date().toISOString(),
      };

      const updatedAnniversaries = [...anniversaries, newAnniversary];
      
      const docRef = DatabaseService.doc("anniversaries", "812_917");
      await DatabaseService.setDoc(docRef, { items: updatedAnniversaries });
      
      setAnniversaries(updatedAnniversaries);
      setNewName('');
      setNewDate('');
      setNewNote('');
      setNewIsYearly(false);
      setNewIsLunar(false);
      setModalVisible(false);
    } catch (error) {
      console.error("Error adding anniversary: ", error);
      alert('添加失败，请稍后再试');
    }
  };

  const handleDeleteAnniversary = async (id) => {
    try {
      const updatedAnniversaries = anniversaries.filter(item => item.id !== id);
      
      const docRef = DatabaseService.doc("anniversaries", "812_917");
      await DatabaseService.setDoc(docRef, { items: updatedAnniversaries });
      
      setAnniversaries(updatedAnniversaries);
    } catch (error) {
      console.error("Error removing anniversary: ", error);
      alert('删除失败，请稍后再试');
    }
  };

  const handleEditAnniversary = (item) => {
    setEditingItem(item);
    setEditName(item.title);
    setEditDate(item.date);
    setEditNote(item.note || '');
    setEditIsYearly(item.isYearly || false);
    setEditIsLunar(item.isLunar || false);
    setEditModalVisible(true);
  };

  const handleUpdateAnniversary = async () => {
    if (editName.trim() === '') {
      alert('请填写纪念日名称！');
      return;
    }

    if (editDate.trim() === '') {
      alert('请填写日期！');
      return;
    }

    // 验证日期格式
    const validation = validateDate(editDate.trim());
    if (!validation.valid) {
      alert(validation.message);
      return;
    }

    try {
      const updatedAnniversaries = anniversaries.map(item => 
        item.id === editingItem.id 
          ? {
              ...item,
              title: editName.trim(),
              date: editDate.trim(),
              note: editNote.trim(),
              isYearly: editIsYearly,
              isLunar: editIsLunar,
            }
          : item
      );
      
      const docRef = DatabaseService.doc("anniversaries", "812_917");
      await DatabaseService.setDoc(docRef, { items: updatedAnniversaries });
      
      setAnniversaries(updatedAnniversaries);
      setEditModalVisible(false);
      setEditingItem(null);
      setEditName('');
      setEditDate('');
      setEditNote('');
      setEditIsYearly(false);
      setEditIsLunar(false);
    } catch (error) {
      console.error("Error updating anniversary: ", error);
      alert('更新失败，请稍后再试');
    }
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
        <View style={styles.container}>
        <FlatList
            data={anniversaries}
            renderItem={({ item }) => <AnniversaryItem item={item} onDelete={() => handleDeleteAnniversary(item.id)} onEdit={handleEditAnniversary} />}
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
                placeholder="日期 (格式：YYYY-MM-DD，如：2024-01-15)"
                value={newDate}
                onChangeText={setNewDate}
                keyboardType="default"
                maxLength={12}
                />
                <TextInput
                style={styles.input}
                placeholder="备注 (可选，如：我们第一次牵手的日子)"
                value={newNote}
                onChangeText={setNewNote}
                multiline
                maxLength={100}
                />
                <TouchableOpacity 
                style={[styles.yearlyToggle, newIsYearly && styles.yearlyToggleActive]}
                onPress={() => setNewIsYearly(!newIsYearly)}
                >
                <Text style={[styles.yearlyToggleText, newIsYearly && styles.yearlyToggleTextActive]}>
                    📅 每年重复
                </Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                style={[styles.yearlyToggle, newIsLunar && styles.yearlyToggleActive]}
                onPress={() => setNewIsLunar(!newIsLunar)}
                >
                <Text style={[styles.yearlyToggleText, newIsLunar && styles.yearlyToggleTextActive]}>
                    🌙 农历日期
                </Text>
                </TouchableOpacity>
                
                <View style={styles.buttonContainer}>
                    <Button title="取消" onPress={() => setModalVisible(false)} color="#FF6B6B" />
                    <Button title="添加" onPress={handleAddAnniversary} />
                </View>
            </View>
            </View>
        </Modal>

        {/* 编辑纪念日弹窗 */}
        <Modal
            animationType="fade"
            transparent={true}
            visible={editModalVisible}
            onRequestClose={() => setEditModalVisible(false)}
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
                <Text style={styles.modalTitle}>编辑纪念日</Text>
                <TextInput
                style={styles.input}
                placeholder="名称 (如：我们的定情日)"
                value={editName}
                onChangeText={setEditName}
                />
                <TextInput
                style={styles.input}
                placeholder="日期 (格式：YYYY-MM-DD，如：2024-01-15)"
                value={editDate}
                onChangeText={setEditDate}
                keyboardType="default"
                maxLength={12}
                />
                <TextInput
                style={styles.input}
                placeholder="备注 (可选，如：我们第一次牵手的日子)"
                value={editNote}
                onChangeText={setEditNote}
                multiline
                maxLength={100}
                />
                
                <TouchableOpacity 
                style={[styles.yearlyToggle, editIsYearly && styles.yearlyToggleActive]}
                onPress={() => setEditIsYearly(!editIsYearly)}
                >
                <Text style={[styles.yearlyToggleText, editIsYearly && styles.yearlyToggleTextActive]}>
                    📅 每年重复
                </Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                style={[styles.yearlyToggle, editIsLunar && styles.yearlyToggleActive]}
                onPress={() => setEditIsLunar(!editIsLunar)}
                >
                <Text style={[styles.yearlyToggleText, editIsLunar && styles.yearlyToggleTextActive]}>
                    🌙 农历日期
                </Text>
                </TouchableOpacity>
                
                <View style={styles.buttonContainer}>
                    <Button title="取消" onPress={() => setEditModalVisible(false)} color="#FF6B6B" />
                    <Button title="保存" onPress={handleUpdateAnniversary} />
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
    ...globalStyles.container,
  },
  backgroundLiquid: {
    ...globalStyles.backgroundLiquid,
  },
  calendarCard: {
    ...globalStyles.glassCard,
    margin: 20,
  },
  cardContent: {
    ...globalStyles.cardContent,
  },
  titleText: {
    ...globalStyles.titleText,
  },
  addButton: {
    ...globalStyles.glassButton,
    backgroundColor: colors.gradients.primary[0],
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
  },
  yearlyToggle: {
    width: '100%',
    height: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  yearlyToggleActive: {
    backgroundColor: '#4ECDC4',
    borderColor: '#4ECDC4',
  },
  yearlyToggleText: {
    fontSize: 16,
    color: '#666',
  },
  yearlyToggleTextActive: {
    color: 'white',
    fontWeight: 'bold',
  },
}); 
