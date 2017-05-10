import React from 'react'
import ReactDOM from 'react-dom'
import { createStore } from 'redux'
import Counter from './components/Counter'
import counter from './reducers'
const store = createStore(counter)
//createStore是一个高阶函数，接收一个reducer函数
const rootEl = document.getElementById('root')
const render = () => ReactDOM.render(
  <Counter
    value={store.getState()}
    onIncrement={() => store.dispatch({ type: 'INCREMENT' })}
    onDecrement={() => store.dispatch({ type: 'DECREMENT' })}
  />,
  rootEl
)
render()
//subscribe只要我们的store内的数据发生变化就会重新执行render
store.subscribe(render)
