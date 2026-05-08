import { useEffect, useState } from "react";
import { Card, Row, Col, Statistic, Space } from "antd";
import { UserOutlined, WarningOutlined, CheckCircleOutlined, ClockCircleOutlined } from "@ant-design/icons";
import ReactECharts from "echarts-for-react";
import { dashboardApi } from "../../request/api/dashboard";
import type { DashboardData } from "../../request/api/dashboard";

export default function DashboardPage(){
    const [data,setData] = useState<DashboardData>({});
    useEffect(()=>{
        dashboardApi.getStatistics().then(res=>setData(res.data));
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
        <Space orientation="vertical" style={{width:"100%"}}>
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

            <Card title="月度薪资总额统计" style={{marginTop:20}}>
            <ReactECharts
                option={{
                xAxis: { type: 'category', data: ['施工一组','机电组','安全组'] },
                yAxis: { type: 'value' },
                series: [{ type: 'bar', data: [15800, 13200, 9600] }]
                }}
                style={{height:300}}
            />
            </Card>

            <Card title="人员状态占比" style={{marginTop:20}}>
            <ReactECharts
                option={{
                tooltip: { trigger: 'item' },
                series: [{
                    type: 'pie',
                    radius: '60%',
                    data: [
                    {name:'正常在岗',value:12},
                    {name:'出勤不足',value:3},
                    {name:'请假离岗',value:2}
                    ]
                }]
                }}
                style={{height:300}}
            />
            </Card>
        </Space>
    )
}