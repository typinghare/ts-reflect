import 'reflect-metadata'

import {
    Accessor as ReflectAccessor,
    Class as ReflectClass,
    Method as ReflectMethod,
    Parameter as ReflectParameter,
    Property as ReflectProperty,
    Reflector as ReflectReflector,
} from './core/Reflector'

import { ClassContainer as ReflectClassContainer } from './core/ClassContainer'
import { DecoratorGenerator as ReflectDecoratorGenerator } from './core/DecoratorGenerator'
import { Zone as ReflectZone } from './core/Zone'
import { contextOf as ReflectContextOf, DecoratedClass as ReflectDecoratedClass } from './common'
import exp from 'constants'

export namespace Reflect {
    /**
     * Reflectors
     */
    export const Reflector = ReflectReflector
    export const Class = ReflectClass
    export const Method = ReflectMethod
    export const Accessor = ReflectAccessor
    export const Property = ReflectProperty
    export const Parameter = ReflectParameter

    /**
     * class container
     */
    export const ClassContainer = ReflectClassContainer

    /**
     * Decorator generator
     */
    export const DecoratorGenerator = ReflectDecoratorGenerator

    /**
     * Zone
     */
    export const Zone = ReflectZone

    /**
     * Common decorators
     */
    export const DecoratedClass = ReflectDecoratedClass

    /**
     * Helper functions
     */
    export const contextOf = ReflectContextOf
}
