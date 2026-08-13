import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAppStore } from '../../store/appStore';
import { useTheme } from '../../theme/ThemeContext';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { Camera } from 'lucide-react-native';

type Props = NativeStackScreenProps<any, 'RegisterProduct'>;

export const ProductRegistrationScreen: React.FC<Props> = ({ navigation }) => {
  const { colors } = useTheme();
  const { requestProductRegistration, user } = useAppStore();

  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [batch, setBatch] = useState('');
  const [mfg, setMfg] = useState('');
  const [exp, setExp] = useState('');
  const [desc, setDesc] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!name || !batch || !mfg) {
      Alert.alert('Error', 'Please fill required fields.');
      return;
    }

    setSubmitting(true);
    await requestProductRegistration({
      manufacturerId: user?.id || 'unknown',
      productName: name,
      category: category || 'General',
      batchNumber: batch,
      mfgDate: mfg,
      expDate: exp,
      description: desc,
      imageUrl: 'placeholder.jpg',
      quantity: Math.max(1, Math.min(20, parseInt(quantity, 10) || 1)),
    });
    setSubmitting(false);

    Alert.alert('Success', 'Product registration requested.', [
      { text: 'OK', onPress: () => navigation.goBack() }
    ]);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={[styles.title, { color: colors.text }]}>New Product</Text>
        <Text style={[styles.sub, { color: colors.textSecondary }]}>
          Enter cosmetics details. Admin will verify and mint the NFT/QR.
        </Text>

        <View style={[styles.imageUpload, { backgroundColor: colors.surface, borderColor: colors.border }]}>
           <Camera size={32} color={colors.textSecondary} />
           <Text style={[styles.uploadText, { color: colors.textSecondary }]}>Tap to upload image</Text>
        </View>

        <Input label="Product Name *" placeholder="e.g. Mint Night Cream" value={name} onChangeText={setName} />
        <Input label="Category" placeholder="e.g. Cream, Serum, Lipstick" value={category} onChangeText={setCategory} />
        <Input label="Batch Number *" placeholder="e.g. BATCH-001" value={batch} onChangeText={setBatch} />
        <Input
          label="Quantity (units in this batch) *"
          placeholder="e.g. 5"
          value={quantity}
          onChangeText={setQuantity}
          keyboardType="numeric"
        />
        <Text style={[styles.note, { color: colors.textSecondary, marginBottom: 16, textAlign: 'left' }]}>
          Each unit gets its own unique QR code once approved — keep this small (3-5) for a live demo, since every
          unit is a separate blockchain transaction.
        </Text>
        <View style={styles.row}>
          <View style={styles.half}>
            <Input label="Mfg Date *" placeholder="YYYY-MM-DD" value={mfg} onChangeText={setMfg} />
          </View>
          <View style={styles.half}>
            <Input label="Expiry Date" placeholder="YYYY-MM-DD" value={exp} onChangeText={setExp} />
          </View>
        </View>
        <Input 
          label="Description" 
          placeholder="Short product description" 
          multiline 
          numberOfLines={3} 
          style={{ height: 80, paddingVertical: 12 }}
          value={desc}
          onChangeText={setDesc}
        />

        <View style={styles.footer}>
           <Text style={[styles.note, { color: colors.textSecondary }]}>
             * After you submit, Admin will review and register this product on the blockchain.
           </Text>
           <Button title="Submit Request" onPress={handleSubmit} loading={submitting} disabled={submitting} />
           <Button title="Cancel" variant="ghost" onPress={() => navigation.goBack()} />
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 24, paddingTop: 60 },
  title: { fontSize: 24, fontWeight: 'bold' },
  sub: { fontSize: 14, marginTop: 4, marginBottom: 24 },
  imageUpload: {
    height: 120,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  uploadText: { marginTop: 8, fontSize: 14 },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  half: { width: '48%' },
  footer: { marginTop: 32 },
  note: { fontSize: 12, textAlign: 'center', marginBottom: 16, fontStyle: 'italic' },
});