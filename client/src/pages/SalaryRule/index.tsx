import { useEffect, useCallback } from "react";
import { Card, Form, InputNumber, Button, message } from "antd";
import { salaryApi, type SalaryRule } from "../../request/api/salary";

export default function SalaryRulePage() {
    const [form] = Form.useForm();

    const fetchRule = useCallback(async () => {
        const res = await salaryApi.getRule() as unknown as { data: SalaryRule };
        form.setFieldsValue(res.data);
    }, [form]);

    const onSave = async (vals: SalaryRule) => {
        await salaryApi.saveRule(vals);
        message.success("薪资规则保存成功");
    };

    useEffect(() => {
        setTimeout(() => {
            fetchRule();
        }, 0);
    }, [fetchRule]);

    return (
        <Card title="💰 薪资核算规则配置">
        <Form form={form} layout="vertical" onFinish={onSave} style={{ maxWidth: 400 }}>
            <Form.Item name="daily_wage" label="基础日薪(元)" rules={[{ required: true }]}>
            <InputNumber style={{ width: "100%" }} min={100} />
            </Form.Item>
            <Form.Item name="overtime_rate" label="加班倍率" rules={[{ required: true }]}>
            <InputNumber step={0.1} style={{ width: "100%" }} min={1} />
            </Form.Item>
            <Form.Item name="late_deduct" label="迟到扣款(元)" rules={[{ required: true }]}>
            <InputNumber style={{ width: "100%" }} min={0} />
            </Form.Item>
            <Form.Item name="absent_deduct" label="旷工扣款(元)" rules={[{ required: true }]}>
            <InputNumber style={{ width: "100%" }} min={0} />
            </Form.Item>
            <Form.Item>
            <Button type="primary" htmlType="submit">保存配置</Button>
            </Form.Item>
        </Form>
        </Card>
    );
}