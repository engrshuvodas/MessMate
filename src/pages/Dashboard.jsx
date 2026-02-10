import React, { useContext, useState, useMemo, useEffect } from 'react';
import { Table, Card, Row, Col, Statistic, DatePicker, Button, Input, Space, Typography, notification, Divider, List, Tag, Badge, Tooltip } from 'antd';
import { SearchOutlined, DownloadOutlined, TransactionOutlined, ArrowUpOutlined, ArrowDownOutlined, WalletOutlined, FileExcelOutlined } from '@ant-design/icons';
import { AppContext } from '../context/AppContext';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import * as XLSX from 'xlsx';

import { Column } from '@ant-design/plots';

dayjs.extend(isBetween);

const { RangePicker } = DatePicker;
const { Title, Text } = Typography;

// Simple Counter Component for that premium feel
const AnimatedNumber = ({ value, prefix }) => {
    const [displayValue, setDisplayValue] = useState(0);

    useEffect(() => {
        let start = 0;
        const end = parseFloat(value);
        if (isNaN(end)) return;
        if (start === end) return;

        let totalDuration = 1000;
        let increment = end / (totalDuration / 16);

        let timer = setInterval(() => {
            start += increment;
            if (start >= end) {
                setDisplayValue(end);
                clearInterval(timer);
            } else {
                setDisplayValue(start);
            }
        }, 16);

        return () => clearInterval(timer);
    }, [value]);

    return <span className="metric-value">{prefix}{displayValue.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>;
};

const Dashboard = () => {
    const { expenses, members, settings, resolvedTheme } = useContext(AppContext);
    const [dateRange, setDateRange] = useState([dayjs().startOf('month'), dayjs().endOf('month')]);
    const [searchText, setSearchText] = useState('');

    const currency = settings?.currency || '₹';

    const filteredExpenses = useMemo(() => {
        return expenses.filter(item => {
            const expenseDate = dayjs(item.date);
            const isInRange = !dateRange || expenseDate.isBetween(dateRange[0], dateRange[1], 'day', '[]');

            const searchLower = searchText.toLowerCase();
            const matchesSearch = item.details.toLowerCase().includes(searchLower);

            return isInRange && matchesSearch;
        });
    }, [expenses, dateRange, searchText]);

    // Chart data preparation
    const chartData = useMemo(() => {
        if (!dateRange || !dateRange[0] || !dateRange[1]) return [];

        const data = [];
        let current = dayjs(dateRange[0]);
        const last = dayjs(dateRange[1]);

        while (current.isBefore(last) || current.isSame(last, 'day')) {
            const dayTotal = filteredExpenses
                .filter(ex => dayjs(ex.date).isSame(current, 'day'))
                .reduce((sum, ex) => sum + (ex.cost || 0), 0);

            data.push({
                date: current.format('DD MMM'),
                amount: dayTotal,
            });
            current = current.add(1, 'day');
        }
        return data;
    }, [filteredExpenses, dateRange]);

    const totalExpense = useMemo(() => {
        return filteredExpenses.reduce((sum, item) => sum + (item.cost || 0), 0);
    }, [filteredExpenses]);

    const dailyAverage = useMemo(() => {
        if (chartData.length === 0) return 0;
        return totalExpense / chartData.length;
    }, [totalExpense, chartData]);

    const perPersonShare = useMemo(() => {
        return members.length > 0 ? (totalExpense / members.length) : 0;
    }, [totalExpense, members.length]);

    const settlementData = useMemo(() => {
        return members.map(member => {
            const totalPaidByThisMember = filteredExpenses.reduce((sum, item) => {
                const contribution = (item.paidBy || {})[member.id] || 0;
                return sum + contribution;
            }, 0);

            const balance = totalPaidByThisMember - perPersonShare;
            return {
                id: member.id,
                name: member.name,
                paid: totalPaidByThisMember,
                shouldPay: perPersonShare,
                balance: balance
            };
        });
    }, [members, filteredExpenses, perPersonShare]);

    const toReceive = settlementData.filter(m => m.balance > 0.01).sort((a, b) => b.balance - a.balance);
    const toPay = settlementData.filter(m => m.balance < -0.01).sort((a, b) => a.balance - b.balance);

    const handleExportExcel = () => {
        try {
            const exportData = filteredExpenses.map(item => {
                const row = {
                    'Date': dayjs(item.date).format('YYYY-MM-DD'),
                    'Details': item.details,
                    'Total Cost': item.cost
                };
                members.forEach(m => { row[m.name] = item.paidBy[m.id] || 0; });
                return row;
            });

            const ws = XLSX.utils.json_to_sheet(exportData);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Bajar Records");
            XLSX.writeFile(wb, `Bajar_Records_${dayjs().format('YYYY-MM-DD')}.xlsx`);
            notification.success({ message: 'Export Successful' });
        } catch (error) {
            notification.error({ message: 'Export Failed' });
        }
    };

    // Updated Chart Config for v2 with better compatibility
    const chartConfig = {
        data: chartData,
        xField: 'date',
        yField: 'amount',
        theme: resolvedTheme === 'dark' ? 'dark' : 'light',
        padding: 'auto',
        axis: {
            x: {
                labelFill: resolvedTheme === 'dark' ? '#d9d9d9' : '#8c8c8c',
                labelFontSize: 10,
            },
            y: {
                labelFill: resolvedTheme === 'dark' ? '#d9d9d9' : '#8c8c8c',
                labelFontSize: 10,
            }
        },
        style: {
            fill: '#ff5f6d',
            radiusTopLeft: 4,
            radiusTopRight: 4,
        },
        label: {
            text: (d) => d.amount > 0 ? `${currency}${d.amount.toFixed(0)}` : '',
            style: {
                fill: resolvedTheme === 'dark' ? '#d9d9d9' : '#8c8c8c',
                fontSize: 10,
                fontWeight: 300,
                opacity: 0.8,
            },
            position: 'top',
            dy: -10,
        },
        tooltip: {
            title: 'date',
            items: [{ channel: 'y', name: 'Total Spent', valueFormatter: (v) => `${currency}${v.toLocaleString()}` }],
        },
        interaction: {
            elementHighlight: true,
        },
        annotations: [
            {
                type: 'lineY',
                data: [dailyAverage],
                style: {
                    stroke: resolvedTheme === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)',
                    lineDash: [4, 4],
                },
                label: {
                    text: `Avg: ${currency}${dailyAverage.toFixed(0)}`,
                    position: 'left',
                    style: {
                        fill: resolvedTheme === 'dark' ? '#d9d9d9' : '#8c8c8c',
                        fontSize: 10,
                    }
                }
            }
        ]
    };

    const suggestions = useMemo(() => {
        const payers = toPay.map(p => ({ ...p, balance: Math.abs(p.balance) }));
        const receivers = toReceive.map(r => ({ ...r, balance: r.balance }));
        const result = [];

        let pi = 0, ri = 0;
        while (pi < payers.length && ri < receivers.length) {
            const payer = payers[pi];
            const receiver = receivers[ri];
            const amount = Math.min(payer.balance, receiver.balance);

            if (amount > 0.1) {
                result.push(`${payer.name} → ${receiver.name}: ${currency}${amount.toFixed(0)}`);
            }

            payer.balance -= amount;
            receiver.balance -= amount;

            if (payer.balance <= 0.1) pi++;
            if (receiver.balance <= 0.1) ri++;
        }
        return result;
    }, [toPay, toReceive, currency]);

    const columns = [
        {
            title: 'Date',
            dataIndex: 'date',
            key: 'date',
            render: (date) => <Text strong>{dayjs(date).format('DD MMM')}</Text>,
        },
        {
            title: 'Details',
            dataIndex: 'details',
            key: 'details',
            render: (text) => <Text type="secondary" style={{ fontSize: 13 }}>{text}</Text>,
        },
        {
            title: 'Cost',
            dataIndex: 'cost',
            key: 'cost',
            render: (cost) => <Text strong style={{ color: '#ff5f6d' }}>{currency}{cost.toLocaleString()}</Text>,
        },
        {
            title: 'Payers',
            key: 'paidBy',
            render: (_, record) => (
                <Space size={[0, 4]} wrap>
                    {Object.entries(record.paidBy || {}).map(([memberId, amount]) => {
                        const member = members.find(m => m.id === memberId);
                        return (
                            <Tag key={memberId} color="default" className="pill-badge" style={{ fontSize: 11 }}>
                                {member ? member.name : 'Unknown'} • {currency}{amount}
                            </Tag>
                        );
                    })}
                </Space>
            ),
        },
    ];

    return (
        <div className="fade-in-up">
            <Row gutter={[24, 24]}>
                <Col xs={24} md={12}>
                    <Card className="premium-card" style={{ background: 'var(--primary-gradient)', border: 'none' }}>
                        <Statistic
                            title={<Text style={{ color: 'rgba(255,255,255,0.8)', fontWeight: 500 }}>Total Mess Expense</Text>}
                            value={totalExpense}
                            formatter={(value) => <AnimatedNumber value={value} prefix={currency} />}
                            valueStyle={{ color: '#fff' }}
                        />
                        <div style={{ marginTop: 8 }}>
                            <Tag style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff', borderRadius: 12 }}>
                                {dayjs(dateRange[0]).format('MMM D')} - {dayjs(dateRange[1]).format('MMM D')}
                            </Tag>
                        </div>
                    </Card>
                </Col>
                <Col xs={24} md={12}>
                    <Card className="premium-card">
                        <Statistic
                            title={<Text type="secondary" style={{ fontWeight: 500 }}>Per Person Share</Text>}
                            value={perPersonShare}
                            formatter={(value) => <AnimatedNumber value={value} prefix={currency} />}
                            valueStyle={{ color: '#ff5f6d' }}
                            suffix={<Text size="small" type="secondary" style={{ marginLeft: 8 }}>/ {members.length} members</Text>}
                        />
                        <div style={{ marginTop: 8 }}>
                            <Badge status="processing" color="#ff5f6d" text="Equal division active" />
                        </div>
                    </Card>
                </Col>
            </Row>

            {/* DAILY SPENDING TREND */}
            <Card
                className="premium-card"
                style={{ marginTop: 24 }}
                title={
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Title level={4} style={{ margin: 0 }}>Daily Spending Trend – {dayjs(dateRange[0]).format('MMMM YYYY')}</Title>
                        {totalExpense > 0 && <Tag color="orange" style={{ borderRadius: 6 }}>Bajar Active</Tag>}
                    </div>
                }
            >
                {chartData.some(d => d.amount > 0) ? (
                    <div style={{ height: 350, padding: '20px 0' }}>
                        <Column {...chartConfig} />
                    </div>
                ) : (
                    <div style={{ padding: '60px 0', textAlign: 'center', background: 'rgba(0,0,0,0.02)', borderRadius: 16 }}>
                        <WalletOutlined style={{ fontSize: 40, color: '#bfbfbf', marginBottom: 16 }} />
                        <br />
                        <Text type="secondary">No spending records found for this period.</Text>
                    </div>
                )}
            </Card>

            <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
                <Col xs={24} lg={16}>
                    <Card
                        className="premium-card fade-in-up delay-1"
                        title={<Title level={4} style={{ margin: 0 }}>Recent Bajar Records</Title>}
                        extra={
                            <Space wrap>
                                <RangePicker variant="filled" value={dateRange} onChange={setDateRange} style={{ borderRadius: 8 }} />
                                <Tooltip title="Download Excel Report">
                                    <Button type="primary" icon={<FileExcelOutlined />} onClick={handleExportExcel}>Export</Button>
                                </Tooltip>
                            </Space>
                        }
                    >
                        <Table
                            columns={columns}
                            dataSource={filteredExpenses}
                            rowKey="id"
                            pagination={{ pageSize: 5 }}
                            size="middle"
                        />
                    </Card>
                </Col>

                <Col xs={24} lg={8}>
                    <Card
                        className="premium-card settlement-card fade-in-up delay-2"
                        title={<><TransactionOutlined /> Settlement Summary</>}
                        style={{ borderTop: '4px solid #ff5f6d' }}
                    >
                        <div style={{ marginBottom: 20 }}>
                            <Text strong type="secondary" style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 1 }}>Receivables</Text>
                            <List
                                dataSource={toReceive}
                                renderItem={item => (
                                    <List.Item className="settlement-item" style={{ padding: '12px 0' }}>
                                        <Space><ArrowUpOutlined style={{ color: '#00c853' }} /> <Text strong>{item.name}</Text></Space>
                                        <Text strong style={{ color: '#00c853' }}>+{currency}{item.balance.toFixed(0)}</Text>
                                    </List.Item>
                                )}
                            />
                        </div>

                        <div>
                            <Text strong type="secondary" style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 1 }}>Payables</Text>
                            <List
                                dataSource={toPay}
                                renderItem={item => (
                                    <List.Item className="settlement-item" style={{ padding: '12px 0' }}>
                                        <Space><ArrowDownOutlined style={{ color: '#ff3d00' }} /> <Text strong>{item.name}</Text></Space>
                                        <Text strong style={{ color: '#ff3d00' }}>-{currency}{Math.abs(item.balance).toFixed(0)}</Text>
                                    </List.Item>
                                )}
                            />
                        </div>

                        {suggestions.length > 0 && (
                            <div className="settlement-plan-alert" style={{ marginTop: 24, padding: 16, borderRadius: 12 }}>
                                <Title level={5} size="small" style={{ marginTop: 0, marginBottom: 12, fontSize: 13 }}>Final Settlement Plan</Title>
                                {suggestions.map((s, idx) => (
                                    <div key={idx} style={{ marginBottom: 8, fontSize: 13 }}>
                                        <Badge status="error" /> <Text style={{ color: '#991b1b' }}>{s}</Text>
                                    </div>
                                ))}
                            </div>
                        )}
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default Dashboard;
