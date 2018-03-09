import React, {Component} from 'react';
import {Modal, View, Text, StyleSheet, Image, Linking} from 'react-native';
import {connect} from 'react-redux';
import {logInUser, registerUser} from '../actions';
import Authentication from '../components/Authentication';
import AuthSignUp from '../components/AuthSignUp';
import AuthResetPassword from '../components/AuthResetPassword';
import AuthTermsUSe from '../components/AuthTermsUse';
import {Actions} from 'react-native-router-flux';
import {AppColors, AppFonts, AppStyles, AppSizes} from '../constants';

const PAGE = {
	SIGNUP: 0,
	LOGIN: 1,
	FORGOT_PW: 2,
	TERMS_USE: 3,
	HIDE: 4
};

class AuthenticationContainer extends Component {

	constructor(props) {
		super(props);
		this.state = {
			currentPage: PAGE.LOGIN
		}
	}
	/* fixed mobiledev418
	componentDidMount() {
		Linking.getInitialURL().then((url) => {
			if (url) {
				console.log('Initial url is: ' + url);
			}
		}).catch(err => console.error('An error occurred', err));
	}
	*/

	setActivePage(index) {
		this.setState({currentPage: index});
	}

	handleLoginSuccess(response) {
		this.props.logInUser(response);
		Actions.drawer();
	}

	handleRegisterSuccess(response) {
		this.props.registerUser(response);
	}

	handleResetPress(email) {
		this.props.registerUser(email, '', '')
			.then(() => {
				Actions.drawer()
			});
	}

	render() {
		return (
			<View style={styles.container}>
				<Image source={require('../images/books_blur.jpg')} style={{resizeMode: 'cover', flex: 1, width: null, height: null}} />
				<Modal
					animationType={"fade"}
					transparent={true}
					visible={this.state.currentPage == PAGE.LOGIN}
					onRequestClose={() => {console.log("Modal has been closed.")}}
				>
					<Authentication
						{...this.props}
						onLoginSuccess={this.handleLoginSuccess.bind(this)}
						onChangePage={this.setActivePage.bind(this)}
					/>
				</Modal>

				<Modal
					animationType={"fade"}
					transparent={true}
					visible={this.state.currentPage == PAGE.SIGNUP}
					onRequestClose={() => {console.log("Modal has been closed.")}}
				>
					<AuthSignUp
						{...this.props}
						onRegisterSuccess={this.handleRegisterSuccess.bind(this)}
						onChangePage={this.setActivePage.bind(this)}
					/>
				</Modal>
				<Modal
					animationType={"fade"}
					transparent={true}
					visible={this.state.currentPage == PAGE.TERMS_USE}
					onRequestClose={() => {console.log("Modal has been closed.")}}
				>
					<AuthTermsUSe
						{...this.props}
						onResetPress={this.handleResetPress.bind(this)}
						onChangePage={this.setActivePage.bind(this)}
					/>
				</Modal>
				<Modal
					animationType={"fade"}
					transparent={true}
					visible={this.state.currentPage == PAGE.FORGOT_PW}
					onRequestClose={() => {console.log("Modal has been closed.")}}
				>
					<AuthResetPassword
						{...this.props}
						onResetPress={this.handleResetPress.bind(this)}
						onChangePage={this.setActivePage.bind(this)}
					/>
				</Modal>

				

			</View>
		);
	}
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: AppColors.background
	}
});

const mapStateToProps = (state) => {
	return {
		authenticated: state.auth.authenticated,
		loading: state.auth.loading
	};
};
export default connect(mapStateToProps, {logInUser, registerUser})(AuthenticationContainer);
