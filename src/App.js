import React, {Component} from 'react';
import {StatusBar, AsyncStorage} from 'react-native';
import {Provider} from 'react-redux';
import FCM from 'react-native-fcm';
import Router from './Router';
import configureStore from './store/configure_store';
import {AppConstants} from './constants';

const store = configureStore();

class App extends Component {
	constructor() {
		super();
	}

	componentDidMount() {
		StatusBar.setBarStyle('light-content', true);
		FCM.requestPermissions(); // for iOS
		FCM.getFCMToken().then(token => {
			AsyncStorage.getItem('fcm_token', (fcm_token) => {

				console.log('got fcm_token: ');
				console.log(fcm_token);

				if (token !== fcm_token) {
							if(token){
								AsyncStorage.setItem('fcm_token', token, () => {
									console.log('got fcm_token', token);
								});
							}
				}
			})
		});	
		
	}

	render() {
		return (
			<Provider store={store}>
				<Router />
			</Provider>
		);
	}
}

export default App;

