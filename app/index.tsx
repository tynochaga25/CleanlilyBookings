import React from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  ImageBackground, 
  ScrollView, 
  Dimensions, 
  Image, 
  useWindowDimensions,
  SafeAreaView
} from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { MaterialIcons, FontAwesome5, Ionicons, Feather } from '@expo/vector-icons';

export default function WelcomeScreen() {
  const { width, height } = useWindowDimensions();
  const isSmallScreen = width < 768;
  const isVerySmallScreen = width < 400;
  
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <StatusBar style="light" />
        
        {/* Hero Section */}
        <ImageBackground 
          source={{ uri: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80' }}
          style={[styles.heroSection, { height: Math.max(550, height * 0.7) }]}
          imageStyle={styles.heroImage}
        >
          <View style={styles.heroOverlay}>
            {/* Logo and Company Name without container */}
            <Image 
              source={{ uri: 'https://cleanlily.co.zw/wp-content/uploads/2024/04/Cleanlily-Cleaners-logo-png.png' }} 
              style={[styles.logoImage, {
                width: Math.min(100, width * 0.2),
                height: Math.min(100, width * 0.2),
                marginBottom: Math.max(10, width * 0.02)
              }]}
              resizeMode="contain"
            />
            <Text 
              style={[styles.logoText, {
                fontSize: Math.max(24, Math.min(36, width * 0.07)),
                marginBottom: Math.max(10, width * 0.02)
              }]}
              numberOfLines={1}
              adjustsFontSizeToFit
            >
              Cleanlily Cleaners
            </Text>
            
            <Text style={[styles.tagline, {
              fontSize: Math.max(16, Math.min(22, width * 0.04))
            }]}>
              Zimbabwe's Premier Cleaning Service
            </Text>
            
            <Text style={[styles.heroText, {
              fontSize: Math.max(14, Math.min(16, width * 0.035))
            }]}>
              Professional cleaning services for your home or office. 
              Experience the Cleanlily difference with our trained professionals 
              and eco-friendly cleaning products.
            </Text>
            
            <View style={[styles.buttonContainer, {
              flexDirection: isVerySmallScreen ? 'column' : 'row'
            }]}>
              <TouchableOpacity
                style={[styles.primaryButton, {
                  flex: isVerySmallScreen ? 0 : 1
                }]}
                onPress={() => router.push('./auth/signup')}
              >
                <Text style={styles.primaryButtonText}>Book Now</Text>
                <Feather name="arrow-right" size={20} color="#fff" style={styles.buttonIcon} />
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.secondaryButton, {
                  flex: isVerySmallScreen ? 0 : 1
                }]}
                onPress={() => router.push('./auth/signin')}
              >
                <Text style={styles.secondaryButtonText}>Sign In</Text>
                <Feather name="log-in" size={20} color="#059669" style={styles.buttonIcon} />
              </TouchableOpacity>
            </View>
          </View>
        </ImageBackground>
        
        {/* Features Section */}
        <View style={[styles.featuresSection, { padding: Math.max(20, width * 0.05) }]}>
          <Text style={[styles.sectionTitle, {
            fontSize: Math.max(22, Math.min(28, width * 0.05))
          }]}>
            Why Choose Cleanlily?
          </Text>
          
          <View style={styles.featuresGrid}>
            <View style={[styles.featureCard, {
              width: isSmallScreen ? '100%' : '47%'
            }]}>
              <View style={styles.featureIconContainer}>
                <FontAwesome5 name="user-shield" size={24} color="#fff" />
              </View>
              <Text style={styles.featureTitle}>Trusted Professionals</Text>
              <Text style={styles.featureText}>All our cleaners are thoroughly vetted and trained</Text>
            </View>
            
            <View style={[styles.featureCard, {
              width: isSmallScreen ? '100%' : '47%'
            }]}>
              <View style={styles.featureIconContainer}>
                <Ionicons name="leaf" size={24} color="#fff" />
              </View>
              <Text style={styles.featureTitle}>Eco-Friendly Products</Text>
              <Text style={styles.featureText}>We use environmentally safe cleaning solutions</Text>
            </View>
            
            <View style={[styles.featureCard, {
              width: isSmallScreen ? '100%' : '47%'
            }]}>
              <View style={styles.featureIconContainer}>
                <Feather name="clock" size={24} color="#fff" />
              </View>
              <Text style={styles.featureTitle}>Flexible Scheduling</Text>
              <Text style={styles.featureText}>Book at your convenience, including weekends</Text>
            </View>
            
            <View style={[styles.featureCard, {
              width: isSmallScreen ? '100%' : '47%'
            }]}>
              <View style={styles.featureIconContainer}>
                <MaterialIcons name="star" size={24} color="#fff" />
              </View>
              <Text style={styles.featureTitle}>Quality Guaranteed</Text>
              <Text style={styles.featureText}>Satisfaction guaranteed with every cleaning</Text>
            </View>
          </View>
        </View>
        
        {/* Services Preview */}
        <View style={[styles.servicesSection, { padding: Math.max(20, width * 0.05) }]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, {
              fontSize: Math.max(22, Math.min(28, width * 0.05))
            }]}>
              Our Services
            </Text>
            <TouchableOpacity onPress={() => router.push('./auth/signin')}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          
          <View style={[styles.servicesRow, {
            flexDirection: width < 600 ? 'column' : 'row'
          }]}>
            <View style={[styles.serviceItem, {
              width: width < 600 ? '100%' : '30%'
            }]}>
              <View style={[styles.serviceIconContainer, styles.residentialBg]}>
                <Ionicons name="home" size={28} color="#fff" />
              </View>
              <Text style={styles.serviceText}>Residential Cleaning</Text>
            </View>
            
            <View style={[styles.serviceItem, {
              width: width < 600 ? '100%' : '30%'
            }]}>
              <View style={[styles.serviceIconContainer, styles.officeBg]}>
                <Ionicons name="business" size={28} color="#fff" />
              </View>
              <Text style={styles.serviceText}>Office Cleaning</Text>
            </View>
            
            <View style={[styles.serviceItem, {
              width: width < 600 ? '100%' : '30%'
            }]}>
              <View style={[styles.serviceIconContainer, styles.deepCleanBg]}>
                <MaterialIcons name="cleaning-services" size={28} color="#fff" />
              </View>
              <Text style={styles.serviceText}>Deep Cleaning</Text>
            </View>
          </View>
        </View>
        
        {/* CTA Section */}
        <View style={[styles.ctaSection, { height: Math.max(300, height * 0.4) }]}>
          <ImageBackground 
            source={{ uri: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80' }}
            style={styles.ctaBackground}
            imageStyle={styles.ctaBackgroundImage}
          >
            <View style={styles.ctaOverlay}>
              <View style={styles.ctaContent}>
                <Text style={[styles.ctaTitle, {
                  fontSize: Math.max(24, Math.min(32, width * 0.06))
                }]}>
                  Ready for a Spotless Space?
                </Text>
                <Text style={[styles.ctaText, {
                  fontSize: Math.max(14, Math.min(18, width * 0.035))
                }]}>
                  Book your cleaning service today and enjoy a fresh, clean environment
                </Text>
                <TouchableOpacity
                  style={styles.ctaButton}
                  onPress={() => router.push('./auth/signup')}
                >
                  <Text style={styles.ctaButtonText}>Get Started</Text>
                  <Feather name="arrow-right" size={20} color="white" style={styles.buttonIcon} />
                </TouchableOpacity>
              </View>
            </View>
          </ImageBackground>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContainer: {
    flexGrow: 1,
    backgroundColor: '#fff',
  },
  heroSection: {
    justifyContent: 'center',
    minHeight: 550,
  },
  heroImage: {
    opacity: 0.9,
  },
  heroOverlay: {
    backgroundColor: 'rgba(5, 150, 105, 0.78)',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    padding: 20,
  },
  logoImage: {
    // Dimensions are set dynamically in the component
  },
  logoText: {
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    maxFontSizeMultiplier: 1.2,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  tagline: {
    color: 'white',
    marginBottom: 20,
    textAlign: 'center',
    fontWeight: '600',
    lineHeight: 28,
    maxFontSizeMultiplier: 1.3,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  heroText: {
    color: 'rgba(255, 255, 255, 0.95)',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 24,
    paddingHorizontal: 10,
    maxFontSizeMultiplier: 1.4,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0.5, height: 0.5 },
    textShadowRadius: 1,
  },
  buttonContainer: {
    gap: 16,
    width: '100%',
    maxWidth: 400,
  },
  primaryButton: {
    backgroundColor: '#047857',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 8,
    maxFontSizeMultiplier: 1.2,
  },
  secondaryButton: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  secondaryButtonText: {
    color: '#059669',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
    maxFontSizeMultiplier: 1.2,
  },
  buttonIcon: {
    marginLeft: 4,
  },
  featuresSection: {
    backgroundColor: '#f8fafc',
  },
  sectionTitle: {
    fontWeight: 'bold',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 35,
    maxFontSizeMultiplier: 1.2,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 20,
  },
  featureCard: {
    backgroundColor: 'white',
    padding: 25,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  featureIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#059669',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 10,
    textAlign: 'center',
    maxFontSizeMultiplier: 1.2,
  },
  featureText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 22,
    maxFontSizeMultiplier: 1.4,
  },
  servicesSection: {
    backgroundColor: 'white',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  viewAllText: {
    color: '#059669',
    fontWeight: '600',
    fontSize: 16,
    maxFontSizeMultiplier: 1.2,
  },
  servicesRow: {
    justifyContent: 'center',
    alignItems: 'center',
    gap: 30,
  },
  serviceItem: {
    alignItems: 'center',
  },
  serviceIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  residentialBg: {
    backgroundColor: '#10b981',
  },
  officeBg: {
    backgroundColor: '#059669',
  },
  deepCleanBg: {
    backgroundColor: '#047857',
  },
  serviceText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
    maxFontSizeMultiplier: 1.3,
  },
  ctaSection: {
    minHeight: 300,
  },
  ctaBackground: {
    flex: 1,
  },
  ctaBackgroundImage: {
    opacity: 0.9,
  },
  ctaOverlay: {
    backgroundColor: 'rgba(5, 150, 105, 0.85)',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  ctaContent: {
    maxWidth: 500,
    alignItems: 'center',
  },
  ctaTitle: {
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 15,
    textAlign: 'center',
    maxFontSizeMultiplier: 1.2,
  },
  ctaText: {
    color: 'rgba(255, 255, 255, 0.95)',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 26,
    maxFontSizeMultiplier: 1.4,
  },
  ctaButton: {
    backgroundColor: '#10b981',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    minWidth: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  ctaButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 8,
    maxFontSizeMultiplier: 1.2,
  },
});