import { combineReducers } from 'redux'
import cart, * as fromCart from './cart'
import products, * as fromProducts from './products'

/*
 调用方法是把reducer作为一个参数来完成的（调用store的dispatch方法就会自动调用reducer的方法）：
 const store = createStore(
  reducer,
  applyMiddleware(...middleware)
)
*/
//combineReducers接受两个reducer作为参数了，也就是合并了这两个reducer
//把几个reducer（visibilityFilter, todos）合成一个reducer
//本函数可以帮助你组织多个 reducer，使它们分别管理自身相关联的 state。类似于 Flux 中的多个 store 分别管理不同的 state。在 Redux 中，只有一个 store，但是 combineReducers 让你拥有多个 reducer，同时保持各自负责逻辑块的独立性。
export default combineReducers({
  cart,
  products
})

//注意：下面三个方法传入的state都是有属性的，如果是购物车那么就是state.cart，否则就是state.products
const getAddedIds = state => fromCart.getAddedIds(state.cart)
const getQuantity = (state, id) => fromCart.getQuantity(state.cart, id)
//上面两个方法是从购物车中调用getAddedIds，getQuantity方法

const getProduct = (state, id) => fromProducts.getProduct(state.products, id)
//上面这个方法从产品中调用getProduct

export const getTotal = state =>
  getAddedIds(state)
    .reduce((total, id) =>
      total + getProduct(state, id).price * getQuantity(state, id),//价格*数量
      0
    )
    .toFixed(2)

export const getCartProducts = state =>
  getAddedIds(state).map(id => ({
    ...getProduct(state, id),
    quantity: getQuantity(state, id)
  }))
