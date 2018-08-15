
export declare function createSW(options: IConfigOptions): Promise<any>;

export declare function getConfig(options: IConfigOptions): webpack.Configuration | IConfigOptions;

export interface IConfigOptions {
    entry: string;
    dist?: string;
    version?: string;
    name?: string;
    file_pattern?: RegExp;
    file_prefix?: string;
    files?: string[];
    mode?: 'development' | 'production';
}

export interface IWPConfig {
    [key: string]: string;
    entry: string;
    output: {
        path: string;
        filename: string;
    };
    module: {
        rules: any[];
    };
}


