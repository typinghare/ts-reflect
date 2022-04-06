import { Scanner } from '../control';
import { DecoratedClass } from '../common';
import { zone } from '../generator';

describe('basic property decorator tests', function() {
  const scanner = Scanner.getInstance({
    rootPath: __dirname
  });
  const classCollector = scanner.classCollector;
  const myZone = Symbol('myZone');

  interface AnimalPropertyContext {
    pattern: string;
  }

  function Caption(pattern: string): PropertyDecorator {
    return zone(myZone).propertyDecorator<AnimalPropertyContext>({ pattern });
  }

  @DecoratedClass()
  class Bunny {
    @Caption(`(*) miles per hour`)
    public movingSpeed: number = 0;
  }

  function getMovingSpeed(bunny: Bunny) {
    const movingSpeed = bunny.movingSpeed;

    const bunnyReflector = classCollector.getByConstructor(Bunny);
    const pattern = bunnyReflector
      ?.getProperty<AnimalPropertyContext>('movingSpeed')
      ?.getContext(myZone, 'pattern');
    return pattern?.replace(/\(\*\)/g, movingSpeed.toString());
  }

  it('should get expected caption', function() {
    const bunny = new Bunny();
    bunny.movingSpeed = 7;
    expect(getMovingSpeed(bunny)).toBe('7 miles per hour');
  });
});