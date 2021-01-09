'use strict';
import { PlatformAccessory } from 'homebridge';
import { ZgingerHomebridgePlatform } from './platform';
import { IDevice } from './types';
import { PLATFORM_NAME, PLUGIN_NAME } from './settings';

export class platformAccessory {
  public accessory!: PlatformAccessory;
  public Model;
  public Manufacturer;
  public Name;

  constructor(
      private readonly _platform: ZgingerHomebridgePlatform,
  ) {
    this.Model = this._platform.Characteristic.Model;
    this.Manufacturer = this._platform.Characteristic.Manufacturer;
    this.Name = this._platform.Characteristic.Name;
  }

  setStatusOn = (service, status) => {
    const err = new Error('No Response');
    this._platform.log.debug('setStatusOn:', status);
    service.getCharacteristic(this._platform.Characteristic.On).updateValue(status === 2 ? err : status);
  };

  discoverDevice(data: IDevice) {
    const uuid = this._platform.api.hap.uuid.generate(data.name);
    const existingAccessory = this._platform.accessories.find(accessory => accessory.UUID === uuid);

    if (existingAccessory) {
      this._platform.log.info('Restoring existing accessory from cache:', data.name);
      this.accessory = existingAccessory;
      this._platform.api.updatePlatformAccessories([existingAccessory]);
    } else {
      this._platform.log.info('Adding new accessory:', data.name);
      const accessory = new this._platform.api.platformAccessory(data.name, uuid);
      this.accessory = accessory;
      this._platform.api.registerPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [accessory]);
    }
    this.accessoryInformation().setCharacteristic(this.Manufacturer, 'Gingerway Technologies Co., Ltd');
  }

  accessoryInformation() {
    return this.accessory.getService(this._platform.Service.AccessoryInformation)!;
  }
}
