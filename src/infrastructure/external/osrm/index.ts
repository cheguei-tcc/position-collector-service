import { CoordinatesToCompare, GeolocationAPI } from '../../../application/interfaces/gps';
import { Logger } from '../../../application/interfaces/logger';
import { Config } from '../../config';
import { HttpClient } from '../http-client';

// see https://github.com/Project-OSRM/osrm-backend/blob/master/docs/http.md#route-service
export type OSRMRouteAPIResponse = {
  code: string;
  routes: Route[];
};

type Route = {
  legs: any;
  weight_name: string;
  weight: number;
  duration: number;
  distance: number;
};

const getDistanceAndStimatedTime = async (
  coordinates: CoordinatesToCompare,
  httpClient: HttpClient,
  logger: Logger,
  config: Config
) => {
  logger.info('[OSRM ROUTE OPEN API] - Calling API');
  const osrmUrl = config.osrmOpenAPIUrl;

  const osrmRouteUrl = `${osrmUrl}/routed-car/route/v1/driving/${coordinates.from.longitude},${coordinates.from.latitude};${coordinates.to.longitude},${coordinates.to.latitude}?overview=false&skip_waypoints=true`;
  // see https://routing.openstreetmap.de/routed-car/route/v1/driving/-46.5953565,-23.6828155;-46.5859311,-23.737769?overview=false&skip_waypoints=true
  const { routes } = await httpClient.get<OSRMRouteAPIResponse>(osrmRouteUrl);

  const estimatedTime = routes[0].duration;
  const distanceMeters = routes[0].distance;

  return {
    estimatedTime,
    distanceMeters
  };
};

const newOSRMOpenAPI = (httpClient: HttpClient, logger: Logger, config: Config): GeolocationAPI => ({
  getDistanceAndStimatedTime: async (coordinates: CoordinatesToCompare) =>
    getDistanceAndStimatedTime(coordinates, httpClient, logger, config)
});

export { newOSRMOpenAPI };
