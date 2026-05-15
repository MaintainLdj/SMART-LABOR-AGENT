import { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { message } from "antd";
import { wsClient } from "./utils/websocket";
import { isLogin } from "./utils/auth";
import MainLayout from "./layouts/MainLayout";

// 页面
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Labor from "./pages/Labor";
import Checkin from "./pages/Checkin";
import AIAgent from "./pages/AIAgent";
import Log from "./pages/Log";
import Contract from "./pages/Contract";
import Black from "./pages/Black";
import SalaryRule from "./pages/SalaryRule";
import SalaryCalc from "./pages/SalaryCalc";
import AttendanceAi from "./pages/AttendanceAi";
import Knowledge from "./pages/Knowledge";
import UserCenter from "./pages/UserCenter";

// 权限守卫
const RequireAuth = ({ children }: { children: React.ReactNode }) => {
  if (!isLogin()) {
    return <Navigate to="/login" />;
  }
  return <MainLayout>{children}</MainLayout>;
};

function App() {
  const [, setRefreshKey] = useState(0);

  useEffect(() => {
    wsClient.connect();
    wsClient.onMessage((data) => {
      if (data.type === "warning") message.warning(data.msg);
      else if (data.type === "system") message.info(data.msg);
      else message.success(data.msg);
      setRefreshKey(prev => prev + 1);
    });
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        {/* 全部页面走侧边栏 */}
        <Route path="/" element={<RequireAuth><Dashboard /></RequireAuth>} />
        <Route path="/labor" element={<RequireAuth><Labor /></RequireAuth>} />
        <Route path="/checkin" element={<RequireAuth><Checkin /></RequireAuth>} />
        <Route path="/ai" element={<RequireAuth><AIAgent /></RequireAuth>} />
        <Route path="/logs" element={<RequireAuth><Log /></RequireAuth>} />
        <Route path="/contract" element={<RequireAuth><Contract /></RequireAuth>} />
        <Route path="/black" element={<RequireAuth><Black /></RequireAuth>} />
        <Route path="/salary-rule" element={<RequireAuth><SalaryRule /></RequireAuth>} />
        <Route path="/salary-calc" element={<RequireAuth><SalaryCalc /></RequireAuth>} />
        <Route path="/attendance-ai" element={<RequireAuth><AttendanceAi /></RequireAuth>} />
        <Route path="/knowledge" element={<RequireAuth><Knowledge /></RequireAuth>} />
        <Route path="/user-center" element={<RequireAuth><UserCenter /></RequireAuth>} />
        
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;