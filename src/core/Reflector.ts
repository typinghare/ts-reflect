import { Decorative, Dict } from './Decorative'
import { Zone } from './Zone'
import _, { isEmpty, isObject, isUndefined } from 'lodash'
import { ClassContainer } from './ClassContainer'

/**
 * The name of.
 */
export type Name = string | symbol

export type ContextMap<Context> = Map<Zone, Context>
export type Constructor = new (...args: any[]) => object
export type Getter = () => any
export type Setter = (value: any) => void

/**
 * Reflector.
 * <C> context
 */
export abstract class Reflector<C extends Dict> implements Decorative<C> {
    /**
     * Whether this reflector is decorated
     * @protected
     */
    protected readonly _isDecorated: boolean = false
    /**
     * Context map.
     * @protected
     */
    protected readonly contextMap: ContextMap<Partial<C>> = new Map()
    /**
     * The name of this reflector.
     * @protected
     */
    private readonly _name: Name

    /**
     * Creates a new reflector.
     * @param name the name of this reflector.
     * @param isDecorated whether this reflector is decorated
     * @protected
     */
    protected constructor(name: Name, isDecorated: boolean = true) {
        this._name = name
        this._isDecorated = isDecorated
    }

    /**
     * Returns the name of this reflector.
     */
    public getName(): Name {
        return this._name
    }

    /**
     * Whether this reflector is decorated.
     */
    public isDecorated(): boolean {
        return this._isDecorated
    }

    /**
     * @override
     */
    getContext(zone: Zone): C | undefined
    /**
     * @override
     */
    getContext<K extends keyof C>(zone: Zone, key: K): C[K] | undefined
    /**
     * @override
     */
    getContext<K extends keyof C>(zone: Zone, key?: K): any {
        const context: Partial<C> | undefined = this.contextMap.get(zone)

        return isUndefined(key) ? context : context && context[key]
    }

    /**
     * @override
     */
    setContext(zone: Zone, context: Partial<C>): void
    /**
     * @override
     */
    setContext<K extends keyof C>(zone: Zone, key: K, value: C[K]): void
    /**
     * @override
     */
    setContext<K extends keyof C>(zone: Zone, context: Partial<C> | K, value?: C[K]): void {
        const curContext = this.contextMap.get(zone)
        if (isObject(context)) {
            if (isUndefined(curContext)) {
                this.contextMap.set(zone, Object.create(context))
            } else {
                Object.assign(curContext, context)
            }
        } else if (!isUndefined(value)) {
            if (isUndefined(curContext)) {
                const newContext = {} as Partial<C>
                this.contextMap.set(zone, newContext)
                newContext[context as K] = value
            } else {
                curContext[context as K] = value
            }
        }
    }
}

/**
 * Class reflector.
 */
export class Class<C extends Dict = Dict> extends Reflector<C> {
    /**
     * The constructor of this class.
     * @private
     */
    private readonly _constructor: Constructor

    /**
     * A map of methods in this class.
     * @private
     */
    private readonly _methodMap: Map<Name, Method>

    /**
     * A map of accessors in this class.
     * @private
     */
    private readonly _accessorMap: Map<Name, Accessor>

    /**
     * A map of properties in this class.
     * @private
     */
    private readonly _propertyMap: Map<Name, Property>

    /**
     * Creates a class reflector.
     * @param constructor
     * @param methodMap
     * @param accessorMap
     * @param propertyMap
     */
    public constructor(
        constructor: Constructor,
        methodMap: Map<Name, Method>,
        accessorMap: Map<Name, Accessor>,
        propertyMap: Map<Name, Property>
    ) {
        super(constructor.name, true)
        this._constructor = constructor

        this._methodMap = methodMap
        this._accessorMap = accessorMap
        this._propertyMap = propertyMap
    }

    /**
     * Return the constructor of this class.
     */
    public getConstructor(): Constructor {
        return this._constructor
    }

    /**
     * Returns the class reflector of the parent of this class.
     * <PC> parent class context
     */
    public getParent<PCC extends Dict = Dict>(): Class<PCC> | null {
        const constructorPrototype = Object.getPrototypeOf(this._constructor)
        if (isEmpty(constructorPrototype.name)) {
            return null
        }

        return ClassContainer.INSTANCE.get<PCC>(constructorPrototype) || null;
    }

    /**
     * Returns method reflector map.
     */
    public getMethodMap<MC extends Dict>(): Map<Name, Method<MC>> {
        return this._methodMap as Map<Name, Method<MC>>
    }

    /**
     * Returns accessor reflector map.
     */
    public getAccessorMap<AC extends Dict>(): Map<Name, Accessor<AC>> {
        return this._accessorMap as Map<Name, Accessor<AC>>
    }

    /**
     * Returns property reflector map.
     */
    public getPropertyMap<PC extends Dict>(): Map<Name, Property<PC>> {
        return this._propertyMap as Map<Name, Property<PC>>
    }

    /**
     * Returns a method reflector by the specified name.
     * @param name
     */
    public getMethod<MC extends Dict>(name: Name): Method<MC> {
        return this._methodMap.get(name) as Method<MC>
    }

    /**
     * Returns an accessor reflector by the specified name.
     * @param name
     */
    public getAccessor<AC extends Dict>(name: Name): Accessor<AC> {
        return this._accessorMap.get(name) as Accessor<AC>
    }

    /**
     * Returns a property reflector by the specified name.
     * @param name
     */
    public getProperty<PC extends Dict>(name: Name): Property<PC> {
        return this._propertyMap.get(name) as Property<PC>
    }
}

/**
 * Method reflector.
 */
export class Method<C extends Dict = Dict> extends Reflector<C> {
    /**
     * Function.
     * @private
     */
    private readonly _function: Function

    /**
     * The parameter reflector array.
     * @private
     */
    private readonly _parameterArray: Parameter[] = []

    /**
     * Creates a method reflector.
     * @param name
     * @param isDecorated
     * @param _function
     * @param parameterArray
     */
    constructor(
        name: Name,
        isDecorated: boolean,
        _function: Function,
        parameterArray: Parameter[]
    ) {
        super(name, isDecorated)
        this._function = _function
        this._parameterArray = parameterArray
    }

    /**
     * Returns the function of this method.
     */
    public getFunction(): Function {
        return this._function
    }

    /**
     * Returns parameter reflector array.
     * <PC> parameter context
     */
    public getParameterArray<PC extends Dict = Dict>(): Parameter<PC>[] {
        return this._parameterArray as Parameter<PC>[]
    }

    /**
     * Return a parameter reflector at a specified index.
     * @param index
     */
    public getParameter<PC extends Dict = Dict>(index: number): Parameter<PC> {
        return this._parameterArray[index] as Parameter<PC>
    }

    /**
     * Returns a parameter by the specified name.
     * @param name
     */
    public getParameterByName<PC extends Dict = Dict>(
        name: string
    ): Parameter<PC> | undefined {
        return _.find(
            this._parameterArray as Parameter<PC>[],
            (parameter) => parameter.getName() === name
        )
    }
}

/**
 * Accessor reflector.
 */
export class Accessor<C extends Dict = Dict> extends Reflector<C> {
    /**
     * Getter.
     * @private
     */
    private readonly _getter: Getter | undefined

    /**
     * Setter.
     * @private
     */
    private readonly _setter: Setter | undefined

    /**
     * Creates an accessor reflector.
     * @param name
     * @param isDecorated
     * @param getter
     * @param setter
     */
    public constructor(
        name: Name,
        isDecorated: boolean,
        getter: Getter | undefined,
        setter: Setter | undefined
    ) {
        super(name, isDecorated)
        this._getter = getter
        this._setter = setter
    }

    /**
     * Returns the getter.
     */
    public getGetter(): Getter | undefined {
        return this._getter
    }

    /**
     * Returns the setter.
     */
    public getSetter(): Setter | undefined {
        return this._setter
    }
}

/**
 * Property reflector.
 */
export class Property<C extends Dict = Dict> extends Reflector<C> {
    public constructor(name: Name, isDecorated: boolean) {
        super(name, isDecorated)
    }
}

/**
 * Parameter reflector.
 */
export class Parameter<C extends Dict = Dict> extends Reflector<C> {
    public constructor(name: Name, isDecorated: boolean) {
        super(name, isDecorated)
    }
}
