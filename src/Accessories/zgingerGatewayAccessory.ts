import { PlatformAccessory, Service } from 'homebridge';
import { ZgingerHomebridgePlatform } from '../platform';
import { CodeEnum, DEVICE_LIST, Net, parseDeviceList } from '../Transport';

// I've tested it only on GW-9321 Gateway
// TODO: add support GW-9322, GW-93231, GW-9324, GW-9325, GW-9326
export class ZgingerGatewayAccessory {
  public gateway;
  private service: Service;

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
  }

  connect = () => {
    this.gateway = new Net(this.platform, {
      data: this.accessory.context.device,
      onConnect: this.getDevicesList,
      onData: this.onData,
    });
  };

  onData = e => {
    //this.platform.log.info('Received RAW', [...e]);
    switch (e[1]) {
      case CodeEnum.DEVICES_RES:
        console.log(parseDeviceList(e))
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
}
