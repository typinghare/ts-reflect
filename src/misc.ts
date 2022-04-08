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

/**
 * Get all methods of a specified class, then groups them into a set.
 * @param _class
 */
export function getMethodSet(_class: Function): Set<Function> {
  const set: Set<Function> = new Set();

  const descriptors = Object.getOwnPropertyDescriptors(_class.prototype);
  for (const descriptor of Object.values(descriptors)) {
    if (descriptor.value !== undefined) {
      set.add(descriptor.value);
    }
  }

  return set;
}

/**
 * Get map of accessors of a class.
 * @param _class
 * @return map reflection: name => descriptor
 */
export function getAccessorMap(_class: Function): Map<string, TypedPropertyDescriptor<any>> {
  const map: Map<string, TypedPropertyDescriptor<any>> = new Map();

  const descriptors = Object.getOwnPropertyDescriptors(_class.prototype);
  for (const [name, descriptor] of Object.entries(descriptors)) {
    if (descriptor.value === undefined) {
      map.set(name, descriptor);
    }
  }

  return map;
}