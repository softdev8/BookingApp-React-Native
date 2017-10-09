import React, {Component} from 'react';
import {View, Text, StyleSheet, AsyncStorage, Linking} from 'react-native';
import {OpaqueCard} from './common';
import MaterialsIcon from 'react-native-vector-icons/MaterialIcons';
import {Kohana} from '../libs/AwesomeInput';
import {AppColors, AppFonts, AppStyles, AppSizes, AppConstants} from '../constants';
import AwesomeButton from '../libs/AwesomeButton';
import * as EmailValidator from 'email-validator';
import DropdownAlert from 'react-native-dropdownalert'
import axios from 'axios';
import Spinner from 'react-native-loading-spinner-overlay';

let qs = require('qs');

const BTN_STATE = {
	IDLE: 'idle',
	BUSY: 'busy',
	SUCCESS: 'success',
	FAILED: 'failed'
};

let moment = require('moment');

class Authentication extends Component {

	constructor() {
		super();
		this.state = {
			email: '',
			password: '',
			errorMessage: '',
			buttonState: BTN_STATE.IDLE,
			autoLoginState: BTN_STATE.IDLE,
			loading: false,
		};

		this.handleLogin = this.handleLogin.bind(this);
		this.handleForgotPassword = this.handleForgotPassword.bind(this);
		this.handleSignUp = this.handleSignUp.bind(this);

	}

  componentWillReceiveProps(nextProps) {
    if (nextProps.should === 'logout') {
      console.log('componentWillReceiveProps', 'should', nextProps.should);
    }
  }

  componentDidMount() {
    if (this.props.redirect) {
			console.log('auth - redirect', this.props.redirect)
    }

		Linking.getInitialURL().then((url) => {
			if (url) {
				console.log('Initial url is: ' + url);
				// const separatorIndex = url.indexOf("&");
				// const userId = url.substring(35, separatorIndex);
				// const token = url.substring(separatorIndex + 7, url.length);

				// AsyncStorage.multiSet([
				// 	['access_token', response.data['access_token']],
				// ]);

				this.refreshToken();
			} else {
				this.refreshToken();
			}
		}).catch(err => console.error('An error occurred', err));
	}

	checkLoginFields() {
		const {email, password} = this.state;
		
		if ( !EmailValidator.validate(email) ) {
			this.alertDialog.alertWithType('warn', 'Input Error', 'Please enter valid email');
			return false;
		}

		if ( !password ) {
			this.alertDialog.alertWithType('warn', 'Input Error', 'Password needs to be longer than 6 characters');
			return false;
		}

		return true;
	}

	handleLogin() {

		if ( !this.checkLoginFields() ) return;

		const {email, password} = this.state;
		this.setState({buttonState: BTN_STATE.BUSY});
		let _this = this;
		
		const params = qs.stringify(
			{
				'grant_type':'password',
				'username':email,
				'password':password,
				'client_id':'mobileapp'
			}
		);
		
		const headers = {
			'Content-Type': 'application/x-www-form-urlencoded'
		};
		
		axios.post(
			AppConstants.ROOT_URL + 'mobile/token', params, headers
		)
			.then(
				function (response) {
					console.log("=================Login Success=================");
					console.log(response.data);
					_this.setState({loading: false});
// debugger;
					AsyncStorage.multiSet([
						['access_token', response.data['access_token']],
						['refresh_token', response.data['refresh_token']],
						['user_name', response.data['userName']],
						['token_type', response.data['token_type']],
					]);
					setTimeout(() => {
						_this.props.onChangePage(4);
						_this.props.onLoginSuccess(response.data);
					}, 1000);

					_this.setState({buttonState: BTN_STATE.SUCCESS});

					_this.registerDeviceToken();
				}
			)
			.catch(
				function (error) {
					console.log("=================Login FAILED=================");
					_this.setState({buttonState: BTN_STATE.FAILED, loading: false});

					AsyncStorage.multiRemove(['access_token', 'refresh_token', 'user_name', 'token_type']);
					setTimeout(() => {
						_this.setState({buttonState: BTN_STATE.IDLE});
					}, 1000);
					
					const resData = error.response.data;
					_this.alertDialog.alertWithType(
						'error',
						'Login Error',
						resData ? resData['error_description'] : 'Please try again...'
					);
				}
			);
	}

	refreshToken() {
		let _this = this;
		AsyncStorage.getItem('refresh_token')
			.then((value) => {
				if (!value) return;
				_this.setState({autoLoginState: BTN_STATE.BUSY});
				
				const params = qs.stringify(
					{
						'grant_type':'refresh_token',
						'refresh_token':value,
						'client_id':'mobileapp'
					}
				);
				
				const headers = {
					'Content-Type': 'application/x-www-form-urlencoded'
				};
				
				axios.post(
					AppConstants.ROOT_URL + 'mobile/token', params, headers
				)
					.then(
						function (response) {
							console.log("=================Login Success=================");
							console.log(response.data);

							AsyncStorage.multiSet([
								['access_token', response.data['access_token']],
								['refresh_token', response.data['refresh_token']],
								['user_name', response.data['userName']],
								['token_type', response.data['token_type']]
								// ['last_login', moment().valueOf()]
							]);

							_this.setState({autoLoginState: BTN_STATE.SUCCESS, loading: false});
							_this.props.onChangePage(4);
							_this.props.onLoginSuccess(response.data);
							_this.registerDeviceToken();
						}
					)
					.catch(
						function (error) {
							console.log("=================Login FAILED=================");
							_this.setState({autoLoginState: BTN_STATE.FAILED, loading: false});

							AsyncStorage.multiRemove(['access_token', 'refresh_token', 'user_name', 'token_type']);

							_this.alertDialog.alertWithType(
								'error',
								'Failed to Auto login',
								'Please login again...'
							);

							setTimeout(() => {
								_this.setState({buttonState: BTN_STATE.IDLE});
							}, 500);
						}
					);
			})
			.catch((e) => {
				console.log(e);
			});
	}

	registerDeviceToken() {
    AsyncStorage.getItem('fcm_token')
      .then((fcm_token) => {
        if (!fcm_token) return;

				AsyncStorage.getItem('access_token')
					.then((access_token) => {

            // store fcm token in your server
            const params = JSON.stringify({
              deviceId: fcm_token,
            });

            const headers = {
              'Authorization': 'Bearer ' + access_token
            };

            const url = AppConstants.BASE_URL + 'registerDevice';
            console.log(url);
            axios.post(
              url,
              params,
              {
                headers: headers
              }
            )
              .then(
                function (response) {
                  console.log("=================Register Device Success=================");
                  console.log(response.data);
                }
              )
              .catch(
                function (error) {
                  console.log("=================Register Device FAILED=================");
                  const response = error.response.data;
                  console.log(response.Message);
                }
              );
					})
        .catch((error) => {
          console.log(error);
        });
      });
	};

	onCloseAlert(data) {
	}

	handleForgotPassword() {
		this.props.onChangePage(2);
	}

	handleSignUp() {
		this.props.onChangePage(0);
	}

	renderLoginButton() {
		return (
			<AwesomeButton
				states={{
            idle: {
              text: 'SIGN IN',

              iconAlignment: 'left',
              backgroundStyle: {
                backgroundColor: AppColors.colorPrimary,
                minHeight: 40,
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 20
              },
              labelStyle: {
                color: 'white',
                alignSelf: 'center',
                fontWeight: 'bold'
              },
              onPress: this.handleLogin
            },
            busy: {
              text: 'Signing In',
              spinner: true,
              spinnerProps: {
                animated: true,
                color: 'white'
              },
              backgroundStyle: {
                backgroundColor: '#006565',
                minHeight: 40,
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 20
              },
              labelStyle: {
                color: 'white',
                alignSelf: 'center',
                marginLeft: 10,
                fontWeight: 'bold'
              }
            },
            success: {
              text: 'SUCCESS',
              backgroundStyle: {
                backgroundColor: 'green',
                minHeight: 40,
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 20
              },
              labelStyle: {
                color: 'white',
                alignSelf: 'center',
                fontWeight: 'bold'
              }
            },
            failed: {
              text: 'FAILED',
              backgroundStyle: {
                backgroundColor: AppColors.colorRed,
                minHeight: 40,
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 20
              },
              labelStyle: {
                color: 'white',
                alignSelf: 'center',
                fontWeight: 'bold'
              }
            }
          }}
				transitionDuration={400}
				buttonState={this.state.buttonState}
			/>
		)
	}

	renderSignUpButton() {
		return (
			<AwesomeButton
				states={{
            default: {
              text: 'SIGN UP',
              backgroundStyle: {
                backgroundColor: AppColors.colorPrimary,
                minHeight: 40,
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 20
              },
              labelStyle: {
                color: '#FFF',
                fontWeight: 'bold'
              },

              onPress: this.handleSignUp
            }
          }}
			/>
		)
	}

	renderForgotPasswordButton() {
		return (
			<AwesomeButton
				states={{
            default: {
              text: 'Forgot password?',
              backgroundStyle: {
                backgroundColor: 'rgba(0,0,0,0)',
                minHeight: 30,
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 15
              },
              labelStyle: {
                color: AppColors.textPrimary,
                fontWeight: '500'
              },

              onPress: this.handleForgotPassword
            }
          }}
			/>
		)
	}

	render() {

		return (
			<View style={styles.loginContainer}>
				<Text style={styles.title}>Sign In</Text>
				<OpaqueCard>
					<View style={styles.containerStyle}>


						<Kohana
							autoCapitalize={'none'}
							style={{ backgroundColor: '#fff', borderRadius: 4 }}
							label={'Email'}
							iconClass={MaterialsIcon}
							iconName={'email'}
							iconColor={AppColors.textSecondary}
							labelStyle={{ color: AppColors.textSecondary}}
							inputStyle={{ color: AppColors.textPrimary}}
							value={this.state.email}
							onChangeText={email => this.setState({ email: email.trim() })}
						/>
					</View>

					<View style={styles.containerStyle}>
						<Kohana
							secureTextEntry
							autoCapitalize={'none'}
							style={{ backgroundColor: '#fff', borderRadius: 4 }}
							label={'Password'}
							iconClass={MaterialsIcon}
							iconName={'lock'}
							iconColor={AppColors.textSecondary}
							labelStyle={{ color: AppColors.textSecondary}}
							inputStyle={{ color: AppColors.textPrimary}}
							value={this.state.password}
							onChangeText={password => this.setState({ password: password })}
						/>
					</View>
					{this.state.errorMessage ?
						<Text style={styles.errorMessage}>
							{this.state.errorMessage}
						</Text>
						:
						null
					}
					<View style={styles.containerStyle}>
						<View style={{flex: 1, flexDirection: 'column'}}
						>
							{this.renderLoginButton()}
						</View>
					</View>

					<View style={styles.containerStyle}>
						<View style={{flex: 1, flexDirection: 'column'}}
						>
							{this.renderForgotPasswordButton()}
						</View>
					</View>
				</OpaqueCard>

				<View style={styles.containerStyle}>
					<View style={{flex: 1, flexDirection: 'column', marginHorizontal: 100, marginTop: 20}}
					>
						{this.renderSignUpButton()}
					</View>
				</View>

				 <Spinner visible={this.state.loading} textContent={"Loading..."} textStyle={{color: '#FFF'}} /> 

				<DropdownAlert
					ref={(ref) => this.alertDialog = ref}
					onClose={(data) => this.onCloseAlert(data)} />

			</View>
		);
	}
}

const styles = StyleSheet.create({
	loginContainer: {
		flex: 1,
		backgroundColor: 'rgba(0,0,0,0)'
	},
	title: {
		marginTop: 40,
		marginBottom: 30,
		alignSelf: 'center',
		fontSize: 20,
		fontWeight: '500',
		color: '#fff'
	},
	errorMessage: {
		color: 'red',
		backgroundColor: '#fff',
		alignSelf: 'stretch',
		paddingLeft: 20,
		paddingVertical: 10
	},
	containerStyle: {
		backgroundColor: 'rgba(255,255,255,0)',
		paddingVertical: 8,
		justifyContent: 'flex-start',
		flexDirection: 'row',
		borderColor: '#4caf50',
		position: 'relative'
	}
});

export default Authentication;
