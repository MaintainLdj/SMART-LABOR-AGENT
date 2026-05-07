import { useState, useEffect } from "react";
import { Card, Table, Tag, Form, Select, Button, message } from "antd";
import { ClockCircleOutlined } from "@ant-design/icons";
import { laborApi } from "../../request/api/labor";
import { checkinApi } from "../../request/api/checkin";
import { mcpApi } from "../../request/api/mcp";
import type { Labor } from "../../request/api/labor";
import type { Checkin } from "../../request/api/checkin";

const { Option } = Select;

export default function CheckinPage() {
    const [form] = Form.useForm();
    const [laborList, setLaborList] = useState<Labor[]>([]);
    const [checkinList, setCheckinList] = useState<Checkin[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        laborApi.getList().then((res) => {
            const data = res as unknown as { code: number; data: Labor[] };
            setLaborList(data.data || []);
        });
        checkinApi.getList().then((res) => {
            const data = res as unknown as { code: number; data: Checkin[] };
            setCheckinList(data.data || []);
        });
    }, []);

    const handleCheckin = async () => {
        const v = form.getFieldsValue();
        const labor = laborList.find(x => x.id === v.labor_id);
        if (!labor) return;
        setLoading(true);
        try {
        await checkinApi.submit({ ...v, work_id: labor.work_id, name: labor.name });
        message.success("打卡成功");
        form.resetFields();
        const res = await checkinApi.getList();
        const data = res as unknown as { code: number; data: Checkin[] };
        setCheckinList(data.data || []);
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
            <Button type="primary" style={{ marginRight: 8 }} onClick={handleCheckin} loading={loading} icon={<ClockCircleOutlined />}>打卡</Button>
            <Button type="primary" onClick={async ()=>{
                const res = await mcpApi.getHeartbeat();
                message.info(`机具在线：${res.data.deviceCode}`);
                }}>
                🔌 连接工地MCP考勤机具
            </Button>
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