import { _decorator, Component, Button, NodeEventType, Label, Node } from 'cc';
import { LevelManager } from './Manager/LevelMgr';
import { TYPE_BLESSINGS } from './Model/LevelModel';
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
    @property(Button) btUpTime: Button = null!;
    @property(Button) btUpSize: Button = null!;
    @property(Button) btUpExp: Button = null!;

    protected start() {
        this.addUIEvent();
        this.setupUIListeners();
    }

    private onResetAddition(): void {
        this.updateBtTimeLv();
        this.updateBtSizeLv();
        this.updateBtExpLv();
    }

    private addUIEvent(): void {
        this.btUpTime.node.on(NodeEventType.TOUCH_END, () => this.handleUpgrade(TYPE_BLESSINGS.TIME), this);
        this.btUpSize.node.on(NodeEventType.TOUCH_END, () => this.handleUpgrade(TYPE_BLESSINGS.SIZE), this);
        this.btUpExp.node.on(NodeEventType.TOUCH_END, () => this.handleUpgrade(TYPE_BLESSINGS.EXP), this);
    }

    private setupUIListeners(): void {
        const events = [
            { event: GameEvent.EVENT_UI_INITILIZE, handler: this.onResetAddition },
            { event: GameEvent.EVENT_TIME_LEVEL_UP, handler: this.updateBtTimeLv },
            { event: GameEvent.EVENT_TIME_LEVEL_MAX, handler: () => this.updateBtLvMax(TYPE_BLESSINGS.TIME) },
            { event: GameEvent.EVENT_EXP_LEVEL_UP, handler: this.updateBtExpLv },
            { event: GameEvent.EVENT_EXP_LEVEL_MAX, handler: () => this.updateBtLvMax(TYPE_BLESSINGS.EXP) },
            { event: GameEvent.EVENT_HOLE_LEVEL_SIEZE_UP, handler: this.updateBtSizeLv },
            { event: GameEvent.EVENT_HOLE_LEVEL_SIEZE_MAX, handler: () => this.updateBtLvMax(TYPE_BLESSINGS.SIZE) },
            { event: GameEvent.EVENT_LEVEL_UP_RESET, handler: this.onResetAddition },
            { event: GameEvent.EVENT_USER_MONEY_UPDATE, handler: this.updateUserMoney },
        ];

        events.forEach(({ event, handler }) =>
            EventDispatcher.instance.on(event, handler, this)
        );
    }

    private handleUpgrade(type: TYPE_BLESSINGS): void {
        const { money } = this.getCurrentLevelParam(type);
        const enough = UserManager.instance.checkEnough(money);

        if (!enough) {
            AdvertMgr.instance.showReawardVideo(() => this.performUpgrade(type));
        } else {
            UserManager.instance.deductMoney(money);
            this.performUpgrade(type);
        }
    }

    /** 对应类型升级*/
    private performUpgrade(type: TYPE_BLESSINGS): void {
        switch (type) {
            case TYPE_BLESSINGS.TIME:
                LevelManager.instance.upgradeLevelTime();
                break;
            case TYPE_BLESSINGS.SIZE:
                HoleManager.instance.upgradeLevel();
                break;
            case TYPE_BLESSINGS.EXP:
                LevelManager.instance.upgradeLevelExp();
                EventDispatcher.instance.emit(GameEvent.EVENT_TIME_ENERGY_EFFECT);
                break;
        }
    }

    private updateBtLvMax(type: TYPE_BLESSINGS): void {
        this.updateButtonView(type, true);
    }

    private updateBtTimeLv(): void {
        this.updateButtonView(TYPE_BLESSINGS.TIME);
        this.updateButtonFreeState(TYPE_BLESSINGS.TIME);
    }

    private updateBtSizeLv(): void {
        this.updateButtonView(TYPE_BLESSINGS.SIZE);
        this.updateButtonFreeState(TYPE_BLESSINGS.SIZE);
    }

    private updateBtExpLv(): void {
        this.updateButtonView(TYPE_BLESSINGS.EXP);
        this.updateButtonFreeState(TYPE_BLESSINGS.EXP);
    }

    /** 显示金币按钮或广告图标*/
    private updateButtonFreeState(type: TYPE_BLESSINGS): void {
        const { money } = this.getCurrentLevelParam(type);
        const enough = UserManager.instance.checkEnough(money);

        const buttonNode = this.getButtonNodeByType(type);
        const used = buttonNode.getChildByPath('Bt/Used')!;
        const free = buttonNode.getChildByPath('Bt/Free')!;

        used.active = enough;
        free.active = !enough;
    }

    private updateUserMoney(): void {
        const typeArr = [TYPE_BLESSINGS.TIME, TYPE_BLESSINGS.SIZE, TYPE_BLESSINGS.EXP];
        typeArr.forEach(type =>
            this.updateButtonFreeState(type)
        );
    }

    private updateButtonView(type: TYPE_BLESSINGS, max: boolean = false): void {
        const buttonNode = this.getButtonNodeByType(type);
        const lbLevel: Label = buttonNode.getChildByName('LbLevel').getComponent(Label)!;
        const lbMoney: Label = buttonNode.getChildByPath('Bt/Used/LbMoney')?.getComponent(Label)!;

        if (max) {
            lbLevel.string = 'LVL.Max';
            lbMoney.string = 'Max';
            buttonNode.off(NodeEventType.TOUCH_END);
            buttonNode.getComponent(Button)!.enabled = false;
        } else {
            const { level, money } = this.getCurrentLevelParam(type);
            lbLevel.string = `LVL.${level}`;
            lbMoney.string = `${money}`;
        }
    }

    private getButtonNodeByType(type: TYPE_BLESSINGS): Node {
        return {
            [TYPE_BLESSINGS.TIME]: this.btUpTime.node,
            [TYPE_BLESSINGS.SIZE]: this.btUpSize.node,
            [TYPE_BLESSINGS.EXP]: this.btUpExp.node,
        }[type];
    }

    private getCurrentLevelParam(type: TYPE_BLESSINGS) {
        const { timesLevel, expMulLevel } = LevelManager.instance.levelModel;
        const { holeLevel } = HoleManager.instance.holeModel;

        return LevelManager.instance.getByTypeAndLevel(
            type,
            type === TYPE_BLESSINGS.TIME ? timesLevel :
                type === TYPE_BLESSINGS.SIZE ? holeLevel : expMulLevel
        );
    }
}
