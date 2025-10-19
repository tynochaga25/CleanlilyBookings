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
import { router } from 'po-router';
import { StatusBar } from 'expo-status-bar';
import { Clock } from 'lucide-react-native';
import { supabase } from '../lib/supabase';
import BookingModal from '../components/BookingModal';

const { width, height } = Dimensions.get('window');

// Enhanced scaling function that respects device text size settings
const scaleFont = (size: number, factor: number = 0.5) => {
  const scale = Math.min(width / 375, 1.3); // Limit maximum scaling
  const newSize = size + (scale - 1) * size * factor;
  return Math.round(newSize);
};

// Accessibility-aware font sizes
const getFontSizes = () => {
  const baseScale = Math.min(width / 375, 1.3);
  return {
    xs: scaleFont(10, 0.3),
    sm: scaleFont(12, 0.4),
    base: scaleFont(14, 0.5),
    lg: scaleFont(16, 0.5),
    xl: scaleFont(18, 0.6),
    xl2: scaleFont(20, 0.6),
    xl3: scaleFont(22, 0.7),
    xl4: scaleFont(24, 0.7),
  };
};

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

  // Get dynamic font sizes
  const fontSizes = getFontSizes();

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
        <Text style={[styles.loadingText, { fontSize: fontSizes.base }]}>
          Loading services...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={[styles.errorText, { fontSize: fontSizes.base }]}>
          Error: {error}
        </Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchServices}>
          <Text style={[styles.retryButtonText, { fontSize: fontSizes.sm }]}>
            Try Again
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Header */}
      <View style={[styles.header, isSmallScreen && styles.headerSmall]}>
        <Image
          source={require('../cleanlily.png')}
          style={[styles.logo, isSmallScreen && styles.logoSmall]}
          resizeMode="contain"
          accessibilityLabel="Cleanlily Cleaners Logo"
        />
        <Text 
          style={[
            styles.headerTitle, 
            { fontSize: fontSizes.xl3 },
            isSmallScreen && styles.headerTitleSmall
          ]}
          accessibilityRole="header"
        >
          Cleanlily Cleaners
        </Text>
        <Text 
          style={[
            styles.headerSubtitle, 
            { fontSize: fontSizes.sm },
            isSmallScreen && styles.headerSubtitleSmall
          ]}
        >
          Professional cleaning services, made simple
        </Text>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={[
          styles.scrollContent, 
          isSmallScreen && styles.scrollContentSmall
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Stats */}
        <View style={[styles.statsContainer, isSmallScreen && styles.statsContainerSmall]}>
          <View style={styles.statItem}>
            <Text 
              style={[styles.statNumber, { fontSize: fontSizes.xl }]}
              accessibilityLabel="500 plus Happy Customers"
            >
              500+
            </Text>
            <Text style={[styles.statLabel, { fontSize: fontSizes.xs }]}>
              Happy Customers
            </Text>
          </View>
          <View style={styles.statItem}>
            <Text 
              style={[styles.statNumber, { fontSize: fontSizes.xl }]}
              accessibilityLabel="4.9 star rating"
            >
              4.9
            </Text>
            <Text style={[styles.statLabel, { fontSize: fontSizes.xs }]}>
              ⭐ Rating
            </Text>
          </View>
          <View style={styles.statItem}>
            <Text 
              style={[styles.statNumber, { fontSize: fontSizes.xl }]}
              accessibilityLabel="1000 plus Cleanings Done"
            >
              1000+
            </Text>
            <Text style={[styles.statLabel, { fontSize: fontSizes.xs }]}>
              Cleanings Done
            </Text>
          </View>
        </View>

        {/* Services Section */}
        <View style={styles.section}>
          <Text 
            style={[styles.sectionTitle, { fontSize: fontSizes.xl }]}
            accessibilityRole="header"
          >
            Our Services
          </Text>
          {services.map((service) => (
            <View 
              key={service.id} 
              style={[styles.serviceCard, isSmallScreen && styles.serviceCardSmall]}
              accessibilityRole="button"
              accessibilityLabel={`Book ${service.name} service for $${service.price}`}
            >
              <View style={styles.serviceHeader}>
                <View style={styles.iconCircle}>
                  <Text 
                    style={[styles.serviceIcon, { fontSize: fontSizes.xl2 }]}
                    accessibilityLabel={getServiceIcon(service.category)}
                  >
                    {getServiceIcon(service.category)}
                  </Text>
                </View>
                <View style={styles.serviceInfo}>
                  <Text 
                    style={[styles.serviceName, { fontSize: fontSizes.lg }]}
                    accessibilityRole="header"
                  >
                    {service.name}
                  </Text>
                  <Text 
                    style={[styles.serviceDescription, { fontSize: fontSizes.sm }]} 
                    numberOfLines={2}
                  >
                    {service.description}
                  </Text>
                  <Text style={[styles.serviceCategory, { fontSize: fontSizes.xs }]}>
                    {service.category}
                  </Text>
                </View>
              </View>
              
              <View style={styles.serviceDetails}>
                <View style={styles.serviceMetrics}>
                  <Text 
                    style={[styles.price, { fontSize: fontSizes.lg }]}
                    accessibilityLabel={`Price $${service.price}`}
                  >
                    ${service.price}
                  </Text>
                  <View style={styles.metric}>
                    <Clock 
                      size={isSmallScreen ? fontSizes.sm : fontSizes.base} 
                      color="#047857" 
                      accessibilityLabel="Duration"
                    />
                    <Text 
                      style={[styles.metricText, { fontSize: fontSizes.sm }]}
                      accessibilityLabel={`${service.duration} ${service.duration === 1 ? 'hour' : 'hours'}`}
                    >
                      {service.duration} {service.duration === 1 ? 'hour' : 'hours'}
                    </Text>
                  </View>
                </View>
                
                <TouchableOpacity
                  style={[styles.bookButton, isSmallScreen && styles.bookButtonSmall]}
                  onPress={() => handleBookService(service)}
                  accessibilityRole="button"
                  accessibilityLabel={`Book ${service.name} service`}
                >
                  <Text style={[styles.bookButtonText, { fontSize: fontSizes.sm }]}>
                    Book Now
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        {/* Features */}
        <View style={styles.section}>
          <Text 
            style={[styles.sectionTitle, { fontSize: fontSizes.xl }]}
            accessibilityRole="header"
          >
            Why Choose Us?
          </Text>
          
          <View style={styles.featuresGrid}>
            {[
              { icon: '🛡️', title: 'Insured & Bonded', text: 'All our cleaners are fully insured' },
              { icon: '⚡', title: 'Same Day Service', text: 'Book and get cleaned today' },
              { icon: '💚', title: 'Eco-Friendly', text: 'Safe, non-toxic cleaning products' },
              { icon: '💯', title: 'Satisfaction Guarantee', text: "Not happy? We'll make it right" },
            ].map((f, i) => (
              <View 
                key={i} 
                style={[styles.feature, isSmallScreen && styles.featureSmall]}
                accessibilityRole="summary"
              >
                <View style={styles.featureIconWrapper}>
                  <Text 
                    style={[styles.featureIcon, { fontSize: fontSizes.xl2 }]}
                    accessibilityLabel={f.title}
                  >
                    {f.icon}
                  </Text>
                </View>
                <Text 
                  style={[styles.featureTitle, { fontSize: fontSizes.base }]}
                  accessibilityRole="header"
                >
                  {f.title}
                </Text>
                <Text 
                  style={[styles.featureText, { fontSize: fontSizes.sm }]} 
                  numberOfLines={2}
                >
                  {f.text}
                </Text>
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
        accessibilityViewIsModal={true}
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
    color: '#6B7280',
  },
  errorText: {
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
    fontWeight: 'bold', 
    color: 'white', 
    marginBottom: 4,
    textAlign: 'center',
  },
  headerTitleSmall: {
    // Size handled by dynamic font sizing
  },
  headerSubtitle: { 
    color: 'rgba(255,255,255,0.85)', 
    textAlign: 'center' 
  },
  headerSubtitleSmall: {
    // Size handled by dynamic font sizing
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
    fontWeight: '700', 
    color: '#047857' 
  },
  statLabel: { 
    color: '#6B7280', 
    marginTop: 4,
    textAlign: 'center'
  },
  section: { 
    paddingHorizontal: 20, 
    paddingTop: 28 
  },
  sectionTitle: { 
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
    // Size handled by dynamic font sizing
  },
  serviceInfo: { 
    flex: 1 
  },
  serviceName: { 
    fontWeight: '600', 
    color: '#111827', 
    marginBottom: 4 
  },
  serviceDescription: { 
    color: '#6B7280', 
    lineHeight: 18, 
    marginBottom: 4 
  },
  serviceCategory: {
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
    fontWeight: 'bold', 
    color: '#047857', 
    marginBottom: 4 
  },
  metric: { 
    flexDirection: 'row', 
    alignItems: 'center' 
  },
  metricText: { 
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
    // Size handled by dynamic font sizing
  },
  featureTitle: { 
    fontWeight: '600', 
    color: '#111827', 
    marginBottom: 4, 
    textAlign: 'center' 
  },
  featureText: { 
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
