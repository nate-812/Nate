import AsyncStorage from '@react-native-async-storage/async-storage';

class CloudBaseService {
  constructor() {
    this.env = 'local-development';
    this.users = new Map();
    this.collections = new Map();
    this.listeners = new Map(); // 存储监听器
    this.initUsers();
  }

  async initUsers() {
    this.users.set('user812@our-nest.com', {
      uid: 'user812',
      email: 'user812@our-nest.com',
      password: '511511'
    });
    
    this.users.set('user917@our-nest.com', {
      uid: 'user917',
      email: 'user917@our-nest.com',
      password: '511511'
    });
  }

  async signIn(email, password) {
    try {
      const user = this.users.get(email);
      if (!user || user.password !== password) {
        throw new Error('用户名或密码错误');
      }

      return {
        uid: user.uid,
        email: user.email,
        user: user
      };
    } catch (error) {
      console.error('CloudBase signIn error:', error);
      throw error;
    }
  }

  async signUp(email, password) {
    try {
      const uid = email.split('@')[0];
      const user = { uid, email, password };
      this.users.set(email, user);
      
      return {
        uid: user.uid,
        email: user.email,
        user: user
      };
    } catch (error) {
      console.error('CloudBase signUp error:', error);
      throw error;
    }
  }

  async signOut() {
    try {
      await AsyncStorage.removeItem('cloudbase_token');
    } catch (error) {
      console.error('CloudBase signOut error:', error);
      throw error;
    }
  }

  async getDoc(collection, docId) {
    try {
      const key = `doc_${collection}_${docId}`;
      const data = await AsyncStorage.getItem(key);
      return data ? { data: JSON.parse(data) } : null;
    } catch (error) {
      console.error('CloudBase getDoc error:', error);
      throw error;
    }
  }

  async setDoc(collection, docId, data) {
    try {
      const key = `doc_${collection}_${docId}`;
      await AsyncStorage.setItem(key, JSON.stringify(data));
      
      // 通知所有监听器
      this.notifyListeners(collection, docId, data);
      
      return { success: true };
    } catch (error) {
      console.error('CloudBase setDoc error:', error);
      throw error;
    }
  }

  async updateDoc(collection, docId, data) {
    try {
      const existing = await this.getDoc(collection, docId);
      const updatedData = existing ? { ...existing.data, ...data } : data;
      await this.setDoc(collection, docId, updatedData);
      return { success: true };
    } catch (error) {
      console.error('CloudBase updateDoc error:', error);
      throw error;
    }
  }

  async deleteDoc(collection, docId) {
    try {
      const key = `doc_${collection}_${docId}`;
      await AsyncStorage.removeItem(key);
      
      // 通知监听器文档被删除
      this.notifyListeners(collection, docId, null);
      
      return { success: true };
    } catch (error) {
      console.error('CloudBase deleteDoc error:', error);
      throw error;
    }
  }

  async addDoc(collection, data) {
    try {
      const docId = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      await this.setDoc(collection, docId, data);
      return { id: docId };
    } catch (error) {
      console.error('CloudBase addDoc error:', error);
      throw error;
    }
  }

  async getCollection(collection) {
    try {
      const key = `collection_${collection}`;
      const data = await AsyncStorage.getItem(key);
      return { data: data ? JSON.parse(data) : [] };
    } catch (error) {
      console.error('CloudBase getCollection error:', error);
      throw error;
    }
  }

  // 监听文档变化
  onSnapshot(docRef, callback) {
    const { collectionName, docId } = docRef;
    const key = `${collectionName}_${docId}`;
    
    // 存储监听器
    if (!this.listeners.has(key)) {
      this.listeners.set(key, []);
    }
    this.listeners.get(key).push(callback);
    
    // 立即调用一次callback，获取当前数据
    this.getDoc(collectionName, docId).then(result => {
      callback({
        exists: () => !!result,
        data: () => result ? result.data : null
      });
    }).catch(error => {
      console.error('onSnapshot initial call error:', error);
      callback({
        exists: () => false,
        data: () => null
      });
    });
    
    // 返回取消监听的函数
    return () => {
      const listeners = this.listeners.get(key);
      if (listeners) {
        const index = listeners.indexOf(callback);
        if (index > -1) {
          listeners.splice(index, 1);
        }
        if (listeners.length === 0) {
          this.listeners.delete(key);
        }
      }
    };
  }

  // 通知监听器
  notifyListeners(collection, docId, data) {
    const key = `${collection}_${docId}`;
    const listeners = this.listeners.get(key);
    
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback({
            exists: () => !!data,
            data: () => data
          });
        } catch (error) {
          console.error('Listener callback error:', error);
        }
      });
    }
  }
}

export default new CloudBaseService();
