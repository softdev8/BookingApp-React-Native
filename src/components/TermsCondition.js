import React, {Component} from 'react';
import {View, Text, StyleSheet, ScrollView} from 'react-native';
import {AppColors, AppFonts, AppStyles, AppSizes} from '../constants';
import {Actions} from 'react-native-router-flux';
import {connect} from 'react-redux';

class TermsCondition extends Component {
	render() {
		return (
			<ScrollView style={[AppStyles.navContainer, styles.container]}>
				<Text>
					{this.props.temrsAndConditions.Value}
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
		temrsAndConditions: state.data.temrsAndConditions,
	};
};

export default connect(mapStateToProps, {})(TermsCondition);
