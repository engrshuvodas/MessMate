import React, { useContext, useState } from 'react';
import { Table, Button, Card, Modal, Form, Input, Space, Typography, notification, Popconfirm } from 'antd';
import { UserAddOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { AppContext } from '../context/AppContext';

const { Title } = Typography;

const ManageMembers = () => {
    const { members, addMember, updateMember, deleteMember } = useContext(AppContext);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingMember, setEditingMember] = useState(null);
    const [form] = Form.useForm();

    const handleAdd = () => {
        setEditingMember(null);
        form.resetFields();
        setIsModalOpen(true);
    };

    const handleEdit = (record) => {
        setEditingMember(record);
        form.setFieldsValue({ name: record.name });
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        await deleteMember(id);
        notification.success({ message: 'Member deleted' });
    };

    const handleOk = async () => {
        try {
            const values = await form.validateFields();
            if (editingMember) {
                await updateMember(editingMember.id, values.name);
                notification.success({ message: 'Member updated' });
            } else {
                await addMember(values.name);
                notification.success({ message: 'Member added' });
            }
            setIsModalOpen(false);
            form.resetFields();
        } catch (error) {
            console.log('Validation failed:', error);
        }
    };

    const columns = [
        {
            title: 'No.',
            key: 'index',
            render: (text, record, index) => index + 1,
            width: 70,
        },
        {
            title: 'Member Name',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Actions',
            key: 'action',
            width: 200,
            render: (_, record) => (
                <Space size="middle">
                    <Button
                        icon={<EditOutlined />}
                        onClick={() => handleEdit(record)}
                    >
                        Edit
                    </Button>
                    <Popconfirm
                        title="Delete member?"
                        description="Are you sure to delete this member? Calculations will be updated."
                        onConfirm={() => handleDelete(record.id)}
                        okText="Yes"
                        cancelText="No"
                    >
                        <Button
                            danger
                            icon={<DeleteOutlined />}
                        >
                            Delete
                        </Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <Card
            title={<Title level={3}>Manage Mess Members</Title>}
            extra={
                <Button
                    type="primary"
                    icon={<UserAddOutlined />}
                    onClick={handleAdd}
                >
                    Add New Member
                </Button>
            }
        >
            <Table
                columns={columns}
                dataSource={members}
                rowKey="id"
                pagination={false}
            />

            <Modal
                title={editingMember ? "Edit Member" : "Add New Member"}
                open={isModalOpen}
                onOk={handleOk}
                onCancel={() => setIsModalOpen(false)}
                okText={editingMember ? "Update" : "Add"}
            >
                <Form form={form} layout="vertical">
                    <Form.Item
                        name="name"
                        label="Full Name"
                        rules={[{ required: true, message: 'Please enter member name' }]}
                    >
                        <Input placeholder="Enter member name" />
                    </Form.Item>
                </Form>
            </Modal>
        </Card>
    );
};

export default ManageMembers;
