import { _decorator, isValid } from 'cc';
import { EventDispatcher } from '../../../../core_tgx/easy_ui_framework/EventDispatcher';
import { tgxModuleContext } from '../../../../core_tgx/tgx';
import { GameUILayers } from '../../../../scripts/GameUILayers';
import { UI_ExtraTime } from '../../../../scripts/UIDef';
import { GameEvent } from '../../../Script/Enum/GameEvent';
import { AdvertMgr } from '../../../Script/Manager/AdvertMgr';
import { HoleGameAudioMgr } from '../../../Script/Manager/HoleGameAudioMgr';
import { Layout_ExtraTime } from './Layout_ExtraTime';
const { ccclass, property } = _decorator;

@ccclass('UI_ExtraTime_Impl')
export class UI_ExtraTime_Impl extends UI_ExtraTime {
    constructor() {
        super('Prefabs/UI/ExtraTime/UI_ExtraTime', GameUILayers.POPUP, Layout_ExtraTime);
    }

    public getRes(): [] {
        return [];
    }

    protected onCreated(): void {
        let layout = this.layout as Layout_ExtraTime;
        this.onButtonEvent(layout.btGet, () => {
            HoleGameAudioMgr.playOneShot(HoleGameAudioMgr.getMusicIdName(5), 1.0);
            this.addAdverHandler();
        });
        this.onButtonEvent(layout.btNo, () => {
            HoleGameAudioMgr.playOneShot(HoleGameAudioMgr.getMusicIdName(5), 1.0);
            this.destoryMyself();
            EventDispatcher.instance.emit(GameEvent.EVENT_ADD_EXTRATIME, false);
        });
    }

    private addAdverHandler(): void {
        AdvertMgr.instance.showReawardVideo(() => {
            this.destoryMyself();
            EventDispatcher.instance.emit(GameEvent.EVENT_ADD_EXTRATIME, true);
        })
    }

    private destoryMyself(): void {
        if (isValid(this.node)) {
            this.node.removeFromParent();
            this.node.destroy();
        }
    }

}

tgxModuleContext.attachImplClass(UI_ExtraTime, UI_ExtraTime_Impl);


