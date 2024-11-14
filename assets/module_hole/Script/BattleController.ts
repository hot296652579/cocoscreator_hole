/*
 * @Author: super_javan 296652579@qq.com
 * @Date: 2024-11-14 20:50:20
 * @LastEditors: super_javan 296652579@qq.com
 * @LastEditTime: 2024-11-14 21:45:23
 * @FilePath: /cocoscreator_hole/assets/module_hole/Script/BattleController.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { BoxCollider, Component, Node, Prefab, Toggle, Vec3, _decorator, instantiate, math, tween } from 'cc';
import { EventDispatcher } from '../../core_tgx/easy_ui_framework/EventDispatcher';
import { GameEvent } from './Enum/GameEvent';
import { LevelManager } from './Manager/LevelMgr';
import { PropManager } from './Manager/PropMgr';

const { ccclass, property } = _decorator;

/**
 * 战斗控制器
 */
@ccclass('BattleController')
export class BattleController extends Component {
    @property(Prefab)
    propsPrefabs: Prefab[] = [];

    @property(Node)
    player: Node = null!;

    @property(Node)
    boss: Node = null!;

    protected start(): void {
        this.spawnAllProps();
        this.scheduleOnce(() => {
            const win = this.judgingIsWin();
            this.node.removeFromParent();
            this.node.destroy();

            if (win) {
                EventDispatcher.instance.emit(GameEvent.EVENT_BATTLE_SUCCESS_LEVEL_UP);
            } else {
                EventDispatcher.instance.emit(GameEvent.EVENT_BATTLE_FAIL_LEVEL_RESET);
            }
        }, 3);
    }

    /**
     * 一次性生成所有道具并开始掉落
     */
    private spawnAllProps(): void {
        const totalProps = Math.floor(Math.random() * 5) + 3; // 随机生成 3 到 7 个道具

        for (let i = 0; i < totalProps; i++) {
            const randomIndex = Math.floor(Math.random() * this.propsPrefabs.length);
            const propPrefab = this.propsPrefabs[randomIndex];
            const propNode = instantiate(propPrefab);
            propNode.getComponent(BoxCollider).isTrigger = true;

            // 生成初始位置的随机坐标 (3D 空间)
            const rangeX = 10; // X 轴范围
            const rangeZ = 10; // Z 轴范围
            const startX = math.randomRange(-rangeX, rangeX);
            const startZ = math.randomRange(-rangeZ, rangeZ);
            const startPos = new Vec3(startX, 20, startZ);
            propNode.setPosition(startPos);
            this.node.addChild(propNode);

            // 掉落动画（从随机位置到玩家位置）
            const playerPos = this.player.getWorldPosition();
            tween(propNode)
                .to(2, { position: playerPos }, { easing: 'sineIn' })
                .call(() => {
                    this.onPropCollected(propNode);
                })
                .start();
        }
    }

    /**
     * 处理道具被收集的逻辑
     */
    private onPropCollected(propNode: Node): void {
        // 销毁道具节点
        propNode.removeFromParent();
        propNode.destroy();
    }

    /** 获取物理外挂是否勾选*/
    getPlugCheck(): boolean {
        const canvas = this.node.parent.parent.getChildByName('Canvas');
        const toggle = canvas.getChildByPath('GameUI/BattleBottom/TogglePlug')?.getComponent(Toggle);
        const { isChecked } = toggle;
        return isChecked;
    }

    /** 判断是否输赢*/
    private judgingIsWin(): boolean {
        const { bossModel } = LevelManager.instance.levelModel;
        const { bossWeight } = bossModel;

        let total = 0;
        const eatsMap = PropManager.instance.eatsMap;
        eatsMap.forEach(element => {
            const { count, totalWeight } = element;
            total += totalWeight;
        });

        return this.getPlugCheck() ?? total >= bossWeight;
    }

    protected onDestroy(): void {

    }
}

