import { _decorator, Component, Label, Prefab, Node, Game } from 'cc';
import { LevelManager } from './Script/Manager/LevelMgr';
import { EventDispatcher } from '../core_tgx/easy_ui_framework/EventDispatcher';
import { GameEvent } from './Script/Enum/GameEvent';
import { PropManager } from './Script/Manager/PropMgr';
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

    private countdown: number = 0;
    private gaming: boolean = false;
    private isWin: boolean = false;

    start() {
        this.initilize();
        this.addEventListen();
    }

    initilize() {
        LevelManager.instance.parent = this.node;
        PropManager.instance.parent = this.node;
        LevelManager.instance.levelPrefabs = this.levelPrefabs;

        LevelManager.instance.initilizeModel();
        const { level } = LevelManager.instance.levelModel;
        LevelManager.instance.loadLevel(level);

        PropManager.instance.initilizeUI();
        EventDispatcher.instance.emit(GameEvent.EVENT_UI_INITILIZE);//去通知界面初始化

        this.updateCountLb();
    }

    addEventListen() {
        EventDispatcher.instance.on(GameEvent.EVENT_GAME_START, this.onGameStart, this);
        EventDispatcher.instance.on(GameEvent.EVENT_TIME_LEVEL_UP, this.updateCountLb, this);
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
                LevelManager.instance.upgradeLevel();
                const { level } = LevelManager.instance.levelModel;
                LevelManager.instance.loadLevel(level);
            } else {
                this.resetGame();
                return
            }
        }
        this.lbTimes.string = `倒计时:${this.countdown}`;
    }

    private updateCountLb(): void {
        const { levelTimeTotal } = LevelManager.instance.levelModel;
        console.log(`levelTimeTotal:${levelTimeTotal}`);
        this.lbTimes.string = `倒计时:${levelTimeTotal}`;
    }

    /** 重载当前关卡*/
    private resetGame() {
        this.gaming = false;

        const layoutBtns = this.gameUI.getChildByName('BtnsLayout');
        layoutBtns.active = true;
        this.updateCountLb();

        const { level } = LevelManager.instance.levelModel;
        LevelManager.instance.loadLevel(level);
    }

    update(deltaTime: number) {

    }
}

