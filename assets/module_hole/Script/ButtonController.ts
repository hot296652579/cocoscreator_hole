import { _decorator, Component, CCFloat, EventTouch, Input, math, Sprite, v3, Vec3, Button, NodeEventType, Label } from 'cc';
import { LevelManager } from './Manager/LevelMgr';
import { LevelModel, TYPE_BLESSINGS } from './Model/LevelModel';
import { EventDispatcher } from '../../core_tgx/easy_ui_framework/EventDispatcher';
import { GameEvent } from './Enum/GameEvent';
const { ccclass, property } = _decorator;

/**
 * 底部按钮控制器
 */
@ccclass('ButtonController')
export class ButtonController extends Component {

    @property(Button)
    btUpTime: Button = null!;
    @property(Button)
    btUpSize: Button = null!;
    @property(Button)
    btUpExp: Button = null!;

    protected start() {
        this.addUIEvent();
        this.setupUIListeners();
    }

    private initilizeUI(): void {
        console.log(LevelManager.instance.levelModel.timesLevel);
        this.updateUpTimeView();
    }

    private addUIEvent(): void {
        this.btUpTime.node.on(NodeEventType.TOUCH_END, this.upgradeTimeButton, this);
        this.btUpSize.node.on(NodeEventType.TOUCH_END, this.upgradeSizeButton, this);
        this.btUpExp.node.on(NodeEventType.TOUCH_END, this.upgradeExpButton, this);
    }

    private setupUIListeners(): void {
        EventDispatcher.instance.on(GameEvent.EVENT_UI_INITILIZE, this.initilizeUI, this);
        EventDispatcher.instance.on(GameEvent.EVENT_TIME_LEVEL_UP, this.updateBtTimeLv, this);
        EventDispatcher.instance.on(GameEvent.EVENT_TIME_LEVEL_UP, this.updateBtTimeLv, this);
    }

    private upgradeTimeButton(): void {
        //DOTO 判断用户钱够不够
        this.upgradeButton(TYPE_BLESSINGS.TIME);
    }

    private upgradeSizeButton(): void {
        //DOTO 判断用户钱够不够
        this.upgradeButton(TYPE_BLESSINGS.SIZE);
    }

    private upgradeExpButton(): void {
        this.upgradeButton(TYPE_BLESSINGS.EXP);
    }

    private upgradeButton(type: number): void {
        switch (type) {
            case TYPE_BLESSINGS.TIME:
                LevelManager.instance.upgradeLevelTime();
                break;
            case TYPE_BLESSINGS.SIZE:
                LevelManager.instance.upgradeHoleLevelSize();
                break;

            default:
                break;
        }
    }

    private updateBtTimeLv(): void {
        this.updateUpTimeView();
    }

    private updateUpTimeView(): void {
        const levelModel = LevelManager.instance.levelModel;
        const { timesLevel } = levelModel;
        const attributeConfig = levelModel.getByTypeAndLevel(TYPE_BLESSINGS.TIME, timesLevel);
        const { level, money } = attributeConfig;
        let LbLevel: Label = this.btUpTime.node.getChildByName('LbLevel').getComponent(Label)!;
        let LbMoney: Label = this.btUpTime.node.getChildByName('LbMoney').getComponent(Label)!;
        LbLevel.string = `TIMER LVL.${level}`;
        LbMoney.string = `金币:${money}`;
    }
}

