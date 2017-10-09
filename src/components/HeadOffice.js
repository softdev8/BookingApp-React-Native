import React, {Component} from 'react';
import {View, Text, StyleSheet, ScrollView} from 'react-native';
import {AppColors, AppFonts, AppStyles, AppSizes} from '../constants';
import {Actions} from 'react-native-router-flux';
import {connect} from 'react-redux';

class HeadOffice extends Component {
	render() {
		return (
			<ScrollView style={[AppStyles.navContainer, styles.container]}>
				<Text>
					{this.props.officeInformation.Value}
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
		officeInformation: state.data.officeInformation,
	};
};

export default connect(mapStateToProps, {})(HeadOffice);