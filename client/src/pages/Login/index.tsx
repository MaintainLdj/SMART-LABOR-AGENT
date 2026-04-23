import { useState } from "react";
import { Card, Form, Input, Button, message } from "antd";
import { useNavigate } from "react-router-dom";
import { login, type LoginValues } from "../../api/auth";

export default function LoginPage(){
    const nav = useNavigate();
    const [loading,setLoad] = useState(false);

    const onFinish = async (v: LoginValues) => {
        setLoad(true);
        try{
            const res = await login(v);
            localStorage.setItem("token", res.token);
            message.success("登录成功");
            nav("/");
        } catch {
            message.error("账号密码错误 admin / 123456");
        }
        setLoad(false);
    };

    return (
        <div style={{height:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:"#f0f2f5"}}>
        <Card style={{width:400}} title="智慧劳务自治Agent 登录">
            <Form onFinish={onFinish} layout="vertical">
                <Form.Item name="username" label="账号" rules={[{required:true}]}>
                    <Input defaultValue="admin"/>
                </Form.Item>
                <Form.Item name="password" label="密码" rules={[{required:true}]}>
                    <Input.Password defaultValue="123456"/>
                </Form.Item>
                <Form.Item>
                    <Button type="primary" htmlType="submit" block loading={loading}>登录</Button>
                </Form.Item>
            </Form>
        </Card>
        </div>
    )
}