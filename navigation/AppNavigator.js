import { useState, useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from '@expo/vector-icons/Ionicons'

import RegistrationForm from '../components/RegistrationForm';
import ProfileScreen from '../screens/ProfileScreen';
import HomeScreen from '../screens/HomeScreen';

const Tab = createBottomTabNavigator();

const AppNavigator = () => {
    const [isRegistered, setIsRegistered] = useState(null);
    const [lastSessionTime, setLastSessionTime] = useState(null);

    useEffect(() => {
        const checkRegistration = async () => {
            const registered = await AsyncStorage.getItem('isRegistered');
            const sessionTime = await AsyncStorage.getItem('lastSessionTime');
            setLastSessionTime(sessionTime);
            setIsRegistered(registered === 'true');
        };
        checkRegistration();
    }, []);

    const handleRegister = async () => {
        //store the current timestamp when the user registers
        const sessionStartTime = Date.now();
        await AsyncStorage.setItem('sessionStartTime', sessionStartTime.toString());
        await AsyncStorage.setItem('isRegistered', 'true');
        setIsRegistered(true);
    };

    const handleLogout = async () => {
        // Get the current session time value from storage, 
        const currentSessionTime = await AsyncStorage.getItem('currentSessionTime');
        if (currentSessionTime) {
            await AsyncStorage.setItem('lastSessionTime', currentSessionTime);
            setLastSessionTime(currentSessionTime);
        }

        await AsyncStorage.removeItem('isRegistered');
        await AsyncStorage.removeItem('userData');
        setIsRegistered(false);
    };

    if (isRegistered === null) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#0000ff" />
            </View>
        );
    }

    if (!isRegistered) {
        return <RegistrationForm onRegister={handleRegister} lastSessionTime={lastSessionTime} />;
    }

    return (
        <NavigationContainer screenOptions={{
            tabBarLabelPosition: 'bellow-icon',
            tabBarShowLabel: true, 
            tabBarActiveTintColor: 'blue',
          }}>
            <Tab.Navigator>
                <Tab.Screen name="Home" component={HomeScreen} options={{
                    tabBarIcon: ({color}) => (<Ionicons name='home' size={20} color={color}/>),
                    tabBarBadge: 1,
                }}/> 
                <Tab.Screen name="Profile"  options={{
                    tabBarIcon: ({color}) => (<Ionicons name='person' size={20} color={color}/>), }}>
                    {() => <ProfileScreen onLogout={handleLogout} />}
                </Tab.Screen>
            </Tab.Navigator>
        </NavigationContainer>
    );
};

export default AppNavigator;