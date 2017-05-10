import isPlainObject from 'lodash/isPlainObject'
import $$observable from 'symbol-observable'

/**
 * These are private action types reserved by Redux.
 * For any unknown actions, you must return the current state.
 * If the current state is undefined, you must return the initial state.
 * Do not reference these action types directly in your code.
 */
export var ActionTypes = {
  INIT: '@@redux/INIT'
}

/**
 * Creates a Redux store that holds the state tree.
 * The only way to change the data in the store is to call `dispatch()` on it.
 *
 * There should only be a single store in your app. To specify how different
 * parts of the state tree respond to actions, you may combine several reducers
 * into a single reducer function by using `combineReducers`.
 *
 * @param {Function} reducer A function that returns the next state tree, given
 * the current state tree and the action to handle.
 * reducer会接收两个参数:当前的state对象和action对象=>下一个state对象
 *
 * @param {any} [preloadedState] The initial state. You may optionally specify it
 * to hydrate the state from the server in universal apps, or to restore a
 * previously serialized user session.
 * If you use `combineReducers` to produce the root reducer function, this must be
 * an object with the same shape as `combineReducers` keys.
 * 如果你使用了combineReducers来组合得到一个最终的reducer，那么它必须是一个对象，同时
 * 和combineReducers有相同的key
 *
 * @param {Function} [enhancer] The store enhancer. You may optionally specify it
 * to enhance the store with third-party capabilities such as middleware,
 * time travel, persistence, etc. The only store enhancer that ships with Redux
 * is `applyMiddleware()`.
 *如果你需要使用第三方的插件来提升store的能力，例如middleware,time travel,
 *或者持久化，那么你可以使用applyMiddleware
 * 
 * @returns {Store} A Redux store that lets you read the state, dispatch actions
 * and subscribe to changes.
 */
//const store = createStore(counter)
export default function createStore(reducer, preloadedState, enhancer) {
  //如果传入两个参数，同时第二个参数是函数，那么第二个参数是enhancer
  if (typeof preloadedState === 'function' && typeof enhancer === 'undefined') {
    enhancer = preloadedState
    preloadedState = undefined
  }
  //enhancer必须是一个函数
  if (typeof enhancer !== 'undefined') {
    if (typeof enhancer !== 'function') {
      throw new Error('Expected the enhancer to be a function.')
    }
    return enhancer(createStore)(reducer, preloadedState)
  }
  //reducer必须是函数
  if (typeof reducer !== 'function') {
    throw new Error('Expected the reducer to be a function.')
  }
  var currentReducer = reducer
  var currentState = preloadedState
  var currentListeners = []
  var nextListeners = currentListeners
  //nextListeners指向了currentListeners的引用~
  var isDispatching = false

  function ensureCanMutateNextListeners() {
    if (nextListeners === currentListeners) {
      nextListeners = currentListeners.slice()
    }
  }

  /**
   * Reads the state tree managed by the store.
   *
   * @returns {any} The current state tree of your application.
   */
  function getState() {
    return currentState
  }

  /**
   * Adds a change listener. It will be called any time an action is dispatched,
   * and some part of the state tree may potentially have changed. You may then
   * call `getState()` to read the current state tree inside the callback.
   *
   * You may call `dispatch()` from a change listener, with the following
   * caveats:
   *
   * 1. The subscriptions are snapshotted just before every `dispatch()` call.
   * If you subscribe or unsubscribe while the listeners are being invoked, this
   * will not have any effect on the `dispatch()` that is currently in progress.
   * However, the next `dispatch()` call, whether nested or not, will use a more
   * recent snapshot of the subscription list.
   *
   * 2. The listener should not expect to see all state changes, as the state
   * might have been updated multiple times during a nested `dispatch()` before
   * the listener is called. It is, however, guaranteed that all subscribers
   * registered before the `dispatch()` started will be called with the latest
   * state by the time it exits.
   *
   * @param {Function} listener A callback to be invoked on every dispatch.
   * @returns {Function} A function to remove this change listener.
   */
  function subscribe(listener) {
    if (typeof listener !== 'function') {
      throw new Error('Expected listener to be a function.')
    }
    var isSubscribed = true
    //将isSubscribed设置为true，同时将listener添加到nextListeners集合中
    ensureCanMutateNextListeners()
    nextListeners.push(listener)
    //subscribe返回的是一个函数，调用它就会从nextListeners中将这个回调
    //删除
    return function unsubscribe() {
      if (!isSubscribed) {
        return
      }
      isSubscribed = false
      ensureCanMutateNextListeners()
      var index = nextListeners.indexOf(listener)
      nextListeners.splice(index, 1)
    }
  }

  /**
   * Dispatches an action. It is the only way to trigger a state change.
   *
   * The `reducer` function, used to create the store, will be called with the
   * current state tree and the given `action`. Its return value will
   * be considered the **next** state of the tree, and the change listeners
   * will be notified.
   *
   * The base implementation only supports plain object actions. If you want to
   * dispatch a Promise, an Observable, a thunk, or something else, you need to
   * wrap your store creating function into the corresponding middleware. For
   * example, see the documentation for the `redux-thunk` package. Even the
   * middleware will eventually dispatch plain object actions using this method.
   *
   * @param {Object} action A plain object representing “what changed”. It is
   * a good idea to keep actions serializable so you can record and replay user
   * sessions, or use the time travelling `redux-devtools`. An action must have
   * a `type` property which may not be `undefined`. It is a good idea to use
   * string constants for action types.
   *
   * @returns {Object} For convenience, the same action object you dispatched.
   *
   * Note that, if you use a custom middleware, it may wrap `dispatch()` to
   * return something else (for example, a Promise you can await).
   */
  function dispatch(action) {
    if (!isPlainObject(action)) {
      throw new Error(
        'Actions must be plain objects. ' +
        'Use custom middleware for async actions.'
      )
    }
    //传入dispatch的必须是一个plainObject，同时type必须存在
    if (typeof action.type === 'undefined') {
      throw new Error(
        'Actions may not have an undefined "type" property. ' +
        'Have you misspelled a constant?'
      )
    }
    //如果已经在修改了store，那么不允许立刻再次修改reducer
    if (isDispatching) {
      throw new Error('Reducers may not dispatch actions.')
    }
    try {
      isDispatching = true
      currentState = currentReducer(currentState, action)
      //执行我们传入的reducer函数，同时传入当前的state与action计算得到下一次的state
    } finally {
      isDispatching = false
    }
    //通过执行currentReducer得到新的state，并作为currentState
    var listeners = currentListeners = nextListeners
    //更新nextListeners，同时将我们通过subscribe注册的函数都执行一遍
    for (var i = 0; i < listeners.length; i++) {
      var listener = listeners[i]
      listener()
    }
    return action
  }

  /**
   * Replaces the reducer currently used by the store to calculate the state.
   *
   * You might need this if your app implements code splitting and you want to
   * load some of the reducers dynamically. You might also need this if you
   * implement a hot reloading mechanism for Redux.
   * 用一个新的store替换掉我们当前的store用来计算我们的新的state。如果你的app支持code splitting
   * 而且你想要动态加载reducer。同时如果你要为你的Redux支持Hot Reloading也需要
   * @param {Function} nextReducer The reducer for the store to use instead.
   * @returns {void}
   */
  function replaceReducer(nextReducer) {
    if (typeof nextReducer !== 'function') {
      throw new Error('Expected the nextReducer to be a function.')
    }
    currentReducer = nextReducer
    dispatch({ type: ActionTypes.INIT })
  }

  /**
   * Interoperability point for observable/reactive libraries.
   * @returns {observable} A minimal observable of state changes.
   * For more information, see the observable proposal:
   * https://github.com/zenparsing/es-observable
   */
  function observable() {
    var outerSubscribe = subscribe
    return {
      /**
       * The minimal observable subscription method.
       * @param {Object} observer Any object that can be used as an observer.
       * The observer object should have a `next` method.
       * @returns {subscription} An object with an `unsubscribe` method that can
       * be used to unsubscribe the observable from the store, and prevent further
       * emission of values from the observable.
       */
      subscribe(observer) {
        if (typeof observer !== 'object') {
          throw new TypeError('Expected the observer to be an object.')
        }
       //如果subscribe中传入的observer有next方法，那么我们传入它我们的getState的值
      //同时也将observeState方法传入到外部的subscribe方法中
        function observeState() {
          if (observer.next) {
            observer.next(getState())
          }
        }
        observeState()
        var unsubscribe = outerSubscribe(observeState)
        return { unsubscribe }
      },

      [$$observable]() {
        return this
      }
    }
  }

  // When a store is created, an "INIT" action is dispatched so that every
  // reducer returns their initial state. This effectively populates
  // the initial state tree.
  // 当我们初次创建store的时候，我们会发出一个"INIT"事件，此时所有的reducer会返回
  // 他们的初始状态。此时获取到的就是初始的state树!~~
  dispatch({ type: ActionTypes.INIT })

  return {
    dispatch,
    subscribe,
    getState,
    replaceReducer,
    [$$observable]: observable
  }
}
