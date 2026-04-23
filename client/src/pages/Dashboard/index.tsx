import { useEffect, useState } from "react";
import { Card, Row, Col, Statistic, Space } from "antd";
import { UserOutlined, WarningOutlined, CheckCircleOutlined, ClockCircleOutlined } from "@ant-design/icons";
import ReactECharts from "echarts-for-react";
import { getDashboardStatistics, type DashboardData } from "../../api/dashboard";

export default function DashboardPage(){
    const [data,setData] = useState<DashboardData>({});
    useEffect(()=>{
        getDashboardStatistics().then(data=>setData(data));
    },[]);

    const pieOpt = {
        tooltip:{},
        series:[{
        type:"pie",
        data:[
            {name:"在岗",value:data.on_job||0},
            {name:"请假/异常",value:data.leave||0}
        ]
        }]
    };

    const barOpt = {
        xAxis:{type:"category",data:["工时不足","未实名","未签合同","缺勤"]},
        yAxis:{type:"value"},
        series:[{data:[data.abnormal||0,1,0,0],type:"bar"}]
    };

    return (
        <Space direction="vertical" style={{width:"100%"}}>
        <Row gutter={16}>
            <Col span={6}><Card><Statistic title="总人员" value={data.total||0} prefix={<UserOutlined/>}/></Card></Col>
            <Col span={6}><Card><Statistic title="在岗" value={data.on_job||0} prefix={<CheckCircleOutlined/>}/></Card></Col>
            <Col span={6}><Card><Statistic title="打卡次数" value={data.checkin_total||0} prefix={<ClockCircleOutlined/>}/></Card></Col>
            <Col span={6}><Card><Statistic title="异常" value={data.abnormal||0} prefix={<WarningOutlined/>} valueStyle={{color:"red"}}/></Card></Col>
        </Row>

        <Row gutter={16}>
            <Col span={12}><Card title="人员状态">{<ReactECharts option={pieOpt}/>}</Card></Col>
            <Col span={12}><Card title="风险统计">{<ReactECharts option={barOpt}/>}</Card></Col>
        </Row>
        </Space>
    )
}