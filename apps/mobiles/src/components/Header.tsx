import React from 'react';
import { View, Image, Text, StyleSheet } from 'react-native';

const Header = () => {
    return (
        <View style={styles.container}>
            <View style={styles.logoWrapper}>
                <Image source={require('../assets/icon.png')} style={styles.logo} />
            </View>
            <Text style={styles.title}>
                <Text style={styles.titleGradient}>GOAL</Text>
                <Text style={styles.titlePlain}>MILLS</Text>
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 
         'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#001f3f', // match stack header background
        borderBottomWidth: 1,
        borderBottomColor: '#54789dff',
    },
    logoWrapper: {
        width: 40,
        height: 40,
        borderRadius: 8,
        overflow: 'hidden',
        backgroundColor: '#fff',
        marginRight: 12,
    },
    logo: {
        width: '100%',
        height: '100%',
        resizeMode: 'contain',
    },
    title: {
        fontSize: 24,
        fontWeight: '900',
        color: '#fff',
    },
    titleGradient: {
        // React Native doesn't support gradient text out of the box; using color placeholder
        color: '#4f9bff',
    },
    titlePlain: {
        color: '#fff',
    },
});

export default Header;
