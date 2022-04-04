/// <reference types="node" />
import 'reflect-metadata';
import fs from 'fs';
/**
 * General type of constructor function.
 */
export declare type Constructor<Class = object> = (new (...args: any[]) => Class) | Function;
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
export declare class AbstractReflector<Context extends object> implements Decorative<Context> {
    /**
     * The name of the reflected object.
     * @protected
     */
    protected name: string;
    /**
     * Decorative context map.
     * @protected
     */
    protected readonly _decorativeContextMap: Map<symbol, Context>;
    /**
     * Constructor.
     * @param name
     */
    constructor(name: string);
    getContext(zone: symbol): Context | undefined;
    getContext<K extends keyof Context>(zone: symbol, key: K): Context[K] | undefined;
    setContext(zone: symbol, context: Partial<Context>): void;
    setContext<K extends keyof Context>(zone: symbol, key: K, value: Context[K]): void;
    /**
     * Set the name of the reflected object.
     * @param name
     * @protected
     */
    protected setName(name: string): void;
    /**
     * Get the name of the reflected object.
     */
    getName(): string;
}
export declare class Class<Context extends object = object> extends AbstractReflector<Context> {
    private readonly _constructor;
    decoratedMethodSet: Set<Method<any>>;
    decoratedAccessorSet: Set<Accessor<any>>;
    decoratedPropertySet: Set<Property<any>>;
    constructor(name: string, _constructor: Constructor);
    getConstructor(): Constructor;
    getMethod<MethodContext extends object = object>(name: string): Method<MethodContext> | null;
    getAccessor<AccessorContext extends object = object>(name: string): Accessor<AccessorContext> | null;
    getProperty<PropertyContext extends object = object>(name: string): Property<PropertyContext> | null;
}
export declare class Method<Context extends object = object> extends AbstractReflector<Context> {
    private readonly _value;
    decoratedParameterArray: Array<Parameter<any>>;
    constructor(name: string, value: Function);
    getValue(): Function;
    getParameterByName<ParameterContext extends object = object>(name: string): Parameter<ParameterContext> | undefined;
    getParameterByIndex<ParameterContext extends object = object>(index: number): Parameter<ParameterContext> | undefined;
}
export declare class Accessor<Context extends object = object> extends AbstractReflector<Context> {
    getter: Function | undefined;
    setter: Function | undefined;
}
export declare class Property<Context extends object = object> extends AbstractReflector<Context> {
}
export declare class Parameter<Context extends object = object> extends AbstractReflector<Context> {
    constructor();
    setName(name: string): void;
}
/**
 * Decorator generator.
 */
export declare class DecoratorGenerator {
    private readonly _zone;
    constructor(zone: symbol);
    classDecorator<Context extends object = object>(context?: Partial<Context>, decorator?: (this: Class<Context>, ...args: Parameters<ClassDecorator>) => void): ClassDecorator;
    methodDecorator<Context extends object = object>(context?: Partial<Context>, decorator?: (this: Method<Context>, ...args: Parameters<MethodDecorator>) => void): MethodDecorator;
    accessorDecorator<Context extends object = object>(context?: Partial<Context>, decorator?: (this: Accessor<Context>, ...args: Parameters<MethodDecorator>) => void): MethodDecorator;
    propertyDecorator<Context extends object = object>(context?: Partial<Context>, decorator?: (this: Property<Context>, ...args: Parameters<PropertyDecorator>) => void): PropertyDecorator;
    parameterDecorator<Context extends object = object>(context?: Partial<Context>, decorator?: (this: Parameter<Context>, ...args: Parameters<ParameterDecorator>) => void): ParameterDecorator;
}
/**
 * Class collector.
 */
declare class ClassCollector {
    private _currentNamespace;
    private _classCollection;
    /**
     * Set class by name.
     * @param name
     * @param _class
     */
    setClass(name: string, _class: Class<any>): void;
    /**
     * Get a class by specified namespace and name;
     * @param path name of class (with default namespace); string likes <namespace:name>, or mere namespace if [name] is given.
     * @param name name of class of nothing
     */
    getClass<Context extends object>(path: string, name?: string): Class<Context> | undefined;
    /**
     * Scan a file.
     * @param filepath
     * @param namespace
     */
    scan(filepath: fs.PathLike, namespace?: string): void;
    /**
     * Scan a directory iteratively.
     * @param dir_path directory path
     * @param namespace
     */
    scanDir(dir_path: fs.PathLike, namespace?: string): void;
}
/**
 * Singleton instance of ClassCollector.
 */
export declare const classCollector: ClassCollector;
export {};
