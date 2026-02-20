export type OngoingTripStatus = 'on' | 'off';

export const ongoingTripStatusByModelId: Record<string, OngoingTripStatus> = {
  adan: 'on',
  emmanuel: 'off',
  mariana: 'off',
};
