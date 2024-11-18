import { _decorator, Component, Label, Prefab, Node, Game, ProgressBar, CCBoolean, NodeEventType } from 'cc';
import { LevelManager } from './Script/Manager/LevelMgr';
import { EventDispatcher } from '../core_tgx/easy_ui_framework/EventDispatcher';
import { GameEvent } from './Script/Enum/GameEvent';
import { PropManager } from './Script/Manager/PropMgr';
import { HoleManager } from './Script/Manager/HoleMgr';
import { UserManager } from './Script/Manager/UserMgr';
import { tgxUIMgr } from '../core_tgx/tgx';
import { UI_AboutMe, UI_Setting, UI_TopInfo } from '../scripts/UIDef';
import { HoleGameAudioMgr } from './Script/Manager/HoleGameAudioMgr';
import { UIMgr } from '../core_tgx/easy_ui_framework/UIMgr';
import { GameUtil } from './Script/Utils';
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
    countExpUI: Node = null;
    @property(Node)
    btnsLayout: Node = null!;
    lbTimes: Label = null!;
    expProgress: ProgressBar = null!;

    private countdown: number = 0;
    private gaming: boolean = false;

    start() {
        HoleGameAudioMgr.play('Audio/Bgm', 1.0);
        this.initilize();
        this.addEventListen();
    }

    initilize() {
        this.initilizeUI();
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
        tgxUIMgr.inst.showUI(UI_TopInfo);
    }

    private initilizeUI(): void {
        this.lbTimes = this.countExpUI.getChildByName('LbTimes')!.getComponent(Label);
        this.expProgress = this.countExpUI.getChildByName('ExpProgress')!.getComponent(ProgressBar);
    }

    addEventListen() {
        EventDispatcher.instance.on(GameEvent.EVENT_GAME_START, this.onGameStart, this);
        EventDispatcher.instance.on(GameEvent.EVENT_TIME_LEVEL_UP, this.updateCountLb, this);

        EventDispatcher.instance.on(GameEvent.EVENT_HOLE_EXP_UPDATE, this.updateUserHoleExp, this);
        EventDispatcher.instance.on(GameEvent.EVENT_BATTLE_SUCCESS_LEVEL_UP, this.levelUpHandler, this);
        EventDispatcher.instance.on(GameEvent.EVENT_BATTLE_FAIL_LEVEL_RESET, this.resetGameByLose, this);
    }

    protected onDestroy(): void {
        EventDispatcher.instance.off(GameEvent.EVENT_GAME_START, this.onGameStart);
        EventDispatcher.instance.off(GameEvent.EVENT_TIME_LEVEL_UP, this.updateCountLb);
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

        const formatStr = GameUtil.formatToTimeString(this.countdown);
        this.lbTimes.string = `${formatStr}`;
    }

    private enterBattle(): void {
        this.battleStageView();
        LevelManager.instance.loadBattle();
    }

    private updateCountLb(): void {
        const { levelTimeTotal } = LevelManager.instance.levelModel;
        const formatStr = GameUtil.formatToTimeString(levelTimeTotal);
        this.lbTimes.string = `${formatStr}`;
    }

    private updateUserHoleExp(): void {
        const total = this.expProgress.totalLength;
        const holeModel = HoleManager.instance.holeModel;
        const { exp, curHoleExpL } = holeModel;
        const progresLenth = Math.round((curHoleExpL / exp) * total);
        this.expProgress.progress = progresLenth / total;
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
        this.countExpUI.active = true;
        this.updateCountLb();
    }

    /** 战斗阶段界面*/
    private battleStageView(): void {
        this.battleUI.active = true;
        this.lbTimes.node.active = false;
        this.countExpUI.active = false;
    }
}

