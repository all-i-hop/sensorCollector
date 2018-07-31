import React from 'react';
import { Text, View } from 'react-native';

const TextLabel = ({ value }) => {
    const { labelStyle, containerStyle } = styles;

    return (
        <View style={containerStyle}>
            <Text style={labelStyle}>{value}</Text>
        </View>
    );
};

const styles = {
    labelStyle: {
        fontSize: 18,
        paddingLeft: 20,
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    },
    containerStyle: {
        height: 40,
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center'
    }
};

export { TextLabel };