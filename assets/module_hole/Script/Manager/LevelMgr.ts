import { _decorator, Node, Prefab, instantiate, Component } from 'cc';
import { IAttributeConfig, LevelModel, TYPE_BLESSINGS } from '../Model/LevelModel';
import { EventDispatcher } from '../../../core_tgx/easy_ui_framework/EventDispatcher';
import { GameEvent } from '../Enum/GameEvent';
import { Tablecultivate_config } from '../../../module_basic/table/Tablecultivate_config';

import { UserModel } from '../Model/UserModel';
import { userInfo } from 'os';
import { JsonUtil } from '../../../core_tgx/base/utils/JsonUtil';
import { HoleManager } from './HoleMgr';
import { GlobalConfig } from '../Config/GlobalConfig';
import { PropManager } from './PropMgr';
const { ccclass, property } = _decorator;

@ccclass('LevelManager')
export class LevelManager {
    private static _instance: LevelManager | null = null;
    public static get instance(): LevelManager {
        if (!this._instance) this._instance = new LevelManager();
        return this._instance;
    }

    levelPrefabs: Prefab[] = [];
    battlePrefab: Prefab = null!;
    parent: Node = null!;
    percent: number = 80;//当前关卡进度比值

    public levelModel: LevelModel = null;

    initilizeModel(): void {
        this.levelModel = new LevelModel();
    }

    loadLevel(level: number): void {
        const levelPrefab = this.levelPrefabs[level - 1];
        const currentLevelNode = instantiate(levelPrefab);
        this.parent.removeAllChildren();
        this.parent.addChild(currentLevelNode);
        console.log(`Loaded level: ${level}.`);
    }

    /** 添加战斗场景*/
    loadBattle(): void {
        const currentBattleNode = instantiate(this.battlePrefab);
        this.parent.removeAllChildren();
        this.parent.addChild(currentBattleNode);
    }

    /** 关卡等级升级 */
    upgradeLevel(up: number = 1): void {
        this.levelModel.level += up;
        if (this.levelModel.level > GlobalConfig.levelTotal) {
            const level = Math.floor(Math.random() * 3) + 1;
            this.levelModel.level = level;
        }
        this.levelModel.levelConfig.init(this.levelModel.level);
    }

    /** 时间等级升级 */
    upgradeLevelTime(up: number = 1): void {
        this.levelModel.timesLevel += up;
        const attributeConfig = this.getByTypeAndLevel(TYPE_BLESSINGS.TIME, this.levelModel.timesLevel);
        if (!attributeConfig) {
            this.levelModel.timesLevel = this.levelModel.timesLevel - up;
            EventDispatcher.instance.emit(GameEvent.EVENT_TIME_LEVEL_MAX);
            return;
        }
        this.levelModel.levelTimeTotal = attributeConfig.param;
        EventDispatcher.instance.emit(GameEvent.EVENT_TIME_LEVEL_UP, attributeConfig.param);
    }

    /** 经验等级升级 */
    upgradeLevelExp(up: number = 1): void {
        this.levelModel.expMulLevel += up;
        const attributeConfig = this.getByTypeAndLevel(TYPE_BLESSINGS.EXP, this.levelModel.expMulLevel);
        if (!attributeConfig) {
            this.levelModel.expMulLevel = this.levelModel.expMulLevel - up;
            EventDispatcher.instance.emit(GameEvent.EVENT_EXP_LEVEL_MAX);
            return;
        }
        this.levelModel.expMultiplier = attributeConfig.param;
        EventDispatcher.instance.emit(GameEvent.EVENT_EXP_LEVEL_UP);
    }

    /** 升级关卡重设加成等级*/
    resetAddition(): void {
        this.levelModel.timesLevel = 1;
        this.levelModel.expMulLevel = 1;
        HoleManager.instance.reBornLevel();
        PropManager.instance.clearEatsMap();
        EventDispatcher.instance.emit(GameEvent.EVENT_LEVEL_UP_RESET);
    }

    /** 清除关卡数据*/
    clearLevelData(): void {
        LevelManager.instance.levelModel.extraTimePop = false;
        PropManager.instance.clearEatsMap();
    }

    /** 是否超过当前关卡进度*/
    isExceedingPercent(): boolean {
        const { quality } = LevelManager.instance.levelModel; //关卡总质量
        const currentMass = PropManager.instance.getLevelTotalWeight()
        const totalMassScaled = quality * 100; // 将总质量放大100倍
        const thresholdScaled = totalMassScaled * this.percent; // 计算80%的值（放大后的）
        const currentMassScaled = currentMass * 100; // 当前质量也放大100倍

        // 判断是否超过阈值
        return currentMassScaled > thresholdScaled;
    }

    /** 判断本次关卡输赢*/
    judgeWin(): boolean {
        const { bossModel } = LevelManager.instance.levelModel;
        const { bossWeight } = bossModel;

        let total = 0;
        const eatsMap = PropManager.instance.eatsMap;
        eatsMap.forEach(element => {
            const { count, totalWeight } = element;
            total += totalWeight;
        });
        console.log(`玩家吃到道具重量:${total} boss重量:${bossWeight} 输赢:${total >= bossWeight}`);
        return GlobalConfig.plug ? GlobalConfig.plug : total >= bossWeight;
    }

    /**
     * 获取指定类型和等级的配置数据
     * @param type 类型：1 表示时间, 2 表示尺寸大小, 3 表示经验加成
     * @param level 等级
     * @returns 对应的属性值对象 { param, money }
     */
    getByTypeAndLevel(type: number, level: number): IAttributeConfig {
        const table = JsonUtil.get(Tablecultivate_config.TableName);
        for (let id in table) {
            const entry = table[id];
            if (entry.type === type && entry.level === level) {
                return entry;
            }
        }
        return null;
    }
}
