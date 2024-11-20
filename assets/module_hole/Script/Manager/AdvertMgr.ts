import { _decorator, Node, Prefab, instantiate, Component, Camera, UITransform, v3, game, view, screen, tween, Vec3 } from 'cc';
import { UserModel } from '../Model/UserModel';
import { LevelManager } from './LevelMgr';
import { EventDispatcher } from '../../../core_tgx/easy_ui_framework/EventDispatcher';
import { ADEvent } from '../Enum/ADEvent';
const { ccclass, property } = _decorator;

/** 广告管理*/
@ccclass('AdvertMgr')
export class AdvertMgr {
    private static _instance: AdvertMgr | null = null;
    public static get instance(): AdvertMgr {
        if (!this._instance) this._instance = new AdvertMgr();
        return this._instance;
    }

    adInstance: any = null;

    initilize(): void {
        this.adInstance = (window as any)['adInstance'];
    }

    /** 显示激励广告*/
    showReawardVideo(cb?: () => void): void {
        if (!this.adInstance) {
            cb && cb();
            return;
        }

        this.adInstance.rewardAd({
            beforeAd() {
                console.log('The ad starts playing, and the game should pause.');
                EventDispatcher.instance.emit(ADEvent.REWARD_VIDEO_PLAY);
            },
            adDismissed() {
                console.log('Player dismissed the ad before completion.');
                EventDispatcher.instance.emit(ADEvent.REWARD_VIDEO_DISMISSED);
            },
            adViewed() {
                console.log('Ad was viewed and closed.');
                EventDispatcher.instance.emit(ADEvent.REWARD_VIDEO_CLOSEED);
                if (cb) cb();
            },
            error(err: any) {
                console.log(`激励广告错误:${err}`);
                EventDispatcher.instance.emit(ADEvent.REWARD_VIDEO_ERROR);
            }
        });
    }
}
