# 🃏 掼蛋 Guandan

[中文](#中文) | [English](#english)

---

## 中文

### 游戏简介

掼蛋是一种流行于中国江苏、安徽等地的扑克牌游戏，由两副扑克牌组成，四人参与，两两结对进行对抗。本游戏完整实现了掼蛋的核心规则，支持人机对战。

### 游戏截图

> 📸 截图位置预留 - 可添加游戏界面截图

### 功能特性

- ✅ **完整规则** - 支持所有掼蛋牌型（单张、对子、三张、顺子、连对、飞机、炸弹、同花顺、火箭等）
- ✅ **升级系统** - 胜利后自动升级，支持双下3级、单下2级、平打1级
- ✅ **AI对战** - 3种难度（简单/中等/困难），AI具有团队配合逻辑
- ✅ **双主题** - 江淮风格 + 简约风格
- ✅ **音效** - Web Audio API 生成的音效
- ✅ **响应式** - 适配手机和桌面浏览器
- ✅ **离线** - 无需联网，本地运行
- ✅ **跨平台** - 支持 Web 和 Android

### 运行方式

#### 方式一：在线体验
直接访问 GitHub Pages（如有部署）

#### 方式二：本地浏览器运行
```bash
# 克隆项目
git clone https://github.com/yangfanconan/guandan.git
cd guandan

# 安装依赖（可选）
npm install

# 启动本地服务器
npx http-server www -p 8082

# 打开浏览器访问 http://localhost:8082
```

#### 方式三：Android APK
下载 `releases/` 目录下的 APK 文件直接安装

### 游戏规则

#### 基本设置
- **牌数**：两副扑克牌，共108张（含4张大小王）
- **人数**：4人，两两结对（南-北为一队，东-西为一队）
- **级牌**：从2开始，胜利后升级，最高到A

#### 牌型说明
| 牌型 | 描述 | 示例 |
|------|------|------|
| 单张 | 任意一张牌 | 3 |
| 对子 | 两张相同点数 | 33 |
| 三张 | 三张相同点数 | 333 |
| 三带二 | 三张+对子 | 33344 |
| 顺子 | 5张或以上连续单张 | 34567 |
| 连对 | 3对或以上连续对子 | 334455 |
| 飞机 | 连续三张+翅膀 | 33344456 |
| 炸弹 | 4-6张相同点数 | 3333 |
| 同花顺 | 同花色顺子 | ♥34567 |
| 火箭 | 4个王 | 🃏🃏👑👑 |

#### 牌型大小
1. **普通牌型**：A > K > Q > ... > 3 > 2（级牌除外）
2. **级牌**：当局级牌比A大，仅次于王
3. **炸弹**：张数越多越大，同张数比点数
4. **火箭**：最大，可压任何牌

#### 升级规则
| 情况 | 升级数 |
|------|--------|
| 双下（对手获一二名） | +3级 |
| 单下（对手获一名一末） | +2级 |
| 平打（各获一名） | +1级 |

### 技术栈

- **前端**：HTML5 Canvas + ES6+ JavaScript + CSS3
- **音频**：Web Audio API
- **打包**：Cordova
- **存储**：LocalStorage

### 项目结构
```
guandan/
├── index.html              # 主页面
├── css/style.css           # 样式文件
├── js/
│   ├── gameRules.js        # 游戏规则引擎
│   ├── aiLogic.js          # AI出牌逻辑
│   ├── teamLogic.js        # 组队结算逻辑
│   ├── cardUI.js           # Canvas渲染
│   ├── storage.js          # 本地存储
│   ├── sound.js            # 音效管理
│   └── main.js             # 主程序入口
├── www/                    # Cordova Web资源
├── config.xml              # Cordova配置
└── releases/               # APK发布文件
```

### 浏览器支持

| 浏览器 | 版本 |
|--------|------|
| Chrome | 80+ |
| Firefox | 75+ |
| Safari | 13+ |
| Edge | 80+ |
| Android WebView | 8.0+ |

---

## English

### Introduction

Guandan (掼蛋) is a popular Chinese card game originating from Jiangsu and Anhui provinces. It uses two standard decks of cards (108 cards total including 4 jokers) with 4 players forming 2 teams. This implementation features complete Guandan rules with AI opponents.

### Screenshots

> 📸 Screenshot placeholder - Game interface screenshots can be added here

### Features

- ✅ **Complete Rules** - All card types supported (single, pair, triple, straight, consecutive pairs, airplane, bomb, straight flush, rocket, etc.)
- ✅ **Level System** - Automatic level progression after winning (+1/+2/+3 levels based on game result)
- ✅ **AI Opponents** - 3 difficulty levels (Easy/Medium/Hard) with team cooperation logic
- ✅ **Dual Themes** - Jianghuai style + Simple style
- ✅ **Sound Effects** - Generated using Web Audio API
- ✅ **Responsive** - Adapts to mobile and desktop browsers
- ✅ **Offline** - Runs locally without internet
- ✅ **Cross-Platform** - Supports Web and Android

### How to Run

#### Option 1: Online Demo
Visit GitHub Pages directly (if deployed)

#### Option 2: Local Browser
```bash
# Clone the project
git clone https://github.com/yangfanconan/guandan.git
cd guandan

# Install dependencies (optional)
npm install

# Start local server
npx http-server www -p 8082

# Open browser at http://localhost:8082
```

#### Option 3: Android APK
Download the APK file from `releases/` folder and install directly

### Game Rules

#### Basic Setup
- **Cards**: Two decks, 108 cards total (including 4 jokers)
- **Players**: 4 players in 2 teams (North-South vs East-West)
- **Level Card**: Starts at 2, progresses after winning, max at A

#### Card Types
| Type | Description | Example |
|------|-------------|---------|
| Single | Any single card | 3 |
| Pair | Two cards of same rank | 33 |
| Triple | Three cards of same rank | 333 |
| Triple+Pair | Triple + a pair | 33344 |
| Straight | 5+ consecutive singles | 34567 |
| Consecutive Pairs | 3+ consecutive pairs | 334455 |
| Airplane | Consecutive triples + wings | 33344456 |
| Bomb | 4-6 cards of same rank | 3333 |
| Straight Flush | Same suit straight | ♥34567 |
| Rocket | All 4 jokers | 🃏🃏👑👑 |

#### Card Ranking
1. **Normal Cards**: A > K > Q > ... > 3 > 2 (except level card)
2. **Level Card**: The current level card is higher than A, only below jokers
3. **Bomb**: More cards = higher rank; same count = compare by rank
4. **Rocket**: Highest, beats everything

#### Level Progression
| Situation | Levels Gained |
|-----------|---------------|
| Double Down (opponents get 1st & 2nd) | +3 |
| Single Down (opponents get 1st & 4th) | +2 |
| Draw (each team gets one 1st) | +1 |

### Tech Stack

- **Frontend**: HTML5 Canvas + ES6+ JavaScript + CSS3
- **Audio**: Web Audio API
- **Packaging**: Cordova
- **Storage**: LocalStorage

### Project Structure
```
guandan/
├── index.html              # Main HTML
├── css/style.css           # Styles
├── js/
│   ├── gameRules.js        # Game rules engine
│   ├── aiLogic.js          # AI logic
│   ├── teamLogic.js        # Team scoring
│   ├── cardUI.js           # Canvas rendering
│   ├── storage.js          # Local storage
│   ├── sound.js            # Sound manager
│   └── main.js             # Main entry
├── www/                    # Cordova web assets
├── config.xml              # Cordova config
└── releases/               # APK releases
```

### Browser Support

| Browser | Version |
|---------|---------|
| Chrome | 80+ |
| Firefox | 75+ |
| Safari | 13+ |
| Edge | 80+ |
| Android WebView | 8.0+ |

---

## License / 许可证

MIT License

---

## Contributing / 贡献

Issues and Pull Requests are welcome!

欢迎提交 Issue 和 Pull Request！

---

Made with ❤️ by [yangfanconan](https://github.com/yangfanconan)
