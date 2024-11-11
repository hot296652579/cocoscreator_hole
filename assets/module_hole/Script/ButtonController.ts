import { _decorator, Component, CCFloat, EventTouch, Input, math, Sprite, v3, Vec3, Button, NodeEventType, Label } from 'cc';
import { LevelManager } from './Manager/LevelMgr';
import { IAttributeConfig, LevelModel, TYPE_BLESSINGS } from './Model/LevelModel';
import { EventDispatcher } from '../../core_tgx/easy_ui_framework/EventDispatcher';
import { GameEvent } from './Enum/GameEvent';
import { tgxUIAlert, tgxUIMgr } from '../../core_tgx/tgx';
import { UI_AboutMe } from '../../scripts/UIDef';
import { UIAlert_Impl } from '../../module_basic/ui_alert/UI_Alert_Impl';
import { UI_HUD } from '../../module_basic/ui_hud/UI_HUD';
import { UIAlertOptions } from '../../core_tgx/easy_ui_framework/alert/UIAlert';
import { HoleManager } from './Manager/HoleMgr';
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
    }

    private upgradeTimeButton(): void {
        const { money } = this.getCurLevTimeJsonParam();
        let userMoney = LevelManager.instance.userModel.money;
        if (userMoney < money) {
            tgxUIAlert.show('穷逼充钱!');
            return;
        }
        this.upgradeButton(TYPE_BLESSINGS.TIME);
    }

    private upgradeSizeButton(): void {
        const { money } = this.getCurLevSizeJsonParam();
        let userMoney = LevelManager.instance.userModel.money;
        if (userMoney < money) {
            tgxUIAlert.show('穷逼充钱!');
            return;
        }
        this.upgradeButton(TYPE_BLESSINGS.SIZE);
    }

    private upgradeExpButton(): void {
        const { money } = this.getCurLevExpJsonParam();
        let userMoney = LevelManager.instance.userModel.money;
        if (userMoney < money) {
            tgxUIAlert.show('穷逼充钱!');
            return;
        }
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

            default:
                break;
        }
    }

    private updateBtTimeLv(): void {
        this.updateUpTimeView();
    }

    private updateBtSizeLv(): void {
        this.updateUpSizeView();
    }

    private updateBtExpLv(): void {
        this.updateUpExpView();
    }

    //刷新时间加成按钮UI
    private updateUpTimeView(): void {
        const { level, money } = this.getCurLevTimeJsonParam();
        let LbLevel: Label = this.btUpTime.node.getChildByName('LbLevel').getComponent(Label)!;
        let LbMoney: Label = this.btUpTime.node.getChildByName('LbMoney').getComponent(Label)!;
        LbLevel.string = `TIMER LVL.${level}`;
        LbMoney.string = `金币:${money}`;
    }

    //刷新黑洞等级加成按钮UI
    private updateUpSizeView(): void {
        const { level, money } = this.getCurLevSizeJsonParam();
        let LbLevel: Label = this.btUpSize.node.getChildByName('LbLevel').getComponent(Label)!;
        let LbMoney: Label = this.btUpSize.node.getChildByName('LbMoney').getComponent(Label)!;
        LbLevel.string = `TIMER LVL.${level}`;
        LbMoney.string = `金币:${money}`;
    }

    //刷新时间加成按钮UI
    private updateUpExpView(): void {
        const { level, money } = this.getCurLevExpJsonParam();
        let LbLevel: Label = this.btUpExp.node.getChildByName('LbLevel').getComponent(Label)!;
        let LbMoney: Label = this.btUpExp.node.getChildByName('LbMoney').getComponent(Label)!;
        LbLevel.string = `TIMER LVL.${level}`;
        LbMoney.string = `金币:${money}`;
    }

    private getCurLevTimeJsonParam(): IAttributeConfig {
        const levelModel = LevelManager.instance.levelModel;
        const { timesLevel } = levelModel;
        const attributeConfig = LevelManager.instance.getByTypeAndLevel(TYPE_BLESSINGS.TIME, timesLevel);
        return attributeConfig;
    }

    private getCurLevSizeJsonParam(): IAttributeConfig {
        const holeModel = HoleManager.instance.holeModel;
        const { holeLevel } = holeModel;
        const attributeConfig = LevelManager.instance.getByTypeAndLevel(TYPE_BLESSINGS.SIZE, holeLevel);
        return attributeConfig;
    }

    private getCurLevExpJsonParam(): IAttributeConfig {
        const levelModel = LevelManager.instance.levelModel;
        const { expMulLevel } = levelModel;
        const attributeConfig = LevelManager.instance.getByTypeAndLevel(TYPE_BLESSINGS.EXP, expMulLevel);
        return attributeConfig;
    }
}

