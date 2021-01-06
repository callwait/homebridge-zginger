'use strict';
import * as net from 'net';
import { ZgingerHomebridgePlatform } from '../platform';

export class Net {
  public client;
  public isConnected = false;

  constructor(
      private platform: ZgingerHomebridgePlatform,
      {data, onConnect, onData},
  ) {
    this.client = new net.Socket();
    this.client.connect(data.port, data.ip, () => {
      this.isConnected = true;
      this.platform.log.info('Client connected');
      onConnect();
    });

    this.client.on('data', data => {
      onData(data);
      this.platform.log.info('Received: ' + data);
    });

    this.client.on('close', () => {
      this.isConnected = false;
      this.platform.log.error('Connection closed');
    });
  }

  write = data => {
    const buffer = Buffer.from(data);
    this.platform.log.debug('Write: ', data);
    this.client.write(buffer);
  };
}
