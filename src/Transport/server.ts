'use strict';
import * as net from 'net';
import { ZgingerHomebridgePlatform } from '../platform';

export class Server {
  constructor(
        private platform: ZgingerHomebridgePlatform,
        private input,
  ) {
    const server = net.createServer((socket) => {

      this.platform.log.debug('Gateway connected to server');

      socket.on('data', data => {
        this.platform.log.warn('Server got', [...data]);
        this.input.onData(data);
      });

      socket.on('close', () => {
        this.platform.log.error('Connection closed');
      });

      socket.on('error', (err) => {
        this.platform.log.error('Connection error', err);
      });
    });

    const {ip, port} = this.input.data;
    this.platform.log.warn('Start server for gateway', ip + ':' +port);
    server.listen(port);
  }
}
