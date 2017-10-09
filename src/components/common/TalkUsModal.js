import React, {Component} from 'react';
import {AppColors, AppFonts, AppStyles, AppSizes, AppConstants, AppErrors} from '../../constants';
import {StyleSheet, View, Alert, Text, TextInput, TouchableWithoutFeedback, Keyboard} from 'react-native';
import {Actions} from 'react-native-router-flux';
import AwesomeButton from '../../libs/AwesomeButton';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view'
import axios from 'axios';
import {connect} from 'react-redux';

const BTN_STATE = {
	IDLE: 'idle',
	BUSY: 'busy',
	SUCCESS: 'success',
	FAILED: 'failed'
};


class TalkUsModal extends Component {

	constructor(props) {
		super(props);

		this.state = {
			comment: '',
			submitState: BTN_STATE.IDLE
		};

		this.validateInputFields = this.validateInputFields.bind(this);
		this.onSubmit = this.onSubmit.bind(this);
	}

	onSubmit() {
		if (!this.validateInputFields()) {
			return;
		}

		const _this = this;

		let params = {
			titleId: this.props.titleId,
			comment: this.state.comment,
		};

		_this.setState({submitState: BTN_STATE.BUSY});
		const headers = {
			'Authorization': this.props.token
		};
		axios.post(
			AppConstants.BASE_URL + 'talkToUs',
			JSON.stringify(params),
			{
				headers: headers
			}
		)
			.then(
				function (response) {
					console.log("=================Talk To Us Success=================");
					debugger;
					_this.setState({submitState: BTN_STATE.SUCCESS});
					_this.props.onSubmitSuccess(response.data);
					setTimeout(()=>{
						_this.setState({submitState: BTN_STATE.IDLE});
					}, 1500);
				}
			)
			.catch(
				function (error) {
					console.log("=================Talk To Us FAILED=================");
					_this.setState({submitState: BTN_STATE.FAILED});
					_this.props.onSubmitFailed(0);
          if (error.response.status === AppErrors.AUTH_FAILED) {
            Actions.auth({ redirect: '' });
            return;
          }
					debugger;
					setTimeout(()=>{
						_this.setState({submitState: BTN_STATE.IDLE});
					}, 1500);
				}
			);
	}

	renderSubmitButton() {
		return (
			<AwesomeButton
				states={{
            idle: {
              text: 'Submit',

              iconAlignment: 'left',
              backgroundStyle: {
                backgroundColor: AppColors.colorPrimary,
                minHeight: 40,
                width: 120,
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 20
              },
              labelStyle: {
                color: 'white',
                alignSelf: 'center',
                fontWeight: 'bold'
              },
              onPress: this.onSubmit
            },
            busy: {
              text: '',
              spinner: true,
              spinnerProps: {
                animated: true,
                color: 'white'
              },
              backgroundStyle: {
                backgroundColor: '#006565',
                minHeight: 40,
                width: 120,
                paddingLeft: 10,
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 20
              }
            },
            success: {
              text: 'SUCCESS',
              backgroundStyle: {
                backgroundColor: 'green',
                minHeight: 40,
                width: 120,
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
                width: 120,
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
				buttonState={this.state.submitState}
			/>
		)
	}

	validateInputFields() {
		if (!this.state.comment) {
			Alert.alert('Input Error', 'Please input comment.', [{text: 'OK', onPress: () => console.log('OK Pressed')}]);
			return false;
		}

		return true;
	}

	render() {

		const {Description, onSubmitFailed} = this.props;
		const {comment} = this.state;

		return (
			<KeyboardAwareScrollView style={styles.container}>

				<View style={[AppStyles.row, AppStyles.centerAligned ]}>
					<Text style={styles.itemTitle}> {Description} </Text>
				</View>

				<View style={styles.textInputWrapper} >
					<TouchableWithoutFeedback onPress={Keyboard.dismiss}>
						<TextInput
							style={styles.textInput}
							onChangeText={(comment) => this.setState({comment})}
							value={comment}
							multiline={true}
						/>
					</TouchableWithoutFeedback>
				</View>

				<View style={[AppStyles.row, {marginTop: 10}]}>
					
					<View style={[{flex: 1}, AppStyles.centerAligned]}>
						<AwesomeButton
							states={{
                  default: {
                    text: <Text>Cancel</Text>,
                    backgroundStyle: {
                      backgroundColor: AppColors.base,
                      minHeight: 40,
                      width: 120,
                      marginHorizontal: 20,
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: 20
                    },
                    labelStyle: {
                      color: '#FFF',
                      fontWeight: 'bold'
                    },

                    onPress: ()=>{ onSubmitFailed(1) }
                  }
                }}
						/>
					</View>
					<View style={[{flex: 1}, AppStyles.centerAligned]}>{ this.renderSubmitButton() }</View>

				</View>
			</KeyboardAwareScrollView>
		);
	}
}

const styles = StyleSheet.create({
	container: {
		margin: 20,
		backgroundColor: 'rgba(0,0,0,0)'
	},

	itemContainer: {
		flex: 1,
		paddingRight: 24
	},

	iconBig: {
		width: 18,
		fontSize: 14,
		marginTop: 4,
		color: AppColors.textSecondary,
		textAlign: 'center'
	},

	iconCommon: {
		width: 18,
		fontSize: 12,
		marginTop: 3,
		color: AppColors.textSecondary,
		textAlign: 'center'
	},

	itemTitle: {
		fontSize: 18,
		color: AppColors.colorPrimary,
		fontWeight: 'bold'
	},

	commonText: {
		color: AppColors.textSecondary,
	},

	textInputWrapper: {
		minHeight: 100,
		borderColor: AppColors.colorPrimary,
		borderWidth: 1,
		padding: 4,
		borderRadius: 4,
		marginTop: 20
	},

	textInput: {
		color: AppColors.textPrimary,
		height: 92
	}
});

const mapStateToProps = (state) => {
	return {
		token: state.auth.token,
	};
};

export default connect(mapStateToProps, {})(TalkUsModal);

