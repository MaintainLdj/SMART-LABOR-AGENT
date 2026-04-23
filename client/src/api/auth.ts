import axios from "axios";

const baseUrl = "http://localhost:8000/api";

export interface LoginValues {
    username: string;
    password: string;
}

export const login = async (values: LoginValues) => {
    const res = await axios.post(`${baseUrl}/login`, values);
    return res.data;
};