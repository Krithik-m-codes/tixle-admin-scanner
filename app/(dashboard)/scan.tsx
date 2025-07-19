import { useState, useCallback } from 'react';
import { View, Text, Alert } from 'react-native';
import { router } from 'expo-router';
import { useEventStore } from '~/store/store';
import { Container } from '~/components/Container';
import { QRScanner } from '~/components/QRScanner';
import { Button } from '~/components/Button';

export default function Scan() {
    const [isScanning, setIsScanning] = useState(true);
    const { addScannedAttendee, currentEvent } = useEventStore();

    const handleScan = useCallback(
        (data: string) => {
            try {
                // Parse QR code data (assuming JSON format)
                const attendeeData = JSON.parse(data);

                if (attendeeData.id && attendeeData.name && attendeeData.email) {
                    // Add to scanned attendees
                    addScannedAttendee({
                        ...attendeeData,
                        checked_in: true,
                        check_in_time: new Date().toISOString(),
                        event_id: currentEvent?.id || 'unknown',
                    });

                    Alert.alert('Check-in Successful!', `${attendeeData.name} has been checked in.`, [
                        {
                            text: 'Continue Scanning',
                            onPress: () => setIsScanning(true),
                        },
                        {
                            text: 'Go to Dashboard',
                            onPress: () => router.push('/(dashboard)'),
                        },
                    ]);
                } else {
                    Alert.alert('Invalid QR Code', 'This QR code does not contain valid attendee data.');
                }
            } catch {
                // Handle simple string QR codes or other formats
                Alert.alert('QR Code Scanned', `Data: ${data}`, [
                    {
                        text: 'Continue Scanning',
                        onPress: () => setIsScanning(true),
                    },
                    {
                        text: 'Done',
                        onPress: () => router.push('/(dashboard)'),
                    },
                ]);
            }

            setIsScanning(false);
        },
        [addScannedAttendee, currentEvent?.id]
    );

    const handleClose = () => {
        router.back();
    };

    if (isScanning) {
        return <QRScanner onScan={handleScan} onClose={handleClose} />;
    }

    return (
        <Container>
            <View className="flex-1 items-center justify-center p-6">
                <Text className="mb-4 text-xl font-semibold text-gray-800">Scan Complete</Text>
                <View className="w-full space-y-3">
                    <Button
                        title="Scan Another Code"
                        onPress={() => setIsScanning(true)}
                        className="w-full"
                    />
                    <Button
                        title="Go to Dashboard"
                        onPress={() => router.push('/(dashboard)')}
                        className="w-full bg-gray-500"
                    />
                </View>
            </View>
        </Container>
    );
}
