import React, {Component} from 'react';
import {AsyncStorage, Alert} from 'react-native';
import {connect} from 'react-redux';
import SideBar from '../components/SideBar';
import {Actions} from 'react-native-router-flux';
import {logOutUser, closeTab} from '../actions';

class SideBarContainer extends Component {
  handleLogOut() {
		AsyncStorage.multiRemove(
			['access_token', 'refresh_token', 'user_name', 'token_type'])
			.then( ()=> {
				this.props.logOutUser();
				Actions.auth();
			})
			.catch((err) => Alert.alert(`Error name: ${err.name}`, `Error message: ${err.message}`));
	}

	render() {
    		console.log('tab', this.props.tab);
		return (
			<SideBar {...this.props} onLogOut={this.handleLogOut.bind(this)}/>
		);
	}
}

const mapStateToProps = (state) => {
	return {
		authenticated: state.auth.authenticated,
		user: state.auth.user,
		profile: state.auth.profile,
    tab: state.routes.tab,
	};
};

export default connect(mapStateToProps, {logOutUser, closeTab})(SideBarContainer);
