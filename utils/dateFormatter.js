/**
 * 根据消息时间，格式化为类似微信的聊天时间戳字符串。
 * @param {Date | Timestamp} date - The date object or Firebase Timestamp to format.
 * @returns {string} The formatted timestamp string.
 */
export function formatMessageTimestamp(date) {
    const messageDate = date.toDate ? date.toDate() : new Date(date);
    const now = new Date();

    const pad = (num) => num.toString().padStart(2, '0');
    const timeStr = `${pad(messageDate.getHours())}:${pad(messageDate.getMinutes())}`;

    // 如果年份不同
    if (now.getFullYear() !== messageDate.getFullYear()) {
        return `${messageDate.getFullYear()}年${messageDate.getMonth() + 1}月${messageDate.getDate()}日 ${timeStr}`;
    }

    const startOfNow = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfMessageDate = new Date(messageDate.getFullYear(), messageDate.getMonth(), messageDate.getDate());
    
    const diffInDays = (startOfNow - startOfMessageDate) / (1000 * 60 * 60 * 24);

    // 今天
    if (diffInDays === 0) {
        return timeStr;
    }

    // 昨天
    if (diffInDays === 1) {
        return `昨天 ${timeStr}`;
    }

    // 本周内
    const nowDayOfWeek = now.getDay() === 0 ? 7 : now.getDay(); // (1=Mon, 7=Sun)
    if (diffInDays < nowDayOfWeek) {
        const weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
        return `${weekdays[messageDate.getDay()]} ${timeStr}`;
    }

    // 今年内其他时间
    return `${messageDate.getMonth() + 1}月${messageDate.getDate()}日 ${timeStr}`;
} 