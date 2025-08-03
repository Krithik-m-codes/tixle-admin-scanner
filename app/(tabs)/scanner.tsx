import React, { useState, useEffect } from 'react';
import { View, Text, Alert, TouchableOpacity, Modal, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraView, Camera } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/hooks/useAuth';
import { supabase } from '../../src/lib/supabase';

interface TicketData {
    bookingId: string;
    eventId: string;
    userId: string;
    ticketCode: string;
    isValid: boolean;
    isUsed: boolean;
    eventTitle?: string;
    userName?: string;
    seatNumber?: string;
}

export default function Scanner() {
    const { user } = useAuth();
    const [hasPermission, setHasPermission] = useState<boolean | null>(null);
    const [scanned, setScanned] = useState(false);
    const [isManualEntry, setIsManualEntry] = useState(false);
    const [manualTicketCode, setManualTicketCode] = useState('');
    const [verificationResult, setVerificationResult] = useState<TicketData | null>(null);
    const [showResult, setShowResult] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);

    useEffect(() => {
        const getCameraPermissions = async () => {
            const { status } = await Camera.requestCameraPermissionsAsync();
            setHasPermission(status === 'granted');
        };

        getCameraPermissions();
    }, []);

    const verifyTicket = async (ticketCode: string) => {
        setIsVerifying(true);

        try {
            // Query the booking with the ticket code
            const { data: booking, error: bookingError } = await supabase
                .from('bookings')
                .select(`
          *,
          events (
            id,
            title,
            start_date,
            end_date,
            location
          )
        `)
                .eq('ticket_code', ticketCode)
                .single();

            if (bookingError || !booking) {
                setVerificationResult({
                    bookingId: '',
                    eventId: '',
                    userId: '',
                    ticketCode,
                    isValid: false,
                    isUsed: false,
                });
                setShowResult(true);
                return;
            }

            // Check if ticket is already verified
            const isAlreadyVerified = booking.is_verified;

            // Get user details
            const { data: userData } = await supabase.auth.admin.getUserById(booking.user_id);

            const ticketData: TicketData = {
                bookingId: booking.id,
                eventId: booking.event_id,
                userId: booking.user_id,
                ticketCode: booking.ticket_code,
                isValid: true,
                isUsed: isAlreadyVerified,
                eventTitle: booking.events?.title,
                userName: userData?.user?.user_metadata?.name || userData?.user?.email,
                seatNumber: booking.seat_number,
            };

            if (!isAlreadyVerified) {
                // Mark ticket as verified
                await supabase
                    .from('bookings')
                    .update({
                        is_verified: true,
                        verified_at: new Date().toISOString(),
                        verified_by: user?.id,
                    })
                    .eq('id', booking.id);

                // Create verification record
                await supabase
                    .from('ticket_verifications')
                    .insert({
                        booking_id: booking.id,
                        admin_id: user?.id,
                        event_id: booking.event_id,
                        verified_at: new Date().toISOString(),
                        verification_method: isManualEntry ? 'manual' : 'qr_scan',
                    });
            }

            setVerificationResult(ticketData);
            setShowResult(true);
        } catch (error) {
            console.error('Verification error:', error);
            Alert.alert('Error', 'Failed to verify ticket. Please try again.');
        } finally {
            setIsVerifying(false);
        }
    };

    const handleBarCodeScanned = ({ type, data }: { type: string; data: string }) => {
        setScanned(true);
        verifyTicket(data);
    };

    const handleManualVerification = () => {
        if (!manualTicketCode.trim()) {
            Alert.alert('Error', 'Please enter a ticket code');
            return;
        }

        verifyTicket(manualTicketCode.trim());
        setManualTicketCode('');
        setIsManualEntry(false);
    };

    const resetScanner = () => {
        setScanned(false);
        setShowResult(false);
        setVerificationResult(null);
    };

    if (hasPermission === null) {
        return (
            <SafeAreaView className="flex-1 bg-gray-50">
                <View className="flex-1 items-center justify-center">
                    <Text className="text-lg text-gray-600">Requesting camera permission...</Text>
                </View>
            </SafeAreaView>
        );
    }

    if (hasPermission === false) {
        return (
            <SafeAreaView className="flex-1 bg-gray-50">
                <View className="flex-1 items-center justify-center p-6">
                    <Ionicons name="camera-outline" size={64} color="#D1D5DB" />
                    <Text className="mt-4 text-center text-xl font-bold text-gray-900">Camera Access Required</Text>
                    <Text className="mt-2 text-center text-gray-600">
                        Please enable camera access to scan QR codes
                    </Text>
                    <TouchableOpacity
                        className="mt-6 rounded-lg bg-indigo-600 px-6 py-3"
                        onPress={() => setHasPermission(null)}
                    >
                        <Text className="font-semibold text-white">Request Permission</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-black">
            <View className="flex-1">
                {/* Header */}
                <View className="absolute top-12 left-0 right-0 z-10 px-6">
                    <View className="flex-row items-center justify-between">
                        <Text className="text-xl font-bold text-white">Ticket Scanner</Text>
                        <TouchableOpacity
                            onPress={() => setIsManualEntry(true)}
                            className="rounded-lg bg-white/20 px-4 py-2"
                        >
                            <Text className="font-medium text-white">Manual Entry</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Scanner */}
                <CameraView
                    onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
                    barcodeScannerSettings={{
                        barcodeTypes: ["qr", "pdf417"],
                    }}
                    style={{ flex: 1 }}
                />

                {/* Scanner Overlay */}
                <View className="absolute inset-0 items-center justify-center">
                    <View className="h-64 w-64 border-2 border-white border-opacity-50 rounded-lg">
                        <View className="h-8 w-8 border-l-4 border-t-4 border-white absolute top-0 left-0" />
                        <View className="h-8 w-8 border-r-4 border-t-4 border-white absolute top-0 right-0" />
                        <View className="h-8 w-8 border-l-4 border-b-4 border-white absolute bottom-0 left-0" />
                        <View className="h-8 w-8 border-r-4 border-b-4 border-white absolute bottom-0 right-0" />
                    </View>
                    <Text className="mt-8 text-center text-white text-lg">
                        Point camera at QR code
                    </Text>
                </View>

                {/* Bottom Actions */}
                <View className="absolute bottom-12 left-0 right-0 px-6">
                    <View className="flex-row justify-center space-x-4">
                        <TouchableOpacity
                            onPress={resetScanner}
                            className="flex-1 items-center rounded-lg bg-white/20 py-4"
                        >
                            <Ionicons name="refresh" size={24} color="white" />
                            <Text className="mt-1 text-white">Reset</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            className="flex-1 items-center rounded-lg bg-white/20 py-4"
                            onPress={() => {/* Toggle flashlight */ }}
                        >
                            <Ionicons name="flashlight" size={24} color="white" />
                            <Text className="mt-1 text-white">Flash</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>

            {/* Manual Entry Modal */}
            <Modal
                visible={isManualEntry}
                transparent
                animationType="slide"
                onRequestClose={() => setIsManualEntry(false)}
            >
                <View className="flex-1 bg-black/50 items-center justify-center px-6">
                    <View className="w-full bg-white rounded-lg p-6">
                        <Text className="text-xl font-bold text-gray-900 mb-4">Manual Ticket Entry</Text>

                        <TextInput
                            className="border border-gray-300 rounded-lg px-4 py-3 mb-4"
                            placeholder="Enter ticket code"
                            value={manualTicketCode}
                            onChangeText={setManualTicketCode}
                            autoCapitalize="characters"
                        />

                        <View className="flex-row space-x-3">
                            <TouchableOpacity
                                onPress={() => setIsManualEntry(false)}
                                className="flex-1 rounded-lg border border-gray-300 py-3"
                            >
                                <Text className="text-center font-medium text-gray-700">Cancel</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={handleManualVerification}
                                disabled={isVerifying}
                                className="flex-1 rounded-lg bg-indigo-600 py-3"
                            >
                                <Text className="text-center font-medium text-white">
                                    {isVerifying ? 'Verifying...' : 'Verify'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Verification Result Modal */}
            <Modal
                visible={showResult}
                transparent
                animationType="slide"
                onRequestClose={() => setShowResult(false)}
            >
                <View className="flex-1 bg-black/50 items-center justify-center px-6">
                    <View className="w-full bg-white rounded-lg p-6">
                        {verificationResult && (
                            <>
                                <View className="items-center mb-4">
                                    <Ionicons
                                        name={verificationResult.isValid ?
                                            (verificationResult.isUsed ? "checkmark-circle" : "checkmark-circle") :
                                            "close-circle"}
                                        size={64}
                                        color={verificationResult.isValid ?
                                            (verificationResult.isUsed ? "#F59E0B" : "#10B981") :
                                            "#EF4444"}
                                    />
                                    <Text className="mt-2 text-xl font-bold text-gray-900">
                                        {verificationResult.isValid ?
                                            (verificationResult.isUsed ? "Already Used" : "Valid Ticket") :
                                            "Invalid Ticket"}
                                    </Text>
                                </View>

                                {verificationResult.isValid && (
                                    <View className="space-y-3">
                                        <View>
                                            <Text className="text-sm font-medium text-gray-500">Event</Text>
                                            <Text className="text-lg text-gray-900">{verificationResult.eventTitle}</Text>
                                        </View>

                                        <View>
                                            <Text className="text-sm font-medium text-gray-500">Ticket Holder</Text>
                                            <Text className="text-lg text-gray-900">{verificationResult.userName}</Text>
                                        </View>

                                        {verificationResult.seatNumber && (
                                            <View>
                                                <Text className="text-sm font-medium text-gray-500">Seat</Text>
                                                <Text className="text-lg text-gray-900">{verificationResult.seatNumber}</Text>
                                            </View>
                                        )}

                                        <View>
                                            <Text className="text-sm font-medium text-gray-500">Ticket Code</Text>
                                            <Text className="text-lg font-mono text-gray-900">{verificationResult.ticketCode}</Text>
                                        </View>
                                    </View>
                                )}

                                <TouchableOpacity
                                    onPress={() => {
                                        setShowResult(false);
                                        resetScanner();
                                    }}
                                    className="mt-6 rounded-lg bg-indigo-600 py-3"
                                >
                                    <Text className="text-center font-medium text-white">Continue Scanning</Text>
                                </TouchableOpacity>
                            </>
                        )}
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}
