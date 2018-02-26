import React, {Component} from 'react';
import {View, Text, StyleSheet, Alert, TouchableOpacity, WebView, ScrollView, Linking, Image, Platform } from 'react-native';
import {AppColors, AppFonts, AppStyles, AppSizes, AppConstants, AppErrors} from '../constants';
import {Actions} from 'react-native-router-flux';
import Spinner from 'react-native-loading-spinner-overlay';
import axios from 'axios';
import {connect} from 'react-redux';

const CONTENT_TYPE = {
	TEXT: 0,
	FILE: 1,
	LINK: 2,
};

class NewsDetailView extends Component {

	constructor(props) {
		super(props);

		this.state = {
			loading: false,
			newsDetail: null
		};
	}

	componentDidMount() {
		this.retrieveNewsDetail();
	}

	retrieveNewsDetail() {
		let _this = this;
		this.setState({loading: true});

    const params = {
      newsId: this.props.news.Id
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
					console.log("=================Retrieve News Detail Success=================");
					_this.setState({newsDetail:response.data, loading: false});
				}
			)
			.catch(
				function (error) {
					console.log("=================Retrieve News Detail FAILED=================");
					_this.setState({loading: false});
          if (error.response.status === AppErrors.AUTH_FAILED) {
            Actions.auth({ redirect: 'newsDetailView' });
            return;
          }
					setTimeout(()=> {
						Alert.alert( 'Failed to retrieve news', 'Failed to retrieve News details', [ {text: 'OK', onPress: () => console.log('OK Pressed')} ] );
					}, 200);
				}
			);
	}

	renderTextContent() {
		const { newsDetail } = this.state;
		if (!newsDetail) return null;
		return (
			<View style={styles.newsContainer}>
				<ScrollView>
					<Text style={styles.textContainer}>{newsDetail}</Text>
				</ScrollView>
			</View>
		)
	}

	renderHtmlContent() {
		const { newsDetail } = this.state;
		if (!newsDetail) return null;
		
		let url = newsDetail;
		
		if (!/^https?:\/\//i.test(newsDetail)) {
			url = 'http://' + url;
		}
		
		return (
			<View style={styles.newsContainer}>
				<WebView
					style={styles.webContainer}
					source={{uri: url}}
					onLoadStart={() => {console.log('onLoadStart')}}
					onLoadEnd={() => {console.log('onLoadEnd')}}
					javaScriptEnabled
					automaticallyAdjustContentInsets
				>
				</WebView>
			</View>
		)
	}
	renderLink() {
		const { newsDetail } = this.state;
		if (!newsDetail) return null;
		
		let url = newsDetail;
		
		if (!/^https?:\/\//i.test(newsDetail)) {
			url = 'http://' + url;
		}
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

  renderFileContent() {
    const { newsDetail } = this.state;

    if (!newsDetail) return null;

	  // Marked by mobile
    Linking.canOpenURL(newsDetail).then(supported => {
      if (supported) {
        Linking.openURL(newsDetail);
        Actions.pop();
      } else {
        Alert.alert( 'Failed to open URI', `Don't know how to open URI: ${newsDetail}`, [ {text: 'OK', onPress: () => console.log('OK Pressed')} ] );
      }
    });
    return null;
	  //
	
    return (
			<View style={styles.newsContainer}>
				<WebView
					style={styles.webContainer}
					source={{uri: newsDetail}}
					automaticallyAdjustContentInsets
					onLoadStart={() => {this.setState({loading: true})}}
					onLoadEnd={() => {this.setState({loading: false})}}
				>
				</WebView>
			</View>
    );

  }

  render() {
		const { news } = this.props;

		return (
			<View style={[AppStyles.navContainer, styles.container]}>
				<Spinner visible={this.state.loading} textStyle={{color: '#FFF'}}/>
				{
					news.ContentType === CONTENT_TYPE.TEXT ? this.renderTextContent() :
						news.ContentType === CONTENT_TYPE.LINK ? Platform !== 'ios' ? this.renderLink() : this.renderHtmlContent() : this.renderFileContent()
				}
			</View>
		);
	}
}

const styles = StyleSheet.create({

	textContainer: {
		flex: 1,
		padding: 8
	},container: {
		flex: 1,
	},

	newsContainer: {
		flex: 1
	},
	webContainer: {
		flex: 1,
		width: AppSizes.screen.width
	},
  stretch: {
    width: 200,
    height: 200
  }
});

const mapStateToProps = (state) => {
	return {
		token: state.auth.token,
	};
};

export default connect(mapStateToProps, {})(NewsDetailView);
