'use strict';
import * as net from 'net';
import { auth } from './protocol';
import { ZgingerHomebridgePlatform } from '../platform';

export class Net {
  public client;
  constructor(private platform: ZgingerHomebridgePlatform, ip: string, port: number) {
    this.client = new net.Socket();
    this.client.connect(port, ip, () => {
      this.platform.log.info('Client connected');
      this.write(auth);

    });
    this.client.on('data', (data) => {
      this.platform.log.info('Received: ' + data);
    });

    this.client.on('close', () => {
      this.platform.log.error('Connection closed');
    });
  }

  write = data => {
    const buffer = Buffer.from(data);
    this.platform.log.debug('Write: ', data);
    this.client.write(buffer);
  };
}
