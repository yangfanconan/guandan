/**
 * 斗地主存储模块
 * 负责对局状态、战绩记录的存储
 */

const Storage = (function() {
    'use strict';

    const STORAGE_KEYS = {
        GAME_STATE: 'guandan_game_state',
        STATS: 'guandan_stats',
        SETTINGS: 'guandan_settings'
    };

    let isCordova = false;

    function init() {
        isCordova = typeof cordova !== 'undefined';
        if (isCordova) {
            document.addEventListener('deviceready', function() {
                console.log('Cordova storage ready');
            });
        }
    }

    function save(key, data) {
        try {
            const json = JSON.stringify(data);
            if (typeof localStorage !== 'undefined') {
                localStorage.setItem(key, json);
            }
            return true;
        } catch (e) {
            console.error('存储失败:', e);
            return false;
        }
    }

    function load(key) {
        try {
            if (typeof localStorage !== 'undefined') {
                const json = localStorage.getItem(key);
                return json ? JSON.parse(json) : null;
            }
        } catch (e) {
            console.error('加载失败:', e);
            return null;
        }
    }

    function remove(key) {
        try {
            if (typeof localStorage !== 'undefined') {
                localStorage.removeItem(key);
            }
            return true;
        } catch (e) {
            return false;
        }
    }

    function saveGameState(state) {
        return save(STORAGE_KEYS.GAME_STATE, {
            wanJia1Pai: state.wanJia1Pai,
            ai1Pai: state.ai1Pai,
            ai2Pai: state.ai2Pai,
            ai3Pai: state.ai3Pai,
            diZhu: state.diZhu,
            jiPai: state.jiPai,
            beiShu: state.beiShu,
            zhaDanShu: state.zhaDanShu,
            timestamp: Date.now()
        });
    }

    function loadGameState() {
        return load(STORAGE_KEYS.GAME_STATE);
    }

    function clearGameState() {
        return remove(STORAGE_KEYS.GAME_STATE);
    }

    function loadStats() {
        const defaultStats = {
            totalGames: 0,
            wins: 0,
            losses: 0,
            touYouCount: 0,
            moYouCount: 0,
            zhaDanCount: 0,
            maxLevel: 2,
            winStreak: 0,
            maxWinStreak: 0
        };
        const saved = load(STORAGE_KEYS.STATS);
        return saved ? { ...defaultStats, ...saved } : defaultStats;
    }

    function saveStats(stats) {
        return save(STORAGE_KEYS.STATS, stats)
    }

    function updateStats(won, touYou, zhaDanCount, level) {
        const stats = loadStats();
        
        stats.totalGames++;
        if (touYou) {
            stats.touYouCount++;
        } else {
            stats.moYouCount++;
        }
        if (won) {
            stats.wins++;
            stats.winStreak++;
            stats.maxWinStreak = Math.max(stats.maxWinStreak, stats.winStreak);
        } else {
            stats.losses++;
            stats.winStreak = 0;
        }
        
        stats.zhaDanCount += zhaDanCount;
        stats.maxLevel = Math.max(stats.maxLevel, level);
        
        saveStats(stats);
        return stats;
    }

    function clearStats() {
        return remove(STORAGE_KEYS.STATS)
    }

    function loadSettings() {
        const defaultSettings = {
            theme: 'jianghuai',
            soundEnabled: true,
            nanDu: 2,
            gongPaiEnabled: true
        };
        const saved = load(STORAGE_KEYS.SETTINGS);
        return saved ? { ...defaultSettings, ...saved } : defaultSettings;
    }

    function saveSettings(settings) {
        return save(STORAGE_KEYS.SETTINGS, settings);
    }

    return {
        init,
        save,
        load,
        remove,
        saveGameState,
        loadGameState,
        clearGameState,
        loadStats,
        saveStats,
        updateStats,
        clearStats,
        loadSettings,
        saveSettings
    };
})();

if (typeof module !== 'undefined' && module.exports) {
    module.exports = Storage
}
