import { combineReducers } from 'redux';
import routes from './routes_reducer';
import auth from './authentication_reducer';
import data from './data_reducer';

const rootReducer = combineReducers({
    routes,
    auth,
    data
});

export default rootReducer;
