import { _decorator, Node, Prefab, instantiate, Component, Camera, UITransform, v3, game, view, screen, tween, Vec3, Label } from 'cc';
import { ResLoader } from '../../../core_tgx/base/ResLoader';
import { RoosterHoleEntry } from '../../RoosterHoleEntry';
import * as exp from 'constants';
import { PropItem } from '../PropItem';
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

    eatsMap: Map<number, number> = new Map();

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
            .call(() => { expNode.removeFromParent() })
            .start()

        let id = targetModel.getComponent(PropItem).id;
        this.savePropItems(id);
    }

    /** 记录吞噬的道具*/
    savePropItems(id: number): void {
        if (this.eatsMap.has(id)) {
            this.eatsMap.set(id, 1);
        } else {
            let count = this.eatsMap.get(id);
            count++;

            this.eatsMap.set(id, count);
        }
    }

    /** 获取某个道具数量*/
    getItemCount(itemId: number): number {
        return this.eatsMap.get(itemId) || 0;
    }

    clearEatsMap(): void {
        this.eatsMap.clear();
    }

}
