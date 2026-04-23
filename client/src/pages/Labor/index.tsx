import { useState, useEffect } from "react";
import { Button, Card, Table, Tag, Space, Input, message, Spin, Modal, Form, InputNumber, Popconfirm } from "antd";
import { SearchOutlined, PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { getLaborList, searchLabor, addLabor, updateLabor, deleteLabor } from "../../api/labor";
import type { Labor } from "../../api/labor";

export default function LaborPage() {
    const [form] = Form.useForm();
    const [laborList, setLaborList] = useState<Labor[]>([]);
    const [searchVal, setSearchVal] = useState("");
    const [loading, setLoading] = useState(false);
    const [pageLoading, setPageLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingItem, setEditingItem] = useState<Labor | null>(null);

    // 获取人员
    const fetchLaborList = async () => {
        setPageLoading(true);
        try {
        const data = await getLaborList();
        setLaborList(data);
        } catch {
        message.error("后端未启动");
        } finally {
        setPageLoading(false);
        }
    };

    useEffect(() => {
        setTimeout(() => {
        fetchLaborList();
        }, 0)
    }, []);

    const handleSearch = async () => {
        if (!searchVal.trim()) { message.warning("请输入工号"); return; }
        setLoading(true);
        try {
            const res = await searchLabor(searchVal);
            if(res.code === 200) {
                setLaborList(res.data);
            } else {
                message.warning(res.message);
            }
        } catch { message.error("请求失败"); }
        setLoading(false);
    };

    const showModal = (item?: Labor) => {
        if (item) {
        setEditingItem(item);
        form.setFieldsValue(item);
        } else {
        setEditingItem(null);
        form.resetFields();
        }
        setModalVisible(true);
    };

    const handleSave = async () => {
        const values = form.getFieldsValue();
        setLoading(true);
        try {
        if (editingItem) {
            await updateLabor(editingItem.id, values);
            message.success("修改成功");
        } else {
            await addLabor(values);
            message.success("添加成功");
        }
        setModalVisible(false);
        fetchLaborList();
        } catch { message.error("失败"); }
        setLoading(false);
    };

    const handleDelete = async (id: number) => {
        setLoading(true);
        try {
        await deleteLabor(id);
        message.success("删除成功");
        fetchLaborList();
        } catch { message.error("失败"); }
        setLoading(false);
    };

    const columns = [
        { title: "工号", dataIndex: "work_id", key: "work_id", width: 120 },
        { title: "姓名", dataIndex: "name", key: "name", width: 100 },
        { title: "岗位", dataIndex: "position", key: "position" },
        { title: "部门", dataIndex: "department", key: "department" },
        { title: "入职", dataIndex: "entry_time", key: "entry_time" },
        { title: "工时", dataIndex: "work_days", key: "work_days", width: 80 },
        { title: "状态", dataIndex: "status", key: "status", render: (s: string) => <Tag color={s === "在岗" ? "green" : "orange"}>{s}</Tag> },
        {
        title: "操作", width: 180, render: (_: unknown, r: Labor) => (
            <Space>
            <Button type="link" icon={<EditOutlined />} onClick={() => showModal(r)}>编辑</Button>
            <Popconfirm title="确定删除？" onConfirm={() => handleDelete(r.id)}>
                <Button type="link" danger icon={<DeleteOutlined />}>删除</Button>
            </Popconfirm>
            </Space>
        )
        }
    ];

    return (
        <Card title="劳务人员管理" extra={<Button type="primary" icon={<PlusOutlined />} onClick={() => showModal()}>新增人员</Button>}>
        <Space style={{ marginBottom: 16 }}>
            <Input placeholder="工号搜索" value={searchVal} onChange={(e) => setSearchVal(e.target.value)} prefix={<SearchOutlined />} style={{ width: 260 }} onPressEnter={handleSearch} />
            <Button onClick={handleSearch} loading={loading}>搜索</Button>
            <Button onClick={fetchLaborList}>刷新</Button>
        </Space>
        <Spin spinning={pageLoading}>
            <Table columns={columns} dataSource={laborList} rowKey="id" bordered pagination={{ pageSize: 10 }} />
        </Spin>

        <Modal title={editingItem ? "编辑" : "新增"} open={modalVisible} onCancel={() => setModalVisible(false)} onOk={handleSave} confirmLoading={loading}>
            <Form form={form} layout="vertical">
            <Form.Item name="name" label="姓名" rules={[{ required: true }]}><Input /></Form.Item>
            <Form.Item name="work_id" label="工号" rules={[{ required: true }]}><Input /></Form.Item>
            <Form.Item name="position" label="岗位"><Input /></Form.Item>
            <Form.Item name="department" label="部门"><Input /></Form.Item>
            <Form.Item name="status" label="状态"><Input placeholder="在岗/请假" /></Form.Item>
            <Form.Item name="work_days" label="工时"><InputNumber style={{ width: "100%" }} min={0} max={31} /></Form.Item>
            </Form>
        </Modal>
        </Card>
    );
}