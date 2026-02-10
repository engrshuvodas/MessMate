/** Software Version: 2.2 | Dev: Engr Shuvo Das **/
import React, { useContext, useMemo, useState } from 'react';
import { Card, Table, Typography, Space, Button, Tag, Row, Col, Divider, Modal, Tooltip, Badge, Avatar } from 'antd';
import {
    TransactionOutlined,
    WhatsAppOutlined,
    SendOutlined,
    InfoCircleOutlined,
    UserOutlined,
    ArrowUpOutlined,
    ArrowDownOutlined,
    CheckCircleFilled,
    ClockCircleOutlined
} from '@ant-design/icons';
import { AppContext } from '../context/AppContext';
import dayjs from 'dayjs';

const { Title, Text, Paragraph } = Typography;

const SettlementSummary = () => {
    const { expenses, members, settings } = useContext(AppContext);
    const [previewModal, setPreviewModal] = useState({ visible: false, member: null, message: '' });

    const currency = settings?.currency || '₹';

    // Calculate settlement data (similar to Dashboard but more detailed)
    const totalExpense = useMemo(() => {
        return expenses.reduce((sum, item) => sum + (item.cost || 0), 0);
    }, [expenses]);

    const perPersonShare = useMemo(() => {
        return members.length > 0 ? (totalExpense / members.length) : 0;
    }, [totalExpense, members.length]);

    const settlementData = useMemo(() => {
        return members.map(member => {
            const totalPaidByThisMember = expenses.reduce((sum, item) => {
                const contribution = (item.paidBy || {})[member.id] || 0;
                return sum + contribution;
            }, 0);

            const balance = totalPaidByThisMember - perPersonShare;
            return {
                id: member.id,
                name: member.name,
                phone: member.phone || '',
                paid: totalPaidByThisMember,
                shouldPay: perPersonShare,
                balance: balance
            };
        });
    }, [members, expenses, perPersonShare]);

    const generateWhatsAppMessage = (member) => {
        const monthName = dayjs().format('MMMM, YYYY');
        const status = member.balance >= 0 ? 'Receivable (Extra Paid)' : 'Payable (Due Amount)';
        const amountDisplay = `${currency}${Math.abs(member.balance).toFixed(2)}`;

        let message = `*📊 MESS SETTLEMENT NOTICE — ${monthName.toUpperCase()}*\n\n`;
        message += `Hello Brother *${member.name}*,\n`;
        message += `Here is your summary for the current month:\n\n`;
        message += `• Total Mess Expense: ${currency}${totalExpense.toLocaleString()}\n`;
        message += `• Per Person Share: ${currency}${perPersonShare.toLocaleString()}\n`;
        message += `• You have Paid: ${currency}${member.paid.toLocaleString()}\n`;
        message += `----------------------------\n`;
        message += `*STATUS: ${status}*\n`;
        message += `*AMOUNT: ${amountDisplay}*\n`;
        message += `----------------------------\n\n`;

        if (member.balance < 0) {
            message += `_Please settle your dues at your earliest convenience to maintain the mess flow._\n\n`;
        } else if (member.balance > 0) {
            message += `_Thank you for your extra contribution! You will receive this amount during settlement._\n\n`;
        }

        message += `Best Regards,\n*Mess Manager (PaiseGone v2.2)*`;

        return message;
    };

    const handleSendWhatsApp = (member) => {
        const message = generateWhatsAppMessage(member);
        const encodedMessage = encodeURIComponent(message);
        const phone = member.phone.replace(/[^0-9]/g, ''); // Clean phone number

        if (!phone) {
            Modal.error({
                title: 'Missing Phone Number',
                content: 'Please add a WhatsApp number for this member in the "Mess Members" section first.',
            });
            return;
        }

        const whatsappUrl = `https://wa.me/${phone}?text=${encodedMessage}`;
        window.open(whatsappUrl, '_blank');
    };

    const columns = [
        {
            title: 'Member',
            key: 'member',
            render: (_, record) => (
                <Space>
                    <Avatar
                        src={record.name.toLowerCase().includes('shuvo') ? "/engr_shuvo.jpg" : undefined}
                        icon={<UserOutlined />}
                        className="secondary-avatar"
                    />
                    <div>
                        <Text strong>{record.name}</Text><br />
                        <Text type="secondary" style={{ fontSize: 11 }}>{record.phone || 'No Phone'}</Text>
                    </div>
                </Space>
            )
        },
        {
            title: 'Paid',
            dataIndex: 'paid',
            key: 'paid',
            render: (paid) => <Text>{currency}{paid.toLocaleString()}</Text>
        },
        {
            title: 'Share',
            dataIndex: 'shouldPay',
            key: 'shouldPay',
            render: (share) => <Text type="secondary">{currency}{share.toLocaleString()}</Text>
        },
        {
            title: 'Status',
            key: 'status',
            align: 'center',
            render: (_, record) => {
                const isDue = record.balance < -0.01;
                return (
                    <Tag color={isDue ? 'red' : 'green'} style={{ borderRadius: 6, border: 'none', padding: '2px 10px' }}>
                        {isDue ? <ArrowDownOutlined /> : <ArrowUpOutlined />}
                        {isDue ? ' PAYABLE' : ' RECEIVABLE'}
                    </Tag>
                );
            }
        },
        {
            title: 'Net Balance',
            key: 'balance',
            align: 'right',
            render: (_, record) => (
                <Text strong style={{ color: record.balance < 0 ? '#ff4d4f' : '#52c41a', fontSize: 16 }}>
                    {record.balance < 0 ? '-' : '+'}{currency}{Math.abs(record.balance).toLocaleString()}
                </Text>
            )
        },
        {
            title: 'Action',
            key: 'action',
            align: 'right',
            render: (_, record) => (
                <Space>
                    <Tooltip title="Preview Message">
                        <Button
                            shape="circle"
                            icon={<InfoCircleOutlined />}
                            onClick={() => setPreviewModal({
                                visible: true,
                                member: record,
                                message: generateWhatsAppMessage(record)
                            })}
                        />
                    </Tooltip>
                    <Button
                        type="primary"
                        icon={<WhatsAppOutlined />}
                        onClick={() => handleSendWhatsApp(record)}
                        style={{ background: '#25D366', borderColor: '#25D366' }}
                    >
                        Send Notice
                    </Button>
                </Space>
            )
        }
    ];

    return (
        <div className="fade-in-up">
            <Row gutter={[24, 24]} align="middle" style={{ marginBottom: 24 }}>
                <Col xs={24} md={12}>
                    <Space size="middle">
                        <div style={{ background: '#25D366', padding: 10, borderRadius: 12, display: 'flex' }}>
                            <WhatsAppOutlined style={{ color: 'white', fontSize: 20 }} />
                        </div>
                        <div>
                            <Title level={3} style={{ margin: 0 }}>Settlement Summary</Title>
                            <Text type="secondary">Personalized WhatsApp updates for all members</Text>
                        </div>
                    </Space>
                </Col>
                <Col xs={24} md={12} style={{ textAlign: 'right' }}>
                    <Badge count="Automation Ready" color="#25D366">
                        <Tag icon={<ClockCircleOutlined />} color="processing" style={{ padding: '4px 12px', borderRadius: 8 }}>
                            Last Sync: {dayjs().format('HH:mm A')}
                        </Tag>
                    </Badge>
                </Col>
            </Row>

            <Card className="premium-card">
                <Table
                    columns={columns}
                    dataSource={settlementData}
                    rowKey="id"
                    pagination={false}
                    className="settlement-table"
                />
            </Card>

            <Modal
                title={
                    <Space>
                        <WhatsAppOutlined style={{ color: '#25D366' }} />
                        <span>Message Preview — {previewModal.member?.name}</span>
                    </Space>
                }
                open={previewModal.visible}
                onCancel={() => setPreviewModal({ ...previewModal, visible: false })}
                footer={[
                    <Button key="back" onClick={() => setPreviewModal({ ...previewModal, visible: false })}>
                        Cancel
                    </Button>,
                    <Button
                        key="submit"
                        type="primary"
                        icon={<SendOutlined />}
                        style={{ background: '#25D366', borderColor: '#25D366' }}
                        onClick={() => {
                            handleSendWhatsApp(previewModal.member);
                            setPreviewModal({ ...previewModal, visible: false });
                        }}
                    >
                        Send Now
                    </Button>,
                ]}
                width={500}
                centered
            >
                <div className="whatsapp-preview-bg" style={{
                    padding: '20px',
                    borderRadius: '12px'
                }}>
                    <div className="whatsapp-bubble" style={{
                        padding: '15px',
                        borderRadius: '8px',
                        position: 'relative'
                    }}>
                        <pre style={{
                            whiteSpace: 'pre-wrap',
                            wordWrap: 'break-word',
                            fontFamily: 'inherit',
                            margin: 0,
                            fontSize: '14px'
                        }}>
                            {previewModal.message}
                        </pre>
                        <div style={{ textAlign: 'right', marginTop: 5, fontSize: 10, color: 'rgba(0,0,0,0.45)' }}>
                            {dayjs().format('HH:mm A')} <CheckCircleFilled style={{ color: '#4fc3f7', marginLeft: 4 }} />
                        </div>
                    </div>
                </div>
                <Paragraph style={{ marginTop: 16 }}>
                    <InfoCircleOutlined style={{ color: '#1890ff', marginRight: 8 }} />
                    <Text type="secondary">Clicking "Send Now" will open WhatsApp with this message pre-filled.</Text>
                </Paragraph>
            </Modal>
        </div>
    );
};

export default SettlementSummary;
