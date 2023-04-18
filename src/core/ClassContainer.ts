import { Class } from './Reflector'
import { Dict } from './Decorative'
import { Constructor } from '../type'
import { Integrator } from './Integrator'
import { defaultTo } from 'lodash'

/**
 * Class container.
 */
export class ClassContainer {
    /**
     * Unique instance.
     * @private
     */
    private static readonly _INSTANCE: ClassContainer = new ClassContainer()

    /**
     * Class map.
     * @private
     */
    private readonly _classMap: Map<Constructor, Class> = new Map()

    /**
     * Private constructor.
     * @private
     */
    private constructor() {}

    /**
     * Returns the instance of the singleton class container.
     * @constructor
     */
    public static get INSTANCE(): ClassContainer {
        return ClassContainer._INSTANCE
    }

    /**
     * Registers a class.
     * @param _class class to register.
     */
    public register(_class: Class) {
        this._classMap.set(_class.getConstructor(), _class)
    }

    /**
     * Returns a class reflector corresponding to the given constructor.
     * @param constructor
     */
    public get<ClassContext extends Dict = Dict>(constructor: Constructor): Class<ClassContext> | undefined {
        return defaultTo(
            this._classMap.get(constructor) as Class<ClassContext>,
            Integrator.INSTANCE.integrate(constructor) as Class<ClassContext>
        )
    }
}
