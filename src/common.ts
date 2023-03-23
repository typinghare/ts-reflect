import { DecoratorGenerator } from './core/DecoratorGenerator'
import { GenericObject } from './core/Decorative'
import { Reflector } from './core/Reflector'
import { Zone } from './core/Zone'
import { ReflectorWrapper } from './core/ReflectorWrapper'

/**
 * A general class decorator.
 * @constructor
 */
export function DecoratedClass(): ClassDecorator {
    return new DecoratorGenerator().generateClassDecorator()
}

/**
 * Returns a reflector wrapper.
 * @param reflector
 * @param zone
 */
export function contextOf<Context extends GenericObject>(
    reflector: Reflector<Context>,
    zone: Zone
): ReflectorWrapper<Context> {
    return new ReflectorWrapper<Context>(reflector, zone)
}
