import axios from "axios";
import type { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from "axios";
import { message } from "antd";

const request = axios.create({
    baseURL: "http://localhost:8000/api",
    timeout: 15000
}) as AxiosInstance;

request.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

request.interceptors.response.use(
    (res: AxiosResponse) => res.data,
    (err) => {
        message.error("网络请求异常");
        return Promise.reject(err);
    }
);

export default request;