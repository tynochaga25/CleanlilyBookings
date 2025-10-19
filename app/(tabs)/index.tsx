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
import { Clock, Star, Users, Shield, Zap, Heart, Award } from 'lucide-react-native';
import { supabase } from '../lib/supabase';
import BookingModal from '../components/BookingModal';

const { width, height } = Dimensions.get('window');

// Enhanced scaling function for better readability
const scaleFont = (size: number, factor: number = 0.6) => {
  const scale = Math.min(width / 375, 1.5); // Increased maximum scaling
  const newSize = size + (scale - 1) * size * factor;
  return Math.round(newSize);
};

// Larger, more accessible font sizes
const getFontSizes = () => {
  const baseScale = Math.min(width / 375, 1.5);
  return {
    xs: scaleFont(12, 0.4),    // Increased from 10
    sm: scaleFont(14, 0.5),    // Increased from 12
    base: scaleFont(16, 0.6),  // Increased from 14
    lg: scaleFont(18, 0.6),    // Increased from 16
    xl: scaleFont(20, 0.7),    // Increased from 18
    xl2: scaleFont(22, 0.7),   // Increased from 20
    xl3: scaleFont(26, 0.8),   // Increased from 22
    xl4: scaleFont(28, 0.8),   // Increased from 24
    xl5: scaleFont(32, 0.9),   // New larger size
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
        <Text style={[styles.loadingText, { fontSize: fontSizes.lg }]}>
          Loading services...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={[styles.errorText, { fontSize: fontSizes.lg }]}>
          Error: {error}
        </Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchServices}>
          <Text style={[styles.retryButtonText, { fontSize: fontSizes.base }]}>
            Try Again
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Compact Header with Centered Content */}
      <View style={[styles.header, isSmallScreen && styles.headerSmall]}>
        <View style={styles.headerContent}>
          <Image
            source={require('../cleanlily.png')}
            style={[styles.logo, isSmallScreen && styles.logoSmall]}
            resizeMode="contain"
            accessibilityLabel="Cleanlily Cleaners Logo"
          />
          <View style={styles.headerTextContainer}>
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
                { fontSize: fontSizes.xs },
                isSmallScreen && styles.headerSubtitleSmall
              ]}
            >
              Professional cleaning services, made simple
            </Text>
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={[
          styles.scrollContent, 
          isSmallScreen && styles.scrollContentSmall
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Enhanced Stats Section */}
        <View style={[styles.statsContainer, isSmallScreen && styles.statsContainerSmall]}>
          <View style={styles.statItem}>
            <Users size={fontSizes.xl2} color="#047857" />
            <Text 
              style={[styles.statNumber, { fontSize: fontSizes.xl2 }]}
              accessibilityLabel="500 plus Happy Customers"
            >
              500+
            </Text>
            <Text style={[styles.statLabel, { fontSize: fontSizes.sm }]}>
              Happy Customers
            </Text>
          </View>
          <View style={styles.statItem}>
            <Star size={fontSizes.xl2} color="#047857" fill="#047857" />
            <Text 
              style={[styles.statNumber, { fontSize: fontSizes.xl2 }]}
              accessibilityLabel="4.9 star rating"
            >
              4.9
            </Text>
            <Text style={[styles.statLabel, { fontSize: fontSizes.sm }]}>
              Star Rating
            </Text>
          </View>
          <View style={styles.statItem}>
            <Award size={fontSizes.xl2} color="#047857" />
            <Text 
              style={[styles.statNumber, { fontSize: fontSizes.xl2 }]}
              accessibilityLabel="1000 plus Cleanings Done"
            >
              1000+
            </Text>
            <Text style={[styles.statLabel, { fontSize: fontSizes.sm }]}>
              Cleanings Done
            </Text>
          </View>
        </View>

        {/* Enhanced Services Section */}
        <View style={styles.section}>
          <Text 
            style={[styles.sectionTitle, { fontSize: fontSizes.xl3 }]}
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
                    style={[styles.serviceIcon, { fontSize: fontSizes.xl3 }]}
                    accessibilityLabel={getServiceIcon(service.category)}
                  >
                    {getServiceIcon(service.category)}
                  </Text>
                </View>
                <View style={styles.serviceInfo}>
                  <Text 
                    style={[styles.serviceName, { fontSize: fontSizes.xl }]}
                    accessibilityRole="header"
                  >
                    {service.name}
                  </Text>
                  <Text 
                    style={[styles.serviceDescription, { fontSize: fontSizes.base }]} 
                    numberOfLines={2}
                  >
                    {service.description}
                  </Text>
                  <View style={styles.categoryBadge}>
                    <Text style={[styles.serviceCategory, { fontSize: fontSizes.sm }]}>
                      {service.category}
                    </Text>
                  </View>
                </View>
              </View>
              
              <View style={styles.serviceDetails}>
                <View style={styles.serviceMetrics}>
                  <Text 
                    style={[styles.price, { fontSize: fontSizes.xl }]}
                    accessibilityLabel={`Price $${service.price}`}
                  >
                    ${service.price}
                  </Text>
                  <View style={styles.metric}>
                    <Clock 
                      size={fontSizes.base} 
                      color="#047857" 
                      accessibilityLabel="Duration"
                    />
                    <Text 
                      style={[styles.metricText, { fontSize: fontSizes.base }]}
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
                  <Text style={[styles.bookButtonText, { fontSize: fontSizes.base }]}>
                    Book Now
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        {/* Enhanced Features Section */}
        <View style={styles.section}>
          <Text 
            style={[styles.sectionTitle, { fontSize: fontSizes.xl3 }]}
            accessibilityRole="header"
          >
            Why Choose Us?
          </Text>
          
          <View style={styles.featuresGrid}>
            {[
              { icon: <Shield size={fontSizes.xl2} color="#047857" />, title: 'Insured & Bonded', text: 'All our cleaners are fully insured' },
              { icon: <Zap size={fontSizes.xl2} color="#047857" />, title: 'Same Day Service', text: 'Book and get cleaned today' },
              { icon: <Heart size={fontSizes.xl2} color="#047857" />, title: 'Eco-Friendly', text: 'Safe, non-toxic cleaning products' },
              { icon: <Award size={fontSizes.xl2} color="#047857" />, title: 'Satisfaction Guarantee', text: "Not happy? We'll make it right" },
            ].map((f, i) => (
              <View 
                key={i} 
                style={[styles.feature, isSmallScreen && styles.featureSmall]}
                accessibilityRole="summary"
              >
                <View style={styles.featureIconWrapper}>
                  {f.icon}
                </View>
                <Text 
                  style={[styles.featureTitle, { fontSize: fontSizes.lg }]}
                  accessibilityRole="header"
                >
                  {f.title}
                </Text>
                <Text 
                  style={[styles.featureText, { fontSize: fontSizes.base }]} 
                  numberOfLines={3}
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
    marginTop: 20,
    color: '#6B7280',
    fontWeight: '600',
  },
  errorText: {
    color: '#DC2626',
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: '600',
  },
  retryButton: {
    backgroundColor: '#047857',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    shadowColor: '#047857',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  // Compact Header with Centered Content
  header: {
    backgroundColor: '#047857',
    paddingTop: 35, // Reduced from 40
    paddingHorizontal: 20,
    paddingBottom: 15, // Reduced from 20
    borderBottomLeftRadius: 20, // Reduced from 24
    borderBottomRightRadius: 20, // Reduced from 24
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
    minHeight: 100, // Added fixed height
  },
  headerSmall: {
    paddingTop: 25, // Reduced from 30
    paddingBottom: 12, // Reduced from 16
    minHeight: 85, // Smaller fixed height for small screens
  },
  headerContent: {
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column', // Changed back to column for centered layout
  },
  logo: { 
    width: width * 0.18, // Reduced from 0.25
    height: width * 0.12, // Reduced from 0.15
    marginBottom: 8, // Reduced margin
  },
  logoSmall: {
    width: width * 0.15, // Reduced from 0.2
    height: width * 0.1, // Reduced from 0.12
    marginBottom: 6, // Reduced margin
  },
  headerTextContainer: {
    alignItems: 'center', // Centered text
  },
  headerTitle: { 
    fontWeight: '800', 
    color: 'white', 
    marginBottom: 2, // Reduced from 6
    textAlign: 'center', // Centered text
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
    letterSpacing: 0.5,
  },
  headerTitleSmall: {
    // Size handled by dynamic font sizing
  },
  headerSubtitle: { 
    color: 'rgba(255,255,255,0.95)', 
    textAlign: 'center', // Centered text
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  headerSubtitleSmall: {
    // Size handled by dynamic font sizing
  },
  content: { flex: 1 },
  scrollContent: {
    paddingBottom: 40,
  },
  scrollContentSmall: {
    paddingBottom: 30,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginTop: -12, // Adjusted for smaller header
    borderRadius: 20,
    padding: 20,
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 1,
    borderColor: 'rgba(5, 150, 105, 0.1)',
  },
  statsContainerSmall: {
    marginHorizontal: 16,
    padding: 16,
    marginTop: -10, // Adjusted for smaller header
  },
  statItem: { 
    flex: 1, 
    alignItems: 'center',
  },
  statNumber: { 
    fontWeight: '800', 
    color: '#047857',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: { 
    color: '#6B7280', 
    fontWeight: '600',
    textAlign: 'center'
  },
  section: { 
    paddingHorizontal: 20, 
    paddingTop: 28, // Slightly reduced
  },
  sectionTitle: { 
    fontWeight: '800', 
    color: '#1F2937', 
    marginBottom: 20,
    letterSpacing: 0.3,
  },
  serviceCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(5, 150, 105, 0.1)',
  },
  serviceCardSmall: {
    padding: 16,
    marginBottom: 16,
  },
  serviceHeader: { 
    flexDirection: 'row', 
    alignItems: 'flex-start', 
    marginBottom: 16,
  },
  iconCircle: {
    backgroundColor: '#ECFDF5',
    borderRadius: 40,
    padding: 12,
    marginRight: 16,
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#10B981',
  },
  serviceIcon: { 
    // Size handled by dynamic font sizing
  },
  serviceInfo: { 
    flex: 1,
  },
  serviceName: { 
    fontWeight: '700', 
    color: '#111827', 
    marginBottom: 6,
    letterSpacing: 0.3,
  },
  serviceDescription: { 
    color: '#6B7280', 
    lineHeight: 22, 
    marginBottom: 8,
    fontWeight: '500',
  },
  categoryBadge: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  serviceCategory: {
    color: '#059669',
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  serviceDetails: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(5, 150, 105, 0.1)',
  },
  serviceMetrics: { 
    flex: 1,
  },
  price: { 
    fontWeight: '800', 
    color: '#047857', 
    marginBottom: 6,
  },
  metric: { 
    flexDirection: 'row', 
    alignItems: 'center',
  },
  metricText: { 
    color: '#374151',
    marginLeft: 6,
    fontWeight: '600',
  },
  bookButton: {
    backgroundColor: '#047857',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 16,
    shadowColor: '#047857',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  bookButtonSmall: {
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  bookButtonText: { 
    color: 'white', 
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  feature: {
    backgroundColor: 'white',
    width: width * 0.43,
    padding: 20,
    borderRadius: 20,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: 'rgba(5, 150, 105, 0.1)',
  },
  featureSmall: {
    width: width * 0.44,
    padding: 16,
    marginBottom: 14,
  },
  featureIconWrapper: {
    backgroundColor: '#ECFDF5',
    borderRadius: 40,
    padding: 14,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#10B981',
  },
  featureTitle: { 
    fontWeight: '700', 
    color: '#111827', 
    marginBottom: 6, 
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  featureText: { 
    color: '#6B7280', 
    textAlign: 'center', 
    lineHeight: 20,
    fontWeight: '500',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
});
