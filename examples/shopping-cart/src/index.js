import React from 'react'
import { render } from 'react-dom'
//引入applyMiddleware和createStore方法
import { createStore, applyMiddleware } from 'redux'
//引入Provider对象
import { Provider } from 'react-redux'
//引入createLogger
import createLogger from 'redux-logger'
//引入thunk
import thunk from 'redux-thunk'
//引入reducers，默认应该是引入index.js
import reducer from './reducers'
//引入getAllProducts
import { getAllProducts } from './actions'
//引入App
import App from './containers/App'

const middleware = [ thunk ];
//生成一个中间件数组，development环境下才会产生logger中间件
if (process.env.NODE_ENV !== 'production') {
  middleware.push(createLogger());
}

//本函数可以帮助你组织多个 reducer，使它们分别管理自身相关联的 state。类似于 Flux 中的多个 store 分别管理不同的 state。在 Redux 中，只有一个 store，但是 combineReducers 让你拥有多个 reducer，同时保持各自负责逻辑块的独立性。
const store = createStore(
  reducer,
  applyMiddleware(...middleware)
)
//调用store的dispatch方法，该方法会自动调用reducer方法
store.dispatch(getAllProducts())

//引入Provider对象
render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root')
)
