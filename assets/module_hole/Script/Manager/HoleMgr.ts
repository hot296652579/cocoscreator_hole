import { _decorator, Node, Prefab, instantiate, Component, Camera, UITransform, v3, game, view, screen, tween, Vec3 } from 'cc';
import { BlackholeModel } from '../Model/HoleModel';
import { EventDispatcher } from '../../../core_tgx/easy_ui_framework/EventDispatcher';
import { GameEvent } from '../Enum/GameEvent';
import { LevelManager } from './LevelMgr';
import { TYPE_BLESSINGS, TYPE_GAME_STATE } from '../Model/LevelModel';
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

        EventDispatcher.instance.on(GameEvent.EVENT_MAGNET_ON, this.onMagnetOn, this);
        EventDispatcher.instance.on(GameEvent.EVENT_MAGNET_OFF, this.onMagnetOff, this);
    }

    private onMagnetOn(): void {
        HoleManager._instance.holeModel.isMagment = true;
        EventDispatcher.instance.emit(GameEvent.EVENT_MAGNET_EFFECT_SHOW);
    }

    private onMagnetOff(): void {
        HoleManager._instance.holeModel.isMagment = false;
        EventDispatcher.instance.emit(GameEvent.EVENT_MAGNET_EFFECT_HIDE);
    }

    /** 增加经验*/
    addExp(addExp: number): void {
        this.holeModel.curHoleExpL += addExp;
        // console.log(`当前经验:${this.holeModel.curHoleExpL} ,增加的经验:${addExp} ,需要经验:${this.holeModel.exp}`);
        if (this.holeModel.curHoleExpL >= this.holeModel.exp) {
            //游戏中升级 加5级
            let state = LevelManager.instance.levelModel.curGameState;
            let up = state == TYPE_GAME_STATE.GAME_STATE_START ? 1 : 5;
            this.upgradeLevel(up);
        }
        EventDispatcher.instance.emit(GameEvent.EVENT_HOLE_EXP_UPDATE);
    }

    /** 黑洞等级升级*/
    upgradeLevel(up: number = 1) {
        this.holeModel.curHoleExpL = 0;
        this.holeModel.holeLevel += up;
        const { holeLevel } = this.holeModel;

        const attributeConfig = LevelManager.instance.getByTypeAndLevel(TYPE_BLESSINGS.SIZE, holeLevel);
        if (!attributeConfig) {
            this.holeModel.holeLevel = this.holeModel.holeLevel - 1;
            EventDispatcher.instance.emit(GameEvent.EVENT_HOLE_LEVEL_SIEZE_MAX);
            return;
        }
        this.holeModel.config.init(holeLevel);
        EventDispatcher.instance.emit(GameEvent.EVENT_HOLE_LEVEL_SIEZE_UP);
    }

    timeoutId = null;
    /** 闯关失败重设经验*/
    resetExPByLose(): void {
        this.holeModel.curHoleExpL = 0;
        this.onMagnetOff();
        EventDispatcher.instance.emit(GameEvent.EVENT_HOLE_EXP_UPDATE);

        if (this.timeoutId) {
            clearTimeout(this.timeoutId);
            this.timeoutId = null;
        }
        //打补丁 重置视野
        this.timeoutId = setTimeout(() => {
            EventDispatcher.instance.emit(GameEvent.EVENT_HOLE_LEVEL_SIEZE_RESET);//刷新视野
        }, 100)
    }

    /** 黑洞重生*/
    reBornLevel() {
        this.holeModel.holeLevel = 1;
        this.holeModel.curHoleExpL = 0;
        const { holeLevel } = this.holeModel;
        this.holeModel.config.init(holeLevel);
        this.onMagnetOff();
        EventDispatcher.instance.emit(GameEvent.EVENT_HOLE_LEVEL_SIEZE_RESET);
    }
}
