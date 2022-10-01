import axios, { AxiosRequestConfig } from 'axios';

type HttpHeaders = Record<string, string | number | boolean>;
interface HttpClient {
  get: <T = any>(url: string) => Promise<T>;
  post: <T = any>(url: string, payload: any, headers?: HttpHeaders) => Promise<T>;
}

const newAxiosHttpClient = (options?: AxiosRequestConfig): HttpClient => {
  const client = axios.create(options);

  return {
    get: async (url: string) => {
      const res = await client.get(url);
      return res.data;
    },
    post: async (url: string, payload: any, headers?: HttpHeaders) => {
      const res = await client.post(url, payload, { headers });
      return res.data;
    }
  };
};

export { HttpClient, newAxiosHttpClient };
