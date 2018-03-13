import React, {Component} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {OpaqueCard} from './common';
import MaterialsIcon from 'react-native-vector-icons/MaterialIcons';
import {Kohana} from '../libs/AwesomeInput';
import {AppColors, AppFonts, AppStyles, AppSizes, AppConstants} from '../constants';
import DropdownAlert from 'react-native-dropdownalert'
import AwesomeButton from '../libs/AwesomeButton';
import axios from 'axios';

const BTN_STATE = {
	IDLE: 'idle',
	BUSY: 'busy',
	SUCCESS: 'success',
	FAILED: 'failed'
};

class AuthResetPassword extends Component {

	constructor() {
		super();
		this.state = {
			email: '',
			errorMessage: '',
			buttonState: BTN_STATE.IDLE
		};

		this.handleResetPassword = this.handleResetPassword.bind(this);
	}

// 	onBack() {
// 		this.props.onChangePage(1);
// 	}

	handleResetPassword() {
		const {email} = this.state;


		if (!email) {
			this.alertDialog.alertWithType('warn', 'Input Error', 'Please enter valid email');
		} else {

			let _this = this;
			this.setState({buttonState: BTN_STATE.BUSY});

			axios.post(AppConstants.BASE_URL + 'resetPassword', JSON.stringify({email}))
				.then(
					function (response) {
						if (response.data == "No user found") {
							_this.setState({buttonState: BTN_STATE.FAILED});
						} else {
							_this.setState({buttonState: BTN_STATE.SUCCESS});
						}

						_this.alertDialog.alertWithType(
							'info',
							'',
							response.data
						);

						setTimeout(() => {
							_this.setState({buttonState: BTN_STATE.IDLE});
							_this.props.onChangePage(1);
						}, 2000);
					}
				)
				.catch(
					function (error) {
						_this.setState({buttonState: BTN_STATE.FAILED});
						debugger;

						const response = error.response.data;
						_this.alertDialog.alertWithType(
							'error',
							'Reset Password Error',
							response ? response.toString() : 'Please try again...'
						);


						setTimeout(() => {
							_this.setState({buttonState: BTN_STATE.IDLE});
						}, 2000);
					}
				);
		}
	}

	renderResetButton() {
		return (
			<AwesomeButton
				states={{
            idle: {
              text: 'RESET PASSWORD',
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
              onPress: this.handleResetPassword
            },
            busy: {
              text: 'Resetting...',
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
                backgroundColor: AppColors.base,
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
			<View style={styles.loginContainer}>
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
					<Text style={styles.title}>Reset Password</Text>
				</View>
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
							onChangeText={email => this.setState({ email })}
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
							{this.renderResetButton()}
						</View>
					</View>


				</OpaqueCard>

				<DropdownAlert ref={(ref) => this.alertDialog = ref} closeInterval={8000}/>

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
		paddingVertical: 8,
		justifyContent: 'flex-start',
		flexDirection: 'row',
		borderColor: '#4caf50',
		position: 'relative'
	}
});

export default AuthResetPassword;
