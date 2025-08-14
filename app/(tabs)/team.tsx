import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Image,
  TextInput,
  Alert,
  Linking,
  Platform,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { Mail, Phone, MessageSquare, HelpCircle, AlertCircle, FileText, Shield, MapPin, Clock, ChevronRight } from 'lucide-react-native';

const logo = require('../cleanlily.png');

// Get screen dimensions
const { width, height } = Dimensions.get('window');
const isSmallScreen = width < 375;

type HelpTopic = {
  id: string;
  title: string;
  description: string;
  icon: string;
  action?: () => void;
};

export default function HelpDeskPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingAction, setLoadingAction] = useState(false);

  // Extracted from cleanlily.co.zw
  const COMPANY_INFO = {
    supportEmail: 'info@cleanlily.co.zw',
    phoneNumber: '+263 77 469 0933',
    whatsappNumber: '+263 77 469 0933',
    address: '21 Downie Avenue, Belgravia, Harare, Zimbabwe',
    workingHours: 'Monday - Friday: 8AM - 5PM\nSaturday: 9AM - 1PM',
    website: 'https://cleanlily.co.zw'
  };

  const handleAction = async (action: () => Promise<void> | void) => {
    try {
      setLoadingAction(true);
      await action();
    } catch (error) {
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setLoadingAction(false);
    }
  };

  const openWhatsApp = () => {
    const url = `whatsapp://send?phone=${COMPANY_INFO.whatsappNumber.replace(/\D/g, '')}`;
    Linking.canOpenURL(url).then(supported => {
      if (supported) {
        Linking.openURL(url);
      } else {
        Linking.openURL(`https://wa.me/${COMPANY_INFO.whatsappNumber.replace(/\D/g, '')}`);
      }
    });
  };

  const openMap = () => {
    const address = encodeURIComponent(COMPANY_INFO.address);
    const url = Platform.select({
      ios: `maps:0,0?q=${address}`,
      android: `geo:0,0?q=${address}`,
    });
    
    if (url) {
      Linking.openURL(url).catch(() => {
        Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${address}`);
      });
    }
  };

  const helpTopics: HelpTopic[] = [
    {
      id: '1',
      title: 'Email Support',
      description: `Contact us at ${COMPANY_INFO.supportEmail}`,
      icon: 'mail',
      action: () => handleAction(() => Linking.openURL(`mailto:${COMPANY_INFO.supportEmail}?subject=CleanLily Support Request`)),
    },
    {
      id: '2',
      title: 'Call Us',
      description: `Phone: ${COMPANY_INFO.phoneNumber}`,
      icon: 'phone',
      action: () => handleAction(() => Linking.openURL(`tel:${COMPANY_INFO.phoneNumber.replace(/\D/g, '')}`)),
    },
    {
      id: '3',
      title: 'WhatsApp Chat',
      description: 'Message us on WhatsApp',
      icon: 'message',
      action: () => handleAction(openWhatsApp),
    },
    {
      id: '4',
      title: 'Our Location',
      description: COMPANY_INFO.address,
      icon: 'map',
      action: () => handleAction(openMap),
    },
    {
      id: '5',
      title: 'Working Hours',
      description: COMPANY_INFO.workingHours,
      icon: 'clock',
    },
    {
      id: '6',
      title: 'Terms of Service',
      description: 'View our terms and conditions',
      icon: 'file',
      action: () => handleAction(() => Linking.openURL(`${COMPANY_INFO.website}/terms`)),
    },
    {
      id: '7',
      title: 'Privacy Policy',
      description: 'Learn how we protect your data',
      icon: 'shield',
      action: () => handleAction(() => Linking.openURL(`${COMPANY_INFO.website}/privacy`)),
    },
  ];

  const filteredTopics = helpTopics.filter(topic => {
    const q = searchQuery.toLowerCase();
    return (
      topic.title.toLowerCase().includes(q) ||
      topic.description.toLowerCase().includes(q)
    );
  });

  const getIconComponent = (iconName: string) => {
    const iconProps = { size: isSmallScreen ? 20 : 24, color: "#059669" };
    switch (iconName) {
      case 'mail': return <Mail {...iconProps} />;
      case 'phone': return <Phone {...iconProps} />;
      case 'message': return <MessageSquare {...iconProps} />;
      case 'help': return <HelpCircle {...iconProps} />;
      case 'alert': return <AlertCircle {...iconProps} />;
      case 'file': return <FileText {...iconProps} />;
      case 'shield': return <Shield {...iconProps} />;
      case 'map': return <MapPin {...iconProps} />;
      case 'clock': return <Clock {...iconProps} />;
      default: return <HelpCircle {...iconProps} />;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
        alwaysBounceVertical={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Image source={logo} style={styles.logoImage} />
            <Text style={styles.logoText}>CleanLily Help Center</Text>
          </View>
        </View>

        {/* Search */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="How can we help you today?"
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
          />
        </View>

        {/* Help Topics */}
        <View style={styles.contentContainer}>
          {loadingAction ? (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color="#059669" />
            </View>
          ) : null}

          {filteredTopics.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No help topics found</Text>
              <Text style={styles.emptyStateSubtext}>Try a different search term</Text>
            </View>
          ) : (
            <>
              <Text style={styles.sectionTitle}>How can we help?</Text>
              {filteredTopics.map(topic => (
                <TouchableOpacity
                  key={topic.id}
                  style={styles.helpCard}
                  onPress={topic.action}
                  disabled={!topic.action}
                >
                  <View style={styles.helpIcon}>
                    {getIconComponent(topic.icon)}
                  </View>
                  <View style={styles.helpDetails}>
                    <Text style={styles.helpTitle}>{topic.title}</Text>
                    <Text style={styles.helpDescription}>{topic.description}</Text>
                  </View>
                  {topic.action && <ChevronRight size={20} color="#9CA3AF" />}
                </TouchableOpacity>
              ))}
            </>
          )}
        </View>

        {/* Emergency Contact Banner */}
        <View style={styles.emergencyBanner}>
          <Text style={styles.emergencyText}>Urgent cleaning emergency? Call us now: </Text>
          <TouchableOpacity 
            onPress={() => handleAction(() => Linking.openURL(`tel:${COMPANY_INFO.phoneNumber.replace(/\D/g, '')}`))}
          >
            <Text style={styles.emergencyNumber}>{COMPANY_INFO.phoneNumber}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: isSmallScreen ? 12 : 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    maxWidth: '90%',
  },
  logoImage: {
    width: isSmallScreen ? 60 : 80,
    height: isSmallScreen ? 21 : 28,
    resizeMode: 'contain',
  },
  logoText: {
    fontSize: isSmallScreen ? 16 : 20,
    fontWeight: '700',
    color: '#059669',
    marginLeft: isSmallScreen ? 8 : 12,
  },
  searchContainer: {
    paddingHorizontal: isSmallScreen ? 16 : 20,
    paddingVertical: isSmallScreen ? 12 : 16,
  },
  searchInput: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: isSmallScreen ? 10 : 12,
    fontSize: isSmallScreen ? 14 : 16,
    color: '#111827',
  },
  contentContainer: {
    paddingHorizontal: isSmallScreen ? 16 : 20,
    paddingBottom: 20,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: isSmallScreen ? 14 : 16,
    color: '#6B7280',
    marginBottom: 8,
    fontWeight: '600',
  },
  emptyStateSubtext: {
    fontSize: isSmallScreen ? 12 : 14,
    color: '#9CA3AF',
  },
  sectionTitle: {
    fontSize: isSmallScreen ? 16 : 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: isSmallScreen ? 12 : 16,
    marginTop: isSmallScreen ? 4 : 8,
  },
  helpCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: isSmallScreen ? 12 : 16,
    marginBottom: isSmallScreen ? 10 : 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
  },
  helpIcon: {
    width: isSmallScreen ? 40 : 48,
    height: isSmallScreen ? 40 : 48,
    borderRadius: isSmallScreen ? 20 : 24,
    backgroundColor: '#F0FDF4',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: isSmallScreen ? 12 : 16,
  },
  helpDetails: {
    flex: 1,
  },
  helpTitle: {
    fontSize: isSmallScreen ? 14 : 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  helpDescription: {
    fontSize: isSmallScreen ? 12 : 14,
    color: '#6B7280',
    lineHeight: isSmallScreen ? 18 : 20,
  },
  emergencyBanner: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEF2F2',
    padding: isSmallScreen ? 12 : 16,
    borderTopWidth: 1,
    borderTopColor: '#FECACA',
    marginTop: 'auto',
  },
  emergencyText: {
    fontSize: isSmallScreen ? 12 : 14,
    color: '#B91C1C',
    textAlign: 'center',
  },
  emergencyNumber: {
    fontSize: isSmallScreen ? 12 : 14,
    color: '#B91C1C',
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
});