"use client"

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, Row, Col, Badge, Typography, Button, Modal, InputNumber, Drawer, Checkbox, List, Divider } from 'antd';
import { ShoppingCartOutlined } from '@ant-design/icons';
import InfiniteScroll from 'react-infinite-scroll-component';
import styles from './books.module.css';
import Navbar from './_commons/navbar';
import { privateService, publicService } from './_services/_service';
import Notiflix from 'notiflix';

const { Meta } = Card;

interface Book {
  id: number;
  title: string;
  writer: string;
  coverImg: string;
  point: number;
  tags: string[];
}

const Books = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [haseMore, setHasMore] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [quantity, setQuantity] = useState(0);
  const [isCartDrawerVisible, setIsCartDrawerVisible] = useState(false);
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [orderItems, setOrderItems] = useState<any[]>([]);
  const [isOrdersDrawerVisible, setIsOrdersDrawerVisible] = useState(false);

  const handleHisotryDrawerVisible = async () => {
    await fetchOrder()
    setIsOrdersDrawerVisible(true);
  }

  const handleHistoryDrawerClose = () => {
    setIsOrdersDrawerVisible(false);
  }

  const fetchOrder = () => {
    privateService.get('/order').then(response => {
      if (response && response.data) {
        setOrderItems(response.data);
      }
    })
  }


  const handleCartDrawerVisible = async () => {
    await fetchUserCart()
    setIsCartDrawerVisible(true);
  }

  const handleCartDrawerClose = () => {
    setIsCartDrawerVisible(false);
  }


  const fetchUserCart = async () => {
    privateService.get('/cart').then(response => {
      if (response && response.data) {
        setCartItems(response.data.map((item: any) => {
          return { ...item, selected: false }
        }))
      }
    })
  }

  const setSelectedItem = (itemId: string) => [
    setCartItems((prev) => prev.map((item) => {
      if (item.id === itemId) {
        return { ...item, selected: !item.selected };
      }
      return item;
    })),
  ]


  const handleQuantityChange = (q: number, id: string) => {
    if (q > 0) {
      setCartItems((prev) => prev.map((item) => {
        if (item.id === id) {
          return { ...item, quantity: q, totalAmount: q * item.book.point };
        }
        return item;
      }));
      updateCartItem(id, q);
    }
  }


  const updateCartItem = async (id: string, quantity: number) => {
    await privateService.put(`/cart/${id}`, { quantity, id })
  }

  const handleCheckout = () => {
    const items = cartItems.filter((item) => item.selected).map((item) => item.id)
    if (items.length > 0) {
      privateService.post("order/checkout", { items: cartItems.filter((item) => item.selected).map((item) => item.id) }).then(response => {
        if (response.data) {
          Notiflix.Notify.success("Checkout successful");
          handleCartDrawerClose();
        }
      }).catch(err => {
        Notiflix.Notify.failure(err.response.data.message);
      })
    }

  }

  async function fetchBooks(page: number = 1, search = '') {
    try {
      const response = await publicService.get(`/book?limit=20&page=${page}&search=${search}`);
      if (page == 1) {
        setBooks(response.data);
      } else {
        setBooks((prev) => [...prev, ...response.data]);
      }
    } catch (error) {
      console.error('Error fetching books:', error);
    }
  }
  useEffect(() => {
    fetchBooks();
  }, []);

  const handleSearch = (event: any) => {
    // if (event.target.value && event.target.value.lenght > 3) {
    console.log("handle search", event.target.value)
    setSearch(event.target.value);
    fetchBooks(1, event.target.value)
    // }
  }

  const handleModal = () => {
    console.log(" Adads")
    setIsModalVisible(true);
  }

  const handleModalCancel = () => {
    setIsModalVisible(false);
  }

  const handleAddCart = () => {
    if (quantity > 0) {
      privateService.post("cart", {
        bookId: selectedBook?.id,
        quantity: quantity
      }).then(response => {
        if (response.data) {
          Notiflix.Notify.success("Add cart successful");
          setSelectedBook(null);
          setQuantity(0);
          setIsModalVisible(false);
        }
      }).catch(err => {
        Notiflix.Notify.failure(err.response.data.message);
      })

    }
  }

  const handleCancelOrder = async (id: string) => {
    await privateService.put(`/order/cancel/${id}`, { canceled: true })
    fetchOrder()
  }

  const isAuthenticated = () => (typeof (window) !== 'undefined') && window?.localStorage?.getItem('token') ? true : false;

  return (
    <div >
      <Navbar handleSearch={handleSearch} handleCartDrawerVisible={handleCartDrawerVisible} handleHistoryDrawerVisible={handleHisotryDrawerVisible} />
      <InfiniteScroll
        dataLength={books.length}
        next={() => {
          try {
            fetchBooks(currentPage + 1, search ?? '');
            setCurrentPage(currentPage + 1);
          } catch (error) {
            console.error('Error fetching books:', error);
            setHasMore(false);
          }

        }}
        hasMore={haseMore}
        loader={<></>}
      >
        <Row gutter={[16, 16]} style={{ marginTop: '1rem' }}>
          {books.map((book, index) => (
            <Col key={index} xs={24} sm={12} md={8} lg={4}>
              <Card
                hoverable
                cover={<img alt={`${book.id}`} style={{ height: '30rem' }} src={book.coverImg} className={styles.cardImage} />}
              >
                <div className={styles.cardContent} >
                  <Meta title={book.title} description={book.writer} />
                  <Badge style={{ color: "black", marginTop: '0.5rem', marginBottom: '0.5rem' }} color='yellow' count={book.point + " Point"} />
                  <div style={{ paddingBottom: '1rem' }}>
                    {book?.tags?.map((tag: string, index: number) => <Badge color='blue' count={tag} key={index} />)}
                  </div>
                  <Button size='large' type='default' onClick={() => {
                    if (selectedBook?.id != book.id) {
                      setQuantity(0);
                    }
                    setSelectedBook(book);
                    handleModal();
                  }} icon={<ShoppingCartOutlined />} />
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      </InfiniteScroll>
      <Modal
        title="Add to Cart"
        visible={isModalVisible}
        onCancel={handleModalCancel}
        footer={[
          <Button key="cancel" onClick={handleModalCancel}>Cancel</Button>,
          <Button key="submit" type="primary" onClick={() => {
            handleAddCart()
          }}>Add to Cart</Button>
        ]}
      >
        {selectedBook && (
          <div>
            <p>Title: {selectedBook.title}</p>
            <p>Author: {selectedBook.writer}</p>
            <p>Price: {selectedBook.point}</p>
            <p>Quantity:</p>
            <InputNumber value={quantity} min={1} defaultValue={1} onChange={(value) => {
              setQuantity(value ?? 0)
            }} />
          </div>
        )}
      </Modal>
      <Drawer
        title="Cart"
        placement="right"
        width={500}
        closable={true}
        onClose={handleCartDrawerClose}
        visible={isCartDrawerVisible}
      >
        {/* Render cart items here */}
        <div style={{ padding: '20px' }}>
          <h3>Items in Cart:</h3>
          <div style={{ padding: '20px' }}>
            {cartItems.map(item => (
              <div key={item.id} style={{ marginBottom: '10px' }}>
                <Row justify={'start'}>
                  <Col>
                    <center>
                      <Checkbox value={item.selected || false} onChange={() => setSelectedItem(item.id)} style={{ marginRight: '10px' }} />
                    </center>
                  </Col>
                  <Col>
                    <Card size='default'>
                      <Meta
                        avatar={<img alt={item.book.title} src={item.book.coverImg ?? "https://dataham.komnasham.go.id/uploads/cover/image_default.png"} style={{ width: '80px', height: '100px', objectFit: 'cover' }} />}
                        title={item.title}
                        description={`By ${item.book.writer}`}
                      />
                      <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center' }}>
                        <InputNumber onChange={(e) => handleQuantityChange(e, item.id)} value={item.quantity} min={1} defaultValue={1} style={{ marginRight: '10px' }} />
                        <span>Total Price: {item.totalAmount}</span>
                      </div>
                    </Card>
                  </Col>
                </Row>

              </div>
            ))}
            <div>
              Total Amount: {cartItems.filter(i => i.selected).reduce((total, item) => total + item.totalAmount, 0)}
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px', width: '100%' }}>
            <Button style={{ width: '100%' }} type="primary" onClick={() => {
              Notiflix.Notify.info(` Will Checkout out ${cartItems.filter(i => i.selected).length} items`);
              handleCheckout()
            }}>Checkout</Button>
          </div>
        </div>
      </Drawer>
      <Drawer
        title="Order Histories"
        placement="right"
        width={500}
        closable={true}
        onClose={handleHistoryDrawerClose}
        visible={isOrdersDrawerVisible}
      >
        {/* Render cart items here */}
        <div style={{ padding: '20px' }}>
          <h3>Order Histories:</h3>
          <div style={{ padding: '20px' }}>
            {orderItems.map(item => (
              <div key={item.id} style={{ marginBottom: '10px' }}>
                <Card size='default'>
                  <List
                    itemLayout="horizontal"
                    dataSource={item.items}
                    renderItem={(item: any, index) => (
                      <List.Item key={index}>
                        <List.Item.Meta
                          title={<a href="https://ant.design">{item.book.title}</a>}
                          description={`By ${item.book.writer}, Quantity : ${item.quantity}, Total : ${item.totalAmount}`}
                        />
                      </List.Item>
                    )}
                  />
                  <span>Total Amount : {item.totalAmount}</span>
                  <div>
                    {(item.canceled ?? false) && (
                      <Badge status="error" count="Canceled" />
                    )}
                  </div>
                  <br />
                  {!(item.canceled ?? false) && (
                    <div>
                      <Button type='dashed' onClick={() => handleCancelOrder(item.id)}>Cancel Order</Button>
                    </div>
                  )}
                </Card>
              </div>
            ))}

          </div>

        </div>
      </Drawer>
    </div>
  );
};

export default Books;