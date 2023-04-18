import { ReflectorWrapper } from '../core/ReflectorWrapper'
import { Class, Reflector } from '../core/Reflector'
import { Zone } from '../core/Zone'
import { Constructor } from '../type'
import { Dict } from '../core/Decorative'
import { ClassContainer } from '../main'

/**
 * Returns a reflector wrapper.
 * @param reflector
 * @param zone
 */
export function contextOf<Context extends Dict>(reflector: Reflector<Context>, zone: Zone): ReflectorWrapper<Context> {
    return new ReflectorWrapper<Context>(reflector, zone)
}

/**
 * Returns a class reflector by constructor.
 * @param constructor
 */
export function getClass<Context extends Dict>(constructor: Constructor): Class<Context> | undefined {
    return ClassContainer.INSTANCE.get<Context>(constructor)
}