import { zone } from './generator';

export const reflectZone = Symbol('reflectZone');

export function DecoratedClass(): ClassDecorator {
  return zone(reflectZone).classDecorator();
}