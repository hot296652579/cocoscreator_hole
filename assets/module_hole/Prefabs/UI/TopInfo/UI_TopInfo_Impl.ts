
import { EventDispatcher } from "../../../../core_tgx/easy_ui_framework/EventDispatcher";
import { tgxModuleContext, tgxUIMgr } from "../../../../core_tgx/tgx";
import { Layout_Setting } from "../../../../module_extra/ui_setting/Layout_Setting";
import { GameUILayers } from "../../../../scripts/GameUILayers";
import { UI_Setting, UI_TopInfo } from "../../../../scripts/UIDef";
import { GameEvent } from "../../../Script/Enum/GameEvent";
import { LevelManager } from "../../../Script/Manager/LevelMgr";
import { UserManager } from "../../../Script/Manager/UserMgr";
import { Layout_TopInfo } from "./Layout_TopInfo";

export class UI_TopInfo_Impl extends UI_TopInfo {

    constructor() {
        super('Prefabs/UI/TopInfo/UI_TopInfo', GameUILayers.OVERLAY, Layout_TopInfo);
    }

    public getRes(): [] {
        return [];
    }

    protected onCreated(): void {
        // let layout = this.layout as Layout_TopInfo;
        this.initilizeUI();
        this.addListener();
    }

    private initilizeUI(): void {
        this.updateUserInfo();

        let layout = this.layout as Layout_TopInfo;
        this.onButtonEvent(layout.btSet, () => {
            const show = tgxUIMgr.inst.isShowing(UI_Setting);
            if (!show) {
                tgxUIMgr.inst.showUI(UI_Setting);
            }
        });
        this.onButtonEvent(layout.btReLoad, () => {
            //DOTO
        });
    }

    private addListener(): void {
        EventDispatcher.instance.on(GameEvent.EVENT_USER_MONEY_UPDATE, this.updateUserInfo, this);
        EventDispatcher.instance.on(GameEvent.EVENT_BATTLE_SUCCESS_LEVEL_UP, this.levelUpHandler, this);
        EventDispatcher.instance.on(GameEvent.EVENT_BATTLE_FAIL_LEVEL_RESET, this.resetGameByLose, this);
    }

    private updateUserInfo(): void {
        const { money } = UserManager.instance.userModel;
        const { lbMoeny } = this.layout;
        lbMoeny.string = `${money}`;
    }

    private updateLevelLb(): void {
        const { level } = LevelManager.instance.levelModel;
        // console.log(`当前关卡等级:${level}`);
        const { lbLevel } = this.layout;
        lbLevel.string = `关卡:${level}`;
    }

    //关卡升级事件
    private levelUpHandler(): void {
        //DOTO 重设当前关卡进度
        this.updateLevelLb();
    }

    //闯关失败事件
    private resetGameByLose(): void {
        //DOTO 重设当前关卡进度
        this.updateLevelLb();
    }

    protected onDispose(): void {
        EventDispatcher.instance.off(GameEvent.EVENT_USER_MONEY_UPDATE, this.updateUserInfo);

        EventDispatcher.instance.off(GameEvent.EVENT_BATTLE_SUCCESS_LEVEL_UP, this.levelUpHandler);
        EventDispatcher.instance.off(GameEvent.EVENT_BATTLE_FAIL_LEVEL_RESET, this.resetGameByLose);
    }

}

tgxModuleContext.attachImplClass(UI_TopInfo, UI_TopInfo_Impl);