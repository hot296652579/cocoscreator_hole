import { _decorator, Node, Prefab, instantiate, Component } from 'cc';
const { ccclass, property } = _decorator;

/** 道具管理器*/
@ccclass('PropManager')
export class PropManager {
    private static _instance: PropManager | null = null;
    public static get instance(): PropManager {
        if (!this._instance) this._instance = new PropManager();
        return this._instance;
    }

}
