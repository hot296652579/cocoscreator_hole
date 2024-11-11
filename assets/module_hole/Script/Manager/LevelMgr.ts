import { _decorator, Node, Prefab, instantiate, Component } from 'cc';
import { IAttributeConfig, LevelModel, TYPE_BLESSINGS } from '../Model/LevelModel';
import { EventDispatcher } from '../../../core_tgx/easy_ui_framework/EventDispatcher';
import { GameEvent } from '../Enum/GameEvent';
import { Tablecultivate_config } from '../../../module_basic/table/Tablecultivate_config';
import { BlackholeModel } from '../Model/HoleModel';
import { UserModel } from '../Model/UserModel';
import { userInfo } from 'os';
import { JsonUtil } from '../../../core_tgx/base/utils/JsonUtil';
const { ccclass, property } = _decorator;

@ccclass('LevelManager')
export class LevelManager {
    private static _instance: LevelManager | null = null;
    public static get instance(): LevelManager {
        if (!this._instance) this._instance = new LevelManager();
        return this._instance;
    }

    levelPrefabs: Prefab[] = [];
    parent: Node = null!;

    public userModel: UserModel = null;
    public levelModel: LevelModel = null;
    public holeModel: BlackholeModel = null;
    private currentLevelNode: Node = null;

    initilizeModel(): void {
        this.userModel = new UserModel();
        this.holeModel = new BlackholeModel();
        this.levelModel = new LevelModel();
    }

    loadLevel(level: number): void {
        if (this.currentLevelNode) this.currentLevelNode.destroy();
        const levelPrefab = this.levelPrefabs[level - 1];
        this.currentLevelNode = instantiate(levelPrefab);
        this.parent.addChild(this.currentLevelNode);
        console.log(`Loaded level ${level}.`);
    }

    /** 关卡等级升级 */
    upgradeLevel(up: number = 1): void {
        this.levelModel.level += up;
        this.levelModel.levelConfig.init(this.levelModel.level);
    }

    /** 时间等级升级 */
    upgradeLevelTime(up: number = 1): void {
        this.levelModel.timesLevel += up;
        const model = this.levelModel;
        const attributeConfig = this.getByTypeAndLevel(TYPE_BLESSINGS.TIME, this.levelModel.timesLevel);
        this.levelModel.levelTimeTotal = attributeConfig.param;
        EventDispatcher.instance.emit(GameEvent.EVENT_TIME_LEVEL_UP);
    }

    /** 黑洞等级升级 */
    upgradeHoleLevelSize(up: number = 1): void {
        this.holeModel.upgradeLevel(up);
        EventDispatcher.instance.emit(GameEvent.EVENT_HOLE_LEVEL_SIEZE_UP);
    }

    /**
 * 获取指定类型和等级的配置数据
 * @param type 类型：1 表示时间, 2 表示尺寸大小, 3 表示经验加成
 * @param level 等级
 * @returns 对应的属性值对象 { param, money }
 */
    getByTypeAndLevel(type: number, level: number): IAttributeConfig | null {
        const table = JsonUtil.get(Tablecultivate_config.TableName);
        for (let id in table) {
            const entry = table[id];
            if (entry.type === type && entry.level === level) {
                return entry;
            }
        }
        return null;
    }

    getCurrentLevelNode(): Node {
        return this.currentLevelNode;
    }
}
