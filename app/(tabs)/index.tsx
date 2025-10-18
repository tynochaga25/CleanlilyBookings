import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  Dimensions,
  ActivityIndicator,
  Modal,
  useWindowDimensions,
} from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Clock } from 'lucide-react-native';
import { supabase } from '../lib/supabase';
import BookingModal from '../components/BookingModal';

const { width, height } = Dimensions.get('window');
const scaleFont = (size: number) => Math.min(size * (width / 375), size * 1.2); // Limit maximum scaling

interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number;
  category: string;
  created_at: string;
}

export default function HomeScreen() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const isSmallScreen = windowHeight < 700;

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;
      setServices(data || []);
      
      // Debug: Check if duration exists in the data
      console.log('Services data:', data);
      if (data && data.length > 0) {
        console.log('First service duration:', data[0].duration);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load services');
    } finally {
      setLoading(false);
    }
  };

  const handleBookService = (service: Service) => {
    setSelectedService(service);
    setShowBookingModal(true);
  };

  const handleBookingSuccess = () => {
    setShowBookingModal(false);
    setSelectedService(null);
  };

  const handleBookingClose = () => {
    setShowBookingModal(false);
    setSelectedService(null);
  };

  const getServiceIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'residential': return '🏠';
      case 'commercial': return '🏢';
      case 'special': return '✨';
      default: return '🧹';
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#047857" />
        <Text style={styles.loadingText}>Loading services...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.errorText}>Error: {error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchServices}>
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Header - Reduced height */}
      <View style={[styles.header, isSmallScreen && styles.headerSmall]}>
        <Image
          source={require('../cleanlily.png')}
          style={[styles.logo, isSmallScreen && styles.logoSmall]}
          resizeMode="contain"
        />
        <Text style={[styles.headerTitle, isSmallScreen && styles.headerTitleSmall]}>
          Cleanlily Cleaners
        </Text>
        <Text style={[styles.headerSubtitle, isSmallScreen && styles.headerSubtitleSmall]}>
          Professional cleaning services, made simple
        </Text>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={[styles.scrollContent, isSmallScreen && styles.scrollContentSmall]}
        showsVerticalScrollIndicator={false}
      >
        {/* Stats */}
        <View style={[styles.statsContainer, isSmallScreen && styles.statsContainerSmall]}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>500+</Text>
            <Text style={styles.statLabel}>Happy Customers</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>4.9</Text>
            <Text style={styles.statLabel}>⭐ Rating</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>1000+</Text>
            <Text style={styles.statLabel}>Cleanings Done</Text>
          </View>
        </View>

        {/* Services Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Our Services</Text>
          {services.map((service) => (
            <View key={service.id} style={[styles.serviceCard, isSmallScreen && styles.serviceCardSmall]}>
              <View style={styles.serviceHeader}>
                <View style={styles.iconCircle}>
                  <Text style={styles.serviceIcon}>{getServiceIcon(service.category)}</Text>
                </View>
                <View style={styles.serviceInfo}>
                  <Text style={styles.serviceName}>{service.name}</Text>
                  <Text style={styles.serviceDescription} numberOfLines={2}>
                    {service.description}
                  </Text>
                  <Text style={styles.serviceCategory}>{service.category}</Text>
                </View>
              </View>
              
              <View style={styles.serviceDetails}>
                <View style={styles.serviceMetrics}>
                  <Text style={styles.price}>${service.price}</Text>
                  <View style={styles.metric}>
                    <Clock size={isSmallScreen ? 14 : 16} color="#047857" />
                    <Text style={styles.metricText}>
                      {service.duration} {service.duration === 1 ? 'hour' : 'hours'}
                    </Text>
                  </View>
                </View>
                
                <TouchableOpacity
                  style={[styles.bookButton, isSmallScreen && styles.bookButtonSmall]}
                  onPress={() => handleBookService(service)}
                >
                  <Text style={styles.bookButtonText}>Book Now</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        {/* Features */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Why Choose Us?</Text>
          
          <View style={styles.featuresGrid}>
            {[
              { icon: '🛡️', title: 'Insured & Bonded', text: 'All our cleaners are fully insured' },
              { icon: '⚡', title: 'Same Day Service', text: 'Book and get cleaned today' },
              { icon: '💚', title: 'Eco-Friendly', text: 'Safe, non-toxic cleaning products' },
              { icon: '💯', title: 'Satisfaction Guarantee', text: "Not happy? We'll make it right" },
            ].map((f, i) => (
              <View key={i} style={[styles.feature, isSmallScreen && styles.featureSmall]}>
                <View style={styles.featureIconWrapper}><Text style={styles.featureIcon}>{f.icon}</Text></View>
                <Text style={styles.featureTitle}>{f.title}</Text>
                <Text style={styles.featureText} numberOfLines={2}>{f.text}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Booking Modal */}
      <Modal
        visible={showBookingModal}
        animationType="slide"
        transparent={true}
        onRequestClose={handleBookingClose}
      >
        <View style={styles.modalContainer}>
          {selectedService && (
            <BookingModal
              service={selectedService}
              onClose={handleBookingClose}
              onSuccess={handleBookingSuccess}
            />
          )}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#F9FAFB' 
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: scaleFont(16),
    color: '#6B7280',
  },
  errorText: {
    fontSize: scaleFont(16),
    color: '#DC2626',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#047857',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  header: {
    backgroundColor: '#047857',
    paddingTop: 40,
    paddingHorizontal: 24,
    paddingBottom: 24,
    alignItems: 'center',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerSmall: {
    paddingTop: 30,
    paddingBottom: 20,
  },
  logo: { 
    width: width * 0.25, 
    height: width * 0.15, 
    marginBottom: 10 
  },
  logoSmall: {
    width: width * 0.2,
    height: width * 0.12,
    marginBottom: 8,
  },
  headerTitle: { 
    fontSize: scaleFont(22), 
    fontWeight: 'bold', 
    color: 'white', 
    marginBottom: 4 
  },
  headerTitleSmall: {
    fontSize: scaleFont(20),
  },
  headerSubtitle: { 
    fontSize: scaleFont(13), 
    color: 'rgba(255,255,255,0.85)', 
    textAlign: 'center' 
  },
  headerSubtitleSmall: {
    fontSize: scaleFont(12),
  },
  content: { flex: 1 },
  scrollContent: {
    paddingBottom: 30,
  },
  scrollContentSmall: {
    paddingBottom: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginTop: -16,
    borderRadius: 16,
    padding: 16,
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  statsContainerSmall: {
    marginHorizontal: 16,
    padding: 12,
    marginTop: -12,
  },
  statItem: { 
    flex: 1, 
    alignItems: 'center' 
  },
  statNumber: { 
    fontSize: scaleFont(18), 
    fontWeight: '700', 
    color: '#047857' 
  },
  statLabel: { 
    fontSize: scaleFont(11), 
    color: '#6B7280', 
    marginTop: 4,
    textAlign: 'center'
  },
  section: { 
    paddingHorizontal: 20, 
    paddingTop: 28 
  },
  sectionTitle: { 
    fontSize: scaleFont(18), 
    fontWeight: '700', 
    color: '#1F2937', 
    marginBottom: 16 
  },
  serviceCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  serviceCardSmall: {
    padding: 12,
    marginBottom: 12,
  },
  serviceHeader: { 
    flexDirection: 'row', 
    alignItems: 'flex-start', 
    marginBottom: 12 
  },
  iconCircle: {
    backgroundColor: '#ECFDF5',
    borderRadius: 32,
    padding: 8,
    marginRight: 12,
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  serviceIcon: { 
    fontSize: scaleFont(24) 
  },
  serviceInfo: { 
    flex: 1 
  },
  serviceName: { 
    fontSize: scaleFont(15), 
    fontWeight: '600', 
    color: '#111827', 
    marginBottom: 4 
  },
  serviceDescription: { 
    fontSize: scaleFont(12), 
    color: '#6B7280', 
    lineHeight: 18, 
    marginBottom: 4 
  },
  serviceCategory: {
    fontSize: scaleFont(11),
    color: '#059669',
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  serviceDetails: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center' 
  },
  serviceMetrics: { 
    flex: 1 
  },
  price: { 
    fontSize: scaleFont(16), 
    fontWeight: 'bold', 
    color: '#047857', 
    marginBottom: 4 
  },
  metric: { 
    flexDirection: 'row', 
    alignItems: 'center' 
  },
  metricText: { 
    fontSize: scaleFont(12),
    color: '#374151',
    marginLeft: 4,
    fontWeight: '500',
  },
  bookButton: {
    backgroundColor: '#047857',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 24,
    shadowColor: '#047857',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  bookButtonSmall: {
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  bookButtonText: { 
    color: 'white', 
    fontWeight: '600', 
    fontSize: scaleFont(12) 
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  feature: {
    backgroundColor: 'white',
    width: width * 0.43,
    padding: 14,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 14,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  featureSmall: {
    width: width * 0.44,
    padding: 12,
    marginBottom: 12,
  },
  featureIconWrapper: {
    backgroundColor: '#ECFDF5',
    borderRadius: 32,
    padding: 10,
    marginBottom: 8,
  },
  featureIcon: { 
    fontSize: scaleFont(24) 
  },
  featureTitle: { 
    fontSize: scaleFont(13), 
    fontWeight: '600', 
    color: '#111827', 
    marginBottom: 4, 
    textAlign: 'center' 
  },
  featureText: { 
    fontSize: scaleFont(11), 
    color: '#6B7280', 
    textAlign: 'center', 
    lineHeight: 16 
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
});