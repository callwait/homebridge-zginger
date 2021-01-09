'use strict';
import { PlatformAccessory, Service } from 'homebridge';
import { ZgingerHomebridgePlatform } from '../platform';
import {
  CodeEnum,
  DEVICE_LIST,
  DeviceEnum,
  Net,
  parseDeviceList,
  parseResponse,
  parseSensorResponse,
} from '../Transport';
import { ZgingerSwitchAccessory } from './zgingerSwitchAccessory';
import { ZgingerSensorAccessory } from './zgingerSensorAccessory';

// I've tested it only on GW-9321 Gateway
// TODO: add support GW-9322, GW-93231, GW-9324, GW-9325, GW-9326
export class ZgingerGatewayAccessory {
  public gateway;
  private readonly service: Service;
  private readonly devices: Array<ZgingerSwitchAccessory | ZgingerSensorAccessory> = [];

  constructor(
        private readonly platform: ZgingerHomebridgePlatform,
        private readonly accessory: PlatformAccessory,
  ) {
    // set accessory information
    this.accessory.getService(this.platform.Service.AccessoryInformation)!
      .setCharacteristic(this.platform.Characteristic.Manufacturer, 'Gingerway Technologies Co., Ltd')
      .setCharacteristic(this.platform.Characteristic.Model, 'GW-9321 RF Gateway');

    this.service = this.accessory.getService(this.platform.Service.WiFiSatellite)
      || this.accessory.addService(this.platform.Service.WiFiSatellite);
    this.service.setCharacteristic(this.platform.Characteristic.Name, accessory.context.device.displayName);
    this.service.getCharacteristic(this.platform.Characteristic.WiFiSatelliteStatus)
      .on('get', this.handleWiFiSatelliteStatusGet);
    this.connect();

    // setInterval(() => {
    //   this.getDevicesList();
    // }, 5000);

  }

  connect = () => {
    this.gateway = new Net(this.platform, {
      data: this.accessory.context.device,
      onConnect: this.getDevicesList,
      onData: this.onData,
    });
  };

  onData = e => {
    //.this.platform.log.info('Received RAW', [...e]);
    switch (e[1]) {
      case CodeEnum.DEVICES_RES:
        this.updateAccessories(e);
        break;
      case CodeEnum.ACTION_RES:
        this.createOrUpdateDevice(parseResponse(e));
        break;
      case CodeEnum.SENSOR_RES:
        this.createOrUpdateDevice(parseSensorResponse(e));
        break;
    }
  };

  getDevicesList = () => {
    this.gateway.write(DEVICE_LIST);
  };

  handleWiFiSatelliteStatusGet = (callback) => {
    const currentValue = this.gateway.isConnected;
    callback(null, currentValue);
  };

  updateAccessories = e => {
    const data = parseDeviceList(e);
    data.map(this.createOrUpdateDevice);
  };

  createOrUpdateDevice = device => {
    const existingDevice = this.devices[device.id];

    if (existingDevice) {
      if (device.status >= 0) {
        existingDevice.setStatusOn(this.service, device.status);
      }
      if (device.motion >= 0 && existingDevice instanceof ZgingerSensorAccessory) {
        existingDevice.updateSensorData(device);
      }
    } else {
      switch (device.type) {
        case DeviceEnum.DEFAULT:
        case DeviceEnum.SWITCH:
          this.devices[device.id] = new ZgingerSwitchAccessory(this.platform, this.gateway, device);
          break;
        case DeviceEnum.SENSOR:
          this.devices[device.id] = new ZgingerSensorAccessory(this.platform, this.gateway, device);
          break;
      }
    }
  };
}
