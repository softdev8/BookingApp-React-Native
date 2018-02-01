import { createStore, applyMiddleware } from 'redux';
import { createLogger } from 'redux-logger';
import reduxThunk from 'redux-thunk';
import reducers from '../reducers';

const logger = createLogger({
    predicate: () => process.env.NODE_ENV === 'development'
});

//store set
export default function configureStore() {
    const store = createStore(
        reducers,
        applyMiddleware(reduxThunk, logger)
    );

    return store;
}

