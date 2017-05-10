import { ActionTypes } from './createStore'
import isPlainObject from 'lodash/isPlainObject'
import warning from './utils/warning'

var NODE_ENV = typeof process !== 'undefined' ? process.env.NODE_ENV : 'development'

// if (typeof nextStateForKey === 'undefined') {
//       var errorMessage = getUndefinedStateErrorMessage(key, action)
//       throw new Error(errorMessage)
//     }
//其中key是我们的todos或者counter属性~~~
function getUndefinedStateErrorMessage(key, action) {
  var actionType = action && action.type
  var actionName = actionType && `"${actionType.toString()}"` || 'an action'
  return (
    `Given action ${actionName}, reducer "${key}" returned undefined. ` +
    `To ignore an action, you must explicitly return the previous state.`
  )
}
// if (NODE_ENV !== 'production') {
//       var warningMessage = getUnexpectedStateShapeWarningMessage(state, finalReducers, action, unexpectedKeyCache)
//       if (warningMessage) {
//         warning(warningMessage)
//       }
//     }
function getUnexpectedStateShapeWarningMessage(inputState, reducers, action, unexpectedKeyCache) {
  var reducerKeys = Object.keys(reducers)
  var argumentName = action && action.type === ActionTypes.INIT ?
    'preloadedState argument passed to createStore' :
    'previous state received by the reducer'
  //是否有key
  if (reducerKeys.length === 0) {
    return (
      'Store does not have a valid reducer. Make sure the argument passed ' +
      'to combineReducers is an object whose values are reducers.'
    )
  }
 //State必须是plainObject
  if (!isPlainObject(inputState)) {
    return (
      `The ${argumentName} has unexpected type of "` +
      ({}).toString.call(inputState).match(/\s([a-z|A-Z]+)/)[1] +
      `". Expected argument to be an object with the following ` +
      `keys: "${reducerKeys.join('", "')}"`
    )
  }

  var unexpectedKeys = Object.keys(inputState).filter(key =>
    !reducers.hasOwnProperty(key) &&
    !unexpectedKeyCache[key]
  )
  unexpectedKeys.forEach(key => {
    unexpectedKeyCache[key] = true
  })
  if (unexpectedKeys.length > 0) {
    return (
      `Unexpected ${unexpectedKeys.length > 1 ? 'keys' : 'key'} ` +
      `"${unexpectedKeys.join('", "')}" found in ${argumentName}. ` +
      `Expected to find one of the known reducer keys instead: ` +
      `"${reducerKeys.join('", "')}". Unexpected keys will be ignored.`
    )
  }
}

/**
 * 得到所有的reducers
 * @param  {[type]} reducers [description]
 * @return {[type]}          [description]
 */
function assertReducerSanity(reducers) {
  Object.keys(reducers).forEach(key => {
    var reducer = reducers[key]
    var initialState = reducer(undefined, { type: ActionTypes.INIT })
    //通过对我们的reducer执行ActionTypes.INIT，得到这个reducer的初始值
    if (typeof initialState === 'undefined') {
      throw new Error(
        `Reducer "${key}" returned undefined during initialization. ` +
        `If the state passed to the reducer is undefined, you must ` +
        `explicitly return the initial state. The initial state may ` +
        `not be undefined.`
      )
    }

    var type = '@@redux/PROBE_UNKNOWN_ACTION_' + Math.random().toString(36).substring(7).split('').join('.')
    //我们的每一个reducer传入的第一个参数是state，第二个参数是Action
   //(1)不要处理@@redux这个空间下的Action或者@@redux下的${ActionTypes.INIT}，他们是私有的
   //(2)对于我们未知的action我们必须返回当前的state状态，除非这个Action是undefined.
   //   此时因为action是undefined,所以我们返回初始值，而不管Action本身的类型
    if (typeof reducer(undefined, { type }) === 'undefined') {
      throw new Error(
        `Reducer "${key}" returned undefined when probed with a random type. ` +
        `Don't try to handle ${ActionTypes.INIT} or other actions in "redux/*" ` +
        `namespace. They are considered private. Instead, you must return the ` +
        `current state for any unknown actions, unless it is undefined, ` +
        `in which case you must return the initial state, regardless of the ` +
        `action type. The initial state may not be undefined.`
      )
    }
  })
}

/**
 * Turns an object whose values are different reducer functions, into a single
 * reducer function. It will call every child reducer, and gather their results
 * into a single state object, whose keys correspond to the keys of the passed
 * reducer functions.
 *
 * @param {Object} reducers An object whose values correspond to different
 * reducer functions that need to be combined into one. One handy way to obtain
 * it is to use ES6 `import * as reducers` syntax. The reducers may never return
 * undefined for any action. Instead, they should return their initial state
 * if the state passed to them was undefined, and the current state for any
 * unrecognized action.
 *
 * @returns {Function} A reducer function that invokes every reducer inside the
 * passed object, and builds a state object with the same shape.
 *import { combineReducers } from 'redux'
  import todos from './todos'
  import counter from './counter'
  export default combineReducers({
    todos,
    counter
  })
 */
export default function combineReducers(reducers) {
  var reducerKeys = Object.keys(reducers)
  var finalReducers = {}
  //对每一个reducer进行循环，将那些导出是函数的reducer保存到finalReducers中
  for (var i = 0; i < reducerKeys.length; i++) {
    var key = reducerKeys[i]
    if (NODE_ENV !== 'production') {
      if (typeof reducers[key] === 'undefined') {
        warning(`No reducer provided for key "${key}"`)
      }
    }
    if (typeof reducers[key] === 'function') {
      finalReducers[key] = reducers[key]
    }
  }
  var finalReducerKeys = Object.keys(finalReducers)
  //得到我们关注的reducer所有的键名
  if (NODE_ENV !== 'production') {
    var unexpectedKeyCache = {}
  }
  var sanityError
  try {
    assertReducerSanity(finalReducers)
  } catch (e) {
    sanityError = e
  }
  //此时我们的combineReducers返回一个函数了，也就是最终结合起来的reducer
  //和普通的reducer一样，接收state与action为两个参数
  return function combination(state = {}, action) {
    if (sanityError) {
      throw sanityError
    }
    if (NODE_ENV !== 'production') {
      var warningMessage = getUnexpectedStateShapeWarningMessage(state, finalReducers, action, unexpectedKeyCache)
      if (warningMessage) {
        warning(warningMessage)
      }
    }
    var hasChanged = false
    var nextState = {}
    //http://redux.js.org/docs/api/combineReducers.html
    //此时key为["todos","counter"]
    //store.dispatch({
    //   type: 'ADD_TODO',
    //   text: 'Use Redux'
    // })
    // 此时表示我们会要reducers去处理，但是具体让那个reducer处理是要我们自己选择的~~
    for (var i = 0; i < finalReducerKeys.length; i++) {
      var key = finalReducerKeys[i]
      //此时如todos,counter两个key
      var reducer = finalReducers[key]
      //得到某个key对应的具体的reducer函数。如上面这种情况key和value是一致的，为todos和counter
      var previousStateForKey = state[key]
      //对于每一个reducer只会处理相应的key,所以我们的state肯定是如下的格式
      //{todos:[],counter:0}，也就是我们 ${ActionTypes.INIT}的初始值
      var nextStateForKey = reducer(previousStateForKey, action)
      //第一次循环如果是todos，那么我们会获取state中的todos的值以及action传入计算得到新的todos值
      if (typeof nextStateForKey === 'undefined') {
        var errorMessage = getUndefinedStateErrorMessage(key, action)
        throw new Error(errorMessage)
      }
      nextState[key] = nextStateForKey
      //更新这个key的值
      hasChanged = hasChanged || nextStateForKey !== previousStateForKey
      //这个state是否发生变化
    }
    //如果没有一个属性的值发生变化，那么hasChanged就是为false
    return hasChanged ? nextState : state
  }
}
