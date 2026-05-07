import { useEffect, useState } from "react";
import { Card, Table, Form, Input, Button, message } from "antd";
import { blackApi } from "../../request/api/black";
import type { BlackListItem, AddBlackParams } from "../../request/api/black";

export default function BlackPage() {
    const [list, setList] = useState<BlackListItem[]>([]);
    const [form] = Form.useForm();

    const fetchData = async () => {
    try {
      const res = await blackApi.getList();
      setList(res.data);
    } catch {
      message.error("获取黑名单数据失败");
    }
  };

  const onSubmit = async (vals: AddBlackParams) => {
    try {
      await blackApi.add(vals);
      message.success("已加入黑名单");
      fetchData();
      form.resetFields();
    } catch {
      message.error("加入黑名单失败，请重试");
    }
  };

  useEffect(() => {
    const load = async () => {
      await fetchData();
    };
    load();
  }, []);

    const columns = [
        {title:"姓名",dataIndex:"name"},
        {title:"工号",dataIndex:"work_id"},
        {title:"封禁原因",dataIndex:"reason"},
        {title:"添加时间",dataIndex:"create_time"}
    ];

    return (
        <Card title="🚫 劳务人员黑名单">
            <Form form={form} layout="inline" onFinish={onSubmit} style={{marginBottom:16}}>
                <Form.Item name="name" label="姓名" rules={[{required:true}]}><Input/></Form.Item>
                <Form.Item name="work_id" label="工号" rules={[{required:true}]}><Input/></Form.Item>
                <Form.Item name="reason" label="封禁原因" rules={[{required:true}]}><Input/></Form.Item>
                <Form.Item><Button danger type="primary" onClick={()=>onSubmit(form.getFieldsValue())}>加入黑名单</Button></Form.Item>
            </Form>
            <Table columns={columns} dataSource={list} rowKey="id" pagination={{}}/>
        </Card>
    )
}