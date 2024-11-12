import { _decorator, Component, CCFloat, EventTouch, math, Sprite, v3, Vec3, Button, NodeEventType, Label, Node, CCBoolean } from 'cc';
import { EventDispatcher } from '../../core_tgx/easy_ui_framework/EventDispatcher';
import { GameEvent } from './Enum/GameEvent';

const { ccclass, property } = _decorator;

/**
 * 战斗控制器
 */
@ccclass('BattleController')
export class BattleController extends Component {

    @property({ type: CCBoolean, visible: true, displayName: '测试输赢' })
    isWin = false;

    protected start(): void {
        //DOTO 战斗判断
        this.scheduleOnce(() => {
            this.node.removeFromParent();
            this.node.destroy();

            if (this.isWin) {
                EventDispatcher.instance.emit(GameEvent.EVENT_BATTLE_SUCCESS_LEVEL_UP);
            } else {
                EventDispatcher.instance.emit(GameEvent.EVENT_BATTLE_FAIL_LEVEL_RESET);
            }
        }, 3)
    }

    protected onDestroy(): void {

    }
}

