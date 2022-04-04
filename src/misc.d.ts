/**
 * Find an element in an iterable object.
 * @param iterable
 * @param predicate
 */
export declare function findOne<T>(iterable: Iterable<T>, predicate: (element: T) => boolean): T | null;
