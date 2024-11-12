import { _decorator, BoxCollider, Button, Component, game, ITriggerEvent, Node, SphereCollider, Vec3 } from 'cc';
import { UIJoyStick } from './UIJoyStick';
import { EventDispatcher } from '../../core_tgx/easy_ui_framework/EventDispatcher';
import { GameEvent } from './Enum/GameEvent';
import { LevelManager } from './Manager/LevelMgr';
import { PropManager } from './Manager/PropMgr';
import { HoleManager } from './Manager/HoleMgr';
import { PropItem } from './PropItem';
const { ccclass, property } = _decorator;

@ccclass('HolePlayer')
export class HolePlayer extends Component {

    holeTigger: SphereCollider = null!;
    diameter: number = 1;
    speed: number = 1;
    view: number = 1;

    coefficient: number = 15;

    start() {
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
        this.holeTigger.on('onTriggerEnter', this.onTriggerEnter, this);
        this.holeTigger.on('onTriggerExit', this.onTriggerExit, this);
    }

    addEventListener(): void {
        EventDispatcher.instance.on(GameEvent.EVENT_HOLE_LEVEL_SIEZE_UP, this.updateHoleView, this);
    }

    onTriggerEnter(event: ITriggerEvent): void {
        const holeRadius = this.holeTigger.radius;
        const distance = this.getPlanceVec3(event).length();
        if (event.otherCollider.getGroup() == 1 << 4) {
            if (distance <= holeRadius * this.coefficient) {
                //EdibleThing 层组不与地面碰撞交集 就可通过刚体重力掉落
                event.otherCollider.setGroup(1 << 3);
                this.pullTowardsHole(event);
                this.eatProp(event);
            }
        }
    }

    private pullTowardsHole(event: ITriggerEvent): void {
        const otherRigidBody = event.otherCollider.attachedRigidBody;
        if (otherRigidBody) {
            // 获取黑洞和物体的位置差向量，并将物体朝黑洞中心拉动
            const directionToHole = this.getPlanceVec3(event).normalize().negative();
            // 应用一个较大的冲量，使物体快速移动到黑洞
            otherRigidBody.applyImpulse(directionToHole.multiplyScalar(5), directionToHole);
        }
    }

    eatProp(event: ITriggerEvent): void {
        const otherNode = event.otherCollider.node;
        //DOTO 乘以经验加成倍数
        const exp = otherNode.getComponent(PropItem)?.exp;

        PropManager.instance.addExpPrefab(exp, event.otherCollider.node);
        HoleManager.instance.addExp(exp);
    }

    // onTriggerStay(event: ITriggerEvent): void {
    //     if (event.otherCollider.getGroup() == 1 << 3) {
    //         const otherPos = event.otherCollider.worldBounds.center;
    //         const heloToOtherDir = this.getPlanceVec3(event).normalize();
    //         heloToOtherDir.y = otherPos.y;
    //         const heloActtion = heloToOtherDir.clone().negative();

    //         //根据距离增加吸引力，距离越近，吸引力越强
    //         // const pullStrength = Math.max(0.2, (holeRadius * coefficient - distance) / (holeRadius * coefficient)) * 5;
    //         // const pullAction = heloToOtherDir.clone().negative().multiplyScalar(pullStrength);

    //         event.otherCollider.attachedRigidBody?.applyImpulse(heloActtion.multiplyScalar(0.2), heloToOtherDir);
    //     }
    // }

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
        //DOTO 
        console.log('根据黑洞等级 刷新对应视野大小和直径');
    }
}


