import request from "../axios";

export interface ChangePasswordValues {
  oldPwd: string;
  newPwd: string;
  confirmPwd: string;
}

export const userApi = {
  changePassword: (values: ChangePasswordValues) => request.post("/user/change-password", values)
};
