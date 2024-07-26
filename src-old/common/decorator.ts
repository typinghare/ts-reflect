import { DecoratorGenerator } from '../core/DecoratorGenerator'

/**
 * A general class decorator.
 * @constructor
 */
export function DecoratedClass(): ClassDecorator {
    return new DecoratorGenerator().generateClassDecorator()
}
