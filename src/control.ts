import { ScannerConfig } from './generator';
import { Class, Constructor } from './reflector';
import { Warehouse } from '@typinghare/warehouse/src/warehouse';
import fs from 'fs';

interface Control {
  scanner?: Scanner;
}

/**
 * Class collector.
 */
class ClassCollector {
  private _rootPath: string;

  /**
   * Class Map.
   * Mapping: constructor reference => class reflector object
   * @private
   */
  private readonly _classMap: Map<Function, Class<any>> = new Map();

  /**
   * Class warehouse.
   * @private
   */
  private readonly _classWarehouse = new Warehouse({
    defaultNamespace: '/'
  });

  /**
   * Constructor.
   * @param rootPath
   */
  public constructor(rootPath: string) {
    this._rootPath = rootPath;
  }

  /**
   * Register a class.
   * @param _class
   */
  public register(_class: Class<any>) {
    this._classMap.set(_class.getConstructor(), _class);
  }

  /**
   * Get the class reflector by the constructor reference.
   */
  getByConstructor<ClassContext extends object = object>(
    constructor: Constructor
  ): Class<ClassContext> | undefined {
    return this._classMap.get(constructor);
  }

  /**
   * Get a class by specified namespace and name;
   * @param string
   */
  public getClass<Context extends object>(string: string): Class<Context> | undefined {
    return this._classWarehouse.get(string);
  }

  // /**
  //  * Scan a directory iteratively.
  //  * @param dir_path directory path
  //  * @param namespace
  //  */
  // public scanDir(dir_path: fs.PathLike, namespace: string = '/'): void {
  //   dir_path = dir_path.toString('utf-8');
  //
  //   for (const file of fs.readdirSync(dir_path).filter(e => path.extname(e) == '.js')) {
  //     fs.lstatSync(path.join(dir_path, file)).isDirectory() ?
  //       this.scanDir(path.join(dir_path, file), `${namespace}/${file}`) :
  //       this.scan(path.join(dir_path, file), '/');
  //   }
  // }
}

/**
 * Scanner.
 */
export class Scanner {
  /**
   * Class collector.
   * @private
   */
  private readonly _classCollector: ClassCollector;

  /**
   * Get the scanner singleton instance.
   * @param scannerConfig
   */
  public static getInstance(scannerConfig?: ScannerConfig): Scanner {
    if (control.scanner === undefined) {
      if (scannerConfig === undefined) {
        throw new Error('Missing scanner config.');
      }
      control.scanner = new Scanner(scannerConfig);
    }

    return control.scanner;
  }

  /**
   * Constructor.
   * @param scannerConfig
   * @public
   */
  public constructor(scannerConfig: ScannerConfig) {
    this._classCollector = new ClassCollector(scannerConfig.rootPath);
  }

  /**
   * Get the class collector.
   */
  public get classCollector(): ClassCollector {
    return this._classCollector;
  }

  /**
   * Scan a file.
   * @param filepath
   */
  public scan(filepath: fs.PathLike): void {
    filepath = filepath.toString('utf-8');

    require(filepath);
  }
}

export const control: Control = {
  scanner: undefined
};