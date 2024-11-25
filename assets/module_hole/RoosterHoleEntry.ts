import { Component, Label, Node, Prefab, ProgressBar, Tween, Vec3, _decorator, physics, tween, v3 } from 'cc';
import { EventDispatcher } from '../core_tgx/easy_ui_framework/EventDispatcher';
import { tgxUIMgr } from '../core_tgx/tgx';
import { UI_ExtraTime, UI_Magnetic, UI_TopInfo } from '../scripts/UIDef';
import { GameEvent } from './Script/Enum/GameEvent';
import { AdvertMgr } from './Script/Manager/AdvertMgr';
import { HoleGameAudioMgr } from './Script/Manager/HoleGameAudioMgr';
import { HoleManager } from './Script/Manager/HoleMgr';
import { LevelManager } from './Script/Manager/LevelMgr';
import { PropManager } from './Script/Manager/PropMgr';
import { UserManager } from './Script/Manager/UserMgr';
import { TYPE_GAME_STATE } from './Script/Model/LevelModel';
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
        // physics.PhysicsSystem.instance.fixedTimeStep = 1 / 60; // 固定为 60 帧
        // physics.PhysicsSystem.instance.maxSubSteps = 2; // 限制物理步数

        HoleGameAudioMgr.initilize();
        AdvertMgr.instance.initilize();
        this.initilize();
        this.addEventListen();
    }

    initilize() {
        this.initilizeUI();
        PropManager.instance.parent = this.node;
        LevelManager.instance.parent = this.node;
        LevelManager.instance.levelPrefabs = this.levelPrefabs;
        LevelManager.instance.battlePrefab = this.battlePrefab;

        LevelManager.instance.initilizeModel();
        UserManager.instance.initilizeModel();
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
        EventDispatcher.instance.on(GameEvent.EVENT_ADD_EXTRATIME, this.addExtraTime, this);
        EventDispatcher.instance.on(GameEvent.EVENT_BATTLE_SUCCESS_LEVEL_UP, this.levelUpHandler, this);
        EventDispatcher.instance.on(GameEvent.EVENT_BATTLE_FAIL_LEVEL_RESET, this.resetGameByLose, this);
        EventDispatcher.instance.on(GameEvent.EVENT_FINISH_EAT_ENTER_BATTLE, this.enterBattle, this);
    }

    protected onDestroy(): void {
        EventDispatcher.instance.off(GameEvent.EVENT_GAME_START, this.onGameStart);
        EventDispatcher.instance.off(GameEvent.EVENT_TIME_LEVEL_UP, this.updateCountLb);
        EventDispatcher.instance.off(GameEvent.EVENT_HOLE_EXP_UPDATE, this.updateUserHoleExp);
        EventDispatcher.instance.off(GameEvent.EVENT_ADD_EXTRATIME, this.addExtraTime, this);
        EventDispatcher.instance.off(GameEvent.EVENT_BATTLE_SUCCESS_LEVEL_UP, this.levelUpHandler);
        EventDispatcher.instance.off(GameEvent.EVENT_BATTLE_FAIL_LEVEL_RESET, this.resetGameByLose);
        EventDispatcher.instance.off(GameEvent.EVENT_FINISH_EAT_ENTER_BATTLE, this.enterBattle);
    }

    onGameStart() {
        const levelTimeTotal = LevelManager.instance.levelModel.levelTimeTotal;
        this.startCountdown(levelTimeTotal);
    }

    startCountdown(count: number) {
        if (this.gaming) return;

        this.gaming = true;
        this.btnsLayout.active = false;
        //倒计时启动
        const levelTimeTotal = count;
        this.countdown = levelTimeTotal;
        this.schedule(this.updateCountdown, 1);
    }

    private addExtraTime(add: Boolean): void {
        if (add) {
            this.gaming = false;
            const { extraTime } = LevelManager.instance.levelModel.mainConfigModel;
            this.updateCountLb(extraTime);
            this.startCountdown(extraTime);

            LevelManager.instance.levelModel.curGameState = TYPE_GAME_STATE.GAME_STATE_START;
        } else {
            this.unschedule(this.updateCountdown);
            this.enterBattle();
        }
    }

    private updateCountdown() {
        this.countdown--;
        if (this.countdown <= 0) {
            LevelManager.instance.levelModel.curGameState = TYPE_GAME_STATE.GAME_STATE_END;
            this.unschedule(this.updateCountdown);
            const isExceed = LevelManager.instance.isExceedingPercent();
            const { extraTimePop } = LevelManager.instance.levelModel;

            if (extraTimePop) {
                this.enterBattle(); //弹过时间加成弹窗直接进去战斗
            } else {
                if (isExceed) {
                    this.enterBattle(); // 超过关卡比例直接进入战斗
                } else {
                    tgxUIMgr.inst.showUI(UI_ExtraTime);
                    LevelManager.instance.levelModel.extraTimePop = true;
                }
            }
            return
        }

        const formatStr = GameUtil.formatToTimeString(this.countdown);
        this.lbTimes.string = `${formatStr}`;
    }

    private enterBattle(): void {
        this.unschedule(this.updateCountdown);
        this.battleStageView();
        LevelManager.instance.loadBattle();
    }

    private updateCountLb(addTime?: number): void {
        let timeCount = addTime ?? LevelManager.instance.levelModel.levelTimeTotal;
        const formatStr = GameUtil.formatToTimeString(timeCount);
        this.lbTimes.string = `${formatStr}`;

        if (addTime) {
            this.timeUpdateTween(addTime);
        }
    }

    private timeUpdateTween(timeUpdate: number): void {
        const target = this.countExpUI.getChildByName('LbUpEffect')!.getComponent(Label)!;
        const originalPosition = v3(0, -100, 0);
        const targetY = -50;
        target.string = `update ${timeUpdate}s`;

        Tween.stopAllByTarget(target.node);
        target.node.setPosition(originalPosition)
        target!.node.active = true;
        tween(target.node)
            .to(0.5, { position: new Vec3(originalPosition.x, targetY, originalPosition.z) })
            .call(() => {
                target.node!.active = false;
                target.node.setPosition(originalPosition);
            })
            .start();
    }

    private updateUserHoleExp(): void {
        const total = this.expProgress.totalLength;
        const holeModel = HoleManager.instance.holeModel;
        const { exp, curHoleExpL } = holeModel;

        if (exp <= 0) {
            return;
        }

        const precision = 10000;
        const progressRatio = Math.floor((curHoleExpL * precision) / exp) / precision;
        const progressLength = progressRatio * total;
        // console.log(`当前经验进度: ${progressLength}, 总进度: ${total} progressLength:${progressLength / total}`)
        this.expProgress.progress = progressLength / total;
    }

    /** 关卡升级*/
    private levelUpHandler(): void {
        LevelManager.instance.clearLevelData();
        LevelManager.instance.resetAddition();
        LevelManager.instance.upgradeLevel();

        this.loadLevelInfo();
        this.prepStageView();
        LevelManager.instance.levelModel.curGameState = TYPE_GAME_STATE.GAME_STATE_INIT;
    }

    /** 闯关失败重载当前关卡*/
    private resetGameByLose(): void {
        LevelManager.instance.clearLevelData();
        HoleManager.instance.reBornByLevelLose();

        this.loadLevelInfo();
        this.prepStageView();
        this.updateUserHoleExp();
        LevelManager.instance.levelModel.curGameState = TYPE_GAME_STATE.GAME_STATE_INIT;
    }

    private loadLevelInfo(): void {
        const { level } = LevelManager.instance.levelModel;
        LevelManager.instance.loadLevel(level);
    }

    /** 准备阶段界面*/
    private prepStageView(): void {
        HoleGameAudioMgr.play(HoleGameAudioMgr.getMusicIdName(2), 1.0);
        this.gaming = false;
        this.battleUI.active = false;
        this.btnsLayout.active = true;
        this.countExpUI.active = true;
        this.updateCountLb();
        this.updateUserHoleExp();
        // tgxUIMgr.inst.showUI(UI_Magnetic);
    }

    /** 战斗阶段界面*/
    private battleStageView(): void {
        this.battleUI.active = true;
        this.countExpUI.active = false;
    }
}

