import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, Image, ScrollView, KeyboardAvoidingView, Platform, SafeAreaView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';

const RegistrationForm = ({ onRegister, lastSessionTime }) => {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [bio, setBio] = useState('');
    const [image, setImage] = useState(null);

    //format seconds into HH:MM:SS
    const formatTime = (seconds) => {
        if (!seconds) return '00:00:00';
        
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        
        return [
            hours.toString().padStart(2, '0'),
            minutes.toString().padStart(2, '0'),
            secs.toString().padStart(2, '0')
        ].join(':');
    };

    const pickImage = async () => {
        let permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (permissionResult.granted === false) {
            alert("It is necessary to grant access to the photo gallery to select a photo.");
            return;
        }

        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 4],
            quality: 1,
        });

        if (!result.canceled) {
            setImage(result.assets[0].uri);
        }
    };

    const takePhoto = async () => {
        let permissionResult = await ImagePicker.requestCameraPermissionsAsync();
        if (permissionResult.granted === false) {
            alert("It is necessary to grant access to the camera to take a photo.");
            return;
        }

        let result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            aspect: [4, 4],
            quality: 1,
        });

        if (!result.canceled) {
            setImage(result.assets[0].uri);
        }
    };

    const validateForm = () => {
        //verify all fields are filled
        if (!firstName || !lastName || !email || !password || !bio) {
            Alert.alert('Error', 'All fields are required.');
            return false;
        }

        // Verify that the email is valid
        const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
        if (!emailPattern.test(email)) {
            Alert.alert('Error', 'Please enter a valid email address.');
            return false;
        }

        // Verify that the password meets the requirements
        const passwordPattern = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$#!%*?&]{8,}$/;
        if (!passwordPattern.test(password)) {
            Alert.alert('Error', 'The password must have at least 8 characters, a capital letter, a number and a special character.');
            return false;
        }

        return true;
    };

    const handleRegister = async () => {
        if (!validateForm()) {
            return; 
        }

        const userData = { firstName, lastName, email, bio, image };

        // Save the user data 
        await AsyncStorage.setItem('userData', JSON.stringify(userData));
        await AsyncStorage.setItem('isRegistered', 'true');

        //callthe onRegister function to update the state 
        onRegister();
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <KeyboardAvoidingView 
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={styles.keyboardAvoidingView}
            >
                <ScrollView 
                    contentContainerStyle={styles.scrollContainer}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.mainContainer}>
                        <View style={styles.formContainer}>
                            {lastSessionTime && (
                                <Text style={styles.lastSessionText}>
                                    Last session: {formatTime(parseInt(lastSessionTime))}
                                </Text>
                            )}
                            
                            <Text style={styles.title}>Register</Text>
                            
                            {image ? (
                                <TouchableOpacity onPress={pickImage}>
                                    <Image source={{ uri: image }} style={styles.profileImage} />
                                </TouchableOpacity>
                            ) : (
                                <View style={styles.photoActions}>
                                    <TouchableOpacity style={styles.photoButton} onPress={pickImage}>
                                        <Text style={styles.photoButtonText}>Choose Photo</Text>
                                    </TouchableOpacity>
                                    
                                    <TouchableOpacity style={styles.photoButton} onPress={takePhoto}>
                                        <Text style={styles.photoButtonText}>Take Photo</Text>
                                    </TouchableOpacity>
                                </View>
                            )}
                            
                            <TextInput
                                style={styles.input}
                                placeholder="First Name"
                                value={firstName}
                                onChangeText={setFirstName}
                            />
                            
                            <TextInput
                                style={styles.input}
                                placeholder="Last Name"
                                value={lastName}
                                onChangeText={setLastName}
                            />
                            
                            <TextInput
                                style={styles.input}
                                placeholder="Email"
                                value={email}
                                onChangeText={setEmail}
                                keyboardType="email-address"
                                autoCapitalize="none"
                            />
                            
                            <TextInput
                                style={styles.input}
                                placeholder="Password"
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry
                            />
                            
                            <TextInput
                                style={[styles.input, styles.bioInput]}
                                placeholder="Short Bio"
                                value={bio}
                                onChangeText={setBio}
                                multiline
                                numberOfLines={3}
                            />
                            
                            <TouchableOpacity 
                                style={styles.registerButton} 
                                onPress={handleRegister}
                            >
                                <Text style={styles.registerButtonText}>Register</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#fff',
    },
    keyboardAvoidingView: {
        flex: 1,
    },
    scrollContainer: {
        flexGrow: 1,
        justifyContent: 'center', // Center content vertically
    },
    mainContainer: {
        flex: 1,
        justifyContent: 'center', // Center content vertically
        paddingHorizontal: 20,
        paddingVertical: 40,
    },
    formContainer: {
        width: '100%',
        maxWidth: 400,
        alignSelf: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    input: {
        backgroundColor: '#f5f5f5',
        borderRadius: 8,
        padding: 12,
        marginBottom: 12,
        fontSize: 16,
    },
    bioInput: {
        height: 80,
        textAlignVertical: 'top',
    },
    photoActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 15,
    },
    photoButton: {
        backgroundColor: '#f0f0f0',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
        width: '48%',
        alignItems: 'center',
    },
    photoButtonText: {
        fontSize: 14,
        color: '#333',
    },
    profileImage: {
        width: 100,
        height: 100,
        borderRadius: 50,
        alignSelf: 'center',
        marginBottom: 15,
    },
    registerButton: {
        backgroundColor: '#4285F4',
        padding: 14,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 5,
    },
    registerButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    lastSessionText: {
        fontSize: 14,
        color: '#777',
        textAlign: 'center',
        marginBottom: 15,
    },
});

export default RegistrationForm;