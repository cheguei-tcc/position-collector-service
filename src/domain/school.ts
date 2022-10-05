import { Coordinates } from './coordinates';

type School = {
  id: number;
  CNPJ?: string;
  name?: string;
  coordinates: Coordinates;
};

export { School };
