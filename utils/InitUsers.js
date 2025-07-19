import AuthService from '../services/AuthService';
import DatabaseService from '../services/DatabaseService';

export const createUsers = async () => {
  try {
    console.log('开始创建用户...');
    
    // 创建用户812
    try {
      const result812 = await AuthService.signUp('812', '511511');
      console.log('用户812创建成功:', result812);
      
      // 创建用户812的个人资料
      const user812DocRef = DatabaseService.doc("users", "812");
      await DatabaseService.setDoc(user812DocRef, {
        name: '宝宝812',
        birthday: '1995-08-12',
        shoutout: '今天也是想你的一天...',
        createdAt: new Date().toISOString()
      });
      console.log('用户812资料创建成功');
      
    } catch (error) {
      console.log('用户812创建结果:', error.message);
    }

    // 创建用户917  
    try {
      const result917 = await AuthService.signUp('917', '511511');
      console.log('用户917创建成功:', result917);
      
      // 创建用户917的个人资料
      const user917DocRef = DatabaseService.doc("users", "917");
      await DatabaseService.setDoc(user917DocRef, {
        name: '宝宝917',
        birthday: '1995-09-17',
        shoutout: '每天都想抱抱你~',
        createdAt: new Date().toISOString()
      });
      console.log('用户917资料创建成功');
      
    } catch (error) {
      console.log('用户917创建结果:', error.message);
    }

  } catch (error) {
    console.error('创建用户过程出错:', error);
  }
};
