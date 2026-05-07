import { useEffect, useState, useCallback } from "react";
import { Card, Table } from "antd";
import { salaryApi, type SalaryCalcItem } from "../../request/api/salary";

export default function SalaryCalcPage() {
    const [list, setList] = useState<SalaryCalcItem[]>([]);

    const fetchData = useCallback(async () => {
        const res = await salaryApi.calcAll() as unknown as { data: SalaryCalcItem[] };
        setList(res.data);
    }, []);

    useEffect(() => {
        setTimeout(() => {
            fetchData();
        }, 0);
    }, [fetchData]);

    const columns = [
        { title: "姓名", dataIndex: "name" },
        { title: "工号", dataIndex: "work_id" },
        { title: "出勤天数", dataIndex: "work_days" },
        { title: "基础工资(元)", dataIndex: "base_salary" },
        { title: "加班费(元)", dataIndex: "overtime_money" },
        { title: "扣款合计(元)", dataIndex: "deduct_money" },
        { title: "实发工资(元)", dataIndex: "real_salary" },
    ];

    return (
        <Card title="📊 全员薪资核算明细">
        <Table columns={columns} dataSource={list} rowKey="work_id" pagination={{ pageSize: 10 }} />
        </Card>
    );
}