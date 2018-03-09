import React, {Component} from 'react';
import {View, Text, StyleSheet, Alert, ScrollView, Image, TouchableOpacity} from 'react-native';
import {AppColors, AppFonts, AppStyles, AppSizes, AppConstants, AppErrors} from '../constants';
import {Actions} from 'react-native-router-flux';
import Spinner from 'react-native-loading-spinner-overlay';
import axios from 'axios';
import Modal from '../libs/ModalBox';
import OrderModal from './common/OrderModal';
import {connect} from 'react-redux';
import Icon from 'react-native-vector-icons/FontAwesome';

const IMG_HEIGHT = 100;

class NewReleaseView extends Component {

	constructor(props) {
		super(props);

		this.state = {
			loading: false,
			releases: [],
			orderIndex: -1
		};

		this.retrieveNewReleases = this.retrieveNewReleases.bind(this);
	}

  renderRightButton = () => {
    return(
			<TouchableOpacity onPress={() => this.retrieveNewReleases() } >
				<Icon name="refresh" style={styles.rightButton} />
			</TouchableOpacity>
    );
  };

  componentWillMount() {
	  console.log("NewRelease View");
    Actions.refresh({ renderRightButton: this.renderRightButton });
  }

	componentDidMount() {
		this.retrieveNewReleases();
	}

	retrieveNewReleases(withLoading = true) {
		if (withLoading)
			this.setState({loading: true});

		const _this = this;
		
		const headers = {
			'Authorization': this.props.token
		};
		axios.get(
			AppConstants.BASE_URL + 'retrieveNewReleases',
			{
				headers: headers
			}
		)
			.then(
				function (response) {
					console.log("=================Retrieve News Success=================");
					const releases = response.data;
					_this.setState({releases, loading: false});
          setTimeout(()=> {
            const {notificationItemId} = _this.props;
            if (notificationItemId) {
              // notification
              const index = releases.reduce((prev, item, index) => item.Id === notificationItemId ? index : prev, -1);
              if (index !== -1) {
                _this.onSelectItem(index)
              } else {
                Alert.alert('Failed to find new release', notificationItemId, [{
                  text: 'OK',
                  onPress: () => console.log('OK Pressed')
                }]);
							}
            }
          }, 200);
				}
			)
			.catch(
				function (error) {
					console.log("=================Retrieve News FAILED=================");
					_this.setState({loading: false});
					const response = error.response.data;

          if (error.response.status === AppErrors.AUTH_FAILED) {
						Actions.auth({ redirect: 'newReleaseView' });
            return;
          }

          setTimeout(()=> {
						Alert.alert('Failed to retrieve New releases', response.Message, [{
							text: 'OK',
							onPress: () => console.log('OK Pressed')
						}]);
					}, 200);
				}
			);
	}
	
	readNewRelease(releaseIndex) {
		const _this = this;
		const { releases } = this.state;

		const params = {
			newReleaseId: releases[releaseIndex].Id
		};
		const headers = {
			'Authorization': this.props.token
		};
		
		axios.post(
			AppConstants.BASE_URL + 'readNewRelease', JSON.stringify(params), { headers: headers }
		)
			.then(
				function (response) {
					console.log(`=================Read New Release - ${releases[releaseIndex].Id} Success=================`);
					let newReleases = releases.map(release => {
						if (release.Id === releases[releaseIndex].Id) {
							release.HasRead = true;
						}
						return release;
					});
					_this.setState({releases: newReleases});
				}
			)
			.catch(
				function (error) {
					console.log("=================Read News FAILED=================");
					console.log(error.response);
          if (error.response.status === AppErrors.AUTH_FAILED) {
            Actions.auth({ redirect: 'newReleaseView' });
          }
        }
			);
	}

	onSelectItem(index) {
		this.setState({orderIndex: index});
		this.readNewRelease(index);
	    this.refs.orderModal.open();
	}

	onOrderSuccess(message) {
		Alert.alert('Success', message, [{
			text: 'OK',
			onPress: () => { this.refs.orderModal.close(); this.setState({orderIndex: -1}); }
		}]);
	}

	onOrderFailed(response, message) {
		if (response == 0) {
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

	renderNewReleases() {
		const {releases} = this.state;
		return (
			<ScrollView>
				{
					releases.map((item, index)=> {
						return (
							<TouchableOpacity key={item.ISBN}
							                  onPress={ () => this.onSelectItem(index) }
							>
								<View
									style={[AppStyles.row, {justifyContent: 'center', alignItems: 'center', padding: 4, borderColor: AppColors.listItemBackground, borderBottomWidth: 1}]}>
									<Image source={{uri: `data:${item.Picture.MimeType};base64,${item.Picture.FileData}`}}
									       style={{width: IMG_HEIGHT / 1.522, height: IMG_HEIGHT, marginRight: 4}}/>
									<View style={styles.itemContainer}>
										<View style={AppStyles.row}>
											<Icon name="book" style={styles.iconBig}/>
											<Text style={[styles.itemTitle, {fontWeight: item.HasRead ? 'normal' : 'bold'}]} numberOfLines={1}> {item.Title} </Text>
										</View>

										<View style={AppStyles.row}>
											<Icon name="user" style={styles.iconCommon}/>
											<Text style={styles.commonText} numberOfLines={1}> {item.Author} </Text>
										</View>

										<View style={AppStyles.row}>
											<Icon name="info-circle" style={styles.iconCommon}/>
											<View style={AppStyles.column}>
												<Text style={styles.commonText} numberOfLines={1}> {item.About} </Text>
												<Text style={styles.commonText} numberOfLines={1}> {item.Format} </Text>
											</View>
										</View>

										<View style={AppStyles.row}>
											<Text style={[styles.commonText]}> R </Text>
											<Text style={[styles.commonText, {width: 60}]} numberOfLines={1}> {item.Price} </Text>
										</View>
									</View>

									<Icon name="angle-right" style={{fontSize: 22, color: AppColors.textPrimary}}/>
								</View>
							</TouchableOpacity>
						)
					})
				}
			</ScrollView>
		)
	}

	render() {

		const {releases, orderIndex} = this.state;

		return (
			<View style={[AppStyles.navContainer, styles.container]}>
				<Spinner visible={this.state.loading} textContent={""} textStyle={{color: '#FFF'}}/>

				<Modal
					ref={"orderModal"}
					position={"top"}
				style={[AppStyles.modal, {marginTop: 50}]}
				>
					{
						releases.length > 0 && orderIndex >= 0 ?
												
							<OrderModal
								Title={releases[orderIndex].Title}
								Isbn={releases[orderIndex].ISBN}
								Author={releases[orderIndex].Author}
								Description={releases[orderIndex].About}
								Price={releases[orderIndex].Price}
								Image={releases[orderIndex].Picture ? `data:${releases[orderIndex].Picture.MimeType};base64,${releases[orderIndex].Picture.FileData}` : null}
								onOrderSuccess={this.onOrderSuccess.bind(this)}
								onOrderFailed={this.onOrderFailed.bind(this)}
								OrderType={1}
							/>						
							: null
					}

				</Modal>

				{this.renderNewReleases()}
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
	},

  	rightButton: {
    		fontSize: 22,
    		color: 'white',
  	},
});

const mapStateToProps = (state) => {
	return {
		token: state.auth.token,
	};
};

export default connect(mapStateToProps, {})(NewReleaseView);
