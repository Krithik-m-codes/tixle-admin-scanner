import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Camera, CameraView } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';

interface QRScannerProps {
    onScan: (data: string) => void;
    onClose: () => void;
}

export function QRScanner({ onScan, onClose }: QRScannerProps) {
    const [hasPermission, setHasPermission] = useState<boolean | null>(null);
    const [scanned, setScanned] = useState(false);

    useEffect(() => {
        const getCameraPermissions = async () => {
            const { status } = await Camera.requestCameraPermissionsAsync();
            setHasPermission(status === 'granted');
        };

        getCameraPermissions();
    }, []);

    const handleBarCodeScanned = ({ type, data }: { type: string; data: string }) => {
        setScanned(true);
        onScan(data);
    };

    if (hasPermission === null) {
        return (
            <View className="flex-1 items-center justify-center bg-black">
                <Text className="text-white">Requesting camera permission...</Text>
            </View>
        );
    }

    if (hasPermission === false) {
        return (
            <View className="flex-1 items-center justify-center bg-black p-6">
                <Ionicons name="camera-outline" size={64} color="white" />
                <Text className="mt-4 text-center text-white">
                    Camera access is required to scan QR codes
                </Text>
                <TouchableOpacity
                    className="mt-4 rounded-lg bg-indigo-600 px-6 py-3"
                    onPress={() => Alert.alert('Permission Required', 'Please enable camera access in settings')}>
                    <Text className="font-medium text-white">Enable Camera</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View className="flex-1 bg-black">
            <CameraView
                style={StyleSheet.absoluteFillObject}
                onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
                barcodeScannerSettings={{
                    barcodeTypes: ['qr'],
                }}
            />

            {/* Overlay */}
            <View className="flex-1 justify-center">
                {/* Header */}
                <View className="absolute top-12 left-0 right-0 z-10 flex-row items-center justify-between px-6">
                    <Text className="text-lg font-semibold text-white">Scan QR Code</Text>
                    <TouchableOpacity
                        onPress={onClose}
                        className="h-10 w-10 items-center justify-center rounded-full bg-black/50">
                        <Ionicons name="close" size={24} color="white" />
                    </TouchableOpacity>
                </View>

                {/* Scanning area */}
                <View className="items-center">
                    <View className="h-64 w-64 border-2 border-white/50 rounded-lg">
                        <View className="absolute -top-1 -left-1 h-6 w-6 border-l-4 border-t-4 border-white" />
                        <View className="absolute -top-1 -right-1 h-6 w-6 border-r-4 border-t-4 border-white" />
                        <View className="absolute -bottom-1 -left-1 h-6 w-6 border-l-4 border-b-4 border-white" />
                        <View className="absolute -bottom-1 -right-1 h-6 w-6 border-r-4 border-b-4 border-white" />
                    </View>
                    <Text className="mt-4 text-center text-white">
                        Align the QR code within the frame
                    </Text>
                </View>

                {/* Reset button */}
                {scanned && (
                    <View className="absolute bottom-12 left-0 right-0 px-6">
                        <TouchableOpacity
                            className="rounded-lg bg-indigo-600 py-4"
                            onPress={() => setScanned(false)}>
                            <Text className="text-center font-medium text-white">Scan Again</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        </View>
    );
}
