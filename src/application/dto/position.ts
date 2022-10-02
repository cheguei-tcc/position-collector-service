import { Responsible, School } from '../../domain';

enum Status {
  ARRIVED = 'ARRIVED',
  ON_THE_WAY = 'ON_THE_WAY',
  CANCELED = 'CANCELED'
}

type PositionMessage = {
  school: School;
  responsible: Responsible;
  status: Status;
  estimatedTime: number;
  distanceMeters: number;
};

export { PositionMessage, Status };
