import React, { useContext, useState, useEffect } from 'react';
import { Form, Input, InputNumber, DatePicker, Button, Card, Typography, notification, Row, Col, Space, Divider, Alert } from 'antd';
import { SaveOutlined, ArrowLeftOutlined, ShoppingCartOutlined, WalletOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import dayjs from 'dayjs';

const { Title, Paragraph, Text } = Typography;
const { TextArea } = Input;

const AddExpense = () => {
    const { members, addExpense } = useContext(AppContext);
    const [form] = Form.useForm();
    const navigate = useNavigate();
    const [totalEntered, setTotalEntered] = useState(0);
    const totalCost = Form.useWatch('cost', form) || 0;

    // Real-time calculation of total contributions
    const contributions = Form.useWatch('contributions', form) || {};

    useEffect(() => {
        const sum = Object.values(contributions).reduce((a, b) => (a || 0) + (b || 0), 0);
        setTotalEntered(sum);
        // Automatically sync the main Cost field with the sum of contributions
        form.setFieldsValue({ cost: sum });
    }, [contributions, form]);

    const onFinish = async (values) => {
        // Validate sum
        if (Math.abs(totalEntered - values.cost) > 0.1) {
            notification.error({
                message: 'Validation Error',
                description: `Total contributions (৳${totalEntered}) must exactly equal the Total Costing (৳${values.cost}).`,
            });
            return;
        }

        // Check if at least one person paid
        if (totalEntered === 0) {
            notification.error({
                message: 'Validation Error',
                description: 'At least one member must have a contribution greater than 0.',
            });
            return;
        }

        try {
            // Clean up the contributions object (remove zeros/nulls)
            const paidBy = {};
            Object.entries(values.contributions || {}).forEach(([memberId, amount]) => {
                if (amount && amount > 0) {
                    paidBy[memberId] = amount;
                }
            });

            const formattedExpense = {
                date: values.date.format('YYYY-MM-DD'),
                details: values.details,
                cost: values.cost,
                paidBy: paidBy,
            };

            await addExpense(formattedExpense);

            notification.success({
                message: 'Expense Added',
                description: 'Record saved successfully with individual contributions.',
            });

            form.resetFields();
            navigate('/');
        } catch (error) {
            notification.error({
                message: 'Error',
                description: 'Could not save record. Please check fields.',
            });
        }
    };

    const isMatched = Math.abs(totalEntered - totalCost) < 0.1 && totalCost > 0;

    return (
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
            <Button
                type="link"
                icon={<ArrowLeftOutlined />}
                onClick={() => navigate('/')}
                style={{ marginBottom: 16, paddingLeft: 0 }}
            >
                Back to Dashboard
            </Button>

            <Card
                bordered={false}
                className="shadow-sm"
                title={
                    <Space>
                        <ShoppingCartOutlined style={{ color: '#1890ff' }} />
                        <span style={{ fontSize: '20px' }}>Add Bajar Expense</span>
                    </Space>
                }
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={onFinish}
                    initialValues={{
                        date: dayjs(),
                        cost: 0,
                        contributions: {}
                    }}
                    size="large"
                >
                    <Row gutter={24}>
                        <Col xs={24} md={12}>
                            <Form.Item
                                name="date"
                                label="Date of Purchase"
                                rules={[{ required: true, message: 'Select date' }]}
                            >
                                <DatePicker style={{ width: '100%' }} />
                            </Form.Item>

                            <Form.Item
                                name="cost"
                                label="Total Costing (৳)"
                                rules={[
                                    { required: true, message: 'Enter total cost' },
                                    { type: 'number', min: 1, message: 'Cost must be at least 1' }
                                ]}
                            >
                                <InputNumber
                                    style={{ width: '100%' }}
                                    placeholder="Total amount (Auto-calculated)"
                                    readOnly
                                    disabled
                                    formatter={value => `৳ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                    parser={value => value.replace(/৳\s?|(,*)/g, '')}
                                />
                            </Form.Item>

                            <Form.Item
                                name="details"
                                label="Bajar Details"
                                rules={[{ required: true, message: 'Please describe the items' }]}
                            >
                                <TextArea rows={4} placeholder="e.g. Rice, Chicken, Eggs..." />
                            </Form.Item>
                        </Col>

                        <Col xs={24} md={12}>
                            <div style={{ background: '#f9f9f9', padding: '16px', borderRadius: '12px', border: '1px solid #f0f0f0' }}>
                                <Title level={5} style={{ marginTop: 0 }}>
                                    <WalletOutlined /> Individual Contributions
                                </Title>
                                <Text type="secondary" style={{ fontSize: '13px', display: 'block', marginBottom: '16px' }}>
                                    Enter how much each member actually paid. Leave blank if 0.
                                </Text>

                                <div style={{ maxHeight: '300px', overflowY: 'auto', paddingRight: '8px' }}>
                                    {members.map(member => (
                                        <Form.Item
                                            key={member.id}
                                            name={['contributions', member.id]}
                                            label={<Text strong>{member.name}</Text>}
                                            style={{ marginBottom: '12px' }}
                                        >
                                            <InputNumber
                                                style={{ width: '100%' }}
                                                placeholder="৳ Amount"
                                                min={0}
                                                formatter={value => `৳ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                                parser={value => value.replace(/৳\s?|(,*)/g, '')}
                                            />
                                        </Form.Item>
                                    ))}
                                </div>

                                <Divider style={{ margin: '16px 0' }} />

                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Text strong>Total Entered:</Text>
                                    <Title level={4} style={{ margin: 0, color: isMatched ? '#52c41a' : '#ff4d4f' }}>
                                        ৳{totalEntered.toLocaleString()}
                                    </Title>
                                </div>

                                {!isMatched && totalCost > 0 && (
                                    <Alert
                                        message={`Sum must equal ৳${totalCost}`}
                                        type="warning"
                                        showIcon
                                        style={{ marginTop: '12px', padding: '8px' }}
                                    />
                                )}

                                {isMatched && (
                                    <Text type="success" style={{ display: 'block', marginTop: '12px', textAlign: 'center' }}>
                                        <CheckCircleOutlined /> Amounts match perfectly!
                                    </Text>
                                )}
                            </div>
                        </Col>
                    </Row>

                    <Form.Item style={{ marginTop: '24px', marginBottom: 0 }}>
                        <Button
                            type="primary"
                            htmlType="submit"
                            icon={<SaveOutlined />}
                            size="large"
                            block
                            disabled={!isMatched}
                        >
                            Save Bajar Record
                        </Button>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
};

export default AddExpense;
