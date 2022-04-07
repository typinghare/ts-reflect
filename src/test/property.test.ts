import { classContainer } from '../container';
import { DecoratedClass } from '../common';
import { DecoratorGenerator } from '../generator';

describe('basic property decorator tests', function() {
  const generator = new DecoratorGenerator();

  interface AnimalPropertyContext {
    pattern: string;
  }

  function Caption(pattern: string): PropertyDecorator {
    return generator.propertyDecorator<AnimalPropertyContext>({ pattern });
  }

  @DecoratedClass()
  class Bunny {
    @Caption(`(*) miles per hour`)
    public movingSpeed: number = 0;
  }

  function getMovingSpeed(bunny: Bunny) {
    const movingSpeed = bunny.movingSpeed;

    const bunnyReflector = classContainer.getByConstructor(Bunny);
    const pattern = bunnyReflector
      ?.getProperty<AnimalPropertyContext>('movingSpeed')
      ?.getContext('pattern');
    return pattern?.replace(/\(\*\)/g, movingSpeed.toString());
  }

  it('should get expected caption', function() {
    const bunny = new Bunny();
    bunny.movingSpeed = 7;
    expect(getMovingSpeed(bunny)).toBe('7 miles per hour');
  });
});