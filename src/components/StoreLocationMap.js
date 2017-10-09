import React, { Component } from 'react';
import { View, WebView, Linking } from 'react-native';
import Spinner from 'react-native-loading-spinner-overlay';
import {ModalHeader} from './common/ModalHeader'
import {AppColors, AppFonts, AppStyles, AppSizes, AppConstants, AppErrors} from '../constants';

class StoreLocationMap extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: false,
    };
  }

  closeModal() {
    this.props.closeModal("mapView");
  }

  render() {

    const {branch} = this.props;

    if (branch) {
      const latitude = Number(branch.Coordinates.split(",")[0]);
      const longitude = Number(branch.Coordinates.split(",")[1]);

      const title = `${branch.City} ${branch.Province}  ${branch.RegionalPerson}`;
      const coordinates = [ latitude.toFixed(6).toString(), longitude.toFixed(6).toString()].join(',');
      const uri = `https://www.google.com/maps?q=loc:${coordinates}&z=6`;

      return (
        <View style={AppStyles.container}>
          <Spinner visible={this.state.loading} textStyle={{color: '#FFF'}}/>
          <ModalHeader
            headerTitle={title}
            onClose={this.closeModal.bind(this)}
          />
          <WebView
            source={{ uri }}
          />
        </View>
      );
    } else {
      return (
        <View style={AppStyles.container}>
          <ModalHeader
            headerTitle="Store Map"
            onClose={this.closeModal.bind(this)}
          />
        </View>
      );
    }


  }
}

export default StoreLocationMap;
