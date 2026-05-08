import { Form, Input, Button, Card, message } from "antd";
import { userApi } from "../../request/api/user";
import type { ChangePasswordValues } from "../../request/api/user";

export default function UserCenter() {
    const [form] = Form.useForm();

    const changePwd = async (vals: ChangePasswordValues) => {
        if (vals.newPwd !== vals.confirmPwd) {
        message.error("两次密码不一致");
        return;
        }
        await userApi.changePassword(vals);
        message.success("密码修改成功，请重新登录");
        form.resetFields();
    };

    return (
        <Card title="👤 个人中心 - 修改密码" style={{maxWidth:500,margin:"20px auto"}}>
        <Form form={form} layout="vertical" onFinish={changePwd}>
            <Form.Item name="oldPwd" label="原密码" rules={[{required:true}]}>
            <Input.Password />
            </Form.Item>
            <Form.Item name="newPwd" label="新密码" rules={[{required:true}]}>
            <Input.Password />
            </Form.Item>
            <Form.Item name="confirmPwd" label="确认新密码" rules={[{required:true}]}>
            <Input.Password />
            </Form.Item>
            <Form.Item>
            <Button type="primary" htmlType="submit" block>保存修改</Button>
            </Form.Item>
        </Form>
        </Card>
    );
}