import { useState, useEffect } from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Button } from './Button';

interface QRScannerProps {
    onScan: (data: string) => void;
    onClose: () => void;
}

export const QRScanner = ({ onScan, onClose }: QRScannerProps) => {
    const [permission, requestPermission] = useCameraPermissions();
    const [scanned, setScanned] = useState(false);

    useEffect(() => {
        if (!permission?.granted) {
            requestPermission();
        }
    }, [permission, requestPermission]);

    const handleBarCodeScanned = ({ data }: { data: string }) => {
        if (!scanned) {
            setScanned(true);
            onScan(data);
        }
    };

    if (!permission) {
        return (
            <View className="flex-1 items-center justify-center">
                <Text>Requesting camera permission...</Text>
            </View>
        );
    }

    if (!permission.granted) {
        return (
            <View className="flex-1 items-center justify-center p-6">
                <Text className="mb-4 text-center">Camera permission is needed to scan QR codes</Text>
                <Button title="Grant Permission" onPress={requestPermission} />
            </View>
        );
    }

    return (
        <View className="flex-1">
            <CameraView
                style={StyleSheet.absoluteFillObject}
                facing="back"
                onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
            />

            {/* Scanner Overlay */}
            <View className="flex-1 items-center justify-center">
                <View className="h-64 w-64 rounded-lg border-2 border-white" />
                <Text className="mt-4 px-6 text-center text-white">
                    Point your camera at a QR code to scan
                </Text>
            </View>

            {/* Controls */}
            <View className="absolute bottom-10 left-0 right-0 flex-row justify-center space-x-4 px-6">
                <Button title="Cancel" onPress={onClose} className="mr-2 flex-1 bg-red-500" />
                {scanned && (
                    <Button title="Scan Again" onPress={() => setScanned(false)} className="ml-2 flex-1" />
                )}
            </View>
        </View>
    );
};
