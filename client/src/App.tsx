import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from "react-router-dom";
import { Layout, Typography, Button, message } from "antd";
import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { wsClient } from "./utils/websocket";
import { isLogin, logout, getUserRole } from "./utils/auth";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Labor from "./pages/Labor";
import Checkin from "./pages/Checkin";
import Contract from "./pages/Contract";
import Black from "./pages/Black";
import AIAgent from "./pages/AIAgent";
import Log from "./pages/Log";
import SalaryRule from "./pages/SalaryRule";
import SalaryCalc from "./pages/SalaryCalc";
import AttendanceAi from "./pages/AttendanceAi";
import Knowledge from "./pages/Knowledge";
import UserCenter from "./pages/UserCenter";
import "./App.css";

const { Header, Content } = Layout;
const { Title } = Typography;

function RequireAuth({ children }: { children: ReactNode }) {
  const nav = useNavigate();
  useEffect(()=>{
    if (!isLogin()) {
      message.warning("请先登录");
      nav("/login");
    }
  },[nav]);
  return isLogin() ? children : <></>;
}

function App() {
  const [, setRK] = useState(0);
  const nav = useNavigate();

  const role = getUserRole();
  const isAdmin = role === "admin";

  useEffect(()=>{
    wsClient.connect();
    wsClient.onMessage((data: { type?: string; msg?: string })=>{
      switch(data.type) {
      case "warning":
        message.warning(data.msg);
        break;
      case "system":
        message.info(data.msg);
        break;
      default:
        message.success(data.msg);
    }
      setRK(p => p + 1);
    });
  },[]);

  const handleLogout = () => {
    logout();
    message.success("退出成功");
    nav("/login");
  };

  return (
    <Layout style={{minHeight:"100vh"}}>
      <Header style={{background:"#001529",padding:"0 24px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div style={{display:"flex",gap:24,alignItems:"center"}}>
          <Title level={4} style={{margin:0,color:"#fff"}}>智慧劳务自治Agent</Title>
          {isLogin() && (
            <div style={{display:"flex",gap:18}}>
              <Link to="/" className="nav-link">数据大盘</Link>
              <Link to="/labor" className="nav-link">人员管理</Link>
              <Link to="/checkin" className="nav-link">考勤打卡</Link>
              <Link to="/contract" className="nav-link">合同管理</Link>
              <Link to="/black" className="nav-link">黑名单</Link>
              <Link to="/ai" className="nav-link">AI自治</Link>
              <Link to="/logs" className="nav-link">操作日志</Link>
              <Link to="/attendance-ai" className="nav-link">AI考勤研判</Link>
              <Link to="/salary-calc" className="nav-link">薪资明细</Link>
              {/* 仅管理员可见 */}
              {isAdmin && <Link to="/salary-rule" className="nav-link">薪资规则配置</Link>}
              {isAdmin && <Link to="/knowledge" className="nav-link">RAG知识库管理</Link>}
              <Link to="/user-center" className="nav-link">个人中心</Link>
            </div>
          )}
        </div>
        {isLogin() && <Button type="text" style={{color:"#fff"}} onClick={handleLogout}>退出</Button>}
      </Header>
      <Content style={{padding:"24px"}}>
        <Routes>
          <Route path="/login" element={<Login/>}/>
          <Route path="/" element={<RequireAuth><Dashboard/></RequireAuth>}/>
          <Route path="/labor" element={<RequireAuth><Labor/></RequireAuth>}/>
          <Route path="/checkin" element={<RequireAuth><Checkin/></RequireAuth>}/>
          <Route path="/contract" element={<RequireAuth><Contract/></RequireAuth>}/>
          <Route path="/black" element={<RequireAuth><Black/></RequireAuth>}/>
          <Route path="/ai" element={<RequireAuth><AIAgent/></RequireAuth>}/>
          <Route path="/logs" element={<RequireAuth><Log/></RequireAuth>}/>
          <Route path="/salary-rule" element={<RequireAuth><SalaryRule/></RequireAuth>}/>
          <Route path="/salary-calc" element={<RequireAuth><SalaryCalc/></RequireAuth>}/>
          <Route path="/attendance-ai" element={<RequireAuth><AttendanceAi/></RequireAuth>}/>
          <Route path="/knowledge" element={<RequireAuth><Knowledge/></RequireAuth>}/>
          <Route path="/user-center" element={<RequireAuth><UserCenter/></RequireAuth>}/>
        </Routes>
      </Content>
    </Layout>
  );
}

function Root() {
  return (
    <Router>
      <App />
    </Router>
  );
}

export default Root;