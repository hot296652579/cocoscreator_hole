import { WINDOWS } from "cc/env";
import { EventDispatcher } from "../../../../core_tgx/easy_ui_framework/EventDispatcher";
import { tgxModuleContext } from "../../../../core_tgx/tgx";
import { Layout_Setting } from "../../../../module_extra/ui_setting/Layout_Setting";
import { GameUILayers } from "../../../../scripts/GameUILayers";
import { UI_BattleResult } from "../../../../scripts/UIDef";
import { GameEvent } from "../../../Script/Enum/GameEvent";
import { LevelManager } from "../../../Script/Manager/LevelMgr";
import { Layout_BattleResult } from "./Layout_BattleResult";
import { isValid } from "cc";

const delday = 3000;

export class UI_BattleResult_Impl extends UI_BattleResult {
    timeoutID: number;

    constructor() {
        super('Prefabs/UI/Result/UI_BattleResult', GameUILayers.POPUP, Layout_BattleResult);
    }

    public getRes(): [] {
        return [];
    }

    protected onCreated(): void {
        let layout = this.layout as Layout_BattleResult;
        this.onButtonEvent(layout.btGet, () => {

        });
        this.onButtonEvent(layout.btExtra, () => {

        });
        this.initilizeResult();
        this.closeByTimeout();
    }

    private initilizeResult(): void {
        const win = this.getBattleWin();
        //DOTO 根据配置表显示奖励 输赢显示

    }

    private closeByTimeout(): void {
        const win = this.getBattleWin();
        setTimeout(() => {
            if (win) {
                EventDispatcher.instance.emit(GameEvent.EVENT_BATTLE_SUCCESS_LEVEL_UP);
            } else {
                EventDispatcher.instance.emit(GameEvent.EVENT_BATTLE_FAIL_LEVEL_RESET);
            }

            this.clearTimeoutHandler();
            this.destoryMyself();
        }, delday);
    }

    private destoryMyself(): void {
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

    private clearTimeoutHandler(): void {
        if (this.timeoutID) {
            clearTimeout(this.timeoutID);
            this.timeoutID = null;
        }
    }
}

tgxModuleContext.attachImplClass(UI_BattleResult, UI_BattleResult_Impl);