import {
  METADATA_KEY_ACCESSOR_SET,
  METADATA_KEY_CLASS,
  METADATA_KEY_IS_CLASS_RENDERED,
  METADATA_KEY_METHOD_SET,
  METADATA_KEY_PARAMETER_ARRAY,
  METADATA_KEY_PROPERTY_SET
} from './constant';
import getParameterNames from '@captemulation/get-parameter-names';
import { findOne, getMethodSet } from './misc';
import { Accessor, Class, defaultZone, Method, Parameter, Property, Zone } from './reflector';
import { classContainer } from './container';

/**
 * Decorator generator.
 */
export class DecoratorGenerator {
  /**
   * Specified zone.
   * @private
   */
  private readonly _zone: Zone;

  /**
   * Constructor.
   * @param zone
   */
  constructor(zone?: Zone) {
    this._zone = zone || defaultZone;
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
        Reflect.getOwnMetadata(METADATA_KEY_CLASS, constructor) || new Class(constructor);
      Reflect.defineMetadata(METADATA_KEY_CLASS, _class, constructor);

      // register to class collection
      classContainer.register(_class);

      // render class
      const isClassRendered = Reflect.getOwnMetadata(METADATA_KEY_IS_CLASS_RENDERED, constructor);
      if (!isClassRendered) {
        Reflect.defineMetadata(METADATA_KEY_IS_CLASS_RENDERED, true, constructor);

        // load methods (if it hasn't been done)
        const methodCollector = _class.getMethodCollector();
        const decoratedMethodSet: Set<Method> | undefined = Reflect.getMetadata(METADATA_KEY_METHOD_SET, constructor);
        const methodSet: Set<Function> = getMethodSet(constructor);

        for (const method of methodSet) {
          let decoratedMethod = null;
          if (decoratedMethodSet) {
            decoratedMethod = findOne(decoratedMethodSet, (decoratedMethod) =>
              decoratedMethod.getName() === method.name);
          }
          decoratedMethod = decoratedMethod || new Method(method);
          methodCollector.add(decoratedMethod);

          // set parameters
          const parameterArray = decoratedMethod.getParameterArray();
          const decoratedParameterArray: Array<Parameter | null>
            = Reflect.getOwnMetadata(METADATA_KEY_PARAMETER_ARRAY, constructor, decoratedMethod.getName());

          const parameterNames = getParameterNames(decoratedMethod.getValue());
          parameterNames.forEach((name, index) => {
            const _parameter = decoratedParameterArray ?
              decoratedParameterArray[index] || new Parameter() :
              new Parameter();
            parameterArray.push(_parameter);
            _parameter.setName(name);
          });
        }

        // load accessors (if it hasn't been done)
        const accessorCollector = _class.getAccessorCollector();
        const decoratedAccessorSet: Set<Accessor> | undefined = Reflect.getMetadata(METADATA_KEY_ACCESSOR_SET, constructor);
        if (decoratedAccessorSet) {
          for (const decoratedAccessor of decoratedAccessorSet) {
            accessorCollector.add(decoratedAccessor);
          }
        }

        // load properties (if it hasn't been done)
        const propertyCollector = _class.getPropertyCollector();
        const decoratedPropertySet: Set<Property> | undefined = Reflect.getMetadata(METADATA_KEY_PROPERTY_SET, constructor);
        if (decoratedPropertySet) {
          for (const decoratedProperty of decoratedPropertySet) {
            propertyCollector.add(decoratedProperty);
          }
        }
      }

      // set context
      context && _class.setContext(context, this._zone);
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
        || new Method<Context>(descriptor.value);
      methodSet.add(method);
      method.decorated();

      // set context
      context && method.setContext(context, this._zone);
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
      accessor.decorated();

      if (descriptor.get !== undefined) accessor.getter = descriptor.get;
      if (descriptor.set !== undefined) accessor.setter = descriptor.set;

      // set context
      context && accessor.setContext(context, this._zone);
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
      property.decorated();

      // set context
      context && property.setContext(context, this._zone);
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
      parameter.decorated();

      // set context
      context && parameter.setContext(context, this._zone);
      decorator && decorator.apply(parameter, [target, methodName, parameterIndex]);
    };
  }
}
