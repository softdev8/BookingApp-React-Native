import React, {Component} from 'react';
import {AppColors, AppFonts, AppStyles, AppSizes, AppConstants, AppErrors} from '../../constants';
import {StyleSheet, View, Alert, Text, TextInput} from 'react-native';
import {Actions} from 'react-native-router-flux';
import AwesomeButton from '../../libs/AwesomeButton';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view'
import StarRating from 'react-native-star-rating';
import axios from 'axios';
import {connect} from 'react-redux';

const BTN_STATE = {
	IDLE: 'idle',
	BUSY: 'busy',
	SUCCESS: 'success',
	FAILED: 'failed'
};

class StoreRateModal extends Component {

	constructor(props) {
		super(props);

		this.state = {
			comment: props.rating ? props.rating.Comment : '',
			submitState: BTN_STATE.IDLE,
			criteria: []
		};

		this.validateInputFields = this.validateInputFields.bind(this);
		this.onRateStore = this.onRateStore.bind(this);
	}

	componentDidMount() {
		const {rating} = this.props;
		let criteria = this.props.criteria.map((item) => {

			let starCount = 0;
			if (rating != null) {
				let ratings = rating.Ratings;
				for (let i = 0; i < ratings.length; i++) {
					if (ratings[i].RatingCriteriaId == item.RatingCriteriaId) {
						starCount = ratings[i].Rating;
					}
				}
			}

			return {
				Criteria: item.Criteria,
				Id: item.RatingCriteriaId,
				Rating: starCount
			}
		});

		this.setState({criteria});
	}

	onRateStore() {
		let _this = this;

		let ratings = this.state.criteria.map((item) => {
			return {
				ratingCriteriaId: item.Id,
				rating: item.Rating
			}
		});
		const params = {
			branchId: this.props.branch.Id,
			comment: this.state.comment,
			ratings: ratings
		};

		_this.setState({submitState: BTN_STATE.BUSY});
		
		const headers = {
			'Authorization': this.props.token
		};
		axios.post(
			AppConstants.BASE_URL + 'rateStore',
			JSON.stringify(params),
			{
				headers: headers
			}
		)
			.then(
				function (response) {
					console.log("=================Submit Store Rating Success=================");
					_this.setState({submitState: BTN_STATE.SUCCESS});
					
					setTimeout(()=> {
						_this.setState({submitState: BTN_STATE.IDLE});
					_this.props.onSubmitSuccess(response.data);
					}, 1000);
				}
			)
			.catch(
				function (error) {
					console.log("=================Submit Store Rating FAILED=================");
					_this.setState({submitState: BTN_STATE.FAILED});
          if (error.response.status === AppErrors.AUTH_FAILED) {
            Actions.auth({ redirect: '' });
            return;
          }
					setTimeout(()=> {
						Alert.alert('Submit Error', 'Please try again.', [{text: 'OK', onPress: () => console.log('OK Pressed')}]);
					}, 200);

					setTimeout(()=> {
						_this.setState({submitState: BTN_STATE.IDLE});
					}, 1500);
				}
			);
	}

	onStarRating(index, rating) {
		let criteria = this.state.criteria.map((item, i) => {

			if (index == i) {
				return {
					Criteria: item.Criteria,
					Id: item.Id,
					Rating: rating
				}
			} else {
				return item;
			}
		});

		this.setState({criteria});
	}

	renderRateCriteria() {
		const {criteria} = this.state;
		return (
			<View style={{marginTop: 10}}>
				{
					criteria.map((item, index) => {
						return (
							<View key={item.Id}>
								<Text style={{color: AppColors.colorPrimary}}>{item.Criteria}</Text>

								<View style={[AppStyles.centerAligned, {marginBottom:10}]}>
									<StarRating
										disabled={false}
										maxStars={5}
										rating={item.Rating}
										starColor={AppColors.base}
										emptyStarColor={AppColors.base}
										starSize={20}
										starStyle={{margin: 2}}
										selectedStar={(rating) => this.onStarRating(index, rating)}
									/>
								</View>
							</View>
						)
					})
				}
			</View>
		)
	}

	renderRateButton() {
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
              onPress: this.onRateStore
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
		);
	}

	validateInputFields() {
		if (!this.state.comment) {
			Alert.alert('Input Error', 'Please input comment.', [{text: 'OK', onPress: () => console.log('OK Pressed')}]);
			return false;
		}

		return true;
	}

	render() {
		const {onSubmitFailed, title} = this.props;
		const {comment} = this.state;

		return (
			<KeyboardAwareScrollView style={styles.container}>

				<View style={[AppStyles.row, AppStyles.centerAligned ]}>
					<Text style={styles.itemTitle}>Rate {title}</Text>
				</View>

				<View style={styles.textInputWrapper}>
					<TextInput
						style={styles.textInput}
						onChangeText={(comment) => this.setState({comment})}
						value={comment}
						placeholder={'Please comments here'}
						multiline={true}
					/>
				</View>

				{this.renderRateCriteria()}

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
					<View style={[{flex: 1}, AppStyles.centerAligned]}>{ this.renderRateButton() }</View>

				</View>
			</KeyboardAwareScrollView>
		);
	}
}

const styles = StyleSheet.create({
	container: {
		marginHorizontal: 20,
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
		marginTop: 20,
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
		height: 92,
		fontSize: 14
	}
});

const mapStateToProps = (state) => {
	return {
		token: state.auth.token,
	};
};

export default connect(mapStateToProps, {})(StoreRateModal);

