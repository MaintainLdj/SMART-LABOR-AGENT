export const isLogin = () => !!localStorage.getItem("token");
export const logout = () => localStorage.removeItem("token");