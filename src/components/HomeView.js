

import React, { Component } from 'react';
import { connect } from 'react-redux';
import { View, Text, StyleSheet, TouchableOpacity, Linking, ScrollView } from 'react-native';
import { AppColors, AppFonts, AppStyles, AppSizes, AppConstants, AppErrors } from '../constants';


import Icon from 'react-native-vector-icons/FontAwesome';
import AwesomeButton from '../libs/AwesomeButton';
import { Actions } from 'react-native-router-flux';
import { fetchUser, fetchStaticContent, alreadyCheckedProfile } from '../actions';
import axios from 'axios';
import Spinner from 'react-native-loading-spinner-overlay';
import Orientation from 'react-native-orientation';
import FCM from 'react-native-fcm';


class HomeView extends Component

{

    constructor(props)
    {
        super(props);



        this.state = {
            loading: false,
            unreadNews: 0,
            unreadNewReleases: 0,
            sourceSceneKey: '',
        };



        this.handleFacebookPress = this.handleFacebookPress.bind(this);
        this.handleTwitterPress = this.handleTwitterPress.bind(this);
    }




    componentDidMount()
    {
         this.retrieveProfile();         
    }



    componentWillReceiveProps(nextProps)
    {
        const { sourceSceneKey } = nextProps;

       
        if (sourceSceneKey !== '')
        {
            if (this.state.sourceSceneKey !== sourceSceneKey)
            {
                // need to be updates
                if (sourceSceneKey === 'newsFeedView' || sourceSceneKey === 'newReleaseView' || sourceSceneKey === 'profileView')
                {
                    this.retrieveProfile();
                }
                this.setState({ sourceSceneKey });
            }
        }
    }


    retrieveStaticContent()
    {
        let _this = this;

        const headers = {
            'Authorization': this.props.token
        };
        axios.get(
            AppConstants.BASE_URL + 'RetrieveStaticContent?v=1',
            {
                headers: headers
            }
        )
            .then(
            function (response)
            {
                console.log("=================Fetch Static Content Success=================");
                _this.setState({ loading: false });
                _this.props.fetchStaticContent(response.data);
            }
            )
            .catch(
            function (error)
            {
                console.log("=================Fetch Static Content FAILED=================");
                _this.setState({ loading: false });
                if (error.response.status === AppErrors.AUTH_FAILED)
                {
                    Actions.auth({ redirect: 'homeView' });
                }
            }
            );
    }

    retrieveProfile()
    {
        let _this = this;

        //this.setState({ loading: true });

        const headers = {
            'Authorization': this.props.token
        };
        axios.get(
            AppConstants.BASE_URL + 'retrieveProfile',
            {
                headers: headers
            }
        )
            .then(
            function (response)
            {
                console.log("=================Fetch Profile Success=================");
                //console.log(JSON.stringify(response.data));
                const {UnreadNews, UnreadNewReleases} = response.data;
                _this.setState({ loading: false });
                const badge = UnreadNewReleases + UnreadNews ;
                FCM.setBadgeNumber(badge);
                _this.setState({
                    unreadNews: UnreadNews,
                    unreadNewReleases: UnreadNewReleases,
                });
                _this.props.fetchUser(response.data);

                _this.retrieveStaticContent();

                setTimeout(() =>
                {
                    //console.log(_this.props.profile);

                    //if (!_this.props.profile.IsProfileComplete && !_this.props.profileChecked)
                    //{
                    //    Actions.profileView();
                    //    _this.props.alreadyCheckedProfile(true);
                    //}
                    if (!_this.props.profile.IsProfileComplete)
                    {
                        Actions.profileView();
                    }
                }, 200);

            }
            )
            .catch(
            function (error)
            {
                _this.setState({ loading: false });
                console.log("=================Fetch Profile FAILED=================");
                if (error.response.status === AppErrors.AUTH_FAILED)
                {
                    Actions.auth({ redirect: 'homeView' });
                }
            }
            
            );
    }

    handleFacebookPress()
    {

        Linking.canOpenURL(AppConstants.FACEBOOK).then(supported =>
        {
            if (supported)
            {
                Linking.openURL(AppConstants.FACEBOOK);
            } else
            {
                console.log("Don't know how to open URI: " + AppConstants.FACEBOOK);
            }
        });
    }

    handleTwitterPress()
    {
        Linking.canOpenURL(AppConstants.TWITTER).then(supported =>
        {
            if (supported)
            {
                Linking.openURL(AppConstants.TWITTER);
            } else
            {
                console.log("Don't know how to open URI: " + AppConstants.TWITTER);
            }
        });
    }

    renderFacebookButton()
    {
        return (
            <AwesomeButton
                states={{
                    default: {
                        text: 'Facebook',
                        iconAlignment: 'left',
                        icon: <Icon name="facebook" size={22} color="#fff" style={{ alignSelf: 'center' }} />,
                        backgroundStyle: {
                            backgroundColor: AppColors.brand.facebook,
                            minHeight: 40,
                            minWidth: 100,
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: 4
                        },
                        labelStyle: {
                            paddingTop: 2,
                            paddingLeft: 8,
                            color: '#FFF',
                            fontWeight: 'bold'
                        },

                        onPress: this.handleFacebookPress
                    }
                }}
            />
        )
    }

    renderTwitterButton()
    {
        return (
            <AwesomeButton
                states={{
                    default: {
                        text: 'Twitter',
                        iconAlignment: 'left',
                        icon: <Icon name="twitter" size={22} color="#fff" style={{ alignSelf: 'center' }} />,
                        backgroundStyle: {
                            backgroundColor: AppColors.brand.twitter,
                            minHeight: 40,
                            minWidth: 100,
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: 4
                        },
                        labelStyle: {
                            paddingTop: 2,
                            paddingLeft: 8,
                            color: '#FFF',
                            fontWeight: 'bold'
                        },

                        onPress: this.handleTwitterPress
                    }
                }}
            />
        )
    }

    render()
    {
        return (
            <ScrollView style={[AppStyles.navContainer]}>

                <View style={{ flexDirection: 'row', borderBottomWidth: 1, borderColor: '#eee' }}>
                    <TouchableOpacity
                        style={[styles.mainButton, { borderRightWidth: 1, borderColor: '#eee' }]}
                        onPress={() => { Actions.newsFeedView(); }}>
                        <View>
                            <Icon name="rss" size={30} color="#fff" style={styles.buttonIcon} />
                            {
                                this.state.unreadNews > 0 ?
                                    <TouchableOpacity style={{
                                        position: 'absolute', right: -10, top: -10,
                                        backgroundColor: AppColors.colorPrimary, borderRadius: 10,
                                    }}>
                                        <Text style={{ fontSize: 12, fontWeight: 'bold', color: 'white', marginHorizontal: 6, marginVertical: 2 }}>
                                            {this.state.unreadNews}
                                        </Text>
                                    </TouchableOpacity>
                                    :
                                    null
                            }
                        </View>
                        <Text style={styles.title}>News Feed</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.mainButton}
                        onPress={() => { Actions.profileView(); }}>
                        <View>
                            <Icon name="user" size={30} color="#fff" style={styles.buttonIcon} />
                        </View>
                        <Text style={styles.title}>Profile</Text>
                    </TouchableOpacity>
                </View>

                <View style={[{ flexDirection: 'row', backgroundColor: 'white' }, styles.shadow]}>
                    <TouchableOpacity
                        style={[styles.mainButton, { borderRightWidth: 1, borderColor: '#eee' }]}
                        onPress={() => { Actions.newReleaseView(); }}>
                        <View>
                            <Icon name="plus" size={30} color="#fff" style={styles.buttonIcon} />
                            {
                                this.state.unreadNewReleases > 0 ?
                                    <TouchableOpacity style={{
                                        position: 'absolute', right: -10, top: -10,
                                        backgroundColor: AppColors.colorPrimary, borderRadius: 10,
                                    }}>
                                        <Text style={{ fontSize: 12, fontWeight: 'bold', color: 'white', marginHorizontal: 6, marginVertical: 2 }}>
                                            {this.state.unreadNewReleases}
                                        </Text>
                                    </TouchableOpacity>
                                    :
                                    null
                            }
                        </View>
                        <Text style={styles.title}>New Release</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.mainButton}
                        onPress={() => { Actions.searchView(); }}>
                        <View>
                            <Icon name="search" size={30} color="#fff" style={styles.buttonIcon} />
                        </View>
                        <Text style={styles.title}>Search</Text>
                    </TouchableOpacity>
                </View>

                <View style={[AppStyles.centerAligned, { flex: 1, flexDirection: 'row' }]}>
                    <View style={{ padding: 10 }}>
                        {this.renderFacebookButton()}
                    </View>
                    <View style={{ padding: 10 }}>
                        {this.renderTwitterButton()}
                    </View>
                </View>

                 <Spinner visible={this.state.loading} textStyle={{ color: '#FFF' }} /> 

            </ScrollView>
        );
    }

}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: AppColors.background
    },
    title: {
        paddingVertical: 10,
        alignSelf: 'center',
        fontSize: 14,
        color: AppColors.base
    },
    buttonIcon: {
        color: AppColors.base,
        alignSelf: 'center'
    },
    mainButton: {
        flex: 1,
        height: AppSizes.screen.widthHalf,
        padding: 20,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
    },
    shadow: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 1,
        elevation: 2
    }

});

const mapStateToProps = (state) =>
{
    return {
        authenticated: state.auth.authenticated,
        user: state.auth.user,
        token: state.auth.token,
        profile: state.auth.profile,
        profileChecked: state.data.profileChecked,
        sourceSceneKey: state.routes.sourceSceneKey
    };
};

export default connect(mapStateToProps, { fetchUser, fetchStaticContent, alreadyCheckedProfile })(HomeView);