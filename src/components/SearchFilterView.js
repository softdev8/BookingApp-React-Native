import React, {Component} from 'react';
import {AppColors, AppFonts, AppStyles, AppSizes, AppConstants, AppErrors} from '../constants';
import {StyleSheet, View, Alert, Text, TextInput, TouchableOpacity} from 'react-native';
import AwesomeButton from '../libs/AwesomeButton';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view'
import {connect} from 'react-redux';
import LabelSelect from '../libs/LabelSelect';
import {Actions} from 'react-native-router-flux';
import {updateSearchFilter} from '../actions';

const moment = require('moment');

const BTN_STATE = {
  IDLE: 'idle',
  BUSY: 'busy',
  SUCCESS: 'success',
  FAILED: 'failed'
};

class SearchFilterView extends Component {

  constructor(props) {
    super(props);

    this.state = {
      filters: {},
      isPopupVisible: false,
      popUpQuestion: null,
      updateButtonState: BTN_STATE.IDLE,
    };

    this.updateFilter = this.updateFilter.bind(this);
  }

  componentDidMount() {
    this.setState({ filters: Object.assign({}, this.props.filters) })
  }

  updateFilter() {
    const {filters} = this.state;
    this.props.updateSearchFilter(filters);
    Actions.pop();
  }

  onValueChange(key, filter, value) {
    const {filters} = this.state;

    Object.keys(filter).forEach(key => filter[key] = value.indexOf(key) !== -1);
    filters[key] = filter;

    this.setState({ filters });
  }

  onValueCancel(key, filter, value) {
    const {filters} = this.state;

    value.map(item => filter[item] = false);
    filters[key] = filter;

    this.setState({ filters });
  }

  renderFilter(title, filter) {
    const value = Object.keys(filter).filter(key => filter[key]);

    return (
      <View key={title}>
        <LabelSelect
          ref={(ref) => this.labelSelect = ref}
          title={title}
          buttonTitle={title}
          enable={true}
          readOnly={false}
          enableAddBtn={true}
          style={{marginHorizontal: 14}}
          onConfirm={list => {
            this.onValueChange(title, filter, list);
            this.labelSelect.cancelSelect();
          }}>
          { value.map((val, index) => {
            return (
              <LabelSelect.Label
                key={`selected-${val}`}
                data={val}
                onCancel={() => {
                    this.onValueCancel(title, filter, [val]);
                  }}>{val}</LabelSelect.Label>
            );
          })
          }
          {
            Object.keys(filter).map((key, index) => {
              return (
                <LabelSelect.ModalItem
                  key={`select-${key}`}
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

  renderFilters() {
    const {filters} = this.props;

    return (
      <View style={styles.container}>
        <Text style={styles.subtitle}> Please select filters </Text>
        <View style={styles.questionsContainer}>
          {Object.keys(filters).map(key => (
            this.renderFilter(key, filters[key])
          ))}
        </View>
      </View>
    )
  }

  renderUpdateFilterButton() {
    return (
      <View style={{margin: 20}}>
        <AwesomeButton
          states={{
          idle: {
            text: 'Update Filter',

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
            onPress: this.updateFilter
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
        }}
          transitionDuration={400}
          buttonState={this.state.updateButtonState}
        />
      </View>
    )
  }

  render() {
    return (
      <KeyboardAwareScrollView style={AppStyles.navContainer}>
        <View style={styles.container}>
          {this.renderFilters()}
          {this.renderUpdateFilterButton()}
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

  questionsContainer: {
    marginVertical: 10
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
  questionWrapper: {
    paddingBottom: 20
  },

  question: {
    marginBottom: 4,
    color: AppColors.base,
    paddingHorizontal: 10
  },
});

const mapStateToProps = (state) => {
  return {
    token: state.auth.token,
  };
};

export default connect(mapStateToProps, {updateSearchFilter})(SearchFilterView);
