import { _decorator, BoxCollider, Component, CylinderCollider, director, game, isValid, ITriggerEvent, SphereCollider, v3, Vec3 } from 'cc';
import { EasyControllerEvent } from '../../core_tgx/easy_controller/EasyController';
import { EventDispatcher } from '../../core_tgx/easy_ui_framework/EventDispatcher';
import { GameEvent } from './Enum/GameEvent';
import { HoleManager } from './Manager/HoleMgr';
import { PropManager } from './Manager/PropMgr';
import { PropItem } from './PropItem';
import { UIJoyStick } from './UIJoyStick';
import { HoleGameAudioMgr } from './Manager/HoleGameAudioMgr';
const { ccclass, property } = _decorator;

@ccclass('HolePlayer')
export class HolePlayer extends Component {

    holeTigger: SphereCollider = null!;
    getScoreTigger: BoxCollider = null!;
    diameter: number = 1;
    speed: number = 1;
    view: number = 1;

    coefficient: number = 15;

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
        this.getScoreTigger = this.node.getComponent(BoxCollider)!;
        this.holeTigger.on('onTriggerEnter', this.onTriggerEnter, this);
        this.holeTigger.on('onTriggerExit', this.onTriggerExit, this);
        this.getScoreTigger.on('onTriggerEnter', this.onGetScoreTriggerEnter, this);
    }

    addEventListener(): void {
        EventDispatcher.instance.on(GameEvent.EVENT_HOLE_LEVEL_SIEZE_UP, this.updateHoleView, this);
        EventDispatcher.instance.on(GameEvent.EVENT_HOLE_LEVEL_SIEZE_RESET, this.updateHoleView, this);
    }

    protected onDestroy(): void {
        EventDispatcher.instance.off(GameEvent.EVENT_HOLE_LEVEL_SIEZE_UP, this.updateHoleView);
        EventDispatcher.instance.off(GameEvent.EVENT_HOLE_LEVEL_SIEZE_RESET, this.updateHoleView);
    }

    onTriggerEnter(event: ITriggerEvent): void {
        const holeRadius = this.holeTigger.radius;
        const distance = this.getPlanceVec3(event).length();
        if (event.otherCollider.getGroup() == 1 << 4) {
            if (distance <= holeRadius * this.coefficient) {
                //EdibleThing 层组不与地面碰撞交集 就可通过刚体重力掉落
                event.otherCollider.setGroup(1 << 3);
                this.pullTowardsHole(event);
            }
        }
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
            otherRigidBody.applyImpulse(directionToHole.multiplyScalar(3), directionToHole);
        }
    }

    eatProp(event: ITriggerEvent): void {
        HoleGameAudioMgr.playOneShot('Audio/Eat', 1.0);
        const otherNode = event.otherCollider.node;
        let exp = otherNode.getComponent(PropItem)?.exp;
        const expBonus = PropManager.instance.expAfterBonus(exp);
        PropManager.instance.addExpPrefab(expBonus, event.otherCollider.node);
        HoleManager.instance.addExp(expBonus);
    }

    onTriggerStay(event: ITriggerEvent): void {
        // console.log(`碰撞持续stay otherGroup->:${event.otherCollider.getGroup()}`);
        // if (event.otherCollider.getGroup() == 1 << 3) {
        //     const otherPos = event.otherCollider.worldBounds.center;
        //     const heloToOtherDir = this.getPlanceVec3(event).normalize();
        //     heloToOtherDir.y = otherPos.y;
        //     const heloActtion = heloToOtherDir.clone().negative();
        //     event.otherCollider.attachedRigidBody?.applyImpulse(heloActtion.multiplyScalar(0.5), heloToOtherDir);
        // }
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
        this.MoveHandler();
    }

    MoveHandler(): void {
        const playerDir = UIJoyStick.ins.dir;
        const playerX = playerDir.x * this.speed * game.deltaTime;
        const playerZ = playerDir.y * this.speed * game.deltaTime;

        this.node.setPosition(this.node.position.x + playerX, 0, this.node.position.z - playerZ);
    }

    updateHoleView(): void {
        const model = HoleManager.instance.holeModel;
        const { holeLevel, speed, view, diameter } = model;
        this.speed = speed;
        this.node.setScale(v3(diameter, 1, diameter));
        console.log(`黑洞等级:${holeLevel} diameter:${diameter} view:${view} speed:${speed}`);

        const sence = director.getScene();
        sence.emit(EasyControllerEvent.CAMERA_ZOOM, view);
    }
}


