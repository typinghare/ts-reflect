import { Zone } from './core/Zone'

/**
 * The type of properties.
 */
export type Name = string | symbol

export type ContextMap<Context> = Map<Zone, Context>
export type Constructor = new (...args: any[]) => object
export type Getter = () => any
export type Setter = (value: any) => void