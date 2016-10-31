import React from 'react'
import ProductsContainer from './ProductsContainer'
import CartContainer from './CartContainer'

const App = () => (
  <div>
    <h2>Shopping Cart Example</h2>
    <hr/>
    /*这里是ProductsContainer组件，用于对单个商品进行展示，所以两个组件都能够有效的复用*/
    <ProductsContainer />
    <hr/>
     //这里是CartContainer组件，表示一个购物车，所以两个组件都能够有效的复用
    <CartContainer />
  </div>
)

export default App
