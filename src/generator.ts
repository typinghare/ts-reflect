import {
  METADATA_KEY_ACCESSOR_SET,
  METADATA_KEY_CLASS,
  METADATA_KEY_METHOD_SET,
  METADATA_KEY_PARAMETER_ARRAY,
  METADATA_KEY_PROPERTY_SET
} from './constant';
import getParameterNames from '@captemulation/get-parameter-names';
import { findOne } from './misc';
import { Accessor, Class, Method, Parameter, Property } from './reflector';
import { control } from './control';

/**
 * Scanner config.
 */
export interface ScannerConfig {
  rootPath: string;
}

/**
 * Decorator generator.
 */
export class DecoratorGenerator {
  /**
   * Specified zone.
   * @private
   */
  private readonly _zone: symbol;

  /**
   * Constructor.
   * @param zone
   */
  constructor(zone: symbol) {
    this._zone = zone;
  }

  /**
   * Generate a class decorator.
   * @param context
   * @param decorator
   */
  public classDecorator<Context extends object = object>(
    context?: Partial<Context>,
    decorator?: (this: Class<Context>, ...args: Parameters<ClassDecorator>) => void
  ): ClassDecorator {
    return (constructor: Function): void => {
      const _class: Class<Context> =
        Reflect.getOwnMetadata(METADATA_KEY_CLASS, constructor) || new Class(constructor.name, constructor);
      Reflect.defineMetadata(METADATA_KEY_CLASS, _class, constructor);

      // register to class collection
      const scanner = control.scanner;
      scanner && scanner.classCollector.register(_class);

      // load methods (if it hasn't been done)
      if (_class.decoratedMethodSet === undefined) {
        _class.decoratedMethodSet = Reflect.getMetadata(METADATA_KEY_METHOD_SET, constructor) || new Set<Method>();
        _class.decoratedMethodSet && _class.decoratedMethodSet.forEach(decoratedMethod => {
          decoratedMethod.decoratedParameterArray =
            Reflect.getOwnMetadata(METADATA_KEY_PARAMETER_ARRAY, constructor, decoratedMethod.getName()) || [];
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
          Reflect.getMetadata(METADATA_KEY_ACCESSOR_SET, constructor) || new Set<Accessor>();
      }

      // load properties (if it hasn't been done)
      if (_class.decoratedPropertySet === undefined) {
        _class.decoratedPropertySet =
          Reflect.getMetadata(METADATA_KEY_PROPERTY_SET, constructor) || new Set<Property>();
      }

      // set context
      const _context = _class.getContext(this._zone) || {};
      Object.assign(_context, context);
      _class.setContext(this._zone, _context);
      decorator && decorator.apply(_class, [constructor]);
    };
  }

  /**
   * Generate a method decorator.
   * @param context
   * @param decorator
   */
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

  /**
   * Generate a accessor decorator.
   * @param context
   * @param decorator
   */
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

  /**
   * Generate a property decorator.
   * @param context
   * @param decorator
   */
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

  /**
   * Generate a parameter decorator.
   * @param context
   * @param decorator
   */
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
 * Get a decorator generator of a specified zone.
 * @param zone
 */
export function zone(zone: symbol): DecoratorGenerator {
  return new DecoratorGenerator(zone);
}

