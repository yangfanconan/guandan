/**
 * 斗地主音效模块
 * 使用Web Audio API生成音效
 */

const SoundManager = (function() {
    'use strict';

    let audioContext = null;
    let enabled = true;
    let currentStyle = 'jianghuai';

    function init() {
        try {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            console.warn('Web Audio API 不支持');
        }
    }

    function ensureContext() {
        if (audioContext && audioContext.state === 'suspended') {
            audioContext.resume();
        }
    }

    function toggle() {
        enabled = !enabled;
        return enabled;
    }

    function setEnabled(e) {
        enabled = e;
    }

    function isEnabled() {
        return enabled;
    }

    function setStyle(style) {
        currentStyle = style;
    }

    function play(type) {
        if (!enabled || !audioContext) return;

        ensureContext();

        switch (type) {
            case 'deal': playDealSound(); break;
            case 'play': playPlaySound(); break;
            case 'pass': playPassSound(); break;
            case 'bomb': playBombSound(); break;
            case 'rocket': playRocketSound(); break;
            case 'win': playWinSound(); break;
            case 'lose': playLoseSound(); break;
            case 'click': playClickSound(); break;
            case 'gong': playGongSound(); break;
            case 'huan': playHuanSound(); break;
        }
    }

    function playDealSound() {
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();

        osc.connect(gain);
        gain.connect(audioContext.destination);

        osc.frequency.value = 600;
        osc.type = 'sine';

        gain.gain.setValueAtTime(0.08, audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.08);

        osc.start();
        osc.stop(audioContext.currentTime + 0.08);
    }

    function playPlaySound() {
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();

        osc.connect(gain);
        gain.connect(audioContext.destination);

        osc.frequency.value = currentStyle === 'jianghuai' ? 500 : 400;
        osc.type = currentStyle === 'jianghuai' ? 'triangle' : 'square';

        gain.gain.setValueAtTime(0.12, audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);

        osc.start();
        osc.stop(audioContext.currentTime + 0.1);
    }

    function playPassSound() {
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();

        osc.connect(gain);
        gain.connect(audioContext.destination);

        osc.frequency.value = 350;
        osc.type = 'sine';

        gain.gain.setValueAtTime(0.1, audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);
        osc.start();
        osc.stop(audioContext.currentTime + 0.15);
    }

    function playBombSound() {
        for (let i = 0; i < 3; i++) {
            setTimeout(() => {
                const osc = audioContext.createOscillator();
                const gain = audioContext.createGain();

                osc.connect(gain);
                gain.connect(audioContext.destination);

                osc.frequency.value = 100 + i * 50;
                osc.type = 'sawtooth';

                gain.gain.setValueAtTime(0.2, audioContext.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);

                osc.start();
                osc.stop(audioContext.currentTime + 0.2);
            }, i * 50);
        }
    }

    function playRocketSound() {
        for (let i = 0; i < 5; i++) {
            setTimeout(() => {
                const osc = audioContext.createOscillator();
                const gain = audioContext.createGain();

                osc.connect(gain);
                gain.connect(audioContext.destination);

                osc.frequency.value = 200 + i * 150;
                osc.type = 'sawtooth';

                gain.gain.setValueAtTime(0.12, audioContext.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);

                osc.start();
                osc.stop(audioContext.currentTime + 0.1);
            }, i * 40);
        }
        setTimeout(playBombSound, 250);
    }

    function playWinSound() {
        const notes = [523, 659, 784, 1047];
        notes.forEach((freq, i) => {
            setTimeout(() => {
                const osc = audioContext.createOscillator();
                const gain = audioContext.createGain();

                osc.connect(gain);
                gain.connect(audioContext.destination);

                osc.frequency.value = freq;
                osc.type = 'sine';

                gain.gain.setValueAtTime(0.15, audioContext.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.25);

                osc.start();
                osc.stop(audioContext.currentTime + 0.25);
            }, i * 120);
        });
    }

    function playLoseSound() {
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();

        osc.connect(gain);
        gain.connect(audioContext.destination);

        osc.frequency.setValueAtTime(400, audioContext.currentTime);
        osc.frequency.exponentialRampToValueAtTime(100, audioContext.currentTime + 0.4);
        osc.type = 'sine';

        gain.gain.setValueAtTime(0.12, audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4);

        osc.start();
        osc.stop(audioContext.currentTime + 0.4);
    }

    function playClickSound() {
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();

        osc.connect(gain);
        gain.connect(audioContext.destination);

        osc.frequency.value = 800;
        osc.type = 'sine';

        gain.gain.setValueAtTime(0.06, audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.03);
        osc.start();
        osc.stop(audioContext.currentTime + 0.03);
    }

    function playGongSound() {
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();

        osc.connect(gain);
        gain.connect(audioContext.destination);

        osc.frequency.value = 800;
        osc.type = 'triangle';

        gain.gain.setValueAtTime(0.12, audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);
        osc.start();
        osc.stop(audioContext.currentTime + 0.15);
    }

    function playHuanSound() {
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();

        osc.connect(gain);
        gain.connect(audioContext.destination);

        osc.frequency.value = 600;
        osc.type = 'sine';

        gain.gain.setValueAtTime(0.1, audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
        osc.start();
        osc.stop(audioContext.currentTime + 0.1);
    }

    return {
        init,
        toggle,
        setEnabled,
        isEnabled,
        setStyle,
        play
    };
})();

if (typeof module !== 'undefined' && module.exports) {
    module.exports = SoundManager
}
