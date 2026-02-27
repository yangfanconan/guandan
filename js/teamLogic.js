/**
 * 掼蛋组队逻辑模块
 * 管理队伍分配、得分结算
 */

const TeamLogic = (function() {
    'use strict';

    /**
     * 玩家位置
     * 南(0) - 西(1) - 北(2) - 东(3)
     * 南北是一队，东西是一队
     */
    const WEI_ZHI = {
        NAN: 0,    // 玩家
        XI: 1,     // AI1
        BEI: 2,    // AI2 (队友)
        DONG: 3    // AI3
    };

    const WEI_ZHI_NAME = ['南', '西', '北', '东'];

    /**
     * 获取队友位置
     */
    function huoQuDuiYou(weiZhi) {
        // 对家是队友（南-北，西-东）
        return (weiZhi + 2) % 4;
    }

    /**
     * 获取对手位置
     */
    function huoQuDuiShou(weiZhi) {
        return [(weiZhi + 1) % 4, (weiZhi + 3) % 4];
    }

    /**
     * 判断两个位置是否是队友
     */
    function shiFouDuiYou(weiZhi1, weiZhi2) {
        return huoQuDuiYou(weiZhi1) === weiZhi2;
    }

    /**
     * 判断是否是玩家
     */
    function shiFouWanJia(weiZhi) {
        return weiZhi === WEI_ZHI.NAN;
    }

    /**
     * 获取队伍成员
     * @returns {Object} {duiWu1: [南, 北], duiWu2: [西, 东]}
     */
    function huoQuDuiWu() {
        return {
            duiWu1: [WEI_ZHI.NAN, WEI_ZHI.BEI],  // 玩家队
            duiWu2: [WEI_ZHI.XI, WEI_ZHI.DONG]   // AI队
        };
    }

    /**
     * 获取下一个出牌位置
     */
    function xiaYiGeWeiZhi(dangQianWeiZhi) {
        return (dangQianWeiZhi + 1) % 4;
    }

    /**
     * 计算游次和升级
     * @param {Array} youCiList 按出牌顺序的位置列表 [头游位置, 二游位置, 三游位置, 末游位置]
     * @returns {Object} 结算结果
     */
    function jiSuanJieGuo(youCiList, dangQianJi, zhaDanShu) {
        const duiWu = huoQuDuiWu();
        
        // 找出每个队伍的最好和最差名次
        let duiWu1Min = 4, duiWu1Max = 1;
        let duiWu2Min = 4, duiWu2Max = 1;
        
        for (let i = 0; i < youCiList.length; i++) {
            const weiZhi = youCiList[i];
            const youCi = i + 1;  // 1=头游, 2=二游, 3=三游, 4=末游
            
            if (duiWu.duiWu1.includes(weiZhi)) {
                duiWu1Min = Math.min(duiWu1Min, youCi);
                duiWu1Max = Math.max(duiWu1Max, youCi);
            } else {
                duiWu2Min = Math.min(duiWu2Min, youCi);
                duiWu2Max = Math.max(duiWu2Max, youCi);
            }
        }

        // 判断胜负
        const duiWu1HuoSheng = duiWu1Min < duiWu2Min;
        const shengFangHuoSheng = duiWu1HuoSheng ? 'duiWu1' : 'duiWu2';
        const shengFangMin = duiWu1HuoSheng ? duiWu1Min : duiWu2Min;
        const shengFangMax = duiWu1HuoSheng ? duiWu1Max : duiWu2Max;

        // 计算升级数
        let shengJiShu = 1;
        
        // 双下：败方末游和三游
        if (shengFangMax === 3 || shengFangMax === 4) {
            const baiFangMin = duiWu1HuoSheng ? duiWu2Min : duiWu1Min;
            const baiFangMax = duiWu1HuoSheng ? duiWu2Max : duiWu1Max;
            
            if (baiFangMin === 3 && baiFangMax === 4) {
                shengJiShu = 3;  // 双下，升3级
            } else if (baiFangMin === 4) {
                shengJiShu = 2;  // 单下，升2级
            }
        }

        // 双上：胜方头游和二游
        if (shengFangMin === 1 && shengFangMax === 2) {
            shengJiShu = 3;  // 双上，升3级
        }

        // 下一个级牌
        const xinJiPai = Math.min(dangQianJi + shengJiShu, 14);  // 最大到A

        return {
            shengFang: shengFangHuoSheng,
            shengJiShu,
            xinJiPai,
            zhaDanShu,
            touYou: youCiList[0],
            moYou: youCiList[3],
            duiWu1HuoSheng,
            youCiList
        };
    }

    /**
     * 获取贡牌/还牌信息
     * @param {number} moYouWeiZhi 末游位置
     * @param {number} touYouWeiZhi 头游位置
     * @returns {Object} 贡还信息
     */
    function huoQuGongHuanXinXi(moYouWeiZhi, touYouWeiZhi) {
        // 末游给头游贡牌
        // 如果末游和头游是队友，不贡牌
        if (shiFouDuiYou(moYouWeiZhi, touYouWeiZhi)) {
            return { xuYaoGongPai: false };
        }

        return {
            xuYaoGongPai: true,
            gongPaiZhe: moYouWeiZhi,
            shouPaiZhe: touYouWeiZhe
        };
    }

    /**
     * 获取位置名称
     */
    function huoQuWeiZhiMingCheng(weiZhi) {
        return WEI_ZHI_NAME[weiZhi] || '未知';
    }

    return {
        WEI_ZHI,
        WEI_ZHI_NAME,
        huoQuDuiYou,
        huoQuDuiShou,
        shiFouDuiYou,
        shiFouWanJia,
        huoQuDuiWu,
        xiaYiGeWeiZhi,
        jiSuanJieGuo,
        huoQuGongHuanXinXi,
        huoQuWeiZhiMingCheng
    };
})();

if (typeof module !== 'undefined' && module.exports) {
    module.exports = TeamLogic;
}
