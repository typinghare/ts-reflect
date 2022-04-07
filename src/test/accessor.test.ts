import { DecoratedClass } from '../common';
import { DecoratorGenerator } from '../generator';
import { classContainer } from '../container';

describe('basic accessor decorator tests', function() {
  const generator = new DecoratorGenerator();

  interface AnimalAccessorContext {
    pattern: string;
    unitConversion: boolean;
    unit: 'mile' | 'km';
  }

  function Caption(pattern: string): MethodDecorator {
    return generator.accessorDecorator<AnimalAccessorContext>({ pattern });
  }

  @DecoratedClass()
  class Bunny {
    private _movingSpeed: number = 0;

    @Caption(`(*) miles per hour`)
    get movingSpeed(): number {
      return this._movingSpeed;
    }

    set movingSpeed(movingSpeed: number) {
      this._movingSpeed = movingSpeed;
    }
  }

  function getMovingSpeedCaption(bunny: Bunny): string {
    const movingSpeed = bunny.movingSpeed;

    const bunnyReflector = classContainer.getByConstructor(Bunny);
    const movingSpeedReflector = bunnyReflector?.getAccessor<AnimalAccessorContext>('movingSpeed');
    const caption = movingSpeedReflector?.getContext('pattern');

    if (caption !== undefined) {
      return caption.replace(/\(\*\)/g, movingSpeed.toString());
    } else {
      return '';
    }
  }

  it('should get expected caption', function() {
    const bunny = new Bunny();
    bunny.movingSpeed = 6;
    expect(getMovingSpeedCaption(bunny)).toBe('6 miles per hour');
  });

  function UnitConversion() {
    return generator.accessorDecorator<AnimalAccessorContext>({
      unitConversion: true
    });
  }

  @DecoratedClass()
  class Hare {
    private _movingSpeed: number = 0;

    get movingSpeed(): number {
      return this._movingSpeed;
    }

    @UnitConversion()
    set movingSpeed(movingSpeed: number) {
      this._movingSpeed = movingSpeed;
    }
  }

  function setMovingSpeed(hare: Hare, movingSpeed: number): void {
    const bunnyReflector = classContainer.getByConstructor(Hare);
    const movingSpeedReflector = bunnyReflector?.getAccessor<AnimalAccessorContext>('movingSpeed');
    const unitConversion = movingSpeedReflector?.getContext('unitConversion');

    if (unitConversion) {
      movingSpeed *= 1.6;
      movingSpeedReflector?.setContext('unit', 'km');
    } else {
      movingSpeedReflector?.setContext('unit', 'mile');
    }

    hare.movingSpeed = movingSpeed;
  }

  function getMovingSpeed(hare: Hare): string {
    const bunnyReflector = classContainer.getByConstructor(Hare);
    const movingSpeedReflector = bunnyReflector?.getAccessor<AnimalAccessorContext>('movingSpeed');
    const unit = movingSpeedReflector?.getContext('unit');

    return `${hare.movingSpeed}${unit}/h`;
  }

  it('should convert unit', function() {
    const hare = new Hare();
    setMovingSpeed(hare, 10);
    expect(hare.movingSpeed).toBe(16);
    expect(getMovingSpeed(hare)).toBe('16km/h');
  });
});