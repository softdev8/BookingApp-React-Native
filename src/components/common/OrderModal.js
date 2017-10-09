import React, {Component} from 'react';
import {AppColors, AppFonts, AppStyles, AppSizes, AppConstants, AppErrors} from '../../constants';
import {StyleSheet, View, Alert, Text, ScrollView} from 'react-native';
import {Actions} from 'react-native-router-flux';
import Icon from 'react-native-vector-icons/FontAwesome';
import AwesomeButton from '../../libs/AwesomeButton';
import {Sae} from '../../libs/AwesomeInput';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view'
import axios from 'axios';
import {connect} from 'react-redux';

const BTN_STATE = {
	IDLE: 'idle',
	BUSY: 'busy',
	SUCCESS: 'success',
	FAILED: 'failed'
};


class OrderModal extends Component {

	constructor(props) {
		super(props);

		this.state = {
			quantity: 1,
			orderState: BTN_STATE.IDLE,
		};

		this.validateInputFields = this.validateInputFields.bind(this);
		this.onOrder = this.onOrder.bind(this);
	}

	onOrder() {
		if (!this.validateInputFields()) {
			return;
		}

		const _this = this;

		let params = {
			ISBN: this.props.Isbn,
			Quantity: this.state.quantity,
			OrderType: this.props.OrderType,
			title: this.props.Title,
		};

		_this.setState({orderState: BTN_STATE.BUSY});
		const headers = {
			'Authorization': this.props.token
		};
		axios.post(
			AppConstants.BASE_URL + 'orderBook',
			JSON.stringify(params),
			{
				headers: headers
			}
		)
			.then(
				function (response) {
					console.log("=================Order Request Success=================");
					_this.setState({orderState: BTN_STATE.SUCCESS});
					setTimeout(()=>{
						_this.props.onOrderSuccess(response.data);
					}, 1500);
				}
			)
			.catch(
				function (error) {
					console.log("=================Order Request FAILED=================");
					_this.setState({orderState: BTN_STATE.FAILED});
					const resData = error.response.data;
          if (error.response.status === AppErrors.AUTH_FAILED) {
            Actions.auth({ redirect: '' });
            return;
          }
					setTimeout(()=>{
						_this.props.onOrderFailed(0, resData ? resData.Message : null);
					}, 1500);
				}
			);
	}

	renderOrderButton() {
		return (
			<AwesomeButton
				states={{
            idle: {
              text: 'Place Order',

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
              onPress: this.onOrder
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
				buttonState={this.state.orderState}
			/>
		)
	}

	validateInputFields() {
		if (!this.state.quantity) {
			Alert.alert('Input Error', 'Please input quantity.', [{text: 'OK', onPress: () => console.log('OK Pressed')}]);
			return false;
		}

		return true;
	}

	render() {

		const {Title, Isbn, Author, Description, Price, Image, onOrderSuccess, onOrderFailed} = this.props;
		const {quantity} = this.state;

		return (
			<View style={styles.container}>			
				<ScrollView style={styles.scrollview}>	
						<View style={[AppStyles.row, AppStyles.centerAligned]}>
							<Text style={styles.itemTitle}> {Title} </Text>
						</View>

						<View style={[AppStyles.row, {paddingVertical: 2}]}>
							<Icon name="code" style={styles.iconCommon}/>
							<Text style={styles.commonText}> {`ISBN: ${Isbn}`} </Text>
						</View>

						<View style={[AppStyles.row, {paddingVertical: 2}]}>
							<Icon name="user" style={styles.iconCommon}/>
							<Text style={styles.commonText}> {Author} </Text>
						</View>

						<View style={[AppStyles.row, {paddingVertical: 2}]}>
							<Icon name="info-circle" style={styles.iconCommon}/>
							<Text style={styles.commonText}> {Description} </Text>
						</View>

						<View style={[AppStyles.row, {paddingVertical: 2}]}>
							<Text style={[styles.commonText]}> R </Text>
							<Text style={[styles.commonText, {width: 60}]} numberOfLines={1}> {Price} </Text>
						</View>
					</ScrollView>
					<Sae
						label={'Order Amount'}
						iconClass={Icon}
						iconName={'pencil'}
						iconColor={AppColors.colorPrimary}
						// TextInput props
						autoCorrect={false}
						labelStyle={{ color: AppColors.colorPrimary, fontWeight: '300'}}
						inputStyle={{ color: AppColors.textPrimary}}
						value={quantity.toString()}
						onChangeText={quantity => this.setState({ quantity: quantity.trim() })}
						keyboardType={'numeric'}
						selectTextOnFocus={true}
					/>

					<View style={[AppStyles.row, {marginTop: 30}]}>
						
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

											onPress: ()=>{ onOrderFailed(1) }
										}
									}}
							/>
						</View>
						<View style={[{flex: 1}, AppStyles.centerAligned]}>{ this.renderOrderButton() }</View>

					</View>					
			</View>
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
		fontWeight: 'bold',
		color: AppColors.colorPrimary,
	},

	commonText: {
		color: AppColors.textSecondary,
	},
	scrollview: {
		height: 170
	}
});

const mapStateToProps = (state) => {
	return {
		token: state.auth.token,
	};
};

export default connect(mapStateToProps, {})(OrderModal);

