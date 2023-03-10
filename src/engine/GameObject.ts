import { PixiEngine } from './Engine';
import { Sprite } from "pixi.js";

export function GameObjectEntity(target: any) {
  const original = target;

  // si decora la classe originale
  const newConstructor: any = function (...args: any[]) {
    // si istanzia la classe decorata
    const instance = new original(...args);

    instance.id = Math.random().toString(36).substring(2, 15); // `${Date.now()}${Math.random()*1000000}`;
    // si registra nell'InstanceTracker
    PixiEngine.gameObjectsMap.set(instance.id, instance);
    PixiEngine.gameObjectsNameMap.set(instance.name, instance);
    PixiEngine.scenes.currentScene.addChild(instance.entity);
    // ritorna l'istanza
    return instance;
  };

  newConstructor.prototype = original.prototype;
  return newConstructor;
}

export class GameObject {
  private _id: string;
  private _name: string;
  private _sprite: Sprite;

  constructor(name: string, spriteName:string) {
    this._name = name;
    this._sprite = PixiEngine.getAsset(spriteName);
  }

  get id(): string {
    return this._id;
  }

  set id(id:string){
    this._id = id
  }

  get name(): string {
    return this._name;
  }

  set name(value: string) {
    this._name = value;
  }

  get entity(): Sprite {
    return this._sprite;
  }

  set entity(value: Sprite) {
    this._sprite = value;
  }

  hide(){
    this._sprite.visible = false;
  }

  show(){
    this._sprite.visible = true;
  }

  update(){}
}