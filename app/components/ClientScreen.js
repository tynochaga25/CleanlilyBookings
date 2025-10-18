import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Image,
  FlatList,
  TextInput,
  TouchableOpacity,
  Alert,
  Switch
} from 'react-native';
import { Star, MapPin, Phone, Clock, Shield, CheckCircle, Send, Eye, EyeOff } from 'lucide-react-native';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://ryqjkslsgfcycxybdeoj.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ5cWprc2xzZ2ZjeWN4eWJkZW9qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc1MTk5NzMsImV4cCI6MjA3MzA5NTk3M30.G3TTKLpIdBbpcvaO7_SWDuAsvehLI5mT0U85eM5uw50'
);

const CleaningServiceHomepage = () => {
  const [services, setServices] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedbackText, setFeedbackText] = useState('');
  const [rating, setRating] = useState(5);
  const [submitting, setSubmitting] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    fetchServices();
    fetchFeedbacks();
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      // In a real app, you would get the current user's ID from authentication
      // For demonstration, let's assume we have a logged-in user with ID
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) throw error;
        setUserProfile(data);
      }
    } catch (error) {
      console.error('User profile fetch error:', error);
    }
  };

  const fetchServices = async () => {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .order('name');

      if (error) throw error;
      setServices(data || []);
    } catch (error) {
      console.error('Services fetch error:', error);
    }
  };

  const fetchFeedbacks = async () => {
    try {
      const { data, error } = await supabase
        .from('feedbacks')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      setFeedbacks(data || []);
    } catch (error) {
      console.error('Feedbacks fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const submitFeedback = async () => {
    if (!feedbackText.trim()) {
      Alert.alert('Error', 'Please enter your feedback');
      return;
    }

    setSubmitting(true);
    try {
      const feedbackData = {
        comment: feedbackText.trim(),
        rating: rating,
      };

      // Add client name if not anonymous and user profile exists
      if (!isAnonymous && userProfile) {
        feedbackData.client_name = userProfile.full_name;
      } else {
        feedbackData.client_name = 'Anonymous Client';
      }

      const { data, error } = await supabase
        .from('feedbacks')
        .insert([feedbackData]);

      if (error) throw error;

      Alert.alert('Success', 'Thank you for your feedback!');
      setFeedbackText('');
      setRating(5);
      setIsAnonymous(false);
      fetchFeedbacks(); // Refresh the feedback list
    } catch (error) {
      console.error('Feedback submission error:', error);
      Alert.alert('Error', 'Failed to submit feedback');
    } finally {
      setSubmitting(false);
    }
  };

  const renderServiceItem = ({ item }) => (
    <View style={styles.serviceCard}>
      <View style={styles.serviceIcon}>
        <Text style={styles.serviceIconText}>{item.name.charAt(0)}</Text>
      </View>
      <View style={styles.serviceInfo}>
        <Text style={styles.serviceName}>{item.name}</Text>
        <Text style={styles.serviceDescription} numberOfLines={2}>
          {item.description}
        </Text>
        <View style={styles.serviceMeta}>
          <Text style={styles.servicePrice}>${item.price}</Text>
          <View style={styles.serviceDuration}>
            <Clock size={14} color="#FFFFFF" />
            <Text style={styles.durationText}>{item.duration} Hours</Text>
          </View>
        </View>
      </View>
    </View>
  );

  const renderFeedbackItem = ({ item }) => (
    <View style={styles.feedbackCard}>
      <View style={styles.feedbackHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{item.client_name?.charAt(0) || 'A'}</Text>
        </View>
        <View>
          <Text style={styles.clientName}>{item.client_name || 'Anonymous Client'}</Text>
          <View style={styles.ratingContainer}>
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={14}
                color={i < item.rating ? '#F59E0B' : '#9CA3AF'}
                fill={i < item.rating ? '#F59E0B' : 'transparent'}
              />
            ))}
          </View>
        </View>
      </View>
      <Text style={styles.feedbackText}>"{item.comment}"</Text>
      <Text style={styles.feedbackDate}>
        {new Date(item.created_at).toLocaleDateString()}
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#059669" />
        <Text style={styles.loadingText}>Loading services...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header with Logo */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Text style={styles.logoText}>Cleanlily Cleaners</Text>
          <View style={styles.logoBadge}>
            <Text style={styles.logoBadgeText}>®</Text>
          </View>
        </View>
        <Text style={styles.tagline}>Professional Cleaning Services</Text>
      </View>

      {/* Hero Section */}
      <View style={styles.heroSection}>
        <Image
          source={{ uri: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' }}
          style={styles.heroImage}
        />
        <View style={styles.heroOverlay}>
          <Text style={styles.heroTitle}>Transform Your Space</Text>
          <Text style={styles.heroSubtitle}>Professional cleaning services for homes and offices across Zimbabwe</Text>
        </View>
      </View>

      {/* Services Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Our Services</Text>
        <Text style={styles.sectionSubtitle}>We offer a range of professional cleaning services to meet your needs</Text>
        
        <FlatList
          data={services}
          renderItem={renderServiceItem}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
        />
      </View>

      {/* Why Choose Us Section */}
      <View style={styles.sectionDark}>
        <Text style={styles.sectionTitleLight}>Why Choose Cleanlily Cleaners?</Text>
        
        <View style={styles.featuresGrid}>
          <View style={styles.featureCard}>
            <Shield size={32} color="#FFFFFF" />
            <Text style={styles.featureTitle}>Trusted Professionals</Text>
            <Text style={styles.featureDescription}>All our cleaners are thoroughly vetted and trained</Text>
          </View>
          
          <View style={styles.featureCard}>
            <CheckCircle size={32} color="#FFFFFF" />
            <Text style={styles.featureTitle}>Quality Guaranteed</Text>
            <Text style={styles.featureDescription}>We're not satisfied until you are</Text>
          </View>
          
          <View style={styles.featureCard}>
            <Clock size={32} color="#FFFFFF" />
            <Text style={styles.featureTitle}>Flexible Scheduling</Text>
            <Text style={styles.featureDescription}>Book at your convenience, 7 days a week</Text>
          </View>
          
          <View style={styles.featureCard}>
            <Star size={32} color="#FFFFFF" />
            <Text style={styles.featureTitle}>Eco-Friendly Products</Text>
            <Text style={styles.featureDescription}>We use environmentally safe cleaning solutions</Text>
          </View>
        </View>
      </View>

      {/* Feedback Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Share Your Experience</Text>
        <Text style={styles.sectionSubtitle}>We value your feedback to improve our services</Text>
        
        <View style={styles.feedbackForm}>
          <Text style={styles.feedbackLabel}>Your Rating</Text>
          <View style={styles.ratingInput}>
            {[...Array(5)].map((_, i) => (
              <TouchableOpacity key={i} onPress={() => setRating(i + 1)}>
                <Star
                  size={28}
                  color={i < rating ? '#F59E0B' : '#D1D5DB'}
                  fill={i < rating ? '#F59E0B' : 'transparent'}
                />
              </TouchableOpacity>
            ))}
          </View>
          
          <View style={styles.anonymousToggle}>
            <View style={styles.toggleLabel}>
              {isAnonymous ? <EyeOff size={20} color="#059669" /> : <Eye size={20} color="#059669" />}
              <Text style={styles.toggleText}>
                {isAnonymous ? 'Post as Anonymous' : `Post as ${userProfile ? userProfile.full_name : 'Your Name'}`}
              </Text>
            </View>
            <Switch
              value={isAnonymous}
              onValueChange={setIsAnonymous}
              trackColor={{ false: '#D1D5DB', true: '#059669' }}
              thumbColor={isAnonymous ? '#FFFFFF' : '#FFFFFF'}
            />
          </View>
          
          <Text style={styles.feedbackLabel}>Your Feedback</Text>
          <TextInput
            style={styles.feedbackInput}
            value={feedbackText}
            onChangeText={setFeedbackText}
            placeholder="Share your experience with our service..."
            multiline
            numberOfLines={4}
          />
          
          <TouchableOpacity 
            style={styles.submitButton}
            onPress={submitFeedback}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Send size={18} color="#FFFFFF" />
                <Text style={styles.submitButtonText}>Submit Feedback</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {feedbacks.length > 0 && (
          <>
            <Text style={styles.sectionSubtitle}>Recent Feedback from Our Clients</Text>
            <FlatList
              data={feedbacks}
              renderItem={renderFeedbackItem}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
            />
          </>
        )}
      </View>

      {/* Contact Section */}
      <View style={styles.contactSection}>
        <Text style={styles.contactTitle}>Ready to Get Started?</Text>
        <Text style={styles.contactSubtitle}>Contact us today to schedule your cleaning service</Text>
        
        <View style={styles.contactMethods}>
          <View style={styles.contactItem}>
            <Phone size={20} color="#059669" />
            <Text style={styles.contactText}>+263242 332317/75</Text>
          </View>
          
          <View style={styles.contactItem}>
            <MapPin size={20} color="#059669" />
            <Text style={styles.contactText}>Harare, Zimbabwe</Text>
          </View>
        </View>
        
        <View style={styles.hoursInfo}>
          <Text style={styles.hoursTitle}>Business Hours</Text>
          <Text style={styles.hoursText}>Monday - Friday: 8:00 AM - 6:00 PM</Text>
          <Text style={styles.hoursText}>Saturday: 9:00 AM - 4:00 PM</Text>
          <Text style={styles.hoursText}>Sunday: Closed</Text>
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>© 2025 Cleanlily Cleaners. All rights reserved.</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  loadingText: {
    marginTop: 16,
    color: '#059669',
    fontSize: 16,
  },
  header: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FFFFFF',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  logoText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#059669',
  },
  logoBadge: {
    marginLeft: 4,
  },
  logoBadgeText: {
    fontSize: 12,
    color: '#059669',
  },
  tagline: {
    fontSize: 16,
    color: '#059669',
  },
  heroSection: {
    height: 300,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(5, 150, 105, 0.8)',
    padding: 20,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  section: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    marginBottom: 1,
  },
  sectionDark: {
    padding: 20,
    backgroundColor: '#059669',
    marginBottom: 1,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#059669',
    marginBottom: 8,
    textAlign: 'center',
  },
  sectionTitleLight: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
    textAlign: 'center',
  },
  sectionSubtitle: {
    fontSize: 16,
    color: '#059669',
    marginBottom: 20,
    textAlign: 'center',
  },
  serviceCard: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#059669',
    borderRadius: 12,
    marginBottom: 12,
    alignItems: 'center',
  },
  serviceIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  serviceIconText: {
    color: '#059669',
    fontSize: 20,
    fontWeight: 'bold',
  },
  serviceInfo: {
    flex: 1,
  },
  serviceName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  serviceDescription: {
    fontSize: 14,
    color: '#FFFFFF',
    marginBottom: 8,
    opacity: 0.9,
  },
  serviceMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  servicePrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  serviceDuration: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  durationText: {
    marginLeft: 4,
    color: '#FFFFFF',
    fontSize: 14,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  featureCard: {
    width: '48%',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: 12,
    marginBottom: 8,
    textAlign: 'center',
  },
  featureDescription: {
    fontSize: 14,
    color: '#FFFFFF',
    textAlign: 'center',
    opacity: 0.9,
  },
  feedbackForm: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  feedbackLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#059669',
    marginBottom: 8,
  },
  ratingInput: {
    flexDirection: 'row',
    marginBottom: 16,
    justifyContent: 'center',
  },
  anonymousToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  toggleLabel: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  toggleText: {
    marginLeft: 8,
    color: '#059669',
    fontWeight: '500',
  },
  feedbackInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    minHeight: 100,
    textAlignVertical: 'top',
    marginBottom: 16,
  },
  submitButton: {
    backgroundColor: '#059669',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  feedbackCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  feedbackHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#059669',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  clientName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#059669',
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
  },
  feedbackText: {
    fontSize: 14,
    color: '#059669',
    fontStyle: 'italic',
    marginBottom: 8,
  },
  feedbackDate: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'right',
  },
  contactSection: {
    padding: 20,
    backgroundColor: '#FFFFFF',
  },
  contactTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#059669',
    marginBottom: 8,
    textAlign: 'center',
  },
  contactSubtitle: {
    fontSize: 16,
    color: '#059669',
    marginBottom: 20,
    textAlign: 'center',
  },
  contactMethods: {
    marginBottom: 24,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  contactText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#059669',
  },
  hoursInfo: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
  },
  hoursTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#059669',
    marginBottom: 8,
    textAlign: 'center',
  },
  hoursText: {
    fontSize: 14,
    color: '#059669',
    textAlign: 'center',
    marginBottom: 4,
  },
  footer: {
    padding: 20,
    backgroundColor: '#059669',
    alignItems: 'center',
  },
  footerText: {
    color: '#FFFFFF',
    fontSize: 14,
  },
});

export default CleaningServiceHomepage;