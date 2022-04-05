import { Injectable } from '../common';
import {   zone } from '../generator';
import { Scanner } from '../control';

describe('accessor decorator tests', function() {
  const scanner = Scanner.getInstance({
    rootPath: __dirname
  });
  const classCollector = scanner.classCollector;
  const myZone = Symbol('myZone');

  interface AnimalAccessorContext {
    pattern: string;
    unitConversion: boolean;
    unit: 'mile' | 'km';
  }

  function Caption(pattern: string): MethodDecorator {
    return zone(myZone).accessorDecorator<AnimalAccessorContext>({ pattern });
  }

  @Injectable()
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

    const bunnyReflector = classCollector.getByConstructor(Bunny);
    const movingSpeedReflector = bunnyReflector?.getAccessor<AnimalAccessorContext>('movingSpeed');
    const caption = movingSpeedReflector?.getContext(myZone, 'pattern');

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
    return zone(myZone).accessorDecorator<AnimalAccessorContext>({
      unitConversion: true
    });
  }

  @Injectable()
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
    const bunnyReflector = classCollector.getByConstructor(Hare);
    const movingSpeedReflector = bunnyReflector?.getAccessor<AnimalAccessorContext>('movingSpeed');
    const unitConversion = movingSpeedReflector?.getContext(myZone, 'unitConversion');

    console.log(unitConversion);

    if (unitConversion) {
      movingSpeed *= 1.6;
      movingSpeedReflector?.setContext(myZone, 'unit', 'km');
    } else {
      movingSpeedReflector?.setContext(myZone, 'unit', 'mile');
    }

    hare.movingSpeed = movingSpeed;
  }

  function getMovingSpeed(hare: Hare): string {
    const bunnyReflector = classCollector.getByConstructor(Hare);
    const movingSpeedReflector = bunnyReflector?.getAccessor<AnimalAccessorContext>('movingSpeed');
    const unit = movingSpeedReflector?.getContext(myZone, 'unit');

    return `${hare.movingSpeed}${unit}/h`;
  }

  it('should convert unit', function() {
    const hare = new Hare();
    setMovingSpeed(hare, 10);
    expect(hare.movingSpeed).toBe(16);
    expect(getMovingSpeed(hare)).toBe('16km/h');
  });
});