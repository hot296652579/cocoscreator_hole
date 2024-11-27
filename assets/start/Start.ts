import { _decorator, assetManager, Component, director, game, Label, Prefab, Node, AssetManager, Asset, PhysicsSystem, PhysicsSystem2D, EPhysics2DDrawFlags, AudioClip } from 'cc';
import { tgxModuleContext, tgxUIMgr, tgxUIWaiting } from '../core_tgx/tgx';
import { GameUILayers, GameUILayerNames } from '../scripts/GameUILayers';

import { ModuleDef } from '../scripts/ModuleDef';
import { SceneDef } from '../scripts/SceneDef';
import { JsonUtil } from '../core_tgx/base/utils/JsonUtil';
const { ccclass, property } = _decorator;

const _preloadBundles = [ModuleDef.BASIC, ModuleDef.MODULE_HOLE];

const _preloadRes = [
    { bundle: ModuleDef.BASIC, url: 'ui_alert/UI_Alert', type: 'prefab' },
    { bundle: ModuleDef.BASIC, url: 'ui_waiting/UI_Waiting', type: 'prefab' },
    { bundle: ModuleDef.MODULE_HOLE, url: 'Prefabs/Level/Level1.prefab', type: 'prefab' },
    { bundle: ModuleDef.MODULE_HOLE, url: 'Audio/bgm_boss.mp3', type: 'audio' },
    { bundle: ModuleDef.MODULE_HOLE, url: 'Audio/bgm_jiemian.mp3', type: 'audio' },
    { bundle: ModuleDef.MODULE_HOLE, url: 'Audio/bgm_youxi.mp3', type: 'audio' },
    { bundle: ModuleDef.MODULE_HOLE, url: 'Audio/chi.mp3', type: 'audio' },
    { bundle: ModuleDef.MODULE_HOLE, url: 'Audio/dianji.mp3', type: 'audio' },
    { bundle: ModuleDef.MODULE_HOLE, url: 'Audio/shengli.mp3', type: 'audio' },
    { bundle: ModuleDef.MODULE_HOLE, url: 'Audio/shibai.mp3', type: 'audio' },
    { bundle: ModuleDef.MODULE_HOLE, url: 'Audio/quanji.mp3', type: 'audio' },
];

const _loadingText = ['Loading.', 'Loading..', 'Loading...'];
const _totalNum = _preloadBundles.length + _preloadRes.length + 1;

@ccclass('Start')
export class Start extends Component {
    @property(Label)
    txtLoading: Label;

    @property(Prefab)
    uiCanvasPrefab: Prefab;

    @property(Node)
    loadingBar: Node;

    private _percent: string = '';
    private _numCurrentLoaded = 0;
    start() {

        // // 确保物理系统启用
        // PhysicsSystem2D.instance.enable = true;

        // // 开启调试信息
        // PhysicsSystem2D.instance.debugDrawFlags = EPhysics2DDrawFlags.Aabb |
        //     EPhysics2DDrawFlags.Pair |
        //     EPhysics2DDrawFlags.CenterOfMass |
        //     EPhysics2DDrawFlags.Joint |
        //     EPhysics2DDrawFlags.Shape;

        tgxModuleContext.setDefaultModule(ModuleDef.BASIC);

        game.frameRate = 61;
        tgxUIMgr.inst.setup(this.uiCanvasPrefab, GameUILayers.NUM, GameUILayerNames);

        this.preloadBundle(0);
        this.loadConfig();
    }

    async loadConfig() {
        await this.loadCustom();
    }

    loadCustom() {
        return new Promise(async (resolve, reject) => {
            await JsonUtil.loadDirAsync();
            resolve(null);
        });
    }

    onResLoaded() {
        this._numCurrentLoaded++;
        this._percent = ~~(this._numCurrentLoaded / _totalNum * 100) + '%';
    }

    preloadBundle(idx: number) {
        assetManager.loadBundle(_preloadBundles[idx], null, (err, bundle) => {
            console.log('module:<' + _preloadBundles[idx] + '>loaded.');
            idx++;
            this.onResLoaded();
            if (idx < _preloadBundles.length) {
                this.preloadBundle(idx);
            }
            else {
                this.preloadRes(0);
            }
        });
    }

    preloadRes(idx: number) {
        let res = _preloadRes[idx];
        let bundle = assetManager.getBundle(res.bundle);

        let onComplete = () => {
            idx++;
            this.onResLoaded();
            if (idx < _preloadRes.length) {
                this.preloadRes(idx);
            }
            else {
                this.onPreloadingComplete();
            }
        }
        if (bundle) {
            if (res.type == 'prefab') {
                bundle.preload(res.url, Prefab, onComplete);
            } else if (res.type == 'audio') {
                bundle.preload(res.url, AudioClip, onComplete);
            }
        }
    }

    onPreloadingComplete() {
        let bundle = assetManager.getBundle(ModuleDef.MODULE_HOLE);
        bundle.preloadScene(SceneDef.ROOSTER_HOLE, () => {
            this.onResLoaded();
            // director.loadScene(SceneDef.MAIN_MENU);

            const info = {
                bundle: 'module_hole',
                entryScene: 'rooster_black_hole'
            }
            tgxUIWaiting.show();
            assetManager.loadBundle(info.bundle, (err, bundle: AssetManager.Bundle) => {
                if (bundle) {
                    director.loadScene(info.entryScene, () => {
                        tgxUIMgr.inst.hideAll();
                        // tgxUIMgr.inst.showUI(UI_HUD);
                    });
                }
            });
        });
    }

    update(deltaTime: number) {
        if (this._percent) {
            this.txtLoading.string = 'Loading...' + this._percent;
        }
        else {
            let idx = Math.floor(game.totalTime / 1000) % 3;
            this.txtLoading.string = _loadingText[idx];
        }
        this.loadingBar.setScale(this._numCurrentLoaded / _totalNum, 1, 1);
    }
}


