import * as PIXI from "pixi.js";
import { Texture } from "pixi.js";
import { gsap } from "gsap";
import { PixiPlugin } from "gsap/PixiPlugin";
import { LoaderHelper } from "./LoaderHelper";

// Managers
import { SoundManager } from './SoundManager';
import { massiveRequire } from './utils';
import { TimeManager } from './TimeManager';
import { StorageDB } from './StorageManager';
import { SceneManager } from './SceneManager';
import { InputManager } from './InputManager';
import { GameConfig } from "../game/Config";

import { GameObject } from "./GameObject";

export const engineMessage = "[PIXI-ENGINE]: "

export class Engine {
    app: PIXI.Application;
    config: GameConfig;

    private loader: LoaderHelper;
    public sounds: SoundManager;
    public storage: StorageDB;
    public time: TimeManager;
    public scenes: SceneManager;
    public input: InputManager

    gameObjectsMap = new Map<string, GameObject>();
    gameObjectsNameMap = new Map<string, GameObject>();

    paused: boolean = false

    constructor() { }

    run(config: GameConfig) {
        gsap.registerPlugin(PixiPlugin);
        PixiPlugin.registerPIXI(PIXI);

        // NOTE: https://webpack.js.org/guides/dependency-management/#requirecontext
        // NOTE: The arguments passed to require.context must be literals!
        const loaderData = require["context"]('./../assets/', true, /\.(mp3|png|jpe?g|json)$/);

        this.config = config;

        document.title = config.name || 'PIXI-ENGINE';

        this.app = new PIXI.Application({
            resizeTo: window,
            autoStart: false,
            antialias: true,
            autoDensity: true,
            backgroundColor: 0x0,
            resolution: devicePixelRatio
        });
        this.storage = new StorageDB(config.storagePrefix);
        this.time = new TimeManager(this.app);
        this.scenes = new SceneManager(this.app, this.config);

        document.body.appendChild(this.app.view as any); // TODO: Argument of type 'ICanvas' is not assignable to parameter of type 'Node'.

        this.sounds = new SoundManager();
        this.loader = new LoaderHelper(massiveRequire(loaderData), this.sounds);
        // loader .... ON
        this.loader.preload().then((result) => {
            // loader .... OFF
            this.log(engineMessage + 'Resources loaded, starting loop!!');
            this.scenes.startDefaultScene();
            this.start();
        });

        this.app.ticker.maxFPS = 60;
        this.app.ticker.minFPS = 30;
        this.app.ticker.add((delta) => {
            /*             
            time += delta;
            if (time > 200 && !image) {
                image = app.renderer.plugins.extract.image(sprite).src;
                console.log(image);
                downloadImage(image, "img.png");
            } */
            this.time.update(delta)
            this.scenes.currentScene.update(delta);
        });

        this.input = new InputManager({
            ...{
                'UP': 'w',
                'DOWN': 's',
                'RIGHT': 'd',
                'LEFT': 'a',
            }, ...config.input
        });
    }

    // TODO: spostare nel time
    start() {
        this.app.ticker.start();
    }

    // TODO: spostare nel time
    stop() {
        this.app.ticker.stop();
    }

    // TODO: spostare nel time, vedere se utile
    toggle() {
        if (!this.paused) {
            this.stop();
            this.paused = true;
        } else {
            this.start();
            this.paused = false;
        }
    }

    log(message: string, ...other) {
        console.log(engineMessage + message, ...other)
    }

    /**
     * Get the pre-loaded assets (both img and .json)
     */
    getAsset(key: string) {
        const what = this.loader.resources[key];
        // IMGs
        if (what instanceof Texture) {
            return new PIXI.Sprite(this.loader.resources[key]);
        }
        // JSON
        return what
    }

    /**
     * Take the object from the gameObjects store
     * @param name the name of the object
     * @returns the object
     */
    getObjectByName(name: string) {
        if (this.gameObjectsNameMap.has(name)) {
            return this.gameObjectsNameMap.get(name)
        }
        return null
    }

    /**
     * Take the object from the gameObjects store
     * @param id the id of the object
     * @returns the object
     */
    getObjectById(id: string) {
        if (this.gameObjectsMap.has(id)) {
            return this.gameObjectsMap.get(id)
        }
        return null
    }

    getObjectByTag(tags: string[]) {
        // TODO: implementare i tag
    }


}

export const PixiEngine = new Engine();

// come salvare uno screen : https://codesandbox.io/s/pixitests-forked-1gm13?file=/src/index.js:1164-1548
