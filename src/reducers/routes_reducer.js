import { ActionConst } from 'react-native-router-flux';
import {
  OPEN_TAB,
  CLOSE_TAB,
} from '../actions/types';

const INITIAL_STATE = {
    scene: {},
    sourceSceneKey: '',
    tab: null,
};

export default (state = INITIAL_STATE, action) => {
    switch (action.type) {
        case ActionConst.FOCUS:
            return { ...state, scene: action.scene };
        case ActionConst.BACK_ACTION:
            return { ...state, sourceSceneKey: state.scene.sceneKey };
        case OPEN_TAB:
            return { ...state, tab: action.payload };
        case CLOSE_TAB:
            return { ...state, tab: null };
        default:
            return state;
    }
};
