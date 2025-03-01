import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Dimensions } from 'react-native';
import * as Location from 'expo-location';
import MapView, { Marker } from 'react-native-maps';
import AsyncStorage from '@react-native-async-storage/async-storage';

const HomeScreen = () => {
  const [location, setLocation] = useState(null);
  const [weather, setWeather] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [sessionTime, setSessionTime] = useState(0);

  useEffect(() => {
    (async () => {
      //location permissions
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      //get location
      let currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation);

      // Fetch weather data
      fetchWeatherData(currentLocation.coords.latitude, currentLocation.coords.longitude);
    })();

    // Initialize session timer
    initializeSessionTimer();
  }, []);

  //useEffect to store the current session time in AsyncStorage
  // whenever the sessionTime state changes
  useEffect(() => {
    const storeSessionTime = async () => {
      await AsyncStorage.setItem('currentSessionTime', sessionTime.toString());
    };
    storeSessionTime();
  }, [sessionTime]);

  const initializeSessionTimer = async () => {
    // Get the session start time from AsyncStorage
    const startTimeStr = await AsyncStorage.getItem('sessionStartTime');
    if (startTimeStr) {
      const startTime = parseInt(startTimeStr);
      
      // Calculate initial elapsed time in seconds
      const initialElapsedTime = Math.floor((Date.now() - startTime) / 1000);
      setSessionTime(initialElapsedTime);
      
      // Set up timer to update every second
      const timerInterval = setInterval(() => {
        setSessionTime(prevTime => prevTime + 1);
      }, 1000);
      
      // Clean up timer on component unmount
      return () => clearInterval(timerInterval);
    }
  };

  // Format time
  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    return [
      hours.toString().padStart(2, '0'),
      minutes.toString().padStart(2, '0'),
      secs.toString().padStart(2, '0')
    ].join(':');
  };

  const fetchWeatherData = async (latitude, longitude) => {
    try {
      // this is my OpenWeatherMap API key, i researched how to get it 
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=600c4a2e8c7276da9c14f91823f3fb99`
      );
      const data = await response.json();
      setWeather(data);
    } catch (error) {
      setErrorMsg('Error fetching weather data');
      console.error(error);
    }
  };

  return (
    <View style={styles.container}>
      {/* Session Timer Display */}
      <View style={styles.timerContainer}>
        <Text style={styles.timerLabel}>Session Time:</Text>
        <Text style={styles.timerValue}>{formatTime(sessionTime)}</Text>
      </View>

      <View style={styles.weatherContainer}>
        {weather ? (
          <>
            <Text style={styles.tempText}>{Math.round(weather.main.temp)}°C</Text>
            <Text style={styles.weatherDesc}>{weather.weather[0].description}</Text>
            <Text style={styles.locationText}>{weather.name}</Text>
          </>
        ) : errorMsg ? (
          <Text style={styles.errorText}>{errorMsg}</Text>
        ) : (
          <ActivityIndicator size="large" color="#0000ff" />
        )}
      </View>
      
      {/* Map */}
      <View style={styles.mapContainer}>
        {location ? (
          <MapView
            style={styles.map}
            initialRegion={{
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
              latitudeDelta: 0.0922,
              longitudeDelta: 0.0421,
            }}
          >
            <Marker
              coordinate={{
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
              }}
              title="Your Location"
            />
          </MapView>
        ) : (
          <ActivityIndicator size="large" color="#0000ff" />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  weatherContainer: {
    alignItems: 'center',
    marginBottom: 20,
    padding: 15,
    borderRadius: 10,
    backgroundColor: '#f5f5f5',
  },
  tempText: {
    fontSize: 48,
    fontWeight: 'bold',
  },
  weatherDesc: {
    fontSize: 18,
    marginVertical: 5,
    textTransform: 'capitalize',
  },
  locationText: {
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    color: 'red',
    fontSize: 16,
  },
  mapContainer: {
    flex: 1,
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 20,
  },
  map: {
    width: Dimensions.get('window').width - 40,
    height: '100%',
  },
  // Timer styles
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    marginBottom: 15,
    padding: 10,
    backgroundColor: '#e8f4f8',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#a0d1e6',
  },
  timerLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 8,
    color: '#2c7da0',
  },
  timerValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c7da0',
  },
});

export default HomeScreen;