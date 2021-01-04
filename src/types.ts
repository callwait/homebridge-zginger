import { PlatformConfig } from 'homebridge';


export interface IConfigZgingerHub {
    ip: string;
    port: string;
    password: string;
}

export type IConfigZginger = {
    hosts: IConfigZgingerHub[];
};

export interface IConfig extends PlatformConfig, IConfigZginger {}
