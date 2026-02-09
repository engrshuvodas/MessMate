import React, { useContext } from 'react';
import { Form, Input, InputNumber, DatePicker, Select, Button, Card, Typography, notification } from 'antd';
import { SaveOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import dayjs from 'dayjs';

const { Title } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const AddExpense = () => {
    const { members, addExpense } = useContext(AppContext);
    const [form] = Form.useForm();
    const navigate = useNavigate();

    const onFinish = async (values) => {
        try {
            const formattedExpense = {
                ...values,
                date: values.date.format('YYYY-MM-DD'),
            };

            await addExpense(formattedExpense);

            notification.success({
                message: 'Success',
                description: 'New expense has been added successfully.',
            });

            form.resetFields();
            navigate('/');
        } catch (error) {
            notification.error({
                message: 'Error',
                description: 'Failed to add expense. Please try again.',
            });
        }
    };

    return (
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
            <Button
                icon={<ArrowLeftOutlined />}
                onClick={() => navigate('/')}
                style={{ marginBottom: 16 }}
            >
                Back to Dashboard
            </Button>
            <Card title={<Title level={3}>Add Monthly Bajar/Expense</Title>}>
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={onFinish}
                    initialValues={{
                        date: dayjs(),
                    }}
                >
                    <Form.Item
                        name="date"
                        label="Date"
                        rules={[{ required: true, message: 'Please select a date' }]}
                    >
                        <DatePicker style={{ width: '100%' }} />
                    </Form.Item>

                    <Form.Item
                        name="details"
                        label="Bajar Details (Items list)"
                        rules={[{ required: true, message: 'Please enter details' }]}
                    >
                        <TextArea rows={4} placeholder="e.g. Rice 10kg, Chicken 2kg, Eggs 1 dozen..." />
                    </Form.Item>

                    <Form.Item
                        name="cost"
                        label="Costing (Total Amount in ৳)"
                        rules={[
                            { required: true, message: 'Please enter the amount' },
                            { type: 'number', min: 1, message: 'Cost must be at least 1' }
                        ]}
                    >
                        <InputNumber
                            style={{ width: '100%' }}
                            formatter={value => `৳ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                            parser={value => value.replace(/৳\s?|(,*)/g, '')}
                        />
                    </Form.Item>

                    <Form.Item
                        name="addedBy"
                        label="Added By (Member/Members who paid)"
                        rules={[{ required: true, message: 'Select at least one member' }]}
                    >
                        <Select mode="multiple" placeholder="Select members" style={{ width: '100%' }}>
                            {members.map(member => (
                                <Option key={member.id} value={member.name}>{member.name}</Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit" icon={<SaveOutlined />} size="large" block>
                            Submit Expense
                        </Button>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
};

export default AddExpense;
