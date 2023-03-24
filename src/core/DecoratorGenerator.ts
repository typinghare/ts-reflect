import { Zone } from './Zone'
import { Accessor, Class, Constructor, Method, Name, Parameter, Property } from './Reflector'
import { Dict } from './Decorative'
import { ReflectorWrapper } from './ReflectorWrapper'
import { defaultTo, find, isNull, isUndefined } from 'lodash'
import {
    METADATA_KEY_ACCESSOR_ARRAY,
    METADATA_KEY_CLASS_IS_RENDERED,
    METADATA_KEY_METHOD_ARRAY,
    METADATA_KEY_PARAMETER_ARRAY,
    METADATA_KEY_PROPERTY_ARRAY,
} from '../constant'
import getParameterNames from '@captemulation/get-parameter-names'
import { ClassContainer } from './ClassContainer'
import assert from 'assert'

/**
 * Builtin decorator.
 */
type BuiltinDecorator = ClassDecorator | PropertyDecorator | MethodDecorator | ParameterDecorator

/**
 * A decorator.
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
            const isRendered = Reflect.getOwnMetadata(METADATA_KEY_CLASS_IS_RENDERED, constructor)
            if (!isRendered) {
                Reflect.defineMetadata(METADATA_KEY_CLASS_IS_RENDERED, true, constructor)
                const methodMap = this.loadMethods(constructor as Constructor)
                const accessorMap = this.loadAccessors(constructor as Constructor)
                const propertyMap = this.loadProperties(constructor as Constructor)

                ClassContainer.INSTANCE.register(
                    new Class(constructor as Constructor, methodMap, accessorMap, propertyMap)
                )
            }

            const _class: Class<Context> | undefined = ClassContainer.INSTANCE.get(
                constructor as Constructor
            )
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
            const method = this.defaultToCall(
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

            const accessor = this.defaultToCall(
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

            const property: Property<Context> = this.defaultToCall(
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
     * Loads methods for the given class and returns the method map.
     * @param constructor
     * @private
     */
    private loadMethods(constructor: Constructor): Map<Name, Method> {
        // collect all methods
        const methodSet: Set<Function> = new Set()
        const descriptors = Object.getOwnPropertyDescriptors(constructor.prototype)
        for (const descriptor of Object.values(descriptors)) {
            if (!isUndefined(descriptor) && descriptor.value !== constructor) methodSet.add(descriptor.value)
        }

        const methodMap: Map<Name, Method> = new Map()
        const methodArray: Method[] = Reflect.getOwnMetadata(METADATA_KEY_METHOD_ARRAY, constructor)
        for (const method of methodSet) {
            const methodReflector = defaultTo(
                find(methodArray, (_method) => _method.getName() === method.name),
                new Method(method.name, false, method, [])
            )

            methodMap.set(method.name, methodReflector)
        }

        return methodMap
    }

    /**
     * Loads accessors for the given class and returns the accessor map.
     * @param constructor
     * @private
     */
    private loadAccessors(constructor: Constructor): Map<Name, Accessor> {
        // collect all accessors
        const descriptorMap: Map<Name, TypedPropertyDescriptor<any>> = new Map()
        const descriptors = Object.getOwnPropertyDescriptors(constructor.prototype)
        for (const [name, descriptor] of Object.entries(descriptors)) {
            if (isUndefined(descriptor.value)) descriptorMap.set(name, descriptor)
        }

        const accessorMap: Map<Name, Accessor> = new Map()
        const accessorArray: Accessor[] | undefined = Reflect.getOwnMetadata(METADATA_KEY_ACCESSOR_ARRAY, constructor)
        for (const [name, descriptor] of Object.entries(descriptorMap)) {
            const accessorReflector = this.defaultToCall(
                find(accessorArray, (accessor) => accessor.getName() === name),
                () => {
                    return new Accessor(name, false, descriptor.getter, descriptor.setter)
                }
            )
            accessorMap.set(name, accessorReflector)
        }

        return accessorMap
    }

    /**
     * Loads properties for the given class.
     * @param constructor
     * @private
     */
    private loadProperties(constructor: Constructor): Map<Name, Property> {
        const propertyMap: Map<Name, Property> = new Map()
        const propertyArray: Property[] | undefined = Reflect.getOwnMetadata(METADATA_KEY_PROPERTY_ARRAY, constructor)
        if (!isUndefined(propertyArray)) {
            for (const property of propertyArray) {
                propertyMap.set(property.getName(), property)
            }
        }

        return propertyMap
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

    /**
     * Default or call.
     * @param value
     * @param callback
     * @private
     */
    private defaultToCall<T>(value: T | undefined | null, callback: () => T): T {
        if (!isUndefined(value) && !isNull(value)) {
            return value
        }

        return callback()
    }
}
