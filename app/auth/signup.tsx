import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  Alert, 
  KeyboardAvoidingView, 
  Platform, 
  ScrollView, 
  Image,
  Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useState } from 'react';
import { ArrowLeft, Mail, Lock, Eye, EyeOff, User, Phone } from 'lucide-react-native';
import { supabase } from '../lib/supabase';

const logo = require('../cleanlily.png');

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Responsive scaling
const scale = (size: number) => Math.min((screenWidth / 375) * size, size * 1.3);
const verticalScale = (size: number) => (screenHeight / 812) * size;

export default function SignUp() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSignUp = async () => {
    const { fullName, email, phone, password, confirmPassword } = formData;

    // Client-side validation
    if (!fullName || !email || !phone || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (!email.includes('@')) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    setLoading(true);
    
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            phone,
          },
        },
      });

      if (authError) {
        if (!authError.message.includes('Email confirmation')) {
          throw authError;
        }
      }

      if (authData?.user) {
        // Check if this email should be an admin (you can define admin emails in environment variables)
        const adminEmails = ['admin@cleanlily.com', 'owner@cleanlily.com']; // Add your admin emails here
        const role = adminEmails.includes(email.toLowerCase()) ? 'admin' : 'client';

        const { error: profileError } = await supabase
          .from('profiles')
          .insert([{
            id: authData.user.id,
            email,
            full_name: fullName,
            phone,
            role: role,
          }]);

        if (profileError && !profileError.message.includes('duplicate key')) {
          throw profileError;
        }

        Alert.alert(
          'Success',
          'Account created! Please check your email for verification.',
          [{ text: 'OK', onPress: () => router.push('/auth/signin') }]
        );
      }
    } catch (error) {
      if (error instanceof Error && 
          !error.message.includes('JWT expired') &&
          !error.message.includes('duplicate key') &&
          !error.message.includes('already registered')) {
        Alert.alert('Error', error.message || 'Failed to create account');
      } else {
        Alert.alert(
          'Success',
          'Account created! Please check your email for verification.',
          [{ text: 'OK', onPress: () => router.push('/auth/signin') }]
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient 
      colors={['#ECFDF5', '#D1FAE5']} 
      style={styles.gradient}
    >
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity 
                onPress={() => router.back()} 
                style={styles.backButton}
              >
                <ArrowLeft size={scale(22)} color="#059669" />
              </TouchableOpacity>
            </View>

            {/* Main Content */}
            <View style={styles.mainContent}>
              
              {/* Logo Section */}
              <View style={styles.logoSection}>
                <Image 
                  source={logo} 
                  style={styles.logo} 
                  resizeMode="contain"
                />
                <Text style={styles.title}>Create Account</Text>
                <Text style={styles.subtitle}>Join Cleanlily Cleaners for professional cleaning services</Text>
              </View>

              {/* Form Section */}
              <View style={styles.formSection}>
                
                {/* Full Name */}
                <View style={styles.fieldContainer}>
                  <Text style={styles.fieldLabel}>Full Name</Text>
                  <View style={styles.inputContainer}>
                    <User size={scale(20)} color="#6B7280" />
                    <TextInput
                      style={styles.input}
                      placeholder="Enter your full name"
                      value={formData.fullName}
                      onChangeText={(value) => handleInputChange('fullName', value)}
                      autoCapitalize="words"
                    />
                  </View>
                </View>

                {/* Email */}
                <View style={styles.fieldContainer}>
                  <Text style={styles.fieldLabel}>Email</Text>
                  <View style={styles.inputContainer}>
                    <Mail size={scale(20)} color="#6B7280" />
                    <TextInput
                      style={styles.input}
                      placeholder="Enter your email"
                      value={formData.email}
                      onChangeText={(value) => handleInputChange('email', value)}
                      keyboardType="email-address"
                      autoCapitalize="none"
                    />
                  </View>
                </View>

                {/* Phone */}
                <View style={styles.fieldContainer}>
                  <Text style={styles.fieldLabel}>Phone Number</Text>
                  <View style={styles.inputContainer}>
                    <Phone size={scale(20)} color="#6B7280" />
                    <TextInput
                      style={styles.input}
                      placeholder="Enter your phone number"
                      value={formData.phone}
                      onChangeText={(value) => handleInputChange('phone', value)}
                      keyboardType="phone-pad"
                    />
                  </View>
                </View>

                {/* Password */}
                <View style={styles.fieldContainer}>
                  <Text style={styles.fieldLabel}>Password</Text>
                  <View style={styles.inputContainer}>
                    <Lock size={scale(20)} color="#6B7280" />
                    <TextInput
                      style={styles.input}
                      placeholder="Create a password"
                      value={formData.password}
                      onChangeText={(value) => handleInputChange('password', value)}
                      secureTextEntry={!showPassword}
                      autoCapitalize="none"
                    />
                    <TouchableOpacity
                      onPress={() => setShowPassword(!showPassword)}
                      style={styles.eyeButton}
                    >
                      {showPassword ? 
                        <EyeOff size={scale(20)} color="#6B7280" /> : 
                        <Eye size={scale(20)} color="#6B7280" />
                      }
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Confirm Password */}
                <View style={styles.fieldContainer}>
                  <Text style={styles.fieldLabel}>Confirm Password</Text>
                  <View style={styles.inputContainer}>
                    <Lock size={scale(20)} color="#6B7280" />
                    <TextInput
                      style={styles.input}
                      placeholder="Confirm your password"
                      value={formData.confirmPassword}
                      onChangeText={(value) => handleInputChange('confirmPassword', value)}
                      secureTextEntry={!showConfirmPassword}
                      autoCapitalize="none"
                    />
                    <TouchableOpacity
                      onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                      style={styles.eyeButton}
                    >
                      {showConfirmPassword ? 
                        <EyeOff size={scale(20)} color="#6B7280" /> : 
                        <Eye size={scale(20)} color="#6B7280" />
                      }
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Password Hint */}
                <Text style={styles.passwordHint}>
                  Password must be at least 6 characters
                </Text>

              </View>

              {/* Terms */}
              <Text style={styles.termsText}>
                By creating an account, you agree to our{' '}
                <Text style={styles.termsLink}>Terms</Text> and{' '}
                <Text style={styles.termsLink}>Privacy Policy</Text>
              </Text>

              {/* Sign Up Button */}
              <TouchableOpacity
                style={[styles.signUpButton, loading && styles.buttonDisabled]}
                onPress={handleSignUp}
                disabled={loading}
              >
                <Text style={styles.signUpText}>
                  {loading ? 'Creating Account...' : 'Create Account'}
                </Text>
              </TouchableOpacity>

              {/* Footer */}
              <View style={styles.footer}>
                <Text style={styles.footerText}>Already have an account? </Text>
                <TouchableOpacity onPress={() => router.push('/auth/signin')}>
                  <Text style={styles.signInText}>Sign In</Text>
                </TouchableOpacity>
              </View>

            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    paddingHorizontal: scale(20),
    paddingTop: scale(10),
  },
  backButton: {
    width: scale(44),
    height: scale(44),
    borderRadius: scale(22),
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  mainContent: {
    flex: 1,
    paddingHorizontal: scale(24),
    justifyContent: 'space-between',
    paddingBottom: verticalScale(40),
  },
  logoSection: {
    alignItems: 'center',
    marginTop: verticalScale(20),
    marginBottom: verticalScale(40),
  },
  logo: {
    width: scale(120),
    height: scale(50),
    marginBottom: verticalScale(24),
  },
  title: {
    fontSize: scale(28),
    fontWeight: '800',
    color: '#065F46',
    marginBottom: scale(8),
    textAlign: 'center',
  },
  subtitle: {
    fontSize: scale(16),
    color: '#047857',
    textAlign: 'center',
    lineHeight: scale(22),
  },
  formSection: {
    width: '100%',
    marginBottom: verticalScale(20),
  },
  fieldContainer: {
    marginBottom: scale(20),
  },
  fieldLabel: {
    fontSize: scale(14),
    fontWeight: '600',
    color: '#374151',
    marginBottom: scale(8),
    marginLeft: scale(4),
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: scale(12),
    paddingHorizontal: scale(16),
    paddingVertical: scale(16),
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  input: {
    flex: 1,
    fontSize: scale(16),
    color: '#1F2937',
    marginLeft: scale(12),
    marginRight: scale(8),
  },
  eyeButton: {
    padding: scale(4),
  },
  passwordHint: {
    fontSize: scale(12),
    color: '#6B7280',
    textAlign: 'center',
    marginTop: scale(-8),
    marginBottom: scale(8),
  },
  termsText: {
    fontSize: scale(14),
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: verticalScale(24),
    lineHeight: scale(20),
  },
  termsLink: {
    color: '#059669',
    fontWeight: '600',
  },
  signUpButton: {
    backgroundColor: '#065F46',
    paddingVertical: scale(16),
    borderRadius: scale(12),
    alignItems: 'center',
    width: '100%',
    marginBottom: verticalScale(24),
    shadowColor: '#065F46',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  signUpText: {
    fontSize: scale(16),
    fontWeight: '700',
    color: '#FFFFFF',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    fontSize: scale(14),
    color: '#374151',
  },
  signInText: {
    fontSize: scale(14),
    color: '#065F46',
    fontWeight: '700',
    marginLeft: scale(4),
  },
});
