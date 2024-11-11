import { _decorator, Node, Prefab, instantiate, Component, Camera, UITransform, v3, game, view, screen, tween, Vec3 } from 'cc';
import { ResLoader } from '../../../core_tgx/base/ResLoader';
import { RoosterHoleEntry } from '../../RoosterHoleEntry';
import * as exp from 'constants';
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

    initilizeUI(): void {
        this.camera = this.parent.getComponentInChildren(Camera)!;
        this.propParent = this.parent.parent.getChildByPath('Canvas/GameUI/Props');
        this.expPrefab = this.parent.getComponent(RoosterHoleEntry)?.expPrefab;
    }

    /** 添加经验Prefab
     * @param targetModel 3D模型
    */
    addExpPrefab(targetModel: Node): void {
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
        this.propParent.addChild(expNode);
        expNode.setPosition(v3(origin.x, origin.y, 0));
        tween(expNode)
            .to(1, { position: new Vec3(origin.x, origin.y + 50, 0) })
            .call(() => { expNode.removeFromParent() })
            .start()
    }
}
