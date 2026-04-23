import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { Layout, Typography, message } from "antd";
import { useEffect, useState } from "react";
import { wsClient } from "./utils/websocket";
import LaborPage from "./pages/LaborPage";
import CheckinPage from "./pages/CheckinPage";
import AIAgentPage from "./pages/AIAgentPage";
import "./App.css";
import "antd/dist/reset.css";

const { Header, Content } = Layout;
const { Title } = Typography;

function App() {
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    wsClient.onMessage((data) => {
      // 全局提示
      if (data.msg) {
        if (data.type === "warning") {
          message.warning(data.msg);
        } else {
          message.success(data.msg);
        }
      }
      // 触发页面刷新
      setRefreshKey(prev => prev + 1);
    });
  }, []);

  return (
    <Router>
      <Layout style={{ minHeight: "100vh" }}>
        <Header style={{ background: "#001529", padding: "0 24px" }}>
          <div style={{ display: "flex", gap: "24px", alignItems: "center" }}>
            <Title level={4} style={{ margin: 0, color: "#fff" }}>智慧劳务自治Agent</Title>
            <div style={{ display: "flex", gap: "18px" }}>
              <Link to="/" className="nav-link">人员管理</Link>
              <Link to="/checkin" className="nav-link">考勤打卡</Link>
              <Link to="/ai" className="nav-link">AI自治中心</Link>
            </div>
          </div>
        </Header>

        <Content style={{ padding: "24px" }}>
          <Routes>
            <Route path="/" element={<LaborPage key={refreshKey} />} />
            <Route path="/checkin" element={<CheckinPage key={refreshKey} />} />
            <Route path="/ai" element={<AIAgentPage />} />
          </Routes>
        </Content>
      </Layout>
    </Router>
  );
}

export default App;