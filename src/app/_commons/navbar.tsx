"use client"

import React, { useEffect, useState } from 'react';
import { Menu, Badge, Button, Avatar, Row, Col, Modal, Form, Input, MenuProps, Drawer, Checkbox, Card, InputNumber } from 'antd';
import { ShoppingCartOutlined, UserOutlined, LoginOutlined, CopyrightCircleOutlined, SearchOutlined, BarsOutlined } from '@ant-design/icons';
import axios from 'axios';
import Notiflix from 'notiflix';
import { privateService, publicService } from '../_services/_service';
import Meta from 'antd/es/card/Meta';

const { SubMenu } = Menu;



const Navbar = ({ handleSearch, handleCartDrawerVisible, handleHistoryDrawerVisible }: { handleSearch: any, handleCartDrawerVisible: any, handleHistoryDrawerVisible: any }) => {

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isRegisterModalVisible, setIsRegisterModalVisible] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [balance, setBalance] = useState<any>(null);

  const handleSignInClick = () => {
    setIsModalVisible(true);
  };

  const handleRegisterClick = () => {
    setIsModalVisible(false);
    setIsRegisterModalVisible(true);
  }

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const handleRegisterCancel = () => {
    setIsRegisterModalVisible(false);
  }

  const onFinish = async (values: any) => {
    console.log('Received values:', values);
    publicService.post('/auth/login', values).then(response => {
      if (response && response.data && response.data.access_token) {
        localStorage.setItem('token', response.data.access_token);
        Notiflix.Notify.success("Login successful");
        setTimeout(() => {
          window.location.reload();
        })
      }
    })
      .catch(err => {
        Notiflix.Notify.failure("Invalid username or password");
      })


    // Handle login logic here
  };

  const onRegisterFinish = (values: any) => {
    console.log('Received values:', values);

    publicService.post('/auth/register', values).then(response => {
      Notiflix.Notify.success("Register successful");
      setIsRegisterModalVisible(false);
    }).catch(err => {
      Notiflix.Notify.failure(err.response.data.message);
    })
    // Handle login logic here
  };


  const authMenu: MenuProps['items'] = [
    {
      key: 'cart',
      label: 'Cart',
      icon: <ShoppingCartOutlined />,
      style: { color: '#fff' },
      onClick: handleCartDrawerVisible
    },
    {
      key: 'profile',
      label: `${profile?.firstName || "Profile"}`,
      icon: <UserOutlined />,
      style: { color: '#fff' },
      children: [
        {
          key: 'balance',
          label: `${balance?.balance || 0} Point`,
          icon: <CopyrightCircleOutlined twoToneColor='#eb2f96' />,
          style: { color: '#fff' },

        },
        {
          key: 'orderHistories',
          label: 'Order Histories',
          icon: <BarsOutlined />,
          style: { color: '#fff' },
          onClick: handleHistoryDrawerVisible
        },
        {
          key: 'logout',
          label: 'Logout',
          icon: <LoginOutlined />,
          style: { color: '#fff' },
          onClick: () => {
            localStorage.removeItem('token');
            window.location.reload();
          }
        },
      ]

    }
  ]

  const publicMenu: MenuProps['items'] = [
    {
      key: 'sigin',
      label: 'Sign in',
      icon: <LoginOutlined />,
      onClick: handleSignInClick,
      style: { color: '#fff' },
    },
  ]

  const isAuthenticated = () => (typeof (window) !== 'undefined') && window?.localStorage?.getItem('token') ? true : false;

  const fetchProfile = async () => {
    privateService.get("/auth/me").then((res) => {
      setProfile(res.data)
    })
  }

  const fetchBalance = async () => {
    privateService.get("/balance").then((res) => {
      setBalance(res.data)
    })
  }

  useEffect(() => {
    if (isAuthenticated()) {
      fetchProfile()
      fetchBalance()
    }
  }, [])

  return (
    <>
      <Row justify="end" style={{ alignContent: 'center', backgroundColor: '#001529', padding: '0 20px', position: 'sticky', top: 0, zIndex: 5 }}>
        <Col flex={'auto'}>
          <Menu mode="horizontal" style={{ backgroundColor: '#001529' }} selectedKeys={[]}>
            <Menu.Item key="title" disabled style={{ pointerEvents: 'none' }}>
              <span style={{ fontSize: '1.2em', fontWeight: 'bold', color: '#fff' }}>Book Store</span>
            </Menu.Item>
          </Menu>
        </Col>
        <Col>
          <Input
            style={{ marginTop: '0.5rem' }}
            placeholder="Search books..."
            prefix={<SearchOutlined />}
            onChange={handleSearch}
          />
        </Col>
        <Col span={3} style={{ justifyContent: "end" }}>
          <Menu theme='dark' mode="horizontal" items={
            isAuthenticated() ? authMenu : publicMenu
          } />
        </Col>
      </Row>
      <Modal
        title="Sign In"
        visible={isModalVisible}
        onCancel={handleCancel}
        footer={null}
      >
        <Form
          name="loginForm"
          initialValues={{ remember: true }}
          onFinish={onFinish}
        >
          <Form.Item
            label="Email"
            name="email"
            rules={[{ type: 'email', required: true, message: 'Please input your email!' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Password"
            name="password"
            rules={[{ required: true, message: 'Please input your password!' }]}
          >
            <Input.Password />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit">
              Sign In
            </Button>
          </Form.Item>
          <span>Does not have any account register <a href='#' onClick={handleRegisterClick}>here</a></span>
        </Form>

      </Modal>
      <Modal
        title="Register"
        visible={isRegisterModalVisible}
        onCancel={handleRegisterCancel}
        footer={null}
      >
        <Form
          name="registerForm"
          initialValues={{ remember: true }}
          onFinish={onRegisterFinish}
        >
          <Form.Item
            label="First Name"
            name="firstName"
            rules={[{ required: true, message: 'Please input your first name!' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Last Name"
            name="lastName"
            rules={[{ required: true, message: 'Please input your last name!' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Email"
            name="email"
            rules={[{ required: true, type: 'email', message: 'Please input a valid email!' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Password"
            name="password"
            rules={[{ required: true, message: 'Please input your password!' }]}
          >
            <Input.Password />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit">
              Register
            </Button>
          </Form.Item>
        </Form>
      </Modal>

    </>
  );
};

export default Navbar;
