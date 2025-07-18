import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, Dimensions, Platform, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { db } from '../firebaseConfig';
import { doc, onSnapshot } from "firebase/firestore";

const widgets = [
  { id: 'chat', title: '悄悄话', icon: 'chatbubble-ellipses-outline', colors: ['#FFD166', '#FFB347'], screen: 'Chat' },
  { id: 'calendar', title: '纪念日', icon: 'calendar-outline', colors: ['#FFD166', '#FF9F43'], screen: 'Calendar' },
  { id: 'todos', title: '我们的约定', icon: 'checkbox-outline', colors: ['#FFD166', '#F0932B'], screen: 'ThingsToDo' },
  { id: 'settings', title: '设置', icon: 'settings-outline', colors: ['#FFD166', '#E67E22'], screen: 'Settings' },
];

const numColumns = 2;
const screenWidth = Dimensions.get('window').width;
const widgetSize = (screenWidth - 20 * (numColumns + 1)) / numColumns;

const Widget = ({ item, onPress }) => {
  const [isPressed, setIsPressed] = useState(false);

  const containerStyle = [
    styles.widgetContainer,
    isPressed ? styles.widgetPressed : styles.widgetNotPressed,
  ];

  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => setIsPressed(true)}
      onPressOut={() => setIsPressed(false)}
      style={containerStyle}
    >
      <LinearGradient colors={item.colors} style={styles.widget}>
        <Ionicons name={item.icon} size={widgetSize * 0.4} color="#333" />
        <Text style={styles.widgetTitle}>{item.title}</Text>
      </LinearGradient>
    </Pressable>
  );
};

export default function HomeScreen({ navigation, route }) {
  const { userId } = route.params;
  const [shoutout, setShoutout] = useState('今天也是想你的一天...');

  useEffect(() => {
    if (userId) {
      const userDocRef = doc(db, "users", userId);
      const unsubscribe = onSnapshot(userDocRef, (doc) => {
        if (doc.exists() && doc.data().shoutout) {
          setShoutout(doc.data().shoutout);
        } else {
          setShoutout('今天也是想你的一天...');
        }
      });
      return () => unsubscribe(); // Cleanup listener on unmount
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
      <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
        <View style={styles.header}>
            <Ionicons name="person-circle" size={44} color="#4E4E4E" />
            <View style={styles.headerText}>
                <Text style={styles.headerTitle}>{shoutout}</Text>
                <Text style={styles.headerSubtitle}>♡ 来自宝宝</Text>
            </View>
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
    backgroundColor: '#FFF8E1', // Soft yellow background
  },
  header: {
    paddingTop: 70,
    paddingBottom: 20,
    paddingHorizontal: 25,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerText: {
    marginLeft: 15,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#4E4E4E',
    fontFamily: Platform.OS === 'ios' ? 'Avenir-Heavy' : 'sans-serif-condensed',
  },
  headerSubtitle: {
    fontSize: 18,
    color: '#FF6B6B',
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
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#333',
  },
  widgetNotPressed: {
    shadowColor: '#000',
    shadowOffset: { width: 5, height: 5 },
    shadowOpacity: 1,
    shadowRadius: 0,
    transform: [{ translateX: -2 }, { translateY: -2 }],
  },
  widgetPressed: {
    transform: [{ translateX: 0 }, { translateY: 0 }],
  },
  widget: {
    flex: 1,
    borderRadius: 28, // a bit less than container to show the border
    justifyContent: 'center',
    alignItems: 'center',
    padding: 15,
  },
  widgetTitle: {
    color: '#333',
    fontWeight: 'bold',
    fontSize: 18,
    marginTop: 10,
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'Avenir-Heavy' : 'sans-serif-condensed',
  },
}); 