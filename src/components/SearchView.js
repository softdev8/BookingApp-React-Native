import React, {Component} from 'react';
import {View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert, Keyboard} from 'react-native';
import {AppColors, AppFonts, AppStyles, AppSizes, AppConstants, AppErrors} from '../constants';
import {Kohana} from '../libs/AwesomeInput';
import MaterialsIcon from 'react-native-vector-icons/MaterialIcons';
import Icon from 'react-native-vector-icons/FontAwesome';
import {connect} from 'react-redux';
import axios from 'axios';
import Modal from '../libs/ModalBox';
import OrderModal from './common/OrderModal';
import AwesomeButton from '../libs/AwesomeButton';

let axiosCancelToken = axios.CancelToken;
let axiosCancel;

const BTN_STATE = {
	IDLE: 'idle',
	BUSY: 'busy',
	SUCCESS: 'success',
	FAILED: 'failed'
};

class SearchView extends Component {

	constructor(props) {
		super(props);

		this.state = {
			keyword: '',
			searchList: [],
			orderIndex: -1,
			buttonState: BTN_STATE.IDLE,
		};
		
		this.lastSearchResult = [];

		this.onSearch = this.onSearch.bind(this);
		this.renderSearchList = this.renderSearchList.bind(this);
		this.onSelectItem = this.onSelectItem.bind(this);
	}

	onSearch() {
		if (!this.state.keyword || this.state.keyword.length === 0) {
			Alert.alert( 'Input error', 'Please input Search Keyword', [ {text: 'OK', onPress: () => console.log('OK Pressed')} ] );
			return;
		}
		
		Keyboard.dismiss();
		let _this = this;
		
		const headers = {
			'Authorization': this.props.token
		};
		
		this.setState({buttonState: BTN_STATE.BUSY, searchList: []});
		
		axios.post(
			AppConstants.BASE_URL + 'bookSearch',
			JSON.stringify({ filter: this.state.keyword}),
			{
				headers: headers,
				cancelToken: new axiosCancelToken(function executor(cancel) {
					// An executor function receives a cancel function as a parameter
					debugger;
					axiosCancel = cancel;
				})
			}
		)
			.then(
				function (response) {
					console.log("=================Search Success=================");
					_this.setState({buttonState: BTN_STATE.IDLE, searchList: response.data});
					_this.lastSearchResult = response.data;
				}
			)
			.catch(
				function (thrown) {
					debugger;
					if (axios.isCancel(thrown)) {
						console.log('Request canceled', thrown.message);
						setTimeout(()=> {
							Alert.alert( 'Request Aborted', thrown.message, [ {text: 'OK', onPress: () => console.log('OK Pressed')} ] );
							_this.setState({buttonState: BTN_STATE.IDLE, searchList: _this.lastSearchResult});
						}, 100);
					} else {
						// handle error
						console.log("=================Search FAILED=================");
						console.log(thrown);
            if (thrown.response.status === AppErrors.AUTH_FAILED) {
              Actions.auth({ redirect: 'searchView' });
              return;
            }
            _this.setState({buttonState: BTN_STATE.FAILED});
						
						Alert.alert( 'Search Failed', 'Failed to search your keyword...', [ {text: 'OK', onPress: () => console.log('OK Pressed')} ] );
						setTimeout(()=> {
							_this.setState({buttonState: BTN_STATE.IDLE});
						}, 2000);
					}
				}
			);

	}
	
	cancelSearch() {
		axiosCancel('Operation has been aborted by the user.');
	}

	onSelectItem(index) {
		debugger;
		this.setState({orderIndex : index});
		this.refs.orderModal.open();
	}

	onOrderSuccess(message) {
		Alert.alert('Success', message, [{
			text: 'OK',
			onPress: () => console.log('OK Pressed')
		}]);
		
		this.lastSearchResult[this.state.orderIndex].OrderStatus = "Ordered";
		this.setState({searchList: this.lastSearchResult});
		
	}
	
	onOrderFailed(response, message) {
		if (response === 0) {
			// Failed to place an order
			Alert.alert('Failed to place an Order', message ? message : 'We are sorry. Please try again later.', [{
				text: 'OK',
				onPress: () => console.log('OK Pressed')
			}]);
		} else {
			// Cancelled
		}
		this.refs.orderModal.close();
		this.setState({orderIndex: -1});
	}
	
	renderSearchButton() {
		return (
			<View style={{paddingHorizontal: 4}}>
				<AwesomeButton
					states={{
						idle: {
							text: 'Search',
							iconAlignment: 'left',
							backgroundStyle: {
								backgroundColor: AppColors.colorPrimary,
								minHeight: 40,
								width: 100,
								alignItems: 'center',
								justifyContent: 'center',
								borderRadius: 20
							},
							labelStyle: {
								color: 'white',
								alignSelf: 'center',
								fontWeight: 'bold'
							},
							onPress: this.onSearch
						},
						busy: {
							text: 'Cancel',
							spinner: true,
							spinnerProps: {
								animated: true,
								color: 'white'
							},
							backgroundStyle: {
								backgroundColor: '#006565',
								minHeight: 40,
								width: 100,
								alignItems: 'center',
								justifyContent: 'center',
								borderRadius: 20
							},
							labelStyle: {
								color: 'white',
								alignSelf: 'center',
								fontWeight: 'bold'
							},
							onPress: this.cancelSearch
						},
						failed: {
							text: 'FAILED',
							backgroundStyle: {
								backgroundColor: AppColors.colorRed,
								minHeight: 40,
								width: 100,
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
			</View>
		)
	}

	renderSearchList() {
		const {searchList} = this.state;
		return(
			<ScrollView>
				{
					searchList.map((item, index)=> {
						return (
							<TouchableOpacity key={item.ISBN}
							                  onPress={ () => this.onSelectItem(index) }
							>
								<View style={[AppStyles.row, {justifyContent: 'center', alignItems: 'center', padding: 8, borderColor: AppColors.listItemBackground, borderBottomWidth: 1}]}>
									<View style={styles.itemContainer}>
										<View style={AppStyles.row}>
											<Icon name="book" style={styles.iconBig} />
											<Text style={styles.itemTitle} numberOfLines={1}> {item.Title} </Text>
										</View>

										<View style={AppStyles.row}>
											<Icon name="user" style={styles.iconCommon} />
											<Text style={styles.commonText} numberOfLines={1}> {item.Author} </Text>
										</View>

										<View style={AppStyles.row}>
											<Icon name="info-circle" style={styles.iconCommon} />
											<Text style={styles.commonText} numberOfLines={1}> {item.About} </Text>
										</View>

										<View style={AppStyles.row}>
											<Text style={[styles.commonText]}> R </Text>
											<Text style={[styles.commonText, {width: 60}]} numberOfLines={1}> {item.Price} </Text>

												<View style={[AppStyles.row, {flex: 1, marginRight: 30}]} numberOfLines={1}>
													<Text style={{flex: 1, textAlign: 'right', color: AppColors.colorPrimary}}>{`In Stock : ${item.OnHandStock}`}</Text>
													{
													item.OrderStatus ? <Text style={{flex: 1, textAlign: 'left', color: 'green', marginLeft: 20}}>{item.OrderStatus}</Text>
													: <Text style={{flex: 1, textAlign: 'left', color: AppColors.base, marginLeft: 20}}>Order</Text>
													}
												</View>

										</View>
									</View>

									<Icon name="angle-right" style={{fontSize: 22, color: AppColors.textPrimary}} />
								</View>
							</TouchableOpacity>
						)
					})
				}
			</ScrollView>
		)
	}

	render() {
		const {searchList, orderIndex} = this.state;

		return (
			<View style={[AppStyles.navContainer, styles.container]}>

				<Modal
					ref={"orderModal"}
					position={"top"}
					swipeToClose={false}
					style={[AppStyles.modal, {marginTop: 50}]}
				>
					{
						searchList.length > 0 && orderIndex >= 0 ?
							<OrderModal
								Title={searchList[orderIndex].Title}
								Isbn={searchList[orderIndex].ISBN}
								Author={searchList[orderIndex].Author}
								Description={searchList[orderIndex].About}
								Price={searchList[orderIndex].Price}
								Image={null}
								onOrderSuccess={this.onOrderSuccess.bind(this)}
								onOrderFailed={this.onOrderFailed.bind(this)}
								OrderType={0}
							/>
							: null
					}

				</Modal>

				<View style={AppStyles.row}>
					<Kohana
						autoCapitalize={'none'}
						style={{ flex: 3, backgroundColor: '#fff', borderRadius: 4, marginBottom: 16, borderColor:AppColors.colorPrimary, borderWidth: 1}}
						label={'Search...'}
						iconClass={MaterialsIcon}
						iconName={'search'}
						iconColor={AppColors.textSecondary}
						labelStyle={{ color: AppColors.textSecondary}}
						inputStyle={{ color: AppColors.textPrimary}}
						onChangeText={ (keyword) => this.setState({ keyword }) }
					/>
					{this.renderSearchButton()}
					{/*<Button style={{flex:1, backgroundColor: AppColors.colorPrimary, borderWidth: 0, height: 42, marginLeft :4}}*/}
					        {/*textStyle={{fontSize: 14, color: 'white', fontWeight: 'bold'}}*/}
					        {/*onPress={this.onSearch}*/}
					{/*>*/}
						{/*Search*/}
					{/*</Button>*/}
				</View>
				{this.renderSearchList()}
			</View>
		);
	}
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 4,
		backgroundColor: AppColors.background
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
		fontSize: 16,
		color: AppColors.textPrimary,
	},

	commonText: {
		color: AppColors.textSecondary,
	}
});

const mapStateToProps = (state) => {
	return {
		token: state.auth.token,
	};
};

export default connect(mapStateToProps, {})(SearchView);