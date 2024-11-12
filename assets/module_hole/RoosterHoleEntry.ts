import { _decorator, Component, Label, Prefab, Node, Game, ProgressBar, CCBoolean } from 'cc';
import { LevelManager } from './Script/Manager/LevelMgr';
import { EventDispatcher } from '../core_tgx/easy_ui_framework/EventDispatcher';
import { GameEvent } from './Script/Enum/GameEvent';
import { PropManager } from './Script/Manager/PropMgr';
import { HoleManager } from './Script/Manager/HoleMgr';
import { UserManager } from './Script/Manager/UserMgr';
const { ccclass, property } = _decorator;

@ccclass('RoosterHoleEntry')
export class RoosterHoleEntry extends Component {
    @property(Prefab)
    levelPrefabs: Prefab[] = [];

    @property(Node)
    gameUI: Node = null;

    @property(Prefab)
    expPrefab: Prefab = null!;

    @property(Label)
    lbTimes: Label = null!;

    @property(ProgressBar)
    expProgress: ProgressBar = null!;

    private countdown: number = 0;
    private gaming: boolean = false;

    @property({ type: CCBoolean, visible: true, displayName: '测试输赢' })
    isWin: boolean = false;

    start() {
        this.initilize();
        this.addEventListen();
    }

    initilize() {
        LevelManager.instance.parent = this.node;
        PropManager.instance.parent = this.node;
        LevelManager.instance.levelPrefabs = this.levelPrefabs;

        UserManager.instance.initilizeModel();
        LevelManager.instance.initilizeModel();
        HoleManager.instance.initilizeModel();
        const { level } = LevelManager.instance.levelModel;
        LevelManager.instance.loadLevel(level);

        PropManager.instance.initilizeUI();
        EventDispatcher.instance.emit(GameEvent.EVENT_UI_INITILIZE);//去通知界面初始化

        this.updateCountLb();
        this.updateExpProgress();
    }

    addEventListen() {
        EventDispatcher.instance.on(GameEvent.EVENT_GAME_START, this.onGameStart, this);
        EventDispatcher.instance.on(GameEvent.EVENT_TIME_LEVEL_UP, this.updateCountLb, this);
        EventDispatcher.instance.on(GameEvent.EVENT_HOLE_EXP_UPDATE, this.updateExpProgress, this);
        EventDispatcher.instance.on(GameEvent.EVENT_USER_MONEY_UPDATE, this.updateUserInfo, this);
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

        const layoutBtns = this.gameUI.getChildByName('BtnsLayout');
        layoutBtns.active = false;
        //倒计时启动
        const levelTimeTotal = LevelManager.instance.levelModel.levelTimeTotal;
        this.countdown = levelTimeTotal;
        this.schedule(this.updateCountdown, 1);
    }

    private updateCountdown() {
        this.countdown--;
        if (this.countdown <= 0) {
            this.unschedule(this.updateCountdown);
            //DOTO 进入战斗场景
            if (this.isWin) {
                this.levelUpHandler();
            } else {
                this.resetGameByLose();
                return
            }
        }
        this.lbTimes.string = `倒计时:${this.countdown}`;
    }

    private updateUserInfo(): void {
        const lb = this.gameUI.getChildByName('LbUserMoney').getComponent(Label)!;
        const { money } = UserManager.instance.userModel;
        lb.string = `金币:${money}`;
    }

    private updateCountLb(): void {
        const { levelTimeTotal } = LevelManager.instance.levelModel;
        console.log(`levelTimeTotal:${levelTimeTotal}`);
        this.lbTimes.string = `倒计时:${levelTimeTotal}`;
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
        LevelManager.instance.upgradeLevel();
        this.loadLevelInfo();

        HoleManager.instance.reBornLevel();
        LevelManager.instance.resetAddition();

        this.showBtnsLayout();
    }

    /** 失败重载当前关卡*/
    private resetGameByLose(): void {
        this.loadLevelInfo();
        this.showBtnsLayout();
        HoleManager.instance.resetExPByLose();
    }

    private loadLevelInfo(): void {
        const { level } = LevelManager.instance.levelModel;
        LevelManager.instance.loadLevel(level);
    }

    private showBtnsLayout(): void {
        this.gaming = false;
        const layoutBtns = this.gameUI.getChildByName('BtnsLayout');
        layoutBtns.active = true;
        this.updateCountLb();
    }
}

