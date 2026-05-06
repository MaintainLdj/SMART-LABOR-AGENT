import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from "react-router-dom";
import { Layout, Typography, Button, message } from "antd";
import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { wsClient } from "./utils/websocket";
import { isLogin, logout } from "./utils/auth";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Labor from "./pages/Labor";
import Checkin from "./pages/Checkin";
import AIAgent from "./pages/AIAgent";
import LogPage from "./pages/Log";
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
              <Link to="/ai" className="nav-link">AI自治</Link>
              <Link to="/logs" className="nav-link">操作日志</Link>
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
          <Route path="/ai" element={<RequireAuth><AIAgent/></RequireAuth>}/>
          <Route path="/logs" element={<RequireAuth><LogPage/></RequireAuth>}/>
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