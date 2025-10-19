import React from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  ImageBackground, 
  ScrollView, 
  Image, 
  useWindowDimensions,
  SafeAreaView
} from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { MaterialIcons, FontAwesome5, Ionicons, Feather } from '@expo/vector-icons';

export default function WelcomeScreen() {
  const { width, height } = useWindowDimensions();
  
  // Enhanced responsive breakpoints
  const isSmallScreen = width < 768;
  const isVerySmallScreen = width < 400;
  const isLargeScreen = width > 1200;
  const isTablet = width >= 768 && width <= 1200;
  
  // Responsive font size calculations
  const getResponsiveFontSize = (baseSize, multiplier = 0.035) => {
    return Math.max(baseSize * 0.8, Math.min(baseSize * 1.3, width * multiplier));
  };

  // Responsive spacing
  const getResponsiveSpacing = (baseSpacing) => {
    return baseSpacing * (isLargeScreen ? 1.1 : isTablet ? 1 : 0.9);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <StatusBar style="light" />
        
        {/* Hero Section - Full width green background */}
        <View style={styles.heroContainer}>
          <ImageBackground 
            source={{ uri: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80' }}
            style={[
              styles.heroSection, 
              { 
                height: isLargeScreen ? height * 0.75 : isTablet ? height * 0.7 : Math.max(500, height * 0.65),
              }
            ]}
            imageStyle={styles.heroImage}
          >
            <View style={styles.heroOverlay}>
              {/* Logo and Branding */}
              <View style={styles.logoContainer}>
                <Image 
                  source={{ uri: 'https://cleanlily.co.zw/wp-content/uploads/2024/04/Cleanlily-Cleaners-logo-png.png' }} 
                  style={[
                    styles.logoImage, 
                    {
                      width: isLargeScreen ? 120 : isTablet ? 100 : isVerySmallScreen ? 70 : 90,
                      height: isLargeScreen ? 120 : isTablet ? 100 : isVerySmallScreen ? 70 : 90,
                      marginBottom: getResponsiveSpacing(12)
                    }
                  ]}
                  resizeMode="contain"
                />
                <Text 
                  style={[
                    styles.logoText,
                    {
                      fontSize: getResponsiveFontSize(28, 0.055),
                      marginBottom: getResponsiveSpacing(6)
                    }
                  ]}
                  numberOfLines={1}
                  adjustsFontSizeToFit
                >
                  Cleanlily Cleaners
                </Text>
                
                <Text style={[
                  styles.tagline,
                  {
                    fontSize: getResponsiveFontSize(16, 0.035),
                    marginBottom: getResponsiveSpacing(16)
                  }
                ]}>
                  Zimbabwe's Premier Cleaning Service
                </Text>
              </View>
              
              {/* Hero Content */}
              <View style={styles.heroContent}>
                <Text style={[
                  styles.heroText,
                  {
                    fontSize: getResponsiveFontSize(14, 0.032),
                    marginBottom: getResponsiveSpacing(30),
                    lineHeight: getResponsiveFontSize(20, 0.04)
                  }
                ]}>
                  Professional cleaning services for your home or office. 
                  Experience the Cleanlily difference with our trained professionals 
                  and eco-friendly cleaning products.
                </Text>
                
                <View style={[
                  styles.buttonContainer, 
                  {
                    flexDirection: isVerySmallScreen ? 'column' : 'row',
                    gap: getResponsiveSpacing(12),
                    maxWidth: isLargeScreen ? 500 : isTablet ? 450 : 380
                  }
                ]}>
                  <TouchableOpacity
                    style={[
                      styles.primaryButton,
                      {
                        flex: isVerySmallScreen ? 0 : 1,
                        minHeight: getResponsiveSpacing(52),
                        paddingVertical: getResponsiveSpacing(14)
                      }
                    ]}
                    onPress={() => router.push('./auth/signup')}
                  >
                    <Text style={[
                      styles.primaryButtonText,
                      { fontSize: getResponsiveFontSize(16, 0.034) }
                    ]}>Book Now</Text>
                    <Feather name="arrow-right" size={getResponsiveFontSize(18, 0.035)} color="#fff" style={styles.buttonIcon} />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.secondaryButton,
                      {
                        flex: isVerySmallScreen ? 0 : 1,
                        minHeight: getResponsiveSpacing(52),
                        paddingVertical: getResponsiveSpacing(14)
                      }
                    ]}
                    onPress={() => router.push('./auth/signin')}
                  >
                    <Text style={[
                      styles.secondaryButtonText,
                      { fontSize: getResponsiveFontSize(16, 0.034) }
                    ]}>Sign In</Text>
                    <Feather name="log-in" size={getResponsiveFontSize(18, 0.035)} color="#059669" style={styles.buttonIcon} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </ImageBackground>
        </View>
        
        {/* Features Section */}
        <View style={[
          styles.featuresSection, 
          { 
            paddingHorizontal: getResponsiveSpacing(20),
            paddingVertical: getResponsiveSpacing(30)
          }
        ]}>
          <Text style={[
            styles.sectionTitle,
            {
              fontSize: getResponsiveFontSize(24, 0.045),
              marginBottom: getResponsiveSpacing(30)
            }
          ]}>
            Why Choose Cleanlily?
          </Text>
          
          <View style={[
            styles.featuresGrid,
            {
              gap: getResponsiveSpacing(16)
            }
          ]}>
            {[
              {
                icon: <FontAwesome5 name="user-shield" size={getResponsiveFontSize(22, 0.04)} color="#fff" />,
                title: "Trusted Professionals",
                text: "All our cleaners are thoroughly vetted and trained"
              },
              {
                icon: <Ionicons name="leaf" size={getResponsiveFontSize(22, 0.04)} color="#fff" />,
                title: "Eco-Friendly Products",
                text: "We use environmentally safe cleaning solutions"
              },
              {
                icon: <Feather name="clock" size={getResponsiveFontSize(22, 0.04)} color="#fff" />,
                title: "Flexible Scheduling",
                text: "Book at your convenience, including weekends"
              },
              {
                icon: <MaterialIcons name="star" size={getResponsiveFontSize(22, 0.04)} color="#fff" />,
                title: "Quality Guaranteed",
                text: "Satisfaction guaranteed with every cleaning"
              }
            ].map((feature, index) => (
              <View 
                key={index}
                style={[
                  styles.featureCard,
                  {
                    width: isSmallScreen ? '100%' : '48%',
                    padding: getResponsiveSpacing(20)
                  }
                ]}
              >
                <View style={[
                  styles.featureIconContainer,
                  {
                    width: getResponsiveSpacing(60),
                    height: getResponsiveSpacing(60),
                    borderRadius: getResponsiveSpacing(30),
                    marginBottom: getResponsiveSpacing(16)
                  }
                ]}>
                  {feature.icon}
                </View>
                <Text style={[
                  styles.featureTitle,
                  { fontSize: getResponsiveFontSize(18, 0.038) }
                ]}>
                  {feature.title}
                </Text>
                <Text style={[
                  styles.featureText,
                  { 
                    fontSize: getResponsiveFontSize(13, 0.028),
                    lineHeight: getResponsiveFontSize(18, 0.035)
                  }
                ]}>
                  {feature.text}
                </Text>
              </View>
            ))}
          </View>
        </View>
        
        {/* Services Preview */}
        <View style={[
          styles.servicesSection,
          {
            paddingHorizontal: getResponsiveSpacing(20),
            paddingVertical: getResponsiveSpacing(30)
          }
        ]}>
          <View style={styles.sectionHeader}>
            <Text style={[
              styles.sectionTitle,
              {
                fontSize: getResponsiveFontSize(24, 0.045)
              }
            ]}>
              Our Services
            </Text>
            <TouchableOpacity onPress={() => router.push('./auth/signin')}>
              <Text style={[
                styles.viewAllText,
                { fontSize: getResponsiveFontSize(15, 0.032) }
              ]}>
                View All
              </Text>
            </TouchableOpacity>
          </View>
          
          <View style={[
            styles.servicesRow,
            {
              flexDirection: width < 600 ? 'column' : 'row',
              gap: getResponsiveSpacing(24)
            }
          ]}>
            {[
              {
                icon: <Ionicons name="home" size={getResponsiveFontSize(24, 0.045)} color="#fff" />,
                text: "Residential Cleaning",
                bgStyle: styles.residentialBg
              },
              {
                icon: <Ionicons name="business" size={getResponsiveFontSize(24, 0.045)} color="#fff" />,
                text: "Office Cleaning",
                bgStyle: styles.officeBg
              },
              {
                icon: <MaterialIcons name="cleaning-services" size={getResponsiveFontSize(24, 0.045)} color="#fff" />,
                text: "Deep Cleaning",
                bgStyle: styles.deepCleanBg
              }
            ].map((service, index) => (
              <View 
                key={index}
                style={[
                  styles.serviceItem,
                  {
                    width: width < 600 ? '100%' : '30%'
                  }
                ]}
              >
                <View style={[
                  styles.serviceIconContainer,
                  service.bgStyle,
                  {
                    width: getResponsiveSpacing(80),
                    height: getResponsiveSpacing(80),
                    borderRadius: getResponsiveSpacing(40),
                    marginBottom: getResponsiveSpacing(16)
                  }
                ]}>
                  {service.icon}
                </View>
                <Text style={[
                  styles.serviceText,
                  { fontSize: getResponsiveFontSize(16, 0.035) }
                ]}>
                  {service.text}
                </Text>
              </View>
            ))}
          </View>
        </View>
        
        {/* CTA Section */}
        <View style={[
          styles.ctaSection, 
          { 
            height: isLargeScreen ? height * 0.45 : isTablet ? height * 0.4 : Math.max(300, height * 0.35) 
          }
        ]}>
          <ImageBackground 
            source={{ uri: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80' }}
            style={styles.ctaBackground}
            imageStyle={styles.ctaBackgroundImage}
          >
            <View style={styles.ctaOverlay}>
              <View style={[
                styles.ctaContent,
                { maxWidth: isLargeScreen ? 500 : isTablet ? 450 : 350 }
              ]}>
                <Text style={[
                  styles.ctaTitle,
                  {
                    fontSize: getResponsiveFontSize(28, 0.055),
                    marginBottom: getResponsiveSpacing(16)
                  }
                ]}>
                  Ready for a Spotless Space?
                </Text>
                <Text style={[
                  styles.ctaText,
                  {
                    fontSize: getResponsiveFontSize(16, 0.035),
                    marginBottom: getResponsiveSpacing(28),
                    lineHeight: getResponsiveFontSize(22, 0.045)
                  }
                ]}>
                  Book your cleaning service today and enjoy a fresh, clean environment
                </Text>
                <TouchableOpacity
                  style={[
                    styles.ctaButton,
                    {
                      paddingVertical: getResponsiveSpacing(16),
                      minWidth: isLargeScreen ? 220 : isTablet ? 200 : 180
                    }
                  ]}
                  onPress={() => router.push('./auth/signup')}
                >
                  <Text style={[
                    styles.ctaButtonText,
                    { fontSize: getResponsiveFontSize(16, 0.035) }
                  ]}>
                    Get Started
                  </Text>
                  <Feather name="arrow-right" size={getResponsiveFontSize(18, 0.035)} color="white" style={styles.buttonIcon} />
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
  heroContainer: {
    backgroundColor: '#059669', // Green background that covers full width
  },
  heroSection: {
    justifyContent: 'center',
    minHeight: 500,
  },
  heroImage: {
    opacity: 0.9,
  },
  heroOverlay: {
    backgroundColor: 'rgba(5, 150, 105, 0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    paddingVertical: 30,
    paddingHorizontal: 16,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logoImage: {
    // Dimensions are set dynamically
  },
  logoText: {
    fontWeight: '800',
    color: 'white',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 5,
    letterSpacing: 0.5,
  },
  tagline: {
    color: 'rgba(255, 255, 255, 0.95)',
    textAlign: 'center',
    fontWeight: '600',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
    letterSpacing: 0.3,
  },
  heroContent: {
    alignItems: 'center',
    width: '100%',
  },
  heroText: {
    color: 'rgba(255, 255, 255, 0.95)',
    textAlign: 'center',
    fontWeight: '500',
    paddingHorizontal: 10,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0.5, height: 0.5 },
    textShadowRadius: 2,
  },
  buttonContainer: {
    width: '100%',
  },
  primaryButton: {
    backgroundColor: '#047857',
    paddingHorizontal: 24,
    borderRadius: 16,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  primaryButtonText: {
    color: 'white',
    fontWeight: '700',
    marginRight: 8,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  secondaryButton: {
    backgroundColor: 'white',
    paddingHorizontal: 24,
    borderRadius: 16,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 2,
    borderColor: 'rgba(5, 150, 105, 0.3)',
  },
  secondaryButtonText: {
    color: '#059669',
    fontWeight: '700',
    marginRight: 8,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  buttonIcon: {
    marginLeft: 4,
  },
  featuresSection: {
    backgroundColor: '#f8fafc',
  },
  sectionTitle: {
    fontWeight: '800',
    color: '#1f2937',
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  featureCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  featureIconContainer: {
    backgroundColor: '#059669',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  featureTitle: {
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  featureText: {
    color: '#6b7280',
    textAlign: 'center',
    fontWeight: '500',
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
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  servicesRow: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  serviceItem: {
    alignItems: 'center',
  },
  serviceIconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
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
    fontWeight: '700',
    color: '#374151',
    textAlign: 'center',
    letterSpacing: 0.3,
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
    backgroundColor: 'rgba(5, 150, 105, 0.88)',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  ctaContent: {
    alignItems: 'center',
  },
  ctaTitle: {
    fontWeight: '800',
    color: 'white',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 5,
    letterSpacing: 0.5,
  },
  ctaText: {
    color: 'rgba(255, 255, 255, 0.95)',
    textAlign: 'center',
    fontWeight: '500',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  ctaButton: {
    backgroundColor: '#10b981',
    paddingHorizontal: 28,
    borderRadius: 16,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  ctaButtonText: {
    color: 'white',
    fontWeight: '700',
    marginRight: 6,
    letterSpacing: 0.5,
  },
});
