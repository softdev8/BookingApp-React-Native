import React, {Component} from 'react';
import {View, Text, StyleSheet, Alert, ScrollView} from 'react-native';
import {AppColors, AppFonts, AppStyles, AppSizes, AppConstants, AppErrors} from '../constants';
import {Actions} from 'react-native-router-flux';
import Spinner from 'react-native-loading-spinner-overlay';
import axios from 'axios';
import {connect} from 'react-redux';
import Accordion from 'react-native-collapsible/Accordion';
import * as Animatable from 'react-native-animatable';

class FAQ extends Component {

	constructor(props) {
		super(props);

		this.state = {
			loading: false,
			faqs: [],
			selectedFaqIndex: -1
		};
	}

	componentDidMount() {
		this.retrieveFaq();
	}

	retrieveFaq() {
		let _this = this;
		this.setState({loading: true});
		
		const headers = {
			'Authorization': this.props.token
		};
		axios.get(
			AppConstants.BASE_URL + 'retrieveFaqs',
			{
				headers: headers
			}
		)
			.then(
				function (response) {
					console.log("=================Retrieve FAQs Success=================");
					_this.setState({faqs:response.data, loading: false});
				}
			)
			.catch(
				function (error) {
					console.log("=================Retrieve FAQs FAILED=================");
					const response = error.response.data;
					_this.setState({loading: false});
          if (error.response.status === AppErrors.AUTH_FAILED) {
            Actions.auth({ redirect: 'newReleaseView' });
          }
					setTimeout(()=> {
						Alert.alert( 'Failed to retrieve Faqs', response.toString(), [ {text: 'OK', onPress: () => console.log('OK Pressed')} ] );
					}, 200);
				}
			);
	}

	renderQuestion(section, index, isActive) {
		return (
			<Animatable.View
				duration={300}
				transition="backgroundColor"
				style={[styles.header,
				{ backgroundColor: (isActive ? 'rgba(255,255,255,1)' : 'rgba(255,255,255,1)'), borderBottomWidth: (isActive ? 0 : 1) }]}>
				<Text style={{color: isActive ? AppColors.base : AppColors.textPrimary}}>
					{section.Question}
				</Text>
			</Animatable.View>
		)
	}

	renderAnswer(section, index, isActive) {
		return (
			<Animatable.View
				duration={300}
				transition="backgroundColor"
				style={[styles.content, { backgroundColor: (isActive ? 'rgba(255,255,255,1)' : 'rgba(255,255,255,1)') }]}>
				<Animatable.Text
					style={styles.contentText}
					duration={300}
					easing="ease-out"
					animation={isActive ? 'zoomIn' : false}>
					{section.Answer}
				</Animatable.Text>
			</Animatable.View>
		)
	}

	render() {
		const { faqs, selectedFaqIndex } = this.state;

		return (
			<ScrollView style={[AppStyles.navContainer, styles.container]}>
				<Spinner visible={this.state.loading} textStyle={{color: '#FFF'}}/>
				<Accordion
					sections={faqs}
					renderHeader={this.renderQuestion}
					renderContent={this.renderAnswer}
				/>
			</ScrollView>
		);
	}
}

const styles = StyleSheet.create({
	container: {
		flex: 1
	},

	header: {
		padding: 8,
		borderColor: AppColors.listItemBackground,
		height: 60,
		justifyContent: 'center'
	},

	content: {
		paddingLeft: 20,
		paddingRight: 8,
		paddingVertical: 8
	},

	contentText: {
		color: AppColors.colorPrimary
	}

});

const mapStateToProps = (state) => {
	return {
		token: state.auth.token
	};
};

export default connect(mapStateToProps, {})(FAQ);