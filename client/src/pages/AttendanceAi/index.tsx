import { useEffect, useState, useCallback } from "react";
import { Card, Table, Form, Input, Button, message } from "antd";
import { attendanceApi, type AttendanceException } from "../../request/api/attendance";

export default function AttendanceAiPage() {
    const [list, setList] = useState<AttendanceException[]>([]);
    const [form] = Form.useForm();

    const fetchList = useCallback(async () => {
        const res = await attendanceApi.getExceptionList() as unknown as { data: AttendanceException[] };
        setList(res.data);
    }, []);

    const analyze = async (vals: { name: string; check_time: string }) => {
        await attendanceApi.aiAnalyze(vals);
        message.success("AI考勤研判完成");
        fetchList();
        form.resetFields();
    };

    useEffect(() => {
        setTimeout(() => {
            fetchList();
        }, 0);
    }, [fetchList]);

    const columns = [
        { title: "序号", dataIndex: "id" },
        { title: "姓名", dataIndex: "name" },
        { title: "打卡时间", dataIndex: "check_time" },
        { title: "研判结果", dataIndex: "status" },
        { title: "研判时间", dataIndex: "create_time" },
    ];

    return (
        <Card title="🤖 AI 考勤异常智能研判">
        <Form form={form} layout="inline" onFinish={analyze} style={{ marginBottom: 16 }}>
            <Form.Item name="name" label="姓名" rules={[{ required: true }]}>
            <Input placeholder="输入工人姓名" />
            </Form.Item>
            <Form.Item name="check_time" label="打卡时间" rules={[{ required: true }]}>
            <Input placeholder="如：08:40" />
            </Form.Item>
            <Form.Item>
            <Button type="primary" htmlType="submit">AI 智能研判</Button>
            </Form.Item>
        </Form>
        <Table columns={columns} dataSource={list} rowKey="id" pagination={{ pageSize: 10 }} />
        </Card>
    );
}