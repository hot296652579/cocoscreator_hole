import { _decorator, Component, Label, Prefab, Node, Game, ProgressBar, CCBoolean, NodeEventType } from 'cc';
import { LevelManager } from './Script/Manager/LevelMgr';
import { EventDispatcher } from '../core_tgx/easy_ui_framework/EventDispatcher';
import { GameEvent } from './Script/Enum/GameEvent';
import { PropManager } from './Script/Manager/PropMgr';
import { HoleManager } from './Script/Manager/HoleMgr';
import { UserManager } from './Script/Manager/UserMgr';
import { tgxUIMgr } from '../core_tgx/tgx';
import { UI_AboutMe, UI_Setting } from '../scripts/UIDef';
const { ccclass, property } = _decorator;

@ccclass('RoosterHoleEntry')
export class RoosterHoleEntry extends Component {
    @property(Prefab)
    levelPrefabs: Prefab[] = [];
    @property(Prefab)
    battlePrefab: Prefab = null!;
    @property(Prefab)
    expPrefab: Prefab = null!;

    @property(Node)
    gameUI: Node = null;
    @property(Node)
    battleUI: Node = null;
    @property(Node)
    topNode: Node = null;
    @property(Node)
    btSet: Node = null!;
    @property(Label)
    lbTimes: Label = null!;
    @property(Label)
    lbLevel: Label = null!;
    @property(Node)
    btnsLayout: Node = null!;
    @property(ProgressBar)
    expProgress: ProgressBar = null!;

    private countdown: number = 0;
    private gaming: boolean = false;

    start() {
        this.initilize();
        this.addEventListen();
    }

    initilize() {
        PropManager.instance.parent = this.node;
        LevelManager.instance.parent = this.node;
        LevelManager.instance.levelPrefabs = this.levelPrefabs;
        LevelManager.instance.battlePrefab = this.battlePrefab;

        UserManager.instance.initilizeModel();
        LevelManager.instance.initilizeModel();
        HoleManager.instance.initilizeModel();
        const { level } = LevelManager.instance.levelModel;
        LevelManager.instance.loadLevel(level);

        PropManager.instance.initilizeUI();
        EventDispatcher.instance.emit(GameEvent.EVENT_UI_INITILIZE);//去通知界面初始化

        this.prepStageView();
    }

    addEventListen() {
        EventDispatcher.instance.on(GameEvent.EVENT_GAME_START, this.onGameStart, this);
        EventDispatcher.instance.on(GameEvent.EVENT_TIME_LEVEL_UP, this.updateCountLb, this);
        EventDispatcher.instance.on(GameEvent.EVENT_HOLE_EXP_UPDATE, this.updateExpProgress, this);
        EventDispatcher.instance.on(GameEvent.EVENT_USER_MONEY_UPDATE, this.updateUserInfo, this);

        EventDispatcher.instance.on(GameEvent.EVENT_BATTLE_SUCCESS_LEVEL_UP, this.levelUpHandler, this);
        EventDispatcher.instance.on(GameEvent.EVENT_BATTLE_FAIL_LEVEL_RESET, this.resetGameByLose, this);

        //按钮
        this.btSet.on(NodeEventType.TOUCH_END, this.onClickSet, this);
    }

    protected onDestroy(): void {
        EventDispatcher.instance.off(GameEvent.EVENT_GAME_START, this.onGameStart);
        EventDispatcher.instance.off(GameEvent.EVENT_TIME_LEVEL_UP, this.updateCountLb);
        EventDispatcher.instance.off(GameEvent.EVENT_HOLE_EXP_UPDATE, this.updateExpProgress);
        EventDispatcher.instance.off(GameEvent.EVENT_USER_MONEY_UPDATE, this.updateUserInfo);
    }

    onGameStart() {
        if (this.gaming) return;

        this.gaming = true;
        this.btnsLayout.active = false;
        //倒计时启动
        const levelTimeTotal = LevelManager.instance.levelModel.levelTimeTotal;
        this.countdown = levelTimeTotal;
        this.schedule(this.updateCountdown, 1);
    }

    private updateCountdown() {
        this.countdown--;
        if (this.countdown <= 0) {
            this.unschedule(this.updateCountdown);
            this.enterBattle();
            return
        }
        this.lbTimes.string = `倒计时:${this.countdown}`;
    }

    private enterBattle(): void {
        this.battleStageView();
        LevelManager.instance.loadBattle();
    }

    private updateUserInfo(): void {
        const lb = this.topNode.getChildByPath('UserInfo/LbUserMoney').getComponent(Label)!;
        const { money } = UserManager.instance.userModel;
        lb.string = `${money}`;
    }

    private updateCountLb(): void {
        const { levelTimeTotal } = LevelManager.instance.levelModel;
        // console.log(`levelTimeTotal:${levelTimeTotal}`);
        this.lbTimes.string = `倒计时:${levelTimeTotal}`;
    }

    private updateLevelLb(): void {
        const { level } = LevelManager.instance.levelModel;
        // console.log(`当前关卡等级:${level}`);
        this.lbLevel.string = `关卡:${level}`;
    }

    private updateExpProgress(): void {
        const total = this.expProgress.totalLength;
        const holeUpExp = HoleManager.instance.holeModel.exp;//需要升级的经验
        const curExp = HoleManager.instance.holeModel.curHoleExpL;
        console.log(`当前经验:${curExp} ,需要升级的经验:${holeUpExp}`);
        // 计算当前进度长度，使用整数来避免小数精度问题
        const lb = this.expProgress.node.getChildByName('LbExp');
        lb.getComponent(Label).string = `${curExp}/${holeUpExp}`;
        const progressLength = Math.round((curExp / holeUpExp) * total);
        this.expProgress.progress = progressLength / total;
    }

    /** 关卡升级*/
    private levelUpHandler(): void {
        PropManager.instance.clearEatsMap();
        HoleManager.instance.reBornLevel();
        LevelManager.instance.resetAddition();
        LevelManager.instance.upgradeLevel();

        this.loadLevelInfo();
        this.prepStageView();
    }

    /** 闯关失败重载当前关卡*/
    private resetGameByLose(): void {
        this.loadLevelInfo();
        this.prepStageView();
        HoleManager.instance.reBornLevel();
        HoleManager.instance.resetExPByLose();
    }

    private loadLevelInfo(): void {
        const { level } = LevelManager.instance.levelModel;
        LevelManager.instance.loadLevel(level);
    }

    /** 准备阶段界面*/
    private prepStageView(): void {
        this.gaming = false;
        this.battleUI.active = false;
        this.btnsLayout.active = true;
        this.lbTimes.node.active = true;
        this.updateCountLb();
        this.updateLevelLb();
        this.updateExpProgress();
        this.updateUserInfo();
    }

    /** 战斗阶段界面*/
    private battleStageView(): void {
        this.battleUI.active = true;
        this.lbTimes.node.active = false;
    }
    //-------------------------UI点击---------------
    private onClickSet(): void {
        tgxUIMgr.inst.showUI(UI_Setting);
    }
    //-------------------------end---------------
}

