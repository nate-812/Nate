import AsyncStorage from '@react-native-async-storage/async-storage';
import CloudBaseService from './CloudBaseService';

class AuthService {
  constructor() {
    this.currentUser = null;
    this.listeners = [];
  }

  async signIn(code, secretCode) {
    try {
      console.log('AuthService signIn called with:', code, secretCode);
      
      const email = `user${code}@our-nest.com`;
      const result = await CloudBaseService.signIn(email, secretCode);
      
      this.currentUser = result.user;
      this.notifyListeners(this.currentUser);
      
      console.log('AuthService signIn success:', result);
      return result;
    } catch (error) {
      console.error('AuthService signIn error:', error);
      throw error;
    }
  }

  async signOut() {
    try {
      console.log('AuthService signOut called');
      
      await CloudBaseService.signOut();
      this.currentUser = null;
      this.notifyListeners(null);
      
      console.log('AuthService signOut success');
    } catch (error) {
      console.error('AuthService signOut error:', error);
      throw error;
    }
  }

  onAuthStateChanged(callback) {
    console.log('AuthService onAuthStateChanged registered');
    
    this.listeners.push(callback);
    
    // 立即调用一次callback，传入当前用户状态
    setTimeout(() => {
      console.log('AuthService initial callback with user:', this.currentUser);
      callback(this.currentUser);
    }, 100);
    
    // 返回取消监听的函数
    return () => {
      const index = this.listeners.indexOf(callback);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  notifyListeners(user) {
    console.log('AuthService notifying listeners with user:', user);
    this.listeners.forEach(callback => {
      try {
        callback(user);
      } catch (error) {
        console.error('AuthService listener error:', error);
      }
    });
  }

  getCurrentUser() {
    return this.currentUser;
  }
}

export default new AuthService();
