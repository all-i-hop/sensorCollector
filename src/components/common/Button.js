import React from 'react';
import { Text, TouchableOpacity } from 'react-native';

const Button = ({ onPress, children, disabled, btnStyle }) => {
    const { defaultButtonStyle,
            textStyle,
            disabledStyle,
            startStyle,
            stopStyle
        } = styles;

    var activeStyle

    switch(btnStyle) {
        case "start":
            activeStyle = startStyle
            break;
        case "stop":
            activeStyle = stopStyle
            break;
        default:
            activeStyle = defaultButtonStyle
    }

    return (
        // <TouchableOpacity style={buttonStyle} >
        <TouchableOpacity
            onPress={onPress}
            style={activeStyle}
            disabled={disabled}>
                <Text style={textStyle}>
                    {children}
                </Text>
        </TouchableOpacity>
    );
};

const styles = {
    defaultButtonStyle: {
        flex: 1, // expand as much as possible
        alignSelf: 'stretch',
        backgroundColor: '#3385ff',
        borderRadius: 5,
        borderWidth: 1,
        borderColor: '#3385ff',
        marginLeft: 5,
        marginRight: 5
    },
    textStyle: {
        alignSelf: 'center',
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '600',
        paddingTop: 10,
        paddingBottom: 10
    },
    disabledStyle: {
        flex: 1, // expand as much as possible
        alignSelf: 'stretch',
        backgroundColor: '#e0d2d6',
        borderRadius: 5,
        borderWidth: 1,
        borderColor: '#007aff',
        marginLeft: 5,
        marginRight: 5
    },
    startStyle: {
        flex: 1, // expand as much as possible
        alignSelf: 'stretch',
        backgroundColor: '#00cc00',
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#00cc00',
        marginLeft: 5,
        marginRight: 5
    },
    stopStyle: {
        flex: 1, // expand as much as possible
        alignSelf: 'stretch',
        backgroundColor: '#cc3300',
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#cc3300',
        marginLeft: 5,
        marginRight: 5
    }
};

export { Button };
