import { zone } from './generator';

export const reflectZone = Symbol('reflectZone');

export function Injectable(): ClassDecorator {
  return zone(reflectZone).classDecorator();
}