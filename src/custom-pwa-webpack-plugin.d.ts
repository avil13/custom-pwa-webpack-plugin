import { IConfigOptions } from './lib/webpack_child_process';

export interface CustomPwaWebpackPlugin {
    constructor(options: IConfigOptions): void;
    options: IConfigOptions;
}
