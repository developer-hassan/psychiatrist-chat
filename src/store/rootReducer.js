import { combineReducers } from 'redux';
import recorderReducer from './recorder/recorderSlice';
import orderReducer from './order/orderSlice'
import homeReducer from './home/homeSlice'
import conversationReducer from './conversation/conversationSlice'

const rootReducer = combineReducers({
    recorder: recorderReducer,
    order: orderReducer,
    conversation: conversationReducer,
    home: homeReducer,
});

export default rootReducer;