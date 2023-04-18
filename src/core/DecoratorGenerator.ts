import { Zone } from './Zone'
import { Accessor, Class, Method, Parameter, Property } from './Reflector'
import { Dict } from './Decorative'
import { ReflectorWrapper } from './ReflectorWrapper'
import { defaultTo, find, isUndefined } from 'lodash'
import {
    METADATA_KEY_ACCESSOR_ARRAY,
    METADATA_KEY_METHOD_ARRAY,
    METADATA_KEY_PARAMETER_ARRAY,
    METADATA_KEY_PROPERTY_ARRAY,
} from '../common/constant'
import getParameterNames from '@captemulation/get-parameter-names'
import { ClassContainer } from './ClassContainer'
import assert from 'assert'
import { Constructor, Name } from '../type'
import { Integrator } from './Integrator'
import { defaultToCall } from '../common/misc'

/**
 * Builtin decorator.
 */
type BuiltinDecorator = ClassDecorator | PropertyDecorator | MethodDecorator | ParameterDecorator

/**
 * A counterfeit decorator.
 */
export type Decorator<Context extends Dict, DecoratorType extends BuiltinDecorator> = (
    this: ReflectorWrapper<Context>,
    ...args: Parameters<DecoratorType>
) => void

/**
 * Decorator generator.
 */
export class DecoratorGenerator {
    /**
     * The zone bound to this decorator generator.
     * @private
     */
    private readonly _zone: Zone

    /**
     * Creates a new decorator generator.
     * @param zone
     */
    public constructor(zone: Zone = Zone.DEFAULT) {
        this._zone = zone
    }

    /**
     * Generates a class decorator.
     * @param context
     * @param decorator
     */
    public generateClassDecorator<Context extends Dict>(
        context?: Partial<Context>,
        decorator?: Decorator<Context, ClassDecorator>
    ): ClassDecorator {
        return (constructor: Function): void => {
            Integrator.INSTANCE.integrate(constructor as Constructor)

            const _class: Class<Context> | undefined = ClassContainer.INSTANCE.get(constructor as Constructor)
            assert(!isUndefined(_class), 'Unexpected Error: Class not exists.')

            !isUndefined(context) && _class.setContext(this._zone, context)
            !isUndefined(decorator) && decorator.apply(new ReflectorWrapper(_class, this._zone), [constructor])
        }
    }

    /**
     * Generates a method decorator.
     * @param context
     * @param decorator
     */
    public generateMethodDecorator<Context extends Dict>(
        context?: Partial<Context>,
        decorator?: Decorator<Context, MethodDecorator>
    ): MethodDecorator {
        return (target: Object, name: Name, descriptor: PropertyDescriptor): void => {
            const methodArray: Method<Context>[] = this.getOrSetMetadata(
                METADATA_KEY_METHOD_ARRAY,
                target.constructor,
                [] as Method<Context>[]
            )

            const func = descriptor.value
            const method = defaultToCall(
                find(methodArray, (method) => method.getName() === name),
                () => {
                    const parameterNames: string[] = getParameterNames(func)
                    const parameters: Parameter[] | undefined = []
                    const parameterArray: (Parameter | undefined)[] = defaultTo(
                        Reflect.getOwnMetadata(METADATA_KEY_PARAMETER_ARRAY, target.constructor, name),
                        undefined
                    )

                    for (let i = 0; i < parameterNames.length; i++) {
                        const tempParameter = parameterArray && parameterArray[i]
                        if (!isUndefined(tempParameter)) {
                            const parameter = new Parameter(parameterNames[i], true)
                            const context = tempParameter.getContext(this._zone)
                            if (!isUndefined(context)) {
                                parameter.setContext(this._zone, context)
                            }

                            parameters.push(parameter)
                        } else {
                            const parameter = new Parameter(parameterNames[i], false)
                            parameters.push(parameter)
                        }
                    }

                    const newMethod = new Method<Context>(name, true, func, parameters)
                    methodArray.push(newMethod)

                    return newMethod
                }
            )

            !isUndefined(context) && method.setContext(this._zone, context)
            !isUndefined(decorator) &&
                decorator.apply(new ReflectorWrapper(method, this._zone), [target, name, descriptor])
        }
    }

    public generateAccessorDecorator<Context extends Dict>(
        context?: Partial<Context>,
        decorator?: Decorator<Context, MethodDecorator>
    ): MethodDecorator {
        return (target: Object, name: Name, descriptor: PropertyDescriptor): void => {
            const accessorArray: Accessor<Context>[] = this.getOrSetMetadata(
                METADATA_KEY_ACCESSOR_ARRAY,
                target.constructor,
                [] as Accessor<Context>[]
            )

            const accessor = defaultToCall(
                find(accessorArray, (accessor) => accessor.getName() === name),
                () => {
                    const newAccessor = new Accessor<Context>(name, true, descriptor.get, descriptor.set)
                    accessorArray.push(newAccessor)

                    return newAccessor
                }
            )

            !isUndefined(context) && accessor.setContext(this._zone, context)
            !isUndefined(decorator) &&
                decorator.apply(new ReflectorWrapper(accessor, this._zone), [target, name, descriptor])
        }
    }

    /**
     * Generates a property decorator.
     * @param context
     * @param decorator
     */
    public generatePropertyDecorator<Context extends Dict>(
        context?: Partial<Context>,
        decorator?: Decorator<Context, PropertyDecorator>
    ): PropertyDecorator {
        return (target: Object, name: Name): void => {
            const propertyList: Property<Context>[] = this.getOrSetMetadata(
                METADATA_KEY_PROPERTY_ARRAY,
                target.constructor,
                []
            )

            const property: Property<Context> = defaultToCall(
                find(propertyList, (property) => property.getName() === name),
                () => {
                    const newProperty = new Property<Context>(name, true)
                    propertyList.push(newProperty)

                    return newProperty
                }
            )

            !isUndefined(context) && property.setContext(this._zone, context)
            !isUndefined(decorator) && decorator.apply(new ReflectorWrapper(property, this._zone), [target, name])
        }
    }

    /**
     * Generates a parameter decorator.
     * @param context
     * @param decorator
     */
    public generateParameterDecorator<Context extends Dict>(
        context?: Partial<Context>,
        decorator?: Decorator<Context, ParameterDecorator>
    ): ParameterDecorator {
        return (target: Object, methodName: Name, parameterIndex: number): void => {
            const parameterArray: Parameter<Context>[] = this.getOrSetMetadata(
                METADATA_KEY_PARAMETER_ARRAY,
                target.constructor,
                [] as Parameter<Context>[]
            )

            const parameter = parameterArray[parameterIndex] || new Parameter<Context>('', true)
            parameterArray[parameterIndex] = parameter

            !isUndefined(context) && parameter.setContext(this._zone, context)
            !isUndefined(decorator) &&
                decorator.apply(new ReflectorWrapper(parameter, this._zone), [target, methodName, parameterIndex])
        }
    }

    /**
     * Returns a metadata by key; sets if it doesn't exist.
     * @param metadataKey
     * @param targetObject
     * @param defaultValue
     * @private
     */
    private getOrSetMetadata<T>(metadataKey: any, targetObject: Object, defaultValue: T): T {
        const value = Reflect.getOwnMetadata(metadataKey, targetObject) as T | undefined
        if (isUndefined(value)) {
            Reflect.defineMetadata(metadataKey, defaultValue, targetObject)
            return defaultValue
        } else {
            return value
        }
    }
}
