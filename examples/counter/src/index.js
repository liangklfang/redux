import React from 'react'
import ReactDOM from 'react-dom'
import { createStore } from 'redux'
import Counter from './components/Counter'
//Store 收到 Action 以后，必须给出一个新的 State，这样View才会发生变化。这种State的计算过程就叫做 Reducer。
//Reducer 是一个函数，它接受 Action 和当前 State 作为参数，返回一个新的 State。
import counter from './reducers'
//counter就是作为函数传入createStore函数的，返回一个store实例
const store = createStore(counter)
const rootEl = document.getElementById('root')

const render = () => ReactDOM.render(
  <Counter
    value={store.getState()}//传入state对象
    /*
     直接调用render方法，同时把render方法句柄作为store.subscribe方法的参数传入
	*/
    onIncrement={() => store.dispatch({ type: 'INCREMENT' })}
    onDecrement={() => store.dispatch({ type: 'DECREMENT' })}
  />,
  rootEl
)
render()
store.subscribe(render)

