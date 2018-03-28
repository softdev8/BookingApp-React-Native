import React, {Component} from 'react';
import MaterialsIcon from 'react-native-vector-icons/MaterialIcons';
import {AppColors, AppFonts, AppStyles, AppSizes} from '../constants';
import {View, ScrollView, WebView, Text, StyleSheet} from 'react-native';
import {OpaqueCard} from './common';
import AwesomeButton from '../libs/AwesomeButton';

const termsContent = require('../assets/TermsOfUse.html');

const BTN_STATE = {
	IDLE: 'idle',
	BUSY: 'busy',
	SUCCESS: 'success',
	FAILED: 'failed'
};

class AuthTermsUse extends Component {

	constructor() {
		super();
	}

	onBack() {
		this.props.onChangePage(0);
	}

	render() {

		return (
			<View style={styles.loginContainer}>
				<View style={{flexDirection: 'row', marginTop: 40, marginBottom: 30, paddingHorizontal: 10}}>
					<AwesomeButton
						states={{
            default: {
            	icon: <MaterialsIcon name="chevron-left" color="rgba(255, 255, 255, .9)" size={24} />,
							iconAlignment: 'left',
							text: '',
              backgroundStyle: {
                backgroundColor: 'rgba(0,0,0,0)',
                minHeight: 24,
                width: 30,
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 15
              },
              labelStyle: {
                color: 'white',
                fontWeight: '500',
                fontSize: 18
              },

              onPress: this.onBack.bind(this)
            }
          }}
					/>
					<Text style={styles.title}>Terms of Use</Text>
				</View>

				<ScrollView>
					<WebView
						source={termsContent}
						style={styles.containerStyle}
					/>
				</ScrollView>

			</View>
		);
	}
}

const styles = StyleSheet.create({
	loginContainer: {
		flex: 1
	},
	containerStyle: {
		backgroundColor: 'rgba(255, 255, 255, 0.3)',
		borderRadius: 4,
		borderColor: 'rgba(255, 255, 255, 0.2)',
		borderWidth: 1,
		marginHorizontal: 10,
		width: AppSizes.screen.width - 20,
		height: AppSizes.screen.height - 120
	},
	title: {
		flex: 1,
		alignSelf: 'center',
		textAlign: 'center',
		fontSize: 20,
		marginRight: 24,
		fontWeight: '500',
		color: '#fff'
	}
});

export default AuthTermsUse;

