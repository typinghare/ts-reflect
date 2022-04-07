import { DecoratorGenerator } from '../generator';
import { classContainer } from '../container';

describe('class decorator tests', function() {
  const generator = new DecoratorGenerator();

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
    expect(classContainer.getByConstructor(Bunny)).toBeDefined();
  });

  it('should contain the context', function() {
    const bunnyReflector = classContainer.getByConstructor<MyClassContext>(Bunny);
    expect(bunnyReflector?.getContext('scope')).toBe('singleton');
  });
});

describe('extends tests', function() {
  const generator = new DecoratorGenerator();

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
    const mammalReflector = classContainer.getByConstructor<AnimalClassContext>(Mammal);
    expect(mammalReflector?.getContext('type')).toBe('mammal');

    const bunnyReflector = classContainer.getByConstructor<AnimalClassContext>(Bunny);
    expect(bunnyReflector?.getContext('type')).toBeUndefined();
    expect(bunnyReflector?.getParent()).toBe(mammalReflector);
  });
});