import React from 'react';
import { Platform, View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import {AppColors, AppFonts, AppStyles, AppSizes} from '../../constants';

const iconWidth = 30;

const ModalHeader = (props) => {
  const { headerTitle, onClose, rightButton, rightIcon, onRight } = props;

  return (
    <View style={[styles.navHeader, AppStyles.row, AppStyles.centerAligned]}>
      <TouchableOpacity onPress={()=>onClose()}>
        <Icon name="angle-left" style={styles.iconStyle}/>
      </TouchableOpacity>
      <Text style={[AppStyles.textCenterAligned, styles.navTitle]}>{headerTitle}</Text>
      {rightButton &&
      <TouchableOpacity onPress={()=>onRight()}>
        <Icon name={rightIcon.name} style={rightIcon.style}/>
      </TouchableOpacity>
      }
    </View>
  );
};

const styles = StyleSheet.create({

  navHeader: {
    height: AppSizes.navbarHeight,
    backgroundColor: AppColors.base,
	  shadowColor: '#000',
	  shadowOffset: { width: 0, height: 1 },
	  shadowOpacity: 0.4,
	  shadowRadius: 2,
    elevation: 10,
	  zIndex: 20,
    ...Platform.select({
      ios: {
        paddingTop: 22
      },
      android: {
        paddingTop: 0
      },
      vr: {
        paddingTop: 0
      }
    })
  },

  navTitle: {
    flex: 1,
    marginRight: iconWidth,
    fontSize: 18,
    color: 'white',
    fontWeight: 'bold'
  },

  iconStyle: {
    color: 'white',
    paddingLeft: 10,
    fontSize: 38,
    width: iconWidth
  }

});

export { ModalHeader };
