import React, {Component} from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import {OpaqueCard} from './common';
import MaterialsIcon from 'react-native-vector-icons/MaterialIcons';
import {Kohana} from '../libs/AwesomeInput';
import {AppColors, AppFonts, AppStyles, AppSizes, AppConstants} from '../constants';
import AwesomeButton from '../libs/AwesomeButton';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view'
import * as EmailValidator from 'email-validator';
import DropdownAlert from 'react-native-dropdownalert'
import CheckBox from '../libs/CheckBox';
import axios from 'axios';

const BTN_STATE = {
	IDLE: 'idle',
	BUSY: 'busy',
	SUCCESS: 'success',
	FAILED: 'failed'
};

class AuthSignUp extends Component {

	constructor() {
		super();
		this.state = {
			title: '',
			firstName: '',
			lastName: '',
			email: '',
			confirmEmail: '',
			password: '',
			confirmPassword: '',
			buttonState: BTN_STATE.IDLE,
			agreeTerms: false
		};

		this.handleSignUp = this.handleSignUp.bind(this);
	}

	onBack() {
		this.props.onChangePage(1);
	}

	handleSignUp() {

		if (!this.checkRegisterFields()) {
			return;
		}

		const {email, password, confirmPassword, firstName, lastName} = this.state;
		this.setState({buttonState: BTN_STATE.BUSY});
		let _this = this;

		const params = JSON.stringify({
			email: email,
			password: password,
			confirmPassword: password,
			name: firstName,
			surname: lastName,
			branchCode: 'MOS'
		});
		
		const headers = {
			'Content-Type': 'application/json'
		};

		axios.post(
			AppConstants.BASE_URL + 'register',
			params,
			{
				headers: headers
			}
		)
			.then(
				function (response) {
					_this.setState({buttonState: BTN_STATE.SUCCESS});
					console.log("=================Register Success=================");
					console.log(JSON.stringify(response.data));
					setTimeout(() => {
						_this.alertDialog.alertWithType(
							'success',
							'Signup Success',
							response.data ? response.data : 'Signup Success...'
						);
					}, 200);

					setTimeout(() => {
						_this.props.onChangePage(1);
					}, 2000);
				}
			)
			.catch(
				function (error) {
					console.log("=================Register FAILED=================");
					_this.setState({buttonState: BTN_STATE.FAILED});

					const response = error.response.data;
					_this.alertDialog.alertWithType(
						'error',
						'Login Error',
						response.Message ? response.Message : 'Please try again...'
					);
					
					setTimeout(() => {
						_this.setState({buttonState: BTN_STATE.IDLE});
					}, 1000);
				}
			);
	}

	checkRegisterFields() {
		const { firstName, lastName, email, confirmEmail, password, confirmPassword, agreeTerms } = this.state;

		if ( !agreeTerms ) {
			this.alertDialog.alertWithType('warn', 'Input Error', 'Please check our Terms of Use');
			return false;
		}

		if ( !firstName ) {
			this.alertDialog.alertWithType('warn', 'Input Error', 'Please enter your first name');
			return false;
		}

		if ( !lastName ) {
			this.alertDialog.alertWithType('warn', 'Input Error', 'Please enter your last name');
			return false;
		}

		if ( !EmailValidator.validate(email) ) {
			this.alertDialog.alertWithType('warn', 'Input Error', 'Please enter valid email');
			return false;
		}

		if ( email !== confirmEmail ) {
			this.alertDialog.alertWithType('warn', 'Input Error', 'Please enter your email again');
			return false;
		}

		if ( !password || password.length < 6 ) {
			this.alertDialog.alertWithType('warn', 'Input Error', 'Password needs to be longer than 6 characters');
			return false;
		}

		if ( password !== confirmPassword ) {
			this.alertDialog.alertWithType('warn', 'Input Error', 'Password and confirmation password don\'t match');
			return false;
		}

		return true;
	}

	onCloseAlert(data) {
		console.log("Alert", JSON.stringify(data));
	}

	renderSignUpButton() {
		return (
			<AwesomeButton
				states={{
            idle: {
              text: 'REGISTER',
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
              onPress: this.handleSignUp
            },
            busy: {
              text: 'Registering',
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

	render() {

		return (
			<KeyboardAwareScrollView style={styles.loginContainer}>
				<View style={{flexDirection: 'row', marginTop: 40, marginBottom: 30, paddingHorizontal: 10}}>
					<AwesomeButton
						states={{
            default: {
            	icon: <MaterialsIcon name="chevron-left" color="rgba(255, 255, 255, .9)" size={24} />,
							iconAlignment: 'left',
							text: '',
              backgroundStyle: {
                backgroundColor: 'rgba(0,0,0,0)',
                minHeight: 24,
                width: 30,
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 15
              },
              labelStyle: {
                color: 'white',
                fontWeight: '500',
                fontSize: 18
              },

              onPress: this.onBack.bind(this)
            }
          }}
					/>
					<Text style={styles.title}>Register</Text>
				</View>
				<OpaqueCard>

					<View style={styles.containerStyle}>
						<Kohana
							autoCapitalize={'none'}
							style={{ backgroundColor: '#fff', borderRadius: 4 }}
							label={'First Name'}
							iconClass={MaterialsIcon}
							iconName={'account-circle'}
							iconColor={AppColors.textSecondary}
							labelStyle={{ color: AppColors.textSecondary}}
							inputStyle={{ color: AppColors.textPrimary}}
							value={this.state.firstName}
							onChangeText={firstName => this.setState({ firstName })}
						/>
					</View>

					<View style={styles.containerStyle}>
						<Kohana
							autoCapitalize={'none'}
							style={{ backgroundColor: '#fff', borderRadius: 4 }}
							label={'Last Name'}
							iconClass={MaterialsIcon}
							iconName={'account-circle'}
							iconColor={AppColors.textSecondary}
							labelStyle={{ color: AppColors.textSecondary}}
							inputStyle={{ color: AppColors.textPrimary}}
							value={this.state.lastName}
							onChangeText={lastName => this.setState({ lastName })}
						/>
					</View>

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
							onChangeText={email => this.setState({ email })}
						/>
					</View>

					<View style={styles.containerStyle}>
						<Kohana
							autoCapitalize={'none'}
							style={{ backgroundColor: '#fff', borderRadius: 4 }}
							label={'Re-enter Email'}
							iconClass={MaterialsIcon}
							iconName={'email'}
							iconColor={AppColors.textSecondary}
							labelStyle={{ color: AppColors.textSecondary}}
							inputStyle={{ color: AppColors.textPrimary}}
							value={this.state.confirmEmail}
							onChangeText={confirmEmail => this.setState({ confirmEmail })}
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
							onChangeText={password => this.setState({ password })}
						/>
					</View>

					<View style={styles.containerStyle}>
						<Kohana
							secureTextEntry
							autoCapitalize={'none'}
							style={{ backgroundColor: '#fff', borderRadius: 4 }}
							label={'Re-enter Password'}
							iconClass={MaterialsIcon}
							iconName={'lock'}
							iconColor={AppColors.textSecondary}
							labelStyle={{ color: AppColors.textSecondary}}
							inputStyle={{ color: AppColors.textPrimary}}
							value={this.state.confirmPassword}
							onChangeText={confirmPassword => this.setState({ confirmPassword })}
						/>
					</View>

					<View style={styles.containerStyle}>
						<View style={[{flex: 1, flexDirection: 'row'}, AppStyles.centerAligned]}
						>
							<CheckBox
								onClick={()=>this.setState({agreeTerms: !this.state.agreeTerms})}
								isChecked={this.state.agreeTerms}
								rightText="I agree"
							/>

							<TouchableOpacity
								style={{flex: 1}}
								onPress={() => { this.props.onChangePage(3); }}>
								<Text style={{fontStyle: 'italic', color: AppColors.colorPrimary, textDecorationLine:'underline'}}> Terms of use </Text>
							</TouchableOpacity>
						</View>
					</View>

					<View style={styles.containerStyle}>
						<View style={{flex: 1, flexDirection: 'column'}}
						>
							{this.renderSignUpButton()}
						</View>
					</View>


				</OpaqueCard>
				<DropdownAlert
					ref={(ref) => this.alertDialog = ref}
					onClose={(data) => this.onCloseAlert(data)} />
			</KeyboardAwareScrollView>
		);
	}
}

const styles = StyleSheet.create({
	loginContainer: {
		flex: 1,
		backgroundColor: 'rgba(0,0,0,0)'
	},
	title: {
		flex: 1,
		alignSelf: 'center',
		textAlign: 'center',
		fontSize: 20,
		marginRight: 24,
		fontWeight: '500',
		color: '#fff'
	},
	errorMessage: {
		color: 'red',
		backgroundColor: 'rgba(0,0,0,0)',
		alignSelf: 'center',
		paddingVertical: 10
	},
	containerStyle: {
		backgroundColor: 'rgba(255,255,255,0)',
		paddingVertical: 4,
		justifyContent: 'flex-start',
		flexDirection: 'row',
		borderColor: '#4caf50',
		position: 'relative'
	}
});

export default AuthSignUp;
