import React from 'react';
import {StyleSheet, Text, View, TouchableOpacity} from 'react-native';
import {Actions} from 'react-native-router-flux';
import Icon from 'react-native-vector-icons/FontAwesome';

import {AppColors, AppFonts, AppStyles, AppSizes} from '../constants';

const contextTypes = {
	drawer: React.PropTypes.object,
};

const SideBarContent = (props, context) => {
	const drawer = context.drawer;
	const {sideBarItemTitle, container} = styles;
	return (
		<View style={container}>

			<View style={{marginTop:20, padding: 20}}>
				<Text style={[sideBarItemTitle, AppStyles.textCenterAligned, {marginRight: 10}]}>Welcome back</Text>
				<Text style={[sideBarItemTitle, AppStyles.textCenterAligned, {marginRight: 10}]}>
					{props.profile ? `${props.profile.UserName} ${props.profile.UserSurname}` : `User`}
				</Text>
			</View>

			<View style={styles.menuBorder}/>

			<TouchableOpacity
				style={styles.sideBarItemContainer}
				onPress={() => { drawer.close(); Actions.homeView(); }}>
				<View style={{ width: 35 }}>
					<Icon name="home" size={25} color="#fff" style={{ alignSelf: 'center' }}/>
				</View>
				<Text style={sideBarItemTitle}>Home</Text>
			</TouchableOpacity>
			
			<TouchableOpacity
				style={styles.sideBarItemContainer}
				onPress={() => { drawer.close(); Actions.orderList(); }}>
				<View style={{ width: 35 }}>
					<Icon name="shopping-cart" size={25} color="#fff" style={{ alignSelf: 'center' }}/>
				</View>
				<Text style={sideBarItemTitle}>My Orders</Text>
			</TouchableOpacity>
			
			<TouchableOpacity
				style={[styles.sideBarItemContainer]}
				onPress={() => { drawer.close(); Actions.headOffice(); }}>
				<View style={{ width: 35 }}>
					<Icon name="user" size={25} color="#fff" style={{ alignSelf: 'center' }}/>
				</View>
				<Text style={sideBarItemTitle}>Head Office contact</Text>
			</TouchableOpacity>
			
			<TouchableOpacity
				style={[styles.sideBarItemContainer]}
				onPress={() => { drawer.close(); Actions.faq(); }}>
				<View style={{ width: 35 }}>
					<Icon name="question" size={25} color="#fff" style={{ alignSelf: 'center' }}/>
				</View>
				<Text style={sideBarItemTitle}>FAQs</Text>
			</TouchableOpacity>

			<View style={styles.menuBorder}/>

			<TouchableOpacity
				style={styles.sideBarItemContainer}
				onPress={() => { drawer.close(); Actions.termsCondition(); }}>
				<View style={{ width: 35 }}>
					<Icon name="file-text" size={23} color="#fff" style={{ alignSelf: 'center' }}/>
				</View>
				<Text style={sideBarItemTitle}>Terms & Conditions</Text>
			</TouchableOpacity>
			<TouchableOpacity
				style={styles.sideBarItemContainer}
				onPress={() => { drawer.close(); Actions.termsUse(); }}>
				<View style={{ width: 35 }}>
					<Icon name="info-circle" size={25} color="#fff" style={{ alignSelf: 'center' }}/>
				</View>
				<Text style={sideBarItemTitle}>Terms of Use</Text>
			</TouchableOpacity>
			<TouchableOpacity
				style={styles.sideBarItemContainer}
				onPress={() => { drawer.close(); Actions.privacyPolicy(); }}>
				<View style={{ width: 35 }}>
					<Icon name="lock" size={25} color="#fff" style={{ alignSelf: 'center' }}/>
				</View>
				<Text style={sideBarItemTitle}>Privacy Policy</Text>
			</TouchableOpacity>

			<View style={styles.menuBorder}/>

			<TouchableOpacity
				style={styles.sideBarItemContainer}
				onPress={() => { drawer.close(); Actions.rateStore(); }}>
				<View style={{ width: 35 }}>
					<Icon name="map-marker" size={25} color="#fff" style={{ alignSelf: 'center' }}/>
				</View>
				<Text style={sideBarItemTitle}>Rate Store</Text>
			</TouchableOpacity>
			<TouchableOpacity
				style={styles.sideBarItemContainer}
				onPress={() => { drawer.close(); Actions.talkUs(); }}>
				<View style={{ width: 35 }}>
					<Icon name="phone" size={25} color="#fff" style={{ alignSelf: 'center' }}/>
				</View>
				<Text style={sideBarItemTitle}>Talk to Us</Text>
			</TouchableOpacity>

			<View style={{ justifyContent: 'flex-end', flex: 1 }}>
				<View style={styles.menuBorder}/>
				<TouchableOpacity
					style={[styles.sideBarItemContainer]}
					onPress={() => { props.onLogOut(); }}>
					<View style={{ width: 35 }}>
						<Icon name="sign-out" size={25} color="#fff" style={{ alignSelf: 'center' }}/>
					</View>
					<Text style={sideBarItemTitle}>Log Out</Text>
				</TouchableOpacity>
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: 'flex-end',
		alignItems: 'stretch',
		backgroundColor: '#009999',
		paddingBottom: 20,
		paddingHorizontal: 10
	},
	sideBarItemTitle: {
		color: 'white',
		marginLeft: 10,
		paddingTop: 2,
		fontSize: 18
	},
	sideBarItemContainer: {
		flexDirection: 'row',
		marginVertical: 5
	},
	menuBorder: {
		height: 1,
		backgroundColor: 'rgba(255,255,255,0.5)',
		marginVertical: 10
	}
});

SideBarContent.contextTypes = contextTypes;

export default SideBarContent;
