import React from 'react';
import { StyleSheet, View } from 'react-native';

const OpaqueCard = (props) => {
  return (
    <View style={styles.containerStyle}>
      {props.children}
    </View>
  );
};

const styles = StyleSheet.create({
  containerStyle: {
    borderWidth: 2,
    borderRadius: 4,
    paddingHorizontal: 30,
    paddingVertical: 20,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderBottomWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 1,
    marginLeft: 10,
    marginRight: 10,
    marginTop: 10
  }
});

export { OpaqueCard };
