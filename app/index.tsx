import React, { useRef, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
  ScrollView,
  Image,
  useWindowDimensions,
  SafeAreaView,
  Animated,
  Platform
} from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Phone, CheckCircle, ArrowRight, Heart, Award, Star as StarIcon, Headphones, Home as HomeIcon, Briefcase, Sparkles, Shield, Leaf, Clock, Award as AwardIcon, CheckCircle2, Clock3 } from 'lucide-react-native';

const COLORS = {
  primary: '#059669',
  primaryDark: '#047857',
  primaryLight: '#10b981',
  secondary: '#1F2937',
  accent: '#D1FAE5',
  white: '#FFFFFF',
  offWhite: '#F8FAFC',
  black: '#000000',
  gray: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
  }
};

const BREAKPOINTS = {
  xs: 320,    // Very small phones
  sm: 480,    // Small phones
  md: 768,    // Tablets
  lg: 1024,   // Large tablets
  xl: 1200,   // Small laptops
};

const ASSETS = {
  logos: {
    main: 'https://cleanlily.co.zw/wp-content/uploads/2024/04/Cleanlily-Cleaners-logo-png.png',
  },
  images: {
    hero: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
  }
};

const Logo = ({ size = 'medium', style }: { size?: 'small' | 'medium' | 'large' | 'xlarge'; style?: any }) => {
  const { width } = useWindowDimensions();
  const isSmallScreen = width < BREAKPOINTS.sm;
  const isVerySmallScreen = width < BREAKPOINTS.xs;
  
  const sizes = {
    small: isVerySmallScreen ? { width: 40, height: 40 } : { width: 48, height: 48 },
    medium: isSmallScreen ? { width: 80, height: 80 } : { width: 100, height: 100 },
    large: isSmallScreen ? { width: 100, height: 100 } : { width: 150, height: 150 },
    xlarge: isSmallScreen ? { width: 120, height: 120 } : { width: 180, height: 180 }
  };

  return (
    <Image
      source={{ uri: ASSETS.logos.main }}
      style={[sizes[size], style]}
      resizeMode="contain"
    />
  );
};

export default function WelcomeScreen() {
  const { width, height } = useWindowDimensions();
  const scrollY = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  const { 
    isVerySmallScreen, 
    isSmallScreen, 
    isMediumScreen, 
    isLargeScreen, 
    isExtraLargeScreen 
  } = useMemo(() => ({
    isVerySmallScreen: width < BREAKPOINTS.xs,    // < 320px
    isSmallScreen: width < BREAKPOINTS.sm,        // < 480px
    isMediumScreen: width < BREAKPOINTS.md,       // < 768px
    isLargeScreen: width < BREAKPOINTS.lg,        // < 1024px
    isExtraLargeScreen: width >= BREAKPOINTS.lg,  // >= 1024px
  }), [width]);

  // Enhanced responsive values with larger sizes
  const responsiveValues = useMemo(() => {
    const baseWidth = Math.min(width, 1200); // Cap at 1200px for very large screens
    
    return {
      // Increased font sizes for better readability
      fontSize: (baseSize: number) => {
        if (isVerySmallScreen) return baseSize * 0.85;
        if (isSmallScreen) return baseSize * 0.95;
        if (isMediumScreen) return baseSize * 1.05;
        if (isLargeScreen) return baseSize * 1.1;
        return baseSize * 1.2;
      },
      
      // Spacing that adapts to screen size
      spacing: (baseSpacing: number) => {
        if (isVerySmallScreen) return baseSpacing * 0.8;
        if (isSmallScreen) return baseSpacing * 0.9;
        if (isMediumScreen) return baseSpacing * 1;
        return baseSpacing * 1.1;
      },
      
      // Hero height that works on all devices
      heroHeight: Math.max(
        isVerySmallScreen ? height * 0.8 : 
        isSmallScreen ? height * 0.85 : 
        isMediumScreen ? height * 0.9 : 
        height * 0.95,
        600
      ),
      
      // Section padding that scales appropriately
      sectionPadding: {
        vertical: isVerySmallScreen ? 40 : 
                 isSmallScreen ? 50 : 
                 isMediumScreen ? 60 : 70,
        horizontal: isVerySmallScreen ? 20 : 
                   isSmallScreen ? 24 : 
                   isMediumScreen ? 28 : 36
      },
      
      // Container max width
      containerMaxWidth: Math.min(width * 0.95, 1400),
      
      // Icon sizes
      iconSize: (baseSize: number) => {
        if (isVerySmallScreen) return baseSize * 0.9;
        if (isSmallScreen) return baseSize * 1;
        if (isMediumScreen) return baseSize * 1.1;
        return baseSize * 1.2;
      }
    };
  }, [width, height, isVerySmallScreen, isSmallScreen, isMediumScreen, isLargeScreen]);

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [0, 1],
    extrapolate: 'clamp'
  });

  const heroScale = scrollY.interpolate({
    inputRange: [-100, 0],
    outputRange: [1.1, 1],
    extrapolate: 'clamp'
  });

  const stats = useMemo(() => [
    { number: '500+', label: 'Happy Clients', Icon: Heart },
    { number: '15+', label: 'Years Experience', Icon: Award },
    { number: '95%', label: 'Satisfaction Rate', Icon: StarIcon },
    { number: '24/7', label: 'Customer Support', Icon: Headphones }
  ], []);

  const services = useMemo(() => [
    {
      Icon: HomeIcon,
      title: "Residential Cleaning",
      description: "Complete home cleaning with eco-friendly products and attention to detail",
      features: ["Living Areas & Bedrooms", "Kitchen & Bathrooms", "Eco-Friendly Products", "Custom Requests"]
    },
    {
      Icon: Briefcase,
      title: "Commercial Cleaning",
      description: "Professional workspace maintenance for businesses of all sizes",
      features: ["Daily Office Maintenance", "Deep Sanitization", "Waste Management", "Flexible Scheduling"]
    },
    {
      Icon: Sparkles,
      title: "Deep Cleaning",
      description: "Intensive cleaning for special occasions and thorough maintenance",
      features: ["Move-in/Out Cleaning", "Seasonal Deep Clean", "Post-Renovation", "Premium Treatment"]
    }
  ], []);

  const features = useMemo(() => [
    {
      Icon: Shield,
      title: "Trusted Professionals",
      description: "Background-checked, trained, and experienced cleaning specialists"
    },
    {
      Icon: Leaf,
      title: "Eco-Friendly",
      description: "Environmentally safe, non-toxic cleaning solutions for your family"
    },
    {
      Icon: Clock,
      title: "Flexible Scheduling",
      description: "Book at your convenience with 24/7 online scheduling"
    },
    {
      Icon: AwardIcon,
      title: "Satisfaction Guarantee",
      description: "Not happy? We'll reclean until you're completely satisfied"
    }
  ], []);

  // Enhanced Header Component with larger text
  const Header = () => (
    <Animated.View style={[styles.header, { opacity: headerOpacity }]}>
      <SafeAreaView style={styles.headerSafeArea}>
        <View style={[
          styles.headerContainer,
          { 
            paddingHorizontal: responsiveValues.sectionPadding.horizontal,
            paddingVertical: responsiveValues.spacing(16)
          }
        ]}>
          <View style={styles.brandContainer}>
            <View style={styles.logoContainer}>
              <Logo size="small" style={styles.logo} />
              <View style={styles.brandTextContainer}>
                <Text style={[
                  styles.brandName,
                  { fontSize: responsiveValues.fontSize(22) }
                ]}>
                  Cleanlily Cleaners
                </Text>
                <Text style={[
                  styles.brandSubtitle,
                  { fontSize: responsiveValues.fontSize(14) }
                ]}>
                  Professional Cleaners
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={[
                styles.bookNowButton,
                {
                  paddingHorizontal: responsiveValues.spacing(20),
                  paddingVertical: responsiveValues.spacing(12)
                }
              ]}
              onPress={() => router.push('./auth/signin')}
            >
              <Text style={[
                styles.bookNowText,
                { fontSize: responsiveValues.fontSize(16) }
              ]}>
                Sign In
              </Text>
              <ArrowRight size={responsiveValues.iconSize(18)} color={COLORS.white} />
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </Animated.View>
  );

  // Enhanced Hero Section with larger text and better scrollability
  const HeroSection = () => (
    <View style={styles.heroContainer}>
      <Animated.View style={{ transform: [{ scale: heroScale }] }}>
        <ImageBackground
          source={{ uri: ASSETS.images.hero }}
          style={[styles.heroSection, { height: responsiveValues.heroHeight }]}
          imageStyle={styles.heroImage}
        >
          <View style={styles.heroOverlay}>
            <View style={[
              styles.heroContent,
              { 
                paddingHorizontal: responsiveValues.sectionPadding.horizontal,
                maxWidth: responsiveValues.containerMaxWidth 
              }
            ]}>
              <Animated.View style={[styles.centeredContent, { opacity: fadeAnim }]}>

                {/* Premium Badge */}
                <View style={[
                  styles.premiumBadge,
                  {
                    marginBottom: responsiveValues.spacing(40),
                    paddingHorizontal: responsiveValues.spacing(20),
                    paddingVertical: responsiveValues.spacing(12)
                  }
                ]}>
                  <Text style={[
                    styles.premiumBadgeText,
                    { fontSize: responsiveValues.fontSize(16) }
                  ]}>
                    Zimbabwe's Premier Cleaning Service
                  </Text>
                </View>

                {/* Company Logo and Name */}
                <View style={[
                  styles.companyBranding,
                  { marginBottom: responsiveValues.spacing(50) }
                ]}>
                  <Logo 
                    size={isSmallScreen ? "large" : "xlarge"} 
                    style={[
                      styles.heroLogo,
                      { marginBottom: responsiveValues.spacing(30) }
                    ]} 
                  />
                  <View style={styles.companyText}>
                    <Text style={[
                      styles.companyName,
                      { 
                        fontSize: responsiveValues.fontSize(isSmallScreen ? 40 : 56),
                        marginBottom: responsiveValues.spacing(16)
                      }
                    ]}>
                      Cleanlily Cleaners
                    </Text>
                    <Text style={[
                      styles.companyTagline,
                      { 
                        fontSize: responsiveValues.fontSize(isSmallScreen ? 20 : 24),
                        lineHeight: responsiveValues.fontSize(isSmallScreen ? 26 : 32)
                      }
                    ]}>
                      Professional Cleaning Services You Can Trust
                    </Text>
                  </View>
                </View>

                {/* Description */}
                <Text style={[
                  styles.heroDescription,
                  { 
                    fontSize: responsiveValues.fontSize(isSmallScreen ? 18 : 22),
                    lineHeight: responsiveValues.fontSize(isSmallScreen ? 24 : 32),
                    marginBottom: responsiveValues.spacing(50),
                    maxWidth: isSmallScreen ? '100%' : 700
                  }
                ]}>
                  Experience the Cleanlily difference with our trained professionals,
                  eco-friendly products, and guaranteed satisfaction. Transform your space
                  into a spotless sanctuary today.
                </Text>

                {/* Single Centered Button */}
                <TouchableOpacity
                  style={[
                    styles.primaryButton,
                    {
                      paddingVertical: responsiveValues.spacing(isSmallScreen ? 20 : 24),
                      paddingHorizontal: responsiveValues.spacing(isSmallScreen ? 40 : 48),
                      minWidth: isSmallScreen ? 240 : 280
                    }
                  ]}
                  onPress={() => router.push('./auth/signup')}
                  activeOpacity={0.9}
                >
                  <Text style={[
                    styles.primaryButtonText,
                    { fontSize: responsiveValues.fontSize(isSmallScreen ? 18 : 22) }
                  ]}>
                    Book Cleaning Now
                  </Text>
                  <ArrowRight 
                    size={responsiveValues.iconSize(isSmallScreen ? 22 : 28)} 
                    color={COLORS.white} 
                  />
                </TouchableOpacity>
              </Animated.View>
            </View>
          </View>
        </ImageBackground>
      </Animated.View>
    </View>
  );

  // Responsive Stats Section with larger text
  const StatsSection = () => (
    <View style={[
      styles.statsSection,
      {
        paddingVertical: responsiveValues.sectionPadding.vertical,
        paddingHorizontal: responsiveValues.sectionPadding.horizontal
      }
    ]}>
      <View style={[
        styles.statsGrid,
        { maxWidth: responsiveValues.containerMaxWidth }
      ]}>
        {stats.map((stat, index) => (
          <View key={index} style={[
            styles.statItem,
            {
              padding: responsiveValues.spacing(24),
              minWidth: isSmallScreen ? 160 : 200,
              margin: responsiveValues.spacing(12)
            }
          ]}>
            <View style={[
              styles.statIconContainer,
              { padding: responsiveValues.spacing(16) }
            ]}>
              <stat.Icon 
                size={responsiveValues.iconSize(24)} 
                color={COLORS.primary} 
                strokeWidth={2.5} 
              />
            </View>
            <Text style={[
              styles.statNumber,
              { fontSize: responsiveValues.fontSize(32) }
            ]}>
              {stat.number}
            </Text>
            <Text style={[
              styles.statLabel,
              { fontSize: responsiveValues.fontSize(16) }
            ]}>
              {stat.label}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );

  // Responsive Services Section with larger text
  const ServicesSection = () => (
    <View style={[
      styles.servicesSection,
      {
        paddingVertical: responsiveValues.sectionPadding.vertical,
        paddingHorizontal: responsiveValues.sectionPadding.horizontal
      }
    ]}>
      <View style={[
        styles.sectionContainer,
        { maxWidth: responsiveValues.containerMaxWidth }
      ]}>
        <View style={styles.sectionHeader}>
          <Text style={[
            styles.sectionSubtitle,
            { fontSize: responsiveValues.fontSize(14) }
          ]}>
            WHAT WE OFFER
          </Text>
          <Text style={[
            styles.sectionTitle,
            { fontSize: responsiveValues.fontSize(36) }
          ]}>
            Our Premium Services
          </Text>
          <View style={styles.titleDivider} />
        </View>

        <View style={[
          styles.servicesGrid,
          { gap: responsiveValues.spacing(32) }
        ]}>
          {services.map((service, index) => (
            <View key={index} style={[
              styles.serviceCard,
              {
                padding: responsiveValues.spacing(32),
                minWidth: isSmallScreen ? 320 : 350,
                flex: isMediumScreen ? 1 : undefined,
                width: isMediumScreen ? '100%' : '30%'
              }
            ]}>
              <View style={[
                styles.serviceIconContainer,
                { padding: responsiveValues.spacing(20) }
              ]}>
                <service.Icon 
                  size={responsiveValues.iconSize(32)} 
                  color={COLORS.primary} 
                  strokeWidth={2.5} 
                />
              </View>

              <Text style={[
                styles.serviceTitle,
                { fontSize: responsiveValues.fontSize(24) }
              ]}>
                {service.title}
              </Text>

              <Text style={[
                styles.serviceDescription,
                { fontSize: responsiveValues.fontSize(16) }
              ]}>
                {service.description}
              </Text>

              <View style={[
                styles.featuresList,
                { gap: responsiveValues.spacing(12), marginBottom: responsiveValues.spacing(32) }
              ]}>
                {service.features.map((feature, featureIndex) => (
                  <View key={featureIndex} style={styles.featureItem}>
                    <CheckCircle 
                      size={responsiveValues.iconSize(18)} 
                      color={COLORS.primary} 
                      strokeWidth={2.5} 
                    />
                    <Text style={[
                      styles.featureText,
                      { fontSize: responsiveValues.fontSize(16) }
                    ]}>
                      {feature}
                    </Text>
                  </View>
                ))}
              </View>

              <TouchableOpacity
                style={[
                  styles.serviceButton,
                  {
                    paddingVertical: responsiveValues.spacing(18),
                    paddingHorizontal: responsiveValues.spacing(32)
                  }
                ]}
                onPress={() => router.push('./auth/signup')}
                activeOpacity={0.9}
              >
                <Text style={[
                  styles.serviceButtonText,
                  { fontSize: responsiveValues.fontSize(16) }
                ]}>
                  Book Service
                </Text>
                <ArrowRight 
                  size={responsiveValues.iconSize(20)} 
                  color={COLORS.white} 
                />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </View>
    </View>
  );

  // Responsive Features Section with larger text
  const FeaturesSection = () => (
    <View style={[
      styles.featuresSection,
      {
        paddingVertical: responsiveValues.sectionPadding.vertical,
        paddingHorizontal: responsiveValues.sectionPadding.horizontal
      }
    ]}>
      <View style={[
        styles.sectionContainer,
        { maxWidth: responsiveValues.containerMaxWidth }
      ]}>
        <View style={styles.sectionHeader}>
          <Text style={[
            styles.sectionSubtitle,
            { fontSize: responsiveValues.fontSize(14) }
          ]}>
            WHY CHOOSE US
          </Text>
          <Text style={[
            styles.sectionTitle,
            { fontSize: responsiveValues.fontSize(36) }
          ]}>
            The Cleanlily Difference
          </Text>
          <View style={styles.titleDivider} />
        </View>

        <View style={[
          styles.featuresGrid,
          { gap: responsiveValues.spacing(32) }
        ]}>
          {features.map((feature, index) => (
            <View key={index} style={[
              styles.featureCard,
              {
                padding: responsiveValues.spacing(32),
                minWidth: isSmallScreen ? 320 : 350,
                flex: isMediumScreen ? 1 : undefined,
                width: isMediumScreen ? '100%' : '45%'
              }
            ]}>
              <View style={[
                styles.featureIconContainer,
                { padding: responsiveValues.spacing(24) }
              ]}>
                <feature.Icon 
                  size={responsiveValues.iconSize(28)} 
                  color={COLORS.white} 
                  strokeWidth={2.5} 
                />
              </View>
              <Text style={[
                styles.featureTitle,
                { fontSize: responsiveValues.fontSize(24) }
              ]}>
                {feature.title}
              </Text>
              <Text style={[
                styles.featureDescription,
                { fontSize: responsiveValues.fontSize(16) }
              ]}>
                {feature.description}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );

  // Responsive CTA Section with larger text
  const CTASection = () => (
    <View style={[
      styles.ctaSection,
      {
        paddingVertical: responsiveValues.sectionPadding.vertical,
        paddingHorizontal: responsiveValues.sectionPadding.horizontal
      }
    ]}>
      <View style={[
        styles.ctaContainer,
        { maxWidth: responsiveValues.containerMaxWidth }
      ]}>
        <View style={styles.ctaContent}>
          <Text style={[
            styles.ctaTitle,
            { fontSize: responsiveValues.fontSize(isSmallScreen ? 36 : 48) }
          ]}>
            Ready for a{"\n"}
            <Text style={styles.ctaTitleHighlight}>Spotless Space?</Text>
          </Text>
          <Text style={[
            styles.ctaDescription,
            { 
              fontSize: responsiveValues.fontSize(isSmallScreen ? 18 : 22),
              marginBottom: responsiveValues.spacing(50)
            }
          ]}>
            Join thousands of satisfied customers who trust Cleanlily
            for their cleaning needs. Book your first cleaning today
            and get 15% off!
          </Text>
          <View style={[
            styles.ctaButtons,
            { 
              gap: responsiveValues.spacing(20),
              flexDirection: isSmallScreen ? 'column' : 'row'
            }
          ]}>
            <TouchableOpacity
              style={[
                styles.ctaPrimaryButton,
                {
                  paddingVertical: responsiveValues.spacing(20),
                  paddingHorizontal: responsiveValues.spacing(40)
                }
              ]}
              onPress={() => router.push('./auth/signup')}
              activeOpacity={0.9}
            >
              <Text style={[
                styles.ctaPrimaryButtonText,
                { fontSize: responsiveValues.fontSize(18) }
              ]}>
                Get Started Today
              </Text>
              <ArrowRight size={responsiveValues.iconSize(20)} color={COLORS.white} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.ctaSecondaryButton,
                {
                  paddingVertical: responsiveValues.spacing(20),
                  paddingHorizontal: responsiveValues.spacing(36)
                }
              ]}
              onPress={() => router.push('tel:+263771234567')}
              activeOpacity={0.9}
            >
              <Phone size={responsiveValues.iconSize(20)} color={COLORS.white} strokeWidth={2.5} />
              <Text style={[
                styles.ctaSecondaryButtonText,
                { fontSize: responsiveValues.fontSize(18) }
              ]}>
                +263242 332317/75
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );

  // Responsive Footer with larger text
  const Footer = () => (
    <View style={[
      styles.footer,
      {
        paddingVertical: responsiveValues.sectionPadding.vertical,
        paddingHorizontal: responsiveValues.sectionPadding.horizontal
      }
    ]}>
      <View style={[
        styles.footerContent,
        { maxWidth: responsiveValues.containerMaxWidth }
      ]}>
        <View style={[
          styles.footerMain,
          { 
            gap: responsiveValues.spacing(50),
            flexDirection: isSmallScreen ? 'column' : 'row'
          }
        ]}>
          <View style={styles.footerBrand}>
            <Logo size="medium" style={styles.footerLogo} />
            <Text style={[
              styles.footerBrandName,
              { fontSize: responsiveValues.fontSize(24) }
            ]}>
              Cleanlily Cleaners
            </Text>
            <Text style={[
              styles.footerTagline,
              { fontSize: responsiveValues.fontSize(16) }
            ]}>
              Zimbabwe's most trusted cleaning service provider
            </Text>
          </View>

          <View style={styles.footerLinks}>
            <Text style={[
              styles.footerHeading,
              { fontSize: responsiveValues.fontSize(20) }
            ]}>
              Quick Links
            </Text>
            <TouchableOpacity onPress={() => router.push('/services')}>
              <Text style={[
                styles.footerLink,
                { fontSize: responsiveValues.fontSize(16) }
              ]}>
                Our Services
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push('/about')}>
              <Text style={[
                styles.footerLink,
                { fontSize: responsiveValues.fontSize(16) }
              ]}>
                About Us
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push('/contact')}>
              <Text style={[
                styles.footerLink,
                { fontSize: responsiveValues.fontSize(16) }
              ]}>
                Contact
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.footerContact}>
            <Text style={[
              styles.footerHeading,
              { fontSize: responsiveValues.fontSize(20) }
            ]}>
              Contact Info
            </Text>
            <Text style={[
              styles.footerContactText,
              { fontSize: responsiveValues.fontSize(16) }
            ]}>
              Harare, Zimbabwe
            </Text>
            <Text style={[
              styles.footerContactText,
              { fontSize: responsiveValues.fontSize(16) }
            ]}>
              +263242 332317/75
            </Text>
            <Text style={[
              styles.footerContactText,
              { fontSize: responsiveValues.fontSize(16) }
            ]}>
              cleanlilyharare@gmail.com
            </Text>
          </View>
        </View>

        <View style={styles.footerBottom}>
          <Text style={[
            styles.footerCopyright,
            { fontSize: responsiveValues.fontSize(14) }
          ]}>
            © 2025 Cleanlily Cleaners. All rights reserved.
          </Text>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header />

      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
        // Enhanced scrollability for zoom
        minimumZoomScale={0.8}
        maximumZoomScale={2.0}
        bouncesZoom={true}
        contentInsetAdjustmentBehavior="automatic"
      >
        <StatusBar style="light" />

        <HeroSection />
        <StatsSection />
        <ServicesSection />
        <FeaturesSection />
        <CTASection />
        <Footer />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  scrollContainer: {
    flexGrow: 1,
    // Ensure content can expand beyond screen for zooming
    minHeight: '100%',
  },

  // Enhanced Header Styles with larger text
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.white,
    zIndex: 1000,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[100],
    ...Platform.select({
      ios: {
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
      },
      android: {
        elevation: 4,
      },
      web: {
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
      },
    }),
  },
  headerSafeArea: {
    backgroundColor: COLORS.white,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 70,
  },
  brandContainer: {
    flex: 1,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logo: {
    borderRadius: 8,
  },
  brandTextContainer: {
    flexDirection: 'column',
  },
  brandName: {
    fontWeight: '800',
    color: COLORS.primary,
    letterSpacing: -0.5,
  },
  brandSubtitle: {
    fontWeight: '600',
    color: COLORS.gray[600],
    letterSpacing: 0.5,
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bookNowButton: {
    borderRadius: 8,
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    ...Platform.select({
      ios: {
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
      web: {
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
      },
    }),
  },
  bookNowText: {
    color: COLORS.white,
    fontWeight: '700',
    letterSpacing: 0.2,
  },

  // Enhanced Hero Section with larger elements
  heroContainer: {
    backgroundColor: COLORS.primary,
  },
  heroSection: {
    justifyContent: 'center',
  },
  heroImage: {
    opacity: 0.9,
  },
  heroOverlay: {
    backgroundColor: 'rgba(5, 150, 105, 0.88)',
    height: '100%',
    justifyContent: 'center',
  },
  heroContent: {
    alignSelf: 'center',
    width: '100%',
  },
  centeredContent: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  premiumBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  premiumBadgeText: {
    color: COLORS.accent,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  companyBranding: {
    alignItems: 'center',
  },
  heroLogo: {
    borderRadius: 16,
    ...Platform.select({
      ios: {
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
      web: {
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
    }),
  },
  companyText: {
    alignItems: 'center',
  },
  companyName: {
    fontWeight: '800',
    color: COLORS.white,
    letterSpacing: -1,
    textAlign: 'center',
  },
  companyTagline: {
    fontWeight: '600',
    color: COLORS.accent,
    letterSpacing: 0.3,
    textAlign: 'center',
  },
  heroDescription: {
    color: 'rgba(255, 255, 255, 0.96)',
    fontWeight: '500',
    letterSpacing: 0.2,
    textAlign: 'center',
  },
  primaryButton: {
    backgroundColor: COLORS.primaryDark,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    ...Platform.select({
      ios: {
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
      },
      android: {
        elevation: 6,
      },
      web: {
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
      },
    }),
  },
  primaryButtonText: {
    color: COLORS.white,
    fontWeight: '700',
    letterSpacing: 0.3,
  },

  // Section Container
  sectionContainer: {
    alignSelf: 'center',
    width: '100%',
  },

  // Stats Section with larger elements
  statsSection: {
    backgroundColor: COLORS.offWhite,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignSelf: 'center',
    width: '100%',
  },
  statItem: {
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.gray[100],
    ...Platform.select({
      ios: {
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
      web: {
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
      },
    }),
  },
  statIconContainer: {
    backgroundColor: '#f0fdf4',
    borderRadius: 14,
    marginBottom: 16,
  },
  statNumber: {
    fontWeight: '800',
    color: COLORS.primary,
    marginBottom: 8,
    letterSpacing: -1,
  },
  statLabel: {
    color: COLORS.gray[600],
    fontWeight: '600',
    textAlign: 'center',
    letterSpacing: 0.2,
  },

  // Services Section with larger elements
  servicesSection: {
    backgroundColor: COLORS.white,
  },
  sectionHeader: {
    alignItems: 'center',
    marginBottom: 48,
  },
  sectionSubtitle: {
    color: COLORS.primary,
    fontWeight: '800',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  sectionTitle: {
    fontWeight: '800',
    color: COLORS.secondary,
    textAlign: 'center',
    letterSpacing: -0.5,
    marginBottom: 20,
  },
  titleDivider: {
    width: 60,
    height: 4,
    backgroundColor: COLORS.primary,
    borderRadius: 2,
  },
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    width: '100%',
  },
  serviceCard: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.gray[100],
    ...Platform.select({
      ios: {
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 16,
      },
      android: {
        elevation: 4,
      },
      web: {
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 16,
      },
    }),
  },
  serviceIconContainer: {
    backgroundColor: '#f0fdf4',
    borderRadius: 16,
    marginBottom: 20,
    alignSelf: 'flex-start',
  },
  serviceTitle: {
    fontWeight: '700',
    color: COLORS.secondary,
    marginBottom: 12,
    letterSpacing: -0.3,
  },
  serviceDescription: {
    color: COLORS.gray[500],
    fontWeight: '500',
    lineHeight: 20,
    marginBottom: 24,
    letterSpacing: 0.1,
  },
  featuresList: {
    marginBottom: 24,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  featureText: {
    color: COLORS.gray[700],
    fontWeight: '500',
    letterSpacing: 0.1,
    flex: 1,
  },
  serviceButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    ...Platform.select({
      ios: {
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 6,
      },
      android: {
        elevation: 3,
      },
      web: {
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 6,
      },
    }),
  },
  serviceButtonText: {
    color: COLORS.white,
    fontWeight: '700',
    letterSpacing: 0.3,
  },

  // Features Section with larger elements
  featuresSection: {
    backgroundColor: COLORS.offWhite,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    width: '100%',
  },
  featureCard: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.gray[100],
    ...Platform.select({
      ios: {
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 12,
      },
      android: {
        elevation: 2,
      },
      web: {
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 12,
      },
    }),
  },
  featureIconContainer: {
    backgroundColor: COLORS.primary,
    borderRadius: 18,
    marginBottom: 20,
    ...Platform.select({
      ios: {
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 10,
      },
      android: {
        elevation: 4,
      },
      web: {
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 10,
      },
    }),
  },
  featureTitle: {
    fontWeight: '700',
    color: COLORS.secondary,
    marginBottom: 12,
    textAlign: 'center',
    letterSpacing: -0.2,
  },
  featureDescription: {
    color: COLORS.gray[500],
    textAlign: 'center',
    fontWeight: '500',
    lineHeight: 20,
    letterSpacing: 0.1,
  },

  // CTA Section with larger elements
  ctaSection: {
    backgroundColor: COLORS.primary,
  },
  ctaContainer: {
    alignSelf: 'center',
    width: '100%',
  },
  ctaContent: {
    alignItems: 'center',
    textAlign: 'center',
  },
  ctaTitle: {
    fontWeight: '800',
    color: COLORS.white,
    textAlign: 'center',
    letterSpacing: -1,
    marginBottom: 24,
    lineHeight: 40,
  },
  ctaTitleHighlight: {
    color: COLORS.accent,
  },
  ctaDescription: {
    color: 'rgba(255, 255, 255, 0.96)',
    textAlign: 'center',
    fontWeight: '500',
    lineHeight: 24,
    letterSpacing: 0.2,
  },
  ctaButtons: {
    alignItems: 'center',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  ctaPrimaryButton: {
    backgroundColor: COLORS.primaryDark,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    ...Platform.select({
      ios: {
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
      },
      android: {
        elevation: 6,
      },
      web: {
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
      },
    }),
  },
  ctaPrimaryButtonText: {
    color: COLORS.white,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  ctaSecondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 2,
    borderColor: COLORS.white,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  ctaSecondaryButtonText: {
    color: COLORS.white,
    fontWeight: '700',
    letterSpacing: 0.3,
  },

  // Footer with larger elements
  footer: {
    backgroundColor: COLORS.secondary,
  },
  footerContent: {
    alignSelf: 'center',
    width: '100%',
  },
  footerMain: {
    marginBottom: 40,
  },
  footerBrand: {
    minWidth: 280,
  },
  footerLogo: {
    marginBottom: 16,
  },
  footerBrandName: {
    color: COLORS.white,
    fontWeight: '700',
    marginBottom: 12,
    letterSpacing: -0.3,
  },
  footerTagline: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '400',
    lineHeight: 22,
    letterSpacing: 0.1,
  },
  footerLinks: {
    minWidth: 160,
  },
  footerHeading: {
    color: COLORS.white,
    fontWeight: '700',
    marginBottom: 20,
    letterSpacing: 0.2,
  },
  footerLink: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '500',
    marginBottom: 12,
    letterSpacing: 0.1,
  },
  footerContact: {
    minWidth: 220,
  },
  footerContactText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '500',
    marginBottom: 10,
    letterSpacing: 0.1,
  },
  footerBottom: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.15)',
    paddingTop: 24,
  },
  footerCopyright: {
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
    fontWeight: '500',
    letterSpacing: 0.2,
  },
});
