import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  TextInput,
  Modal,
  Pressable,
  SafeAreaView
} from 'react-native';
import { X } from 'lucide-react-native';

interface InspectionFormProps {
  visible: boolean;
  onClose: () => void;
  premise: {
    id: number;
    name: string;
    address: string;
  };
  onSubmit: (report: Omit<InspectionReport, 'id' | 'createdAt'>) => void;
}

interface InspectionReport {
  id: string;
  premiseId: number;
  inspectorName: string;
  date: string;
  timeIn: string;
  timeOut: string;
  sitesVisited: number;
  clientFeedback: string;
  overallRating: string;
  ratings: Record<string, string>;
  comments: Record<string, string>;
  createdAt: string;
}

const InspectionForm: React.FC<InspectionFormProps> = ({ 
  visible, 
  onClose, 
  premise,
  onSubmit 
}) => {
  const [inspectorName, setInspectorName] = useState('');
  const [date, setDate] = useState(new Date().toLocaleDateString());
  const [timeIn, setTimeIn] = useState('');
  const [timeOut, setTimeOut] = useState('');
  const [sitesVisited, setSitesVisited] = useState<number>(1);
  const [clientFeedback, setClientFeedback] = useState('');
  const [overallRating, setOverallRating] = useState<string>('Good');
  const [ratings, setRatings] = useState<Record<string, string>>({});
  const [comments, setComments] = useState<Record<string, string>>({});

  const cleaningAreas = [
    'Floors Cleaned',
    'Toilets',
    'Bathrooms',
    'Kitchen/Pantry',
    'Dusting / Furniture',
    'Bins Emptied/Replaced',
    'Other'
  ];

  const ratingOptions = ['Poor', 'Good', 'Very Good', 'Excellent'];
  const overallRatingOptions = ['Poor', 'Fair', 'Good', 'Excellent'];

  const handleRatingChange = (area: string, rating: string) => {
    setRatings(prev => ({ ...prev, [area]: rating }));
  };

  const handleCommentChange = (area: string, comment: string) => {
    setComments(prev => ({ ...prev, [area]: comment }));
  };

  const handleSubmit = () => {
    // Fill in default ratings for any unchecked areas
    const completeRatings = cleaningAreas.reduce((acc, area) => {
      if (!ratings[area]) {
        return { ...acc, [area]: 'Good' };
      }
      return { ...acc, [area]: ratings[area] };
    }, {});

    const newReport = {
      premiseId: premise.id,
      inspectorName,
      date,
      timeIn: timeIn || 'Not recorded',
      timeOut: timeOut || 'Not recorded',
      sitesVisited,
      clientFeedback: clientFeedback || 'No feedback provided',
      overallRating,
      ratings: completeRatings,
      comments
    };
    
    onSubmit(newReport);
    onClose();
    resetForm();
  };

  const resetForm = () => {
    setInspectorName('');
    setTimeIn('');
    setTimeOut('');
    setClientFeedback('');
    setRatings({});
    setComments({});
    setOverallRating('Good');
  };

  return (
    <Modal
      animationType="slide"
      transparent={false}
      visible={visible}
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Quality Control Inspection</Text>
          <Pressable onPress={onClose} style={styles.closeButton}>
            <X size={24} color="#6B7280" />
          </Pressable>
        </View>

        <ScrollView style={styles.formContainer}>
          <Text style={styles.companyHeader}>CLEANILLY CLEANERS PVT LTD</Text>
          <Text style={styles.formSubtitle}>QUALITY CONTROL INSPECTION FORM</Text>
          <Text style={styles.formTagline}>Committed to Clean, Dedicated to Excellence</Text>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Inspector Details</Text>
            <TextInput
              style={styles.input}
              placeholder="Inspector Name"
              value={inspectorName}
              onChangeText={setInspectorName}
              placeholderTextColor="#9CA3AF"
            />
            <TextInput
              style={styles.input}
              placeholder="Date"
              value={date}
              onChangeText={setDate}
              placeholderTextColor="#9CA3AF"
            />
            <Text style={styles.label}>Total Sites Visited Today:</Text>
            <View style={styles.checkboxRow}>
              {[1, 2, 3, 4, 5].map(num => (
                <Pressable 
                  key={num} 
                  style={styles.checkboxContainer}
                  onPress={() => setSitesVisited(num)}
                >
                  <Text style={styles.checkboxText}>
                    {sitesVisited === num ? '☑' : '☐'} {num}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Site Details</Text>
            <Text style={styles.premiseName}>{premise.name}</Text>
            <Text style={styles.premiseAddress}>{premise.address}</Text>
            
            <View style={styles.timeInputContainer}>
              <View style={styles.timeInput}>
                <Text style={styles.label}>Time In:</Text>
                <TextInput
                  style={styles.timeInputField}
                  placeholder="HH:MM"
                  value={timeIn}
                  onChangeText={setTimeIn}
                  placeholderTextColor="#9CA3AF"
                />
              </View>
              <View style={styles.timeInput}>
                <Text style={styles.label}>Time Out:</Text>
                <TextInput
                  style={styles.timeInputField}
                  placeholder="HH:MM"
                  value={timeOut}
                  onChangeText={setTimeOut}
                  placeholderTextColor="#9CA3AF"
                />
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Cleaning Checklist</Text>
            
            {cleaningAreas.map((area, index) => (
              <View key={index} style={styles.checklistItem}>
                <Text style={styles.checklistLabel}>{area}</Text>
                {area === 'Other' && (
                  <TextInput
                    style={[styles.input, { marginBottom: 8 }]}
                    placeholder="Specify other area"
                    placeholderTextColor="#9CA3AF"
                  />
                )}
                <View style={styles.ratingContainer}>
                  {ratingOptions.map((rating, i) => (
                    <Pressable
                      key={i}
                      style={styles.ratingOption}
                      onPress={() => handleRatingChange(area, rating)}
                    >
                      <Text style={[
                        styles.ratingText,
                        ratings[area] === rating && styles.selectedRating
                      ]}>
                        {ratings[area] === rating ? '☑' : '☐'} {rating}
                      </Text>
                    </Pressable>
                  ))}
                </View>
                <TextInput
                  style={[styles.input, { marginTop: 8 }]}
                  placeholder={`Comments about ${area}`}
                  value={comments[area] || ''}
                  onChangeText={(text) => handleCommentChange(area, text)}
                  placeholderTextColor="#9CA3AF"
                />
              </View>
            ))}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Client Feedback</Text>
            <TextInput
              style={[styles.input, { height: 80 }]}
              placeholder="Enter client feedback if any"
              value={clientFeedback}
              onChangeText={setClientFeedback}
              placeholderTextColor="#9CA3AF"
              multiline
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Overall Rating</Text>
            <View style={styles.overallRatingContainer}>
              {overallRatingOptions.map((rating, i) => (
                <Pressable
                  key={i}
                  style={styles.overallRatingOption}
                  onPress={() => setOverallRating(rating)}
                >
                  <Text style={[
                    styles.ratingText,
                    overallRating === rating && styles.selectedRating
                  ]}>
                    {overallRating === rating ? '☑' : '☐'} {rating}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          <TouchableOpacity 
            style={styles.submitButton}
            onPress={handleSubmit}
          >
            <Text style={styles.submitButtonText}>Submit Inspection</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
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
  companyHeader: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
    marginTop: 8,
  },
  formSubtitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
    marginBottom: 4,
  },
  formTagline: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 16,
    fontStyle: 'italic',
  },
  formContainer: {
    padding: 16,
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  input: {
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#111827',
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
    fontWeight: '500',
  },
  checkboxRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  checkboxContainer: {
    alignItems: 'center',
  },
  checkboxText: {
    fontSize: 14,
    color: '#111827',
  },
  premiseName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  premiseAddress: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
  },
  timeInputContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timeInput: {
    width: '48%',
  },
  timeInputField: {
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#111827',
  },
  checklistItem: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  checklistLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  ratingOption: {
    width: '48%',
    marginBottom: 8,
    padding: 4,
  },
  ratingText: {
    fontSize: 14,
    color: '#6B7280',
  },
  selectedRating: {
    color: '#111827',
    fontWeight: '600',
  },
  overallRatingContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  overallRatingOption: {
    width: '48%',
    marginBottom: 8,
    padding: 4,
  },
  submitButton: {
    backgroundColor: '#059669',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default InspectionForm;