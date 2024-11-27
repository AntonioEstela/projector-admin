const COMMANDS = {
  // Power Control
  POWER_ON: '06 14 00 04 00 34 11 00 00 5D',
  POWER_OFF: '06 14 00 04 00 34 11 01 00 5E',

  // Input Source Selection
  INPUT_HDMI_1: '06 14 00 04 00 34 13 01 03 63',
  INPUT_HDMI_2: '06 14 00 04 00 34 13 01 07 67',
  INPUT_HDMI_3: '06 14 00 04 00 34 13 01 09 69',
  INPUT_VGA: '06 14 00 04 00 34 13 01 00 60',
  INPUT_DVI: '06 14 00 04 00 34 13 01 0A 6A',
  INPUT_COMPONENT: '06 14 00 04 00 34 13 01 0B 6B',
  INPUT_USB_C: '06 14 00 04 00 34 13 01 0F 6F',
  INPUT_SVIDEO: '06 14 00 04 00 34 13 01 06 66',

  // Temperature Command
  GET_TEMPERATURE: '07 14 00 05 00 34 00 00 15 03 65',

  GET_LAMP_HOURS: '07 14 00 05 00 34 00 00 15 01 63',

  // Status Queries
  QUERY_POWER_STATUS: '07 14 00 05 00 34 00 00 11 00 5E',
  QUERY_INPUT_STATUS: '07 14 00 05 00 34 00 00 13 01 61',
};

const SET_INPUT = (input) => {
  switch (input) {
    case 'HDMI 1':
      return COMMANDS.INPUT_HDMI_1;
    case 'HDMI 2':
      return COMMANDS.INPUT_HDMI_2;
    case 'HDMI 3':
      return COMMANDS.INPUT_HDMI_3;
    case 'VGA':
      return COMMANDS.INPUT_VGA;
    case 'DVI':
      return COMMANDS.INPUT_DVI;
    case 'Component':
      return COMMANDS.INPUT_COMPONENT;
    case 'USB-C':
      return COMMANDS.INPUT_USB_C;
    case 'S-Video':
      return COMMANDS.INPUT_SVIDEO;
    default:
      return '';
  }
};
export { COMMANDS, SET_INPUT };

export default COMMANDS;
