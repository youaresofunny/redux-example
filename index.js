import { createStore, applyMiddleware } from 'redux';
import { createSelector } from 'reselect'

const logger = store => next => action => {
  console.log('dispatching', action);
  let result = next(action);
  console.log('next state', store.getState());
  return result;
};

const defaultClient = (tgId) => ({
  systemState: {
    connections: {
      telegram: tgId
    }
  },
  exchangeState: {}
});

const coreStore = (state = {
  clients: [
    defaultClient('testTelegramId')
  ],
  telegramMap: {
    "testTelegramId": 0
  }
}, action) => {
  switch (action.type) {
    case 'ADD_USER':
      state.clients.push(defaultClient(action.tgId));
      state.telegramMap[action.tgId] = state.clients.length - 1;
      return state;
    case 'SET_USER_STATE':
      state.clients[action.coreId].exchangeState[action.exchangeId] = action.state;
      return state;
    default: return state;
  }
};

const store = createStore(coreStore, applyMiddleware(logger));

const clients = state => state.clients;
const clientIndexes = state => state.telegramMap;

const getUser = tgId => createSelector(
  [clients, clientIndexes],
  (clients, clientIndexes) => {
    if (clientIndexes[tgId] !== undefined) {
      return clients[clientIndexes[tgId]];
    } else {
      return false;
    }
  }
);

const hasKeys = tgId => createSelector(
  getUser(tgId),
  (user) => (Object.keys(user.exchangeState).length > 0)
);

console.log('Getter', getUser("testTelegramId")(store.getState()));
console.log('Getter2', hasKeys("testTelegramId")(store.getState()));

// Example of message from exchanger
store.dispatch({
  type: 'SET_USER_STATE',
  coreId: 0,
  exchangeId: 'benice_0',
  state: {
    balances: {
      BTC: 0.1,
      EOS: 400
    }
  }
});
console.log('Getter2', hasKeys("testTelegramId")(store.getState()));