import axios, { AxiosRequestConfig } from 'axios';

interface HttpClient {
  get: <T = any>(url: string) => Promise<T>;
}

const newAxiosHttpClient = (options?: AxiosRequestConfig): HttpClient => {
  return axios.create(options);
};

export { HttpClient, newAxiosHttpClient };
