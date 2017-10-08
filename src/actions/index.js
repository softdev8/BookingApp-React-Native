import {
	AUTH_USER,
	REGISTER_USER,
	FETCH_USER,
	FETCH_BRANCHES,
	FETCH_QUESTIONS,
	UNAUTH_USER,
	CHANGE_BRANCH,
	STATIC_CONTENT,
	SCENE_CHANGE,
	PROFILE_CHECKED,
	FETCH_RATINGS,
	AUTH_REQUEST,
	CHANGE_EMAIL,
  OPEN_TAB,
  CLOSE_TAB,

  UPDATE_FILTER,

} from '../actions/types';

export const logInUser = (response) => {
	return (dispatch) => {
		dispatch({ type: AUTH_USER, payload: response });
	};
};

export const registerUser = (response) => {
	return (dispatch) => {
		dispatch({type: REGISTER_USER, payload: response});
	};
};

export const fetchUser = (response) => {
	return (dispatch) => {
		dispatch({type: FETCH_USER, payload: response});
	};
};

export const fetchQuestions = (response) => {
	return (dispatch) => {
		dispatch({type: FETCH_QUESTIONS, payload: response});
	};
};

export const fetchBranches = (response) => {
	return (dispatch) => {
		dispatch({type: FETCH_BRANCHES, payload: response});
	};
};

export const fetchRatings = (response) => {
	return (dispatch) => {
		dispatch({type: FETCH_RATINGS, payload: response});
	};
};

export const changeBranch = (branch) => {
	return (dispatch) => {
		dispatch({type: CHANGE_BRANCH, payload: branch});
	};
};

export const fetchStaticContent = (content) => {
	return (dispatch) => {
		dispatch({type: STATIC_CONTENT, payload: content});
	};
};

export const changeScene = (key) => {
	return (dispatch) => {
		dispatch({type: SCENE_CHANGE, payload: key});
	};
};

export const alreadyCheckedProfile = (boolValue) => {
	return (dispatch) => {
		dispatch({type: PROFILE_CHECKED, payload: boolValue});
	};
};

export const changeEmail = (email) => {
	return (dispatch) => {
		// TODO: Promise will be replaced with API request in real app
		// axios.post('http://www.api.com/email', { email} )
		return new Promise((resolve, reject) => {
			setTimeout(() => {
				dispatch({type: CHANGE_EMAIL, payload: email});
				resolve();
			}, 100);
		});
	};
};

export const openTab = (tab) => {
  return (dispatch) => {
    dispatch({type: OPEN_TAB, payload: tab});
  }
};

export const closeTab = () => {
  return (dispatch) => {
    dispatch({type: CLOSE_TAB });
  }
};

export const updateSearchFilter = filter => {
  return (dispatch) => {
    dispatch({type: UPDATE_FILTER, payload: filter});
  };
};


export const logOutUser = () => {
	return {type: UNAUTH_USER};
};