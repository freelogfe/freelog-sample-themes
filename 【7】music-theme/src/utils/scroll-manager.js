/**
 * 全局滚动管理器
 * 解决多个组件监听同一滚动容器的冲突问题
 */
class ScrollManager {
  constructor() {
    this.listeners = new Map(); // 存储监听器
    this.scrollElement = null;
    this.isListening = false;
    this.handleScroll = this.handleScroll.bind(this);
  }

  /**
   * 初始化滚动容器
   */
  init() {
    if (!this.scrollElement) {
      this.scrollElement = document.getElementById("app");
    }
  }

  /**
   * 添加滚动监听器
   * @param {string} key - 唯一标识符（通常是组件名）
   * @param {Function} handler - 处理函数
   */
  addListener(key, handler) {
    this.init();

    // 存储监听器
    this.listeners.set(key, handler);

    // 如果是第一个监听器，开始监听滚动
    if (!this.isListening && this.scrollElement) {
      this.scrollElement.addEventListener("scroll", this.handleScroll);
      this.isListening = true;
      console.log("📺 滚动监听已启动");
    }

    console.log(`✅ 添加滚动监听器: ${key}`);
  }

  /**
   * 移除滚动监听器
   * @param {string} key - 唯一标识符
   */
  removeListener(key) {
    this.listeners.delete(key);
    console.log(`❌ 移除滚动监听器: ${key}`);

    // 如果没有监听器了，停止监听滚动
    if (this.listeners.size === 0 && this.isListening && this.scrollElement) {
      this.scrollElement.removeEventListener("scroll", this.handleScroll);
      this.isListening = false;
      console.log("⏹️ 滚动监听已停止");
    }
  }

  /**
   * 统一的滚动处理函数
   */
  handleScroll(event) {
    // 调用所有注册的监听器
    this.listeners.forEach((handler, key) => {
      try {
        handler(event);
      } catch (error) {
        console.error(`滚动处理器错误 [${key}]:`, error);
      }
    });
  }

  /**
   * 获取当前活跃的监听器数量
   */
  getListenerCount() {
    return this.listeners.size;
  }

  /**
   * 获取活跃监听器列表
   */
  getActiveListeners() {
    return Array.from(this.listeners.keys());
  }
}

// 导出单例实例
export const scrollManager = new ScrollManager();
