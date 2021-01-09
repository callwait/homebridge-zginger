import { IDevice } from '../types';
import { SystemCodeEnum } from './protocol';

const parseDevice = (data): IDevice | undefined => {
  if (data[0] === SystemCodeEnum.SPLIT) {
    const name = data.slice(8, 18).filter(char => char !== SystemCodeEnum.EMPTY);
    return {
      id: data[1],
      type: data[4],
      deviceId: data[6],
      status: data[7],
      name: Buffer.from(name).toString(),
    };
  }
};

const parseDeviceList = (data): (IDevice | undefined)[] => {
  let deviceData: Array<number> = [];
  const deviceList: Array<number[]> = [];
  data.map((char, index) => {
    if (char === SystemCodeEnum.SPLIT || index === data.length - 1) {
      deviceList.push(deviceData);
      deviceData = [];
    }
    deviceData.push(char);
  });
  return deviceList.map(parseDevice).filter(Boolean);
};

const parseResponse = data => {
  return {
    id: data[3],
    type: data[4],
    deviceId: data[5],
    status: data[6],
  };
};

const parseSensorResponse = data => {
  return {
    id: data[3],
    type: data[4],
    deviceId: data[5],
    temperature: data[6],
    brightness: data[7],
    motion: data[8],
  };
};

export {
  parseDeviceList,
  parseResponse,
  parseSensorResponse,
};
