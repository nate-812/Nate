import AsyncStorage from '@react-native-async-storage/async-storage';

// 创建localStorage polyfill
const localStorage = {
  getItem: (key) => {
    // 同步版本，返回null（CloudBase可能需要同步API）
    return null;
  },
  setItem: (key, value) => {
    AsyncStorage.setItem(key, value);
  },
  removeItem: (key) => {
    AsyncStorage.removeItem(key);
  },
  clear: () => {
    AsyncStorage.clear();
  },
  key: (index) => {
    return null;
  },
  get length() {
    return 0;
  }
};

// 设置全局localStorage
global.localStorage = localStorage;

export default localStorage;