import { _decorator, animation, Component, Node, SkeletalAnimation } from 'cc';
const { ccclass, property } = _decorator;

const duration: number = 0.3;
@ccclass('CharacterCtrl')
export class CharacterCtrl extends Component {

    skeletalAnimation: SkeletalAnimation = null!;

    start() {
        this.skeletalAnimation = this.node.getComponentInChildren(SkeletalAnimation)!;
    }

    public doAnimation(state: ActionState): void {
        const aniName = this.getAniPlayName(state);
        if (!this.skeletalAnimation) return;
        console.log(`播放的动画名:${aniName}`);
        this.skeletalAnimation.crossFade(aniName, duration);
    }

    /** 返回播放的动画名称*/
    private getAniPlayName(state: ActionState): string {
        switch (state) {
            case ActionState.Idle:
                return 'root|Idle';
            case ActionState.Attack:
                return 'root|Attack.001';
            case ActionState.Win:
                return 'root|Victory';
            default:
                return 'root|Idle';
        }
    }
}

export const enum ActionState {
    Idle,
    Attack,
    Win
}


