/**
 * 掼蛋AI逻辑模块
 * 实现AI出牌策略，支持组队配合
 */

const AILogic = (function() {
    'use strict';

    const { PAI_ZHI, PAI_XING, paiXu, tongJiPaiZhi, fenZu, jieXiPaiXing, yanZhengChuPai, huoQuShiJiPaiZhi } = GameRules;

    /**
     * AI难度
     */
    const NAN_DU = { JIAN_DAN: 1, ZHONG_DENG: 2, KUN_NAN: 3 };
    let dangQianNanDu = NAN_DU.ZHONG_DENG;

    /**
     * 设置难度
     */
    function sheZhiNanDu(nanDu) {
        dangQianNanDu = nanDu;
    }

    /**
     * 分析手牌，生成所有可能的出牌组合
     */
    function fenXiShouPai(shouPai) {
        const paiXuPai = paiXu(shouPai);
        const tongJi = tongJiPaiZhi(shouPai);
        const fz = fenZu(tongJi);
        
        const zuHe = {
            danZhang: [],
            duiZi: [],
            sanZhang: [],
            sanDaiEr: [],
            shunZi: [],
            lianDui: [],
            sanLian: [],
            gangBan: [],
            zhaDan: [],
            tongHuaShun: [],
            tianWangZha: [],
            siDaiEr: [],
            feiJi: []
        };

        // 单张
        const allZhi = new Set(shouPai.map(p => p.zhi));
        for (const zhi of allZhi) {
            const pai = shouPai.find(p => p.zhi === zhi);
            if (pai) zuHe.danZhang.push([pai]);
        }

        // 对子
        for (const zhi of fz.dui) {
            const dui = shouPai.filter(p => p.zhi === zhi).slice(0, 2);
            zuHe.duiZi.push(dui);
        }
        // 从三张中拆对子
        for (const zhi of fz.san) {
            const dui = shouPai.filter(p => p.zhi === zhi).slice(0, 2);
            zuHe.duiZi.push(dui);
        }

        // 三张
        for (const zhi of fz.san) {
            const san = shouPai.filter(p => p.zhi === zhi);
            zuHe.sanZhang.push(san);
        }
        for (const zhi of fz.si) {
            const san = shouPai.filter(p => p.zhi === zhi).slice(0, 3);
            zuHe.sanZhang.push(san);
        }

        // 三带二
        for (const sanZhi of [...fz.san, ...fz.si]) {
            const san = shouPai.filter(p => p.zhi === sanZhi).slice(0, 3);
            for (const duiZhi of fz.dui) {
                if (duiZhi !== sanZhi) {
                    const dui = shouPai.filter(p => p.zhi === duiZhi).slice(0, 2);
                    if (dui.length === 2) {
                        zuHe.sanDaiEr.push([...san, ...dui]);
                    }
                }
            }
        }

        // 炸弹（4-6张）
        for (const zhi of fz.si) {
            const zha = shouPai.filter(p => p.zhi === zhi);
            zuHe.zhaDan.push(zha);
        }
        for (const zhi of fz.wu) {
            const zha = shouPai.filter(p => p.zhi === zhi);
            zuHe.zhaDan.push(zha);
        }
        for (const zhi of fz.liu) {
            const zha = shouPai.filter(p => p.zhi === zhi);
            zuHe.zhaDan.push(zha);
        }

        // 天王炸
        const xiaoWang = shouPai.filter(p => p.zhi === PAI_ZHI.XIAO_WANG);
        const daWang = shouPai.filter(p => p.zhi === PAI_ZHI.DA_WANG);
        if (xiaoWang.length >= 2 && daWang.length >= 2) {
            zuHe.tianWangZha.push([...xiaoWang.slice(0, 2), ...daWang.slice(0, 2)]);
        }

        // 四带二
        for (const siZhi of fz.si) {
            const si = shouPai.filter(p => p.zhi === siZhi);
            const others = shouPai.filter(p => p.zhi !== siZhi);
            if (others.length >= 2) {
                zuHe.siDaiEr.push([...si, others[0], others[1]]);
            }
        }

        // 钢板（两个连续三张）
        const sanList = fz.san.filter(z => z <= PAI_ZHI.A && z > PAI_ZHI.ER).sort((a, b) => a - b);
        for (let i = 0; i < sanList.length - 1; i++) {
            if (sanList[i + 1] === sanList[i] + 1) {
                const gang1 = shouPai.filter(p => p.zhi === sanList[i]);
                const gang2 = shouPai.filter(p => p.zhi === sanList[i + 1]);
                zuHe.gangBan.push([...gang1, ...gang2]);
            }
        }

        // 顺子（5张或以上连续单张）
        const danList = [...fz.dan].filter(z => z <= PAI_ZHI.A && z > PAI_ZHI.ER).sort((a, b) => a - b);
        for (let len = 5; len <= danList.length; len++) {
            for (let start = 0; start <= danList.length - len; start++) {
                const subList = danList.slice(start, start + len);
                let lianXu = true;
                for (let i = 1; i < subList.length; i++) {
                    if (subList[i] !== subList[i - 1] + 1) {
                        lianXu = false;
                        break;
                    }
                }
                if (lianXu) {
                    const shunZi = subList.map(zhi => shouPai.find(p => p.zhi === zhi));
                    zuHe.shunZi.push(shunZi);
                }
            }
        }

        // 连对（3对或以上连续对子）
        const duiList = fz.dui.filter(z => z <= PAI_ZHI.A && z > PAI_ZHI.ER).sort((a, b) => a - b);
        for (let len = 3; len <= duiList.length; len++) {
            for (let start = 0; start <= duiList.length - len; start++) {
                const subList = duiList.slice(start, start + len);
                let lianXu = true;
                for (let i = 1; i < subList.length; i++) {
                    if (subList[i] !== subList[i - 1] + 1) {
                        lianXu = false;
                        break;
                    }
                }
                if (lianXu) {
                    const lianDui = subList.flatMap(zhi => shouPai.filter(p => p.zhi === zhi).slice(0, 2));
                    zuHe.lianDui.push(lianDui);
                }
            }
        }

        // 三连（两个或以上连续三张，不带牌）
        for (let len = 2; len <= sanList.length; len++) {
            for (let start = 0; start <= sanList.length - len; start++) {
                const subList = sanList.slice(start, start + len);
                let lianXu = true;
                for (let i = 1; i < subList.length; i++) {
                    if (subList[i] !== subList[i - 1] + 1) {
                        lianXu = false;
                        break;
                    }
                }
                if (lianXu) {
                    const sanLian = subList.flatMap(zhi => shouPai.filter(p => p.zhi === zhi));
                    zuHe.sanLian.push(sanLian);
                }
            }
        }

        // 同花顺
        const huaSeMap = new Map();
        for (const pai of shouPai) {
            if (pai.zhi > PAI_ZHI.ER && pai.zhi <= PAI_ZHI.A) {
                if (!huaSeMap.has(pai.hua)) huaSeMap.set(pai.hua, []);
                huaSeMap.get(pai.hua).push(pai);
            }
        }
        
        for (const [hua, paiList] of huaSeMap) {
            if (paiList.length >= 5) {
                paiList.sort((a, b) => a.zhi - b.zhi);
                for (let len = 5; len <= paiList.length; len++) {
                    for (let start = 0; start <= paiList.length - len; start++) {
                        const subList = paiList.slice(start, start + len);
                        let lianXu = true;
                        for (let i = 1; i < subList.length; i++) {
                            if (subList[i].zhi !== subList[i - 1].zhi + 1) {
                                lianXu = false;
                                break;
                            }
                        }
                        if (lianXu) {
                            zuHe.tongHuaShun.push(subList);
                        }
                    }
                }
            }
        }

        return zuHe;
    }

    /**
     * 找出能压过上家的牌
     */
    function zhaoKeChuDePai(shouPai, shangJiaPaiXing) {
        const zuHe = fenXiShouPai(shouPai);
        const keChuPai = [];

        if (!shangJiaPaiXing || shangJiaPaiXing.xing === PAI_XING.WU_XIAO) {
            return Object.values(zuHe).flat().filter(arr => arr && arr.length > 0);
        }

        const { xing, zhuZhi, changDu } = shangJiaPaiXing;

        // 天王炸可以压任何牌
        if (zuHe.tianWangZha.length > 0 && xing !== PAI_XING.TIAN_WANG_ZHA) {
            keChuPai.push(...zuHe.tianWangZha);
        }

        // 同花顺
        if (xing !== PAI_XING.TIAN_WANG_ZHA) {
            for (const ths of zuHe.tongHuaShun) {
                const thsPaiXing = jieXiPaiXing(ths);
                if (thsPaiXing.changDu >= changDu) {
                    if (xing !== PAI_XING.TONG_HUA_SHUN || thsPaiXing.zhuZhi > zhuZhi) {
                        keChuPai.push(ths);
                    }
                }
            }
        }

        // 炸弹（可以压非炸弹）
        if (xing !== PAI_XING.TIAN_WANG_ZHA && xing !== PAI_XING.ZHA_DAN) {
            keChuPai.push(...zuHe.zhaDan);
        } else if (xing === PAI_XING.ZHA_DAN) {
            for (const zha of zuHe.zhaDan) {
                const zhaPaiXing = jieXiPaiXing(zha);
                if (zhaPaiXing.changDu > changDu || 
                    (zhaPaiXing.changDu === changDu && zhaPaiXing.zhuZhi > zhuZhi)) {
                    keChuPai.push(zha);
                }
            }
        }

        // 同牌型比较
        switch (xing) {
            case PAI_XING.DAN_ZHANG:
                for (const pai of zuHe.danZhang) {
                    if (huoQuShiJiPaiZhi(pai[0].zhi) > zhuZhi) {
                        keChuPai.push(pai);
                    }
                }
                break;

            case PAI_XING.DUI_ZI:
                for (const dui of zuHe.duiZi) {
                    const duiPaiXing = jieXiPaiXing(dui);
                    if (duiPaiXing.zhuZhi > zhuZhi) {
                        keChuPai.push(dui);
                    }
                }
                break;

            case PAI_XING.SAN_ZHANG:
                for (const san of zuHe.sanZhang) {
                    const sanPaiXing = jieXiPaiXing(san);
                    if (sanPaiXing.zhuZhi > zhuZhi) {
                        keChuPai.push(san);
                    }
                }
                break;

            case PAI_XING.SAN_DAI_ER:
                for (const sd of zuHe.sanDaiEr) {
                    const sdPaiXing = jieXiPaiXing(sd);
                    if (sdPaiXing.zhuZhi > zhuZhi) {
                        keChuPai.push(sd);
                    }
                }
                break;

            case PAI_XING.SHUN_ZI:
                for (const sz of zuHe.shunZi) {
                    const szPaiXing = jieXiPaiXing(sz);
                    if (szPaiXing.changDu === changDu && szPaiXing.zhuZhi > zhuZhi) {
                        keChuPai.push(sz);
                    }
                }
                break;

            case PAI_XING.LIAN_DUI:
                for (const ld of zuHe.lianDui) {
                    const ldPaiXing = jieXiPaiXing(ld);
                    if (ldPaiXing.changDu === changDu && ldPaiXing.zhuZhi > zhuZhi) {
                        keChuPai.push(ld);
                    }
                }
                break;

            case PAI_XING.SAN_LIAN:
                for (const sl of zuHe.sanLian) {
                    const slPaiXing = jieXiPaiXing(sl);
                    if (slPaiXing.changDu === changDu && slPaiXing.zhuZhi > zhuZhi) {
                        keChuPai.push(sl);
                    }
                }
                break;

            case PAI_XING.GANG_BAN:
                for (const gb of zuHe.gangBan) {
                    const gbPaiXing = jieXiPaiXing(gb);
                    if (gbPaiXing.zhuZhi > zhuZhi) {
                        keChuPai.push(gb);
                    }
                }
                break;

            case PAI_XING.SI_DAI_ER:
                for (const sd of zuHe.siDaiEr) {
                    const sdPaiXing = jieXiPaiXing(sd);
                    if (sdPaiXing.zhuZhi > zhuZhi) {
                        keChuPai.push(sd);
                    }
                }
                break;
        }

        return keChuPai;
    }

    /**
     * AI选择出牌
     * @param {Array} shouPai 手牌
     * @param {Object} shangJiaPaiXing 上家牌型
     * @param {boolean} shiDuiYou 上家是否是队友
     * @param {Object} gameState 游戏状态
     */
    function xuanZeChuPai(shouPai, shangJiaPaiXing, shiDuiYou, gameState) {
        // 如果上家是队友且出了牌，考虑过牌让队友走
        if (shiDuiYou && shangJiaPaiXing && shangJiaPaiXing.xing !== PAI_XING.WU_XIAO) {
            // 队友牌少时，让队友先走
            if (dangQianNanDu >= NAN_DU.ZHONG_DENG) {
                if (Math.random() > 0.3) {
                    return { pai: null, guo: true };
                }
            }
        }

        // 首出
        if (!shangJiaPaiXing || shangJiaPaiXing.xing === PAI_XING.WU_XIAO) {
            return shouCiChuPai(shouPai);
        }

        // 找能出的牌
        const keChuPai = zhaoKeChuDePai(shouPai, shangJiaPaiXing);

        if (keChuPai.length === 0) {
            return { pai: null, guo: true };
        }

        // 根据难度选择策略
        switch (dangQianNanDu) {
            case NAN_DU.JIAN_DAN:
                return jianDanCeLue(keChuPai);
            case NAN_DU.KUN_NAN:
                return kunNanCeLue(keChuPai, shouPai, shangJiaPaiXing, gameState);
            default:
                return zhongDengCeLue(keChuPai, shouPai);
        }
    }

    /**
     * 首次出牌策略
     */
    function shouCiChuPai(shouPai) {
        const zuHe = fenXiShouPai(shouPai);

        // 优先出同花顺
        if (zuHe.tongHuaShun.length > 0) {
            return { pai: zuHe.tongHuaShun[0], guo: false };
        }

        // 出顺子
        if (zuHe.shunZi.length > 0) {
            const zuiXiao = zuHe.shunZi.reduce((min, curr) => {
                const minPx = jieXiPaiXing(min);
                const currPx = jieXiPaiXing(curr);
                return currPx.zhuZhi < minPx.zhuZhi ? curr : min;
            });
            return { pai: zuiXiao, guo: false };
        }

        // 出连对
        if (zuHe.lianDui.length > 0) {
            const zuiXiao = zuHe.lianDui[zuHe.lianDui.length - 1];
            return { pai: zuiXiao, guo: false };
        }

        // 出三连/钢板
        if (zuHe.gangBan.length > 0) {
            return { pai: zuHe.gangBan[0], guo: false };
        }
        if (zuHe.sanLian.length > 0) {
            return { pai: zuHe.sanLian[0], guo: false };
        }

        // 出三带二
        if (zuHe.sanDaiEr.length > 0) {
            const zuiXiao = zuHe.sanDaiEr[zuHe.sanDaiEr.length - 1];
            return { pai: zuiXiao, guo: false };
        }

        // 出三张
        if (zuHe.sanZhang.length > 0) {
            const zuiXiao = zuHe.sanZhang[zuHe.sanZhang.length - 1];
            return { pai: zuiXiao, guo: false };
        }

        // 出对子
        if (zuHe.duiZi.length > 0) {
            const zuiXiao = zuHe.duiZi[zuHe.duiZi.length - 1];
            return { pai: zuiXiao, guo: false };
        }

        // 出单张
        if (zuHe.danZhang.length > 0) {
            const zuiXiao = zuHe.danZhang[zuHe.danZhang.length - 1];
            return { pai: zuiXiao, guo: false };
        }

        // 实在不行出炸弹
        if (zuHe.zhaDan.length > 0) {
            return { pai: zuHe.zhaDan[0], guo: false };
        }

        return { pai: [shouPai[shouPai.length - 1]], guo: false };
    }

    /**
     * 简单策略
     */
    function jianDanCeLue(keChuPai) {
        const zuiXiao = keChuPai.reduce((min, curr) => {
            const minPx = jieXiPaiXing(min);
            const currPx = jieXiPaiXing(curr);
            if (currPx.xing === PAI_XING.TIAN_WANG_ZHA) return min;
            if (minPx.xing === PAI_XING.TIAN_WANG_ZHA) return min;
            return currPx.zhuZhi < minPx.zhuZhi ? curr : min;
        });
        return { pai: zuiXiao, guo: false };
    }

    /**
     * 中等策略
     */
    function zhongDengCeLue(keChuPai, shouPai) {
        // 牌少时全力出
        if (shouPai.length <= 5) {
            const zuiDa = keChuPai.reduce((max, curr) => {
                const maxPx = jieXiPaiXing(max);
                const currPx = jieXiPaiXing(curr);
                return currPx.zhuZhi > maxPx.zhuZhi ? curr : max;
            });
            return { pai: zuiDa, guo: false };
        }

        // 过滤掉炸弹
        const puTong = keChuPai.filter(pai => {
            const px = jieXiPaiXing(pai);
            return px.xing !== PAI_XING.ZHA_DAN && 
                   px.xing !== PAI_XING.TIAN_WANG_ZHA &&
                   px.xing !== PAI_XING.TONG_HUA_SHUN;
        });

        if (puTong.length > 0) {
            return jianDanCeLue(puTong);
        }

        // 只剩炸弹，根据情况决定
        if (shouPai.length <= 8) {
            return { pai: keChuPai[0], guo: false };
        }

        return { pai: null, guo: true };
    }

    /**
     * 困难策略
     */
    function kunNanCeLue(keChuPai, shouPai, shangJiaPaiXing, gameState) {
        return zhongDengCeLue(keChuPai, shouPai);
    }

    /**
     * AI选择贡牌（最大的牌）
     */
    function xuanZeGongPai(shouPai) {
        return GameRules.zhaoZuiDaPai(shouPai);
    }

    /**
     * AI选择还牌（最小的牌）
     */
    function xuanZeHuanPai(shouPai, excludeId) {
        return GameRules.zhaoZuiXiaoPai(shouPai, excludeId);
    }

    return {
        NAN_DU,
        sheZhiNanDu,
        fenXiShouPai,
        zhaoKeChuDePai,
        xuanZeChuPai,
        xuanZeGongPai,
        xuanZeHuanPai
    };
})();

if (typeof module !== 'undefined' && module.exports) {
    module.exports = AILogic;
}
