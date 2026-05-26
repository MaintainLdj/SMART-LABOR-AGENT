import { useEffect, useState } from "react";
import { Card, Row, Col, Statistic, Space, Typography } from "antd";
import { UserOutlined, WarningOutlined, CheckCircleOutlined, ClockCircleOutlined, TeamOutlined, DollarOutlined } from "@ant-design/icons";
import ReactECharts from "echarts-for-react";
import { dashboardApi } from "../../request/api/dashboard";
import type { DashboardData } from "../../request/api/dashboard";

const { Title, Text } = Typography;

export default function DashboardPage(){
    const [data,setData] = useState<DashboardData>({});
    useEffect(()=>{
        dashboardApi.getStatistics().then(res=>setData(res.data));
    },[]);

    const pieOpt = {
        tooltip:{},
        legend: {
            orient: 'vertical',
            left: 'left'
        },
        series:[{
        type:"pie",
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
            borderRadius: 10,
            borderColor: '#fff',
            borderWidth: 2
        },
        label: {
            show: false,
            position: 'center'
        },
        emphasis: {
            label: {
                show: true,
                fontSize: 20,
                fontWeight: 'bold'
            }
        },
        labelLine: {
            show: false
        },
        data:[
                {name:"在岗",value:data.on_job||0, itemStyle: { color: '#52c41a' }},
                {name:"请假/异常",value:data.leave||0, itemStyle: { color: '#ff4d4f' }}
            ]
        }]
    };

    const barOpt = {
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'shadow'
            }
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
        },
        xAxis:{type:"category",data:["工时不足","未实名","未签合同","缺勤"], axisLabel: { interval: 0 }},
        yAxis:{type:"value"},
        series:[{
            data:[data.abnormal||0,1,0,0],
            type:"bar",
            barWidth: '60%',
            itemStyle: {
                borderRadius: [8, 8, 0, 0],
                color: new Function('return { type: "linear", x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: "#1890ff" }, { offset: 1, color: "#096dd9" }] }')()
            }
        }]
    };

    return (
        <div style={{ maxWidth: 1400, margin: "0 auto" }}>
            <Space direction="vertical" size="large" style={{ width: "100%" }}>
                <div>
                    <Title level={3} style={{ marginBottom: 8 }}>
                        数据大盘
                    </Title>
                    <Text type="secondary">实时监控劳务管理各项关键指标</Text>
                </div>

                <Row gutter={[16, 16]}>
                    <Col xs={24} sm={12} lg={6}>
                        <Card 
                            bordered={false} 
                            style={{ 
                                borderRadius: 8, 
                                boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                                transition: "transform 0.2s, box-shadow 0.2s"
                            }}
                            hoverable
                        >
                            <Statistic 
                                title="总人员" 
                                value={data.total||0} 
                                prefix={<UserOutlined style={{ color: "#1890ff" }} />}
                                valueStyle={{ color: "#1890ff", fontSize: 28, fontWeight: 600 }}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} lg={6}>
                        <Card 
                            bordered={false} 
                            style={{ 
                                borderRadius: 8, 
                                boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                                transition: "transform 0.2s, box-shadow 0.2s"
                            }}
                            hoverable
                        >
                            <Statistic 
                                title="在岗" 
                                value={data.on_job||0} 
                                prefix={<CheckCircleOutlined style={{ color: "#52c41a" }} />}
                                valueStyle={{ color: "#52c41a", fontSize: 28, fontWeight: 600 }}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} lg={6}>
                        <Card 
                            bordered={false} 
                            style={{ 
                                borderRadius: 8, 
                                boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                                transition: "transform 0.2s, box-shadow 0.2s"
                            }}
                            hoverable
                        >
                            <Statistic 
                                title="打卡次数" 
                                value={data.checkin_total||0} 
                                prefix={<ClockCircleOutlined style={{ color: "#faad14" }} />}
                                valueStyle={{ color: "#faad14", fontSize: 28, fontWeight: 600 }}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} lg={6}>
                        <Card 
                            bordered={false} 
                            style={{ 
                                borderRadius: 8, 
                                boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                                transition: "transform 0.2s, box-shadow 0.2s"
                            }}
                            hoverable
                        >
                            <Statistic 
                                title="异常" 
                                value={data.abnormal||0} 
                                prefix={<WarningOutlined style={{ color: "#ff4d4f" }} />}
                                valueStyle={{ color: "#ff4d4f", fontSize: 28, fontWeight: 600 }}
                            />
                        </Card>
                    </Col>
                </Row>

                <Row gutter={[16, 16]}>
                    <Col xs={24} lg={12}>
                        <Card 
                            bordered={false} 
                            style={{ borderRadius: 8, boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}
                            title={
                                <Space>
                                    <TeamOutlined style={{ color: "#1890ff" }} />
                                    <span>人员状态分布</span>
                                </Space>
                            }
                        >
                            <ReactECharts option={pieOpt} style={{ height: 320 }} />
                        </Card>
                    </Col>
                    <Col xs={24} lg={12}>
                        <Card 
                            bordered={false} 
                            style={{ borderRadius: 8, boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}
                            title={
                                <Space>
                                    <WarningOutlined style={{ color: "#1890ff" }} />
                                    <span>风险统计</span>
                                </Space>
                            }
                        >
                            <ReactECharts option={barOpt} style={{ height: 320 }} />
                        </Card>
                    </Col>
                </Row>

                <Card 
                    bordered={false} 
                    style={{ borderRadius: 8, boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}
                    title={
                        <Space>
                            <DollarOutlined style={{ color: "#1890ff" }} />
                            <span>月度薪资总额统计</span>
                        </Space>
                    }
                >
                    <ReactECharts
                        option={{
                            tooltip: {
                                trigger: 'axis',
                                axisPointer: {
                                    type: 'shadow'
                                }
                            },
                            grid: {
                                left: '3%',
                                right: '4%',
                                bottom: '3%',
                                containLabel: true
                            },
                            xAxis: { 
                                type: 'category', 
                                data: ['施工一组','机电组','安全组'],
                                axisLabel: { interval: 0 }
                            },
                            yAxis: { type: 'value' },
                            series: [{ 
                                type: 'bar', 
                                data: [15800, 13200, 9600],
                                barWidth: '60%',
                                itemStyle: {
                                    borderRadius: [8, 8, 0, 0],
                                    color: new Function('return { type: "linear", x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: "#52c41a" }, { offset: 1, color: "#389e0d" }] }')()
                                }
                            }]
                        }}
                        style={{height:320}}
                    />
                </Card>

                <Card 
                    bordered={false} 
                    style={{ borderRadius: 8, boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}
                    title={
                        <Space>
                            <TeamOutlined style={{ color: "#1890ff" }} />
                            <span>人员状态占比</span>
                        </Space>
                    }
                >
                    <ReactECharts
                        option={{
                            tooltip: { trigger: 'item' },
                            legend: {
                                orient: 'vertical',
                                left: 'left'
                            },
                            series: [{
                                type: 'pie',
                                radius: ['40%', '70%'],
                                avoidLabelOverlap: false,
                                itemStyle: {
                                    borderRadius: 10,
                                    borderColor: '#fff',
                                    borderWidth: 2
                                },
                                label: {
                                    show: false,
                                    position: 'center'
                                },
                                emphasis: {
                                    label: {
                                        show: true,
                                        fontSize: 20,
                                        fontWeight: 'bold'
                                    }
                                },
                                labelLine: {
                                    show: false
                                },
                                data: [
                                    {name:'正常在岗',value:12, itemStyle: { color: '#52c41a' }},
                                    {name:'出勤不足',value:3, itemStyle: { color: '#faad14' }},
                                    {name:'请假离岗',value:2, itemStyle: { color: '#ff4d4f' }}
                                ]
                            }]
                        }}
                        style={{height:320}}
                    />
                </Card>
            </Space>
        </div>
    )
}