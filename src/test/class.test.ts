import { zone } from '../generator';
import { Scanner } from '../control';

describe('class decorator tests', function() {
  const scanner = Scanner.getInstance({
    rootPath: __dirname
  });
  const classCollector = scanner.classCollector;

  const myZone = Symbol('myZone');
  const generator = zone(myZone);

  interface MyClassContext {
    scope: 'singleton' | 'prototype' | 'request';
  }

  function Scope(scope: MyClassContext['scope']): ClassDecorator {
    return generator.classDecorator({ scope });
  }

  @Scope('singleton')
  class Bunny {
  }

  it('should be exists', function() {
    expect(classCollector.getByConstructor(Bunny)).toBeDefined();
  });

  it('should contain the context', function() {
    const bunnyReflector = classCollector.getByConstructor<MyClassContext>(Bunny);
    expect(bunnyReflector?.getContext(myZone, 'scope')).toBe('singleton');
  });
});

describe('extends tests', function() {
  const scanner = Scanner.getInstance({
    rootPath: __dirname
  });
  const classCollector = scanner.classCollector;

  const myZone = Symbol('myZone');
  const generator = zone(myZone);

  interface AnimalClassContext {
    type: 'mammal' | 'avian' | 'invertebrate',
    movingSpeed: 'slow' | 'medium' | 'fast',
  }

  function mammal(): ClassDecorator {
    return generator.classDecorator<AnimalClassContext>({ type: 'mammal' });
  }

  function movingSpeed(movingSpeed: AnimalClassContext['movingSpeed']): ClassDecorator {
    return generator.classDecorator<AnimalClassContext>({ movingSpeed });
  }

  @mammal()
  class Mammal {
  }

  @movingSpeed('medium')
  class Bunny extends Mammal {
  }

  it('should have correct context', function() {
    const mammalReflector = classCollector.getByConstructor<AnimalClassContext>(Mammal);
    expect(mammalReflector?.getContext(myZone, 'type')).toBe('mammal');

    const bunnyReflector = classCollector.getByConstructor<AnimalClassContext>(Bunny);
    expect(bunnyReflector?.getContext(myZone, 'type')).toBeUndefined();
    expect(bunnyReflector?.getParent()).toBe(mammalReflector);
  });
});