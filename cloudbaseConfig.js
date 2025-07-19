// 简化的配置文件，只导出基础服务
import CloudBaseService from './services/CloudBaseService';
import AuthService from './services/AuthService';

export { CloudBaseService as app, AuthService as auth };

// 为了避免循环依赖，DatabaseService不在这里导出
// 直接在需要的地方import DatabaseService
