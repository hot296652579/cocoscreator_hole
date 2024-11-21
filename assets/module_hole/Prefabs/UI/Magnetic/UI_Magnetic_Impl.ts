

import { _decorator, Component, isValid, Node } from 'cc';
import { UI_Magnetic } from '../../../../scripts/UIDef';
import { GameUILayers } from '../../../../scripts/GameUILayers';
import { tgxModuleContext } from '../../../../core_tgx/tgx';
import { EventDispatcher } from '../../../../core_tgx/easy_ui_framework/EventDispatcher';
import { GameEvent } from '../../../Script/Enum/GameEvent';
import { AdvertMgr } from '../../../Script/Manager/AdvertMgr';
import { AudioMgr } from '../../../../core_tgx/base/AudioMgr';
import { HoleGameAudioMgr } from '../../../Script/Manager/HoleGameAudioMgr';
import { Layout_Magnetic } from './Layout_Magnetic';
const { ccclass, property } = _decorator;

@ccclass('UI_Magnetic_Impl')
export class UI_Magnetic_Impl extends UI_Magnetic {
    constructor() {
        super('Prefabs/UI/Magnetic/UI_Magnetic', GameUILayers.POPUP, Layout_Magnetic);
    }

    public getRes(): [] {
        return [];
    }

    protected onCreated(): void {
        let layout = this.layout as Layout_Magnetic;
        this.onButtonEvent(layout.btGet, () => {
            HoleGameAudioMgr.playOneShot(AudioMgr.inst.getMusicIdName(5), 1.0);
            this.addAdverHandler();
        });
        this.onButtonEvent(layout.btNo, () => {
            HoleGameAudioMgr.playOneShot(AudioMgr.inst.getMusicIdName(5), 1.0);
            this.destoryMyself();
        });
    }

    private addAdverHandler(): void {
        AdvertMgr.instance.showReawardVideo(() => {
            this.destoryMyself();
            EventDispatcher.instance.emit(GameEvent.EVENT_MAGNET_ON);
        })
    }

    private destoryMyself(): void {
        if (isValid(this.node)) {
            this.node.removeFromParent();
            this.node.destroy();
        }
    }

}

tgxModuleContext.attachImplClass(UI_Magnetic, UI_Magnetic_Impl);





