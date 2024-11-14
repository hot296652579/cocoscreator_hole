
import { tgxModuleContext } from "../../core_tgx/tgx";
import { GameUILayers } from "../../scripts/GameUILayers";
import { UI_AboutMe, UI_Setting } from "../../scripts/UIDef";
import { Layout_Setting } from "./Layout_Setting";

export class UI_Setting_Impl extends UI_Setting {
    constructor() {
        super('ui_setting/UI_Setting', GameUILayers.POPUP, Layout_Setting);
    }

    public getRes(): [] {
        return [];
    }

    protected onCreated(): void {
        let layout = this.layout as Layout_Setting;
        this.onButtonEvent(layout.btnClose, () => {
            this.hide();
        });
    }
}

tgxModuleContext.attachImplClass(UI_Setting, UI_Setting_Impl);