import { JsonUtil } from "../../../core_tgx/base/utils/JsonUtil";
import { Tablecultivate_config } from "../../../module_basic/table/Tablecultivate_config";
import { Tablelevels_config } from "../../../module_basic/table/Tablelevels_config";
import { LevelManager } from "../Manager/LevelMgr";
import { BossModel } from "./BossModel";

/**加持类型
 * @param TIME 时间提升
 * @param SIZE 黑洞大小提升
 * @param EXP  吃道具经验倍数提升
*/
export enum TYPE_BLESSINGS {
    TIME = 1,
    SIZE = 2,
    EXP = 3,
}

/**关卡数据模型
 * @param reward_basics 基础奖励
 * @param reward_additional 额外奖励
 * @param levelTimeTotal 当前关卡游戏总时间
 * @param expMultiplier 经验加成倍数
 */
export class LevelModel {
    public levelConfig: Tablelevels_config;
    public cultivateConfig: Tablecultivate_config;
    public bossModel: BossModel;

    /** 当前关卡等级*/
    public level: number = 1;
    /** 当前关卡游戏总时间*/
    public levelTimeTotal: number = 0;

    /** 关卡时间等级*/
    public timesLevel: number = 1;
    /** 经验加成等级*/
    public expMulLevel: number = 1;
    /**  经验加成倍数*/
    public expMultiplier: number = 100;

    /** 输赢*/
    public battleWin: boolean = false;

    constructor() {
        this.levelConfig = new Tablelevels_config();
        this.cultivateConfig = new Tablecultivate_config();
        this.levelConfig.init(this.level);
        this.initilizeData();
    }

    /** 初始化数据*/
    private initilizeData(): void {
        const attributeConfig_Time = LevelManager.instance.getByTypeAndLevel(TYPE_BLESSINGS.TIME, this.timesLevel);
        const attributeConfig_Exp = LevelManager.instance.getByTypeAndLevel(TYPE_BLESSINGS.EXP, this.expMulLevel);
        this.levelTimeTotal = attributeConfig_Time.param;
        this.expMultiplier = attributeConfig_Exp.param;

        //初始当前boss
        this.bossModel = new BossModel();
    }

    get reward_basics(): number {
        return this.levelConfig.reward_basics;
    }

    get reward_additional(): number {
        return this.levelConfig.reward_additional;
    }

    /** 关卡等级升级*/
    upgradeLevel(up: number = 1) {
        this.level += up;
        this.levelConfig.init(this.level);
    }
}

/** 属性接口*/
export interface IAttributeConfig {
    id: number,
    level: number,
    type: number,
    param: number,
    money: number,
}
