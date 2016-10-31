//(1)这里是reducers对象，把reducers作为createStore方法的参数传入。同时createStore返回的参数具有getState和dispatch方法
//(2)Reducer 函数不用手动调用，store.dispatch方法会触发Reducer的自动执行。为此，Store需要知道Reducer函数
//做法就是在生成 Store 的时候，将 Reducer 传入createStore方法。
//(3)为什么这个函数叫做 Reducer 呢？因为它可以作为数组的reduce方法的参数。
/*

const defaultState = 0;
const reducer = (state = defaultState, action) => {
  switch (action.type) {
    case 'ADD':
      return state + action.payload;
    default: 
      return state;
  }
};

const actions = [
  { type: 'ADD', payload: 0 },
  { type: 'ADD', payload: 1 },
  { type: 'ADD', payload: 2 }
];

const total = actions.reduce(reducer, 0); // 3
*/
export default (state = 0, action) => {
  switch (action.type) {
    case 'INCREMENT':
      return state + 1
    case 'DECREMENT':
      return state - 1
    default:
      return state
  }
}
