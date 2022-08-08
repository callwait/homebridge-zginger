'use strict';
import { Service } from 'homebridge';
import { ZgingerHomebridgePlatform } from '../platform';
import { IDevice } from '../types';
import { CodeEnum, gatewayRequestData } from '../Transport';
import { platformAccessory } from '../platformAccessory';

export class ZgingerDimmerAccessory extends platformAccessory {
    private service: Service;

    constructor(
        private readonly platform: ZgingerHomebridgePlatform,
        private readonly gateway,
        private readonly device: IDevice,
    ) {
        super(platform);
        this.discoverDevice(device);
        this.accessoryInformation()
            .setCharacteristic(this.Model, 'Smart Dimmer (Module)');
        this.service = this.accessory.getService(this.platform.Service.Lightbulb) || this.accessory.addService(this.platform.Service.Lightbulb);
        this.service.setCharacteristic(this.Name, this.device.name);

        this.service.getCharacteristic(this.platform.Characteristic.On)
            .on('set', this.handleOnSet);

        this.service.getCharacteristic(this.platform.Characteristic.Brightness)
            .on('set', this.setBrightness);

        this.updateStatusOn(this.device.status);
    }

    setBrightness = (value, callback) => {
        const brightness = value;
        this.platform.log.debug(this.device.name + ' set brightness:', brightness);
        const request = gatewayRequestData(CodeEnum.ACTION_REQ, this.device.id, brightness);
        this.gateway.write(request);
        callback(value === 2 ? 'Error' : null);
    }

    handleOnSet = (value, callback) => {
        this.platform.log.debug(this.device.name + ' set:', value);
        const request = gatewayRequestData(CodeEnum.ACTION_REQ, this.device.id, value);
        this.gateway.write(request);
        callback(value === 2 ? 'Error' : null);
    };

    updateStatusOn = (status: number) => {
        const err = new Error('No Response');
        this.platform.log.debug('updateStatusOn:', status);
        this.service.getCharacteristic(this.platform.Characteristic.On).updateValue(status === 2 ? err : !!status);
    };
}
