import { QRScanner } from '~/components/QRScanner';
import { router } from 'expo-router';
import { Alert } from 'react-native';
import { useEventStore } from '~/store/store';

export default function ScannerModal() {
    const { addScannedAttendee, currentEvent } = useEventStore();

    const handleScan = (data: string) => {
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
                        onPress: () => { }, // Stay on scanner
                    },
                    {
                        text: 'Done',
                        onPress: () => router.back(),
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
                    onPress: () => { }, // Stay on scanner
                },
                {
                    text: 'Done',
                    onPress: () => router.back(),
                },
            ]);
        }
    };

    const handleClose = () => {
        router.back();
    };

    return <QRScanner onScan={handleScan} onClose={handleClose} />;
}
