import React, { useContext, useState } from 'react';
import { Layout, Menu, Button, theme, Space, Typography, Popconfirm, Avatar, Dropdown } from 'antd';
import {
    DashboardOutlined,
    PlusCircleOutlined,
    TeamOutlined,
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    DollarOutlined,
    LogoutOutlined,
    UserOutlined,
    BellOutlined,
    SettingOutlined,
    UnorderedListOutlined
} from '@ant-design/icons';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import dayjs from 'dayjs';
import { AppContext } from '../context/AppContext';

const { Header, Sider, Content, Footer } = Layout;
const { Title, Text } = Typography;

const AppLayout = () => {
    const [collapsed, setCollapsed] = useState(false);
    const { logout, resolvedTheme } = useContext(AppContext);
    const navigate = useNavigate();
    const location = useLocation();
    const {
        token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const menuItems = [
        {
            key: '/',
            icon: <DashboardOutlined style={{ fontSize: 18 }} />,
            label: 'Dashboard',
        },
        {
            key: '/add-expense',
            icon: <PlusCircleOutlined style={{ fontSize: 18 }} />,
            label: 'Add Bajar',
        },
        {
            key: '/bajar-records',
            icon: <UnorderedListOutlined style={{ fontSize: 18 }} />,
            label: 'Bajar Records',
        },
        {
            key: '/members',
            icon: <TeamOutlined style={{ fontSize: 18 }} />,
            label: 'Mess Members',
        },
        {
            key: '/settings',
            icon: <SettingOutlined style={{ fontSize: 18 }} />,
            label: 'Settings',
        },
    ];

    const profileItems = [
        {
            key: '1',
            label: 'My Profile',
            icon: <UserOutlined />,
        },
        {
            key: '2',
            label: 'Settings',
            icon: <SettingOutlined />,
            onClick: () => navigate('/settings'),
        },
        {
            type: 'divider',
        },
        {
            key: '3',
            label: 'Logout',
            icon: <LogoutOutlined />,
            danger: true,
            onClick: handleLogout,
        },
    ];

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Sider
                trigger={null}
                collapsible
                collapsed={collapsed}
                theme={resolvedTheme === 'dark' ? 'dark' : 'light'}
                width={260}
                className="main-sider"
            >
                <div className="logo">
                    {collapsed ? 'PG' : 'PaiseGone 💸'}
                </div>
                <Menu
                    mode="inline"
                    theme={resolvedTheme === 'dark' ? 'dark' : 'light'}
                    selectedKeys={[location.pathname]}
                    items={menuItems}
                    onClick={({ key }) => navigate(key)}
                    style={{ borderRight: 0, marginTop: 10 }}
                />
            </Sider>

            <Layout>
                <Header className="premium-header">
                    <div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                        <Button
                            type="text"
                            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                            onClick={() => setCollapsed(!collapsed)}
                            style={{ fontSize: '18px', width: 48, height: 48, marginRight: 16 }}
                        />
                        <Title level={4} style={{ margin: 0, display: collapsed ? 'none' : 'block', fontSize: 18 }}>
                            Mess Manager
                        </Title>
                    </div>

                    <Space size="large" style={{ paddingRight: 24 }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            background: 'rgba(255, 95, 109, 0.05)',
                            padding: '6px 16px',
                            borderRadius: '20px'
                        }}>
                            <SettingOutlined style={{ color: '#ff5f6d', fontSize: 16 }} />
                            <span style={{ fontWeight: 600, color: '#ff5f6d', fontSize: 13 }}>{dayjs().format('MMMM, YYYY')}</span>
                        </div>

                        <div style={{ display: 'flex', gap: '8px' }}>
                            <Button
                                type="text"
                                icon={resolvedTheme === 'dark' ? <Badge dot color="yellow"><SettingOutlined /></Badge> : <SettingOutlined />}
                                onClick={() => navigate('/settings')}
                            />
                            <Button type="text" icon={<BellOutlined />} style={{ fontSize: 18 }} />
                        </div>

                        <Dropdown menu={{ items: profileItems }} placement="bottomRight" arrow={{ pointAtCenter: true }}>
                            <div style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10 }}>
                                <Avatar size="medium" icon={<UserOutlined />} style={{ background: 'var(--primary-gradient)', boxShadow: '0 4px 10px rgba(255, 95, 109, 0.2)' }} />
                                <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2 }}>
                                    <Text strong style={{ fontSize: 13 }}>Shuvo Das</Text>
                                    <Text type="secondary" style={{ fontSize: 11 }}>Mess Manager</Text>
                                </div>
                            </div>
                        </Dropdown>
                    </Space>
                </Header>

                <Content
                    style={{
                        margin: '24px',
                        padding: '0',
                        minHeight: 280,
                        overflowX: 'hidden'
                    }}
                >
                    <Outlet />
                </Content>

                <Footer style={{ textAlign: 'center', background: 'transparent', color: '#bfbfbf', padding: '24px 50px' }}>
                    PaiseGone Expense Tracker ©{new Date().getFullYear()} • By <a href="https://github.com/engrshuvodas/" target="_blank" rel="noopener noreferrer" style={{ color: '#ff5f6d', fontWeight: 600 }}>Engr Shuvo</a>
                </Footer>
            </Layout>
        </Layout>
    );
};

export default AppLayout;
