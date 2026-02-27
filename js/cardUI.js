/**
 * 掼蛋UI渲染模块
 * 负责卡牌绘制、动画效果、界面更新
 */

const CardUI = (function() {
    'use strict';

    const { PAI_ZHI, HUA_SE, getPaiMian, getHuaSeFuHao, shiHongSe, huoQuJiPaiMingCheng, shiJiPai } = GameRules;

    const { WEI_ZHI_NAME } = TeamLogic;

    let canvas = null;
    let ctx = null;
    let currentTheme = 'jianghuai';

    let cardWidth = 50;
    let cardHeight = 70;
    let cardGap = 14;

    const themes = {
        jianghuai: {
            bg: 'linear-gradient(135deg, #1a4d2e 0%, #0d3311 50%, #0a1f0a 100%)',
            tableBg: '#1a5c3a',
            tableBorder: '#c9a227',
            cardBg: '#fffef5',
            cardBorder: '#8b4513',
            cardShadow: 'rgba(0,0,0,0.4)',
            textColor: '#f5f0e6',
            redColor: '#c41e3a',
            blackColor: '#2d2d2d',
            accent: '#c9a227',
            jiPaiBg: '#ffd700'
        },
        simple: {
            bg: 'linear-gradient(135deg, #2c3e50 0%, #34495e 50%, #1a252f 100%)',
            tableBg: '#2c3e50',
            tableBorder: '#3498db',
            cardBg: '#ffffff',
            cardBorder: '#3498db',
            cardShadow: 'rgba(0,0,0,0.3)',
            textColor: '#2c3e50',
            redColor: '#e74c3c',
            blackColor: '#2c3e50',
            accent: '#3498db',
            jiPaiBg: '#f39c12'
        }
    };

    function init(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return false;

        canvas = document.createElement('canvas');
        canvas.id = 'game-canvas';
        container.appendChild(canvas);
        ctx = canvas.getContext('2d');

        resize();
        window.addEventListener('resize', resize);
        return true;
    }

    function resize() {
        const container = canvas.parentElement;
        const dpr = window.devicePixelRatio || 1;

        canvas.width = container.clientWidth * dpr;
        canvas.height = container.clientHeight * dpr;
        canvas.style.width = container.clientWidth + 'px';
        canvas.style.height = container.clientHeight + 'px';
        ctx.scale(dpr, dpr);

        const w = container.clientWidth;
        if (w < 360) {
            cardWidth = 38; cardHeight = 54; cardGap = 10;
        } else if (w < 480) {
            cardWidth = 44; cardHeight = 62; cardGap = 12;
        } else {
            cardWidth = 50; cardHeight = 70; cardGap = 14;
        }
    }

    function setTheme(theme) {
        currentTheme = theme;
        document.body.dataset.theme = theme;
    }

    function getThemeConfig() {
        return themes[currentTheme];
    }

    function roundRect(x, y, w, h, r) {
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.lineTo(x + w - r, y);
        ctx.quadraticCurveTo(x + w, y, x + w, y + r);
        ctx.lineTo(x + w, y + h - r);
        ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
        ctx.lineTo(x + r, y + h);
        ctx.quadraticCurveTo(x, y + h, x, y + h - r);
        ctx.closePath();
    }

    function drawCard(x, y, pai, options = {}) {
        const { selected = false, shiJiPaiPai = false } = options;
        const theme = getThemeConfig();
        const w = cardWidth;
        const h = cardHeight;
        const drawY = selected ? y - 18 : y;

        ctx.save();

        ctx.shadowColor = theme.cardShadow;
        ctx.shadowBlur = 6;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 3;

        ctx.fillStyle = theme.cardBg;
        roundRect(x, drawY, w, h, 4);
        ctx.fill();

        ctx.shadowColor = 'transparent';
        ctx.strokeStyle = shiJiPaiPai ? theme.jiPaiBg : theme.cardBorder;
        ctx.lineWidth = shiJiPaiPai ? 2 : 1;
        roundRect(x, drawY, w, h, 4);
        ctx.stroke();

        const isRed = shiHongSe(pai.hua);
        const color = isRed ? theme.redColor : theme.blackColor;

        ctx.fillStyle = color;
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.fillText(getPaiMian(pai.zhi), x + 3, drawY + 2);

        if (pai.zhi < PAI_ZHI.XIAO_WANG) {
            ctx.font = '12px Arial';
            ctx.fillText(getHuaSeFuHao(pai.hua), x + 3, drawY + 16);
        }

        ctx.font = '24px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        if (pai.zhi === PAI_ZHI.DA_WANG) {
            ctx.fillText('👑', x + w/2, drawY + h/2);
        } else if (pai.zhi === PAI_ZHI.XIAO_WANG) {
            ctx.fillText('🃏', x + w/2, drawY + h/2);
        } else {
            ctx.fillText(getHuaSeFuHao(pai.hua), x + w/2, drawY + h/2);
        }

        ctx.restore();
    }

    function drawPlayerCards(paiList, selectedIds = []) {
        if (!paiList || paiList.length === 0) return;

        const container = canvas.parentElement;
        const totalWidth = (paiList.length - 1) * cardGap + cardWidth;
        let startX = (container.clientWidth - totalWidth) / 2;
        const y = container.clientHeight - cardHeight - 15;
        const selectedSet = new Set(selectedIds);

        for (let i = 0; i < paiList.length; i++) {
            const pai = paiList[i];
            const isSelected = selectedSet.has(pai.id);
            const isJi = shiJiPai(pai.zhi);
            drawCard(startX + i * cardGap, y, pai, { selected: isSelected, shiJiPaiPai: isJi });
        }
    }

    function drawAICards(count, position) {
        const container = canvas.parentElement;
        const gap = 6;
        const aiCardW = cardWidth * 0.6;
        const aiCardH = cardHeight * 0.6;

        ctx.save();
        if (position === 'left') {
            ctx.translate(10 + aiCardW/2, container.clientHeight/2);
            ctx.rotate(-Math.PI/4);
            for (let i = 0; i < count; i++) {
                ctx.fillStyle = '#2e7d32';
                roundRect(-aiCardW/2, -aiCardH/2 + i*gap, aiCardW, aiCardH, 3);
                ctx.fill();
                ctx.strokeStyle = '#4caf50';
                ctx.lineWidth = 1;
                roundRect(-aiCardW/2, -aiCardH/2 + i*gap, aiCardW, aiCardH, 3);
                ctx.stroke();
            }
        } else if (position === 'right') {
            ctx.translate(container.clientWidth - 10 - aiCardW/2, container.clientHeight/2);
            ctx.rotate(Math.PI/4);
            for (let i = 0; i < count; i++) {
                ctx.fillStyle = '#2e7d32';
                roundRect(-aiCardW/2, -aiCardH/2 + i*gap, aiCardW, aiCardH, 3);
                ctx.fill();
                ctx.strokeStyle = '#4caf50';
                ctx.lineWidth = 1;
                roundRect(-aiCardW/2, -aiCardH/2 + i*gap, aiCardW, aiCardH, 3);
                ctx.stroke();
            }
        } else if (position === 'top') {
            const totalW = (count - 1) * gap + aiCardW;
            const startX = (container.clientWidth - totalW) / 2 - aiCardW/2;
            for (let i = 0; i < count; i++) {
                ctx.fillStyle = '#2e7d32';
                roundRect(startX + i*gap, 10, aiCardW, aiCardH, 3);
                ctx.fill();
                ctx.strokeStyle = '#4caf50';
                ctx.lineWidth = 1;
                roundRect(startX + i*gap, 10, aiCardW, aiCardH, 3);
                ctx.stroke();
            }
        }
        ctx.restore();
    }

    function drawPlayedCards(paiList, position) {
        if (!paiList || paiList.length === 0) return;

        const container = canvas.parentElement;
        const gap = 18;
        const playCardW = cardWidth * 0.8;
        const playCardH = cardHeight * 0.8;
        const totalWidth = (paiList.length - 1) * gap + playCardW;
        let startX, y;

        switch (position) {
            case 'bottom':
                startX = (container.clientWidth - totalWidth) / 2;
                y = container.clientHeight - cardHeight - 100;
                break;
            case 'left':
                startX = 90;
                y = container.clientHeight / 2 - playCardH / 2;
                break;
            case 'top':
                startX = (container.clientWidth - totalWidth) / 2;
                y = 90;
                break;
            case 'right':
                startX = container.clientWidth - 90 - totalWidth;
                y = container.clientHeight / 2 - playCardH / 2;
                break;
        }

        for (let i = 0; i < paiList.length; i++) {
            const scale = 0.8;
            ctx.save();
            const originalW = cardWidth;
            const originalH = cardHeight;
            cardWidth = originalW * scale;
            cardHeight = originalH * scale;
            drawCard(startX + i * gap, y, paiList[i], { selected: false });
            cardWidth = originalW;
            cardHeight = originalH;
            ctx.restore();
        }
    }

    function drawPlayerInfo(name, cardCount, isTeammate, position, jiPai) {
        const container = canvas.parentElement;
        const theme = getThemeConfig();
        let x, y;

        switch (position) {
            case 'bottom': x = 10; y = container.clientHeight - 100; break;
            case 'left': x = 10; y = 50; break;
            case 'top': x = container.clientWidth / 2 - 40; y = 10; break;
            case 'right': x = container.clientWidth - 90; y = 50; break;
        }

        ctx.fillStyle = isTeammate ? 'rgba(76,175,80,0.6)' : 'rgba(0,0,0,0.5)';
        roundRect(x, y, 80, 45, 6);
        ctx.fill();

        ctx.fillStyle = theme.textColor;
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText(name, x + 40, y + 5);

        ctx.font = '11px Arial';
        ctx.fillText(`${cardCount}张`, x + 40, y + 22);

        if (jiPai) {
            ctx.fillStyle = theme.jiPaiBg;
            ctx.font = 'bold 10px Arial';
            ctx.textAlign = 'right';
            ctx.fillText(`打${huoQuJiPaiMingCheng(jiPai)}`, x + 78, y + 35);
        }
    }

    function drawJiPaiInfo(jiPai) {
        const container = canvas.parentElement;
        const theme = getThemeConfig();

        ctx.fillStyle = 'rgba(0,0,0,0.4)';
        roundRect(container.clientWidth - 70, 50, 60, 35, 6);
        ctx.fill();

        ctx.fillStyle = theme.jiPaiBg;
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('级牌', container.clientWidth - 40, 60);

        ctx.fillStyle = theme.textColor;
        ctx.font = 'bold 16px Arial';
        ctx.fillText(huoQuJiPaiMingCheng(jiPai), container.clientWidth - 40, 78);
    }

    function drawText(text, x, y, options = {}) {
        const { fontSize = 14, color = '#ffffff', align = 'center', bold = false } = options;

        ctx.save();
        ctx.font = `${bold ? 'bold ' : ''}${fontSize}px Arial`;
        ctx.fillStyle = color;
        ctx.textAlign = align;
        ctx.textBaseline = 'middle';
        ctx.fillText(text, x, y);
        ctx.restore();
    }

    function drawTable() {
        const container = canvas.parentElement;
        const theme = getThemeConfig();

        ctx.fillStyle = theme.tableBg;
        ctx.fillRect(0, 0, container.clientWidth, container.clientHeight);

        ctx.beginPath();
        ctx.ellipse(container.clientWidth/2, container.clientHeight/2, 
                   container.clientWidth*0.35, container.clientHeight*0.3, 0, Math.PI*2);
        ctx.fillStyle = 'rgba(0,0,0,0.15)';
        ctx.fill();
        ctx.strokeStyle = theme.tableBorder;
        ctx.lineWidth = 2;
        ctx.stroke();
    }

    function clear() {
        const container = canvas.parentElement;
        ctx.clearRect(0, 0, container.clientWidth, container.clientHeight);
    }

    function getClickedCardIndex(clickX, clickY, paiList, selectedIds) {
        if (!paiList || paiList.length === 0) return -1;

        const container = canvas.parentElement;
        const totalWidth = (paiList.length - 1) * cardGap + cardWidth;
        const startX = (container.clientWidth - totalWidth) / 2;
        const baseY = container.clientHeight - cardHeight - 15;
        const selectedSet = new Set(selectedIds);

        for (let i = paiList.length - 1; i >= 0; i--) {
            const pai = paiList[i];
            const isSelected = selectedSet.has(pai.id);
            const cardX = startX + i * cardGap;
            const cardY = isSelected ? baseY - 18 : baseY;

            if (clickX >= cardX && clickX <= cardX + cardWidth &&
                clickY >= cardY && clickY <= cardY + cardHeight) {
                return i;
            }
        }
        return -1;
    }

    return {
        init,        resize,
        setTheme,
        getThemeConfig,
        drawCard,
        drawPlayerCards,
        drawAICards,
        drawPlayedCards,
        drawPlayerInfo,
        drawJiPaiInfo,
        drawText,
        drawTable,
        clear,
        getClickedCardIndex,
        get cardWidth() { return cardWidth; },
        get cardHeight() { return cardHeight; }
    };
})();

if (typeof module !== 'undefined' && module.exports) {
    module.exports = CardUI;
}
