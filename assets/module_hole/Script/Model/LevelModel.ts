import { Tablecultivate_config } from "../../../module_basic/table/Tablecultivate_config";
import { Tablelevels_config } from "../../../module_basic/table/Tablelevels_config";
import { GlobalConfig } from "../Config/GlobalConfig";
import { LevelManager } from "../Manager/LevelMgr";
import { BossModel } from "./BossModel";
import { MainConfigModel } from "./MainConfigModel";

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

export enum TYPE_GAME_STATE {
    GAME_STATE_INIT = 0, //准备阶段
    GAME_STATE_START = 1, //开始
    GAME_STATE_END = 2, //结束(倒计时结束)
    GAME_STATE_BATTLE = 3, //战斗
    GAME_STATE_RESULT = 4, //结算
    GAME_STATE_PAUSE = 5, //暂停
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
    public mainConfigModel: IMainConfig;
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
    /** 是否弹过时间加成弹窗*/
    public extraTimePop: boolean = false;

    /** 当前游戏状态*/
    public curGameState: TYPE_GAME_STATE = TYPE_GAME_STATE.GAME_STATE_INIT;

    constructor() {
        const mainConfig = new MainConfigModel();
        this.mainConfigModel = mainConfig.initilizeModel();
        // console.log(`加时extraTime:${this.mainConfigModel.extraTime} 磁力倍数magentic:${this.mainConfigModel.magentic} 初始金币:${this.mainConfigModel.initMoeny}`)
        this.levelConfig = new Tablelevels_config();
        this.cultivateConfig = new Tablecultivate_config();

        this.level = GlobalConfig.initilizeLevel;
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

    get level_boss(): number {
        return this.levelConfig.boss;
    }

    get quality(): number {
        return this.levelConfig.quality;
    }

    /** 关卡等级升级*/
    upgradeLevel(up: number = 1) {
        this.level += up;
        this.levelConfig.init(this.level);
    }
}

/** 属性接口
 * @param id 配置表id
 * @param level 对应等级
 * @param type 加成类型:时间,大小,经验
 * @param param 对应类型等级属性
 * @param money 金额
*/
export interface IAttributeConfig {
    id: number,
    level: number,
    type: number,
    param: number,
    money: number,
}

/** main属性接口
 * @param extraTime 加时
 * @param magentic 磁力范围 黑洞直径的倍数
 * @param gameUpLve 游戏内黑洞等级提升大小
 * @param initMoeny 玩家初始货币
*/
export interface IMainConfig {
    extraTime: number,
    magentic: number,
    gameUpLve: number,
    initMoeny: number
}
