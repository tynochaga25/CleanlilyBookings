import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  Alert, 
  KeyboardAvoidingView, 
  Platform, 
  Image,
  Dimensions,
  ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useState } from 'react';
import { ArrowLeft, Mail, Lock, Eye, EyeOff } from 'lucide-react-native';
import { supabase } from '../lib/supabase';

const logo = require('../cleanlily.png');

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Responsive scaling
const scale = (size: number) => Math.min((screenWidth / 375) * size, size * 1.3);
const verticalScale = (size: number) => (screenHeight / 812) * size;

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    if (!email.includes('@')) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw new Error(error.message);

      if (data?.user) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user?.email_confirmed_at) {
          await supabase.auth.signOut();
          Alert.alert('Verify Email', 'Check your inbox to confirm your account');
          return;
        }
        router.replace('/(tabs)');
      }
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to sign in');
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
          style={styles.keyboardAvoid}
        >
          <ScrollView 
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            
            {/* Header with Back Button */}
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
                <Image source={logo} style={styles.logo} />
                <Text style={styles.title}>Welcome Back</Text>
                <Text style={styles.subtitle}>Sign in to continue</Text>
              </View>

              {/* Form Section */}
              <View style={styles.formSection}>
                
                {/* Email Field */}
                <View style={styles.fieldContainer}>
                  <Text style={styles.fieldLabel}>Email</Text>
                  <View style={styles.inputContainer}>
                    <Mail size={scale(20)} color="#6B7280" />
                    <TextInput
                      style={styles.input}
                      placeholder="Enter your email"
                      value={email}
                      onChangeText={setEmail}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoComplete="email"
                    />
                  </View>
                </View>

                {/* Password Field */}
                <View style={styles.fieldContainer}>
                  <Text style={styles.fieldLabel}>Password</Text>
                  <View style={styles.inputContainer}>
                    <Lock size={scale(20)} color="#6B7280" />
                    <TextInput
                      style={styles.input}
                      placeholder="Enter your password"
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry={!showPassword}
                      autoCapitalize="none"
                      autoComplete="password"
                    />
                    <TouchableOpacity 
                      onPress={() => setShowPassword(!showPassword)}
                      style={styles.eyeButton}
                    >
                      {showPassword ? (
                        <EyeOff size={scale(20)} color="#6B7280" />
                      ) : (
                        <Eye size={scale(20)} color="#6B7280" />
                      )}
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Forgot Password */}
                <TouchableOpacity 
                  onPress={() => router.push('/auth/forgot-password')}
                  style={styles.forgotPassword}
                >
                  <Text style={styles.forgotText}>Forgot Password?</Text>
                </TouchableOpacity>

                {/* Sign In Button */}
                <TouchableOpacity 
                  style={[styles.signInButton, loading && styles.buttonDisabled]}
                  onPress={handleSignIn}
                  disabled={loading}
                >
                  <Text style={styles.signInText}>
                    {loading ? 'Signing In...' : 'Sign In'}
                  </Text>
                </TouchableOpacity>

              </View>

              {/* Footer */}
              <View style={styles.footer}>
                <Text style={styles.footerText}>Don't have an account? </Text>
                <TouchableOpacity onPress={() => router.push('/auth/signup')}>
                  <Text style={styles.signUpText}>Sign Up</Text>
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
  keyboardAvoid: {
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
  },
  formSection: {
    width: '100%',
    marginBottom: verticalScale(30),
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
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: scale(24),
  },
  forgotText: {
    fontSize: scale(14),
    color: '#059669',
    fontWeight: '600',
  },
  signInButton: {
    backgroundColor: '#065F46',
    paddingVertical: scale(16),
    borderRadius: scale(12),
    alignItems: 'center',
    shadowColor: '#065F46',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  signInText: {
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
  signUpText: {
    fontSize: scale(14),
    color: '#065F46',
    fontWeight: '700',
    marginLeft: scale(4),
  },
});
