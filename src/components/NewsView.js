import React, {Component} from 'react';
import {View, Text, StyleSheet, Alert, TouchableOpacity, Linking} from 'react-native';
import {AppColors, AppFonts, AppStyles, AppSizes, AppConstants, AppErrors} from '../constants';
import {Actions} from 'react-native-router-flux';
import Spinner from 'react-native-loading-spinner-overlay';
import Icon from 'react-native-vector-icons/FontAwesome';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import axios from 'axios';
import {connect} from 'react-redux';

const CONTENT_TYPE = {
  TEXT: 0,
  FILE: 1,
  LINK: 2,
};

/**
 * @return {string}
 */
function CONTENT_TYPE_STRING(type) {
  if (type === CONTENT_TYPE.TEXT) {
    return 'align-justify';
  } else if (type === CONTENT_TYPE.FILE) {
    return 'image';
  } else if (type === CONTENT_TYPE.LINK) {
    return 'link';
  } else {
    return 'question';
	}
}

class NewsView extends Component {

	constructor(props) {
		super(props);

		this.state = {
			loading: false,
			news: [],
			newsDetail: null
		};
	}

  renderRightButton = () => {
    return(
			<TouchableOpacity onPress={() => this.retrieveNews() } >
				<Icon name="refresh" style={styles.rightButton} />
			</TouchableOpacity>
    );
  };

  componentWillMount() {
    Actions.refresh({ renderRightButton: this.renderRightButton });
	}

	componentDidMount() {
		this.retrieveNews();
	}

	retrieveNews() {
		let _this = this;
		this.setState({loading: true});
		
		const headers = {
			'Authorization': this.props.token
		};
		axios.get(
			AppConstants.BASE_URL + 'retrieveNews',
			{
				headers: headers
			}
		)
			.then(
				function (response) {
					console.log("=================Retrieve News Success=================");
					const news = response.data;
					_this.setState({news, loading: false});
          setTimeout(()=> {
            const {notificationItemId} = _this.props;
            if (notificationItemId) {
            	// notification
							const index = news.reduce((prev, item, index) => item.Id === notificationItemId ? index : prev, -1);
							if (index !== -1) {
                _this.onSelectNews(index)
							} else {
                Alert.alert('Failed to find news', notificationItemId, [{
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
					const response = error.response.data;
					_this.setState({loading: false});
          if (error.response.status === AppErrors.AUTH_FAILED) {
            Actions.auth({ redirect: 'newsFeedView' });
          }
          setTimeout(()=> {
						Alert.alert( 'Failed to retrieve news', response ? response.Message : 'An error has occured.', [ {text: 'OK', onPress: () => console.log('OK Pressed')} ] );
					}, 200);
				}
			);
	}

  readNews(newsIndex) {
    const _this = this;
    const { news } = this.state;
    debugger;

    const params = {
      newsId: news[newsIndex].Id
    };
    const headers = {
      'Authorization': this.props.token,
    };

    axios.post(
      AppConstants.BASE_URL + 'readNews', JSON.stringify(params), { headers: headers }
    )
      .then(
        function (response) {
          debugger;
          let updatedNews = news.map(item => {
            if (item.Id === news[newsIndex].Id) {
              item.HasRead = true;
            }
            return item;
          });
          _this.setState({news: updatedNews});
        }
      )
      .catch(
        function (error) {
          console.log(error.response);
          if (error.response.status === AppErrors.AUTH_FAILED) {
            Actions.auth({ redirect: 'newsFeedView' });
          }
        }
      );
  }

  onSelectNews(index) {
		let _this = this
		 
		const news = this.state.news.map((item, idx)=> {
			if (index === idx) {
				if (item.HasRead === false) {
					// read news
					this.readNews(idx);
					// set as read
          item.HasRead = true;
				}
			}
			return item;
		});
		this.setState({news});	
		if(this.state.news[index].ContentType !== CONTENT_TYPE.LINK){
			Actions.newsDetailView({title:this.state.news[index].Title, news: this.state.news[index]});
			return ;
		}
				const params = {
					newsId: this.state.news[index].Id
				};
				const headers = {
					'Authorization': this.props.token
				};
				
				axios.post(
					AppConstants.BASE_URL + 'retrieveNewsDetail',
					JSON.stringify(params),
					{
						headers: headers
					}
				)
					.then(
						function (response) {				
							
								
								let url = response.data;								 
								Linking.canOpenURL(url).then(supported =>
										{
												if (supported)
												{
														Linking.openURL(url);
												} else
												{
														console.log("Don't know how to open URI: " + url);
												}
										});
						}
					)
					.catch(
						function (error) {
							console.log("=================Retrieve News Detail FAILED=================");
							_this.setState({loading: false});          			
						}
					);
		
		
	
	}

	render() {
		const { news } = this.state;
		return (
			<View style={[AppStyles.navContainer, styles.container]}>
				<Spinner visible={this.state.loading} textStyle={{color: '#FFF'}}/>
				<KeyboardAwareScrollView onRefresh={this.retrieveNews} >
					<View style={styles.newsContainer}>
						{
							news.map((item, index)=> {
								const contentTypeIcon = CONTENT_TYPE_STRING(item.ContentType);
								return (
									<TouchableOpacity key={item.Id}
									                  onPress={ () => this.onSelectNews(index) }
									>
										<View style={[AppStyles.row, styles.newsItem]}>
											<View style={{flex: 1}}>
												<View style={AppStyles.row}>
													<Text style={[styles.newsTitle, {fontWeight: item.HasRead ? 'normal' : 'bold'}]}>
														<Icon name={contentTypeIcon} style={styles.newsItemIcon} />  {item.Title}
													</Text>
												</View>

												<View style={AppStyles.row}>
													<Text style={styles.commonText}>{item.ShortDescription} </Text>
												</View>

												<View style={AppStyles.row}>
													<Text style={item.NewsType == 1 ? styles.urgentTitle : styles.commonText}>{item.NewsTypeDescription}</Text>
												</View>
											</View>

											<Icon name="angle-right" style={{fontSize: 22, color: AppColors.textPrimary}} />
										</View>
									</TouchableOpacity>
								)
							})
						}
					</View>
				</KeyboardAwareScrollView>
			</View>
		);
	}
}

const styles = StyleSheet.create({

	newsRow: {
		marginVertical: 4,
	},

	urgentTitle: {
		color: AppColors.base,
		fontWeight: 'bold'
	},

	container: {
		flex: 1,
		padding: 4
	},

	newsContainer: {
		borderColor: AppColors.listItemBackground,
	},
	newsTitle: {
		fontSize: 16,
		color: AppColors.textPrimary,
	},
	description: {
		color: AppColors.textSecondary,
		fontSize: 12
	},
	commonText: {
		color: AppColors.textSecondary,
		marginVertical: 2
	},
	newsItem: {
		justifyContent: 'center',
		alignItems: 'center',
		padding: 8,
		borderColor: AppColors.listItemBackground,
		borderBottomWidth: 1
	},

	newsItemIcon: {
		fontSize: 15,
		color: AppColors.colorPrimary,
	},

  rightButton: {
    fontSize: 22,
    color: 'white',
  },
});

const mapStateToProps = (state) => {
	return {
		authenticated: state.auth.authenticated,
		user: state.auth.user,
		token: state.auth.token,
		profile: state.auth.profile
	};
};

export default connect(mapStateToProps, {})(NewsView);
