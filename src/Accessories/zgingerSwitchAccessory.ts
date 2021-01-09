'use strict';
import { Service } from 'homebridge';
import { ZgingerHomebridgePlatform } from '../platform';
import { IDevice } from '../types';
import { CodeEnum, gatewayRequestData } from '../Transport';
import { platformAccessory } from '../platformAccessory';

export class ZgingerSwitchAccessory extends platformAccessory {
  private service: Service;

  constructor(
        private readonly platform: ZgingerHomebridgePlatform,
        private readonly gateway,
        private readonly device: IDevice,
  ) {
    super(platform);
    this.discoverDevice(device);
    this.accessoryInformation()
      .setCharacteristic(this.Model, 'Smart Switch (Module)');

    this.service = this.accessory.getService(this.platform.Service.Lightbulb) || this.accessory.addService(this.platform.Service.Lightbulb);
    this.service.setCharacteristic(this.Name, this.device.name);

    this.service.getCharacteristic(this.platform.Characteristic.On)
    //.on('get', this.handleOnGet)
      .on('set', this.handleOnSet);

    this.setStatusOn(this.service, this.device.status);
  }

  handleOnGet = callback => {
    callback(null, true);
  };

  handleOnSet = (value, callback) => {
    this.platform.log.debug(this.device.name + ' set:', value);
    const request = gatewayRequestData(CodeEnum.ACTION_REQ, this.device.id, value);
    this.gateway.write(request);
    callback(value === 2 ? 'Error' : null);
  };
}
