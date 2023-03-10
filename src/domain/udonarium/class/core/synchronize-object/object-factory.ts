/* eslint-disable no-underscore-dangle */
import { notImplementationGameObjects } from '@/domain/gameObject/constants';
import type { GameObject } from './game-object';

// eslint-disable-next-line no-var, import/no-mutable-exports
export declare var Type: FunctionConstructor;
export interface Type<T> extends Function {
  new (...args: any[]): T;
}

export class ObjectFactory {
  private static _instance: ObjectFactory;

  static get instance(): ObjectFactory {
    if (!ObjectFactory._instance) ObjectFactory._instance = new ObjectFactory();
    return ObjectFactory._instance;
  }

  private constructorMap: Map<string, Type<GameObject>> = new Map();

  private aliasMap: Map<Type<GameObject>, string> = new Map();

  private constructor() {
    console.log('ObjectFactory ready...');
  }

  register<T extends GameObject>(constructor: Type<T>, alias?: string) {
    if (!alias)
      alias = constructor.name ?? constructor.toString().match(/function\s*([^(]*)\(/)?.[1] ?? '';
    if (this.constructorMap.has(alias)) {
      console.error(`その alias<${alias}> はすでに割り当て済みじゃねー？`);
      return;
    }
    if (this.aliasMap.has(constructor)) {
      console.error('その constructor はすでに登録済みじゃねー？', constructor);
      return;
    }
    console.log(`addGameObjectFactory -> ${alias}`);
    this.constructorMap.set(alias, constructor);
    this.aliasMap.set(constructor, alias);
  }

  create<T extends GameObject>(alias: string, identifer?: string): T | null {
    const ClassConstructor = this.constructorMap.get(alias);
    if (!ClassConstructor) {
      // 警告メッセージが溢れるので、明確に実装していないUdonariumオブジェクトは警告から弾く
      if (notImplementationGameObjects.includes(alias)) {
        return null;
      }
      console.warn(`${alias}という名のGameObjectクラスは定義されていません`);
      return null;
    }
    const gameObject: GameObject = new ClassConstructor(identifer);
    return <T>gameObject;
  }

  getAlias<T extends GameObject>(constructor: Type<T>): string {
    return this.aliasMap.get(constructor) ?? '';
  }
}
