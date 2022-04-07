import { defaultZone } from './reflector';
import { DecoratorGenerator } from './generator';

export function DecoratedClass(): ClassDecorator {
  return new DecoratorGenerator(defaultZone).classDecorator();
}