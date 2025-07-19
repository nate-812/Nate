import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

export default function MoodCalendarScreen({ route }) {
    const { userId } = route.params;
    const [currentDate, setCurrentDate] = useState(new Date());
    
    // 获取当前月份信息
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const today = new Date();
    
    // 月份名称
    const monthNames = [
        '一月', '二月', '三月', '四月', '五月', '六月',
        '七月', '八月', '九月', '十月', '十一月', '十二月'
    ];
    
    // 星期名称
    const weekDays = ['日', '一', '二', '三', '四', '五', '六'];
    
    // 获取月份第一天和最后一天
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    // 生成日历数据
    const generateCalendarDays = () => {
        const days = [];
        
        // 添加上个月的空白天数
        for (let i = 0; i < startingDayOfWeek; i++) {
            days.push(null);
        }
        
        // 添加当月的天数
        for (let day = 1; day <= daysInMonth; day++) {
            days.push(day);
        }
        
        return days;
    };
    
    const calendarDays = generateCalendarDays();
    
    // 切换月份
    const changeMonth = (direction) => {
        const newDate = new Date(currentDate);
        newDate.setMonth(month + direction);
        setCurrentDate(newDate);
    };
    
    // 检查是否是今天
    const isToday = (day) => {
        return day && 
               year === today.getFullYear() && 
               month === today.getMonth() && 
               day === today.getDate();
    };
    
    // 渲染日期格子
    const renderDay = (day, index) => {
        if (!day) {
            return <View key={index} style={styles.emptyDay} />;
        }
        
        const isCurrentDay = isToday(day);
        
        return (
            <TouchableOpacity 
                key={index} 
                style={[styles.dayContainer, isCurrentDay && styles.todayContainer]}
                onPress={() => {/* TODO: 添加心情记录功能 */}}
            >
                {isCurrentDay ? (
                    <LinearGradient
                        colors={['#C7A2FF', '#E6E6FA']}
                        style={styles.todayGradient}
                    >
                        <Text style={styles.todayText}>{day}</Text>
                    </LinearGradient>
                ) : (
                    <Text style={styles.dayText}>{day}</Text>
                )}
                
                {/* 心情指示器 - 暂时用随机颜色模拟 */}
                {Math.random() > 0.7 && (
                    <View style={[
                        styles.moodIndicator,
                        { backgroundColor: ['#FF6B9D', '#4ECDC4', '#FF8C42', '#9F7AEA', '#27AE60'][Math.floor(Math.random() * 5)] }
                    ]} />
                )}
            </TouchableOpacity>
        );
    };
    
    return (
        <View style={styles.container}>
            {/* 月份导航 */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => changeMonth(-1)} style={styles.navButton}>
                    <Ionicons name="chevron-back" size={24} color="#666" />
                </TouchableOpacity>
                
                <Text style={styles.monthTitle}>
                    {year}年 {monthNames[month]}
                </Text>
                
                <TouchableOpacity onPress={() => changeMonth(1)} style={styles.navButton}>
                    <Ionicons name="chevron-forward" size={24} color="#666" />
                </TouchableOpacity>
            </View>
            
            {/* 星期标题 */}
            <View style={styles.weekHeader}>
                {weekDays.map((day, index) => (
                    <View key={index} style={styles.weekDayContainer}>
                        <Text style={styles.weekDayText}>{day}</Text>
                    </View>
                ))}
            </View>
            
            {/* 日历网格 */}
            <ScrollView style={styles.calendarContainer}>
                <View style={styles.calendarGrid}>
                    {calendarDays.map((day, index) => renderDay(day, index))}
                </View>
                
                {/* 心情图例 */}
                <View style={styles.legendContainer}>
                    <Text style={styles.legendTitle}>心情图例</Text>
                    <View style={styles.legendGrid}>
                        {[
                            { color: '#FF6B9D', mood: '开心', icon: 'happy-outline' },
                            { color: '#4ECDC4', mood: '平静', icon: 'leaf-outline' },
                            { color: '#FF8C42', mood: '兴奋', icon: 'flash-outline' },
                            { color: '#9F7AEA', mood: '思考', icon: 'bulb-outline' },
                            { color: '#27AE60', mood: '满足', icon: 'checkmark-circle-outline' }
                        ].map((item, index) => (
                            <View key={index} style={styles.legendItem}>
                                <View style={[styles.legendColor, { backgroundColor: item.color }]}>
                                    <Ionicons name={item.icon} size={16} color="white" />
                                </View>
                                <Text style={styles.legendText}>{item.mood}</Text>
                            </View>
                        ))}
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f2f2f7',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 15,
        backgroundColor: 'white',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    navButton: {
        padding: 10,
    },
    monthTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
    },
    weekHeader: {
        flexDirection: 'row',
        backgroundColor: 'white',
        paddingVertical: 10,
    },
    weekDayContainer: {
        flex: 1,
        alignItems: 'center',
    },
    weekDayText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#666',
    },
    calendarContainer: {
        flex: 1,
        backgroundColor: 'white',
        margin: 10,
        borderRadius: 15,
        padding: 10,
    },
    calendarGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    dayContainer: {
        width: (width - 60) / 7,
        height: (width - 60) / 7,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
        marginBottom: 5,
    },
    emptyDay: {
        width: (width - 60) / 7,
        height: (width - 60) / 7,
    },
    todayContainer: {
        borderRadius: 8,
    },
    todayGradient: {
        width: '90%',
        height: '90%',
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    dayText: {
        fontSize: 16,
        color: '#333',
        fontWeight: '500',
    },
    todayText: {
        fontSize: 16,
        color: 'white',
        fontWeight: 'bold',
    },
    moodIndicator: {
        position: 'absolute',
        bottom: 5,
        right: 5,
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    legendContainer: {
        marginTop: 20,
        padding: 15,
        backgroundColor: '#f8f9fa',
        borderRadius: 10,
    },
    legendTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 10,
    },
    legendGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '48%',
        marginBottom: 8,
    },
    legendColor: {
        width: 24,
        height: 24,
        borderRadius: 12,
        marginRight: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    legendText: {
        fontSize: 14,
        color: '#666',
    },
});
