import React, {Component} from 'react';
import {View, StyleSheet, Animated, Platform} from 'react-native';
import Drawer from 'react-native-drawer';
import {DefaultRenderer, Actions} from 'react-native-router-flux';
import {AppColors, AppFonts, AppStyles, AppSizes} from '../constants';
import TabBar from './common/TabBar';
import DropdownAlert from 'react-native-dropdownalert'
import Modal from '../libs/ModalBox';
import StoreLocatorView from './StoreLocatorView';
import About from './About';
import EventsView from './EventsView';
import StoreLocationMap from './StoreLocationMap';

import NotificationModal from '../components/common/NotificationModal';

import SideBarContent from './SideBarContent';
import FCM, {FCMEvent, RemoteNotificationResult, WillPresentNotificationResult, NotificationType} from 'react-native-fcm';

class NavigationDrawer extends Component {

	constructor(props) {
		super(props);

		this.state = {
			loading: false,
			openedTab: '',

      openedModal: '',
			tab: null,
			notif: {},

		};

		this.onShowAlertWithType = this.onShowAlertWithType.bind(this);
	}


  componentDidMount() {
    
    if (!this.notificationListener) {
      this.initializeNotification();
    }
  }

  componentWillUnmount() {
    // stop listening for events
    this.notificationListener.remove();
    this.refreshTokenListener.remove();
  }

  componentWillReceiveProps(nextProps) {
    const { tab } = nextProps;
    const { openedTab } = this.state;

    if (tab && tab.name !== openedTab ) {
      this.setState({ openedTab: tab.name, tab });
      this.openModal(tab.name);
    }
  }

  initializeNotification() {
    // from unhandled notification from tray
    FCM.getInitialNotification().then((notif) => {
      this.handleNotification(notif);
    });

    this.notificationListener = FCM.on(FCMEvent.Notification, async (notif) => {
      // there are two parts of notif. notif.notification contains the notification payload, notif.data contains data payload
      if(notif.local_notification){
        alert('this is a local notification')
      }
      if(notif.opened_from_tray){
        console.log('app is open/resumed because user clicked banner')       
       if(notif.itemType === 'Order'){
          Actions.orderList();
        }
        if (notif.itemType === 'News'){
           Actions.newsFeedView({ notificationItemId: notif.itemId });
        }
        if (notif.itemType === 'Event') {
          Actions.eventsView({ notificationItemId: notif.itemId });
        }
      }

      this.handleNotification(notif);

      if(Platform.OS ==='ios'){
        switch(notif._notificationType){
          case NotificationType.Remote:
            notif.finish(RemoteNotificationResult.NewData);
            break;
          case NotificationType.NotificationResponse:
            notif.finish();
            break;
          case NotificationType.WillPresent:
            notif.finish(WillPresentNotificationResult.All);
            break;
        }
      }
    });
    this.refreshTokenListener = FCM.on(FCMEvent.RefreshToken, (token) => {
      console.log('refresh_token', token);
      AsyncStorage.setItem('fcm_token', token, () => {
        console.log(token);
      });
    });
  }

  handleNotification(notif)
  {
	  console.log('XXXxXXXXxxxxxxxxxxXXXxXXXXxxxxxxxxxxXXXxXXXXxxxxxxxxxxXXXxXXXXxxxxxxxxxx');
      if (notif == null || notif.length == 0) 
        {
          console.log('handleNotification: notif is blank');
          return;
        }
    const knownItemTypes = ['Event', 'News', 'NewRelease', 'Order'];
    const itemType = notif.itemType || '';
    const itemId = notif.itemId || '';        
    if (itemType === '') {
      return;
    }
    //  if(notif.itemType === 'Order'){
    //       Actions.orderList();
    //     }
    //     if (notif.itemType === 'News'){
    //        Actions.newsFeedView({ notificationItemId: notif.itemId });
    //     }
    //     if (notif.itemType === 'Event') {
    //       Actions.eventsView({ notificationItemId: notif.itemId });
    //     }
    if (itemType === '' || knownItemTypes.indexOf(itemType) === -1) {
      this.setState({
        notif: {
          type: 'warning',
          title: 'Invalid Item Type',
          message: itemType,
        }
      });
    } else {
      const title = notif.title;
      const alertTitle = `${title}`;
      const message =notif.message;

      this.setState({
        notif: {
          type: 'info',
          title: alertTitle,
          message,
          itemType,
          itemId,
        }
      });
    }

		// this.onShowAlertWithType(notif.type, notif.title, notif.message);
    //this.openModal('notificationModal');
    this.refs.notifModal.open();
  }


	onCloseAlert(data) {
		const { notification } = this.state;
		this.setState({ notification: null });
		if (data.type === 'info' && data.action === 'tap') {
      this.props.onNotification(notification);
		}
	}

	onShowAlertWithType(type, title, message) {
		if (this.alertDialog) {
      this.alertDialog.alertWithType(type, title, message);
		}
	}

  openModal(modalName) {
		const { openedModal } = this.state;
		if (openedModal) {
			this.closeModal(openedModal)
		}

		switch (modalName) {
			case "storeLocator":
				// this.refs.storeLocator.open();
				Actions.storeLocator();
				break;

			case "aboutUs":
				this.refs.about.open();
				this.setState({ openedModal: modalName });
				break;

      case "eventsView":
        this.refs.eventView.open();

        this.setState({ openedModal: modalName });
        break;

      case "notificationModal":
        this.refs.notifModal.open();
        this.setState({ openedModal: modalName });
        break;

      case "mapView":
        this.refs.mapView.open();
        this.setState({ openedModal: modalName });
        break;


      default:
				break;
		}
	}

	closeModal(modalName) {
		switch (modalName) {
			case "storeLocator":
				this.refs.storeLocator.close();
        this.setState({ openedModal: '' });
				break;

			case "aboutUs":
				this.refs.about.close();
        this.setState({ openedModal: '' });
				break;

      case "eventsView":
        this.refs.eventView.close();

        this.setState({ openedModal: '' });

        break;

      case "mapView":
        this.refs.mapView.close();

        this.setState({ openedModal: '' });
        break;

      case "notificationModal":
        this.refs.notifModal.close();

        break;

      default:
				break;
		}

		if (this.state.openedTab && modalName === this.state.openedTab) {
      this.props.closeTab();
			this.setState({ openedTab: '' });
		}
	}

  onNotification(notification) {
    this.closeModal('notificationModal');
    this.setState({ notif: {} });

    if (notification) {
      const {itemType, itemId} = notification;
      if (itemType === 'Event') {
        Actions.eventsView({ notificationItemId: itemId });
      } else if (itemType === 'News') {
        Actions.newsFeedView({ notificationItemId: itemId });
      } else if (itemType === 'NewRelease') {
        Actions.newReleaseView({ notificationItemId: itemId });
      } else if (itemType === 'Order') {
        Actions.orderList({ notificationItemId: itemId });
      }
    }
  }

  render() {
		const state = this.props.navigationState;
		const children = state.children;

    const { tab, notif } = this.state;
    const branch = tab ? tab.branch : null;

    // children[0].children = children[0].children.map((child) => {
		// 	return {...child, showAlert: this.onShowAlertWithType}
		// });

		return (
			<Drawer
				ref="navigation"
				open={state.open}
				profile={this.props.profile}
				onOpen={() => Actions.refresh({ key: state.key, open: true })}
				onClose={() => Actions.refresh({ key: state.key, open: false })}
				content={<SideBarContent {...this.props} />}
				styles={drawerStyles}
				tapToClose
				openDrawerOffset={0.25}
				panCloseMask={0.25}
				tweenHandler={(ratio) => ({
                 main: { opacity: Math.max(0.54, 1 - ratio) }
                })}
			>
				<Modal
					ref={"storeLocator"}
					position={"top"}
					swipeToClose={false}
				>
					<StoreLocatorView
						closeModal={this.closeModal.bind(this)}
					/>
				</Modal>

				<Modal
					ref={"about"}
					position={"top"}
					swipeToClose={false}
				>
					<About
						closeModal={this.closeModal.bind(this)}
					/>
				</Modal>

				<Modal
					ref={"eventView"}
					position={"top"}
					swipeToClose={false}
				>
					<EventsView
						closeModal={this.closeModal.bind(this)}
					/>
				</Modal>

				<Modal
					ref={"mapView"}
					position={"top"}
					swipeToClose={false}
				>
					<StoreLocationMap

						branch={branch}

						closeModal={this.closeModal.bind(this)}
					/>
				</Modal>


				<Modal
					ref={"notifModal"}
          position={"top"}
					swipeToClose={false}
					style={[AppStyles.modal, {marginTop: 10, height: 200}]}
				>
					<NotificationModal
						notif={notif}
						onNotification={this.onNotification.bind(this)}
					/>
				</Modal>


				<DefaultRenderer
					navigationState={children[0]}
					onNavigate={this.props.onNavigate}
				/>

				<TabBar
					openModal={(modal) => this.openModal(modal) }
				/>

				<DropdownAlert
					ref={(ref) => this.alertDialog = ref}
					onClose={(data) => this.onCloseAlert(data)}
					styles={{position: new Animated.Value(0)}}
					closeInterval={0}
				/>
			</Drawer>
		);
	}
}

const drawerStyles = {
	// drawer: { shadowColor: '#4caf50', shadowOpacity: 0.8, shadowRadius: 3 },
	// main: { paddingLeft: 3 },
};

export default NavigationDrawer;
