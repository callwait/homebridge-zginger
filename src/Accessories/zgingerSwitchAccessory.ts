'use strict';
import { PlatformAccessory, Service } from 'homebridge';
import { ZgingerHomebridgePlatform } from '../platform';
import { IDevice } from '../types';
import { PLATFORM_NAME, PLUGIN_NAME } from '../settings';
import { CodeEnum, gatewayRequestData } from '../Transport';

export class ZgingerSwitchAccessory {
  private service: Service;
  private accessory!: PlatformAccessory;

  constructor(
        private readonly platform: ZgingerHomebridgePlatform,
        private readonly gateway,
        private readonly device: IDevice,
  ) {
    this.discoverDevice(device);
    this.accessory.getService(this.platform.Service.AccessoryInformation)!
      .setCharacteristic(this.platform.Characteristic.Manufacturer, 'Gingerway Technologies Co., Ltd')
      .setCharacteristic(this.platform.Characteristic.Model, 'Smart Switch (Module)');

    this.service = this.accessory.getService(this.platform.Service.Lightbulb) || this.accessory.addService(this.platform.Service.Lightbulb);
    this.service.setCharacteristic(this.platform.Characteristic.Name, this.device.name);

    this.service.getCharacteristic(this.platform.Characteristic.On)
        //.on('get', this.handleOnGet)
        .on('set', this.handleOnSet);

    this.setStatus(this.device.status);
  }

  setStatus = status => {
    const err = new Error('No Response');
    this.platform.log.debug('setStatus:', status);
    this.service.getCharacteristic(this.platform.Characteristic.On).updateValue(status === 2 ? err : status);
  };


  handleOnGet = callback => {
    callback(null, true);
  }


  handleOnSet = (value, callback) => {
    this.platform.log.debug(this.device.name + ' set:', value);
    const request = gatewayRequestData(CodeEnum.ACTION_REQ, this.device.id, value);
    this.gateway.write(request);
    callback(value === 2 ? 'Error' : null);
  };


  discoverDevice(data: IDevice) {
    const uuid = this.platform.api.hap.uuid.generate(data.name);
    const existingAccessory = this.platform.accessories.find(accessory => accessory.UUID === uuid);

    if (existingAccessory) {
      this.platform.log.info('Restoring existing accessory from cache:', data.name);
      this.accessory = existingAccessory;
      this.platform.api.updatePlatformAccessories([existingAccessory]);
    } else {
      this.platform.log.info('Adding new accessory:', data.name);
      const accessory = new this.platform.api.platformAccessory(data.name, uuid);
      this.accessory = accessory;
      this.platform.api.registerPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [accessory]);
    }
  }

}
