import { BoxCollider, Component, Node, Prefab, Toggle, Vec3, _decorator, instantiate, math, tween } from 'cc';
import { EventDispatcher } from '../../core_tgx/easy_ui_framework/EventDispatcher';
import { GameEvent } from './Enum/GameEvent';
import { LevelManager } from './Manager/LevelMgr';
import { PropManager } from './Manager/PropMgr';
import { GlobalConfig } from './Config/GlobalConfig';

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

        return GlobalConfig.plug ?? total >= bossWeight;
    }

    protected onDestroy(): void {

    }
}

