import { BoxCollider, Camera, Component, Node, Prefab, Quat, Toggle, Vec3, _decorator, director, instantiate, isValid, math, tween, v3 } from 'cc';
import { EventDispatcher } from '../../core_tgx/easy_ui_framework/EventDispatcher';
import { GameEvent } from './Enum/GameEvent';
import { LevelManager } from './Manager/LevelMgr';
import { PropManager } from './Manager/PropMgr';
import { GlobalConfig } from './Config/GlobalConfig';
import { tgxUIMgr } from '../../core_tgx/tgx';
import { UI_BattleResult } from '../../scripts/UIDef';
import { EasyControllerEvent } from '../../core_tgx/easy_controller/EasyController';

const { ccclass, property } = _decorator;

/**
 * 战斗控制器
 */
@ccclass('BattleController')
export class BattleController extends Component {
    @property(Camera)
    camera: Camera = null!;

    @property(Prefab)
    propsPrefabs: Prefab[] = [];

    @property(Node)
    player: Node = null!;

    @property(Node)
    boss: Node = null!;

    battleWin: boolean = false;

    scheduledCallbacks: (() => void)[] = []; // 存储定时器 ID

    protected start(): void {
        this.addListener();

        this.battleWin = this.judgingIsWin();
        this.takeCameraToPlayer();
        this.spawnAllProps();
        this.startSchedule();
    }

    private addListener(): void {
        EventDispatcher.instance.on(GameEvent.EVENT_BATTLE_SUCCESS_LEVEL_UP, this.onCloseMyself, this);
        EventDispatcher.instance.on(GameEvent.EVENT_BATTLE_FAIL_LEVEL_RESET, this.onCloseMyself, this);
    }

    private takeCameraToPlayer(): void {
        if (!this.camera) {
            console.error("Camera node is not assigned.");
            return;
        }

        const pos = v3(6, 1.6, 0);
        const targetAngles = v3(0, 90, 0);
        this.camera.node.setPosition(pos);
        this.camera.node.setRotationFromEuler(targetAngles);
    }

    private takeCameraToBother(): void {
        if (!this.camera) {
            console.error("Camera node is not assigned.");
            return;
        }

        // 定义目标位置和最终角度
        const targetPosition = new Vec3(3, 5, 30);
        const duration = 2;

        const startPosition = this.camera.node.getPosition();
        tween(this.camera.node)
            .to(
                duration,
                { position: targetPosition },
                {
                    onUpdate: (target, ratio) => {
                        const newPosition = startPosition.lerp(targetPosition, ratio);
                        this.camera!.node.setPosition(newPosition);

                        // 动态更新摄像机旋转，让其看向目标
                        this.camera!.node.lookAt(this.player!.worldPosition);
                    },
                }
            )
            .call(() => {
                this.camera!.node.setPosition(targetPosition);
                this.camera!.node.lookAt(Vec3.ZERO);
            })
            .start();
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

    private startSchedule(): void {
        // 设置定时任务
        this.scheduleTask(() => this.takeCameraToBother(), 3);
        this.scheduleTask(() => this.loadBattleResult(), 5);
    }

    private scheduleTask(callback: () => void, delay: number): void {
        const wrappedCallback = () => {
            callback();
            this.removeSchedule(wrappedCallback); // 回调执行后自动移除
        };
        this.scheduledCallbacks.push(wrappedCallback);
        this.scheduleOnce(wrappedCallback, delay);
    }

    private removeSchedule(callback: () => void): void {
        const index = this.scheduledCallbacks.indexOf(callback);
        if (index !== -1) {
            this.scheduledCallbacks.splice(index, 1);
        }
    }

    private loadBattleResult(): void {
        tgxUIMgr.inst.showUI(UI_BattleResult);
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

    private onCloseMyself(): void {
        if (!isValid(this.node)) return;

        this.node.removeFromParent();
        this.node.destroy();
        this.clearAllSchedules();
    }

    protected onDestroy(): void {
        EventDispatcher.instance.off(GameEvent.EVENT_BATTLE_SUCCESS_LEVEL_UP, this.onCloseMyself);
        EventDispatcher.instance.off(GameEvent.EVENT_BATTLE_FAIL_LEVEL_RESET, this.onCloseMyself);
    }

    private clearAllSchedules(): void {
        // 清除所有未触发的定时任务
        for (const callback of this.scheduledCallbacks) {
            this.unschedule(callback);
        }
        this.scheduledCallbacks.length = 0; // 清空数组
    }
}

