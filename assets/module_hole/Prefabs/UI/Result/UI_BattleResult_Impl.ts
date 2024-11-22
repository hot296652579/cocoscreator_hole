import { isValid, Label } from "cc";
import { EventDispatcher } from "../../../../core_tgx/easy_ui_framework/EventDispatcher";
import { tgxModuleContext } from "../../../../core_tgx/tgx";
import { GameUILayers } from "../../../../scripts/GameUILayers";
import { UI_BattleResult } from "../../../../scripts/UIDef";
import { GameEvent } from "../../../Script/Enum/GameEvent";
import { HoleGameAudioMgr } from "../../../Script/Manager/HoleGameAudioMgr";
import { LevelManager } from "../../../Script/Manager/LevelMgr";
import { PropManager } from "../../../Script/Manager/PropMgr";
import { UserManager } from "../../../Script/Manager/UserMgr";
import { Layout_BattleResult } from "./Layout_BattleResult";
import { AdvertMgr } from "../../../Script/Manager/AdvertMgr";

const delday = 30000;

export class UI_BattleResult_Impl extends UI_BattleResult {
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
            HoleGameAudioMgr.playOneShot(HoleGameAudioMgr.getMusicIdName(5), 1.0);
            this.onClickRewardBase(); //领取基础奖励
        });
        this.onButtonEvent(layout.btExtra, () => {
            HoleGameAudioMgr.playOneShot(HoleGameAudioMgr.getMusicIdName(5), 1.0);
            this.addAdverHandler(); //看广告领取额外奖励
        });
        this.initilizeResult();
    }

    private initilizeResult(): void {
        this.win = LevelManager.instance.judgeWin();
        let layout = this.layout as Layout_BattleResult;
        let winNode = layout.winNode;
        let LoseNode = layout.LoseNode;
        winNode.active = this.win;
        LoseNode.active = !this.win;

        layout.btGet.node.getChildByName('lbGet').getComponent(Label).string = `${this.rewardBase}`;
        layout.btExtra.node.getChildByName('lbExtra').getComponent(Label).string = `${this.rewardAdditional}`;

        const soundId = this.win ? 11 : 12;
        HoleGameAudioMgr.playOneShot(HoleGameAudioMgr.getMusicIdName(soundId), 1.0);
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

    private addAdverHandler(): void {
        AdvertMgr.instance.showReawardVideo(() => {
            UserManager.instance.addMoney(this.rewardAdditional);
            EventDispatcher.instance.emit(GameEvent.EVENT_USER_MONEY_UPDATE);
            this.emitEvent();
            this.destoryMyself();
        })
    }

    private destoryMyself(): void {
        if (isValid(this.node)) {
            this.node.removeFromParent();
            this.node.destroy();
        }
    }

    /** 计算基础奖励和额外奖励*/
    private calculateReward(): void {
        const levelModel = LevelManager.instance.levelModel;
        const levelConfig = levelModel.levelConfig;
        const { reward_basics, reward_additional } = levelConfig;
        let total = PropManager.instance.getLevelTotalWeight() || 0;
        const { quality } = LevelManager.instance.levelModel; //关卡总质量
        const percent = (total * 100) / quality; // 放大到整数范围
        const rewardAdditional = Math.round((reward_basics * 100 + (reward_additional * percent)) / 100);
        this.rewardBase = reward_basics;
        this.rewardAdditional = rewardAdditional;
    }
}

tgxModuleContext.attachImplClass(UI_BattleResult, UI_BattleResult_Impl);