export class GameEvent {
    /** 通知UI实例化*/
    static readonly EVENT_UI_INITILIZE = 'EVENT_UI_INITILIZE';
    /** 游戏开始*/
    static readonly EVENT_GAME_START = 'EVENT_GAME_START';
    /** 时间加成等级提升*/
    static readonly EVENT_TIME_LEVEL_UP = 'EVENT_TIME_LEVEL_UP';
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
}