import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
  ActivityIndicator,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  Linking,
} from 'react-native';
import {
  X, Calendar, Clock, MapPin, CreditCard, User, Mail, Phone, AlertCircle,
  Info, CheckCircle, Shield, Clock as ClockIcon, Home, Star, ChevronRight
} from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { supabase } from '../lib/supabase';

const { width } = Dimensions.get('window');

interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number;
  category: string;
}

interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  phone: string;
}

interface BookingModalProps {
  service: Service;
  onClose: () => void;
  onSuccess: () => void;
}

const timeSlots = [
  '08:00:00', '14:00:00'
];

// Service-specific guidelines
const SERVICE_GUIDELINES = {
  general: {
    title: "Booking Process",
    steps: [
      "Select your preferred date and time",
      "Provide your service address",
      "Review and confirm your booking",
      "You'll receive a confirmation email",
      "Our team will contact you within 24 hours"
    ]
  },
  cleaning: {
    title: "Cleaning Service Guidelines",
    instructions: [
      "Please ensure access to water and electricity",
      "Clear small items and clutter before our arrival",
      "Pets should be secured during cleaning",
      "Special areas of focus can be specified in instructions",
      "We bring our own eco-friendly cleaning supplies"
    ],
    preparation: [
      "No need to move furniture - we'll handle it carefully",
      "Secure valuable items for safety",
      "Let us know about any special surfaces or materials"
    ]
  },
  deep_cleaning: {
    title: "Deep Cleaning Guidelines",
    instructions: [
      "This service takes longer than regular cleaning",
      "We recommend being present for the first 15 minutes",
      "We'll clean hard-to-reach areas and appliances",
      "Includes interior window cleaning and sanitization"
    ],
    preparation: [
      "Please remove breakable items from surfaces",
      "Let us know about any allergy concerns",
      "We'll need access to all rooms being cleaned"
    ]
  },
  commercial: {
    title: "Commercial Cleaning Guidelines",
    instructions: [
      "Available after business hours or weekends",
      "We work around your business schedule",
      "Specialized equipment for large spaces",
      "Customizable cleaning checklist available"
    ],
    preparation: [
      "Provide after-hours access instructions",
      "Identify any restricted areas",
      "Specify priority areas for cleaning"
    ]
  }
};

// Web-compatible Date Picker Component - ENHANCED VERSION
const WebDatePicker = ({
  value,
  onChange,
  minimumDate
}: {
  value: Date;
  onChange: (date: Date) => void;
  minimumDate: Date;
}) => {
  const formatDateForInput = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = new Date(event.target.value);
    onChange(newDate);
  };

  const getMinDate = () => {
    return formatDateForInput(minimumDate);
  };

  const formatDisplayDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <View style={styles.webDatePickerContainer}>
      <View style={styles.datePickerWrapper}>
        <View style={styles.dateIconContainer}>
          <Calendar size={24} color="#10B981" />
        </View>
        <View style={styles.dateInputWrapper}>
          <Text style={styles.dateLabel}>Selected Date</Text>
          <input
            type="date"
            value={formatDateForInput(value)}
            min={getMinDate()}
            onChange={handleDateChange}
            style={{
              width: '100%',
              padding: '16px 18px',
              border: 'none',
              borderRadius: '0',
              fontSize: '17px',
              backgroundColor: 'transparent',
              color: '#111827',
              outline: 'none',
              cursor: 'pointer',
              fontWeight: '600',
            }}
          />
        </View>
      </View>
      <View style={styles.selectedDateDisplay}>
        <View style={styles.selectedDateIcon}>
          <CheckCircle size={20} color="white" />
        </View>
        <Text style={styles.selectedDateText}>{formatDisplayDate(value)}</Text>
      </View>
    </View>
  );
};

// Utility function to check for time conflicts
const checkForConflicts = async (serviceId: string, date: string, startTime: string, duration: number): Promise<boolean> => {
  try {
    const startDateTime = new Date(`${date}T${startTime}`);
    const endDateTime = new Date(startDateTime.getTime() + duration * 60000);

    const { data: existingBookings, error } = await supabase
      .from('bookings')
      .select(`
        scheduled_date,
        scheduled_time,
        services (duration)
      `)
      .eq('scheduled_date', date)
      .neq('status', 'cancelled')
      .or(`service_id.eq.${serviceId},service_id.is.null`);

    if (error) throw error;

    const conflicts = existingBookings.filter(booking => {
      const bookingStart = new Date(`${booking.scheduled_date}T${booking.scheduled_time}`);
      const bookingEnd = new Date(bookingStart.getTime() + booking.services.duration * 60000);

      return (
        (startDateTime >= bookingStart && startDateTime < bookingEnd) ||
        (endDateTime > bookingStart && endDateTime <= bookingEnd) ||
        (startDateTime <= bookingStart && endDateTime >= bookingEnd)
      );
    });

    return conflicts.length > 0;
  } catch (error) {
    console.error('Error checking for conflicts:', error);
    return true;
  }
};

// Function to find available time slots
const findAvailableSlots = async (serviceId: string, date: string, duration: number): Promise<string[]> => {
  try {
    const { data: existingBookings, error } = await supabase
      .from('bookings')
      .select(`
        scheduled_time,
        services (duration)
      `)
      .eq('scheduled_date', date)
      .neq('status', 'cancelled')
      .order('scheduled_time', { ascending: true });

    if (error) throw error;

    const availableSlots = [];
    const occupiedSlots = existingBookings.map(booking => {
      const startTime = new Date(`2000-01-01T${booking.scheduled_time}`);
      const endTime = new Date(startTime.getTime() + booking.services.duration * 60000);
      return {
        start: booking.scheduled_time,
        end: endTime.toTimeString().split(' ')[0]
      };
    });

    for (let i = 0; i < timeSlots.length; i++) {
      const slotStart = timeSlots[i];
      const slotStartTime = new Date(`2000-01-01T${slotStart}`);
      const slotEndTime = new Date(slotStartTime.getTime() + duration * 60000);
      const slotEnd = slotEndTime.toTimeString().split(' ')[0];

      let hasConflict = false;

      for (const occupied of occupiedSlots) {
        const occupiedStart = new Date(`2000-01-01T${occupied.start}`);
        const occupiedEnd = new Date(`2000-01-01T${occupied.end}`);

        if (
          (slotStartTime >= occupiedStart && slotStartTime < occupiedEnd) ||
          (slotEndTime > occupiedStart && slotEndTime <= occupiedEnd) ||
          (slotStartTime <= occupiedStart && slotEndTime >= occupiedEnd)
        ) {
          hasConflict = true;
          break;
        }
      }

      if (!hasConflict) {
        availableSlots.push(slotStart);
      }
    }

    return availableSlots;
  } catch (error) {
    console.error('Error finding available slots:', error);
    return timeSlots;
  }
};

// Function to send email notification
const sendBookingEmail = async (
  service: Service,
  bookingData: any,
  userProfile: UserProfile | null
) => {
  try {
    const formattedDate = bookingData.scheduled_date
      ? new Date(bookingData.scheduled_date).toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
      : 'Not selected';

    const formatTime = (time: string) => {
      const [hours, minutes] = time.split(':');
      const hour = parseInt(hours);
      return hour > 12 ? `${hour - 12}:${minutes} PM` : `${hour}:${minutes} AM`;
    };

    const formattedTime = bookingData.scheduled_time
      ? formatTime(bookingData.scheduled_time)
      : 'Not selected';

    const emailSubject = `Booking Request: ${service.name} on ${formattedDate}`;

    const emailBody = `
Dear Cleanlily Team,

I would like to book the following service:

SERVICE DETAILS:
- Service: ${service.name}
- Description: ${service.description}
- Duration: ${service.duration} hours
- Price: $${service.price}

PREFERRED DATE & TIME:
- Date: ${formattedDate}
- Time: ${formattedTime}

MY LOCATION:
- Address: ${bookingData.address || 'Not provided'}

SPECIAL INSTRUCTIONS:
${bookingData.special_instructions || 'None'}

PLEASE CONTACT ME AT:
- Name: ${userProfile?.full_name || 'Not provided'}
- Email: ${userProfile?.email || 'Not provided'}
- Phone: ${userProfile?.phone || 'Not provided'}

Please confirm this booking at your earliest convenience.

Thank you,
${userProfile?.full_name || 'Client'}
    `.trim();

    const clientEmail = userProfile?.email || 'client@example.com';
    const mailtoLink = `mailto:cleanlilyharare@gmail.com?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}&cc=${encodeURIComponent(clientEmail)}`;

    const canOpen = await Linking.canOpenURL(mailtoLink);
    if (canOpen) {
      await Linking.openURL(mailtoLink);
      return true;
    } else {
      Alert.alert(
        'Email Ready',
        'Please copy the booking details and send them to cleanlilyharare@gmail.com',
        [
          {
            text: 'Copy Details',
            onPress: () => {
              console.log('Email content:', emailBody);
            }
          },
          { text: 'OK' }
        ]
      );
      return false;
    }
  } catch (error) {
    console.error('Failed to send email:', error);
    return false;
  }
};

// Component for displaying booking guidelines
const BookingGuidelines = ({ service, currentStep }: { service: Service; currentStep: number }) => {
  const getServiceCategory = () => {
    if (service.name.toLowerCase().includes('deep')) return 'deep_cleaning';
    if (service.name.toLowerCase().includes('commercial')) return 'commercial';
    return 'cleaning';
  };

  const category = getServiceCategory();
  const guidelines = SERVICE_GUIDELINES[category as keyof typeof SERVICE_GUIDELINES];

  const getStepInstructions = () => {
    switch (currentStep) {
      case 1:
        return {
          title: "📅 Date & Time Selection",
          instructions: [
            "Choose your preferred date and time slot",
            "Green slots are available, gray are booked",
            "We recommend booking at least 24 hours in advance",
            "Emergency same-day bookings: Contact us directly"
          ]
        };
      case 2:
        return {
          title: "📍 Location Details",
          instructions: [
            "Provide complete address with landmarks",
            "Include apartment number and access codes",
            "Specify parking instructions if needed",
            "Mention any special access requirements"
          ]
        };
      case 3:
        return {
          title: "✅ Final Confirmation",
          instructions: [
            "Review all details carefully",
            "Ensure your contact information is correct",
            "You'll receive a confirmation email",
            "Our team will call to confirm within 24 hours"
          ]
        };
      default:
        return { title: "", instructions: [] };
    }
  };

  const stepInstructions = getStepInstructions();

  return (
    <View style={styles.guidelinesContainer}>
      <View style={styles.guidelinesHeader}>
        <View style={styles.guidelinesIcon}>
          <Info size={20} color="#FFFFFF" />
        </View>
        <Text style={styles.guidelinesTitle}>Important Information</Text>
      </View>

      {/* Step-specific instructions */}
      <View style={styles.stepInstructions}>
        <Text style={styles.stepInstructionsTitle}>{stepInstructions.title}</Text>
        {stepInstructions.instructions.map((instruction, index) => (
          <View key={index} style={styles.instructionItem}>
            <View style={styles.checkIcon}>
              <CheckCircle size={16} color="#10B981" />
            </View>
            <Text style={styles.instructionText}>{instruction}</Text>
          </View>
        ))}
      </View>

      {/* Service-specific guidelines */}
      <View style={styles.serviceGuidelines}>
        <Text style={styles.guidelinesSubtitle}>{guidelines.title}</Text>
        <View style={styles.guidelinesSection}>
          <Text style={styles.sectionLabel}>What to expect:</Text>
          {guidelines.instructions.map((instruction, index) => (
            <View key={index} style={styles.guidelineItem}>
              <View style={styles.guidelineIcon}>
                <Home size={14} color="#6B7280" />
              </View>
              <Text style={styles.guidelineText}>{instruction}</Text>
            </View>
          ))}
        </View>

        <View style={styles.guidelinesSection}>
          <Text style={styles.sectionLabel}>Preparation tips:</Text>
          {guidelines.preparation.map((tip, index) => (
            <View key={index} style={styles.guidelineItem}>
              <View style={styles.guidelineIcon}>
                <Star size={14} color="#6B7280" />
              </View>
              <Text style={styles.guidelineText}>{tip}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Contact information */}
      <View style={styles.contactInfo}>
        <View style={styles.contactHeader}>
          <View style={styles.contactIcon}>
            <Shield size={18} color="#FFFFFF" />
          </View>
          <Text style={styles.contactTitle}>Need Help?</Text>
        </View>
        <Text style={styles.contactText}>
          Contact us at:{'\n'}
          📞 +263242 332317/75{'\n'}
          📧 cleanlilyharare@gmail.com{'\n'}
          💬 WhatsApp available
        </Text>
      </View>
    </View>
  );
};

export default function BookingModal({ service, onClose, onSuccess }: BookingModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [hasConflict, setHasConflict] = useState(false);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [showGuidelines, setShowGuidelines] = useState(true);

  const [bookingData, setBookingData] = useState({
    scheduled_date: '',
    scheduled_time: '',
    address: '',
    special_instructions: '',
  });

  useEffect(() => {
    fetchUserProfile();
  }, []);

  useEffect(() => {
    if (bookingData.scheduled_date) {
      checkAvailability();
    }
  }, [bookingData.scheduled_date, service.id]);

  const fetchUserProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      setUserProfile(profile);
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const checkAvailability = async () => {
    setCheckingAvailability(true);
    const slots = await findAvailableSlots(service.id, bookingData.scheduled_date, service.duration);
    setAvailableSlots(slots);
    setCheckingAvailability(false);

    if (bookingData.scheduled_time && !slots.includes(bookingData.scheduled_time)) {
      setHasConflict(true);
    } else {
      setHasConflict(false);
    }
  };

  const handleDateChange = (event: any, date?: Date) => {
    // For web, we handle this differently
    if (Platform.OS === 'web') {
      return; // Web date picker handles this directly
    }

    setShowDatePicker(false);
    if (date) {
      setSelectedDate(date);
      const formattedDate = date.toISOString().split('T')[0];
      setBookingData({ ...bookingData, scheduled_date: formattedDate, scheduled_time: '' });
      setHasConflict(false);
    }
  };

  // New function to handle web date selection
  const handleWebDateChange = (date: Date) => {
    setSelectedDate(date);
    const formattedDate = date.toISOString().split('T')[0];
    setBookingData({ ...bookingData, scheduled_date: formattedDate, scheduled_time: '' });
    setHasConflict(false);
  };

  const handleTimeSelect = async (time: string) => {
    setBookingData({ ...bookingData, scheduled_time: time });

    const conflict = await checkForConflicts(service.id, bookingData.scheduled_date, time, service.duration);
    setHasConflict(conflict);
  };

  const handleNext = () => {
    if (currentStep === 1) {
      if (!bookingData.scheduled_date) {
        Alert.alert('Date Required', 'Please select a date for your cleaning service');
        return;
      }
      if (!bookingData.scheduled_time) {
        Alert.alert('Time Required', 'Please select a time slot for your booking');
        return;
      }
      if (hasConflict) {
        Alert.alert('Time Unavailable', 'The selected time is no longer available. Please choose another time slot from the available options.');
        return;
      }
    }
    if (currentStep === 2 && !bookingData.address) {
      Alert.alert('Address Required', 'Please enter your complete address so we know where to provide the service');
      return;
    }
    setCurrentStep(currentStep + 1);
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleBooking = async () => {
    if (!userProfile) {
      Alert.alert('Profile Required', 'Please complete your profile before booking');
      return;
    }

    const conflict = await checkForConflicts(
      service.id,
      bookingData.scheduled_date,
      bookingData.scheduled_time,
      service.duration
    );

    if (conflict) {
      Alert.alert(
        'Time Slot Taken',
        'This time slot was just booked by another customer. Please select a different time from the available options.',
        [{ text: 'OK' }]
      );
      setCurrentStep(1);
      checkAvailability();
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Please sign in to book a service');

      const { error } = await supabase
        .from('bookings')
        .insert([{
          client_id: user.id,
          service_id: service.id,
          scheduled_date: bookingData.scheduled_date,
          scheduled_time: bookingData.scheduled_time,
          address: bookingData.address,
          special_instructions: bookingData.special_instructions,
          total_price: service.price,
          status: 'pending',
        }]);

      if (error) throw error;

      await sendBookingEmail(service, bookingData, userProfile);

      Alert.alert(
        'Booking Confirmed! 🎉',
        `Thank you for booking ${service.name}!

• We've sent a confirmation email
• Our team will contact you within 24 hours
• Please keep your phone accessible

We look forward to serving you!`,
        [
          {
            text: 'Great!',
            onPress: () => onSuccess()
          }
        ]
      );
    } catch (error: any) {
      console.error('Booking error:', error);
      Alert.alert(
        'Booking Failed',
        error.message || 'Failed to create booking. Please check your connection and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    return hour > 12 ? `${hour - 12}:${minutes} PM` : `${hour}:${minutes} AM`;
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const renderDatePicker = () => {
    if (Platform.OS === 'web') {
      return (
        <WebDatePicker
          value={selectedDate}
          onChange={handleWebDateChange}
          minimumDate={new Date()}
        />
      );
    }

    return (
      <View style={styles.datePickerContainer}>
        <TouchableOpacity
          style={styles.dateInput}
          onPress={() => setShowDatePicker(true)}
        >
          <Text style={bookingData.scheduled_date ? styles.inputText : styles.placeholderText}>
            {bookingData.scheduled_date ? formatDate(bookingData.scheduled_date) : 'Tap to select date'}
          </Text>
          <ChevronRight size={20} color="#9CA3AF" />
        </TouchableOpacity>

        {showDatePicker && (
          <DateTimePicker
            value={selectedDate}
            mode="date"
            display="default"
            onChange={handleDateChange}
            minimumDate={new Date()}
          />
        )}
      </View>
    );
  };

  const renderTimeSlots = () => {
    if (checkingAvailability) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#10B981" />
          <Text style={styles.loadingText}>Checking available time slots...</Text>
        </View>
      );
    }

    return (
      <View style={styles.timeSlots}>
        {timeSlots.map((time) => {
          const isAvailable = availableSlots.includes(time);
          const isSelected = bookingData.scheduled_time === time;
          const isConflict = !isAvailable && isSelected;

          return (
            <TouchableOpacity
              key={time}
              style={[
                styles.timeSlot,
                isAvailable && styles.timeSlotAvailable,
                !isAvailable && styles.timeSlotBooked,
                isSelected && styles.timeSlotSelected,
                isConflict && styles.timeSlotConflict,
              ]}
              onPress={() => isAvailable && handleTimeSelect(time)}
              disabled={!isAvailable}
            >
              <Text
                style={[
                  styles.timeSlotText,
                  isAvailable && styles.timeSlotTextAvailable,
                  !isAvailable && styles.timeSlotTextBooked,
                  isSelected && styles.timeSlotTextSelected,
                ]}
              >
                {formatTime(time)}
              </Text>
              {!isAvailable && (
                <View style={styles.bookedBadge}>
                  <Text style={styles.bookedText}>Booked</Text>
                </View>
              )}
              {isAvailable && isSelected && (
                <View style={styles.selectedBadge}>
                  <Text style={styles.selectedText}>Selected</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  const renderStep1 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Select Date & Time</Text>
      <Text style={styles.stepSubtitle}>Choose when you'd like us to clean</Text>

      <View style={styles.dateTimeContainer}>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>
            <Calendar size={18} color="#4B5563" /> Preferred Date
          </Text>
          {renderDatePicker()}
        </View>

        <Text style={styles.timeSlotsLabel}>
          <Clock size={18} color="#4B5563" /> Available Time Slots
        </Text>

        {hasConflict && bookingData.scheduled_time && (
          <View style={styles.conflictAlert}>
            <AlertCircle size={20} color="#EF4444" />
            <View style={styles.conflictAlertContent}>
              <Text style={styles.conflictAlertTitle}>Time Slot Unavailable</Text>
              <Text style={styles.conflictAlertText}>
                The selected time has been booked by another customer
              </Text>
              {availableSlots.length > 0 && (
                <View style={styles.suggestionContainer}>
                  <Text style={styles.suggestionTitle}>Available times for your date:</Text>
                  <View style={styles.suggestionList}>
                    {availableSlots.slice(0, 4).map((time) => (
                      <TouchableOpacity
                        key={time}
                        style={styles.suggestionChip}
                        onPress={() => handleTimeSelect(time)}
                      >
                        <Text style={styles.suggestionChipText}>{formatTime(time)}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}
            </View>
          </View>
        )}

        {renderTimeSlots()}

        <View style={styles.availabilityLegend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, styles.legendAvailable]} />
            <Text style={styles.legendText}>Available</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, styles.legendBooked]} />
            <Text style={styles.legendText}>Booked</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, styles.legendSelected]} />
            <Text style={styles.legendText}>Selected</Text>
          </View>
        </View>
      </View>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Service Location</Text>
      <Text style={styles.stepSubtitle}>Where should we come to clean?</Text>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>
          <MapPin size={18} color="#4B5563" /> Complete Address
        </Text>
        <TextInput
          style={styles.textArea}
          value={bookingData.address}
          onChangeText={(text) => setBookingData({ ...bookingData, address: text })}
          placeholder="Enter your full address including apartment number, landmarks, and any access instructions..."
          multiline
          numberOfLines={3}
          textAlignVertical="top"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>
          <Info size={18} color="#4B5563" /> Special Instructions
          <Text style={styles.optionalText}> (Optional)</Text>
        </Text>
        <TextInput
          style={styles.textArea}
          value={bookingData.special_instructions}
          onChangeText={(text) => setBookingData({ ...bookingData, special_instructions: text })}
          placeholder="Any specific cleaning instructions, areas to focus on, allergy concerns, or special requirements..."
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />
      </View>
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Review & Confirm</Text>
      <Text style={styles.stepSubtitle}>Please verify your booking details</Text>

      <View style={styles.serviceCard}>
        <View style={styles.serviceHeader}>
          <Text style={styles.serviceName}>{service.name}</Text>
          <Text style={styles.servicePrice}>${service.price}</Text>
        </View>
        <Text style={styles.serviceDescription}>{service.description}</Text>
        <View style={styles.serviceMeta}>
          <View style={styles.serviceDuration}>
            <ClockIcon size={16} color="#6B7280" />
            <Text style={styles.durationText}>{service.duration} hours</Text>
          </View>
        </View>
      </View>

      <View style={styles.bookingSummary}>
        <Text style={styles.summaryTitle}>Booking Summary</Text>

        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Date</Text>
          <Text style={styles.summaryValue}>
            {bookingData.scheduled_date ? formatDate(bookingData.scheduled_date) : 'Not selected'}
          </Text>
        </View>

        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Time</Text>
          <Text style={styles.summaryValue}>
            {bookingData.scheduled_time ? formatTime(bookingData.scheduled_time) : 'Not selected'}
          </Text>
        </View>

        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Address</Text>
          <Text style={styles.summaryValue}>{bookingData.address || 'Not provided'}</Text>
        </View>

        {bookingData.special_instructions && (
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Instructions</Text>
            <Text style={styles.summaryValue}>{bookingData.special_instructions}</Text>
          </View>
        )}

        <View style={styles.summaryDivider} />

        <View style={styles.summaryTotal}>
          <Text style={styles.totalLabel}>Total Amount</Text>
          <Text style={styles.totalAmount}>${service.price}</Text>
        </View>
      </View>

      {userProfile && (
        <View style={styles.userInfoCard}>
          <Text style={styles.sectionTitle}>Your Contact Information</Text>
          <View style={styles.userInfoItem}>
            <User size={18} color="#6B7280" />
            <Text style={styles.userInfoText}>{userProfile.full_name}</Text>
          </View>
          <View style={styles.userInfoItem}>
            <Mail size={18} color="#6B7280" />
            <Text style={styles.userInfoText}>{userProfile.email}</Text>
          </View>
          <View style={styles.userInfoItem}>
            <Phone size={18} color="#6B7280" />
            <Text style={styles.userInfoText}>{userProfile.phone || 'Not provided'}</Text>
          </View>
        </View>
      )}

      <TouchableOpacity
        style={[styles.confirmButton, loading && styles.confirmButtonDisabled]}
        onPress={handleBooking}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <>
            <CreditCard size={20} color="white" />
            <Text style={styles.confirmButtonText}>Confirm & Book Now</Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.modalWrapper}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <View style={styles.headerContent}>
              <Text style={styles.modalTitle}>Book {service.name}</Text>
              <TouchableOpacity
                style={styles.guidelinesToggle}
                onPress={() => setShowGuidelines(!showGuidelines)}
              >
                <Info size={18} color="#10B981" />
                <Text style={styles.guidelinesToggleText}>
                  {showGuidelines ? 'Hide' : 'Show'} Guidelines
                </Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          {/* Body - Scrollable */}
          <ScrollView
            style={styles.modalBody}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ flexGrow: 1, paddingBottom: 120 }}
            keyboardShouldPersistTaps="handled"
          >
            {/* Booking Guidelines */}
            {showGuidelines && (
              <BookingGuidelines service={service} currentStep={currentStep} />
            )}

            {/* Step Indicator */}
            <View style={styles.stepIndicator}>
              {[1, 2, 3].map((step) => (
                <View key={step} style={styles.stepContainer}>
                  <View
                    style={[
                      styles.stepCircle,
                      currentStep >= step && styles.stepCircleActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.stepNumber,
                        currentStep >= step && styles.stepNumberActive,
                      ]}
                    >
                      {step}
                    </Text>
                  </View>
                  {step < 3 && (
                    <View
                      style={[
                        styles.stepLine,
                        currentStep > step && styles.stepLineActive,
                      ]}
                    />
                  )}
                </View>
              ))}
            </View>

            {/* Step Titles */}
            <View style={styles.stepTitles}>
              <Text style={[styles.stepTitleText, currentStep === 1 && styles.stepTitleActive]}>
                Date & Time
              </Text>
              <Text style={[styles.stepTitleText, currentStep === 2 && styles.stepTitleActive]}>
                Location
              </Text>
              <Text style={[styles.stepTitleText, currentStep === 3 && styles.stepTitleActive]}>
                Confirm
              </Text>
            </View>

            {/* Step Content */}
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}
          </ScrollView>

          {/* Footer Navigation */}
          <View style={styles.modalFooter}>
            {currentStep > 1 && (
              <TouchableOpacity style={styles.backButton} onPress={handleBack}>
                <Text style={styles.backButtonText}>Back</Text>
              </TouchableOpacity>
            )}

            {currentStep < 3 && (
              <TouchableOpacity
                style={[styles.nextButton, (loading || hasConflict) && styles.nextButtonDisabled]}
                onPress={handleNext}
                disabled={loading || hasConflict}
              >
                <Text style={styles.nextButtonText}>
                  {currentStep === 2 ? 'Review Booking' : 'Continue'}
                </Text>
                <ChevronRight size={18} color="white" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  modalWrapper: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 16,
  },
  modalBody: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
    backgroundColor: "#FAFBFC",
  },
  headerContent: {
    flex: 1,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 8,
  },
  guidelinesToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    padding: 8,
    backgroundColor: "#F0FDF4",
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  guidelinesToggleText: {
    fontSize: 14,
    color: '#10B981',
    fontWeight: '600',
  },
  closeButton: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: "#F3F4F6",
  },
  modalFooter: {
    flexDirection: "row",
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
    gap: 12,
    backgroundColor: "#FFFFFF",
  },

  // Guidelines Styles
  guidelinesContainer: {
    backgroundColor: '#F0F9FF',
    borderRadius: 16,
    padding: 20,
    margin: 20,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#0EA5E9',
  },
  guidelinesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  guidelinesIcon: {
    backgroundColor: '#0EA5E9',
    padding: 8,
    borderRadius: 10,
  },
  guidelinesTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0C4A6E',
  },
  stepInstructions: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  stepInstructionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 8,
  },
  checkIcon: {
    marginTop: 2,
  },
  instructionText: {
    fontSize: 14,
    color: '#374151',
    flex: 1,
    lineHeight: 20,
  },
  serviceGuidelines: {
    marginBottom: 16,
  },
  guidelinesSubtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  guidelinesSection: {
    marginBottom: 12,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  guidelineItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 6,
  },
  guidelineIcon: {
    marginTop: 2,
  },
  guidelineText: {
    fontSize: 14,
    color: '#6B7280',
    flex: 1,
    lineHeight: 20,
  },
  contactInfo: {
    backgroundColor: '#10B981',
    borderRadius: 12,
    padding: 16,
  },
  contactHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  contactIcon: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: 6,
    borderRadius: 8,
  },
  contactTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: 'white',
  },
  contactText: {
    fontSize: 14,
    color: 'white',
    lineHeight: 20,
    opacity: 0.9,
  },

  // Step Indicator Styles
  stepIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  stepContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  stepCircleActive: {
    borderColor: '#10B981',
    backgroundColor: '#10B981',
  },
  stepNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#D1D5DB',
  },
  stepNumberActive: {
    color: 'white',
  },
  stepLine: {
    width: 80,
    height: 3,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 8,
    borderRadius: 2,
  },
  stepLineActive: {
    backgroundColor: '#10B981',
  },
  stepTitles: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 40,
    marginBottom: 24,
  },
  stepTitleText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#9CA3AF',
    textAlign: 'center',
    flex: 1,
  },
  stepTitleActive: {
    color: '#10B981',
    fontWeight: '600',
  },

  // Step Content Styles
  stepContent: {
    paddingHorizontal: 20,
  },
  stepTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  stepSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 24,
  },

  // Date & Time Styles - ENHANCED VERSION
  dateTimeContainer: {
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  // Web Date Picker Container - ENHANCED
  webDatePickerContainer: {
    width: '100%',
    marginBottom: 12,
  },
  datePickerWrapper: {
    flexDirection: 'row',
    alignItems: 'stretch',
    backgroundColor: 'white',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#10B981',
    overflow: 'hidden',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  dateIconContainer: {
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderRightWidth: 2,
    borderRightColor: '#D1FAE5',
  },
  dateInputWrapper: {
    flex: 1,
    paddingVertical: 18,
    paddingHorizontal: 20,
  },
  dateLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6B7280',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  selectedDateDisplay: {
    marginTop: 16,
    backgroundColor: '#10B981',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  selectedDateIcon: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: 6,
    borderRadius: 10,
  },
  selectedDateText: {
    fontSize: 17,
    fontWeight: '700',
    color: 'white',
    letterSpacing: 0.3,
  },
  // Date Picker Container for Native
  datePickerContainer: {
    alignSelf: 'flex-start',
  },
  dateInput: {
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    padding: 14,
    backgroundColor: 'white',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minWidth: 240,
    maxWidth: 280,
    alignSelf: 'flex-start',
  },
  inputText: {
    fontSize: 15,
    color: '#111827',
    fontWeight: '500',
  },
  placeholderText: {
    fontSize: 15,
    color: '#9CA3AF',
  },
  timeSlotsLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  // Time Slots Styles
  timeSlots: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  timeSlot: {
    minWidth: (width - 80) / 3,
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  timeSlotAvailable: {
    borderColor: '#D1FAE5',
    backgroundColor: '#F0FDF4',
  },
  timeSlotBooked: {
    borderColor: '#F3F4F6',
    backgroundColor: '#F9FAFB',
  },
  timeSlotSelected: {
    borderColor: '#10B981',
    backgroundColor: '#D1FAE5',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  timeSlotConflict: {
    borderColor: '#FECACA',
    backgroundColor: '#FEF2F2',
  },
  timeSlotText: {
    fontSize: 14,
    fontWeight: '600',
  },
  timeSlotTextAvailable: {
    color: '#065F46',
  },
  timeSlotTextBooked: {
    color: '#9CA3AF',
    textDecorationLine: 'line-through',
  },
  timeSlotTextSelected: {
    color: '#065F46',
  },
  bookedBadge: {
    backgroundColor: '#6B7280',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginTop: 4,
  },
  bookedText: {
    fontSize: 10,
    color: 'white',
    fontWeight: '600',
  },
  selectedBadge: {
    backgroundColor: '#10B981',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginTop: 4,
  },
  selectedText: {
    fontSize: 10,
    color: 'white',
    fontWeight: '600',
  },

  // Availability Legend
  availabilityLegend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginTop: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendColor: {
    width: 16,
    height: 16,
    borderRadius: 4,
  },
  legendAvailable: {
    backgroundColor: '#D1FAE5',
    borderWidth: 2,
    borderColor: '#10B981',
  },
  legendBooked: {
    backgroundColor: '#F3F4F6',
    borderWidth: 2,
    borderColor: '#D1D5DB',
  },
  legendSelected: {
    backgroundColor: '#10B981',
  },
  legendText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },

  // Loading Styles
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },

  // Conflict Alert Styles
  conflictAlert: {
    flexDirection: 'row',
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
    borderWidth: 2,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    gap: 12,
    alignItems: 'flex-start',
  },
  conflictAlertContent: {
    flex: 1,
  },
  conflictAlertTitle: {
    fontSize: 16,
    color: '#DC2626',
    fontWeight: '600',
    marginBottom: 4,
  },
  conflictAlertText: {
    fontSize: 14,
    color: '#DC2626',
    marginBottom: 12,
  },
  suggestionContainer: {
    marginTop: 4,
  },
  suggestionTitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
    fontWeight: '500',
  },
  suggestionList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  suggestionChip: {
    backgroundColor: '#10B981',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  suggestionChipText: {
    fontSize: 12,
    color: 'white',
    fontWeight: '600',
  },

  // Text Input Styles
  textArea: {
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 16,
    backgroundColor: 'white',
    minHeight: 100,
    textAlignVertical: 'top',
    fontSize: 16,
    color: '#111827',
    lineHeight: 20,
  },
  optionalText: {
    color: '#6B7280',
    fontWeight: '400',
  },

  // Service Card Styles
  serviceCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#10B981',
  },
  serviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  serviceName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    flex: 1,
  },
  servicePrice: {
    fontSize: 20,
    fontWeight: '700',
    color: '#10B981',
  },
  serviceDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
    lineHeight: 20,
  },
  serviceMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  serviceDuration: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  durationText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },

  // Booking Summary Styles
  bookingSummary: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    flex: 1,
  },
  summaryValue: {
    fontSize: 14,
    color: '#6B7280',
    flex: 1,
    textAlign: 'right',
    lineHeight: 20,
  },
  summaryDivider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 16,
  },
  summaryTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  totalAmount: {
    fontSize: 20,
    fontWeight: '700',
    color: '#10B981',
  },

  // User Info Styles
  userInfoCard: {
    backgroundColor: '#F0F9FF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#0EA5E9',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0C4A6E',
    marginBottom: 12,
  },
  userInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  userInfoText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },

  // Button Styles
  backButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    backgroundColor: 'white',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  nextButton: {
    flex: 2,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#10B981',
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  nextButtonDisabled: {
    backgroundColor: '#9CA3AF',
    shadowColor: '#6B7280',
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  confirmButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: 18,
    borderRadius: 12,
    backgroundColor: '#10B981',
    marginBottom: 20,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  confirmButtonDisabled: {
    backgroundColor: '#9CA3AF',
    shadowColor: '#6B7280',
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: 'white',
  },
});
