"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findOne = void 0;
/**
 * Find an element in an iterable object.
 * @param iterable
 * @param predicate
 */
function findOne(iterable, predicate) {
    for (const element of iterable) {
        if (predicate(element))
            return element;
    }
    return null;
}
exports.findOne = findOne;
