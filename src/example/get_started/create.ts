import { DecoratorGenerator } from '../../main';

// create a decorator generator
const decoratorGenerator = new DecoratorGenerator();

// create a class decorator
function myClassDecorator(): ClassDecorator {
  return decoratorGenerator.classDecorator({
    // saves some fields
    owner: 'James'
  });
}

// create a method decorator
function myMethodDecorator(label: string): MethodDecorator {
  return decoratorGenerator.methodDecorator({ label });
}

// export the decorators
export { myClassDecorator, myMethodDecorator };