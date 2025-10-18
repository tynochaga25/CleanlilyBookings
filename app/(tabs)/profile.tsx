import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  ActivityIndicator,
  Linking,
  Animated,
  Easing,
  Dimensions,
  RefreshControl,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import {
  Star,
  Share2,
  LogOut,
  User,
  MapPin,
  Phone,
  Mail,
  FileText,
  Shield,
  Globe,
  BadgeInfo,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  Calendar,
  CreditCard,
  AlertCircle,
  ChevronRight,
  Sparkles,
  Award,
  Heart,
  Plus
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../lib/supabase';
import * as WebBrowser from 'expo-web-browser';
import { LinearGradient } from 'expo-linear-gradient';

// Define types based on your database schema
interface Profile {
  id: string;
  email: string;
  full_name: string;
  phone: string;
  role: string;
  created_at: string;
  updated_at: string;
}

interface Booking {
  id: string;
  client_id: string;
  cleaner_id: string | null;
  service_id: string;
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  scheduled_date: string;
  scheduled_time: string;
  address: string;
  special_instructions: string | null;
  total_price: number;
  created_at: string;
  updated_at: string;
  service_name?: string;
}

const { width } = Dimensions.get('window');

export default function ProfileScreen() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('bookings');
 
  // Animation values
  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideAnim = useState(new Animated.Value(50))[0];
  const scaleValue = useState(new Animated.Value(0.9))[0];

  useEffect(() => {
    fetchUserData();
    startAnimations();
  }, []);

  const startAnimations = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.spring(scaleValue, {
        toValue: 1,
        friction: 7,
        useNativeDriver: true,
      })
    ]).start();
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchUserData().then(() => setRefreshing(false));
  }, []);

  const fetchUserData = async () => {
    try {
      setLoading(true);
     
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      console.log('Current user:', user);
      console.log('User error:', userError);
     
      if (!user) {
        console.log('No user found, redirecting to auth');
        router.replace('/(auth)');
        return;
      }

      // Fetch profile data
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      console.log('Profile data:', profileData);
      console.log('Profile error:', profileError);

      if (profileError) throw profileError;
      setProfile(profileData);

      // Fetch user's bookings with service names
      const { data: bookingsData, error: bookingsError } = await supabase
        .from('bookings')
        .select(`
          *,
          services:service_id (name)
        `)
        .eq('client_id', user.id)
        .order('scheduled_date', { ascending: false })
        .order('scheduled_time', { ascending: false });

      console.log('Bookings data:', bookingsData);
      console.log('Bookings error:', bookingsError);

      if (bookingsError) throw bookingsError;
     
      // Format bookings with service names
      const formattedBookings = (bookingsData || []).map(booking => ({
        ...booking,
        service_name: booking.services?.name || 'Unknown Service'
      }));
     
      setBookings(formattedBookings);

    } catch (error) {
      console.error('Error fetching user data:', error);
      Alert.alert('Error', 'Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleContactSupport = () => {
    Linking.openURL('mailto:info@cleanlily.co.zw?subject=Support Request');
  };

  const handleRateApp = () => {
    Alert.alert('Rate Cleanlily', 'Thank you for considering rating our app! Your feedback helps us improve.');
  };

  const handleShareApp = async () => {
    try {
      Alert.alert(
        'Share Cleanlily',
        'Tell your friends about Cleanlily! Share our website: https://cleanlily.co.zw',
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleOpenWebsite = () => {
    WebBrowser.openBrowserAsync('https://cleanlily.co.zw');
  };

  const handleCallSupport = () => {
    Linking.openURL('tel:+263242332317');
  };

  const handleViewTerms = () => {
    WebBrowser.openBrowserAsync('https://cleanlily.co.zw/terms-of-service/');
  };

  const handleViewPrivacyPolicy = () => {
    WebBrowser.openBrowserAsync('https://cleanlily.co.zw/privacy-policy/');
  };

  const handleJoinTeam = () => {
    WebBrowser.openBrowserAsync('https://cleanlily.co.zw/join-our-team/');
  };

  const handleViewHelpCenter = () => {
    WebBrowser.openBrowserAsync('https://cleanlily.co.zw/faqs/');
  };

  const handleLogout = async () => {
    console.log('Logout button pressed');
    
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              console.log('Starting logout process...');
              
              // First check current session
              const { data: sessionData } = await supabase.auth.getSession();
              console.log('Current session before logout:', sessionData);
              
              // Perform logout
              const { error } = await supabase.auth.signOut();
              
              if (error) {
                console.error('Supabase logout error:', error);
                throw error;
              }
              
              console.log('Logout successful, checking session after logout...');
              
              // Verify session is cleared
              const { data: sessionAfterLogout } = await supabase.auth.getSession();
              console.log('Session after logout:', sessionAfterLogout);
              
              // Navigate to home screen
              console.log('Navigating to home screen...');
              router.replace('../(tabs)/home')
              
            } catch (error) {
              console.error('Error during logout:', error);
              Alert.alert('Error', 'Failed to logout. Please try again.');
            }
          },
        },
      ]
    );
  };

  // Alternative logout function - try this if the above doesn't work
  const handleLogoutAlternative = async () => {
    try {
      console.log('Alternative logout method');
      
      // Clear Supabase session
      await supabase.auth.signOut();
      
      // Clear any local storage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('supabase.auth.token');
      }
      
      // Force navigation to home
      setTimeout(() => {
        router.replace('/');
      }, 100);
      
    } catch (error) {
      console.error('Alternative logout error:', error);
      // Even if there's an error, try to navigate to home
      router.replace('/');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle size={16} color="#16A34A" />;
      case 'cancelled':
        return <XCircle size={16} color="#DC2626" />;
      case 'in_progress':
        return <Clock size={16} color="#D97706" />;
      case 'confirmed':
        return <CheckCircle size={16} color="#2563EB" />;
      case 'pending':
      default:
        return <AlertCircle size={16} color="#9333EA" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return '#16A34A';
      case 'cancelled':
        return '#DC2626';
      case 'in_progress':
        return '#D97706';
      case 'confirmed':
        return '#2563EB';
      case 'pending':
      default:
        return '#9333EA';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    const time = new Date(`2000-01-01T${timeString}`);
    return time.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  // Count bookings by status
  const countByStatus = (status: string) => {
    return bookings.filter(booking => booking.status === status).length;
  };

  const menuSections = [
    {
      title: 'Support',
      subtitle: 'Get help and information',
      items: [
        {
          icon: <Phone size={22} color="#FFFFFF" />,
          title: 'Contact Support',
          subtitle: 'Get in touch with our team',
          onPress: handleContactSupport,
          color: '#F59E0B',
        },
        {
          icon: <FileText size={22} color="#FFFFFF" />,
          title: 'Terms of Service',
          subtitle: 'Read our terms and conditions',
          onPress: handleViewTerms,
          color: '#10B981',
        },
        {
          icon: <Shield size={22} color="#FFFFFF" />,
          title: 'Privacy Policy',
          subtitle: 'How we handle your data',
          onPress: handleViewPrivacyPolicy,
          color: '#3B82F6',
        },
      ],
    },
    {
      title: 'About',
      subtitle: 'Learn more about Cleanlily',
      items: [
        {
          icon: <BadgeInfo size={22} color="#FFFFFF" />,
          title: 'About Cleanlily',
          subtitle: 'Learn about our company',
          onPress: () => WebBrowser.openBrowserAsync('https://cleanlily.co.zw/about-us/'),
          color: '#8B5CF6',
        },
        {
          icon: <Star size={22} color="#FFFFFF" />,
          title: 'Rate Our App',
          subtitle: 'Share your experience',
          onPress: handleRateApp,
          color: '#EC4899',
        },
        {
          icon: <Share2 size={22} color="#FFFFFF" />,
          title: 'Share Cleanlily',
          subtitle: 'Tell your friends about us',
          onPress: handleShareApp,
          color: '#06B6D4',
        },
        {
          icon: <Users size={22} color="#FFFFFF" />,
          title: 'Join Our Team',
          subtitle: 'Become a Cleanlily cleaner',
          onPress: handleJoinTeam,
          color: '#F97316',
        },
      ],
    },
  ];

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#10B981" />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
     
      {/* Header with Gradient */}
      <LinearGradient
        colors={['#059669', '#10B981']}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>My Profile</Text>
          <Text style={styles.headerSubtitle}>Manage your account and bookings</Text>
        </View>
        <View style={styles.headerPattern}>
          <Sparkles size={120} color="#FFFFFF20" style={styles.patternIcon} />
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#10B981" />
        }
      >
        {/* User Profile Card */}
        <Animated.View
          style={[
            styles.profileCard,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }, { scale: scaleValue }]
            }
          ]}
        >
          <View style={styles.profileHeader}>
            <LinearGradient
              colors={['#10B981', '#059669']}
              style={styles.avatar}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <User size={32} color="#FFFFFF" />
            </LinearGradient>
            <View style={styles.profileInfo}>
              <Text style={styles.userName}>{profile?.full_name || 'User'}</Text>
              <Text style={styles.userEmail}>{profile?.email || 'No email'}</Text>
              <Text style={styles.userPhone}>{profile?.phone || 'No phone number'}</Text>
            </View>
          </View>
         
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{bookings.length}</Text>
              <Text style={styles.statLabel}>Bookings</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, {color: '#9333EA'}]}>
                {countByStatus('pending')}
              </Text>
              <Text style={styles.statLabel}>Pending</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, {color: '#2563EB'}]}>
                {countByStatus('confirmed')}
              </Text>
              <Text style={styles.statLabel}>Confirmed</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, {color: '#16A34A'}]}>
                {countByStatus('completed')}
              </Text>
              <Text style={styles.statLabel}>Completed</Text>
            </View>
          </View>
        </Animated.View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.quickAction}
            onPress={() => router.push('/')}
          >
            <View style={[styles.quickActionIcon, {backgroundColor: '#F0FDF4'}]}>
              <Plus size={20} color="#059669" />
            </View>
            <Text style={styles.quickActionText}>New Booking</Text>
          </TouchableOpacity>
         
          <TouchableOpacity
            style={styles.quickAction}
            onPress={() => router.push('/booking')}
          >
            <View style={[styles.quickActionIcon, {backgroundColor: '#F0F9FF'}]}>
              <Calendar size={20} color="#0C4A6E" />
            </View>
            <Text style={styles.quickActionText}>My Bookings</Text>
          </TouchableOpacity>
         
          <TouchableOpacity
            style={styles.quickAction}
            onPress={handleContactSupport}
          >
            <View style={[styles.quickActionIcon, {backgroundColor: '#FFFBEB'}]}>
              <Phone size={20} color="#D97706" />
            </View>
            <Text style={styles.quickActionText}>Support</Text>
          </TouchableOpacity>
        </View>

        {/* Tabs */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'bookings' && styles.activeTab]}
            onPress={() => setActiveTab('bookings')}
          >
            <Text style={[styles.tabText, activeTab === 'bookings' && styles.activeTabText]}>
              Bookings
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'activity' && styles.activeTab]}
            onPress={() => setActiveTab('activity')}
          >
            <Text style={[styles.tabText, activeTab === 'activity' && styles.activeTabText]}>
              Activity
            </Text>
          </TouchableOpacity>
        </View>

        {/* Bookings Section */}
        {activeTab === 'bookings' && (
          <Animated.View
            style={[
              styles.section,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }]
              }
            ]}
          >
            <View style={styles.sectionHeader}>
              <View>
                <Text style={styles.sectionTitle}>Recent Bookings</Text>
                <Text style={styles.sectionSubtitle}>Your recent cleaning appointments</Text>
              </View>
              {bookings.length > 0 && (
                <TouchableOpacity
                  style={styles.viewAllButton}
                  onPress={() => router.push('/booking')}
                >
                  <Text style={styles.viewAllText}>View All</Text>
                  <ChevronRight size={16} color="#10B981" />
                </TouchableOpacity>
              )}
            </View>
           
            {bookings.length > 0 ? (
              <View style={styles.sectionContent}>
                {bookings.slice(0, 3).map((booking) => (
                  <TouchableOpacity
                    key={booking.id}
                    style={styles.bookingItem}
                    activeOpacity={0.7}
                    onPress={() => router.push('/booking')}
                  >
                    <View style={styles.bookingHeader}>
                      <Text style={styles.bookingService}>{booking.service_name}</Text>
                      <View style={[styles.statusBadge, {backgroundColor: `${getStatusColor(booking.status)}15`}]}>
                        {getStatusIcon(booking.status)}
                        <Text style={[styles.statusText, {color: getStatusColor(booking.status)}]}>
                          {booking.status.replace('_', ' ').toUpperCase()}
                        </Text>
                      </View>
                    </View>
                   
                    <View style={styles.bookingDetails}>
                      <View style={styles.bookingDetail}>
                        <Calendar size={14} color="#6B7280" />
                        <Text style={styles.bookingDetailText}>
                          {formatDate(booking.scheduled_date)} at {formatTime(booking.scheduled_time)}
                        </Text>
                      </View>
                     
                      <View style={styles.bookingDetail}>
                        <MapPin size={14} color="#6B7280" />
                        <Text style={styles.bookingDetailText} numberOfLines={1}>
                          {booking.address}
                        </Text>
                      </View>
                     
                      <View style={styles.bookingDetail}>
                        <CreditCard size={14} color="#6B7280" />
                        <Text style={styles.bookingDetailText}>
                          {formatCurrency(booking.total_price)}
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
               
                {bookings.length > 3 && (
                  <TouchableOpacity
                    style={styles.viewAllContainer}
                    onPress={() => router.push('/booking')}
                  >
                    <Text style={styles.viewAllButtonText}>View All Bookings ({bookings.length})</Text>
                  </TouchableOpacity>
                )}
              </View>
            ) : (
              <View style={styles.emptyState}>
                <Award size={48} color="#9CA3AF" />
                <Text style={styles.emptyStateTitle}>No bookings yet</Text>
                <Text style={styles.emptyStateText}>Schedule your first cleaning service</Text>
                <TouchableOpacity
                  style={styles.bookNowButton}
                  onPress={() => router.push('/')}
                >
                  <Text style={styles.bookNowText}>Book a Service</Text>
                </TouchableOpacity>
              </View>
            )}
          </Animated.View>
        )}

        {/* Activity Section */}
        {activeTab === 'activity' && (
          <Animated.View
            style={[
              styles.section,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }]
              }
            ]}
          >
            <View style={styles.sectionHeader}>
              <View>
                <Text style={styles.sectionTitle}>Recent Activity</Text>
                <Text style={styles.sectionSubtitle}>Your account activity history</Text>
              </View>
            </View>
            <View style={styles.emptyState}>
              <Heart size={48} color="#9CA3AF" />
              <Text style={styles.emptyStateTitle}>No recent activity</Text>
              <Text style={styles.emptyStateText}>Your activity will appear here</Text>
            </View>
          </Animated.View>
        )}

        {/* Menu Sections */}
        {menuSections.map((section, sectionIndex) => (
          <Animated.View
            key={sectionIndex}
            style={[
              styles.section,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }]
              }
            ]}
          >
            <View style={styles.sectionHeader}>
              <View>
                <Text style={styles.sectionTitle}>{section.title}</Text>
                <Text style={styles.sectionSubtitle}>{section.subtitle}</Text>
              </View>
            </View>
            <View style={styles.sectionContent}>
              {section.items.map((item, itemIndex) => (
                <TouchableOpacity
                  key={itemIndex}
                  style={styles.menuItem}
                  onPress={item.onPress}
                  activeOpacity={0.7}
                >
                  <View style={[styles.menuIcon, { backgroundColor: `${item.color}15` }]}>
                    {React.cloneElement(item.icon, { color: item.color })}
                  </View>
                  <View style={styles.menuText}>
                    <Text style={styles.menuTitle}>{item.title}</Text>
                    <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
                  </View>
                  <ChevronRight size={20} color="#9CA3AF" />
                </TouchableOpacity>
              ))}
            </View>
          </Animated.View>
        ))}

        {/* App Info */}
        <Animated.View
          style={[
            styles.appInfo,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <Image
            source={{ uri: 'https://cleanlily.co.zw/wp-content/uploads/2024/04/Cleanlily-Cleaners-logo-png.png' }}
            style={styles.appLogo}
          />
          <Text style={styles.appName}>Cleanlily Cleaners</Text>
          <Text style={styles.appVersion}>Version 2.1.0</Text>
          <Text style={styles.appCopyright}>© 2024 Cleanlily. All rights reserved.</Text>
         
          <View style={styles.socialLinks}>
            <TouchableOpacity style={styles.socialButton} onPress={handleOpenWebsite}>
              <Globe size={20} color="#10B981" />
              <Text style={styles.socialText}>Website</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialButton} onPress={handleContactSupport}>
              <Mail size={20} color="#10B981" />
              <Text style={styles.socialText}>Email</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialButton} onPress={handleCallSupport}>
              <Phone size={20} color="#10B981" />
              <Text style={styles.socialText}>Call</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Logout Button */}
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }}
        >
          <TouchableOpacity 
            style={styles.logoutButton} 
            onPress={handleLogoutAlternative}
          >
            <LogOut size={20} color="#DC2626" />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </Animated.View>

        <View style={styles.spacer} />
      </ScrollView>
    </View>
  );
}

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
    marginTop: 12,
    fontSize: 16,
    color: '#6B7280',
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    overflow: 'hidden',
  },
  headerContent: {
    zIndex: 2,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  headerPattern: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    zIndex: 1,
  },
  patternIcon: {
    marginRight: -30,
    marginBottom: -30,
  },
  content: {
    flex: 1,
    marginTop: -16,
  },
  profileCard: {
    backgroundColor: 'white',
    margin: 16,
    padding: 20,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 8,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 2,
  },
  userPhone: {
    fontSize: 14,
    color: '#6B7280',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 16,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statDivider: {
    width: 1,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 8,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#10B981',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 16,
    marginBottom: 16,
  },
  quickAction: {
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 16,
    width: '30%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  quickActionText: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '600',
    textAlign: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#10B981',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  activeTabText: {
    color: '#FFFFFF',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
    marginHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginTop: 4,
  },
  viewAllText: {
    color: '#10B981',
    fontWeight: '500',
    fontSize: 14,
  },
  sectionContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    overflow: 'hidden',
  },
  bookingItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  bookingService: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    flex: 1,
    marginRight: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  bookingDetails: {
    gap: 8,
  },
  bookingDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  bookingDetailText: {
    fontSize: 14,
    color: '#6B7280',
  },
  viewAllContainer: {
    padding: 16,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  viewAllButtonText: {
    color: '#10B981',
    fontWeight: '600',
  },
  emptyState: {
    backgroundColor: 'white',
    borderRadius: 16,
    marginHorizontal: 16,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 12,
    marginBottom: 4,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 16,
  },
  bookNowButton: {
    backgroundColor: '#10B981',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  bookNowText: {
    color: 'white',
    fontWeight: '600',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuText: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
    marginBottom: 2,
  },
  menuSubtitle: {
    fontSize: 12,
    color: '#6B7280',
  },
  appInfo: {
    alignItems: 'center',
    padding: 24,
    marginTop: 8,
  },
  appLogo: {
    width: 60,
    height: 60,
    marginBottom: 12,
    borderRadius: 12,
  },
  appName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#10B981',
    marginBottom: 4,
  },
  appVersion: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  appCopyright: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 16,
  },
  socialLinks: {
    flexDirection: 'row',
    gap: 16,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    padding: 10,
    backgroundColor: '#F0FDF4',
    borderRadius: 12,
  },
  socialText: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '500',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginHorizontal: 16,
    marginTop: 8,
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  logoutText: {
    fontSize: 16,
    color: '#DC2626',
    fontWeight: '600',
  },
  spacer: {
    height: 20,
  },
});
