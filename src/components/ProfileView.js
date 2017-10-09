import React, { Component } from 'react';
import { View, Text, StyleSheet, AsyncStorage, TouchableOpacity, Switch, Alert } from 'react-native';
import { fetchQuestions, fetchBranches, fetchUser } from '../actions';
import { connect } from 'react-redux';
import { AppColors, AppFonts, AppStyles, AppSizes, AppConstants, AppErrors } from '../constants';
import Spinner from 'react-native-loading-spinner-overlay';
import AwesomeButton from '../libs/AwesomeButton';
import DateTimePicker from 'react-native-modal-datetime-picker';
import LabelSelect from '../libs/LabelSelect';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import ModalDropdown from '../libs/ModalDropdown';
import MaterialsIcon from 'react-native-vector-icons/MaterialIcons';
import { Kohana } from '../libs/AwesomeInput';
import { Actions } from 'react-native-router-flux';
import axios from 'axios';

let moment = require('moment');

const BTN_STATE = {
    IDLE: 'idle',
    BUSY: 'busy',
    SUCCESS: 'success',
    FAILED: 'failed'
};

class ProfileView extends Component
{

    constructor(props)
    {
        super(props);

        const {profile} = this.props;
        this.state = {
            questions: [],
            branches: [],
            loading: false,
            isPopupVisible: false,
            popUpQuestion: null,
            updateButtonState: BTN_STATE.IDLE,

            // User name
            firstName: this.capitalizeFirstLetter(profile.UserName),
            lastName: this.capitalizeFirstLetter(profile.UserSurname),

            // Branch selection
            selectedBranch: props.branch,

            // Answers of Questions
            answerOfQuestions: {},
            // default values for each input options
            date: null,
            multiSelectedItems: [],
            singleSelectItem: null,
            stringAnswer: '',
            numberAnswer: 0,
            yesNoAnswer: false
        };
        this.retrieveQuestions = this.retrieveQuestions.bind(this);
        this.retrieveBranches = this.retrieveBranches.bind(this);
        this.handleChangeDate = this.handleChangeDate.bind(this);
        this.renderBranches = this.renderBranches.bind(this);
        this.renderQuestions = this.renderQuestions.bind(this);
        this.renderUpdateProfileButton = this.renderUpdateProfileButton.bind(this);


        this.renderLogoutButton = this.renderLogoutButton.bind(this);

        this.updateProfile = this.updateProfile.bind(this);
        this.capitalizeFirstLetter = this.capitalizeFirstLetter.bind(this);
    }



    handleLogOut()
    {
        AsyncStorage.multiRemove(
            ['access_token', 'refresh_token', 'user_name', 'token_type'])
            .then(() =>
            {
                //this.props.logOutUser();
                Actions.auth();
            })
            .catch((err) => Alert.alert(`Error name: ${err.name}`, `Error message: ${err.message}`));
    }


    capitalizeFirstLetter(string)

    {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    componentDidMount()
    {
        this.retrieveQuestions();
    }

    componentWillReceiveProps(nextProps)
    {
        console.log("-----------------Branch Selection---------------");

        //console.log(JSON.stringify(nextProps.branch));

        if (!!nextProps.branch)
        {
            this.setState({ selectedBranch: nextProps.branch });
        }
    }

    checkUpdateFields()
    {
        const {firstName, lastName, selectedBranch, answerOfQuestions} = this.state;
        if (!firstName)
        {
            Alert.alert('Input error', 'Please input your First name', [{ text: 'OK', onPress: () => console.log('OK Pressed') }]);
            return false;
        }

        if (!lastName)
        {
            Alert.alert('Input error', 'Please input your Surname', [{ text: 'OK', onPress: () => console.log('OK Pressed') }]);
            return false;
        }

        if (!selectedBranch)
        {
            Alert.alert('Input error', 'Please Select your Branch', [{ text: 'OK', onPress: () => console.log('OK Pressed') }]);
            return false;
        }

        const result = Object.keys(answerOfQuestions).reduce((prev, questionId) =>
        {
            const answer = answerOfQuestions[questionId];
            let valid = false;
            switch (answer.questionType)
            {
                case 'Selection':
                    if (answer.allowMultipleValues)
                    {
                        valid = answer.value.length > 0;
                    } else
                    {
                        valid = !!answer.value;
                    }
                    break;
                case 'YesNo':
                    valid = answer.value !== undefined && answer.value !== null;
                    break;
                case 'FreeText':
                    if (answer.mandatory == true)
                    {
                        valid = answer.value !== undefined && answer.value.length > 0;
                    }
                    else
                    {
                        valid = true;
                    }
                    break;
                default:
                    valid = !!answer.value;
            }

           
            return prev && valid;
        }, true);

        if (!result)
        {
            Alert.alert('Input error', 'Some fields are mandatory and must be filled in',
                [{ text: 'OK', onPress: () => console.log('OK Pressed') }]);
        }

        return result;
    }

    updateProfile()
    {
        if (this.checkUpdateFields())
        {
            const {questions, firstName, lastName, selectedBranch, answerOfQuestions} = this.state;

            let profileData = {
                name: firstName,
                surname: lastName,
                branchCode: selectedBranch.Code,
                answers: []
            };

            for (let i = 0; i < questions.length; i++)
            {
                const question = questions[i];
                const answer = answerOfQuestions[question.Id];
                if (!answer || answer.value === undefined || answer.value === null)
                {
                    continue;
                }
                const value = answer.value;
                switch (question.QuestionType)
                {
                    case 'Date':
                        profileData.answers.push({
                            questionId: question.Id,
                            answer: moment(value).format('DD-MM-YYYY')
                        });
                        break;
                    case 'Selection':
                        {
                            if (question.AllowMultipleValues)
                            {
                                let multiAnswers = [];
                                for (let j = 0; j < value.length; j++)
                                {
                                    multiAnswers.push(value[j].Id);
                                }
                                profileData.answers.push({
                                    questionId: question.Id,
                                    answer: multiAnswers.join(',')
                                });
                            } else
                            {
                                profileData.answers.push({
                                    questionId: question.Id,
                                    answer: value.Id
                                });
                            }
                            break;
                        }
                    case "FreeText":
                        profileData.answers.push({
                            questionId: question.Id,
                            answer: value
                        });

                        break;
                    case 'Number':
                        profileData.answers.push({
                            questionId: question.Id,
                            answer: value
                        });
                        break;

                    case 'YesNo':
                        profileData.answers.push({
                            questionId: question.Id,
                            answer: value
                        });
                        break;
                    default:
                        break;
                }
            }

            const headers = {
                'Authorization': this.props.token
            };





            this.setState({ updateButtonState: BTN_STATE.BUSY });
            let _this = this;
            axios.post(
                AppConstants.BASE_URL + 'updateProfile',
                JSON.stringify(profileData),
                {
                    headers: headers
                }
            )
                .then(
                function (response)
                {
                    console.log("=================Update Profile Success=================");
                    _this.setState({ updateButtonState: BTN_STATE.SUCCESS });
                    _this.retrieveProfile();
                    setTimeout(() =>
                    {
                        Alert.alert('Success', 'Your profile has been Updated...', [{ text: 'OK', onPress: () => Actions.pop() }]);
                        _this.setState({ updateButtonState: BTN_STATE.IDLE });
                    }, 2000);
                }
                )
                .catch(
                function (error)
                {
                    console.log("=================Update Profile FAILED=================");
                    _this.setState({ updateButtonState: BTN_STATE.FAILED });
                    if (error.response.status === AppErrors.AUTH_FAILED)
                    {
                        Actions.auth({ redirect: 'profileView' });
                        return;
                    }
                    setTimeout(() =>
                    {
                        Alert.alert('Update failed', 'Failed to update your Profile...', [{ text: 'OK', onPress: () => console.log('OK Pressed') }]);
                    }, 200);

                    setTimeout(() =>
                    {
                        _this.setState({ updateButtonState: BTN_STATE.IDLE });
                    }, 2000);
                }
                );
        }
    }

    retrieveProfile()
    {
        let _this = this;

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
                _this.props.fetchUser(response.data);

            }
            )
            .catch(
            function (error)
            {
                console.log("=================Fetch Profile FAILED=================");
                if (error.response.status === AppErrors.AUTH_FAILED)
                {
                    Actions.auth({ redirect: 'profileView' });
                }
            }
            );
    }

    retrieveQuestions()
    {
        const answerOfQuestions = {};
        let _this = this;
        const headers = {
            'Authorization': this.props.token
        };
        //this.setState({ loading: true });
        axios.get(
            AppConstants.BASE_URL + 'RetrieveQuestions?v=1',
            {
                headers: headers
            }
        )
            .then(
            function (response)
            {
                console.log("=================Fetch Questions Success=================");
                const questions = response.data;
                _this.setState({ questions });
                _this.retrieveBranches();
                _this.props.fetchQuestions(questions);

                let profileAnswers = _this.props.profile.Questions;

                for (let i = 0; i < questions.length; i++)
                {
                    let question = questions[i];
                    let value = null;
                    let answered = false;

                    for (let k = 0; k < profileAnswers.length; k++)
                    {
                        let userValue = profileAnswers[k].UserValue;
                        if (question.Id === profileAnswers[k].QuestionId)
                        {
                            if (question.QuestionType === 'Selection')
                            {

                                if (question.AllowMultipleValues)
                                {
                                    let multiSelectedAnswers = [];

                                    for (let j = 0; j < question.Options.length; j++)
                                    {
                                        let option = question.Options[j];
                                        if (userValue.includes(option.Id))
                                        {
                                            multiSelectedAnswers.push(option);
                                        }
                                    }
                                    value = multiSelectedAnswers;
                                } else
                                {

                                    for (let j = 0; j < question.Options.length; j++)
                                    {
                                        let option = question.Options[j];
                                        if (userValue.includes(option.Id))
                                        {
                                            value = option;
                                            break;
                                        }
                                    }
                                }
                            } else if (question.QuestionType === 'Date')
                            {
                                value = moment(userValue, 'DD-MM-YYYY').toDate();
                            } else if (question.QuestionType === 'Number')
                            {
                                value = userValue;
                            } else if (question.QuestionType === 'YesNo')
                            {
                                value = userValue === "True";
                            } else
                            {
                                value = userValue;
                            }
                            answered = true;
                            break;
                        }
                    }
                    if (!answered)
                    {
                        if (question.QuestionType === 'Selection')
                        {
                            if (question.AllowMultipleValues)
                            {
                                value = [];
                            } else
                            {
                                value = null;
                            }
                        } else if (question.QuestionType === 'Date')
                        {
                            value = moment(new Date().toISOString()).format('DD-MM-YYYY');
                        } else if (question.QuestionType === 'Number')
                        {
                            value = 0;
                        } else if (question.QuestionType === 'YesNo')
                        {
                            value = false;
                        } else if (question.QuestionType == "FreeText")
                        {
                            value = "";
                        }
                    }

                    answerOfQuestions[question.Id] = {
                        questionId: question.Id,
                        questionString: question.QuestionString,
                        questionType: question.QuestionType,
                        allowMultipleValues: question.AllowMultipleValues,
                        mandatory: question.Mandatory,
                        value,
                    };
                }
                _this.setState({ answerOfQuestions })

                if (!_this.props.profile.IsProfileComplete)
                {
                    setTimeout(function ()
                    {
                        Alert.alert('Profile Incomplete', 'There are mandatory questions that need to be completed on your profile...', [{ text: 'OK', onPress: () => console.log("Ok pressed") }]);
                    }, 200);
                }

            }
            )
            .catch(
            function (error)
            {
                console.log("=================Fetch Questions FAILED=================");
                _this.setState({ loading: false });
                if (error.response.status === AppErrors.AUTH_FAILED)
                {
                    Actions.auth({ redirect: 'profileView' });
                    return;
                }
                setTimeout(() =>
                {
                    Alert.alert('Fetch Error', 'Failed to fetch Questions...',
                        [{ text: 'OK', onPress: () => console.log('OK Pressed') }],
                        { cancelable: false }
                    );
                }, 200);
            }
            );
    }

    retrieveBranches()
    {
        let _this = this;
        const headers = {
            'Authorization': this.props.token
        };
        axios.get(
            AppConstants.BASE_URL + 'retrieveBranches',
            {
                headers: headers
            }

        )
            .then(
            function (response)
            {
                console.log("=================Fetch Branches Success=================");
                _this.setState({ branches: response.data });
                _this.setState({ loading: false });
                _this.props.fetchBranches(response.data);

                setTimeout(() =>
                {
                    for (let i = 0; i < response.data.length; i++)
                    {
                        let branch = response.data[i];
                        if (branch.Id === _this.props.profile.PreferredBranch.BranchId)
                        {
                            _this.setState({ selectedBranch: branch });
                            break;
                        }
                    }
                }, 200);

            }
            )
            .catch(
            function (error)
            {
                console.log("=================Fetch Branches FAILED=================");

                _this.setState({ loading: false });
                if (error.response.status === AppErrors.AUTH_FAILED)
                {
                    Actions.auth({ redirect: 'profileView' });
                    return;
                }
                setTimeout(() =>
                {
                    Alert.alert(
                        'Fetch Error',
                        'Failed to fetch Branches...',
                        [
                            { text: 'OK', onPress: () => console.log('OK Pressed') },
                        ],
                        { cancelable: false }
                    );
                }, 200);
            }
            );
    }

    handleChangeDate()
    {
        this.setState(
            { isPopupVisible: false }
        );
    }

    renderUserInformation()
    {
        const {firstName, lastName} = this.state;
        return (
            <View style={styles.container}>
                <Text style={styles.subtitle}> Change your full name </Text>
                <View style={styles.questionsContainer}>
                    <Kohana
                        autoCapitalize={'none'}
                        style={{ backgroundColor: '#fff', borderRadius: 4, marginBottom: 16, borderColor: AppColors.colorPrimary, borderWidth: 1, marginHorizontal: 22 }}
                        label={'Username'}
                        iconClass={MaterialsIcon}
                        iconName={'account-circle'}
                        iconColor={AppColors.textSecondary}
                        labelStyle={{ color: AppColors.textSecondary }}
                        inputStyle={{ color: AppColors.textPrimary }}
                        value={firstName}
                        onChangeText={(firstName) => this.setState({ firstName })}
                    />
                    <Kohana
                        autoCapitalize={'none'}
                        style={{ backgroundColor: '#fff', borderRadius: 4, borderColor: AppColors.colorPrimary, borderWidth: 1, marginHorizontal: 22 }}
                        label={'Surname'}
                        iconClass={MaterialsIcon}
                        iconName={'account-circle'}
                        iconColor={AppColors.textSecondary}
                        labelStyle={{ color: AppColors.textSecondary }}
                        inputStyle={{ color: AppColors.textPrimary }}
                        value={lastName}
                        onChangeText={(lastName) => this.setState({ lastName })}
                    />
                </View>
            </View>
        );
    }

    renderBranches()
    {
        return (
            <View style={styles.container}>
                <Text style={styles.subtitle}> *Please choose your Branch </Text>
                <View style={styles.questionsContainer}>
                    <AwesomeButton
                        states={{
                            default: {
                                text: <Text>{this.state.selectedBranch == null ? 'Select Branch' : this.state.selectedBranch.BranchName}</Text>,
                                backgroundStyle: {
                                    backgroundColor: AppColors.colorPrimary,
                                    minHeight: 40,
                                    marginHorizontal: 20,
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    borderRadius: 20
                                },
                                labelStyle: {
                                    color: '#FFF',
                                    fontWeight: 'bold'
                                },

                                onPress: () => { Actions.branchList(); }
                            }
                        }}
                    />
                </View>
            </View>
        )
    }

    dropdownRenderRow(rowData)
    {
        return (
            <TouchableOpacity>
                <View style={styles.dropdownRow}>
                    <Text style={styles.dropdownRowText}>
                        {`${rowData.Value}`}
                    </Text>
                </View>
            </TouchableOpacity>
        );
    }

    dropdownRenderSeparator(sectionID, rowID, adjacentRowHighlighted)
    {

    }

    onValueChange(question, value)
    {


        const {Id, QuestionString, QuestionType, AllowMultipleValues, Mandatory} = question;

        const {answerOfQuestions} = this.state;
        answerOfQuestions[Id] = {
            questionId: Id,
            questionString: QuestionString,
            questionType: QuestionType,
            allowMultipleValues: AllowMultipleValues,


            mandatory: Mandatory,

            value,
        };
        this.setState({ answerOfQuestions });
    }

    renderQuestions()
    {
        const {questions} = this.props;
        const {answerOfQuestions} = this.state;

        return (
            <View style={styles.container}>
                <Text style={styles.subtitle}> Please answer questions </Text>
                <DateTimePicker
                    isVisible={this.state.isPopupVisible}
                    maximumDate={new Date()}
                    onConfirm={(date) =>
                    {
                        this.onValueChange(this.state.popUpQuestion, date);
                        this.setState({
                            isPopupVisible: false,
                            popUpQuestion: null,
                        })
                    }}
                    onCancel={() => { this.setState({ isPopupVisible: false, popUpQuestion: null }) }}
                />
                <View style={styles.questionsContainer}>
                    {
                        questions.map(question =>
                        {
                            const answer = answerOfQuestions[question.Id] || { value: null };
                            const value = answer.value;
                            const checkValue = (arr, Id) =>
                            {
                                if (arr && arr.length)
                                {
                                    const result = arr.filter(itm => itm.Id === Id);
                                    return result.length;
                                } else
                                {
                                    return false;
                                }
                            };


                            var questionString = question.QuestionString;
                            if (question.Mandatory == true)
                            {
                                questionString = "* " + questionString;
                            }

                            switch (question.QuestionType)

                            {
                                case 'Date':
                                    return (
                                        <View key={question.Id} style={styles.questionWrapper}>


                                            <Text style={styles.question}>{questionString}</Text>

                                            <AwesomeButton
                                                states={{
                                                    default: {
                                                        text: <Text>{value ? moment(value).format('DD MMM YYYY') : `Select Date`}</Text>,
                                                        backgroundStyle: {
                                                            backgroundColor: AppColors.colorPrimary,
                                                            minHeight: 40,
                                                            marginHorizontal: 20,
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            borderRadius: 20
                                                        },
                                                        labelStyle: {
                                                            color: '#FFF',
                                                            fontWeight: 'bold'
                                                        },

                                                        onPress: () => { this.setState({ isPopupVisible: true, popUpQuestion: question }) }
                                                    }
                                                }}
                                            />
                                        </View>
                                    );

                                case 'Selection':
                                    return (
                                        <View key={question.Id}>


                                            <Text style={styles.question}>{questionString}</Text>

                                            {
                                                question.AllowMultipleValues ?
                                                    <LabelSelect
                                                        ref={(ref) => this.labelSelect = ref}
                                                        title="Please Choose..."
                                                        enable={true}
                                                        readOnly={false}
                                                        enableAddBtn={true}
                                                        style={{ marginHorizontal: 14 }}
                                                        onConfirm={(list) =>
                                                        {
                                                            this.onValueChange(question, list);
                                                            this.labelSelect.cancelSelect();
                                                        }}>

                                                        {value &&
                                                            value.map((item, index) =>
                                                            {
                                                                return (
                                                                    <LabelSelect.Label
                                                                        key={`selected-${item.Id}`}
                                                                        data={item}
                                                                        onCancel={() =>
                                                                        {
                                                                            const updateItems = value.splice(index, 1);
                                                                            this.onValueChange(question, updateItems);
                                                                        }}>{item.Value}</LabelSelect.Label>
                                                                );
                                                            })
                                                        }

                                                        {
                                                            question.Options.map((item) =>
                                                            {
                                                                return (
                                                                    <LabelSelect.ModalItem
                                                                        key={`select-${item.Id}`}
                                                                        data={item}
                                                                        selected={checkValue(value, item.Id)}
                                                                    >{item.Value}</LabelSelect.ModalItem>
                                                                )
                                                            })
                                                        }

                                                    </LabelSelect>
                                                    :
                                                    <ModalDropdown style={styles.dropdown}
                                                        textStyle={styles.dropdownText}
                                                        dropdownStyle={styles.dropdownStyle}
                                                        defaultValue={{ Id: '0', Value: value == null ? 'Please Select...' : value.Value }}
                                                        options={question.Options}
                                                        renderRow={this.dropdownRenderRow.bind(this)}
                                                        renderSeparator={(sectionID, rowID, adjacentRowHighlighted) => this.dropdownRenderSeparator(sectionID, rowID, adjacentRowHighlighted)}
                                                        onSelect={(rowId, rowData) => this.onValueChange(question, rowData)}
                                                    />
                                            }

                                        </View>
                                    );
                                    break;

                                case 'Number':
                                    return (
                                        <View key={question.Id}>


                                            <Text style={styles.question}>{questionString}</Text>

                                            <Kohana
                                                autoCapitalize={'none'}
                                                style={{ backgroundColor: '#fff', borderRadius: 4, marginBottom: 16, borderColor: AppColors.colorPrimary, borderWidth: 1, marginHorizontal: 22 }}
                                                label={'Please input number'}
                                                iconClass={MaterialsIcon}
                                                iconName={'book'}
                                                iconColor={AppColors.textSecondary}
                                                labelStyle={{ color: AppColors.textSecondary }}
                                                inputStyle={{ color: AppColors.textPrimary }}
                                                value={value + ''}
                                                keyboardType='numeric'
                                                onChangeText={(value) =>
                                                {
                                                    this.onValueChange(question, value);
                                                }}
                                            />
                                        </View>
                                    );
                                    break;

                                case 'YesNo':
                                    return (
                                        <View key={question.Id}>


                                            <Text style={styles.question}>{questionString}</Text>

                                            <Switch
                                                onValueChange={(value) => this.onValueChange(question, value)}
                                                style={{ marginLeft: 20 }}
                                                onTintColor={AppColors.colorPrimary}
                                                value={value} />
                                        </View>
                                    );
                                    break;

                                default: //FreeText
                                    return (
                                        <View key={question.Id}>


                                            <Text style={styles.question}>{questionString}</Text>

                                            <Kohana
                                                autoCapitalize={'none'}
                                                style={{ backgroundColor: '#fff', borderRadius: 4, marginBottom: 16, borderColor: AppColors.colorPrimary, borderWidth: 1, marginHorizontal: 22 }}
                                                label={question.QuestionString}
                                                iconClass={MaterialsIcon}
                                                iconName={'book'}
                                                iconColor={AppColors.textSecondary}
                                                labelStyle={{ color: AppColors.textSecondary }}
                                                inputStyle={{ color: AppColors.textPrimary }}
                                                value={value}
                                                onChangeText={(value) =>
                                                {
                                                    this.onValueChange(question, value);
                                                }}
                                            />
                                        </View>
                                    );
                                    break;
                            }
                        })
                    }
                </View>
            </View>
        );
    }

    renderUpdateProfileButton()
    {
        return (
            <View style={{ margin: 20 }}>
                <AwesomeButton
                    states={{
                        idle: {
                            text: 'Update Profile',

                            iconAlignment: 'left',
                            backgroundStyle: {
                                backgroundColor: AppColors.base,
                                minHeight: 40,
                                alignItems: 'center',
                                justifyContent: 'center',
                                borderRadius: 20
                            },
                            labelStyle: {
                                color: 'white',
                                alignSelf: 'center',
                                fontWeight: 'bold'
                            },
                            onPress: this.updateProfile
                        },
                        busy: {
                            text: 'Updating Profile...',
                            spinner: true,
                            spinnerProps: {
                                animated: true,
                                color: 'white'
                            },
                            backgroundStyle: {
                                backgroundColor: '#006565',
                                minHeight: 40,
                                alignItems: 'center',
                                justifyContent: 'center',
                                borderRadius: 20
                            },
                            labelStyle: {
                                color: 'white',
                                alignSelf: 'center',
                                marginLeft: 10,
                                fontWeight: 'bold'
                            }
                        },
                        success: {
                            text: 'SUCCESS',
                            backgroundStyle: {
                                backgroundColor: 'green',
                                minHeight: 40,
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
                    buttonState={this.state.updateButtonState}
                />
            </View>
        )
    }



    renderLogoutButton()
    {
        return (
            <View style={{ margin: 20 }}>
                <AwesomeButton
                    states={{
                        idle: {
                            text: 'Log Out',

                            iconAlignment: 'left',
                            backgroundStyle: {
                                backgroundColor: AppColors.base,
                                minHeight: 40,
                                alignItems: 'center',
                                justifyContent: 'center',
                                borderRadius: 20
                            },
                            labelStyle: {
                                color: 'white',
                                alignSelf: 'center',
                                fontWeight: 'bold'
                            },
                            onPress: this.handleLogOut
                        },
                        busy: {
                            text: 'Logging out...',
                            spinner: true,
                            spinnerProps: {
                                animated: true,
                                color: 'white'
                            },
                            backgroundStyle: {
                                backgroundColor: '#006565',
                                minHeight: 40,
                                alignItems: 'center',
                                justifyContent: 'center',
                                borderRadius: 20
                            },
                            labelStyle: {
                                color: 'white',
                                alignSelf: 'center',
                                marginLeft: 10,
                                fontWeight: 'bold'
                            }
                        },
                        success: {
                            text: 'SUCCESS',
                            backgroundStyle: {
                                backgroundColor: 'green',
                                minHeight: 40,
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
                    buttonState={this.state.updateButtonState}
                />
            </View>
        )
    }


    render()

    {
        return (
            <KeyboardAwareScrollView style={AppStyles.navContainer}>
                <Spinner visible={this.state.loading} textStyle={{ color: '#FFF' }} />
                <View style={styles.container}>
                    {this.renderUserInformation()}
                    {this.renderBranches()}
                    {this.renderQuestions()}
                    {this.renderUpdateProfileButton()}


                    {this.renderLogoutButton()}

                </View>
            </KeyboardAwareScrollView>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 8,
        backgroundColor: AppColors.background
    },
    title: {
        paddingVertical: 10,
        fontSize: 20,
        fontWeight: 'bold',
        color: AppColors.colorPrimary,
        textAlign: 'center'
    },
    subtitle: {
        fontSize: 16,
        color: AppColors.colorPrimary,
        textAlign: 'center'
    },
    questionsContainer: {
        marginVertical: 10
    },

    questionWrapper: {
        paddingBottom: 20
    },

    question: {
        marginBottom: 4,
        //color: AppColors.base,
        color: AppColors.colorPrimary,
        paddingHorizontal: 10
    },

    dropdown: {
        marginHorizontal: 20,
        marginBottom: 16,
    },
    dropdownText: {
        fontSize: 14,
        fontWeight: 'bold',
        textAlign: 'center',
        color: 'white'
    },

    dropdownStyle: {
        borderColor: AppColors.colorPrimary,
        borderWidth: 2,
        borderRadius: 10,
        height: 124
    },

    dropdownRow: {
        flexDirection: 'row',
        height: 40,
        alignItems: 'center',
        borderBottomWidth: 1,
        borderRadius: 10,
        borderColor: '#ccc'
    },

    dropdownRowText: {
        marginHorizontal: 4,
        fontSize: 16,
        color: AppColors.colorSecondary,
        textAlignVertical: 'center'
    }
});

const mapStateToProps = (state) =>
{
    return {
        authenticated: state.auth.authenticated,
        user: state.auth.user,
        token: state.auth.token,
        profile: state.auth.profile,
        questions: state.data.questions,
        branches: state.data.branches
    };
};

export default connect(mapStateToProps, { fetchQuestions, fetchBranches, fetchUser })(ProfileView);