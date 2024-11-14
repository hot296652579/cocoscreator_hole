import { tgxModuleContext, tgxUIController } from "../core_tgx/tgx";
import { ModuleDef } from "./ModuleDef";

//define UI classes which are not in the basic bundle but be called by other bundles.

export class UI_AboutMe extends tgxUIController { }
export class UI_Setting extends tgxUIController { }
tgxModuleContext.attachModule(UI_AboutMe, ModuleDef.EXTRA);
tgxModuleContext.attachModule(UI_Setting, ModuleDef.EXTRA);