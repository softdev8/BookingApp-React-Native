import React, {Component} from 'react';
import {AppColors, AppFonts, AppStyles, AppSizes, AppConstants, AppErrors} from '../../constants';
import {StyleSheet, View, Alert, Text, ScrollView} from 'react-native';
import {Actions} from 'react-native-router-flux';
import Icon from 'react-native-vector-icons/FontAwesome';
import AwesomeButton from '../../libs/AwesomeButton';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view'

const BTN_STATE = {
  IDLE: 'idle',
  BUSY: 'busy',
  SUCCESS: 'success',
  FAILED: 'failed'
};

class NotificationModal extends Component {

  constructor(props) {
    super(props);

    this.state = {
      quantity: 1,
      orderState: BTN_STATE.IDLE,
    };
  }

  render() {
    const { notif, onNotification } = this.props;

    return (
      <View style={styles.container}>
        <ScrollView style={{height: 100}}>
          <View style={[AppStyles.row, AppStyles.centerAligned]}>
            <Text style={styles.itemTitle}> {notif.title} </Text>
          </View>

          <View style={[AppStyles.row, {paddingVertical: 2, paddingRight: 20}]}>
            <Icon name="info-circle" style={styles.iconCommon}/>
            <Text style={styles.commonText}> {notif.message} </Text>
          </View>
        </ScrollView>

        <View style={[AppStyles.row, {marginTop: 30}]}>

          <View style={[{flex: 1}, AppStyles.centerAligned]}>
            <AwesomeButton
              states={{
                  default: {
                    text: <Text>Ok</Text>,
                    backgroundStyle: {
                      backgroundColor: AppColors.base,
                      minHeight: 40,
                      width: 120,
                      marginHorizontal: 20,
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: 20
                    },
                    labelStyle: {
                      color: '#FFF',
                      fontWeight: 'bold'
                    },
                    onPress: ()=>{ onNotification(notif) }
                  }
                }}
            />
          </View>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    margin: 20,
    backgroundColor: 'rgba(0,0,0,0)'
  },

  itemContainer: {
    flex: 1,
    paddingRight: 24
  },

  iconBig: {
    width: 18,
    fontSize: 14,
    marginTop: 4,
    color: AppColors.textSecondary,
    textAlign: 'center'
  },

  iconCommon: {
    width: 18,
    fontSize: 12,
    marginTop: 3,
    color: AppColors.textSecondary,
    textAlign: 'center'
  },

  itemTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: AppColors.colorPrimary,
  },

  commonText: {
    color: AppColors.textSecondary,
    
  },
});

export default NotificationModal;

