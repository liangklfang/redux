import React, { PropTypes } from 'react'
import Product from './Product'

  //ProductItem也是一个示例({})=>()，上面是一个Product对象，下面是一个button对象
  //这里的Product直接传入了title和price，直接用于Product的构造函数，而不是用jskit那样在元素上进行配置
  /*
  const Product = ({ price, quantity, title }) => (
    <div>
      {title} - &#36;{price}{quantity ? ` x ${quantity}` : null}
    </div>
  )
  其中ProductItem具有的属性product是一个复合属性，含有title/price/inventory等，其中inventory表示是否含有库存，根据是否有库存在button上显示不同的文字
  */
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
ProductItem.propTypes = {
  product: PropTypes.shape({
    title: PropTypes.string.isRequired,
    price: PropTypes.number.isRequired,
    inventory: PropTypes.number.isRequired
  }).isRequired,
  onAddToCartClicked: PropTypes.func.isRequired
}

export default ProductItem
