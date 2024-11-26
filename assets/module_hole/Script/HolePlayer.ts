import { BoxCollider, Component, CylinderCollider, ITriggerEvent, MeshCollider, Node, ParticleSystem, SphereCollider, Vec3, _decorator, director, game, isValid, v3 } from 'cc';
import { EasyControllerEvent } from '../../core_tgx/easy_controller/EasyController';
import { EventDispatcher } from '../../core_tgx/easy_ui_framework/EventDispatcher';
import { GameEvent } from './Enum/GameEvent';
import { HoleGameAudioMgr } from './Manager/HoleGameAudioMgr';
import { HoleManager } from './Manager/HoleMgr';
import { LevelManager } from './Manager/LevelMgr';
import { PropManager } from './Manager/PropMgr';
import { TYPE_GAME_STATE } from './Model/LevelModel';
import { PropItem } from './PropItem';
import { UIJoyStick } from './UIJoyStick';
const { ccclass, property } = _decorator;

const _dir: Vec3 = new Vec3();
const _ime: Vec3 = new Vec3();

@ccclass('HolePlayer')
export class HolePlayer extends Component {
    holeTigger: SphereCollider = null!;
    mouth: Node = null!;
    magmentTigger: SphereCollider = null!;
    getScoreTigger: BoxCollider = null!;
    diameter: number = 1;
    speed: number = 1;
    view: number = 1;

    ringScale: Vec3 = v3(1.5, 0.01, 1.5); //刚体环形初始scale大小
    holeTriggerRadius: number = 0.4;      //碰撞器触发初始半径
    coefficient: number = 1;
    isMagment: boolean = false;

    @property(Node)
    magnetNode: Node = null!;

    @property(ParticleSystem)
    parLevUp0: ParticleSystem = null!;
    @property(ParticleSystem)
    parLevUp1: ParticleSystem = null!;

    @property(ParticleSystem)
    parEnergy0: ParticleSystem = null!;
    @property(ParticleSystem)
    parEnergy1: ParticleSystem = null!;

    protected start(): void {
        this.initilizeData();
        this.updateHoleView();
        this.initilizeUI();
        this.addEventListener();
    }

    initilizeData(): void {
        const holeModel = HoleManager.instance.holeModel;
        this.speed = holeModel.speed;
        this.diameter = holeModel.diameter;
        this.view = holeModel.view;
    }

    initilizeUI(): void {
        this.holeTigger = this.node.getChildByName('HoleTrigger')?.getComponent(SphereCollider)!;
        this.mouth = this.node.getChildByName('Mouth')!;
        this.magmentTigger = this.node.getChildByName('MagmentTrigger')?.getComponent(SphereCollider)!;
        this.getScoreTigger = this.node.getComponent(BoxCollider)!;
        this.holeTigger.on('onTriggerEnter', this.onTriggerEnter, this);
        this.holeTigger.on('onTriggerStay', this.onTriggerStay, this);
        this.holeTigger.on('onTriggerExit', this.onTriggerExit, this);
        this.getScoreTigger.on('onTriggerEnter', this.onGetScoreTriggerEnter, this);
    }

    addEventListener(): void {
        EventDispatcher.instance.on(GameEvent.EVENT_HOLE_LEVEL_SIEZE_UP, this.upLevHole, this);
        EventDispatcher.instance.on(GameEvent.EVENT_TIME_ENERGY_EFFECT, this.playEnegryUpEffect, this);
        EventDispatcher.instance.on(GameEvent.EVENT_MAGNET_EFFECT_SHOW, this.showMagnetEffect, this);
        EventDispatcher.instance.on(GameEvent.EVENT_HOLE_LEVEL_SIEZE_RESET, this.updateHoleView, this);
        EventDispatcher.instance.on(GameEvent.EVENT_MAGNET_EFFECT_HIDE, this.hideMagnetEffect, this);
    }

    protected onDestroy(): void {
        EventDispatcher.instance.off(GameEvent.EVENT_HOLE_LEVEL_SIEZE_UP, this.upLevHole);
        EventDispatcher.instance.off(GameEvent.EVENT_TIME_ENERGY_EFFECT, this.playEnegryUpEffect);
        EventDispatcher.instance.off(GameEvent.EVENT_MAGNET_EFFECT_SHOW, this.showMagnetEffect);
        EventDispatcher.instance.off(GameEvent.EVENT_HOLE_LEVEL_SIEZE_RESET, this.updateHoleView);
        EventDispatcher.instance.off(GameEvent.EVENT_MAGNET_EFFECT_HIDE, this.hideMagnetEffect);
    }

    onTriggerEnter(event: ITriggerEvent): void {
        console.log("HolePlayer onTriggerEnter");
        // this.pullTowardsHole(event);
        // if (this.getPlanceVec3(event).length() <= this.holeTigger.radius * this.coefficient) {
        //     event.otherCollider.setGroup(1 << 3);
        // }
    }

    onGetScoreTriggerEnter(event: ITriggerEvent): void {
        const other = event.otherCollider.node;
        this.eatProp(event);
        setTimeout(() => {
            const collider = other.getComponent(BoxCollider) || other.getComponent(CylinderCollider) || other.getComponent(SphereCollider);
            if (isValid(other) && collider.center.y <= -2) {
                other.destroy();
            }
        }, 500);
    }

    private pullTowardsHole(event: ITriggerEvent): void {
        const otherRigidBody = event.otherCollider.attachedRigidBody;
        if (otherRigidBody) {
            // 获取黑洞和物体的位置差向量，并将物体朝黑洞中心拉动
            const directionToHole = this.getPlanceVec3(event).normalize().negative();
            // 应用一个较大的冲量，使物体快速移动到黑洞
            otherRigidBody.applyImpulse(directionToHole.multiplyScalar(1), directionToHole);

            if (this.getPlanceVec3(event).length() <= this.holeTigger.radius * this.coefficient) {
                event.otherCollider.setGroup(1 << 3);
            }
        }
    }

    eatProp(event: ITriggerEvent): void {
        HoleGameAudioMgr.playOneShot(HoleGameAudioMgr.getMusicIdName(4), 1.0);
        const otherNode = event.otherCollider.node;
        let exp = otherNode.getComponent(PropItem)?.exp;
        const expBonus = PropManager.instance.expAfterBonus(exp);
        PropManager.instance.addExpPrefab(expBonus, event.otherCollider.node);
        HoleManager.instance.addExp(expBonus);
    }

    onTriggerStay(event: ITriggerEvent): void {
        if (event.otherCollider.attachedRigidBody) {
            const otherCollider = event.otherCollider as CylinderCollider;
            const radius = otherCollider.radius;
            console.log(`当前道具的半径:${otherCollider.radius}`)

            const dir = this.getPlanceVec3(event);
            Vec3.copy(_dir, dir);
            _dir.normalize();

            Vec3.copy(_ime, dir);
            _ime.negative();
            _ime.normalize();
            _ime.multiplyScalar(2);
            event.otherCollider.attachedRigidBody.applyImpulse(_ime, _dir);

            // 如果距离足够近 并且黑洞半径大于等于道具半径 吞噬
            if (this.getPlanceVec3(event).length() <= this.holeTigger.radius * this.coefficient * 0.75) {
                if (this.holeTigger.radius >= radius) {
                    event.otherCollider.setGroup(1 << 3);
                }
            }
        }
    }

    onTriggerExit(event: ITriggerEvent): void {
        if (event.otherCollider.getGroup() == 1 << 3) {
            event.otherCollider.setGroup(1 << 4)
        }
    }

    getPlanceVec3(event: ITriggerEvent): Vec3 {
        const otherPos = event.otherCollider.worldBounds.center;
        const otherPlanceToY = new Vec3(otherPos.x, 0, otherPos.z);
        const distance = otherPlanceToY.clone().subtract3f(this.node.position.x, 0, this.node.position.z);
        return distance;
    }

    update(deltaTime: number) {
        const curGameState = LevelManager.instance.levelModel.curGameState;
        if (curGameState == TYPE_GAME_STATE.GAME_STATE_INIT || curGameState == TYPE_GAME_STATE.GAME_STATE_START) {
            this.MoveHandler();
        }
    }

    MoveHandler(): void {
        const playerDir = UIJoyStick.ins.dir;
        const playerX = playerDir.x * this.speed * game.deltaTime;
        const playerZ = playerDir.y * this.speed * game.deltaTime;

        this.node.setPosition(this.node.position.x + playerX, 0, this.node.position.z - playerZ);
    }

    upLevHole(): void {
        this.playLevUpEffect();
        this.updateHoleView();
    }

    private playLevUpEffect(): void {
        this.parLevUp0.play();
        this.parLevUp1.play();
    }

    private playEnegryUpEffect(): void {
        this.parEnergy0.play();
        this.parEnergy1.play();
    }

    private showMagnetEffect(): void {
        this.magnetNode.active = false;//DOTO 特效问题关闭
    }
    private hideMagnetEffect(): void {
        this.magnetNode.active = false;
    }

    updateHoleView(): void {
        const model = HoleManager.instance.holeModel;
        const { holeLevel, speed, view, diameter, radius } = model;
        console.log(`当前黑洞等级:${holeLevel},速度:${speed},视野:${view},直径:${diameter}`);
        this.speed = speed;
        // this.node.setScale(v3(diameter, 1, diameter));

        if (this.holeTigger) {
            this.holeTigger.radius = radius;
        }
        if (this.mouth) {
            this.mouth.setScale(v3(diameter, 1, diameter));
        }
        const sence = director.getScene();
        sence.emit(EasyControllerEvent.CAMERA_ZOOM, view);
    }
}


