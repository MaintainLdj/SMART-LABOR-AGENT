export const isLogin = () => !!localStorage.getItem("token");
export const logout = () => localStorage.removeItem("token");
export const getUserRole = () => localStorage.getItem("role") || "operator";