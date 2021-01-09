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

export type IDevice = {
    id: number;
    type: number;
    deviceId: number;
    status: number;
    name: string;
};

export type ISensorData = {
    motion: boolean;
    brightness: number;
    temperature: number;
};
