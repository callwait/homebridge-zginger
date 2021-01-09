'use strict';
import { Service } from 'homebridge';
import { ZgingerHomebridgePlatform } from '../platform';
import { IDevice } from '../types';
import { CodeEnum, gatewayRequestData } from '../Transport';
import { platformAccessory } from '../platformAccessory';

export class ZgingerSensorAccessory extends platformAccessory {
  private serviceMotion: Service;
  private serviceLight: Service;
  private serviceTemperature: Service;

  constructor(
        private readonly platform: ZgingerHomebridgePlatform,
        private readonly gateway,
        private readonly device: IDevice,
  ) {
    super(platform);
    this.discoverDevice(device);
    this.accessoryInformation()
      .setCharacteristic(this.Model, 'GW-4311 Multi-Function Sensor');

    this.serviceMotion = this.accessory.getService(this.platform.Service.MotionSensor)
        || this.accessory.addService(this.platform.Service.MotionSensor);

    this.serviceLight = this.accessory.getService(this.platform.Service.LightSensor)
        || this.accessory.addService(this.platform.Service.LightSensor);

    this.serviceTemperature = this.accessory.getService(this.platform.Service.TemperatureSensor)
        || this.accessory.addService(this.platform.Service.TemperatureSensor);

    this.serviceMotion.setCharacteristic(this.Name, this.device.name);
    this.serviceLight.setCharacteristic(this.Name, this.device.name);
    this.serviceTemperature.setCharacteristic(this.Name, this.device.name);

    const request = gatewayRequestData(CodeEnum.SENSOR_REQ, this.device.id, 1);
    this.gateway.write(request);

    setInterval(() => {
      const request = gatewayRequestData(CodeEnum.SENSOR_REQ, this.device.id, 1);
      this.gateway.write(request);
    }, 5000);
  }

  updateSensorData = data => {
    const celsius = Math.round((data.temperature - 32) * (5/9));
    this.serviceMotion.getCharacteristic(this.platform.Characteristic.MotionDetected).updateValue(!!data.motion);
    this.serviceLight.getCharacteristic(this.platform.Characteristic.CurrentAmbientLightLevel).updateValue(data.brightness);
    this.serviceTemperature.getCharacteristic(this.platform.Characteristic.CurrentTemperature).updateValue(celsius);
  };
}
