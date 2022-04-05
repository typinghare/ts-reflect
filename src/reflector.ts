import 'reflect-metadata';
import { findOne } from './misc';
import { control } from './control';

/**
 * General type of constructor function.
 */
export type Constructor<Class = object> = (new (...args: any[]) => Class) | Function;

/**
 * Decorative interface.
 */
export interface Decorative<Context extends object> {
  /**
   * Set decorative context.
   * @param zone: symbol
   * @param context decorate context
   */
  setContext(zone: symbol, context: Partial<Context>): void;

  /**
   * Set decorative context value by a specified key.
   * @param zone
   * @param key
   * @param value
   */
  setContext<K extends keyof Context>(zone: symbol, key: K, value: Context[K]): void;

  /**
   * Get decorative context.
   * @param zone: symbol
   */
  getContext(zone: symbol): Context | undefined;

  /**
   * Get decorative context by a specified key.
   * @param zone
   * @param key
   */
  getContext<K extends keyof Context>(zone: symbol, key: K): Context[K] | undefined;
}

/**
 * Abstract reflector.
 */
export class AbstractReflector<Context extends object = Object> implements Decorative<Context> {
  /**
   * The name of the reflected object.
   * @protected
   */
  protected name: string;

  /**
   * Decorative context map.
   * @protected
   */
  protected readonly _decorativeContextMap: Map<symbol, Context> = new Map();

  /**
   * Constructor.
   * @param name
   */
  public constructor(name: string) {
    this.name = name;
  }

  public getContext(zone: symbol): Context | undefined;
  public getContext<K extends keyof Context>(zone: symbol, key: K): Context[K] | undefined;
  public getContext<K extends keyof Context>(zone: symbol, key?: K): Context | Context[K] | undefined {
    const decorativeContext = this._decorativeContextMap.get(zone);

    if (key === undefined) {
      return decorativeContext;
    }

    return decorativeContext && decorativeContext[key];
  }

  public setContext(zone: symbol, context: Partial<Context>): void;
  public setContext<K extends keyof Context>(zone: symbol, key: K, value: Context[K]): void;
  public setContext<K extends keyof Context>(zone: symbol, key: K | Partial<Context>, value?: Context[K]): void {
    const context = this.getContext(zone) || <Context>{};
    this._decorativeContextMap.set(zone, context);

    if (value === undefined) {
      Object.assign(context, key);
    } else {
      context[<K>key] = value;
    }
  }

  /**
   * Set the name of the reflected object.
   * @param name
   * @protected
   */
  protected setName(name: string): void {
    this.name = name;
  }

  /**
   * Get the name of the reflected object.
   */
  public getName(): string {
    return this.name;
  }
}

/**
 * Class reflector.
 */
export class Class<Context extends object = object> extends AbstractReflector<Context> {
  private readonly _constructor: Constructor;

  public decoratedMethodSet: Set<Method<any>> | undefined;

  public decoratedAccessorSet: Set<Accessor<any>> | undefined;

  public decoratedPropertySet: Set<Property<any>> | undefined;

  public constructor(name: string, _constructor: Constructor) {
    super(name);
    this._constructor = _constructor;
  }

  public getConstructor(): Constructor {
    return this._constructor;
  }

  public getMethod<MethodContext extends object = object>(name: string): Method<MethodContext> | null {
    if (this.decoratedMethodSet === undefined) return null;
    return findOne<Method<MethodContext>>(this.decoratedMethodSet, (method) => method.getName() === name);
  }

  public getAccessor<AccessorContext extends object = object>(name: string): Accessor<AccessorContext> | null {
    if (this.decoratedAccessorSet === undefined) return null;
    return findOne<Accessor<AccessorContext>>(this.decoratedAccessorSet, (accessor) => accessor.getName() === name);
  }

  public getProperty<PropertyContext extends object = object>(name: string): Property<PropertyContext> | null {
    if (this.decoratedPropertySet === undefined) return null;
    return findOne<Property<PropertyContext>>(this.decoratedPropertySet, (property) => property.getName() === name);
  }

  /**
   * Get parent class reflector.
   */
  public getParent<ParentContext extends object = object>(): Class<ParentContext> | null {
    const scanner = control.scanner;
    if (!scanner) return null;

    const parent = Object.getPrototypeOf(this._constructor);
    if (parent.name.length === 0) return null;
    return scanner.classCollector.getByConstructor<ParentContext>(parent) || null;
  }
}

/**
 * Method reflector.
 */
export class Method<Context extends object = object> extends AbstractReflector<Context> {
  private readonly _value: Function;

  public decoratedParameterArray: Array<Parameter<any>> = [];

  public constructor(name: string, value: Function) {
    super(name);
    this._value = value;
  }

  public getValue(): Function {
    return this._value;
  }

  public getParameterByName<ParameterContext extends object = object>(name: string): Parameter<ParameterContext> | undefined {
    for (const _parameter of this.decoratedParameterArray) {
      if (_parameter.getName() === name) return _parameter;
    }
    return undefined;
  }

  public getParameterByIndex<ParameterContext extends object = object>(index: number): Parameter<ParameterContext> | undefined {
    return this.decoratedParameterArray[index];
  }
}

/**
 * Accessor reflector.
 */
export class Accessor<Context extends object = object> extends AbstractReflector<Context> {
  public getter: Function | undefined;

  public setter: Function | undefined;
}

/**
 * Property reflector.
 */
export class Property<Context extends object = object> extends AbstractReflector<Context> {

}

/**
 * Parameter reflector.
 */
export class Parameter<Context extends object = object> extends AbstractReflector<Context> {
  constructor() {
    super('');
  }

  public setName(name: string): void {
    this.name = name;
  }
}