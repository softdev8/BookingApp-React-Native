import React, {Component} from 'react';
import {View, Text, StyleSheet, ScrollView} from 'react-native';
import {AppColors, AppFonts, AppStyles, AppSizes} from '../constants';
import {Actions} from 'react-native-router-flux';
import {connect} from 'react-redux';

class TermsUse extends Component {
	render() {
		return (
			<ScrollView style={[AppStyles.navContainer, styles.container]}>
				<Text>
					{this.props.termsOfUse.Value}
				</Text>
			</ScrollView>
		);
	}
}

const styles = StyleSheet.create({

	container: {
		flex: 1,
		padding: 8
	}


});

const mapStateToProps = (state) => {
	return {
		termsOfUse: state.data.termsOfUse,
	};
};

export default connect(mapStateToProps, {})(TermsUse);
