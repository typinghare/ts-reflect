// create.ts

import { DecoratorGenerator, getClass, Zone } from '../src-old/main'

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
