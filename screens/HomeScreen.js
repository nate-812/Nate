import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, Dimensions, Platform, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import DatabaseService from '../services/DatabaseService';
// import { doc, onSnapshot } from "firebase/firestore"; // Removed

const widgets = [
  { id: 'chat', title: '悄悄话', icon: 'chatbubble-ellipses-outline', colors: ['#FF9A9E', '#FECFEF'], screen: 'Chat' },
  { id: 'calendar', title: '纪念日', icon: 'calendar-outline', colors: ['#A8EDEA', '#FED6E3'], screen: 'Calendar' },
  { id: 'todos', title: '我们的约定', icon: 'checkbox-outline', colors: ['#FFECD2', '#FCB69F'], screen: 'ThingsToDoMenu' },
  { id: 'mood', title: '心情日历', icon: 'color-palette-outline', colors: ['#C7A2FF', '#E6E6FA'], screen: 'MoodCalendar' },
];

const numColumns = 2;
const screenWidth = Dimensions.get('window').width;
const widgetSize = (screenWidth - 20 * (numColumns + 1)) / numColumns;

const Widget = ({ item, onPress }) => {
  const [isPressed, setIsPressed] = useState(false);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // 液态浮动动画
    const floatAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: 1,
          duration: 3000 + Math.random() * 2000, // 随机化动画时长
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 3000 + Math.random() * 2000,
          useNativeDriver: true,
        }),
      ])
    );
    floatAnimation.start();
    return () => floatAnimation.stop();
  }, []);

  const handlePressIn = () => {
    setIsPressed(true);
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    setIsPressed(false);
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const floatingTransform = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -8],
  });

  return (
    <Animated.View
      style={[
        styles.widgetContainer,
        {
          transform: [
            { scale: scaleAnim },
            { translateY: floatingTransform }
          ]
        }
      ]}
    >
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={styles.widgetPressable}
      >
        {Platform.OS === 'ios' ? (
          <BlurView intensity={20} tint="light" style={styles.glassContainer}>
            <LinearGradient 
              colors={[...item.colors, 'rgba(255,255,255,0.3)']} 
              style={styles.widget}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.liquidOverlay} />
              <Ionicons name={item.icon} size={widgetSize * 0.4} color="rgba(51,51,51,0.8)" />
              <Text style={styles.widgetTitle}>{item.title}</Text>
            </LinearGradient>
          </BlurView>
        ) : (
          <View style={styles.glassContainer}>
            <LinearGradient 
              colors={[...item.colors, 'rgba(255,255,255,0.4)']} 
              style={styles.widget}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.liquidOverlay} />
              <Ionicons name={item.icon} size={widgetSize * 0.4} color="rgba(51,51,51,0.8)" />
              <Text style={styles.widgetTitle}>{item.title}</Text>
            </LinearGradient>
          </View>
        )}
      </Pressable>
    </Animated.View>
  );
};

export default function HomeScreen({ navigation, route }) {
  const { userId } = route.params;
  const [shoutout, setShoutout] = useState('今天也是想你的一天...');

  useEffect(() => {
    if (userId) {
      const userDocRef = DatabaseService.doc("users", userId);
      const unsubscribe = DatabaseService.onSnapshot(userDocRef, (doc) => {
        if (doc.exists() && doc.data().shoutout) {
          setShoutout(doc.data().shoutout);
        } else {
          setShoutout('今天也是想你的一天...');
        }
      });
      return () => unsubscribe();
    }
  }, [userId]);

  const renderItem = ({ item }) => (
    <Widget
      item={item}
      onPress={() => navigation.navigate(item.screen)}
    />
  );

  return (
    <View style={styles.container}>
      {/* 背景液态效果 */}
      <View style={styles.backgroundLiquid} />
      
      <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
        <View style={styles.header}>
          {Platform.OS === 'ios' ? (
            <BlurView intensity={15} tint="light" style={styles.headerBlur}>
              <View style={styles.headerContent}>
                <Ionicons name="person-circle" size={44} color="#4E4E4E" />
                <View style={styles.headerText}>
                  <Text style={styles.headerTitle}>{shoutout}</Text>
                  <Text style={styles.headerSubtitle}>♡ 来自宝宝</Text>
                </View>
              </View>
            </BlurView>
          ) : (
            <View style={styles.headerGlass}>
              <View style={styles.headerContent}>
                <Ionicons name="person-circle" size={44} color="#4E4E4E" />
                <View style={styles.headerText}>
                  <Text style={styles.headerTitle}>{shoutout}</Text>
                  <Text style={styles.headerSubtitle}>♡ 来自宝宝</Text>
                </View>
              </View>
            </View>
          )}
        </View>
      </TouchableOpacity>
      
      <FlatList
        data={widgets}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        numColumns={numColumns}
        contentContainerStyle={styles.listContainer}
        columnWrapperStyle={styles.row}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F2F5',
  },
  backgroundLiquid: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'linear-gradient(135deg, rgba(255,154,158,0.08), rgba(168,237,234,0.08), rgba(199,162,255,0.08))',
    opacity: 0.7,
  },
  header: {
    paddingTop: 70,
    paddingBottom: 20,
    paddingHorizontal: 25,
  },
  headerBlur: {
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.25)',
    backdropFilter: 'blur(20px)',
  },
  headerGlass: {
    backgroundColor: 'rgba(255,255,255,0.45)',
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.6)',
    shadowColor: 'rgba(0,0,0,0.12)',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
  },
  headerText: {
    marginLeft: 15,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2D3748',
    fontFamily: Platform.OS === 'ios' ? 'Avenir-Heavy' : 'sans-serif-condensed',
  },
  headerSubtitle: {
    fontSize: 18,
    color: '#FF6B9D',
    marginTop: 2,
    fontFamily: Platform.OS === 'ios' ? 'Avenir-Medium' : 'sans-serif',
  },
  listContainer: {
    paddingHorizontal: 10,
  },
  row: {
    justifyContent: 'space-between',
  },
  widgetContainer: {
    width: widgetSize,
    height: widgetSize,
    margin: 10,
  },
  widgetPressable: {
    flex: 1,
    borderRadius: 32,
  },
  glassContainer: {
    flex: 1,
    borderRadius: 32,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.35)',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.5)',
    shadowColor: 'rgba(0,0,0,0.15)',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.35,
    shadowRadius: 24,
    elevation: 12,
  },
  widget: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 15,
    position: 'relative',
  },
  liquidOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 30,
  },
  widgetTitle: {
    color: 'rgba(45,55,72,0.95)',
    fontWeight: 'bold',
    fontSize: 18,
    marginTop: 10,
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'Avenir-Heavy' : 'sans-serif-condensed',
    textShadowColor: 'rgba(255,255,255,0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
}); 
