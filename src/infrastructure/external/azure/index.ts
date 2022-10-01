import { CoordinatesToCompare, GeolocationAPI } from '../../../application/interfaces/gps';
import { Logger } from '../../../application/interfaces/logger';
import { Config } from '../../config';
import { HttpClient } from '../http-client';

// see https://learn.microsoft.com/en-us/rest/api/maps/route/post-route-matrix?tabs=HTTP#examples
export type AzureMapsRouteAPIResponse = {
  formatVersion: string;
  matrix: ProcessedRoute[][];
  summary: {
    successfulRoutes: number;
    totalRoutes: number;
  };
};

// see https://learn.microsoft.com/en-us/rest/api/maps/route/post-route-matrix?tabs=HTTP#examples
export type AzureMapsMatrixRoutePayload = {
  origins: {
    type: string;
    coordinates: number[][]; // latitude long i.e [ [ -46.5953565, -23.6828155 ] ]
  };
  destinations: {
    type: string;
    coordinates: number[][];
  };
};

type ProcessedRoute = {
  statusCode: number;
  response: {
    routeSummary: {
      lengthInMeters: number;
      travelTimeInSeconds: number;
      trafficDelayInSeconds: number;
      departureTime: string;
      arrivalTime: string;
    };
  };
};

const getDistanceAndStimatedTime = async (
  coordinates: CoordinatesToCompare,
  httpClient: HttpClient,
  logger: Logger,
  config: Config
) => {
  logger.info('[AZURE MATRIX API] - Calling API');
  const azureApiUrl = config.azureApiUrl;
  const azureApiKey = config.azureApiSubscriptionKey;

  const payload: AzureMapsMatrixRoutePayload = {
    origins: {
      type: 'MultiPoint',
      coordinates: [[Number(coordinates.from.longitude), Number(coordinates.from.latitude)]]
    },
    destinations: {
      type: 'MultiPoint',
      coordinates: [[Number(coordinates.to.longitude), Number(coordinates.to.latitude)]]
    }
  };

  const travelMode = 'car'; // can be dynamic such as car, motorcycle(BETA), pedestrian and so on...

  const osrmRouteUrl = `${azureApiUrl}/route/matrix/sync/json?subscription-key=${azureApiKey}&api-version=1.0&traffic=true&travelMode=${travelMode}`;
  const { matrix } = await httpClient.post<AzureMapsRouteAPIResponse>(osrmRouteUrl, payload);

  // since we are using a matrix 1x1 all available reponses will be present on the first position
  const routeSummary = matrix[0][0].response.routeSummary;

  const estimatedTime = routeSummary.travelTimeInSeconds + routeSummary.trafficDelayInSeconds;
  const distanceMeters = routeSummary.lengthInMeters;

  return {
    estimatedTime,
    distanceMeters
  };
};

const newAzureRouteAPI = (httpClient: HttpClient, logger: Logger, config: Config): GeolocationAPI => ({
  getDistanceAndStimatedTime: async (coordinates: CoordinatesToCompare) =>
    getDistanceAndStimatedTime(coordinates, httpClient, logger, config)
});

export { newAzureRouteAPI };
