/**
 * General type of constructor function.
 */
import { findOne } from './misc';
import 'reflect-metadata';
import fs from 'fs';
import path from 'path';
import {
  METADATA_KEY_ACCESSOR_SET,
  METADATA_KEY_CLASS,
  METADATA_KEY_METHOD_SET,
  METADATA_KEY_PARAMETER_ARRAY,
  METADATA_KEY_PROPERTY_SET
} from './constant';
import getParameterNames from '@captemulation/get-parameter-names';

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
 *
 */
export class AbstractReflector<Context extends object> implements Decorative<Context> {
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

export class Class<Context extends object = object> extends AbstractReflector<Context> {
  private readonly _constructor: Constructor;

  public decoratedMethodSet: Set<Method<any>> = new Set();

  public decoratedAccessorSet: Set<Accessor<any>> = new Set();

  public decoratedPropertySet: Set<Property<any>> = new Set();

  public constructor(name: string, _constructor: Constructor) {
    super(name);
    this._constructor = _constructor;
  }

  public getConstructor(): Constructor {
    return this._constructor;
  }

  public getMethod<MethodContext extends object = object>(name: string): Method<MethodContext> | null {
    return findOne<Method<MethodContext>>(this.decoratedMethodSet, (method) => method.getName() === name);
  }

  public getAccessor<AccessorContext extends object = object>(name: string): Accessor<AccessorContext> | null {
    return findOne<Accessor<AccessorContext>>(this.decoratedAccessorSet, (accessor) => accessor.getName() === name);
  }

  public getProperty<PropertyContext extends object = object>(name: string): Property<PropertyContext> | null {
    return findOne<Property<PropertyContext>>(this.decoratedPropertySet, (property) => property.getName() === name);
  }
}

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

export class Accessor<Context extends object = object> extends AbstractReflector<Context> {
  public getter: Function | undefined;

  public setter: Function | undefined;
}

export class Property<Context extends object = object> extends AbstractReflector<Context> {

}

export class Parameter<Context extends object = object> extends AbstractReflector<Context> {
  constructor() {
    super('');
  }

  public setName(name: string): void {
    this.name = name;
  }
}

/**
 * Decorator generator.
 */
export class DecoratorGenerator {
  private readonly _zone: symbol;

  constructor(zone: symbol) {
    this._zone = zone;
  }

  public classDecorator<Context extends object = object>(
    context?: Partial<Context>,
    decorator?: (this: Class<Context>, ...args: Parameters<ClassDecorator>) => void
  ): ClassDecorator {
    return (constructor: Function): void => {
      const _class: Class<Context> =
        Reflect.getOwnMetadata(METADATA_KEY_CLASS, constructor) || new Class(constructor.name, constructor);
      Reflect.defineMetadata(METADATA_KEY_CLASS, _class, constructor);

      // register to class collection
      classCollector.setClass(constructor.name, _class);

      // load methods (if it hasn't been done)
      if (_class.decoratedMethodSet === undefined) {
        _class.decoratedMethodSet = Reflect.getMetadata('hareMethodSet', constructor) || new Set<Method>();
        _class.decoratedMethodSet.forEach(decoratedMethod => {
          decoratedMethod.decoratedParameterArray =
            Reflect.getOwnMetadata('hareParameterArray', constructor, decoratedMethod.getName()) || [];
          const parameterNames = getParameterNames(decoratedMethod.getValue());
          for (const decoratedParameter of decoratedMethod.decoratedParameterArray) {
            const name = parameterNames.shift();
            name && decoratedParameter.setName(name);
          }
        });
      }

      // load accessors (if it hasn't been done)
      if (_class.decoratedAccessorSet === undefined) {
        _class.decoratedAccessorSet =
          Reflect.getMetadata('hareAccessorSet', constructor) || new Set<Accessor>();
      }

      // load properties (if it hasn't been done)
      if (_class.decoratedPropertySet === undefined) {
        _class.decoratedPropertySet =
          Reflect.getMetadata('harePropertySet', constructor) || new Set<Property>();
      }

      // set context
      const _context = _class.getContext(this._zone) || {};
      Object.assign(_context, context);
      _class.setContext(this._zone, _context);
      decorator && decorator.apply(_class, [constructor]);
    };
  }

  public methodDecorator<Context extends object = object>(
    context?: Partial<Context>,
    decorator?: (this: Method<Context>, ...args: Parameters<MethodDecorator>) => void
  ): MethodDecorator {
    return (target: Object, methodName: string | symbol, descriptor: PropertyDescriptor): void => {
      const constructor: Function = target.constructor;
      const methodSet: Set<Method<Context>> =
        Reflect.getOwnMetadata(METADATA_KEY_METHOD_SET, constructor) || new Set();
      Reflect.defineMetadata(METADATA_KEY_METHOD_SET, methodSet, constructor);

      const method = findOne(methodSet, method => method.getName() === methodName)
        || new Method<Context>(methodName.toString(), descriptor.value);
      methodSet.add(method);

      // set context
      context && method.setContext(this._zone, context);
      decorator && decorator.apply(method, [target, methodName, descriptor]);
    };
  }

  public accessorDecorator<Context extends object = object>(
    context?: Partial<Context>,
    decorator?: (this: Accessor<Context>, ...args: Parameters<MethodDecorator>) => void
  ): MethodDecorator {
    return (target: Object, accessorName: string | symbol, descriptor: PropertyDescriptor): void => {
      const constructor: Function = target.constructor;
      const accessorSet: Set<Accessor<Context>> =
        Reflect.getOwnMetadata(METADATA_KEY_ACCESSOR_SET, constructor) || new Set();
      Reflect.defineMetadata(METADATA_KEY_ACCESSOR_SET, accessorSet, constructor);

      const accessor = findOne(accessorSet, accessor => accessor.getName() === accessorName)
        || new Accessor<Context>(accessorName.toString());
      accessorSet.add(accessor);
      if (descriptor.get !== undefined) accessor.getter = descriptor.get;
      if (descriptor.set !== undefined) accessor.setter = descriptor.set;

      // set context
      context && accessor.setContext(this._zone, context);
      decorator && decorator.apply(accessor, [target, accessorName, descriptor]);
    };
  }

  public propertyDecorator<Context extends object = object>(
    context?: Partial<Context>,
    decorator?: (this: Property<Context>, ...args: Parameters<PropertyDecorator>) => void
  ): PropertyDecorator {
    return (target: Object, propertyName: string | symbol) => {
      const constructor: Function = target.constructor;
      const propertySet: Set<Property<Context>> =
        Reflect.getOwnMetadata(METADATA_KEY_PROPERTY_SET, constructor) || new Set();
      Reflect.defineMetadata(METADATA_KEY_PROPERTY_SET, propertySet, constructor);

      // adds to property set if not exists
      const property = findOne(propertySet, (property) => property.getName() === propertyName)
        || new Property(propertyName.toString());
      propertySet.add(property);

      // set context
      context && property.setContext(this._zone, context);
      decorator && decorator.apply(property, [target, propertyName]);
    };
  }

  public parameterDecorator<Context extends object = object>(
    context?: Partial<Context>,
    decorator?: (this: Parameter<Context>, ...args: Parameters<ParameterDecorator>) => void
  ): ParameterDecorator {
    return (target: Object, methodName: string | symbol, parameterIndex: number): void => {
      const constructor: Function = target.constructor;
      const parameterArray: Array<Parameter<Context>> =
        Reflect.getOwnMetadata(METADATA_KEY_PARAMETER_ARRAY, target.constructor, methodName) || [];
      Reflect.defineMetadata(METADATA_KEY_PARAMETER_ARRAY, parameterArray, constructor, methodName);

      const parameter: Parameter<Context> = parameterArray[parameterIndex] || new Parameter();
      parameterArray[parameterIndex] = parameter;

      // set context
      context && parameter.setContext(this._zone, context);
      decorator && decorator.apply(parameter, [target, methodName, parameterIndex]);
    };
  }
}

/**
 * Class collector.
 */
class ClassCollector {
  private _currentNamespace: string = '/';

  private _classCollection: { [namespace: string]: { [name: string]: Class<any> } } = {};

  /**
   * Set class by name.
   * @param name
   * @param _class
   */
  public setClass(name: string, _class: Class<any>) {
    if (!(this._currentNamespace in this._classCollection)) {
      this._classCollection[this._currentNamespace] = {};
    }
    this._classCollection[this._currentNamespace][name] = _class;
  }

  /**
   * Get a class by specified namespace and name;
   * @param path name of class (with default namespace); string likes <namespace:name>, or mere namespace if [name] is given.
   * @param name name of class of nothing
   */
  public getClass<Context extends object>(path: string, name?: string): Class<Context> | undefined {
    let namespace: string;
    if (!path.startsWith('/')) {
      [namespace, name] = ['/', path];
    } else {
      [namespace, name] = name === undefined ? path.split(':').map(e => e.trim()) : [path, name];
    }
    if (name === undefined || !this._classCollection[namespace]) return undefined;
    return this._classCollection[namespace][name];
  }

  /**
   * Scan a file.
   * @param filepath
   * @param namespace
   */
  public scan(filepath: fs.PathLike, namespace: string = '/'): void {
    this._currentNamespace = namespace;
    filepath = filepath.toString('utf-8');
    if (path.extname(filepath) !== '.js') filepath += '.js';
    require(filepath);
    this._currentNamespace = '/';
  }

  /**
   * Scan a directory iteratively.
   * @param dir_path directory path
   * @param namespace
   */
  public scanDir(dir_path: fs.PathLike, namespace: string = '/'): void {
    dir_path = dir_path.toString('utf-8');

    for (const file of fs.readdirSync(dir_path).filter(e => path.extname(e) == '.js')) {
      fs.lstatSync(path.join(dir_path, file)).isDirectory() ?
        this.scanDir(path.join(dir_path, file), `${namespace}/${file}`) :
        this.scan(path.join(dir_path, file), namespace);
    }
  }
}

/**
 * Singleton instance of ClassCollector.
 */
export const classCollector = new ClassCollector();