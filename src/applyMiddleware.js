import compose from './compose'

/**
 * Creates a store enhancer that applies middleware to the dispatch method
 * of the Redux store. This is handy for a variety of tasks, such as expressing
 * asynchronous actions in a concise manner, or logging every action payload.
 *
 * See `redux-thunk` package as an example of the Redux middleware.
 *
 * Because middleware is potentially asynchronous, this should be the first
 * store enhancer in the composition chain.
 *
 * Note that each middleware will be given the `dispatch` and `getState` functions
 * as named arguments.
 * 调用方式如下:
 *let store = createStore(
  todos,
  [ 'Use Redux' ],
  applyMiddleware(logger)
)
 * @param {...Function} middlewares The middleware chain to be applied.
 * @returns {Function} A store enhancer applying the middleware.
 * 这里用...middlewares，在ES6中叫做[不定参数][1]，和arguments的效果类似，
 * 把传入的所有参数，作为一个array赋值给middlewares
 */
export default function applyMiddleware(...middlewares) {
  return (createStore) => (reducer, preloadedState, enhancer) => {
    var store = createStore(reducer, preloadedState, enhancer)
    //得到一个store
    var dispatch = store.dispatch
    //获取到store上的dispatch
    var chain = []
    var middlewareAPI = {
      getState: store.getState,
      dispatch: (action) => dispatch(action)
    }
    chain = middlewares.map(middleware => middleware(middlewareAPI))
    //每一个middleware中会传入getState与dispatch两个参数，然后得到我们
    //所有middleware更新后的值，一般还是会返回一个函数
    //  function logger({ getState }) {
    //   return (next) => (action) => {
    //     console.log('will dispatch', action)
    //     // Call the next dispatch method in the middleware chain.
    //     let returnValue = next(action)
    //     console.log('state after dispatch', getState())
    //     // This will likely be the action itself, unless
    //     // a middleware further in chain changed it.
    //     return returnValue
    //   }
    // }
    dispatch = compose(...chain)(store.dispatch)
    // (...args) => rest.reduceRight((composed, f) => f(composed), last(...args))
    //[middleware1,middleware2,middleware3]
    // middleware1(middleware2(middleware3(last(store.dispatch))))
    return {
      ...store,
      dispatch
    }
  }
}
