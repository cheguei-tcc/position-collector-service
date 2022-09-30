import axios, { AxiosRequestConfig } from 'axios';

interface HttpClient {
  get: <T = any>(url: string) => Promise<T>;
}

const newAxiosHttpClient = (options?: AxiosRequestConfig): HttpClient => {
  const client = axios.create(options);

  return {
    get: async (url: string) => {
      const res = await client.get(url);
      return res.data;
    }
  };
};

export { HttpClient, newAxiosHttpClient };
