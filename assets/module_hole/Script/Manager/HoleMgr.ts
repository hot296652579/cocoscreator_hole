import { _decorator, Node, Prefab, instantiate, Component, Camera, UITransform, v3, game, view, screen, tween, Vec3 } from 'cc';
import { BlackholeModel } from '../Model/HoleModel';
import * as exp from 'constants';
import { EventDispatcher } from '../../../core_tgx/easy_ui_framework/EventDispatcher';
import { GameEvent } from '../Enum/GameEvent';
const { ccclass, property } = _decorator;

/** 黑洞管理器*/
@ccclass('HoleManager')
export class HoleManager {
    private static _instance: HoleManager | null = null;
    public static get instance(): HoleManager {
        if (!this._instance) this._instance = new HoleManager();
        return this._instance;
    }

    public holeModel: BlackholeModel;
    initilizeModel(): void {
        this.holeModel = new BlackholeModel();
    }

    /** 增加经验*/
    addExp(addExp: number): void {
        this.holeModel.curHoleExpL += addExp;
        if (this.holeModel.curHoleExpL >= this.holeModel.exp) {
            this.holeModel.curHoleExpL = 0;
            this.holeModel.upgradeLevel();

            EventDispatcher.instance.emit(GameEvent.EVENT_HOLE_LEVEL_SIEZE_UP);
        }
        EventDispatcher.instance.emit(GameEvent.EVENT_HOLE_EXP_UPDATE);
    }

    /** 黑洞等级升级*/
    upgradeLevel(up: number = 1) {
        this.holeModel.holeLevel += up;
        const { holeLevel } = this.holeModel;
        this.holeModel.config.init(holeLevel);
        EventDispatcher.instance.emit(GameEvent.EVENT_HOLE_LEVEL_SIEZE_UP);
    }

    /** 闯关失败重设经验*/
    resetExPByLose(): void {
        this.holeModel.curHoleExpL = 0;
        EventDispatcher.instance.emit(GameEvent.EVENT_HOLE_EXP_UPDATE);
    }

    /** 黑洞重生*/
    reBornLevel() {
        this.holeModel.holeLevel = 1;
        this.holeModel.curHoleExpL = 0;
        const { holeLevel } = this.holeModel;
        this.holeModel.config.init(holeLevel);
        EventDispatcher.instance.emit(GameEvent.EVENT_HOLE_LEVEL_SIEZE_RESET);
    }
}
