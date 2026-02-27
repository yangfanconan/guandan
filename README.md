# 掼蛋 (Guandan Card Game)

A cross-platform Guandan card game built with HTML5 + JavaScript + CSS3.

## 游戏简介 / Introduction

掼蛋是一种流行于中国江苏、安徽等地的扑克牌游戏，由两副扑克牌组成，四人参与，两两结对进行对抗。

Guandan is a popular Chinese card game from Jiangsu and Anhui provinces. It uses two decks of cards with 4 players in teams of 2.

## 特性 / Features

- 完整的掼蛋规则 / Complete Guandan rules
- 3种AI难度 / 3 AI difficulty levels
- 双主题（江淮/简约）/ Dual themes (Jianghuai/Simple)
- 音效支持 / Sound effects
- 离线游戏 / Offline play
- 响应式设计 / Responsive design
- Android APK支持 / Android APK support

## 运行方式 / How to Run

### 浏览器运行 / Browser

```bash
# 安装依赖
npm install

# 启动开发服务器
npx http-server www -p 8082

# 打开浏览器访问
# Open browser at http://localhost:8082
```

### Android APK

直接安装 `releases/guandan-v1.0-debug.apk`

Install `releases/guandan-v1.0-debug.apk` directly

### 构建APK / Build APK

```bash
# 添加Android平台
cordova platform add android@12

# 构建APK
cordova build android

# APK位置
# platforms/android/app/build/outputs/apk/debug/app-debug.apk
```

## 游戏规则 / Game Rules

### 基本规则 / Basic Rules

1. **牌数**：两副扑克牌，共108张（含4张大小王）
2. **人数**：4人，两两结对（南-北 vs 东-西）
3. **级牌**：从2开始，胜利后升级，最高到A
4. **贡牌**：每局开始，末游向头游进贡最大的牌

### 牌型 / Card Types

- 单张 / Single
- 对子 / Pair
- 三张 / Triple
- 三带二 / Triple with Pair
- 顺子 / Straight (5+ consecutive)
- 连对 / Consecutive Pairs (3+ pairs)
- 飞机 / Airplane (2+ consecutive triples)
- 炸弹 / Bomb (4 of a kind)
- 同花顺 / Straight Flush
- 火箭 / Rocket (both jokers)

### 升级规则 / Level Progression

- 双下（对手一二名）：升3级
- 单下（对手一名一末）：升2级
- 平打（各一名）：升1级
- 过A：完成所有级别后重新开始

## 技术栈 / Tech Stack

- HTML5 Canvas
- ES6+ JavaScript
- CSS3 (CSS Variables, Flexbox)
- Web Audio API
- Cordova / Capacitor

## 项目结构 / Project Structure

```
guandan/
├── index.html          # 主页面
├── css/style.css       # 样式（双主题）
├── js/
│   ├── gameRules.js    # 游戏规则
│   ├── aiLogic.js      # AI逻辑
│   ├── teamLogic.js    # 队伍逻辑
│   ├── cardUI.js       # Canvas渲染
│   ├── storage.js      # 本地存储
│   ├── sound.js        # 音效
│   └── main.js         # 主程序
├── www/                # Cordova资源
├── res/                # 图标资源
├── config.xml          # Cordova配置
├── package.json        # 项目配置
└── releases/           # APK发布
```

## 浏览器支持 / Browser Support

- Chrome 80+
- Firefox 75+
- Safari 13+
- Android 8.0+

## 许可证 / License

MIT
