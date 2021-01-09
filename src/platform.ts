import {
  API,
  Characteristic,
  DynamicPlatformPlugin,
  Logger,
  PlatformAccessory,
  PlatformConfig,
  Service,
} from 'homebridge';
import { PLATFORM_NAME, PLUGIN_NAME } from './settings';
import { IConfig, IConfigGateway } from './types';
import { ZgingerGatewayAccessory } from './Accessories/zgingerGatewayAccessory';

export class ZgingerHomebridgePlatform implements DynamicPlatformPlugin {
  public readonly Service: typeof Service = this.api.hap.Service;
  public readonly Characteristic: typeof Characteristic = this.api.hap.Characteristic;
  public readonly accessories: PlatformAccessory[] = [];
  private readonly config: IConfig;

  constructor(
    public readonly log: Logger,
    config: PlatformConfig,
    public readonly api: API,
  ) {
    this.config = config as IConfig;
    this.log.debug('Finished initializing platform:', this.config.name);

    this.api.on('didFinishLaunching', () => {
      this.discoverGateway(this.config.gateways[0]);
    });
  }

  configureAccessory(accessory: PlatformAccessory) {
    this.log.info('Loading accessory from cache:', accessory.displayName);
    this.accessories.push(accessory);
  }

  discoverGateway(data: IConfigGateway) {
    const displayName = data.ip + ':' + data.port;
    const uuid = this.api.hap.uuid.generate(displayName);
    const existingAccessory = this.accessories.find(accessory => accessory.UUID === uuid);

    if (existingAccessory) {
      this.log.info('Restoring existing accessory from cache:', existingAccessory.displayName);

      // create the accessory handler for the restored accessory
      new ZgingerGatewayAccessory(this, existingAccessory);

      // update accessory cache with any changes to the accessory details and information
      this.api.updatePlatformAccessories([existingAccessory]);
    } else {
      this.log.info('Adding new accessory:', displayName);

      // create a new accessory
      const accessory = new this.api.platformAccessory(displayName, uuid);
      accessory.context.device = {...data, displayName};

      // create the accessory handler for the newly create accessory
      new ZgingerGatewayAccessory(this, accessory);

      // link the accessory to your platform
      this.api.registerPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [accessory]);
    }
  }
}
