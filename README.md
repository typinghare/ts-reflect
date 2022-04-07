# Reflect

## Get Started

### Create and export decorators

~~~typescript
// create.ts

import { DecoratorGenerator } from 'ts-reflect';

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
~~~

### Apply decorators and get context

~~~typescript
// apply.ts

import { myClassDecorator, myMethodDecorator } from './create';
import { classContainer } from 'ts-reflect';

// apply decorators to your class
@myClassDecorator()
class MyClass {
  @myMethodDecorator('My label')
  public myMethod() {
    // some codes
  }
}

// get class context
const myClassReflector = classContainer.getByConstructor(MyClass);
console.log(myClassReflector?.getContext('owner')); // James

// get method context
const myMethodReflector = myClassReflector?.getMethod('myMethod');
console.log(myMethodReflector?.getContext('label'));  // My label