import { _decorator, Component, Label, Node } from 'cc';
import { EventDispatcher } from '../../core_tgx/easy_ui_framework/EventDispatcher';
import { GameEvent } from './Enum/GameEvent';
import { LevelManager } from './Manager/LevelMgr';
import { PropManager } from './Manager/PropMgr';
const { ccclass, property } = _decorator;

@ccclass('BattleUI')
export class BattleUI extends Component {

    @property(Label)
    lbBossWeight: Label = null!;

    @property(Label)
    lbPlayerWeight: Label = null!;

    start() {
        this.setupUIListeners();
    }

    private setupUIListeners(): void {
        EventDispatcher.instance.on(GameEvent.EVENT_UPDATE_BATTLE_WEIGHT, this.onUpdateLbWeight, this);
    }

    private onUpdateLbWeight(): void {
        const { bossModel } = LevelManager.instance.levelModel;
        const { bossWeight } = bossModel;

        let total = 0;
        const eatsMap = PropManager.instance.eatsMap;
        eatsMap.forEach(element => {
            const { count, totalWeight } = element;
            total += totalWeight;
        });

        this.lbBossWeight.string = ` ${bossWeight}KG`;
        this.lbPlayerWeight.string = `${total}KG`;
    }

    protected onDestroy(): void {
        EventDispatcher.instance.off(GameEvent.EVENT_UPDATE_BATTLE_WEIGHT, this.onUpdateLbWeight);
    }
}


