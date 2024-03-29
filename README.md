# Reflect

## Get Started

### Create and export decorators

At the very first beginning, we create two decorators, one of which is a class decorator and the other is a method decorator, as follows by using  `DecoratorGenerator`. We can save some fields if needed. Those fields are named `context` in `ts-reflect` and can be accessed when decorators are applied. Notice that function `myMethodDecorator` accepts a parameter `label` and then is passed to context. Users can customize the value of the `label` when applying this decorator.

~~~typescript
// create.ts

import { DecoratorGenerator, getClass, Zone } from '../src/main'

// create a zone and a decorator generator
export const myZone = new Zone()
export const DG = new DecoratorGenerator(myZone)

// create a context for your class decorator
export type MyClassDecoratorContext = { owner: string }

// create a context for your method decorator
export type MyMethodDecoratorContext = { label: string }

// create a class decorator
export const MyClassDecorator = function (): ClassDecorator {
    return DG.generateClassDecorator({
        // saves some fields
        owner: 'James',
    })
}

// create a method decorator
export const MyMethodDecorator = function (label: string): MethodDecorator {
    return DG.generateMethodDecorator({ label })
}
~~~

### Apply decorators and get context

We apply the decorators as follows. After a decorated class is loaded, its corresponding reflector can be obtained by the `classContainer`. Use `getContext` to access the context we save when creating the decorator. We can also obtain the reflector of the method `myMethod`. Similar operations of getting and setting the context of all kinds of reflectors are the same.

> Note that in TypeSrcipt, decorators (as functions) will be called when the generated JavaScript file is imported (or required). They will not be invoked again at the second time of importing (or requiring).

~~~typescript
// apply.ts

// apply decorators to your class
@MyClassDecorator()
class MyClass {
    @MyMethodDecorator('my_label')
    public myMethod() {
        // some codes
    }
}

it('Simple test.', function () {
    // get class context
    const myClassReflector = getClass<MyClassDecoratorContext>(MyClass)
    const owner = myClassReflector!.getContext(myZone, 'owner')
    expect(owner).toBe('James')

    // get method context
    const myMethodReflector = myClassReflector!.getMethod<MyMethodDecoratorContext>('myMethod')
    const label = myMethodReflector!.getContext(myZone, 'label')
    expect(label).toBe('my_label')
})
~~~