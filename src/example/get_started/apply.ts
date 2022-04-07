import { myClassDecorator, myMethodDecorator } from './create';
import { classContainer } from '../../main';

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