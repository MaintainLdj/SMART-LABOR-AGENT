import { useState } from "react";
import {
    Layout, Menu, Button, Avatar, Dropdown, Typography, Space, Badge
} from "antd";
import {
    MenuUnfoldOutlined, MenuFoldOutlined, UserOutlined,
    BarChartOutlined, TeamOutlined, CheckCircleOutlined,
    RobotOutlined, FileTextOutlined, BlockOutlined,
    SafetyCertificateOutlined, MoneyCollectOutlined,
    SettingOutlined, ProfileOutlined, BellOutlined
} from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";
import { logout, getUserRole } from "../utils/auth";

const { Header, Sider, Content } = Layout;
const { Title, Text } = Typography;

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
    { key: "/salary-rule", icon: <SettingOutlined />, label: "薪资规则配置", role: "admin" },
    { key: "/knowledge", icon: <BlockOutlined />, label: "RAG知识库管理", role: "admin" },
    ];

    export default function MainLayout({ children }: { children: React.ReactNode }) {
    const [collapsed, setCollapsed] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const role = getUserRole();

    const filteredMenu = menuItems.filter(
        (item) => !item.role || item.role === role
    );

    const userMenu = [
        { label: "个人中心", key: "/user-center", onClick: () => navigate("/user-center") },
        { label: "退出登录", key: "logout", onClick: () => { logout(); navigate("/login"); } },
    ];

    return (
        <Layout style={{ minHeight: "100vh", background: "#f0f2f5" }}>
        <Sider 
            trigger={null} 
            collapsible 
            collapsed={collapsed} 
            theme="light" 
            width={240}
            style={{
                position: "fixed",
                left: 0,
                top: 0,
                bottom: 0,
                height: "100vh",
                overflow: "auto",
                zIndex: 100,
                boxShadow: "2px 0 8px rgba(0,0,0,0.06)"
            }}
        >
            <div style={{ 
                padding: "24px 20px", 
                borderBottom: "1px solid #f0f0f0",
                height: "72px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
            }}>
            <Title level={5} style={{ margin: 0, color: "#fff", fontWeight: 600 }}>
                {collapsed ? "智慧" : "智慧劳务管理平台"}
            </Title>
            </div>

            <div style={{ padding: "16px 12px" }}>
                <Menu
                mode="inline"
                selectedKeys={[location.pathname]}
                items={filteredMenu}
                onClick={({ key }) => navigate(key)}
                style={{
                    border: "none",
                    background: "transparent"
                }}
                />
            </div>
        </Sider>

        <Layout style={{ marginLeft: collapsed ? 80 : 240 }}>
            <Header 
            style={{ 
                padding: "0 24px", 
                background: "#fff", 
                display: "flex", 
                justifyContent: "space-between",
                alignItems: "center", 
                boxShadow: "0 1px 4px rgba(0,21,41,0.08)",
                position: "sticky",
                top: 0,
                zIndex: 99,
                height: 64
            }}
            >
            <Space>
                <Button
                    type="text"
                    icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                    onClick={() => setCollapsed(!collapsed)}
                    style={{
                        fontSize: 16,
                        width: 40,
                        height: 40,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center"
                    }}
                />
            </Space>

            <Space size="large">
                <Badge count={3} size="small">
                    <Button
                        type="text"
                        icon={<BellOutlined />}
                        style={{
                            fontSize: 18,
                            width: 40,
                            height: 40,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center"
                        }}
                    />
                </Badge>
                <Dropdown menu={{ items: userMenu }} placement="bottomRight">
                    <Space style={{ 
                        cursor: "pointer", 
                        padding: "4px 12px",
                        borderRadius: 20,
                        transition: "background-color 0.2s"
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#f5f5f5"}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                    >
                    <Avatar 
                        size={32} 
                        icon={<UserOutlined />}
                        style={{
                            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                        }}
                    />
                    <Text style={{ marginLeft: 8, fontSize: 14 }}>
                        {role === "admin" ? "管理员" : "操作员"}
                    </Text>
                    </Space>
                </Dropdown>
            </Space>
            </Header>

            <Content 
            style={{ 
                padding: "24px", 
                overflow: "auto", 
                background: "#f0f2f5",
                minHeight: "calc(100vh - 64px)"
            }}
            >
            {children}
            </Content>
        </Layout>
        </Layout>
    );
}