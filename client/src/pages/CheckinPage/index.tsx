import { useState, useEffect } from "react";
import { Card, Table, Tag, Form, Select, Button, message } from "antd";
import { ClockCircleOutlined } from "@ant-design/icons";
import axios from "axios";

const api = axios.create({ baseURL: "http://localhost:8000/api" });
const { Option } = Select;

interface Labor { id: number; name: string; work_id: string; }
interface Checkin { id: number; labor_id: number; work_id: string; name: string; checkin_type: string; time: string; }

export default function CheckinPage() {
    const [form] = Form.useForm();
    const [laborList, setLaborList] = useState<Labor[]>([]);
    const [checkinList, setCheckinList] = useState<Checkin[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        api.get("/labor/list").then(res => setLaborList(res.data.data));
        api.get("/checkin/list").then(res => setCheckinList(res.data.data));
    }, []);

    const handleCheckin = async () => {
        const v = form.getFieldsValue();
        const labor = laborList.find(x => x.id === v.labor_id);
        if (!labor) return;
        setLoading(true);
        try {
        await api.post("/checkin/submit", { ...v, work_id: labor.work_id, name: labor.name });
        message.success("打卡成功");
        form.resetFields();
        const res = await api.get("/checkin/list");
        setCheckinList(res.data.data);
        } catch { message.error("失败"); }
        setLoading(false);
    };

    return (
        <Card title="劳务考勤管理">
        <Form form={form} layout="inline" style={{ marginBottom: 16 }}>
            <Form.Item name="labor_id" label="人员" rules={[{ required: true }]}>
            <Select style={{ width: 180 }} placeholder="选择人员">
                {laborList.map(l => <Option key={l.id} value={l.id}>{l.name} ({l.work_id})</Option>)}
            </Select>
            </Form.Item>
            <Form.Item name="checkin_type" label="类型" rules={[{ required: true }]}>
            <Select style={{ width: 100 }}><Option value="上班">上班</Option><Option value="下班">下班</Option></Select>
            </Form.Item>
            <Form.Item>
            <Button type="primary" onClick={handleCheckin} loading={loading} icon={<ClockCircleOutlined />}>打卡</Button>
            </Form.Item>
        </Form>

        <Card size="small" title="打卡记录">
            <Table
            columns={[
                { title: "工号", dataIndex: "work_id" },
                { title: "姓名", dataIndex: "name" },
                { title: "类型", dataIndex: "checkin_type", render: t => <Tag color={t === "上班" ? "blue" : "purple"}>{t}</Tag> },
                { title: "时间", dataIndex: "time" }
            ]}
            dataSource={checkinList} rowKey="id" bordered pagination={{ pageSize: 10 }}
            />
        </Card>
        </Card>
    );
}