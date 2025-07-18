import React from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    TouchableOpacity 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export default function ThingsToDoMenuScreen({ navigation, route }) {
    const { userId } = route.params;

    const menuItems = [
        {
            id: 'things',
            title: '未来要做的100件事',
            subtitle: '一起完成的美好愿望',
            icon: 'checkbox-outline',
            colors: ['#FF6B6B', '#FF8E53'],
            screen: 'ThingsToDo'
        },
        {
            id: 'times',
            title: '未来要做100次的事',
            subtitle: '重复的甜蜜时光',
            icon: 'refresh-outline',
            colors: ['#4ECDC4', '#44A08D'],
            screen: 'TimesToDo'
        }
    ];

    const renderMenuItem = (item) => (
        <TouchableOpacity
            key={item.id}
            style={styles.menuItem}
            onPress={() => navigation.navigate(item.screen, { userId })}
        >
            <LinearGradient colors={item.colors} style={styles.menuGradient}>
                <Ionicons name={item.icon} size={48} color="white" />
                <Text style={styles.menuTitle}>{item.title}</Text>
                <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
            </LinearGradient>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container} edges={['right', 'bottom', 'left']}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>我们的约定</Text>
            </View>
            
            <View style={styles.menuContainer}>
                {menuItems.map(renderMenuItem)}
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    header: {
        padding: 20,
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 8,
    },
    menuContainer: {
        flex: 1,
        padding: 20,
        justifyContent: 'flex-start',
        paddingTop: 40,
        gap: 20,
    },
    menuItem: {
        borderRadius: 20,
        overflow: 'hidden',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 6,
    },
    menuGradient: {
        padding: 30,
        alignItems: 'center',
        minHeight: 160,
        justifyContent: 'center',
    },
    menuTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: 'white',
        marginTop: 15,
        textAlign: 'center',
    },
    menuSubtitle: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.8)',
        marginTop: 8,
        textAlign: 'center',
    },
});
