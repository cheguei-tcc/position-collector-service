import { Responsible, School } from '../../domain';

type PositionMessage = {
  school: School;
  responsible: Responsible;
  estimatedTime: number;
  distanceMeters: number;
};

export { PositionMessage };
