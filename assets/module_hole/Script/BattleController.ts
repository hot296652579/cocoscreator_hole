import { _decorator, Component, CCFloat, EventTouch, math, Sprite, v3, Vec3, Button, NodeEventType, Label, Node, CCBoolean, game, find, Toggle, Prefab } from 'cc';
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
    levelPrefabs: Prefab[] = [];

    @property(Node)
    player: Node = null!;

    @property(Node)
    boss: Node = null!;

    protected start(): void {
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

    /** 获取物理外挂是否勾选*/
    getPlugCheck(): boolean {
        const canvas = this.node.parent.parent.getChildByName('Canvas');
        const toggle = canvas.getChildByPath('GameUI/BattleBottom/TogglePlug')?.getComponent(Toggle);
        const { isChecked } = toggle;
        return isChecked;
    }

    //DOTO 吃道具动画
    private doEatingAnimation(): void {

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

