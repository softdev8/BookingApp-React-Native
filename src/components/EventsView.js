import React, {Component} from 'react';
import {View, Text, StyleSheet, Alert, ScrollView, TouchableOpacity, Platform} from 'react-native';
import {AppColors, AppFonts, AppStyles, AppSizes, AppConstants, AppErrors} from '../constants';
import {Actions} from 'react-native-router-flux';
import Spinner from 'react-native-loading-spinner-overlay';
import axios from 'axios';
import {connect} from 'react-redux';
import Icon from 'react-native-vector-icons/FontAwesome';
import RNCalendarEvents from 'react-native-calendar-events';
import {ModalHeader} from './common/ModalHeader'
import Modal from '../libs/ModalBox';
import EventAddModal from './common/EventAddModal';

const moment = require('moment');

class EventsView extends Component {

	constructor(props) {
		super(props);

		this.state = {
			loading: false,
			events: [],
			calendarAuthorized: false,
			selectedEventIndex: -1,
			selectedEvent: null,
		};
	}

	closeModal() {
		this.props.closeModal("eventsView");
	}

	componentDidMount() {
		this.retrieveEvents();
	}

	retrieveEvents() {
		let _this = this;
		this.setState({loading: true});

		const headers = {
			'Authorization': this.props.token
		};
		axios.get(
			AppConstants.BASE_URL + 'retrieveEvents',
			{
				headers: headers
			}
		)
			.then(
				function (response) {
					console.log("=================Retrieve Events Success=================");
					// sort events by the date
					const events = response.data.sort((a, b) => {
						if (a.Date > b.Date) {
							return -1;
						} else if (a.Date < b.Date) {
							return 1;
						} else {
              return 0
						}
					});
					_this.setState({events, loading: false});

					RNCalendarEvents.authorizationStatus()
						.then(status => {
							// handle status
							if (status != 'authorized') {
								RNCalendarEvents.authorizeEventStore()
									.then(status => {
										// handle status
										if (status == 'authorized') {
											_this.setState({calendarAuthorized: true});
										}
									});
							} else {
								_this.setState({calendarAuthorized: true});
							}
						});

          setTimeout(()=> {
            const {notificationItemId} = _this.props;
            if (notificationItemId) {
              // notification
              const index = events.reduce((prev, item, index) => item.Id === notificationItemId ? index : prev, -1);
              if (index !== -1) {
                _this.setState({selectedEventIndex: index});
              } else {
                Alert.alert('Failed to find a event', notificationItemId, [{
                  text: 'OK',
                  onPress: () => console.log('OK Pressed')
                }]);
							}
            }
          }, 200);
				}
			)
			.catch(
				function (error) {
					console.log("=================Retrieve Events FAILED=================");
					const response = error.response.data;
					_this.setState({loading: false});
          if (error.response.status === AppErrors.AUTH_FAILED) {
            Actions.auth({ redirect: 'eventsView' });
            return;
          }
					setTimeout(()=> {
						Alert.alert('Failed to retrieve events', response, [{
							text: 'OK',
							onPress: () => console.log('OK Pressed')
						}]);
					}, 200);
				}
			);
	}

  checkEvent(event) {
		const isAndroid = Platform.OS === 'android';
    return new Promise((resolve, reject) => {
      // check the event already registered
      if (event.eventId) {
      	console.log(event.eventId);
        RNCalendarEvents.findEventById(event.eventId.toString())
          .then(event => {
            // already registered
            reject('Already registered event', event);
          })
          .catch(error => {
            console.log('a2', error);
            resolve();
          })
      } else {
      	const startDate = `${event.Date}.000Z`;
        const oneDayAfter = new Date(event.Date);
        oneDayAfter.setDate(oneDayAfter.getDate() + 1);
        oneDayAfter.setUTCHours(24);
        const endDate = oneDayAfter.toISOString();
        RNCalendarEvents.fetchAllEvents(
          startDate,
          endDate
				)
          .then(events => {
          	const matchedEvents = events.map(evt =>
							isAndroid && evt.description === event.Description ||
							event.notes === event.Description);
          	if (matchedEvents.length > 0) {
              reject('already exists', event);
						} else {
							resolve();
						}
          })
          .catch(error => {
            console.log('a1', error);
            resolve();
          })
      }
    });
	}

	onAddEvent(event) {
		const _this = this;
		if (this.state.calendarAuthorized) {
      const startDate = `${event.Date}.000Z`;
      const endDate = `${event.Date}.000Z`;
      // const oneDayAfter = new Date(event.Date);
      // oneDayAfter.setDate(oneDayAfter.getDate() + 1);
      // oneDayAfter.setUTCHours(24);
      // const endDate = oneDayAfter.toISOString();
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
						Alert.alert('Success',
							"This event successfully added to Calendar.",
							[{
								text: 'OK',
								onPress: () => _this.setState({ loading: false })		// only to refresh screen
							}]
						);
					}, 200);
				})
				.catch(error => {
					// handle error
					debugger;
				});
		}
	}

	showAddEventPopup(event) {
		const _this = this;

		RNCalendarEvents.authorizationStatus()
			.then(status => {
				// handle status
				if (status != 'authorized') {
					RNCalendarEvents.authorizeEventStore()
						.then(status => {
							// handle status
							if (status == 'authorized') {
								_this.addEvent(event);
							} else {
                console.log('a', 'not authorized');
							}
						})
						.catch(error => {
              console.log('a', error);
						});
				} else {
					_this.addEvent(event);
				}
			})
			.catch(error => {
				console.log('a', error);
			});
	}

	showEventDetail(selectedEvent, selectedEventIndex) {
		this.setState({ selectedEvent, selectedEventIndex });
    this.showAddEventPopup(selectedEvent);
	}

  onSubmitSuccess(message, id) {
    this.refs.eventAddModal.close();
    this.state.selectedEvent.eventId = id;
    Alert.alert('Success', message, [{
      text: 'OK',
      onPress: () => console.log('OK Pressed')
    }]);
    console.log(this.state.events);
  }

  onSubmitFailed(response) {
    if (response == 0) {
      // Failed to submit comment
      Alert.alert('Failed to add event', 'We are sorry. Please try again later.', [{
        text: 'OK',
        onPress: () => console.log('OK Pressed')
      }]);
    } else {
      // Cancelled
    }
    this.refs.eventAddModal.close();
  }

  addEventNew(event) {
    this.checkEvent(event)
			.then(() => {
				Alert.alert(
					'Events',
					`Would you like to add this event on ${moment(event.Date).format("DD MMM YYYY")}`,
					[
						{
							text: 'Yes', onPress: () => {
							console.log('Yes Pressed');
							this.onAddEvent(event);
						}
						},
						{text: 'Cancel', onPress: () => console.log('Cancel Pressed')}
					]
				);
	    })
			.catch((err, event) => {
        Alert.alert(
          'Events',
          `Already registered event ${err}`,
          [
            {text: 'Ok', onPress: () => console.log('Ok Pressed')}
          ]
        );
			})
	};

  addEvent(event) {
    this.checkEvent(event)
      .then(() => {
        this.refs.eventAddModal.open();
      })
      .catch((err, event) => {
        Alert.alert(
          'Events',
          err,
          [{text: 'Ok'}]
        );
      })
  };

	render() {
		const {events, selectedEventIndex, selectedEvent, calendarAuthorized} = this.state;
		return (
			<View style={AppStyles.container}>
				<Spinner visible={this.state.loading} textStyle={{color: '#FFF'}}/>

				<Modal
					ref={"eventAddModal"}
					position={"top"}
					style={[AppStyles.modal, {marginTop: 100, height: 330}]}
				>
					<EventAddModal
						event={selectedEvent}
						calendarAuthorized={calendarAuthorized}
						onSubmitSuccess={this.onSubmitSuccess.bind(this)}
						onSubmitFailed={this.onSubmitFailed.bind(this)}
					/>
				</Modal>

				<ModalHeader
					headerTitle="Events"
					onClose={this.closeModal.bind(this)}
					rightButton
					rightIcon={{name: "refresh", style: styles.rightButton}}
					onRight={() => this.retrieveEvents()}
				/>
				<ScrollView style={styles.newsContainer}>
					{
						events.map((event, index)=> {
							return (
								<TouchableOpacity
									key={event.Id}
									style={[AppStyles.row, AppStyles.centerAligned]}
									onPress={() => this.showEventDetail(event, index)}
								>

									<View style={styles.newsRow}>
										<Text style={styles.newsTitle} numberOfLines={1}> {event.Title} </Text>
										<View style={AppStyles.row}>
											<Icon name="calendar" style={[styles.iconCommon, {marginTop: 4}]}/>
											<Text style={styles.commonText}> {moment(event.Date).format("DD MMM YYYY")} </Text>
										</View>
									</View>

								</TouchableOpacity>
							)
						})
					}
				</ScrollView>
			</View>
		);
	}
}

const styles = StyleSheet.create({

	container: {
		flex: 1
	},

	iconCommon: {
		width: 18,
		fontSize: 12,
		color: AppColors.textSecondary,
		textAlign: 'center'
	},

	newsContainer: {
		borderColor: AppColors.listItemBackground,
		borderBottomWidth: 1
	},

	newsRow: {
		padding: 4,
		flex: 1
	},


	newsTitle: {
		fontSize: 16,
		color: AppColors.textPrimary,
	},

	commonText: {
		color: AppColors.textSecondary,
		marginVertical: 2
	},

	description: {
		color: AppColors.textSecondary,
		fontSize: 12
	},

  rightButton: {
    fontSize: 22,
    color: 'white',
		marginRight: 10,
  },
});

const mapStateToProps = (state) => {
	return {
		authenticated: state.auth.authenticated,
		user: state.auth.user,
		token: state.auth.token,
		profile: state.auth.profile
	};
};
export default connect(mapStateToProps, {})(EventsView);