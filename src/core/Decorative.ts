import { Zone } from './Zone'

/**
 * Dictionary-like.
 */
export type Dict = {
    [key: string | symbol | number]: any
}

/**
 * Decorative interface
 * @author James Chan
 */
export interface Decorative<Context extends Dict> {
    /**
     * Returns the decorative context.
     * @param zone a specified zone
     */
    getContext(zone: Zone): Context | undefined

    /**
     * Returns the value of a specified key from the context.
     * @param zone a specified zone
     * @param key a specified key
     */
    getContext<K extends keyof Context>(zone: Zone, key: K): Context[K] | undefined

    /**
     * Sets the decorative context.
     * @param zone a specified zone
     * @param context the decorative context to be set
     */
    setContext(zone: Zone, context: Partial<Context>): void

    /**
     * Sets the value of a specified key.
     * @param zone a specified zone
     * @param key a specified key
     * @param value the value to set
     */
    setContext<K extends keyof Context>(zone: Zone, key: K, value: Context[K]): void
}
