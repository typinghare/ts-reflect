import { AnyMap, Class, Constructor } from './reflector';
import fs from 'fs';
import * as path from 'path';

/**
 * Class collector.
 */
export class ClassContainer {
  /**
   * Class Map.
   * Mapping: constructor reference => class reflector object.
   * @private
   */
  private readonly _classMap: Map<Function, Class> = new Map();

  /**
   * Register a class.
   * @param _class
   */
  public register(_class: Class) {
    this._classMap.set(_class.getConstructor(), _class);
  }

  /**
   * Get the class reflector by the constructor reference.
   */
  getByConstructor<ClassContext extends AnyMap>(constructor: Constructor): Class<ClassContext> | undefined {
    return this._classMap.get(constructor);
  }
}

/**
 * Singleton instance of class container.
 */
export const classContainer = new ClassContainer();

/**
 * Scanner.
 */
export class Scanner {
  /**
   * Scan a file.
   * @param filepath
   */
  public static scan(filepath: fs.PathLike): void {
    filepath = filepath.toString('utf-8');
    require(filepath);
  }

  /**
   * Scan a directory iteratively.
   * @param dir_path directory path
   */
  public static scanDir(dir_path: fs.PathLike): void {
    dir_path = dir_path.toString('utf-8');

    for (const file of fs.readdirSync(dir_path).filter(e => path.extname(e) == '.js')) {
      fs.lstatSync(path.join(dir_path, file)).isDirectory() ?
        this.scanDir(path.join(dir_path, file)) :
        this.scan(path.join(dir_path, file));
    }
  }
}