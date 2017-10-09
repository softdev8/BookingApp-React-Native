import React, {Component} from 'react';
import {AppColors, AppFonts, AppStyles, AppSizes, AppConstants, AppErrors} from '../../constants';
import {StyleSheet, View, Alert, Text, TextInput, TouchableOpacity} from 'react-native';
import AwesomeButton from '../../libs/AwesomeButton';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view'
import {connect} from 'react-redux';
import LabelSelect from '../../libs/LabelSelect';

const moment = require('moment');

const BTN_STATE = {
  IDLE: 'idle',
  BUSY: 'busy',
  SUCCESS: 'success',
  FAILED: 'failed'
};

class SearchFilterModal extends Component {

  constructor(props) {
    super(props);

    this.state = {
      filters: {},
      submitState: BTN_STATE.IDLE,
    };

    this.onApplyFilter = this.onApplyFilter.bind(this);
  }

  componentDidMount() {
    this.setState({ filters: this.props.filters})
  }

  renderAddButton() {
    return (
      <AwesomeButton
        states={{
            idle: {
              text: 'Submit',

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
              onPress: this.onApplyFilter
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

  onApplyFilter() {

  }

  onValueChange(key, filter, value) {
    const {filters} = this.state;

    value.map(item => filter[item] = true);
    filters[key] = filter;

    this.setState({ filters });
  }

  renderFilter(title, filter) {
    const value = Object.keys(filter).filter(key => filter[key]);

    console.log(title, filter, value);

    return (
      <View style={[AppStyles.row, AppStyles.centerAligned]} key={title}>
        <LabelSelect
          ref={(ref) => this.labelSelect = ref}
          title={title}
          buttonTitle={title}
          enable={true}
          readOnly={false}
          enableAddBtn={true}
          style={{width: 80, marginHorizontal: 80}}
          onConfirm={list => {
            this.onValueChange(title, filter, list);
            this.labelSelect.cancelSelect();
          }}>
          { value.map((val, index) => {
            return (
              <LabelSelect.Label
                key={`selected-${index}`}
                data={val}
                onCancel={() => {
                    const updateItems = value.splice(index, 1);
                    this.onValueChange(title, filter, updateItems);
                  }}>{val}</LabelSelect.Label>
            );
          })
          }
          {
            Object.keys(filter).map((key, index) => {
              return (
                <LabelSelect.ModalItem
                  key={`select-${index}`}
                  data={key}
                  selected={filter[key]}
                >{key}</LabelSelect.ModalItem>
              )
            })
          }
        </LabelSelect>
      </View>
    )
  }
  render() {
    const { onSubmitFailed } = this.props;
    const { filters } = this.state;

    return (
      <KeyboardAwareScrollView style={styles.container}>

        <View style={[AppStyles.row, AppStyles.centerAligned]}>
          <Text style={styles.itemTitle}>Search Filter</Text>
        </View>
        {Object.keys(filters).map(key => (
          this.renderFilter(key, filters[key])
        ))}
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
        </View>
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

export default connect(mapStateToProps, {})(SearchFilterModal);
