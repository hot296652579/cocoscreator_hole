import { _decorator, Component, CCFloat, EventTouch, math, Sprite, v3, Vec3, Button, NodeEventType, Label, Node } from 'cc';
import { LevelManager } from './Manager/LevelMgr';
import { IAttributeConfig, LevelModel, TYPE_BLESSINGS } from './Model/LevelModel';
import { EventDispatcher } from '../../core_tgx/easy_ui_framework/EventDispatcher';
import { GameEvent } from './Enum/GameEvent';
import { HoleManager } from './Manager/HoleMgr';
import { UserManager } from './Manager/UserMgr';
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
        EventDispatcher.instance.on(GameEvent.EVENT_EXP_LEVEL_UP, this.updateBtExpLv, this);
        EventDispatcher.instance.on(GameEvent.EVENT_HOLE_LEVEL_SIEZE_UP, this.updateBtSizeLv, this);
        EventDispatcher.instance.on(GameEvent.EVENT_LEVEL_UP_RESET, this.onResetAddition, this);
    }

    private upgradeTimeButton(): void {
        const { money } = this.getCurrentLevelParam(TYPE_BLESSINGS.TIME);
        const enough = UserManager.instance.checkEnough(money);
        if (!enough) {
            return;
        }

        UserManager.instance.deductMoney(money);
        this.upgradeButton(TYPE_BLESSINGS.TIME);
    }

    private upgradeSizeButton(): void {
        const { money } = this.getCurrentLevelParam(TYPE_BLESSINGS.SIZE);
        const enough = UserManager.instance.checkEnough(money);
        if (!enough) {
            return;
        }

        UserManager.instance.deductMoney(money);
        this.upgradeButton(TYPE_BLESSINGS.SIZE);
    }

    private upgradeExpButton(): void {
        const { money } = this.getCurrentLevelParam(TYPE_BLESSINGS.EXP);
        const enough = UserManager.instance.checkEnough(money);
        if (!enough) {
            return;
        }

        UserManager.instance.deductMoney(money);
        this.upgradeButton(TYPE_BLESSINGS.EXP);
    }

    private upgradeButton(type: number): void {
        switch (type) {
            case TYPE_BLESSINGS.TIME:
                LevelManager.instance.upgradeLevelTime();
                break;
            case TYPE_BLESSINGS.SIZE:
                HoleManager.instance.upgradeLevel();
                break;
            case TYPE_BLESSINGS.EXP:
                LevelManager.instance.upgradeLevelExp();
                break;
        }
    }

    private onResetAddition(): void {
        this.updateBtTimeLv();
        this.updateBtSizeLv();
        this.updateBtExpLv();
    }

    private updateBtTimeLv(): void {
        this.updateButtonView(TYPE_BLESSINGS.TIME);
    }

    private updateBtSizeLv(): void {
        this.updateButtonView(TYPE_BLESSINGS.SIZE);
    }

    private updateBtExpLv(): void {
        this.updateButtonView(TYPE_BLESSINGS.EXP);
    }

    private updateButtonView(type: number): void {
        const { level, money } = this.getCurrentLevelParam(type);
        const buttonNode = this.getButtonNodeByType(type);
        const LbLevel: Label = buttonNode.getChildByName('LbLevel').getComponent(Label)!;
        const LbMoney: Label = buttonNode.getChildByName('LbMoney').getComponent(Label)!;

        LbLevel.string = `${this.getLabelPrefix(type)} LVL.${level}`;
        LbMoney.string = `金币:${money}`;
    }

    private getLabelPrefix(type: number): string {
        switch (type) {
            case TYPE_BLESSINGS.TIME:
                return "TIMER";
            case TYPE_BLESSINGS.SIZE:
                return "SIZE";
            case TYPE_BLESSINGS.EXP:
                return "EXP";
        }
    }

    private updateUpTimeView(): void {
        const { level, money } = this.getCurrentLevelParam(TYPE_BLESSINGS.TIME);
        let LbLevel: Label = this.btUpTime.node.getChildByName('LbLevel').getComponent(Label)!;
        let LbMoney: Label = this.btUpTime.node.getChildByName('LbMoney').getComponent(Label)!;
        LbLevel.string = `TIMER LVL.${level}`;
        LbMoney.string = `金币:${money}`;
    }

    private getButtonNodeByType(type: number): Node {
        switch (type) {
            case TYPE_BLESSINGS.TIME:
                return this.btUpTime.node;
            case TYPE_BLESSINGS.SIZE:
                return this.btUpSize.node;
            case TYPE_BLESSINGS.EXP:
                return this.btUpExp.node;
        }
    }

    private getCurrentLevelParam(type: number): IAttributeConfig {
        switch (type) {
            case TYPE_BLESSINGS.TIME:
                const { timesLevel } = LevelManager.instance.levelModel;
                return LevelManager.instance.getByTypeAndLevel(TYPE_BLESSINGS.TIME, timesLevel);
            case TYPE_BLESSINGS.SIZE:
                const { holeLevel } = HoleManager.instance.holeModel;
                return LevelManager.instance.getByTypeAndLevel(TYPE_BLESSINGS.SIZE, holeLevel);
            case TYPE_BLESSINGS.EXP:
                const { expMulLevel } = LevelManager.instance.levelModel;
                return LevelManager.instance.getByTypeAndLevel(TYPE_BLESSINGS.EXP, expMulLevel);
        }
    }
}

