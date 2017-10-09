import {
	FETCH_BRANCHES,
	FETCH_QUESTIONS,
	FETCH_RATINGS,
	CHANGE_BRANCH,
	STATIC_CONTENT,
	SCENE_CHANGE,
	PROFILE_CHECKED,
  UPDATE_FILTER,
} from '../actions/types';

const INITIAL_STATE = {
	questions: [],
	branches: [],
	ratings: null,
	branch: null,
	officeInformation: '',
	temrsAndConditions: '',
	aboutUs: '',
	termsOfUse: '',
	privacyPolicy: '',
	mandate: '',
	lastSceneKey: '',
	profileChecked: false,
	searchFilters: {
		Region: {
			EAST: false,
			WEST: false,
			NORTH: false,
			SOUTH: false,
			CENTRAL: false,
	  },
    City: {},
    Province: {},
  },
};

export default (state = INITIAL_STATE, action) => {
	switch (action.type) {
		case FETCH_BRANCHES:
			return {
				...state,
				branches: action.payload,
			};
		case FETCH_QUESTIONS:
			return {
				...state,
				questions: action.payload,
			};
		case FETCH_RATINGS:
			return {
				...state,
				ratings: action.payload,
			};
		case CHANGE_BRANCH:
			return {
				...state,
				branch: action.payload,
			};
		case STATIC_CONTENT:
			return {
				...state,
				officeInformation: action.payload[0],
				temrsAndConditions: action.payload[1],
				aboutUs: action.payload[2],
				termsOfUse: action.payload[3],
				privacyPolicy: action.payload[4],
				mandate: action.payload[5],
			};
		case SCENE_CHANGE:
			return {
				...state,
				lastSceneKey: action.payload
			};
    case PROFILE_CHECKED:
      return {
        ...state,
        profileChecked: action.payload
      };
    case UPDATE_FILTER:
      return {
        ...state,
        searchFilters: action.payload
      };

    default:
			return state;
	}
};
