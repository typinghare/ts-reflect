import { Dict } from './Decorative'
import { Reflector } from './Reflector'
import { Zone } from './Zone'

/**
 * Reflector Wrapper.
 * @author James Chan
 */
export class ReflectorWrapper<Context extends Dict = Dict> {
    /**
     * Reflector wrapped.
     * @private
     */
    private readonly _reflector: Reflector<Context>

    /**
     * The zone bound to this reflector wrapper.
     * @private
     */
    private readonly _zone: Zone

    /**
     * Creates a reflector wrapper.
     * @param reflector reflector to wrap
     * @param zone the zone bound to this reflector wrapper.
     */
    public constructor(reflector: Reflector<Context>, zone: Zone) {
        this._reflector = reflector
        this._zone = zone
    }

    /**
     * Returns the context of the reflector.
     */
    public context(): Context | undefined {
        return this._reflector.getContext(this._zone)
    }

    /**
     * Returns the value of the specified key.
     * @param key
     */
    public get<K extends keyof Context>(key: K): Context[K] | undefined {
        return this._reflector.getContext<K>(this._zone, key)
    }

    /**
     * Sets a value of the specified key.
     * @param key
     * @param value
     */
    public set<K extends keyof Context>(key: K, value: Context[K]): void {
        return this._reflector.setContext<K>(this._zone, key, value)
    }

    /**
     * Returns context.
     */
    public getContext(): Context {
        return this._reflector.getContext(this._zone) || ({} as Context)
    }
}
