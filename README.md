# Reflect

## Get Started

### Create and export decorators

At the very first beginning, we create two decorators, one of which is a class decorator and the other is a method decorator, as follows by using  `DecoratorGenerator`. We can save some fields if needed. Those fields are named `context` in `ts-reflect` and can be accessed when decorators are applied. Notice that function `myMethodDecorator` accepts a parameter `label` then is passed to context. Users can custom the value of the `label` when applying this decorator.

~~~typescript
// create.ts

import { DecoratorGenerator } from 'ts-reflect_old';

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

We apply the decorators as follows. After a decorated class is loaded, its corresponding reflector can be obtained by the `classContainer`. Use `getContext` to access the context we save when creating the decorator. We can also obtain the reflector of the method `myMethod`. Similar operations of getting and setting the context of all kinds of reflectors are the same.

> Prerequisite knowledge of typescript decorators is that they will be invoked when the generated js file is imported (or required). They will not be invoked again the second time of importing (or requiring).

~~~typescript
// apply.ts

import { myClassDecorator, myMethodDecorator } from './create';
import { classContainer } from 'ts-reflect_old';

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
~~~