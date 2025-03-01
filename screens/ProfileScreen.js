import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Button, Image, TextInput, Modal, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';

const ProfileScreen = ({ onLogout }) => {
    const [userData, setUserData] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    
    useEffect(() => {
        const fetchUserData = async () => {
            const data = await AsyncStorage.getItem('userData');
            if (data) {
                setUserData(JSON.parse(data));
            }
        };
        fetchUserData();
        
   
    }, []);
    
    

    if (!userData) {
        return (
            <View style={styles.container}>
                <ActivityIndicator size="large" color="#0000ff" />
            </View>
        );
    }

    // Handle image picking
    const pickImage = async () => {
        let permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (permissionResult.granted === false) {
            alert('Its necessary to grant access to the photo gallery to select a photo.');
            return;
        }

        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 4],
            quality: 1,
        });

        if (!result.canceled) {
            setUserData({ ...userData, image: result.assets[0].uri });
        }
    };

    const takePhoto = async () => {
        let permissionResult = await ImagePicker.requestCameraPermissionsAsync();
        if (permissionResult.granted === false) {
            alert('It is necessary to grant access to the camera to take a photo.');
            return;
        }

        let result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            aspect: [4, 4],
            quality: 1,
        });

        if (!result.canceled) {
            setUserData({ ...userData, image: result.assets[0].uri });
        }
    };

    const saveProfile = async () => {
        try {
            await AsyncStorage.setItem('userData', JSON.stringify(userData));
            console.log('Profile Saved');
            setIsEditing(false);
        } catch (error) {
            console.log('Error to save the profile: ', error);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Profile</Text>

            
            {isEditing ? (
                <Modal visible={isEditing} animationType="slide">
                <View style={styles.editContainer}>
                    {/* You can pick a photo clicking on the photoprofile */}
                    <TouchableOpacity onPress={pickImage} style={styles.imageButton}>
                        {userData.image ? (
                            <Image source={{ uri: userData.image }} style={styles.image} />
                        ) : (
                            <Text style={styles.imageButtonText}>Choose a photo</Text>
                        )}
                    </TouchableOpacity>
            
                    {/* Take Photo Button */}
                    <Button title="Take a Photo" onPress={takePhoto} />
            
                    <TextInput
                        style={styles.input}
                        placeholder="First Name"
                        value={userData.firstName}
                        onChangeText={(text) => setUserData({ ...userData, firstName: text })}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Last Name"
                        value={userData.lastName}
                        onChangeText={(text) => setUserData({ ...userData, lastName: text })}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Email"
                        value={userData.email}
                        onChangeText={(text) => setUserData({ ...userData, email: text })}
                    />
                    <View style={styles.buttonsContainer}>
                        <Button title="Save" onPress={saveProfile} />
                        <Button title="Cancel" onPress={() => setIsEditing(false)} color="gray" />
                    </View>
                </View>
            </Modal>
            ) : (
                <>
                    <View style={styles.profileContainer}>
                        {userData.image ? (
                            <TouchableOpacity onPress={pickImage}>
                                <Image source={{ uri: userData.image }} style={styles.image} />
                            </TouchableOpacity>
                        ) : (
                            <TouchableOpacity onPress={pickImage} style={styles.imageButton}>
                                <Text style={styles.imageButtonText}>Choose a photo</Text>
                            </TouchableOpacity>
                        )}
                        <Text style={styles.text}>First Name: {userData.firstName}</Text>
                        <Text style={styles.text}>Last Name: {userData.lastName}</Text>
                        <Text style={styles.text}>Email: {userData.email}</Text>
                        <Button title="Edit" onPress={() => setIsEditing(true)} />
                    </View>
                </>
            )}
            <Button title="Logout" onPress={onLogout} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f4f4f4',
        padding: 16,
    },
    title: {
        fontSize: 30,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#222',
    },
    profileContainer: {
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 6,
        elevation: 3,
        width: '90%',
    },
    editContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 6,
        elevation: 3,
    },
    text: {
        fontSize: 18,
        marginBottom: 10,
        color: '#444',
    },
    input: {
        width: '100%',
        height: 45,
        borderColor: '#ddd',
        borderWidth: 1,
        paddingHorizontal: 12,
        borderRadius: 8,
        backgroundColor: '#fafafa',
        marginBottom: 12,
    },
    image: {
        width: 130,
        height: 130,
        borderRadius: 65,
        marginBottom: 10,
        borderWidth: 2,
        borderColor: '#007AFF',
    },
    imageButton: {
        width: 130,
        height: 130,
        backgroundColor: '#e0e0e0',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 65,
        marginBottom: 10,
    },
    imageButtonText: {
        color: '#555',
        textAlign: 'center',
        fontSize: 14,
    },
    buttonsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginTop: 16,
    },
    button: {
        flex: 1,
        padding: 10,
        borderRadius: 8,
        alignItems: 'center',
        marginHorizontal: 5,
    },
    buttonPrimary: {
        backgroundColor: '#007AFF',
    },
    buttonSecondary: {
        backgroundColor: '#ccc',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});


export default ProfileScreen;