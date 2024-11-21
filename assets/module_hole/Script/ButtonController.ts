import { _decorator, Component, CCFloat, EventTouch, math, Sprite, v3, Vec3, Button, NodeEventType, Label, Node } from 'cc';
import { LevelManager } from './Manager/LevelMgr';
import { IAttributeConfig, LevelModel, TYPE_BLESSINGS } from './Model/LevelModel';
import { EventDispatcher } from '../../core_tgx/easy_ui_framework/EventDispatcher';
import { GameEvent } from './Enum/GameEvent';
import { HoleManager } from './Manager/HoleMgr';
import { UserManager } from './Manager/UserMgr';
import { AdvertMgr } from './Manager/AdvertMgr';
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
        // this.updateUpTimeView();
        this.onResetAddition();
    }

    private addUIEvent(): void {
        this.btUpTime.node.on(NodeEventType.TOUCH_END, this.upgradeTimeButton, this);
        this.btUpSize.node.on(NodeEventType.TOUCH_END, this.upgradeSizeButton, this);
        this.btUpExp.node.on(NodeEventType.TOUCH_END, this.upgradeExpButton, this);
    }

    private setupUIListeners(): void {
        EventDispatcher.instance.on(GameEvent.EVENT_UI_INITILIZE, this.initilizeUI, this);
        EventDispatcher.instance.on(GameEvent.EVENT_TIME_LEVEL_UP, this.updateBtTimeLv, this);
        EventDispatcher.instance.on(GameEvent.EVENT_TIME_LEVEL_MAX, this.updateBtTimeLvMax, this);
        EventDispatcher.instance.on(GameEvent.EVENT_EXP_LEVEL_UP, this.updateBtExpLv, this);
        EventDispatcher.instance.on(GameEvent.EVENT_EXP_LEVEL_MAX, this.updateBtExpLvMax, this);
        EventDispatcher.instance.on(GameEvent.EVENT_HOLE_LEVEL_SIEZE_UP, this.updateBtSizeLv, this);
        EventDispatcher.instance.on(GameEvent.EVENT_HOLE_LEVEL_SIEZE_MAX, this.updateBtSizeLvMax, this);
        EventDispatcher.instance.on(GameEvent.EVENT_LEVEL_UP_RESET, this.onResetAddition, this);

        EventDispatcher.instance.on(GameEvent.EVENT_USER_MONEY_UPDATE, this.updateUserMoeny, this);
    }

    private upgradeTimeButton(): void {
        const config = this.getCurrentLevelParam(TYPE_BLESSINGS.TIME);
        const { money } = config;
        const enough = UserManager.instance.checkEnough(money);

        if (!enough) {
            this.showAdHandler(() => {
                this.upgradeButton(TYPE_BLESSINGS.TIME);
            })
            return;
        }

        UserManager.instance.deductMoney(money);
        this.upgradeButton(TYPE_BLESSINGS.TIME);
    }

    private timeEnoughShowFree(): void {
        const config = this.getCurrentLevelParam(TYPE_BLESSINGS.TIME);
        const { money } = config;
        const enough = UserManager.instance.checkEnough(money);

        let used = this.btUpTime.node.getChildByPath('Bt/Used')!;
        let free = this.btUpTime.node.getChildByPath('Bt/Free')!;

        if (!enough) {
            used.active = enough;
            free.active = !enough;
        } else {
            used.active = enough;
            free.active = !enough;
        }
    }

    private upgradeSizeButton(): void {
        const { money } = this.getCurrentLevelParam(TYPE_BLESSINGS.SIZE);
        const enough = UserManager.instance.checkEnough(money);

        if (!enough) {
            this.showAdHandler(() => {
                this.upgradeButton(TYPE_BLESSINGS.SIZE);
            })
            return;
        }

        UserManager.instance.deductMoney(money);
        this.upgradeButton(TYPE_BLESSINGS.SIZE);
    }

    private sizeEnoughShowFree(): void {
        const config = this.getCurrentLevelParam(TYPE_BLESSINGS.SIZE);
        const { money } = config;
        const enough = UserManager.instance.checkEnough(money);

        let used = this.btUpSize.node.getChildByPath('Bt/Used')!;
        let free = this.btUpSize.node.getChildByPath('Bt/Free')!;

        if (!enough) {
            used.active = enough;
            free.active = !enough;
        } else {
            used.active = enough;
            free.active = !enough;
        }
    }

    private upgradeExpButton(): void {
        const { money } = this.getCurrentLevelParam(TYPE_BLESSINGS.EXP);
        const enough = UserManager.instance.checkEnough(money);

        if (!enough) {
            this.showAdHandler(() => {
                this.upgradeButton(TYPE_BLESSINGS.EXP);
            })
            return;
        }

        UserManager.instance.deductMoney(money);
        this.upgradeButton(TYPE_BLESSINGS.EXP);
    }

    private expEnoughShowFree(): void {
        const config = this.getCurrentLevelParam(TYPE_BLESSINGS.EXP);
        const { money } = config;
        const enough = UserManager.instance.checkEnough(money);

        let used = this.btUpExp.node.getChildByPath('Bt/Used')!;
        let free = this.btUpExp.node.getChildByPath('Bt/Free')!;

        if (!enough) {
            used.active = enough;
            free.active = !enough;
        } else {
            used.active = enough;
            free.active = !enough;
        }
    }

    private showAdHandler(cb: () => void): void {
        AdvertMgr.instance.showReawardVideo(() => {
            cb && cb();
        });
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

    private updateUserMoeny(): void {
        this.timeEnoughShowFree();
        this.sizeEnoughShowFree();
        this.expEnoughShowFree();
    }

    private onResetAddition(): void {
        this.updateBtTimeLv();
        this.updateBtSizeLv();
        this.updateBtExpLv();
    }

    private updateButtonViewByType(type: TYPE_BLESSINGS, isMax: boolean = false): void {
        this.updateButtonView(type, isMax);
    }

    private updateBtTimeLv(): void {
        this.updateButtonViewByType(TYPE_BLESSINGS.TIME);
        this.timeEnoughShowFree();
    }

    private updateBtTimeLvMax(): void {
        this.updateButtonViewByType(TYPE_BLESSINGS.TIME, true);
    }

    private updateBtExpLv(): void {
        this.updateButtonViewByType(TYPE_BLESSINGS.EXP);
        this.expEnoughShowFree();
    }

    private updateBtExpLvMax(): void {
        this.updateButtonViewByType(TYPE_BLESSINGS.EXP, true);
    }

    private updateBtSizeLv(): void {
        this.updateButtonViewByType(TYPE_BLESSINGS.SIZE);
        this.sizeEnoughShowFree();
    }

    private updateBtSizeLvMax(): void {
        this.updateButtonViewByType(TYPE_BLESSINGS.SIZE, true);
    }


    private updateButtonView(type: number, max?: boolean): void {
        const buttonNode = this.getButtonNodeByType(type);
        const lbLevel: Label = buttonNode.getChildByName('LbLevel').getComponent(Label)!;
        const bt = buttonNode.getChildByName('Bt');
        const lbMoney: Label = bt.getChildByPath('Used/LbMoney')?.getComponent(Label)!;
        if (!max) {
            const { level, money } = this.getCurrentLevelParam(type);
            lbLevel.string = `LVL.${level}`;
            lbMoney.string = `${money}`;
        } else {
            lbLevel.string = `LVL.Max`;
            lbMoney.string = `Max`;

            if (buttonNode.name == 'BtnUpTime') {
                buttonNode.off(NodeEventType.TOUCH_END, this.upgradeTimeButton, this);
            } else if (buttonNode.name == 'BtnUpExp') {
                buttonNode.off(NodeEventType.TOUCH_END, this.upgradeExpButton, this);
            } else {
                buttonNode.off(NodeEventType.TOUCH_END, this.upgradeSizeButton, this);
            }

            buttonNode.getComponent(Button)!.enabled = false;
        }
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

