//把一些常量放在constants文件夹下集中处理和配置可以解耦
import {
  ADD_TO_CART,
  CHECKOUT_REQUEST,
  CHECKOUT_FAILURE
} from '../constants/ActionTypes'

//设置initialState对象
const initialState = {
  addedIds: [],
  quantityById: {}
}

//addedIds方法
const addedIds = (state = initialState.addedIds, action) => {
  switch (action.type) {
    case ADD_TO_CART:
      if (state.indexOf(action.productId) !== -1) {
        return state
      }
      return [ ...state, action.productId ]
    default:
      return state
  }
}

//quantityById方法
const quantityById = (state = initialState.quantityById, action) => {
  switch (action.type) {
    case ADD_TO_CART:
      const { productId } = action
      return { ...state,
        [productId]: (state[productId] || 0) + 1
      }
    default:
      return state
  }
}

//getQuantity方法
export const getQuantity = (state, productId) =>
  state.quantityById[productId] || 0

//getAddedIds方法
export const getAddedIds = state => state.addedIds

//这是cart的方法
const cart = (state = initialState, action) => {
  switch (action.type) {
    case CHECKOUT_REQUEST://checkout_request返回initialState对象
      return initialState
    case CHECKOUT_FAILURE://checkout_failure返回action.cart属性
      return action.cart
    default:
      return {//否则返回addedIds和quantityById方法的返回值为一个对象
        addedIds: addedIds(state.addedIds, action),
        quantityById: quantityById(state.quantityById, action)
      }
  }
}

export default cart
