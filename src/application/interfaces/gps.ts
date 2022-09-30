import { Coordinates } from '../../domain/coordinates';

type CoordinatesToCompare = {
  from: Coordinates;
  to: Coordinates;
};

interface GeolocationAPI {
  getDistanceAndStimatedTime: (
    coordinates: CoordinatesToCompare
  ) => Promise<{ estimatedTime: number; distanceMeters: number }>;
}

export { GeolocationAPI, CoordinatesToCompare };
