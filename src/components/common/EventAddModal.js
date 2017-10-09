import React, {Component} from 'react';
import {AppColors, AppFonts, AppStyles, AppSizes, AppConstants, AppErrors} from '../../constants';
import {StyleSheet, View, Alert, Text, TextInput, TouchableOpacity} from 'react-native';
import AwesomeButton from '../../libs/AwesomeButton';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view'
import {connect} from 'react-redux';
import Icon from 'react-native-vector-icons/FontAwesome';
import RNCalendarEvents from 'react-native-calendar-events';

const moment = require('moment');

const BTN_STATE = {
  IDLE: 'idle',
  BUSY: 'busy',
  SUCCESS: 'success',
  FAILED: 'failed'
};

class EventAddModal extends Component {

  constructor(props) {
    super(props);

    this.state = {
      submitState: BTN_STATE.IDLE,
      showConfirm: false,
    };

    this.onAddEvent = this.onAddEvent.bind(this);
    this.confirmAddEvent = this.confirmAddEvent.bind(this);
  }

  componentDidMount() {
  }

  onAddEvent() {
    const {event} = this.props;
    const _this = this;
    if (this.props.calendarAuthorized) {
      const startDate = `${event.Date}.000Z`;
      const endDate = `${event.Date}.000Z`;
      RNCalendarEvents.saveEvent(event.Title, {
        location: event.Location,
        notes: event.Description,
        startDate,
        endDate,
        allDay: true,
      })
        .then(id => {
          console.log('e', id);
          event.eventId = id;
          // handle success
          setTimeout(()=> {
            _this.props.onSubmitSuccess('This event successfully added to Calendar.', id);
          }, 1000);
        })
        .catch(error => {
          // handle error
          setTimeout(()=> {
            Alert.alert('Events', `Please try again. ${error}`, [{text: 'OK', onPress: () => console.log('OK Pressed')}]);
          }, 200);

          setTimeout(()=> {
            _this.setState({submitState: BTN_STATE.IDLE});
          }, 1500);
        });
    } else {
      Alert.alert('Events', 'Not authorized.', [{text: 'OK', onPress: () => console.log('OK Pressed')}]);
    }
  }

  renderAddButton() {
    return (
      <AwesomeButton
        states={{
            idle: {
              text: 'Add to calendar',

              iconAlignment: 'left',
              backgroundStyle: {
                backgroundColor: AppColors.colorPrimary,
                minHeight: 40,
                width: 120,
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 20
              },
              labelStyle: {
                color: 'white',
                alignSelf: 'center',
                fontWeight: 'bold'
              },
              onPress: this.onAddEvent
            },
            busy: {
              text: '',
              spinner: true,
              spinnerProps: {
                animated: true,
                color: 'white'
              },
              backgroundStyle: {
                backgroundColor: '#006565',
                minHeight: 40,
                width: 120,
                paddingLeft: 10,
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 20
              }
            },
            success: {
              text: 'SUCCESS',
              backgroundStyle: {
                backgroundColor: 'green',
                minHeight: 40,
                width: 120,
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 20
              },
              labelStyle: {
                color: 'white',
                alignSelf: 'center',
                fontWeight: 'bold'
              }
            },
            failed: {
              text: 'FAILED',
              backgroundStyle: {
                backgroundColor: AppColors.colorRed,
                minHeight: 40,
                width: 120,
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 20
              },
              labelStyle: {
                color: 'white',
                alignSelf: 'center',
                fontWeight: 'bold'
              }
            }
          }}
        transitionDuration={400}
        buttonState={this.state.submitState}
      />
    );
  }

  confirmAddEvent() {
    this.setState({showConfirm: !this.state.showConfirm});
  }

  render() {
    const {onSubmitFailed, event} = this.props;
    const {showConfirm} = this.state;

    return (
      <KeyboardAwareScrollView style={styles.container}>

        <View style={[AppStyles.row, AppStyles.centerAligned]}>
          <Text style={styles.itemTitle}>{event.Title}</Text>
        </View>

        <View style={[AppStyles.row, {paddingVertical: 6}]}>
          <Icon name="info-circle" style={styles.iconCommon}/>
          <Text style={styles.commonText} numberOfLines={2}> {event.Description} </Text>
        </View>

        <View style={[AppStyles.row, {paddingVertical: 2}]}>
          <Icon name="calendar" style={styles.iconCommon}/>
          <Text style={styles.commonText} numberOfLines={3}> {moment(event.Date).format("DD MMM YYYY")} </Text>
        </View>

        <View style={[AppStyles.row, {paddingVertical: 2}]}>
          <Icon name="map-marker" style={styles.iconCommon}/>
          <Text style={[styles.commonText, {fontSize: 16}]} numberOfLines={1}> {event.Location} </Text>
        </View>

        <TouchableOpacity
          style={[AppStyles.row, AppStyles.centerAligned]}
          onPress={this.confirmAddEvent}
        >
          <Icon name="calendar" style={[styles.iconCalendar]}/>
        </TouchableOpacity>

        {showConfirm &&
        <View style={[AppStyles.row, AppStyles.centerAligned, {marginTop: 20}]}>
          <Text>Are you sure want to add the event to calendar ?</Text>
        </View>}
        {showConfirm &&
        <View style={[AppStyles.row, {marginTop: 10}]}>
          <View style={[{flex: 1, marginTop: 10}, AppStyles.centerAligned]}>
            <AwesomeButton
              states={{
                  default: {
                    text: <Text>Cancel</Text>,
                    backgroundStyle: {
                      backgroundColor: AppColors.base,
                      minHeight: 40,
                      width: 120,
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: 20
                    },
                    labelStyle: {
                      color: '#FFF',
                      fontWeight: 'bold'
                    },

                    onPress: ()=>{ onSubmitFailed(1) }
                  }
                }}
            />
          </View>
          <View style={[{flex: 1, marginTop: 10}, AppStyles.centerAligned]}>{ this.renderAddButton() }</View>
        </View>}
      </KeyboardAwareScrollView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
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
    width: 16,
    fontSize: 18,
    marginTop: 3,
    color: AppColors.textSecondary,
    textAlign: 'center'
  },

  iconCalendar: {
    width: 32,
    fontSize: 32,
    marginTop: 4,
    color: AppColors.colorPrimary,
    textAlign: 'center'
  },

  itemTitle: {
    marginTop: 20,
    fontSize: 18,
    color: AppColors.colorPrimary,
    fontWeight: 'bold'
  },

  commonText: {
    color: AppColors.textSecondary,
  },

  textInputWrapper: {
    minHeight: 100,
    borderColor: AppColors.colorPrimary,
    borderWidth: 1,
    padding: 4,
    borderRadius: 4,
    marginTop: 20
  },

  textInput: {
    color: AppColors.textPrimary,
    height: 92,
    fontSize: 14
  }
});

const mapStateToProps = (state) => {
  return {
    token: state.auth.token,
  };
};

export default connect(mapStateToProps, {})(EventAddModal);
