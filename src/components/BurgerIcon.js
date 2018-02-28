import React, { Component } from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Actions } from 'react-native-router-flux';
import Icon from 'react-native-vector-icons/FontAwesome';

export default class BurgerIcon extends Component {
    toggleDrawer() {
        Actions.refresh({ key: 'drawer', open: value => !value });
    }

    render() {
        return (
            <TouchableOpacity onPress={this.toggleDrawer}>
                <Icon name="bars" style={styles.burgerIcon} />
            </TouchableOpacity>
        );
    }
}

const styles = StyleSheet.create({
    burgerIcon: {
        fontSize: 22,
        color: '#FFF',
    },
    burgerButton: {
        width: 100,
        height: 37,
        position: 'absolute',
        bottom: 4,
        left: 2,
        padding: 8,
    }
});
