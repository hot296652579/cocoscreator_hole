import { BoxCollider, Camera, Component, CylinderCollider, Node, Prefab, SphereCollider, Vec3, _decorator, instantiate, isValid, math, tween, v3 } from 'cc';
import { EventDispatcher } from '../../core_tgx/easy_ui_framework/EventDispatcher';
import { tgxUIMgr } from '../../core_tgx/tgx';
import { UI_BattleResult } from '../../scripts/UIDef';
import { ActionState, CharacterCtrl } from './Character/CharacterCtrl';
import { GameEvent } from './Enum/GameEvent';
import { HoleGameAudioMgr } from './Manager/HoleGameAudioMgr';
import { LevelManager } from './Manager/LevelMgr';
import { PropManager } from './Manager/PropMgr';
import { PropItem } from './PropItem';

const { ccclass, property } = _decorator;
const duration: number = 1.5;
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
    playerWeight: number = 0;
    bossWeight: number = 0;

    scheduledCallbacks: (() => void)[] = []; // 存储定时器 ID

    protected start(): void {
        HoleGameAudioMgr.play(HoleGameAudioMgr.getMusicIdName(1), 1.0);
        this.initilize();
        this.addListener();
        this.takeCameraToPlayer();
        this.spawnAllProps();
        this.startSchedule();
        EventDispatcher.instance.emit(GameEvent.EVENT_UPDATE_BATTLE_WEIGHT);
    }

    private initilize(): void {
        this.playerWeight = PropManager.instance.getLevelTotalWeight();
        this.bossWeight = LevelManager.instance.getBossWeight();
        this.battleWin = LevelManager.instance.judgeWin();
        // console.log(`battleWin:${this.battleWin}`);
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

        const pos = v3(2.7, 1, 0.2);
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
        const eatsMap = PropManager.instance.eatsMap;
        const eatsPropTotal = eatsMap.size;
        if (eatsPropTotal > 0) {
            eatsMap.forEach((propTotal, propId) => {
                const { count } = propTotal;
                const prefab = this.propsPrefabs.find((prefab) => {
                    const propItem = prefab.data.getComponent(PropItem);
                    return propItem && propItem.id === propId;
                });

                if (!prefab) {
                    console.warn(`未找到 propId: ${propId}`);
                    return;
                }

                for (let i = 0; i < count; i++) {
                    const propNode = instantiate(prefab);
                    const collider = propNode.getComponent(BoxCollider) || propNode.getComponent(CylinderCollider) || propNode.getComponent(SphereCollider);
                    collider.isTrigger = true;
                    propNode.setScale(0.7, 0.7, 0.7);

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
                        .to(duration, { position: v3(playerPos.x, playerPos.y + 1, playerPos.z) }, { easing: 'sineOut' })
                        .call(() => {
                            this.onPropCollected(propNode);

                        })
                        .start();
                }
            });
        }

        this.scheduleTask(() => this.bigScaleTween(), duration);
    }

    /** 击飞动画*/
    playPunchFlyAnimation() {
        HoleGameAudioMgr.playOneShot(HoleGameAudioMgr.getMusicIdName(9), 1.0);
        const targetNode = this.battleWin ? this.boss : this.player;
        if (!targetNode) return

        const dir = this.battleWin ? 1 : -1
        const startPos = targetNode.position.clone();
        const flyDirection = new Vec3(dir, 1, 0).normalize(); // 击飞方向
        const flyDistance = 20;
        const endPos = startPos.add(flyDirection.multiplyScalar(flyDistance));

        tween(targetNode)
            .to(duration, { position: endPos }, { easing: 'cubicOut' }) // 击飞动作
            .by(0.3, { position: new Vec3(0, -2, 0) }, { easing: 'bounceOut' }) // 下落动作
            .start();

        tween(targetNode)
            .to(duration, { eulerAngles: new Vec3(360, 0, 0) }, { easing: 'linear' })
            .start();
    }

    /** 变大动画*/
    private bigScaleTween(): void {
        const bigTarget = this.battleWin ? this.player : this.boss;
        const bigScale: number = 2;
        tween(bigTarget)
            .to(duration, { scale: new Vec3(bigScale, bigScale, bigScale) })
            .call(() => {
                this.playAttackAniamtion();
            })
            .start()
    }

    /** 播放攻击动画*/
    private playAttackAniamtion(): void {
        this.player.getComponent(CharacterCtrl)?.doAnimation(ActionState.Attack);
        this.boss.getComponent(CharacterCtrl)?.doAnimation(ActionState.Attack);
        this.scheduleTask(() => this.playPunchFlyAnimation(), 1);
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

