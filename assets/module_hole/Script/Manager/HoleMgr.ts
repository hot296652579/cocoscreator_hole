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

    /** 玩家的养成等级*/
    private develLevel: number = 1;
    /** 游戏内升级的等级*/
    private gameLevel: number = 0;
    /** 最终呈现的等级*/
    private finalLevel: number = 0;

    public holeModel: BlackholeModel;
    initilizeModel(): void {
        this.finalLevel = this.getFinishLev();
        this.holeModel = new BlackholeModel(this.finalLevel);

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
            this.gameLevel += 5;
            this.upHoleLevel();
        }
        EventDispatcher.instance.emit(GameEvent.EVENT_HOLE_EXP_UPDATE);
    }

    /** 黑洞等级:玩家养成等级+游戏内升级等级*/
    getFinishLev(): number {
        return this.develLevel + this.gameLevel;
    }

    /** 黑洞等级升级*/
    upHoleLevel(add?: number) {
        this.holeModel.curHoleExpL = 0;
        if (add) {
            //按钮点击 升级
            this.develLevel += add;
        }
        this.holeModel.holeLevel = this.getFinishLev();
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
    /** 闯关失败 重置黑洞等数据*/
    reBornByLevelLose(): void {
        this.clearHoleData();
        EventDispatcher.instance.emit(GameEvent.EVENT_LEVEL_FAIL_RESET);

        if (this.timeoutId) {
            clearTimeout(this.timeoutId);
            this.timeoutId = null;
        }
        //打补丁 重置视野
        this.timeoutId = setTimeout(() => {
            EventDispatcher.instance.emit(GameEvent.EVENT_HOLE_LEVEL_SIEZE_RESET);//刷新视野
        }, 100)
    }

    clearHoleData() {
        this.holeModel.curHoleExpL = 0;
        this.gameLevel = 0;
        this.finalLevel = this.getFinishLev();
        this.holeModel.holeLevel = this.finalLevel;
        this.holeModel.config.init(this.finalLevel);
        this.onMagnetOff();
    }

    /** 关卡胜利 黑洞重置*/
    reBornByLevelWin() {
        this.develLevel = 1;
        this.clearHoleData();
        EventDispatcher.instance.emit(GameEvent.EVENT_HOLE_LEVEL_SIEZE_RESET);
    }
}
