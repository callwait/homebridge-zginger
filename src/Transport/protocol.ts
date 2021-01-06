import { IDevice } from '../types';

const request = (code, deviceId, status) => {
  const data: number[] = [];
  data[0] = 255;
  data[1] = code;
  data[2] = 1;
  data[3] = deviceId;
  data[4] = 1;
  data[5] = 1;
  data[6] = status;
  data[7] = data[1] + data[2] + data[3] + data[4] + data[5] + data[6];
  data[8] = 254;
  return data;
};

enum SystemCodeEnum {
  START = 255,
  END = 254,
  SPLIT = 253,
  END_LIST = 237,
  EMPTY = 0
}

enum CodeEnum {
  SCENES_REQ = 85,
  SCENES_RES = 86,
  DEVICES_REQ = 87,
  DEVICES_RES = 88,
  AUTH_REQ = 98,
  AUTH_RES = 99,
}

const DEVICE_LIST = request(CodeEnum.DEVICES_REQ, 0, 1);

const parseDevice = (data): IDevice | undefined => {
  if (data[0] === SystemCodeEnum.SPLIT) {
    const name = data.slice(8).filter(char => char !== SystemCodeEnum.EMPTY && char !== SystemCodeEnum.END_LIST);
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

export {
  CodeEnum,
  DEVICE_LIST,
  parseDeviceList,
};
