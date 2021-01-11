'use strict';
import * as net from 'net';
import { ZgingerHomebridgePlatform } from '../platform';

export class Client {
  public client;
  public isConnected = false;

  constructor(
      private platform: ZgingerHomebridgePlatform,
      private input,
  ) {
    this.client = new net.Socket();
    this.client.on('data', data => {
      this.platform.log.debug('Received: ' + [...data]);
      input.onData(data);
    });

    this.client.on('close', () => {
      this.platform.log.error('Connection closed');
      this.isConnected = false;
    });

    this.client.on('error', (err) => {
      this.platform.log.error('Connection error', err);
      this.connect();
    });

    this.connect();
  }

  connect = () => {
    const {ip, port} = this.input.data;
    this.platform.log.debug('Trying to connect...');
    this.client.connect(port, ip, () => {
      this.isConnected = true;
      this.platform.log.info('Client connected');
      this.input.onConnect();
    });

  };

  write = data => {
    const buffer = Buffer.from(data);
    this.platform.log.debug('Write: ', data);
    this.client.write(buffer);
  };
}
