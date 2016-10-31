import React, { PropTypes } from 'react'
import { connect } from 'react-redux'
import { addToCart } from '../actions'
import { getVisibleProducts } from '../reducers/products'
//具有ProductsList和ProductItem两个属性
import ProductItem from '../components/ProductItem'
import ProductsList from '../components/ProductsList'

/*
ProductList的结构为：
const ProductsList = ({ title, children }) => (
  <div>
    <h3>{title}</h3>
    <div>{children}</div>//其中chilren的类型为:PropTypes.node
  </div>
)
ProductItem的结构为：
const ProductItem = ({ product, onAddToCartClicked }) => (
  <div style={{ marginBottom: 20 }}>
    <Product
      title={product.title}
      price={product.price} />
    <button
      onClick={onAddToCartClicked}
      disabled={product.inventory > 0 ? '' : 'disabled'}>
      {product.inventory > 0 ? 'Add to cart' : 'Sold Out'}
    </button>
  </div>
)
Product的结构为：
const Product = ({ price, quantity, title }) => (
  <div>
    {title} - &#36;{price}{quantity ? ` x ${quantity}` : null}
  </div>
)
下面的函数表示：
 对于所有的products集合我们都会创建一个ProductItem，其包含一个产品信息和一个button表示是否购买
*/
const ProductsContainer = ({ products, addToCart }) => (
  <ProductsList title="Products">
    {products.map(product =>
      <ProductItem
        key={product.id}
        product={product}
        onAddToCartClicked={() => addToCart(product.id)} />
    )}
  </ProductsList>
)

//传入的products必须是数组，而且数组里面的实例是通过ProTypes.shape来指定的
ProductsContainer.propTypes = {
  products: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.number.isRequired,
    title: PropTypes.string.isRequired,
    price: PropTypes.number.isRequired,
    inventory: PropTypes.number.isRequired
  })).isRequired,
  addToCart: PropTypes.func.isRequired
}

const mapStateToProps = state => ({
  //调用reducer的方法来获取
  products: getVisibleProducts(state.products)
})

//这里调用了'react-redux'的connect方法
export default connect(
  mapStateToProps,
  { addToCart }
)(ProductsContainer)
