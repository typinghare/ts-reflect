import { Class, Constructor } from './Reflector'
import { GenericObject } from './Decorative'

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
     * @param _class
     */
    public register(_class: Class) {
        this._classMap.set(_class.getConstructor(), _class)
    }

    /**
     * Returns a class reflector corresponding to the given constructor.
     * @param constructor
     */
    public get<CC extends GenericObject = GenericObject>(
        constructor: Constructor
    ): Class<CC> | undefined {
        return this._classMap.get(constructor) as Class<CC>
    }
}
