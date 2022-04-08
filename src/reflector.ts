import 'reflect-metadata';
import { classContainer } from './container';
import { Collector } from './collector';

/**
 * General type of constructor function.
 */
export type Constructor<Class = object> = (new (...args: any[]) => Class) | Function;

/**
 * The parent type of context.
 */
export type AnyMap = { [key: string | symbol | number]: any };

/**
 * The zone.
 * In order to avoid the occurrence of keys collision, ts-reflect introduces the zone.
 * Users are able to create their own zone and pass it to functions, such as
 * <getContext> and <setContext>, when needed.
 * When it is omitted, the <defaultZone> will be passed.
 */
export class Zone {
  private readonly _label: string;

  constructor(label: string) {
    this._label = label;
  }

  public get label(): string {
    return this._label;
  }
}

/**
 * The default zone passed to <getContext> and <setContext>.
 */
export const defaultZone = new Zone('defaultZone');

/**
 * Decorative interface.
 */
export interface Decorative<Context extends AnyMap> {
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
export abstract class Reflector<Context extends AnyMap> implements Decorative<Context> {
  /**
   * Whether is decorated.
   * @protected
   */
  protected _isDecorated: boolean = false;

  /**
   * The name of the reflected object.
   * @protected
   */
  protected name: string;

  /**
   * Decorative context map.
   * @protected
   */
  protected readonly _decorativeContextMap: Map<Zone, Context> = new Map();

  /**
   * Constructor.
   * @param name
   */
  public constructor(name: string) {
    this.name = name;
  }

  public getContext(): Context | undefined;
  public getContext(zone: Zone): Context | undefined;
  public getContext<K extends keyof Context>(key: K): Context[K] | undefined;
  public getContext<K extends keyof Context>(key: K, zone: Zone): Context[K] | undefined;
  /**
   * Get context.
   * @param key
   * @param zone
   */
  public getContext<K extends keyof Context>(key?: K, zone?: Zone): Context | Context[K] | undefined {
    if (zone === undefined) {
      if (key === undefined) {
        return this._decorativeContextMap.get(defaultZone);
      } else if (key instanceof Zone) {
        return this._decorativeContextMap.get(key);
      } else {
        const context = this._decorativeContextMap.get(defaultZone);
        return context && context[key];
      }
    } else {
      if (key === undefined) {
        throw new TypeError('Key should not be undefined.');
      } else {
        const context = this._decorativeContextMap.get(zone);
        return context && context[key];
      }
    }
  }

  public setContext(context: Partial<Context>): void;
  public setContext(context: Partial<Context>, zone: Zone): void;
  public setContext<K extends keyof Context>(key: K, value: Context[K]): void;
  public setContext<K extends keyof Context>(key: K, value: Context[K], zone: Zone): void;
  /**
   * Set context.
   * @param key
   * @param value
   * @param zone
   */
  public setContext<K extends keyof Context>(key: K | Partial<Context>, value?: Context[K] | Zone, zone?: Zone): void {
    if (zone === undefined) {
      let zone = defaultZone;
      if (value instanceof Zone) {
        zone = value;
      }

      if (value === undefined || value instanceof Zone) {
        const _context = this._decorativeContextMap.get(zone) || <Context>{};
        this._decorativeContextMap.set(zone, _context);
        _context && Object.assign(_context, key);
      } else {
        const _context = this._decorativeContextMap.get(defaultZone) || <Context>{};
        this._decorativeContextMap.set(zone, _context);
        if (_context) {
          _context[<K>key] = value;
        }
      }
    } else {
      const _context = this._decorativeContextMap.get(zone) || <Context>{};
      this._decorativeContextMap.set(zone, _context);
      if (_context) {
        _context[<K>key] = <Context[K]>value;
      }
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

  /**
   * Set the reflector decorated.
   */
  public decorated(): void {
    this._isDecorated = true;
  }

  /**
   * Whether is decorated.
   */
  public isDecorated(): boolean {
    return this._isDecorated;
  }
}

/**
 * Class reflector.
 */
export class Class<Context extends AnyMap = any> extends Reflector<Context> {
  private readonly _constructor: Constructor;

  private readonly _methodCollector: Collector<Method> = new Collector();

  private readonly _accessorCollector: Collector<Accessor> = new Collector();

  /**
   * Under the framework of Javascript, properties of a class, unlike methods and accessors,
   * cannot be accessed by constructor, but can be accessed by an instance of the class.
   * Therefore, ts-reflect will not provide reflectors for properties without decorator.
   * @private
   */
  private readonly _propertyCollector: Collector<Property> = new Collector();

  public constructor(_constructor: Constructor) {
    super(_constructor.name);
    this._constructor = _constructor;
  }

  public getConstructor(): Constructor {
    return this._constructor;
  }

  public getMethodCollector<MethodContext extends AnyMap>(): Collector<Method<MethodContext>> {
    return this._methodCollector;
  }

  public getAccessorCollector<AccessorContext extends AnyMap>(): Collector<Accessor<AccessorContext>> {
    return this._accessorCollector;
  }

  public getPropertyCollector<PropertySet extends AnyMap>(): Collector<Property<PropertySet>> {
    return this._propertyCollector;
  }

  public getDecoratedMethodCollector<MethodContext extends AnyMap>(): Collector<Method<MethodContext>> {
    return this._methodCollector.collect(method => method.isDecorated());
  }

  public getDecoratedAccessorCollector<AccessorContext extends AnyMap>(): Collector<Accessor<AccessorContext>> {
    return this._accessorCollector.collect(accessor => accessor.isDecorated());
  }

  public getDecoratedPropertyCollector<PropertyContext extends AnyMap>(): Collector<Property<PropertyContext>> {
    return this._propertyCollector.collect(property => property.isDecorated());
  }

  public getMethod<MethodContext extends AnyMap = any>(name: string): Method<MethodContext> | null {
    return this._methodCollector.find((method) => method.getName() === name);
  }

  public getAccessor<AccessorContext extends AnyMap = any>(name: string): Accessor<AccessorContext> | null {
    return this._accessorCollector.find((method) => method.getName() === name);
  }

  public getProperty<PropertyContext extends AnyMap = any>(name: string): Property<PropertyContext> | null {
    return this._propertyCollector.find((method) => method.getName() === name);
  }

  /**
   * Get parent class reflector.
   */
  public getParent<ParentContext extends AnyMap = any>(): Class<ParentContext> | null {
    const constructorPrototype = Object.getPrototypeOf(this._constructor);
    if (constructorPrototype.name.length === 0) {
      // No self-defined parent class
      return null;
    }

    return classContainer.getByConstructor<ParentContext>(constructorPrototype) || null;
  }
}

/**
 * Method reflector.
 */
export class Method<Context extends AnyMap = any> extends Reflector<Context> {
  private readonly _value: Function;

  public _parameterArray: Array<Parameter> = [];

  public constructor(value: Function) {
    super(value.name);
    this._value = value;
  }

  public getValue(): Function {
    return this._value;
  }

  public getParameterArray<ParameterContext extends AnyMap>(): Array<Parameter<ParameterContext>> {
    return this._parameterArray;
  }

  public getParameterByName<ParameterContext extends AnyMap>(name: string): Parameter<ParameterContext> | undefined {
    for (const _parameter of this._parameterArray) {
      if (_parameter.getName() === name) return _parameter;
    }
    return undefined;
  }

  public getParameterByIndex<ParameterContext extends AnyMap>(index: number): Parameter<ParameterContext> | undefined {
    return this._parameterArray[index];
  }
}

/**
 * Accessor reflector.
 */
export class Accessor<Context extends AnyMap = any> extends Reflector<Context> {
  public getter: Function | undefined;

  public setter: Function | undefined;
}

/**
 * Property reflector.
 */
export class Property<Context extends AnyMap = any> extends Reflector<Context> {

}

/**
 * Parameter reflector.
 */
export class Parameter<Context extends AnyMap = any> extends Reflector<Context> {
  constructor() {
    super('');
  }

  public setName(name: string): void {
    this.name = name;
  }
}