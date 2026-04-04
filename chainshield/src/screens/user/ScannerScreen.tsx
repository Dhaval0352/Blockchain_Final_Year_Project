import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { useAppStore, ScanResult } from '../../store/appStore';
import { useTheme } from '../../theme/ThemeContext';
import { Button } from '../../components/Button';

type Props = BottomTabScreenProps<any, 'Scanner'>;

export const ScannerScreen: React.FC<Props> = ({ navigation }) => {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const { addScanResult } = useAppStore();
  const { colors } = useTheme();

  useEffect(() => {
    // Reset scanned state when screen is focused
    const unsubscribe = navigation.addListener('focus', () => {
      setScanned(false);
    });
    return unsubscribe;
  }, [navigation]);

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', padding: 20 }]}>
        <Text style={[styles.text, { color: colors.text, textAlign: 'center', marginBottom: 20 }]}>
          We need your permission to show the camera to scan product QR codes.
        </Text>
        <Button title="Grant Permission" onPress={requestPermission} />
      </View>
    );
  }

  const handleBarCodeScanned = ({ type, data }: { type: string; data: string }) => {
    setScanned(true);
    
    // Mocking blockahin verification based on QR data
    const isAuthentic = Math.random() > 0.3; // 70% chance authentic
    
    const result: ScanResult = {
      id: Math.random().toString(),
      productId: 'p_' + Math.floor(Math.random() * 1000),
      productName: isAuthentic ? 'Glow Serum 50ml' : 'Unknown Product',
      timestamp: new Date().toISOString(),
      status: isAuthentic ? 'AUTHENTIC' : 'FAKE',
      batchNumber: isAuthentic ? 'B123-Auth' : undefined,
      mfgDate: isAuthentic ? '2023-10-01' : undefined,
      expDate: isAuthentic ? '2025-10-01' : undefined,
      manufacturerName: isAuthentic ? 'Beauty Co.' : undefined,
      txId: isAuthentic ? '0xabc123456789def' : undefined,
      scanCount: isAuthentic ? Math.floor(Math.random() * 5) + 1 : 0,
    };

    addScanResult(result);
    // Navigate to ScanResult screen (which will be part of a stack in the dashboard tab)
    // Wait, BottomTabs don't pass params properly without a stack. We'll use navigation.navigate giving it to the global stack or nest a stack.
    // For simplicity, we can pass it via navigation directly if we use NativeStack.
    // We'll set up User Navigator as a tab navigator, but Dashboard tab needs to be a Stack.
    navigation.navigate('ScanResult', { result });
  };

  return (
    <View style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFillObject}
        facing="back"
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ['qr'],
        }}
      >
        <View style={styles.overlay}>
          <View style={styles.unfocusedContainer} />
          <View style={styles.middleContainer}>
            <View style={styles.unfocusedContainer} />
            <View style={styles.focusedContainer}>
               {/* Frame corners could be drawn here */}
            </View>
            <View style={styles.unfocusedContainer} />
          </View>
          <View style={styles.unfocusedContainer}>
            <Text style={styles.hintText}>Align the QR code inside the frame</Text>
          </View>
        </View>
      </CameraView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  text: { fontSize: 16 },
  overlay: {
    flex: 1,
  },
  unfocusedContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  middleContainer: {
    flexDirection: 'row',
    flex: 1.5,
  },
  focusedContainer: {
    flex: 2,
    borderColor: '#FFB7B2',
    borderWidth: 2,
    backgroundColor: 'transparent',
    borderRadius: 12,
  },
  hintText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 20,
  }
});
