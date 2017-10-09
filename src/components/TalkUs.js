import React, {Component} from 'react';
import {View, Text, StyleSheet, Alert, ScrollView, TouchableOpacity} from 'react-native';
import {AppColors, AppFonts, AppStyles, AppSizes, AppConstants, AppErrors} from '../constants';
import {Actions} from 'react-native-router-flux';
import Spinner from 'react-native-loading-spinner-overlay';
import Icon from 'react-native-vector-icons/FontAwesome';
import axios from 'axios';
import {connect} from 'react-redux';
import Modal from '../libs/ModalBox';
import TalkUsModal from './common/TalkUsModal';

class TalkUs extends Component {

	constructor(props) {
		super(props);

		this.state = {
			loading: false,
			titles: [],
			titleIndex: -1
		};
	}

	componentDidMount() {
		this.retrieveTitles();
	}

	onTitle(index) {
		this.setState({titleIndex : index});
		this.refs.titleModal.open();
	}

	onSubmitSuccess(message) {
		Alert.alert('Success', message, [{
			text: 'OK',
			onPress: () => console.log('OK Pressed')
		}]);
	}

	onSubmitFailed(response) {
		if (response == 0) {
			// Failed to submit comment
			Alert.alert('Failed to submit your comments', 'We are sorry. Please try again later.', [{
				text: 'OK',
				onPress: () => console.log('OK Pressed')
			}]);
		} else {
			// Cancelled
		}
		this.refs.titleModal.close();
		this.setState({titleIndex: -1});
	}

	retrieveTitles() {
		let _this = this;
		this.setState({loading: true});
		
		const headers = {
			'Authorization': this.props.token
		};
		axios.get(
			AppConstants.BASE_URL + 'retrieveTitles',
			{
				headers: headers
			}
		)
			.then(
				function (response) {
					console.log("=================Retrieve Titles Success=================");
					_this.setState({titles:response.data, loading: false});
				}
			)
			.catch(
				function (error) {
					console.log("=================Retrieve Titles FAILED=================");
					const response = error.response.data;
					_this.setState({loading: false});
          if (error.response.status === AppErrors.AUTH_FAILED) {
            Actions.auth({ redirect: 'talkUs' });
            return;
          }
					setTimeout(()=> {
						Alert.alert( 'Failed to retrieve Titles', response.toString(), [ {text: 'OK', onPress: () => console.log('OK Pressed')} ] );
					}, 200);
				}
			);
	}

	render() {

		const {titles, titleIndex} = this.state;

		return (
			<View style={[styles.container, AppStyles.navContainer]}>

				<Spinner visible={this.state.loading} textStyle={{color: '#FFF'}}/>

				<Modal
					ref={"titleModal"}
					position={"top"}
					style={[AppStyles.modal, {marginTop: 50}]}
				>
					{
						titles.length > 0 && titleIndex >= 0 ?
							<TalkUsModal
								titleId={titles[titleIndex].TitleId}
								Description={titles[titleIndex].Description}
								onSubmitSuccess={this.onSubmitSuccess.bind(this)}
								onSubmitFailed={this.onSubmitFailed.bind(this)}
							/>
							: null
					}

				</Modal>

				{
					titles.map((title, index) => {
						return (
							<TouchableOpacity key={title.TitleId}
							                  onPress={ () => this.onTitle(index) }
							>
								<View style={[AppStyles.row, {alignItems: 'center', padding: 8, borderColor: AppColors.listItemBackground, borderBottomWidth: 1}]}>
									<View style={styles.header}>
										<View style={AppStyles.row}>
											<Icon name="commenting" style={styles.iconBig} />
											<Text style={styles.contentText}> {title.Description} </Text>
										</View>
									</View>

									<Icon name="angle-right" style={{fontSize: 22, color: AppColors.textPrimary}} />
								</View>
							</TouchableOpacity>
						);
					})
				}
			</View>
		);
	}
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 8
	},

	iconBig: {
		width: 18,
		fontSize: 14,
		marginTop: 2,
		color: AppColors.textSecondary,
		textAlign: 'center'
	},

	header: {
		flex:1,
		borderColor: AppColors.listItemBackground,
		minHeight: 40,
		justifyContent: 'center'
	},

	content: {
		paddingLeft: 20,
		paddingRight: 8,
		paddingVertical: 8
	},

	contentText: {
		color: AppColors.textPrimary
	}

});

const mapStateToProps = (state) => {
	return {
		token: state.auth.token
	};
};

export default connect(mapStateToProps, {})(TalkUs);