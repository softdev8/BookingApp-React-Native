import React, {Component} from 'react';
import {connect} from 'react-redux';
import {View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert} from 'react-native';
import Spinner from 'react-native-loading-spinner-overlay';
import {AppColors, AppFonts, AppStyles, AppSizes, AppConstants, AppErrors} from '../constants';
import Icon from 'react-native-vector-icons/FontAwesome';
import axios from 'axios';

class OrderList extends Component {

	constructor(props) {
		super(props);

		this.state = {
			loading: false,
			orders: []
		};

		this.onSelectOrder = this.onSelectOrder.bind(this);
		this.retrieveOrders = this.retrieveOrders.bind(this);
	}

	componentDidMount() {
		this.retrieveOrders();
	}

	retrieveOrders() {
		let _this = this;
		this.setState({loading: true});
		
		const headers = {
			'Authorization': this.props.token
		};
		axios.get(
			AppConstants.BASE_URL + 'retrieveOrders',
			{
				headers: headers
			}
		)
			.then(
				function (response) {
					console.log("=================Retrieve Orders Success=================");
					console.log(response.data);
					_this.setState({orders:response.data, loading: false});
				}
			)
			.catch(
				function (error) {
					console.log("=================Retrieve Orders FAILED=================");

					_this.setState({loading: false});
					const response = error.response.data;
          if (error.response.status === AppErrors.AUTH_FAILED) {
            Actions.auth({ redirect: 'orderList' });
            return;
          }
					setTimeout(()=> {
						Alert.alert( 'Failed to retrieve Orders', response, [ {text: 'OK', onPress: () => console.log('OK Pressed')} ] );
					}, 200);
				}
			);
	}

	onSelectOrder(index) {
	}

	render() {
		const {orders} = this.state;
		return (
			<ScrollView style={AppStyles.navContainer}>
				<Spinner visible={this.state.loading} textStyle={{color: '#FFF'}}/>
				{
					orders.map((order, index) => {
						return (
							<TouchableOpacity key={`order-${index}`}
							                  onPress={ () => this.onSelectOrder(index) }
							>
								<View style={[AppStyles.row, {justifyContent: 'center', alignItems: 'center', padding: 8, borderColor: AppColors.listItemBackground, borderBottomWidth: 1}]}>
									<View style={styles.orderContainer}>
										<View style={AppStyles.row}>
											<Icon name="book" style={styles.iconBig} />
											<Text style={styles.bookName}> {order.Title ? order.Title : 'No Title'} </Text>
										</View>

										<View style={AppStyles.row}>
											<Text style={[styles.commonText, {marginLeft: 18}]}> Branch : </Text>
											<Text style={[styles.commonText, {color: AppColors.colorPrimary}]}> {order.Branch} </Text>
										</View>

										<View style={AppStyles.row}>
											<Text style={[styles.commonText, {marginLeft: 18}]}> Quantity : </Text>
											<Text style={[styles.commonText, {color: AppColors.colorPrimary}]}> {order.Quantity} </Text>
										</View>

										<View style={AppStyles.row}>
											<Text style={[styles.commonText, {marginLeft: 18}]}> Order Status : </Text>
											<Text style={[styles.commonText, {color: AppColors.colorPrimary}]}> {order.Status} </Text>
										</View>

										<View style={AppStyles.row}>
											<Text style={[styles.commonText, {marginLeft: 18}]}> Order Type : </Text>
											<Text style={[styles.commonText, {color: order.OrderType === 'Normal' ? AppColors.colorPrimary : AppColors.base}]}> {order.OrderType} </Text>
										</View>

										<View style={AppStyles.row}>
											<Text style={[styles.commonText, {marginLeft: 18}]}> ISBN : </Text>
											<Text style={[styles.commonText, {color: AppColors.colorPrimary}]}> {order.ISBN} </Text>
										</View>

									</View>

									{/*<Icon name="angle-right" style={{fontSize: 22, color: AppColors.textPrimary}} />*/}
								</View>
							</TouchableOpacity>
						)
					})
				}


			</ScrollView>
		);
	}
}

const styles = StyleSheet.create({
	iconBig: {
		width: 18,
		fontSize: 14,
		marginTop: 4,
		color: AppColors.textSecondary,
		textAlign: 'center'
	},
	bookName: {
		fontSize: 16,
		color: AppColors.textPrimary,
	},
	listContainer: {
		flex: 1
	},
	iconCommon: {
		width: 18,
		fontSize: 12,
		marginTop: 3,
		color: AppColors.textSecondary,
		textAlign: 'center'
	},
	orderContainer: {
		flex: 1,
	},
	commonText: {
		color: AppColors.textSecondary,
	}

});

const mapStateToProps = (state) => {
	return {
		token: state.auth.token
	};
};

export default connect(mapStateToProps, {})(OrderList);
