import request from "../axios";

export interface LoginValues {
  username: string;
  password: string;
}

export const authApi = {
  login: (values: LoginValues) => request.post("/login", values)
};
