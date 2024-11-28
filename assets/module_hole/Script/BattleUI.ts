import { _decorator, Component, Label, Node, ProgressBar, tween, Tween } from 'cc';
import { EventDispatcher } from '../../core_tgx/easy_ui_framework/EventDispatcher';
import { GameEvent } from './Enum/GameEvent';
import { LevelManager } from './Manager/LevelMgr';
import { PropManager } from './Manager/PropMgr';
import { GameUtil } from './Utils';
const { ccclass, property } = _decorator;

const duration: number = 1.5;
@ccclass('BattleUI')
export class BattleUI extends Component {

    private rollingTween: Tween<any> | null = null; // 滚动动画的 tween 对象
    private progressTween: Tween<any> | null = null; // 滚动动画的 tween 对象

    @property(Label)
    lbBossWeight: Label = null!;
    @property(ProgressBar)
    bossProgress: ProgressBar = null!;

    @property(Label)
    lbPlayerWeight: Label = null!;
    @property(ProgressBar)
    playerProgress: ProgressBar = null!;

    start() {
        this.setupUIListeners();
    }

    private setupUIListeners(): void {
        EventDispatcher.instance.on(GameEvent.EVENT_UPDATE_BATTLE_WEIGHT, this.onUpdateLbWeight, this);
    }

    private onUpdateLbWeight(): void {
        this.updatePlayerWeight();
        this.updateBossWeight();
    }

    private updatePlayerWeight(): void {
        let total = PropManager.instance.getLevelTotalWeight() || 0;
        // this.lbPlayerWeight.string = `${total}KG`;
        this.startRolling(0, total, duration);

        const targetValue = PropManager.instance.getLevelTotalWeight() || 0;
        this.startPlayerProgress(0, targetValue, duration);
    }

    /**
     * 开始滚动重量
     * @param from 起始金额
     * @param to 目标金额
     * @param duration 滚动持续时间（秒）
     */
    private startRolling(from: number, to: number, duration: number) {
        const lbPlayerWeight = this.lbPlayerWeight;

        if (this.rollingTween) {
            this.rollingTween.stop();
            this.rollingTween = null;
        }
        if (!lbPlayerWeight) return;

        // 定义一个对象来存储滚动的数值
        const rollingData = { value: from };

        this.rollingTween = tween(rollingData)
            .to(duration, { value: to }, {
                onUpdate: () => {
                    if (lbPlayerWeight) {
                        const weight = rollingData.value.toFixed(0);
                        lbPlayerWeight.string = GameUtil.formatWeight(Number(weight));
                    }
                },
            })
            .call(() => {
                if (lbPlayerWeight) {
                    const weight = to.toFixed(0);
                    lbPlayerWeight.string = GameUtil.formatWeight(Number(weight));
                }
                this.rollingTween = null;
            })
            .start();
    }

    /**
     * 开始滚动经验条
     * @param from 起始经验
     * @param to 目标经验
     * @param duration 滚动持续时间（秒）
     */
    private startPlayerProgress(from: number, to: number, duration: number) {
        const lbPlayerWeight = this.lbPlayerWeight;

        if (this.progressTween) {
            this.progressTween.stop();
            this.progressTween = null;
        }
        if (!lbPlayerWeight) return;

        // 定义一个对象来存储滚动的数值
        const rollingData = { value: from };
        const { quality } = LevelManager.instance.levelModel; //关卡总质量
        const precision = 10000;
        const total = this.playerProgress.totalLength;

        this.progressTween = tween(rollingData)
            .to(duration, { value: to }, {
                onUpdate: () => {
                    if (this.playerProgress) {
                        const progressRatio = Math.floor((rollingData.value * precision) / quality) / precision;
                        const progressLength = progressRatio * total;
                        this.playerProgress.progress = progressLength / total;
                        this.progressTween = null;
                    }
                },
            })
            .call(() => {
                const progressRatio = Math.floor((to * precision) / quality) / precision;
                const progressLength = progressRatio * total;
                this.playerProgress.progress = progressLength / total;
                this.progressTween = null;
            })
            .start();
    }

    private updateBossWeight(): void {
        let bossWeight = LevelManager.instance.getBossWeight();
        this.lbBossWeight.string = GameUtil.formatWeight(bossWeight);
    }

    protected onDestroy(): void {
        EventDispatcher.instance.off(GameEvent.EVENT_UPDATE_BATTLE_WEIGHT, this.onUpdateLbWeight);
    }
}


