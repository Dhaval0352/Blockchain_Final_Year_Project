import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { useAppStore, ScanResult } from '../../store/appStore';
import { verifyProductOnChain, recordScanOnChain } from '../../services/chainApi';
import { checkSuspiciousActivity } from '../../utils/suspiciousActivity';
import { useTheme } from '../../theme/ThemeContext';
import { Button } from '../../components/Button';

type Props = BottomTabScreenProps<any, 'Scanner'>;

export const ScannerScreen: React.FC<Props> = ({ navigation }) => {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const { addScanResult, registeredProducts, registerScan, scanHistory } = useAppStore();
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

  const handleBarCodeScanned = async ({ type, data }: { type: string; data: string }) => {
    setScanned(true);

    // The QR encodes { id, txId } — see buildQrPayload in QRViewScreen.
    let parsed: { id?: string; txId?: string } | null = null;
    try {
      parsed = JSON.parse(data);
    } catch {
      parsed = null; // not a ChainShield code at all (e.g. a random QR)
    }

    if (!parsed?.id) {
      const result: ScanResult = {
        id: Math.random().toString(),
        productId: 'unknown',
        productName: 'Unrecognised QR Code',
        timestamp: new Date().toISOString(),
        status: 'FAKE',
        scanCount: 0,
      };
      addScanResult(result);
      navigation.navigate('ScanResult', { result });
      return;
    }

    // Ground truth is the blockchain: ask the chain-backend whether this
    // product id was actually registered on-chain. If the backend can't be
    // reached at all (e.g. it wasn't started), fall back to the locally
    // cached registeredProducts list so the demo can still run.
    const chainRecord = await verifyProductOnChain(parsed.id);
    const usedChain = chainRecord.ok;

    let isAuthentic: boolean;
    let productName: string | undefined;
    let batchNumber: string | undefined;
    let mfgDate: string | undefined;
    let expDate: string | undefined;
    let manufacturerName: string | undefined;

    if (usedChain) {
      isAuthentic = chainRecord.exists;
      productName = chainRecord.productName;
      batchNumber = chainRecord.batchNumber;
      mfgDate = chainRecord.mfgDate;
      expDate = chainRecord.expDate;
      manufacturerName = chainRecord.manufacturerName;
    } else {
      const matchedProduct = registeredProducts.find(
        (p) => p.id === parsed!.id && p.txId === parsed!.txId
      );
      isAuthentic = !!matchedProduct;
      productName = matchedProduct?.productName;
      batchNumber = matchedProduct?.batchNumber;
      mfgDate = matchedProduct?.mfgDate;
      expDate = matchedProduct?.expDate;
      manufacturerName = matchedProduct?.manufacturerId;
    }

    let scanCount = 0;
    if (isAuthentic) {
      if (usedChain) {
        const chainScan = await recordScanOnChain(parsed.id);
        scanCount = chainScan.scanCount ? Number(chainScan.scanCount) : registerScan(parsed.id);
      } else {
        scanCount = registerScan(parsed.id);
      }
    }

    // Run this against scanHistory *before* this scan is added below —
    // otherwise the current scan would always match against itself.
    let suspicious = false;
    let suspicionMessage: string | null = null;
    if (isAuthentic) {
      const suspicionCheck = checkSuspiciousActivity(parsed.id, scanCount, scanHistory);
      suspicious = suspicionCheck.suspicious;
      suspicionMessage = suspicionCheck.message;
    }
    const result: ScanResult = {
      id: Math.random().toString(),
      productId: parsed.id,
      productName: productName || 'Unknown Product',
      timestamp: new Date().toISOString(),
      status: isAuthentic ? 'AUTHENTIC' : 'FAKE',
      batchNumber,
      mfgDate,
      expDate,
      manufacturerName,
      txId: parsed.txId,
      scanCount,
      suspicious,
      suspicionMessage,
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
