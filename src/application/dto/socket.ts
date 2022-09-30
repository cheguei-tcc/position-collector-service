import { School, Coordinates, Responsible } from '../../domain';

export type ResponsibleSocketMessage = {
  coordinates: Coordinates;
  school: School;
} & Responsible;
