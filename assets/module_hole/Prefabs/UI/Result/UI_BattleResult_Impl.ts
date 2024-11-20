import { WINDOWS } from "cc/env";
import { EventDispatcher } from "../../../../core_tgx/easy_ui_framework/EventDispatcher";
import { tgxModuleContext } from "../../../../core_tgx/tgx";
import { Layout_Setting } from "../../../../module_extra/ui_setting/Layout_Setting";
import { GameUILayers } from "../../../../scripts/GameUILayers";
import { UI_BattleResult } from "../../../../scripts/UIDef";
import { GameEvent } from "../../../Script/Enum/GameEvent";
import { LevelManager } from "../../../Script/Manager/LevelMgr";
import { Layout_BattleResult } from "./Layout_BattleResult";
import { isValid, Label } from "cc";
import { PropManager } from "../../../Script/Manager/PropMgr";
import { UserManager } from "../../../Script/Manager/UserMgr";

const delday = 30000;

export class UI_BattleResult_Impl extends UI_BattleResult {
    timeoutID: number;

    rewardBase: number = 0; //基础奖励
    rewardAdditional: number = 0; //额外奖励
    win: boolean = false;

    constructor() {
        super('Prefabs/UI/Result/UI_BattleResult', GameUILayers.POPUP, Layout_BattleResult);
    }

    public getRes(): [] {
        return [];
    }

    protected onCreated(): void {
        this.calculateReward();
        let layout = this.layout as Layout_BattleResult;
        this.onButtonEvent(layout.btGet, () => {
            this.onClickRewardBase(); //领取基础奖励
        });
        this.onButtonEvent(layout.btExtra, () => {
            this.onClickRewardAdditional(); //领取额外奖励
        });
        this.initilizeResult();
        this.closeByTimeout();
    }

    private initilizeResult(): void {
        this.win = this.getBattleWin();
        let layout = this.layout as Layout_BattleResult;
        let winNode = layout.winNode;
        let LoseNode = layout.LoseNode;
        winNode.active = this.win;
        LoseNode.active = !this.win;

        layout.btGet.node.getChildByName('lbGet').getComponent(Label).string = `${this.rewardBase}`;
        layout.btExtra.node.getChildByName('lbExtra').getComponent(Label).string = `${this.rewardAdditional}`;
    }

    //30s 无操作默认领取基础奖励
    private closeByTimeout(): void {
        setTimeout(() => {
            this.onClickRewardBase();
        }, delday);
    }

    private emitEvent(): void {
        if (this.win) {
            EventDispatcher.instance.emit(GameEvent.EVENT_BATTLE_SUCCESS_LEVEL_UP);
        } else {
            EventDispatcher.instance.emit(GameEvent.EVENT_BATTLE_FAIL_LEVEL_RESET);
        }
    }

    onClickRewardBase(): void {
        UserManager.instance.addMoney(this.rewardBase);
        EventDispatcher.instance.emit(GameEvent.EVENT_USER_MONEY_UPDATE);
        this.emitEvent();
        this.destoryMyself();
    }

    onClickRewardAdditional(): void {
        //DOTO 看广告
        UserManager.instance.addMoney(this.rewardAdditional);
        EventDispatcher.instance.emit(GameEvent.EVENT_USER_MONEY_UPDATE);
        this.emitEvent();
        this.destoryMyself();
    }

    private destoryMyself(): void {
        this.clearTimeoutHandler();
        if (isValid(this.node)) {
            this.node.removeFromParent();
            this.node.destroy();
        }
    }

    private getBattleWin(): boolean {
        const levelModel = LevelManager.instance.levelModel;
        const { battleIsWin } = levelModel;
        return battleIsWin;
    }

    /** 计算基础奖励和额外奖励*/
    private calculateReward(): void {
        const levelModel = LevelManager.instance.levelModel;
        const levelConfig = levelModel.levelConfig;
        const { reward_basics, reward_additional } = levelConfig;
        let total = PropManager.instance.getLevelTotalWeight() || 0;
        const { quality } = LevelManager.instance.levelModel; //关卡总质量
        const percent = (total * 100) / quality; // 放大到整数范围
        const rewardAdditional = Math.round(reward_basics * 100 + (reward_additional * percent)) / 100;
        this.rewardBase = reward_basics;
        this.rewardAdditional = rewardAdditional;
    }

    private clearTimeoutHandler(): void {
        if (this.timeoutID) {
            clearTimeout(this.timeoutID);
            this.timeoutID = null;
        }
    }
}

tgxModuleContext.attachImplClass(UI_BattleResult, UI_BattleResult_Impl);