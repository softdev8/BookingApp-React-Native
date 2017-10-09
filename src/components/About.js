import React, {Component} from 'react';
import {View, Text, StyleSheet, ScrollView, AsyncStorage} from 'react-native';
import {AppColors, AppFonts, AppStyles, AppSizes, AppConstants, AppErrors} from '../constants';
import {Actions} from 'react-native-router-flux';
import {connect} from 'react-redux';
import {ModalHeader} from './common/ModalHeader'
import axios from 'axios';

class About extends Component {
	
	closeModal() {
		this.props.closeModal("aboutUs");
	}

	onSendNotification() {
		const _this = this;
    AsyncStorage.getItem('fcm_token')
      .then((fcm_token) => {
        if (!fcm_token) return;
        _this.sendTestNotification(fcm_token);
      })
			.catch((error) => {
    		console.log(error);
			});
	}

  sendTestNotification(deviceId) {
    const params = {
      deviceId
    };
    const headers = {
      'Authorization': this.props.token
    };

    axios.post(
      AppConstants.BASE_URL + 'testPushNotification', params, headers
    )
      .then(
        function (response) {
          console.log(`=================Send Notification - ${deviceId} Success=================`);
          console.log(response.data);
        }
      )
      .catch(
        function (error) {
          console.log("=================Send Notification FAILED=================");
          console.log(error.response);
          if (error.response.status === AppErrors.AUTH_FAILED) {
            Actions.auth({ redirect: 'aboutUs' });
          }
        }
      );
  };

  render() {
		return (
			<View style={[AppStyles.container, styles.container]}>
				<ModalHeader
					headerTitle="About Us"
					onClose={this.closeModal.bind(this)}
				/>
				<Text style={{padding: 10}}>{this.props.aboutUs.Value}</Text>
			</View>
		);
	}
}

const styles = StyleSheet.create({
	
	container: {
		flex: 1,
	},

  rightButton: {
    fontSize: 22,
    color: 'white',
    marginRight: 10,
  },
});

const mapStateToProps = (state) => {
	return {
		aboutUs: state.data.aboutUs,
	};
};

export default connect(mapStateToProps, {})(About);