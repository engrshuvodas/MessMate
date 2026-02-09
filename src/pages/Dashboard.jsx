import React, { useContext, useState, useMemo } from 'react';
import { Table, Card, Row, Col, Statistic, DatePicker, Button, Input, Space, Typography, notification } from 'antd';
import { SearchOutlined, DownloadOutlined, CalculatorOutlined } from '@ant-design/icons';
import { AppContext } from '../context/AppContext';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import * as XLSX from 'xlsx';

dayjs.extend(isBetween);

const { RangePicker } = DatePicker;
const { Title } = Typography;

const Dashboard = () => {
    const { expenses, members } = useContext(AppContext);
    const [dateRange, setDateRange] = useState([dayjs().startOf('month'), dayjs().endOf('month')]);
    const [searchText, setSearchText] = useState('');

    const filteredData = useMemo(() => {
        return expenses.filter(item => {
            const expenseDate = dayjs(item.date);
            const isInRange = !dateRange || expenseDate.isBetween(dateRange[0], dateRange[1], 'day', '[]');

            const searchLower = searchText.toLowerCase();
            const matchesSearch = item.details.toLowerCase().includes(searchLower) ||
                item.addedBy.some(m => m.toLowerCase().includes(searchLower));

            return isInRange && matchesSearch;
        });
    }, [expenses, dateRange, searchText]);

    const totalExpense = useMemo(() => {
        return filteredData.reduce((sum, item) => sum + item.cost, 0);
    }, [filteredData]);

    const perPersonShare = useMemo(() => {
        return members.length > 0 ? (totalExpense / members.length).toFixed(2) : 0;
    }, [totalExpense, members.length]);

    const columns = [
        {
            title: 'Date',
            dataIndex: 'date',
            key: 'date',
            sorter: (a, b) => dayjs(a.date).unix() - dayjs(b.date).unix(),
            render: (date) => dayjs(date).format('DD MMM YYYY'),
        },
        {
            title: 'Bajar Details',
            dataIndex: 'details',
            key: 'details',
        },
        {
            title: 'Costing (৳)',
            dataIndex: 'cost',
            key: 'cost',
            render: (cost) => <strong>{cost.toLocaleString()}</strong>,
            sorter: (a, b) => a.cost - b.cost,
        },
        {
            title: 'Added By',
            dataIndex: 'addedBy',
            key: 'addedBy',
            render: (tags) => (
                <>
                    {tags.join(', ')}
                </>
            ),
        },
    ];

    const exportToExcel = () => {
        try {
            const dataToExport = filteredData.map(item => ({
                Date: dayjs(item.date).format('YYYY-MM-DD'),
                'Bajar Details': item.details,
                'Cost (৳)': item.cost,
                'Added By': item.addedBy.join(', ')
            }));

            // Add summary row
            dataToExport.push({});
            dataToExport.push({
                Date: 'TOTAL',
                'Cost (৳)': totalExpense
            });
            dataToExport.push({
                Date: 'Per Person',
                'Cost (৳)': perPersonShare
            });

            const ws = XLSX.utils.json_to_sheet(dataToExport);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Expenses");

            const fileName = `Mess_Expense_${dayjs().format('MMM_YYYY')}.xlsx`;
            XLSX.writeFile(wb, fileName);

            notification.success({
                message: 'Export Successful',
                description: `File ${fileName} has been downloaded.`,
            });
        } catch (error) {
            notification.error({
                message: 'Export Failed',
                description: 'Something went wrong while exporting the data.',
            });
        }
    };

    return (
        <Space direction="vertical" size="large" style={{ display: 'flex' }}>
            <Row gutter={16}>
                <Col xs={24} sm={12}>
                    <Card bordered={false} className="summary-card">
                        <Statistic
                            title="Total Expenses (Filtered)"
                            value={totalExpense}
                            precision={2}
                            prefix="৳"
                            valueStyle={{ color: '#3f8600' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12}>
                    <Card bordered={false} className="summary-card">
                        <Statistic
                            title="Per Person Share"
                            value={perPersonShare}
                            precision={2}
                            prefix="৳"
                            valueStyle={{ color: '#cf1322' }}
                            suffix={`/ ${members.length} members`}
                        />
                    </Card>
                </Col>
            </Row>

            <Card title="Expense Records" extra={
                <Space wrap>
                    <RangePicker
                        defaultValue={dateRange}
                        onChange={(dates) => setDateRange(dates)}
                    />
                    <Input
                        placeholder="Search details or names"
                        prefix={<SearchOutlined />}
                        onChange={e => setSearchText(e.target.value)}
                        style={{ width: 250 }}
                    />
                    <Button
                        type="primary"
                        icon={<DownloadOutlined />}
                        onClick={exportToExcel}
                    >
                        Export to Excel
                    </Button>
                </Space>
            }>
                <Table
                    columns={columns}
                    dataSource={filteredData}
                    rowKey="id"
                    pagination={{ pageSize: 10 }}
                />
            </Card>
        </Space>
    );
};

export default Dashboard;
