import { Constructor, Name } from '../type'
import {
    METADATA_KEY_ACCESSOR_ARRAY,
    METADATA_KEY_CLASS_IS_RENDERED,
    METADATA_KEY_METHOD_ARRAY,
    METADATA_KEY_PROPERTY_ARRAY,
} from '../common/constant'
import { ClassContainer } from './ClassContainer'
import { Accessor, Class, Method, Property } from './Reflector'
import { defaultTo, find, isUndefined } from 'lodash'
import { defaultToCall } from '../common/misc'

export class Integrator {
    /**
     * Unique instance.
     * @private
     */
    private static readonly _INSTANCE: Integrator = new Integrator()

    /**
     * Private constructor.
     * @private
     */
    private constructor() {}

    /**
     * Returns the instance of the singleton integrator.
     * @constructor
     */
    public static get INSTANCE(): Integrator {
        return Integrator._INSTANCE
    }

    /**
     * Integrate a class.
     * @param constructor
     */
    public integrate(constructor: Constructor): Class | undefined {
        const isRendered = Reflect.getOwnMetadata(METADATA_KEY_CLASS_IS_RENDERED, constructor)
        if (!isRendered) {
            Reflect.defineMetadata(METADATA_KEY_CLASS_IS_RENDERED, true, constructor)
            const methodMap = this.loadMethods(constructor as Constructor)
            const accessorMap = this.loadAccessors(constructor as Constructor)
            const propertyMap = this.loadProperties(constructor as Constructor)

            const classReflect = new Class(constructor as Constructor, methodMap, accessorMap, propertyMap)
            ClassContainer.INSTANCE.register(classReflect)
            return classReflect
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
            const accessorReflector = defaultToCall(
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
}
