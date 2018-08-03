
export interface IConfigOptions {
    entry: string;
    dist?: string;
    version?: string;
    name?: string;
    file_patterns?: RegExp;
}

export interface IWPConfig {
    [key: string]: string;
}

export declare function getConfig(options: IConfigOptions): any;

export declare function runWebpack(options: IConfigOptions): void;
