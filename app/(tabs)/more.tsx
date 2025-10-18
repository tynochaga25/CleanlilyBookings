import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,  
  ActivityIndicator,
  ScrollView,
  Image,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Mail, Lock, User, Shield, Home, Eye, EyeOff } from 'lucide-react-native';
import { createClient } from '@supabase/supabase-js';
import { createStackNavigator } from '@react-navigation/stack';

// Import components from components folder
import AdminScreen from '../components/admin';
import ClientScreen from '../components/ClientScreen';
import MyBookingsScreen from '../components/MyBookingsScreen';

// Initialize Supabase client
const supabase = createClient(
  'https://ryqjkslsgfcycxybdeoj.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ5cWprc2xzZ2ZjeWN4eWJkZW9qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc1MTk5NzMsImV4cCI6MjA3MzA5NTk3M30.G3TTKLpIdBbpcvaO7_SWDuAsvehLI5mT0U85eM5uw50'
);

// Admin email addresses
const ADMIN_EMAILS = [
  'directors@cleanlily.co.zw',
  'tynochagaka@gmail.com',
  'ruthgmudimu@gmail.com',
  'cleanlilyharare@gmail.com'
];

// Create stack navigator
const Stack = createStackNavigator();

function AccessScreen({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [accessType, setAccessType] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  const handleDirectAccess = async (type) => {
    setAccessType(type);
    
    if (type === 'admin') {
      if (!email || !password) {
        Alert.alert('Admin Access', 'Please enter your email and password for admin access');
        return;
      }
      
      if (!ADMIN_EMAILS.includes(email.toLowerCase())) {
        Alert.alert('Access Denied', 'This email does not have admin privileges.');
        return;
      }
      
      await handleSignIn();
    } else {
      if (email) {
        if (ADMIN_EMAILS.includes(email.toLowerCase())) {
          Alert.alert(
            'Admin Account', 
            'This email is registered as an administrator. Would you like to access the admin dashboard instead?',
            [
              { text: 'No, continue as client', onPress: () => handleClientAccess() },
              { text: 'Yes, go to admin', onPress: () => setAccessType('admin') }
            ]
          );
          return;
        }
        await handleClientAccess();
      } else {
        handleClientAccess();
      }
    }
  };

  const handleClientAccess = async () => {
    setLoading(true);
    
    try {
      if (email && password) {
        await handleSignIn();
        return;
      }
      
      onLoginSuccess({
        id: 'guest-client',
        email: email || 'guest@cleanlily.com',
        isAdmin: false,
        profile: {
          id: 'guest-client',
          email: email || 'guest@cleanlily.com',
          full_name: 'Guest Client',
          role: 'client'
        }
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to access client dashboard');
      console.error('Client access error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (error) throw error;

      if (data.user) {
        const isAdmin = ADMIN_EMAILS.includes(data.user.email);
        const profile = await getUserProfile(data.user.id);
        
        if (!profile) {
          await createUserProfile(data.user.id, data.user.email, data.user.email);
        }
        
        onLoginSuccess({
          id: data.user.id,
          email: data.user.email,
          isAdmin: isAdmin,
          profile: profile
        });
      }
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const getUserProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error && error.code !== 'PGRST116') {
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  };

  const createUserProfile = async (userId, userEmail, userName) => {
    try {
      const isAdmin = ADMIN_EMAILS.includes(userEmail);
      
      const { data, error } = await supabase
        .from('profiles')
        .insert([
          {
            id: userId,
            email: userEmail,
            full_name: userName,
            role: isAdmin ? 'admin' : 'client'
          }
        ])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating user profile:', error);
      throw error;
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header with Logo */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <View style={styles.logoBackground}>
              <Image 
                source={{ 
                  uri: 'https://cleanlily.co.zw/wp-content/uploads/2024/04/Cleanlily-Cleaners-logo-png.png' 
                }}
                style={styles.logoImage}
              />
            </View>
            <Text style={styles.headerTitle}>Cleanlily Cleaners</Text>
            <Text style={styles.headerSubtitle}>Professional Cleaning Services</Text>
          </View>
        </View>

        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeTitle}>Welcome Back!</Text>
          <Text style={styles.welcomeSubtitle}>
            Access your dashboard to manage bookings and services
          </Text>
        </View>

        {/* Login Form */}
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Enter Your Details</Text>
          
          <View style={styles.inputContainer}>
            <Mail size={22} color="#10B981" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Email Address (Optional)"
              placeholderTextColor="#9CA3AF"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>

          <View style={styles.inputContainer}>
            <Lock size={22} color="#10B981" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Password (Optional)"
              placeholderTextColor="#9CA3AF"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity 
              onPress={() => setShowPassword(!showPassword)}
              style={styles.eyeIcon}
            >
              {showPassword ? <EyeOff size={20} color="#6B7280" /> : <Eye size={20} color="#6B7280" />}
            </TouchableOpacity>
          </View>

          <Text style={styles.noteText}>
            💡 Email and password are required for admin access. Clients can proceed with or without credentials.
          </Text>
        </View>

        {/* Access Options */}
        <View style={styles.accessOptions}>
          <Text style={styles.sectionTitle}>Choose Your Dashboard</Text>
          
          <TouchableOpacity 
            style={[styles.accessButton, styles.clientButton]}
            onPress={() => handleDirectAccess('client')}
            disabled={loading}
          >
            <View style={styles.buttonContent}>
              <View style={styles.buttonIconContainer}>
                <User size={24} color="white" />
              </View>
              <View style={styles.buttonTextContainer}>
                <Text style={styles.accessButtonText}>Client Dashboard</Text>
                <Text style={styles.accessButtonSubtext}>Book & manage your services</Text>
              </View>
            </View>
            {loading && accessType === 'client' && (
              <ActivityIndicator color="white" size="small" />
            )}
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.accessButton, styles.adminButton]}
            onPress={() => handleDirectAccess('admin')}
            disabled={loading}
          >
            <View style={styles.buttonContent}>
              <View style={styles.buttonIconContainer}>
                <Shield size={24} color="white" />
              </View>
              <View style={styles.buttonTextContainer}>
                <Text style={styles.accessButtonText}>Admin Dashboard</Text>
                <Text style={styles.accessButtonSubtext}>Manage bookings & staff</Text>
              </View>
            </View>
            {loading && accessType === 'admin' && (
              <ActivityIndicator color="white" size="small" />
            )}
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            🔒 Secure access • By continuing, you agree to our Terms of Service
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

export default function MainApp() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const isAdmin = ADMIN_EMAILS.includes(session.user.email);
        const profile = await getUserProfile(session.user.id);
        
        setUser({
          id: session.user.id,
          email: session.user.email,
          isAdmin: isAdmin,
          profile: profile
        });
      }
    } catch (error) {
      console.error('Error checking auth state:', error);
    } finally {
      setLoading(false);
    }
  };

  const getUserProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error && error.code !== 'PGRST116') {
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  };

  const handleLoginSuccess = (userData) => {
    setUser(userData);
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <View style={styles.loadingLogo}>
          <Image 
            source={{ 
              uri: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80' 
            }}
            style={styles.logoImage}
          />
        </View>
        <ActivityIndicator size="large" color="#10B981" />
        <Text style={styles.loadingText}>Loading Cleanlily Services...</Text>
      </View>
    );
  }

  if (!user) {
    return <AccessScreen onLoginSuccess={handleLoginSuccess} />;
  }

  if (user.isAdmin) {
    return <AdminScreen user={user} onLogout={handleLogout} />;
  } else {
    return <ClientScreen user={user} onLogout={handleLogout} />;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
    paddingTop: 60,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  loadingLogo: {
    marginBottom: 30,
  },
  loadingText: {
    marginTop: 20,
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoContainer: {
    alignItems: 'center',
  },
  logoBackground: {
    backgroundColor: '#10B981',
    padding: 16,
    borderRadius: 20,
    marginBottom: 16,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 10,
  },
  logoImage: {
    width: 120,
    height: 60,
    borderRadius: 12,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },
  welcomeSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
  },
  formSection: {
    marginBottom: 32,
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    marginBottom: 16,
    paddingHorizontal: 16,
    height: 56,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
  },
  eyeIcon: {
    padding: 4,
  },
  noteText: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 18,
    fontStyle: 'italic',
  },
  accessOptions: {
    marginBottom: 24,
  },
  accessButton: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  clientButton: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  adminButton: {
    backgroundColor: '#6366F1',
    borderColor: '#6366F1',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  buttonIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  buttonTextContainer: {
    flex: 1,
  },
  accessButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  accessButtonSubtext: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
  },
  footer: {
    alignItems: 'center',
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  footerText: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 16,
  },
});