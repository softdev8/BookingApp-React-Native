/**
 * Created by aronclasen on 6/23/17.
 */

import React, {Component} from 'react';
import { StyleSheet, View, TouchableOpacity, Text } from 'react-native';
import {AppColors, AppFonts, AppStyles, AppSizes} from '../../constants';
import {Actions, ActionConst} from 'react-native-router-flux';
import Icon from 'react-native-vector-icons/FontAwesome';
import {connect} from 'react-redux';


class TabBar extends Component {

	constructor(props) {
		super(props);

		this.onNavigate = this.onNavigate.bind(this);
	}

	onNavigate(key) {

		/*let replace = false;
		if ( (this.props.lastSceneKey == "storeLocator" || this.props.lastSceneKey == "aboutUs" || this.props.lastSceneKey == "eventsView")
			&& (this.props.lastSceneKey != key) ) {
			replace = true;
		}

		switch (key) {
			case "aboutUs":
				// Actions.aboutUs({ type: replace ? ActionConst.REPLACE : ActionConst.PUSH});
				Actions.aboutUs();
				break;
			case "eventsView":
				// Actions.eventsView({ type: replace ? ActionConst.REPLACE : ActionConst.PUSH});
				Actions.eventsView();
				break;
			case "storeLocator":
				// Actions.storeLocator({ type: replace ? ActionConst.REPLACE : ActionConst.PUSH});
				Actions.storeLocator();
				break;

			

			default:
				break;
		}*/
		this.props.openModal(key);
	}

	render() {
		return (
			<View style={styles.containerStyle}>
				<TouchableOpacity
					style={styles.sideBarItemContainer}
					onPress={() => { this.onNavigate("storeLocator") }}>
					<Icon name="map-marker" size={22} color="#fff" style={{ alignSelf: 'center' }}/>
					<Text style={styles.sideBarItemTitle}>Store Locator</Text>
				</TouchableOpacity>

				<TouchableOpacity
					style={styles.sideBarItemContainer}
					onPress={() => { this.onNavigate("aboutUs") }}>
					<Icon name="info-circle" size={22} color="#fff" style={{ alignSelf: 'center' }}/>
					<Text style={styles.sideBarItemTitle}>About Us</Text>
				</TouchableOpacity>

				<TouchableOpacity
					style={styles.sideBarItemContainer}
					onPress={() => { this.onNavigate("eventsView") }}>
					<Icon name="calendar" size={22} color="#fff" style={{ alignSelf: 'center' }}/>
					<Text style={styles.sideBarItemTitle}>Events</Text>
				</TouchableOpacity>
			</View>
		);
	}
};

const styles = StyleSheet.create({
	containerStyle: {
		flexDirection: 'row',
		justifyContent: 'flex-end',
		// position: 'absolute',
		// left: 0, right: 0, bottom: 0,
		height: AppSizes.tabbarHeight,
		backgroundColor: AppColors.base,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: -2 },
		shadowOpacity: 0.4,
		shadowRadius: 5,
		paddingHorizontal: 2
	},
	sideBarItemContainer: {
		flex: 1,
		flexDirection: 'column',
		justifyContent: 'center',
	},
	sideBarItemTitle: {
		color: 'white',
		fontSize: 12,
		textAlign: 'center'
	},
	
});

const mapStateToProps = (state) => {
	return {
		lastSceneKey: state.data.lastSceneKey,
	};
};

export default connect(mapStateToProps, {})(TabBar);
