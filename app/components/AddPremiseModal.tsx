import { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  Modal, 
  Pressable, 
  TouchableOpacity, 
  Alert
} from 'react-native';
import { X } from 'lucide-react-native';
import { supabase } from '../lib/supabase';

interface AddPremiseModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const AddPremiseModal: React.FC<AddPremiseModalProps> = ({ 
  visible, 
  onClose,
  onSuccess
}) => {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('premises')
        .insert({
          name,
          address
        });
      
      if (error) throw error;
      
      onSuccess();
      setName('');
      setAddress('');
      
    } catch (error) {
      console.error('Error adding premise:', error);
      Alert.alert('Error', 'Failed to add premise. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      animationType="slide"
      transparent={false}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Add New Premise</Text>
          <Pressable onPress={onClose} style={styles.closeButton}>
            <X size={24} color="#6B7280" />
          </Pressable>
        </View>

        <View style={styles.formContainer}>
          <Text style={styles.label}>Premise Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter premise name"
            value={name}
            onChangeText={setName}
            placeholderTextColor="#9CA3AF"
          />

          <Text style={styles.label}>Address</Text>
          <TextInput
            style={[styles.input, { height: 80 }]}
            placeholder="Enter full address"
            value={address}
            onChangeText={setAddress}
            placeholderTextColor="#9CA3AF"
            multiline
          />

          <TouchableOpacity 
            style={styles.submitButton}
            onPress={handleSubmit}
            disabled={loading || !name || !address}
          >
            <Text style={styles.submitButtonText}>
              {loading ? 'Adding...' : 'Add Premise'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  formContainer: {
    padding: 20,
  },
  label: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#111827',
    marginBottom: 16,
  },
  submitButton: {
    backgroundColor: '#059669',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default AddPremiseModal;