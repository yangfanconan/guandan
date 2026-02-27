/**
 * 掼蛋主程序
 * 整合所有模块，管理游戏流程
 */

(function() {
    'use strict';

    // 游戏状态
    let gameState = {
        phase: 'idle',
        wanJiaPai: [],
        ai1Pai: [],
        ai2Pai: [],
        ai3Pai: [],
        jiPai: 2,
        currentChuPaiZhe: 0,
        shangJiaChuPai: null,
        shangJiaPaiXing: null,
        selectedPai: [],
        zhaDanShu: 0,
        youCiList: [],
        passCount: 0
    };

    let settings = {
        theme: 'jianghuai',
        soundEnabled: true,
        nanDu: 2,
        jiPai: 2
    };

    function init() {
        Storage.init();
        SoundManager.init();
        
        if (!CardUI.init('game-container')) {
            console.error('UI初始化失败');
            return;
        }
        
        loadSettings();
        bindEvents();
        showStartScreen();
    }

    function loadSettings() {
        const saved = Storage.loadSettings();
        settings = { ...settings, ...saved };
        
        CardUI.setTheme(settings.theme);
        SoundManager.setEnabled(settings.soundEnabled);
        SoundManager.setStyle(settings.theme);
        AILogic.sheZhiNanDu(settings.nanDu);
        GameRules.sheZhiJiPai(settings.jiPai || 2);
        
        updateSettingsUI();
    }

    function updateSettingsUI() {
        const themeSelect = document.getElementById('theme-select');
        const soundBtn = document.getElementById('sound-btn');
        const nanDuSelect = document.getElementById('difficulty-select');
        const jiPaiDisplay = document.getElementById('jipai-display');
        
        if (themeSelect) themeSelect.value = settings.theme;
        if (nanDuSelect) nanDuSelect.value = settings.nanDu;
        if (soundBtn) {
            soundBtn.classList.toggle('active', settings.soundEnabled);
            soundBtn.textContent = settings.soundEnabled ? '🔊' : '🔇';
        }
        if (jiPaiDisplay) {
            jiPaiDisplay.textContent = `打${GameRules.huoQuJiPaiMingCheng(GameRules.dangQianJiPai)}`;
        }
    }

    function showStartScreen() {
        gameState.phase = 'idle';
        CardUI.clear();
        CardUI.drawTable();
        
        const modal = document.getElementById('start-modal');
        if (modal) modal.classList.remove('hidden');
        
        const stats = Storage.loadStats();
        updateStatsDisplay(stats);
    }

    function updateStatsDisplay(stats) {
        document.getElementById('stat-total').textContent = stats.totalGames;
        document.getElementById('stat-wins').textContent = stats.wins;
        document.getElementById('stat-winrate').textContent = 
            stats.totalGames > 0 ? Math.round(stats.wins / stats.totalGames * 100) + '%' : '0%';
        document.getElementById('stat-maxlevel').textContent = 
            `打${GameRules.huoQuJiPaiMingCheng(stats.maxLevel)}级`;
    }

    function startGame() {
        const modal = document.getElementById('start-modal');
        if (modal) modal.classList.add('hidden');
        
        const faPaiJieGuo = GameRules.faPai();
        
        gameState = {
            phase: 'playing',
            wanJiaPai: GameRules.paiXu(faPaiJieGuo.wanJia1Pai),
            ai1Pai: GameRules.paiXu(faPaiJieGuo.ai1Pai),
            ai2Pai: GameRules.paiXu(faPaiJieGuo.ai2Pai),
            ai3Pai: GameRules.paiXu(faPaiJieGuo.ai3Pai),
            jiPai: settings.jiPai || 2,
            currentChuPaiZhe: TeamLogic.WEI_ZHI.NAN,
            shangJiaChuPai: null,
            shangJiaPaiXing: null,
            benLunChuPai: { 0: null, 1: null, 2: null, 3: null },
            selectedPai: [],
            zhaDanShu: 0,
            youCiList: [],
            passCount: 0
        };
        
        GameRules.sheZhiJiPai(gameState.jiPai);
        
        render();
        
        if (gameState.currentChuPaiZhe !== TeamLogic.WEI_ZHI.NAN) {
            setTimeout(aiChuPai, 800);
        }
    }

    function aiChuPai() {
        if (gameState.phase !== 'playing') return;
        const playerIndex = gameState.currentChuPaiZhe;
        const handKey = ['wanJiaPai', 'ai1Pai', 'ai2Pai', 'ai3Pai'][playerIndex];
        const shiDuiYou = TeamLogic.shiFouDuiYou(playerIndex, gameState.currentChuPaiZhe);
        
        const result = AILogic.xuanZeChuPai(
            gameState[handKey],
            gameState.shangJiaPaiXing,
            shiDuiYou,
            gameState
        );
        
        if (result.guo) {
            gameState.benLunChuPai[playerIndex] = 'pass';
            SoundManager.play('pass');
            showToast(`${TeamLogic.huoQuWeiZhiMingCheng(playerIndex)} 不出`);
            xiaYiGeChuPai();
            return;
        }
        
        zhiXingChuPai(playerIndex, result.pai, GameRules.jieXiPaiXing(result.pai));
    }

    function gameOver() {
        gameState.phase = 'result';
        
        const result = TeamLogic.jiSuanJieGuo(gameState.youCiList, gameState.jiPai, gameState.zhaDanShu);
        const won = result.duiWu1HuoSheng;
        
        if (won) {
            settings.jiPai = result.xinJiPai;
            GameRules.sheZhiJiPai(settings.jiPai);
            Storage.saveSettings(settings);
        }
        
        const stats = Storage.updateStats(won, result.shengJiShu, gameState.zhaDanShu);
        
        setTimeout(() => {
            if (won) {
                SoundManager.play('win');
            } else {
                SoundManager.play('lose');
            }
            
            const modal = document.getElementById('result-modal');
            const titleEl = document.getElementById('result-title');
            const infoEl = document.getElementById('result-info');
            
            if (titleEl) {
                titleEl.textContent = won ? '🎉 恭喜获胜！' : '很遗憾，再接一局!';
            }
            
            if (infoEl) {
                const jiPaiName = GameRules.huoQuJiPaiMingCheng(result.xinJiPai);
                infoEl.innerHTML = `
                    头游: ${TeamLogic.huoQuWeiZhiMingCheng(result.touYou)}<br>
                    升级: +${result.shengJiShu}级<br>
                    当前级别: 打${jiPaiName}<br>
                    炸弹: ${gameState.zhaDanShu}个
                `;
            }
            
            if (modal) modal.classList.remove('hidden');
            
            updateSettingsUI();
            updateStatsDisplay(stats);
        }, 500);
    }

    function showBombEffect(type) {
        const container = document.getElementById('game-container');
        if (!container) return;
        const effect = document.createElement('div');
        effect.className = 'bomb-effect';
        effect.innerHTML = type === 'rocket' ? '🚀' : '💥';
        container.appendChild(effect);
        setTimeout(() => effect.remove(), 1000);
    }
    
    function showToast(message) {
        let toast = document.getElementById('toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'toast';
            toast.className = 'toast';
            document.body.appendChild(toast);
        }
        toast.textContent = message;
        toast.classList.remove('hidden');
        setTimeout(() => {
            toast.classList.add('hidden');
        }, 1500);
    }
    
    function bindEvents() {
        const container = document.getElementById('game-container');
        if (container) {
            container.addEventListener('click', handleCanvasClick);
            container.addEventListener('touchstart', handleCanvasTouch, { passive: false });
        }
        
        document.getElementById('start-btn').addEventListener('click', startGame);
        document.getElementById('play-btn').addEventListener('click', chuPai);
        document.getElementById('pass-btn').addEventListener('click', guoPai);
        document.getElementById('hint-btn').addEventListener('click', tiShi);
        
        document.getElementById('settings-btn').addEventListener('click', () => {
            document.getElementById('settings-modal').classList.toggle('hidden');
        });
        
        document.getElementById('theme-select').addEventListener('change', (e) => {
            settings.theme = e.target.value;
            CardUI.setTheme(settings.theme);
            SoundManager.setStyle(settings.theme);
            Storage.saveSettings(settings);
            render();
        });
        
        document.getElementById('difficulty-select').addEventListener('change', (e) => {
            settings.nanDu = parseInt(e.target.value);
            AILogic.sheZhiNanDu(settings.nanDu);
            Storage.saveSettings(settings);
        });
        
        document.getElementById('sound-btn').addEventListener('click', () => {
            settings.soundEnabled = SoundManager.toggle();
            document.getElementById('sound-btn').textContent = settings.soundEnabled ? '🔊' : '🔇';
            Storage.saveSettings(settings);
        });
        
        document.getElementById('play-again-btn').addEventListener('click', () => {
            document.getElementById('result-modal').classList.add('hidden');
            startGame();
        });
        
        document.getElementById('back-menu-btn').addEventListener('click', () => {
            document.getElementById('result-modal').classList.add('hidden');
            showStartScreen();
        });
        
        document.querySelector('.close-settings-btn').addEventListener('click', () => {
            document.getElementById('settings-modal').classList.add('hidden');
        });
        
        window.addEventListener('resize', () => {
            CardUI.resize();
            if (gameState.phase !== 'idle') {
                render();
            }
        });
    }
    
    function handleCanvasClick(e) {
        if (gameState.phase !== 'playing' || gameState.currentChuPaiZhe !== TeamLogic.WEI_ZHI.NAN) return;
        const rect = e.target.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        togglePaiSelection(x, y);
    }
    
    function handleCanvasTouch(e) {
        e.preventDefault();
        if (gameState.phase !== 'playing' || gameState.currentChuPaiZhe !== TeamLogic.WEI_ZHI.NAN) return;
        const touch = e.touches[0];
        const rect = e.target.getBoundingClientRect();
        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;
        togglePaiSelection(x, y);
    }
    
    function togglePaiSelection(x, y) {
        const index = CardUI.getClickedCardIndex(x, y, gameState.wanJiaPai, gameState.selectedPai);
        if (index < 0) return;
        
        const pai = gameState.wanJiaPai[index];
        const selectedIndex = gameState.selectedPai.indexOf(pai.id);
        if (selectedIndex >= 0) {
            gameState.selectedPai.splice(selectedIndex, 1);
        } else {
            gameState.selectedPai.push(pai.id);
        }
        SoundManager.play('click');
        render();
    }
    
    function chuPai() {
        if (gameState.phase !== 'playing' || gameState.currentChuPaiZhe !== TeamLogic.WEI_ZHI.NAN) return;
        const selectedCards = gameState.wanJiaPai.filter(p => gameState.selectedPai.includes(p.id));
        if (selectedCards.length === 0) {
            showToast('请选择要出的牌');
            return;
        }
        const result = GameRules.yanZhengChuPai(selectedCards, gameState.wanJiaPai, gameState.shangJiaPaiXing);
        if (!result.valid) {
            showToast(result.reason);
            return;
        }
        zhiXingChuPai(0, selectedCards, result.paiXing);
    }
    
    function guoPai() {
        if (gameState.phase !== 'playing' || gameState.currentChuPaiZhe !== TeamLogic.WEI_ZHI.NAN) return;
        if (!gameState.shangJiaPaiXing) {
            showToast('必须出牌');
            return;
        }
        gameState.benLunChuPai[0] = 'pass';
        SoundManager.play('pass');
        showToast('不出');
        xiaYiGeChuPai();
    }
    
    function tiShi() {
        if (gameState.phase !== 'playing' || gameState.currentChuPaiZhe !== TeamLogic.WEI_ZHI.NAN) return;
        const result = AILogic.xuanZeChuPai(
            gameState.wanJiaPai,
            gameState.shangJiaPaiXing,
            false,
            gameState
        );
        if (result.guo || !result.pai) {
            showToast('没有能出的牌');
            return;
        }
        gameState.selectedPai = result.pai.map(p => p.id);
        SoundManager.play('click');
        render();
    }
    
    function zhiXingChuPai(playerIndex, cards, paiXing) {
        const handKey = ['wanJiaPai', 'ai1Pai', 'ai2Pai', 'ai3Pai'][playerIndex];
        
        cards.forEach(card => {
            const idx = gameState[handKey].findIndex(c => c.id === card.id);
            if (idx >= 0) {
                gameState[handKey].splice(idx, 1);
            }
        });
        
        gameState.shangJiaChuPai = cards;
        gameState.shangJiaPaiXing = { ...paiXing, chuPaiZhe: playerIndex };
        gameState.benLunChuPai[playerIndex] = cards;
        gameState.selectedPai = [];
        gameState.passCount = 0;
        
        if (paiXing.leiXing === GameRules.PAI_XING.ZHA_DAN || 
            paiXing.leiXing === GameRules.PAI_XING.HUO_JIAN) {
            gameState.zhaDanShu++;
            SoundManager.play(paiXing.leiXing === GameRules.PAI_XING.HUO_JIAN ? 'rocket' : 'bomb');
            showBombEffect(paiXing.leiXing === GameRules.PAI_XING.HUO_JIAN ? 'rocket' : 'bomb');
        } else {
            SoundManager.play('play');
        }
        
        if (gameState[handKey].length === 0) {
            gameState.youCiList.push(playerIndex);
            if (gameState.youCiList.length >= 2) {
                gameOver();
                return;
            }
        }
        
        render();
        xiaYiGeChuPai();
    }
    
    function xiaYiGeChuPai() {
        gameState.passCount++;
        
        if (gameState.passCount >= 3 && gameState.shangJiaChuPai) {
            let winner = gameState.shangJiaPaiXing.chuPaiZhe;
            gameState.shangJiaChuPai = null;
            gameState.shangJiaPaiXing = null;
            gameState.benLunChuPai = { 0: null, 1: null, 2: null, 3: null };
            gameState.passCount = 0;
            if (gameState.youCiList.includes(winner)) {
                let next = (winner + 1) % 4;
                let count = 0;
                while (gameState.youCiList.includes(next) && count < 4) {
                    next = (next + 1) % 4;
                    count++;
                }
                winner = next;
            }
            gameState.currentChuPaiZhe = winner;
        } else {
            let next = (gameState.currentChuPaiZhe + 1) % 4;
            let count = 0;
            while (gameState.youCiList.includes(next) && count < 4) {
                next = (next + 1) % 4;
                count++;
            }
            gameState.currentChuPaiZhe = next;
        }
        
        render();
        
        if (gameState.phase === 'playing' && gameState.currentChuPaiZhe !== TeamLogic.WEI_ZHI.NAN) {
            setTimeout(aiChuPai, 800);
        }
    }
    
    function render() {
        CardUI.clear();
        CardUI.drawTable();
        
        CardUI.drawPlayerInfo('你', gameState.wanJiaPai.length, true, 'bottom', gameState.jiPai);
        CardUI.drawPlayerInfo('西', gameState.ai1Pai.length, false, 'left', gameState.jiPai);
        CardUI.drawPlayerInfo('北(队友)', gameState.ai2Pai.length, true, 'top', gameState.jiPai);
        CardUI.drawPlayerInfo('东', gameState.ai3Pai.length, false, 'right', gameState.jiPai);
        
        if (gameState.benLunChuPai) {
            const posMap = ['bottom', 'left', 'top', 'right'];
            for (let i = 0; i < 4; i++) {
                const chuPai = gameState.benLunChuPai[i];
                if (chuPai === 'pass') {
                    CardUI.drawPassText(posMap[i]);
                } else if (chuPai) {
                    CardUI.drawPlayedCards(chuPai, posMap[i]);
                }
            }
        }
        
        if (gameState.phase === 'playing' && 
            gameState.currentChuPaiZhe === TeamLogic.WEI_ZHI.NAN && 
            !gameState.youCiList.includes(0)) {
            CardUI.drawPlayerCards(gameState.wanJiaPai, gameState.selectedPai);
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
