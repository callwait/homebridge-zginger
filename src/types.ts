import { PlatformConfig } from 'homebridge';


export interface IConfigGateway {
    ip: string;
    port: number;
    password: string;
}

export type IConfigZginger = {
    gateways: IConfigGateway[];
};

export interface IConfig extends PlatformConfig, IConfigZginger {}
