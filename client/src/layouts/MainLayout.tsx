import { useState } from "react";
import {
  Layout, Menu, Button, Avatar, Dropdown, Typography, Space
} from "antd";
import {
  MenuUnfoldOutlined, MenuFoldOutlined, UserOutlined,
  BarChartOutlined, TeamOutlined, CheckCircleOutlined,
  RobotOutlined, FileTextOutlined, BlockOutlined,
  SafetyCertificateOutlined, MoneyCollectOutlined,
  SettingOutlined, ProfileOutlined
} from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";
import { logout, getUserRole } from "../utils/auth";

const { Header, Sider, Content } = Layout;
const { Title } = Typography;

// 菜单配置（带权限）
const menuItems = [
    { key: "/", icon: <BarChartOutlined />, label: "数据大盘" },
    { key: "/labor", icon: <TeamOutlined />, label: "人员管理" },
    { key: "/checkin", icon: <CheckCircleOutlined />, label: "考勤打卡" },
    { key: "/attendance-ai", icon: <RobotOutlined />, label: "AI考勤研判" },
    { key: "/ai", icon: <RobotOutlined />, label: "AI自治中心" },
    { key: "/salary-calc", icon: <MoneyCollectOutlined />, label: "薪资明细" },
    { key: "/contract", icon: <FileTextOutlined />, label: "合同管理" },
    { key: "/black", icon: <SafetyCertificateOutlined />, label: "黑名单" },
    { key: "/logs", icon: <ProfileOutlined />, label: "操作日志" },
    { key: "/user-center", icon: <UserOutlined />, label: "个人中心" },
    // 管理员菜单
    { key: "/salary-rule", icon: <SettingOutlined />, label: "薪资规则配置", role: "admin" },
    { key: "/knowledge", icon: <BlockOutlined />, label: "RAG知识库管理", role: "admin" },
    ];

    export default function MainLayout({ children }: { children: React.ReactNode }) {
    const [collapsed, setCollapsed] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const role = getUserRole();

    // 过滤菜单
    const filteredMenu = menuItems.filter(
        (item) => !item.role || item.role === role
    );

    // 用户下拉
    const userMenu = [
        { label: "个人中心", key: "/user-center", onClick: () => navigate("/user-center") },
        { label: "退出登录", key: "logout", onClick: () => { logout(); navigate("/login"); } },
    ];

    return (
        <Layout style={{ minHeight: "100vh" }}>
        {/* 左侧侧边栏 */}
        <Sider 
            trigger={null} 
            collapsible 
            collapsed={collapsed} 
            theme="light" 
            width={220}
            style={{
                position: "fixed",
                left: 0,
                top: 0,
                bottom: 0,
                height: "100vh",
                overflow: "auto",
                zIndex: 100
            }}
        >
            <div style={{ 
                padding: "16px", 
                textAlign: "center", 
                borderBottom: "1px solid #eee",
                height: "64px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
            }}>
            <Title level={5} style={{ margin: 0 }}>
                智慧劳务管理平台
            </Title>
            </div>

            <Menu
            mode="inline"
            selectedKeys={[location.pathname]}
            items={filteredMenu}
            onClick={({ key }) => navigate(key)}
            />
        </Sider>

        {/* 右侧内容区 */}
        <Layout style={{ marginLeft: collapsed ? 80 : 220 }}>
            {/* 顶部 Header */}
            <Header 
            style={{ 
                padding: "0 16px", 
                background: "#fff", 
                display: "flex", 
                justifyContent: "space-between",
                alignItems: "center", 
                boxShadow: "0 1px 2px #eee",
                position: "sticky",
                top: 0,
                zIndex: 99
            }}
            >
            {/* 折叠按钮 */}
            <Button
                type="text"
                icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                onClick={() => setCollapsed(!collapsed)}
            />

            {/* 用户信息 */}
            <Dropdown menu={{ items: userMenu }} placement="bottomRight">
                <Space style={{ cursor: "pointer" }}>
                <Avatar size={28} icon={<UserOutlined />} />
                <span>{role === "admin" ? "管理员" : "操作员"}</span>
                </Space>
            </Dropdown>
            </Header>

            {/* 页面内容 */}
            <Content 
            style={{ 
                padding: "20px", 
                overflow: "auto", 
                background: "#f5f7fa",
                minHeight: "calc(100vh - 64px)"
            }}
            >
            {children}
            </Content>
        </Layout>
        </Layout>
    );
}