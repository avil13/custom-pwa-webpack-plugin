import { IConfigOptions } from './lib/webpack_child_process';

export interface CustomPwaWebpackPlugin {
    (options: IConfigOptions): void;
    options: IConfigOptions;
}
