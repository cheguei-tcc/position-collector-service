import { Coordinates } from './coordinates';

type School = {
  CNPJ: string;
  name?: string;
  coordinates: Coordinates;
};

export { School };
