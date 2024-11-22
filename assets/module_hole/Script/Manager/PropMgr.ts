import { Camera, Label, Node, Prefab, Vec3, _decorator, instantiate, isValid, tween, v3, view } from 'cc';
import { RoosterHoleEntry } from '../../RoosterHoleEntry';
import { IAttributeConfig, TYPE_BLESSINGS } from '../Model/LevelModel';
import { PropItem } from '../PropItem';
import { LevelManager } from './LevelMgr';
import { EventDispatcher } from '../../../core_tgx/easy_ui_framework/EventDispatcher';
import { GameEvent } from '../Enum/GameEvent';
const { ccclass, property } = _decorator;

/** 道具管理器*/
@ccclass('PropManager')
export class PropManager {
    private static _instance: PropManager | null = null;
    public static get instance(): PropManager {
        if (!this._instance) this._instance = new PropManager();
        return this._instance;
    }

    camera: Camera = null!;
    parent: Node = null!;
    propParent: Node = null!;
    expPrefab: Prefab = null!;

    eatsMap: Map<number, IPropTotal> = new Map();

    initilizeUI(): void {
        this.camera = this.parent.getComponentInChildren(Camera)!;
        this.propParent = this.parent.parent.getChildByPath('Canvas/GameUI/Props');
        this.expPrefab = this.parent.getComponent(RoosterHoleEntry)?.expPrefab;
    }

    /** 添加经验Prefab
     * @param exp 经验值
     * @param targetModel 3d模型
    */
    addExpPrefab(exp: number, targetModel?: Node): void {
        // const worldPos = targetModel.worldPosition.clone();
        // //转为屏幕坐标
        // const screenPos = this.camera.worldToScreen(worldPos);
        // console.log(`转换后的屏幕坐标:${screenPos}`);
        // const node = instantiate(this.expPrefab)!;
        // this.propParent.addChild(node);

        // const size = view.getDesignResolutionSize();
        // const uiPos = this.propParent.getComponent(UITransform).convertToNodeSpaceAR(screenPos);
        // node.setPosition(v3(uiPos.x + size.width / 2, uiPos.y + size.height / 2, uiPos.z));

        const origin = view.getVisibleOrigin();
        const expNode = instantiate(this.expPrefab)!;
        const lb = expNode.getChildByName('LbExp').getComponent(Label)!;
        lb.string = `+${exp}`;

        this.propParent.addChild(expNode);
        expNode.setPosition(v3(origin.x, origin.y, 0));
        tween(expNode)
            .to(1, { position: new Vec3(origin.x, origin.y + 50, 0) })
            .call(() => {
                if (isValid(expNode)) {
                    expNode.removeFromParent();
                    expNode.destroy();
                }
            })
            .start();

        let data = targetModel.getComponent(PropItem);
        this.savePropItems(data);
    }

    /** 加成倍数后的经验*/
    expAfterBonus(propExp: number): number {
        const { expMulLevel } = LevelManager.instance.levelModel;
        const config: IAttributeConfig = LevelManager.instance.getByTypeAndLevel(TYPE_BLESSINGS.EXP, expMulLevel);
        const { param } = config;
        const multiplier = param / 100;
        let expBonus = propExp + Math.round(propExp * multiplier * 100) / 100;
        // console.log(`道具原本经验exp:${exp} 加成倍数:${multiplier} 加成后exp:${expBonus}`);
        return expBonus;
    }

    /** 记录吞噬的道具*/
    savePropItems(data: PropItem): void {
        const { id, name, weight } = data;
        if (!this.eatsMap.has(id)) {
            const obj = {
                count: 1,
                totalWeight: weight
            }
            this.eatsMap.set(id, obj);
        } else {
            let obj = this.eatsMap.get(id);
            let { count } = obj;
            count++;

            const totalWeight = count * weight;
            obj.count = count;
            obj.totalWeight = totalWeight;

            this.eatsMap.set(id, obj);
        }
        this.checkIsAllEaten();
        EventDispatcher.instance.emit(GameEvent.EVENT_LEVEL_PROGRESS_UPDATE);
    }

    /** 检测当前关卡是否吃完所有道具*/
    checkIsAllEaten(): void {
        const { propTotal } = LevelManager.instance.levelModel; //关卡道具总个数
        const eatCount = this.getEatsCount();
        if (eatCount >= propTotal) {
            EventDispatcher.instance.emit(GameEvent.EVENT_FINISH_EAT_ENTER_BATTLE);
        }
    }

    /** 获取当前关卡吃掉道具的总数*/
    getEatsCount(): number {
        const totalCount = Array.from(this.eatsMap.values()).reduce((sum, item) => sum + item.count, 0);
        return totalCount;
    }

    /** 获取某个道具数量和总重量*/
    getItemCount(itemId: number): IPropTotal {
        return this.eatsMap.get(itemId) || null;
    }

    /** 获取当前关卡总重量*/
    getLevelTotalWeight(): number {
        let totalWeight = 0;
        this.eatsMap.forEach((value, key) => {
            totalWeight += value.totalWeight;
        })
        return totalWeight;
    }

    /** 清除吞噬道具*/
    clearEatsMap(): void {
        this.eatsMap.clear();
    }

}

/** 单个道具接口
 * @param count 总数量
 * @param totalWeight 总重量
*/
interface IPropTotal {
    count: number,//总数
    totalWeight: number //总重量
}
