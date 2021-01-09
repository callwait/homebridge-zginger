'use strict';

const gatewayRequestData = (code, deviceId, value) => {
  const data: number[] = [];
  data[0] = 255;
  data[1] = code;
  data[2] = 1;
  data[3] = deviceId;
  data[4] = 1;
  data[5] = 1;
  data[6] = value;
  data[7] = data[1] + data[2] + data[3] + data[4] + data[5] + data[6];
  data[8] = 254;
  return data;
};

enum SystemCodeEnum {
  START = 255,
  END = 254,
  SPLIT = 253,
  EMPTY = 0
}

enum CodeEnum {
  SCENES_REQ = 85,
  SCENES_RES = 86,
  DEVICES_REQ = 87,
  DEVICES_RES = 88,
  AUTH_REQ = 98,
  AUTH_RES = 99,
  SENSOR_REQ = 38,
  SENSOR_RES = 232,
  ACTION_RES = 16,
  ACTION_REQ = 6,
}

enum DeviceEnum {
  DEFAULT = 0,
  SWITCH = 10,
  SENSOR = 12,
  IR = 6,
  DIMMER = 1,
}

const DEVICE_LIST = gatewayRequestData(CodeEnum.DEVICES_REQ, 0, 1);

export {
  CodeEnum,
  SystemCodeEnum,
  DeviceEnum,
  DEVICE_LIST,
  gatewayRequestData,
};
