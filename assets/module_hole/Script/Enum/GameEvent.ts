export class GameEvent {
    /** 通知UI实例化*/
    static readonly EVENT_UI_INITILIZE = 'EVENT_UI_INITILIZE';
    /** 游戏开始*/
    static readonly EVENT_GAME_START = 'EVENT_GAME_START';
    /** 时间加成等级提升*/
    static readonly EVENT_TIME_LEVEL_UP = 'EVENT_TIME_LEVEL_UP';
    /** 吞噬道具关卡进度更新*/
    static readonly EVENT_LEVEL_PROGRESS_UPDATE = 'EVENT_LEVEL_PROGRESS_UPDATE';
    /** 时间增加更新游戏倒计时*/
    static readonly EVENT_ADD_EXTRATIME = 'EVENT_ADD_EXTRATIME';
    /** 时间增加更新游戏倒计时关闭*/
    static readonly EVENT_ADD_EXTRATIME_CLOSE = 'EVENT_ADD_EXTRATIME_CLOSE';
    /** 经验加成等级提升*/
    static readonly EVENT_EXP_LEVEL_UP = 'EVENT_EXP_LEVEL_UP';
    /** 黑洞尺寸大小提升 等级提升*/
    static readonly EVENT_HOLE_LEVEL_SIEZE_UP = 'EVENT_HOLE_LEVEL_SIEZE_UP';

    /** 黑洞重生 恢复level1*/
    static readonly EVENT_HOLE_LEVEL_SIEZE_RESET = 'EVENT_HOLE_LEVEL_SIEZE_RESET';

    /** 黑洞经验更新*/
    static readonly EVENT_HOLE_EXP_UPDATE = 'EVENT_HOLE_EXP_UPDATE';

    /** 关卡升级 各加成等级恢复到level1*/
    static readonly EVENT_LEVEL_UP_RESET = 'EVENT_LEVEL_UP_RESET';

    /** 闯关成功 关卡升级*/
    static readonly EVENT_BATTLE_SUCCESS_LEVEL_UP = 'EVENT_BATTLE_SUCCESS_LEVEL_UP';

    /** 闯关失败 关卡重载*/
    static readonly EVENT_BATTLE_FAIL_LEVEL_RESET = 'EVENT_BATTLE_FAIL_LEVEL_RESET';
    /** 刷新战斗UI 重量显示*/
    static readonly EVENT_UPDATE_BATTLE_WEIGHT = 'EVENT_UPDATE_BATTLE_WEIGHT';

    /** 用户余额更新*/
    static readonly EVENT_USER_MONEY_UPDATE = 'EVENT_USER_MONEY_UPDATE';
}