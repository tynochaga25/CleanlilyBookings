import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { ArrowLeft, MapPin, User, Clock, CircleCheck as CheckCircle, TriangleAlert as AlertTriangle, Camera, Send } from 'lucide-react-native';
import { useState } from 'react';

export default function VisitScreen() {
  const { id } = useLocalSearchParams();
  const [report, setReport] = useState('');
  const [checkedItems, setCheckedItems] = useState<{ [key: string]: boolean }>({});

  // Mock premise data - in real app, fetch based on id
  const premise = {
    id: id,
    name: 'Downtown Office Complex',
    address: '123 Business Ave, Downtown',
    cleaner: 'Sarah Johnson',
    lastVisit: '2 days ago',
  };

  const checklistItems = [
    { id: 'floors', label: 'Floors cleaned and mopped', category: 'Cleaning' },
    { id: 'windows', label: 'Windows cleaned (interior)', category: 'Cleaning' },
    { id: 'desks', label: 'Desks and surfaces wiped', category: 'Cleaning' },
    { id: 'trash', label: 'Trash bins emptied', category: 'Cleaning' },
    { id: 'restrooms', label: 'Restrooms sanitized', category: 'Cleaning' },
    { id: 'supplies', label: 'Cleaning supplies restocked', category: 'Supplies' },
    { id: 'equipment', label: 'Equipment properly stored', category: 'Equipment' },
    { id: 'safety', label: 'Safety protocols followed', category: 'Safety' },
  ];

  const toggleCheckItem = (itemId: string) => {
    setCheckedItems(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };

  const handleSubmitReport = () => {
    const completedItems = Object.values(checkedItems).filter(Boolean).length;
    const totalItems = checklistItems.length;
    
    if (completedItems === 0) {
      Alert.alert('Incomplete', 'Please check at least one item before submitting.');
      return;
    }

    Alert.alert(
      'Submit Report',
      `You've completed ${completedItems}/${totalItems} items. Submit this inspection report?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Submit', 
          onPress: () => {
            // Here you would submit to your backend
            Alert.alert('Success', 'Inspection report submitted successfully!', [
              { text: 'OK', onPress: () => router.back() }
            ]);
          }
        }
      ]
    );
  };

  const completedCount = Object.values(checkedItems).filter(Boolean).length;
  const completionPercentage = Math.round((completedCount / checklistItems.length) * 100);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#059669" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Quality Inspection</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Premise Info */}
        <View style={styles.premiseCard}>
          <View style={styles.premiseHeader}>
            <MapPin size={20} color="#059669" />
            <Text style={styles.premiseName}>{premise.name}</Text>
          </View>
          <Text style={styles.premiseAddress}>{premise.address}</Text>
          <View style={styles.premiseDetails}>
            <View style={styles.detailItem}>
              <User size={16} color="#6B7280" />
              <Text style={styles.detailText}>Cleaner: {premise.cleaner}</Text>
            </View>
            <View style={styles.detailItem}>
              <Clock size={16} color="#6B7280" />
              <Text style={styles.detailText}>Last visit: {premise.lastVisit}</Text>
            </View>
          </View>
        </View>

        {/* Progress */}
        <View style={styles.progressCard}>
          <Text style={styles.progressTitle}>Inspection Progress</Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${completionPercentage}%` }]} />
          </View>
          <Text style={styles.progressText}>
            {completedCount}/{checklistItems.length} items completed ({completionPercentage}%)
          </Text>
        </View>

        {/* Checklist */}
        <View style={styles.checklistCard}>
          <Text style={styles.checklistTitle}>Quality Checklist</Text>
          
          {checklistItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.checklistItem}
              onPress={() => toggleCheckItem(item.id)}
            >
              <View style={styles.checklistLeft}>
                <View style={[
                  styles.checkbox,
                  checkedItems[item.id] && styles.checkboxChecked
                ]}>
                  {checkedItems[item.id] && (
                    <CheckCircle size={20} color="#FFFFFF" />
                  )}
                </View>
                <View style={styles.checklistContent}>
                  <Text style={[
                    styles.checklistLabel,
                    checkedItems[item.id] && styles.checklistLabelChecked
                  ]}>
                    {item.label}
                  </Text>
                  <Text style={styles.checklistCategory}>{item.category}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Report Section */}
        <View style={styles.reportCard}>
          <Text style={styles.reportTitle}>Inspection Report</Text>
          <Text style={styles.reportSubtitle}>
            Describe the overall condition and any issues found
          </Text>
          <TextInput
            style={styles.reportInput}
            multiline
            numberOfLines={6}
            placeholder="Enter your detailed report here..."
            value={report}
            onChangeText={setReport}
            placeholderTextColor="#9CA3AF"
          />
          
          {/* Photo Button */}
          <TouchableOpacity style={styles.photoButton}>
            <Camera size={20} color="#059669" />
            <Text style={styles.photoButtonText}>Add Photos</Text>
          </TouchableOpacity>
        </View>

        {/* Issues Section */}
        <View style={styles.issuesCard}>
          <View style={styles.issuesHeader}>
            <AlertTriangle size={20} color="#F59E0B" />
            <Text style={styles.issuesTitle}>Report Issues</Text>
          </View>
          <Text style={styles.issuesSubtitle}>
            Mark any problems that need immediate attention
          </Text>
          
          <TouchableOpacity style={styles.issueButton}>
            <Text style={styles.issueButtonText}>+ Report Issue</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Submit Button */}
      <View style={styles.submitContainer}>
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmitReport}>
          <Send size={20} color="#FFFFFF" />
          <Text style={styles.submitButtonText}>Submit Inspection Report</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0FDF4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  headerRight: {
    width: 40,
  },
  premiseCard: {
    backgroundColor: '#FFFFFF',
    margin: 20,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  premiseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  premiseName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginLeft: 8,
  },
  premiseAddress: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
  },
  premiseDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 6,
  },
  progressCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#059669',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  checklistCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  checklistTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  checklistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  checklistLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  checkboxChecked: {
    backgroundColor: '#059669',
    borderColor: '#059669',
  },
  checklistContent: {
    flex: 1,
  },
  checklistLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 2,
  },
  checklistLabelChecked: {
    textDecorationLine: 'line-through',
    color: '#6B7280',
  },
  checklistCategory: {
    fontSize: 12,
    color: '#6B7280',
  },
  reportCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  reportTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  reportSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
  },
  reportInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#111827',
    textAlignVertical: 'top',
    marginBottom: 16,
    minHeight: 120,
  },
  photoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0FDF4',
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#059669',
    borderStyle: 'dashed',
  },
  photoButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#059669',
    marginLeft: 8,
  },
  issuesCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  issuesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  issuesTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginLeft: 8,
  },
  issuesSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
  },
  issueButton: {
    backgroundColor: '#FEF3C7',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F59E0B',
    borderStyle: 'dashed',
  },
  issueButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F59E0B',
  },
  submitContainer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  submitButton: {
    backgroundColor: '#059669',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginLeft: 8,
  },
});