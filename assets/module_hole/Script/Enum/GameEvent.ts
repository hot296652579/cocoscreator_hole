export class GameEvent {
    /** 通知UI实例化*/
    static readonly EVENT_UI_INITILIZE = 'EVENT_UI_INITILIZE';
    /** 游戏开始*/
    static readonly EVENT_GAME_START = 'EVENT_GAME_START';
    /** 时间加成等级提升*/
    static readonly EVENT_TIME_LEVEL_UP = 'EVENT_TIME_LEVEL_UP';
    /** 时间加成等级MAX*/
    static readonly EVENT_TIME_LEVEL_MAX = 'EVENT_TIME_LEVEL_MAX';
    /** 吞噬道具关卡进度更新*/
    static readonly EVENT_LEVEL_PROGRESS_UPDATE = 'EVENT_LEVEL_PROGRESS_UPDATE';
    /** 时间增加更新游戏倒计时*/
    static readonly EVENT_ADD_EXTRATIME = 'EVENT_ADD_EXTRATIME';
    /** 时间增加更新游戏倒计时关闭*/
    static readonly EVENT_ADD_EXTRATIME_CLOSE = 'EVENT_ADD_EXTRATIME_CLOSE';
    /** 经验加成等级提升*/
    static readonly EVENT_EXP_LEVEL_UP = 'EVENT_EXP_LEVEL_UP';
    /** 经验加成等级MAX*/
    static readonly EVENT_EXP_LEVEL_MAX = 'EVENT_EXP_LEVEL_MAX';
    /** 黑洞尺寸大小提升 等级提升*/
    static readonly EVENT_HOLE_LEVEL_SIEZE_UP = 'EVENT_HOLE_LEVEL_SIEZE_UP';
    /** 黑洞尺寸大小提升 等级MAX*/
    static readonly EVENT_HOLE_LEVEL_SIEZE_MAX = 'EVENT_HOLE_LEVEL_SIEZE_MAX';

    /** 黑洞重生 恢复level1*/
    static readonly EVENT_HOLE_LEVEL_SIEZE_RESET = 'EVENT_HOLE_LEVEL_SIEZE_RESET';

    /** 黑洞经验更新*/
    static readonly EVENT_HOLE_EXP_UPDATE = 'EVENT_HOLE_EXP_UPDATE';

    /** 关卡升级 各加成等级恢复到level1*/
    static readonly EVENT_LEVEL_UP_RESET = 'EVENT_LEVEL_UP_RESET';

    /** 关卡失败 各加成等级恢复等级*/
    static readonly EVENT_LEVEL_FAIL_RESET = 'EVENT_LEVEL_FAIL_RESET';

    /** 闯关成功 关卡升级*/
    static readonly EVENT_BATTLE_SUCCESS_LEVEL_UP = 'EVENT_BATTLE_SUCCESS_LEVEL_UP';

    /** 闯关失败 关卡重载*/
    static readonly EVENT_BATTLE_FAIL_LEVEL_RESET = 'EVENT_BATTLE_FAIL_LEVEL_RESET';
    /** 刷新战斗UI 重量显示*/
    static readonly EVENT_UPDATE_BATTLE_WEIGHT = 'EVENT_UPDATE_BATTLE_WEIGHT';

    /** 用户余额更新*/
    static readonly EVENT_USER_MONEY_UPDATE = 'EVENT_USER_MONEY_UPDATE';

    /** 时间加成增加播放特效*/
    static readonly EVENT_TIME_ADD_EFFECT = 'EVENT_TIME_ADD_EFFECT';

    /** 经验加成增加播放特效*/
    static readonly EVENT_TIME_ENERGY_EFFECT = 'EVENT_TIME_ENERGY_EFFECT';

    /** 磁力加成增加打开*/
    static readonly EVENT_MAGNET_ON = 'EVENT_TIME_MAGNET_ON';
    /** 磁力加成增加关闭*/
    static readonly EVENT_MAGNET_OFF = 'EVENT_MAGNET_OFF';
    /** 磁力加成增加播放特效*/
    static readonly EVENT_MAGNET_EFFECT_SHOW = 'EVENT_MAGNET_EFFECT_SHOW';

    /** 磁力加成增加关闭特效*/
    static readonly EVENT_MAGNET_EFFECT_HIDE = 'EVENT_MAGNET_EFFECT_HIDE';

    /** 吃完关卡道具进入战斗*/
    static readonly EVENT_FINISH_EAT_ENTER_BATTLE = 'EVENT_FINISH_EAT_ENTER_BATTLE';
}