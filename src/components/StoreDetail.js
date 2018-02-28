import React, {Component} from 'react';
import {View, Text, StyleSheet, Alert, TouchableOpacity, TextInput, TouchableHighlight} from 'react-native';
import {AppColors, AppFonts, AppStyles, AppSizes, AppConstants, AppErrors} from '../constants';
import {Actions} from 'react-native-router-flux';
import {fetchRatings, openTab} from '../actions';
import Spinner from 'react-native-loading-spinner-overlay';
import Icon from 'react-native-vector-icons/FontAwesome';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {connect} from 'react-redux';
import Modal from '../libs/ModalBox';
import StoreRateModal from './common/StoreRateModal';
import axios from 'axios';

class StoreDetail extends Component {
	constructor(props) {
		super(props);

		this.state = {
			loading: false,
			rating: null
		};
	}

	componentDidMount() {
		if (this.props.ratings == null) {
			this.retrieveRatings();
		}
	}

	getRatingForStore(ratings) {
		const {branch} = this.props;
		const _this = this;
		ratings.map( (rating) => {
			if (rating.BranchId == branch.Id) {
				_this.setState({rating});
			}
		});
	}

	retrieveRatings() {
		let _this = this;
		const headers = {
			'Authorization': this.props.token
		};
		axios.get(
			AppConstants.BASE_URL + 'retrieveRatings',
			{
				headers: headers
			}
		)
			.then(
				function (response) {
					_this.props.fetchRatings(response.data);
					_this.getRatingForStore(response.data);
				}
			)
			.catch(
				function (error) {
          console.log(error.response);
					_this.setState({loading: false});
          if (error.response.status === AppErrors.AUTH_FAILED) {
            Actions.auth({ redirect: 'storeDetail' });
            return;
          }
					setTimeout(()=> {
						Alert.alert(
							'Fetch Error',
							'Failed to fetch Rating Criteria...',
							[
								{text: 'OK', onPress: () => console.log('OK Pressed')},
							],
							{ cancelable: false }
						);
					}, 200);
				}
			);
	}

	onRateUs() {
		this.refs.rateModal.open();
	}

	onSubmitSuccess(message) {
		this.refs.rateModal.close();
		Alert.alert('Success', message, [{
			text: 'OK',
			onPress: () => console.log('OK Pressed')
		}]);
	}

	onSubmitFailed(response) {
		if (response == 0) {
			// Failed to submit comment
			Alert.alert('Failed to submit your rating and comments', 'We are sorry. Please try again later.', [{
				text: 'OK',
				onPress: () => console.log('OK Pressed')
			}]);
		} else {
			// Cancelled
		}
		this.refs.rateModal.close();
	}

  _onPressMapMarker = () => {
    this._goStoreLocationMap();
  };

  _onPressLocationArrow = () => {
    this._goStoreLocationMap();
  };

  _goStoreLocationMap = () => {
    const {branch} = this.props;
    const title = `${branch.City} ${branch.Province}  ${branch.RegionalPerson}`;
    const latitude = Number(branch.Coordinates.split(",")[0]);
    const longitude = Number(branch.Coordinates.split(",")[1]);

    const coordinates = [ latitude.toFixed(6).toString(), longitude.toFixed(6).toString() ].join(',');
    // Actions.storeLocationMap({ title, coordinates });
    this.props.openTab({
      name: 'mapView',
      title,
      coordinates,
    });
	};

	render() {
		const {criteria, branch, title} = this.props;

		return (
			<View style={[AppStyles.navContainer, styles.container]}>
				<Spinner visible={this.state.loading} textStyle={{color: '#FFF'}}/>

				<Modal
					ref={"rateModal"}
					position={"top"}
				>
					<StoreRateModal
						criteria={criteria}
						branch={branch}
						title={title}
						rating={this.state.rating}
						onSubmitSuccess={this.onSubmitSuccess.bind(this)}
						onSubmitFailed={this.onSubmitFailed.bind(this)}
					/>

				</Modal>

				<View style={styles.branchContainer}>
					<Text style={[styles.colorPrimary, styles.title]}>Store Information</Text>
					<View style={AppStyles.row}>
						<Icon name="phone" style={styles.iconCommon}/>
						<Text style={styles.commonText}>{branch.Telephone} </Text>
					</View>

					<View style={AppStyles.row}>
						<Icon name="envelope-o" style={styles.iconCommon}/>
						<Text style={styles.commonText}>{branch.Email} </Text>
					</View>

					<View style={AppStyles.row}>
						<Icon name="user" style={[styles.iconCommon, styles.colorPrimary]}/>
						<Text style={styles.colorPrimary}>{branch.ManagerName} </Text>
					</View>

					{/*<View style={AppStyles.row}>*/}
						{/*<Icon name="code" style={[styles.iconCommon, styles.colorCommon]}/>*/}
						{/*<Text style={styles.colorCommon}>{branch.Code} </Text>*/}
					{/*</View>*/}

					<View style={AppStyles.row}>
						<TouchableHighlight onPress={this._onPressMapMarker}>
							<Icon name="map-marker" style={[styles.iconCommon, styles.colorCommon]}/>
						</TouchableHighlight>
						<Text
							style={styles.colorCommon}>{`${branch.ShopAndCentre} ${branch.Address_Street}  ${branch.Address_Suburb}`}</Text>
					</View>

					<View style={AppStyles.row}>
						<TouchableHighlight onPress={this._onPressLocationArrow}>
							<Icon name="location-arrow" style={[styles.iconCommon, styles.colorCommon]}/>
						</TouchableHighlight>
						<Text style={styles.colorCommon}>{`${branch.City} ${branch.Province}  ${branch.RegionalPerson}`}</Text>
					</View>

					<View style={[AppStyles.row, AppStyles.centerAligned]}>
						<TouchableOpacity
							onPress={this.onRateUs.bind(this)}
							style={styles.rateButton}
						>
							<View style={[AppStyles.row, AppStyles.centerAligned, styles.header]}>
								<Icon name="thumbs-up" style={[styles.iconBig, {color: 'white'}]}/>
								<Text style={{fontSize: 16, fontWeight: 'bold', color: 'white'}}>Rate Us</Text>
							</View>
						</TouchableOpacity>
					</View>
				</View>

			</View>
		);
	}
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: AppColors.background
	},

	iconBig: {
		fontSize: 18,
		marginTop: 0,
		marginRight: 5,
		textAlign: 'center'
	},

	iconCommon: {
		width: 26,
		fontSize: 12,
		marginTop: 3,
		textAlign: 'center'
	},

	branchContainer: {},

	title: {
		fontWeight: 'bold',
		fontSize: 16,
		textAlign: 'center',
		margin: 10
	},

	commonText: {
		color: AppColors.textPrimary
	},

	colorPrimary: {
		color: AppColors.colorPrimary
	},

	colorBase: {
		color: AppColors.base
	},

	colorCommon: {
		color: AppColors.textPrimary
	},
	weekday: {
		width: 110
	},

	workHour: {
		paddingLeft: 12,
	},

	header: {
		marginTop: 20,
		padding: 10,
		minHeight: 40,
		backgroundColor: AppColors.colorPrimary,
		borderRadius: 20
	},

	content: {
		paddingHorizontal: 10
	},

	textInput: {
		color: AppColors.textPrimary,
		height: 42
	},

	rateButton: {
		width: 150,

	},

	textInputWrapper: {
		minHeight: 50,
		borderColor: AppColors.colorPrimary,
		borderWidth: 1,
		padding: 4,
		borderRadius: 4,
		marginTop: 5
	}
});

const mapStateToProps = (state) => {
	return {
		token: state.auth.token,
		ratings: state.data.ratings,
	};
};

export default connect(mapStateToProps, {fetchRatings, openTab})(StoreDetail);
