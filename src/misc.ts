/**
 * Find an element in an iterable object.
 * @param iterable
 * @param predicate
 */
export function findOne<T>(iterable: Iterable<T>, predicate: (element: T) => boolean): T | null {
  for (const element of iterable) {
    if (predicate(element)) return element;
  }

  return null;
}