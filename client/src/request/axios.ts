import axios from "axios";
import { message } from "antd";

const request = axios.create({
    baseURL: "http://localhost:8000/api",
    timeout: 15000
});

// 请求拦截：自动带token
request.interceptors.request.use(config => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// 响应拦截：统一错误处理
request.interceptors.response.use(
    res => res.data,
    err => {
        message.error("网络请求异常");
        return Promise.reject(err);
    }
);

export default request;