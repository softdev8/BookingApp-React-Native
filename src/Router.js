import React, {Component} from 'react';
import {StyleSheet, Linking} from 'react-native';
import {Scene, Router, Reducer, ActionConst, Actions} from 'react-native-router-flux';
import {connect} from 'react-redux';

import AuthenticationContainer from './containers/AuthenticationContainer';
import SideBarContainer from './containers/SideBarContainer';
import BurgerIcon from './components/BurgerIcon';
import HeadOffice from './components/HeadOffice';
import HomeView from './components/HomeView';
import TermsCondition from './components/TermsCondition';
import TalkUs from './components/TalkUs';
import FAQ from './components/FAQ';
import RateStore from './components/RateStore';
import TermsUse from './components/TermsUse';
import PrivacyPolicy from './components/PrivacyPolicy';
import About from './components/About';
import EventsView from './components/EventsView';
import StoreLocatorView from './components/StoreLocatorView';
import NewReleaseView from './components/NewReleaseView';
import NewsView from './components/NewsView';
import NewsDetailView from './components/NewsDetailView';
import ProfileView from './components/ProfileView';
import SearchView from './components/SearchView';
import BranchList from './components/BranchList';
import OrderList from './components/OrderList';
import StoreDetail from './components/StoreDetail';
import StoreLocationMap from './components/StoreLocationMap';
import SearchFilterView from './components/SearchFilterView';
import {AppColors, AppFonts, AppStyles, AppSizes} from './constants';
import {changeScene} from './actions'
import crossroads from 'crossroads';

const appScheme = "bargainbooks://";
const RouterWithRedux = connect()(Router);
const scenes = Actions.create(
	<Scene key="root">
		<Scene key="auth" type={ActionConst.RESET}>
			<Scene key="login" title="Login" component={AuthenticationContainer} hideNavBar/>
		</Scene>
		<Scene key="drawer" type={ActionConst.RESET} component={SideBarContainer} open={false}>
			<Scene key="nav">
				<Scene
					key="homeView"
					title="Bargain Books"
					component={HomeView}
					renderBackButton={() => <BurgerIcon />}
					initial
				/>
				<Scene
					key="orderList"
					title="Orders"
					component={OrderList}
					leftButtonIconStyle={{tintColor: 'white'}}
				/>
				<Scene
					key="headOffice"
					title="Head Office contact"
					component={HeadOffice}
					leftButtonIconStyle={{tintColor: 'white'}}
				/>
				<Scene
					key="termsCondition"
					title="Terms & Conditions"
					component={TermsCondition}
					leftButtonIconStyle={{tintColor: 'white'}}
				/>
				<Scene
					key="privacyPolicy"
					title="Privacy Policy"
					component={PrivacyPolicy}
					leftButtonIconStyle={{tintColor: 'white'}}
				/>
				<Scene
					key="talkUs"
					title="Talk to Us"
					component={TalkUs}
					leftButtonIconStyle={{tintColor: 'white'}}
				/>
				<Scene
					key="rateStore"
					title="Rate Store"
					component={RateStore}
					leftButtonIconStyle={{tintColor: 'white'}}
				/>
				<Scene
					key="termsUse"
					title="Terms of Use"
					component={TermsUse}
					leftButtonIconStyle={{tintColor: 'white'}}
				/>
				<Scene
					key="faq"
					title="FAQ"
					component={FAQ}
					leftButtonIconStyle={{tintColor: 'white'}}
				/>
				<Scene
					key="about"
					title="About"
					component={About}
					leftButtonIconStyle={{tintColor: 'white'}}
				/>
				<Scene
					key="storeLocator"
					title="Store Locator"
					component={StoreLocatorView}
					leftButtonIconStyle={{tintColor: 'white'}}
				/>
				<Scene
					key="aboutUs"
					title="About Us"
					component={About}
					leftButtonIconStyle={{tintColor: 'white'}}
				/>
				<Scene
					key="eventsView"
					title="Events"
					component={EventsView}
					leftButtonIconStyle={{tintColor: 'white'}}
				/>
				<Scene
					key="mapView"
					title="Events"
					component={EventsView}
					leftButtonIconStyle={{tintColor: 'white'}}
				/>
				<Scene
					key="newsFeedView"
					title="News Feed"
					component={NewsView}
					leftButtonIconStyle={{tintColor: 'white'}}
				/>
				<Scene
					key="newsDetailView"
					component={NewsDetailView}
					leftButtonIconStyle={{tintColor: 'white'}}
				/>
				<Scene
					key="profileView"
					title="Profile"
					component={ProfileView}
					leftButtonIconStyle={{tintColor: 'white'}}
				/>
				<Scene
					key="newReleaseView"
					title="New Release"
					component={NewReleaseView}
					leftButtonIconStyle={{tintColor: 'white'}}
				/>
				<Scene
					key="searchView"
					title="Search"
					component={SearchView}
					leftButtonIconStyle={{tintColor: 'white'}}
				/>
				<Scene
					key="branchList"
					title="Choose Branch"
					component={BranchList}
					leftButtonIconStyle={{tintColor: 'white'}}
				/>
				<Scene
					key="storeDetail"
					component={StoreDetail}
					leftButtonIconStyle={{tintColor: 'white'}}
				/>
				<Scene
					key="storeLocationMap"
					component={StoreLocationMap}
					leftButtonIconStyle={{tintColor: 'white'}}
				/>
				<Scene
					key="searchFilterView"
					title="Search Filter"
					component={SearchFilterView}
					leftButtonIconStyle={{tintColor: 'white'}}
				/>
			</Scene>
		</Scene>
	</Scene>
);

// define URL schemes
crossroads.addRoute('status/{action}', Actions.login);
crossroads.addRoute(':whatever*:', Actions.login);

class RouterComponent extends Component {

	componentDidMount() {
		Linking.addEventListener('url', this.handleOpenURL);
	}

	componentWillUnmount() {
		Linking.removeEventListener('url', this.handleOpenURL);
	}

	handleOpenURL(event) {
		if (event.url && event.url.indexOf(appScheme) === 0) {
			crossroads.parse(event.url.slice(appScheme.length));
		}
	}

	render() {

		let catchInitialState = false;
		let _this = this;

		const reducerCreate = params => {
			const defaultReducer = Reducer(params);
			return (state, action) => {

				if (action.key) {
					_this.props.changeScene(action.key);

				}

				if(action.type == 'RootContainerInitialAction') {
					catchInitialState = true
				}

				if(catchInitialState && action.type != 'RootContainerInitialAction') {
					// GoogleAnalytics.trackScreenView(action.scene.sceneKey)
					catchInitialState = false
				}

				if(action.type == 'REACT_NATIVE_ROUTER_FLUX_REPLACE') {
					// GoogleAnalytics.trackScreenView(action.key)
				}

				return defaultReducer(state, action)
			}
		};

		return (
			<RouterWithRedux
				navigationBarStyle={ styles.navbarStyle }
				titleStyle={ styles.titleStyle}
				createReducer={reducerCreate}
				scenes={ scenes }
			>

			</RouterWithRedux>
		);
	}
}

const styles = StyleSheet.create({
	navbarStyle: {
		backgroundColor: AppColors.base,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 1 },
		shadowOpacity: 0.4,
		shadowRadius: 2
	},
	titleStyle: {
		color: "#FFFFFF",
		fontWeight: 'bold'
	}
});

const mapStateToProps = (state) => {
	return {
		lastSceneKey: state.data.lastSceneKey
	};
};

export default connect(mapStateToProps, {changeScene})(RouterComponent);

