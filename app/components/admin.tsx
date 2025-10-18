import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Switch,
  Modal,
  TextInput,
  RefreshControl,
  ActivityIndicator,
  LogBox,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import {
  Users,
  Calendar,
  Clock,
  MapPin,
  Phone,
  CircleCheck as CheckCircle,
  Circle as XCircle,
  CircleAlert as AlertCircle,
  Settings,
  Plus,
  Edit3,
  Trash2,
  Filter,
  ClipboardList,
  BookOpen,
  ArrowLeft
} from 'lucide-react-native';
import { createClient } from '@supabase/supabase-js';

LogBox.ignoreLogs(['Text strings must be rendered within a <Text> component.']);

const supabase = createClient(
  'https://ryqjkslsgfcycxybdeoj.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ5cWprc2xzZ2ZjeWN4eWJkZW9qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc1MTk5NzMsImV4cCI6MjA3MzA5NTk3M30.G3TTKLpIdBbpcvaO7_SWDuAsvehLI5mT0U85eM5uw50'
);

const apiService = {
  getBookings: async (statusFilter = 'all') => {
    try {
      let query = supabase
        .from('bookings')
        .select(`
          *,
          client:profiles!client_id(full_name, phone, email),
          service:services(name)
        `)
        .order('scheduled_date', { ascending: true })
        .order('scheduled_time', { ascending: true });

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data, error } = await query;

      if (error) throw error;

      return data.map(booking => ({
        id: booking.id,
        client_full_name: booking.client?.full_name || 'Unknown',
        client_phone: booking.client?.phone || 'N/A',
        service_name: booking.service?.name || 'Unknown Service',
        status: booking.status,
        scheduled_date: booking.scheduled_date,
        scheduled_time: booking.scheduled_time,
        address: booking.address,
        special_instructions: booking.special_instructions,
        total_price: booking.total_price,
      }));
    } catch (error) {
      console.error('Error fetching bookings:', error);
      throw error;
    }
  },

  getServices: async () => {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .order('name');

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching services:', error);
      throw error;
    }
  },

  getStats: async () => {
    try {
      const { count: totalBookings, error: bookingsError } = await supabase
        .from('bookings')
        .select('*', { count: 'exact', head: true });

      if (bookingsError) throw bookingsError;

      const { count: pendingBookings, error: pendingError } = await supabase
        .from('bookings')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      if (pendingError) throw pendingError;

      const { count: completedBookings, error: completedError } = await supabase
        .from('bookings')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'completed');

      if (completedError) throw completedError;

      const { count: totalCustomers, error: customersError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'client');

      if (customersError) throw customersError;

      return {
        totalBookings,
        pendingBookings,
        completedBookings,
        totalCustomers
      };
    } catch (error) {
      console.error('Error fetching stats:', error);
      throw error;
    }
  },

  updateBookingStatus: async (bookingId, status) => {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', bookingId)
        .select();

      if (error) throw error;
      return data[0];
    } catch (error) {
      console.error('Error updating booking:', error);
      throw error;
    }
  },

  addService: async (serviceData) => {
    try {
      const { data, error } = await supabase
        .from('services')
        .insert([{
          ...serviceData,
          price: serviceData.price ? parseFloat(serviceData.price) : null
        }])
        .select();

      if (error) throw error;
      return data[0];
    } catch (error) {
      console.error('Error adding service:', error);
      throw error;
    }
  },

  updateService: async (serviceId, serviceData) => {
    try {
      const { data, error } = await supabase
        .from('services')
        .update({
          ...serviceData,
          price: serviceData.price ? parseFloat(serviceData.price) : null
        })
        .eq('id', serviceId)
        .select();

      if (error) throw error;
      return data[0];
    } catch (error) {
      console.error('Error updating service:', error);
      throw error;
    }
  },

  deleteService: async (serviceId) => {
    try {
      const { error } = await supabase
        .from('services')
        .delete()
        .eq('id', serviceId);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Error deleting service:', error);
      throw error;
    }
  },

  getCustomers: async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email, phone, created_at')
        .eq('role', 'client')
        .order('full_name');

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching customers:', error);
      throw error;
    }
  },

  deleteBooking: async (bookingId) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .delete()
        .eq('id', bookingId);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Error deleting booking:', error);
      throw error;
    }
  },

  getFeedbacks: async () => {
    try {
      const { data, error } = await supabase
        .from('feedbacks')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching feedbacks:', error);
      throw error;
    }
  },

  deleteFeedback: async (feedbackId) => {
    try {
      const { error } = await supabase
        .from('feedbacks')
        .delete()
        .eq('id', feedbackId);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Error deleting feedback:', error);
      throw error;
    }
  },
};

const canMarkAsComplete = (booking) => {
  const now = new Date();
  const bookingDate = new Date(`${booking.scheduled_date}T${booking.scheduled_time}`);
  return now >= bookingDate;
};

const ConfirmDialog = ({ visible, title, message, onConfirm, onCancel, confirmText = 'Confirm', cancelText = 'Cancel', confirmColor = '#059669' }) => {
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onCancel}
    >
      <View style={styles.confirmOverlay}>
        <View style={styles.confirmDialog}>
          <Text style={styles.confirmTitle}>{title}</Text>
          <Text style={styles.confirmMessage}>{message}</Text>
          <View style={styles.confirmActions}>
            <TouchableOpacity
              style={[styles.confirmButton, styles.confirmCancelButton]}
              onPress={onCancel}
            >
              <Text style={styles.confirmCancelText}>{cancelText}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.confirmButton, { backgroundColor: confirmColor }]}
              onPress={onConfirm}
            >
              <Text style={styles.confirmConfirmText}>{confirmText}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const SuccessDialog = ({ visible, message, onClose }) => {
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.confirmOverlay}>
        <View style={styles.confirmDialog}>
          <CheckCircle size={48} color="#059669" style={{ alignSelf: 'center', marginBottom: 16 }} />
          <Text style={styles.confirmTitle}>Success</Text>
          <Text style={styles.confirmMessage}>{message}</Text>
          <TouchableOpacity
            style={[styles.confirmButton, { backgroundColor: '#059669', width: '100%' }]}
            onPress={onClose}
          >
            <Text style={styles.confirmConfirmText}>OK</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const ErrorDialog = ({ visible, message, onClose }) => {
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.confirmOverlay}>
        <View style={styles.confirmDialog}>
          <AlertCircle size={48} color="#EF4444" style={{ alignSelf: 'center', marginBottom: 16 }} />
          <Text style={styles.confirmTitle}>Error</Text>
          <Text style={styles.confirmMessage}>{message}</Text>
          <TouchableOpacity
            style={[styles.confirmButton, { backgroundColor: '#EF4444', width: '100%' }]}
            onPress={onClose}
          >
            <Text style={styles.confirmConfirmText}>OK</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const MyBookingsView = ({ bookings, onBack, onStatusUpdate, onDeleteBooking }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return '#059669';
      case 'pending': return '#F59E0B';
      case 'cancelled': return '#DC2626';
      case 'completed': return '#6366F1';
      default: return '#6B7280';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'confirmed': return <CheckCircle size={16} color="#059669" />;
      case 'pending': return <AlertCircle size={16} color="#F59E0B" />;
      case 'cancelled': return <XCircle size={16} color="#DC2626" />;
      default: return <Clock size={16} color="#6B7280" />;
    }
  };

  const renderBookingCard = (booking) => (
    <View key={booking.id} style={styles.bookingCard}>
      <View style={styles.bookingHeader}>
        <View style={styles.bookingInfo}>
          <Text style={styles.customerName}>{booking.client_full_name}</Text>
          <Text style={styles.serviceName}>{booking.service_name}</Text>
          {booking.total_price ? (
            <Text style={styles.priceText}>${booking.total_price}</Text>
          ) : (
            <Text style={styles.quotationText}>Price to be quoted</Text>
          )}
        </View>

        <View style={styles.bookingStatus}>
          {getStatusIcon(booking.status)}
          <Text style={[styles.statusText, { color: getStatusColor(booking.status) }]}>
            {booking.status.split('_').map(word =>
              word.charAt(0).toUpperCase() + word.slice(1)
            ).join(' ')}
          </Text>
        </View>
      </View>

      <View style={styles.bookingDetails}>
        <View style={styles.detailRow}>
          <Clock size={16} color="#6B7280" />
          <Text style={styles.detailText}>{booking.scheduled_time} on {booking.scheduled_date}</Text>
        </View>

        <View style={styles.detailRow}>
          <MapPin size={16} color="#6B7280" />
          <Text style={styles.detailText}>{booking.address}</Text>
        </View>

        <View style={styles.detailRow}>
          <Phone size={16} color="#6B7280" />
          <Text style={styles.detailText}>{booking.client_phone}</Text>
        </View>

        {booking.special_instructions && (
          <View style={styles.detailRow}>
            <ClipboardList size={16} color="#6B7280" />
            <Text style={styles.detailText} numberOfLines={1}>
              {booking.special_instructions}
            </Text>
          </View>
        )}
      </View>

      {booking.status === 'pending' && (
        <View style={styles.bookingActions}>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: '#059669' }]}
            onPress={() => onStatusUpdate(booking.id, 'confirmed')}
          >
            <Text style={styles.actionBtnText}>Confirm</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: '#DC2626' }]}
            onPress={() => onStatusUpdate(booking.id, 'cancelled')}
          >
            <Text style={styles.actionBtnText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      )}

      {booking.status === 'confirmed' && (
        <TouchableOpacity
          style={[
            styles.actionBtn,
            canMarkAsComplete(booking)
              ? { backgroundColor: '#6366F1' }
              : { backgroundColor: '#9CA3AF', opacity: 0.7 }
          ]}
          onPress={canMarkAsComplete(booking) ? () => onStatusUpdate(booking.id, 'completed') : null}
          disabled={!canMarkAsComplete(booking)}
        >
          <Text style={styles.actionBtnText}>
            {canMarkAsComplete(booking) ? 'Mark Complete' : 'Complete after scheduled time'}
          </Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity
        style={[styles.actionBtn, { backgroundColor: '#EF4444', marginTop: 8 }]}
        onPress={() => onDeleteBooking(booking.id)}
      >
        <Trash2 size={16} color="white" />
        <Text style={styles.actionBtnText}>Delete Booking</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <ArrowLeft size={24} color="white" />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>All Bookings</Text>
          <Text style={styles.headerSubtitle}>Manage customer bookings</Text>
        </View>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>All Bookings</Text>
          {bookings.length > 0 ? (
            bookings.map(renderBookingCard)
          ) : (
            <Text style={styles.noDataText}>No bookings found</Text>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default function AdminScreen() {
  const [services, setServices] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [stats, setStats] = useState({
    totalBookings: 0,
    pendingBookings: 0,
    completedBookings: 0,
    totalCustomers: 0,
  });
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [activeModal, setActiveModal] = useState(null);
  const [newService, setNewService] = useState({
    name: '',
    description: '',
    price: '',
    duration: '',
    category: '',
    requiresQuotation: false
  });
  const [editingService, setEditingService] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState('dashboard');

  const [confirmDialog, setConfirmDialog] = useState({
    visible: false,
    title: '',
    message: '',
    onConfirm: () => {},
    confirmText: 'Confirm',
    confirmColor: '#059669'
  });

  const [successDialog, setSuccessDialog] = useState({
    visible: false,
    message: ''
  });

  const [errorDialog, setErrorDialog] = useState({
    visible: false,
    message: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setRefreshing(true);
      setLoading(true);
      const [bookingsData, servicesData, statsData, customersData, feedbacksData] = await Promise.all([
        apiService.getBookings(filterStatus),
        apiService.getServices(),
        apiService.getStats(),
        apiService.getCustomers(),
        apiService.getFeedbacks()
      ]);

      setBookings(bookingsData);
      setServices(servicesData);
      setStats(statsData);
      setCustomers(customersData);
      setFeedbacks(feedbacksData);
    } catch (error) {
      setErrorDialog({
        visible: true,
        message: 'Failed to load data. Please try again.'
      });
      console.error('Error loading data:', error);
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  };

  const onRefresh = () => {
    loadData();
  };

  const handleStatusUpdate = async (bookingId, newStatus) => {
    const booking = bookings.find(b => b.id === bookingId);

    if (newStatus === 'completed' && booking && !canMarkAsComplete(booking)) {
      setErrorDialog({
        visible: true,
        message: 'This booking cannot be marked as complete until the scheduled date and time has been reached.'
      });
      return;
    }

    setConfirmDialog({
      visible: true,
      title: 'Update Status',
      message: `Change booking status to ${newStatus}?`,
      confirmText: 'Confirm',
      confirmColor: '#059669',
      onConfirm: async () => {
        setConfirmDialog({ ...confirmDialog, visible: false });
        try {
          await apiService.updateBookingStatus(bookingId, newStatus);

          const updatedBookings = bookings.map(booking =>
            booking.id === bookingId ? { ...booking, status: newStatus } : booking
          );
          setBookings(updatedBookings);

          const statsData = await apiService.getStats();
          setStats(statsData);

          setSuccessDialog({
            visible: true,
            message: `Booking status updated to ${newStatus}`
          });
        } catch (error) {
          setErrorDialog({
            visible: true,
            message: 'Failed to update booking status.'
          });
          console.error('Error updating booking:', error);
        }
      }
    });
  };

  const handleDeleteBooking = async (bookingId) => {
    setConfirmDialog({
      visible: true,
      title: 'Delete Booking',
      message: 'Are you sure you want to delete this booking? This action cannot be undone.',
      confirmText: 'Delete',
      confirmColor: '#EF4444',
      onConfirm: async () => {
        setConfirmDialog({ ...confirmDialog, visible: false });
        try {
          await apiService.deleteBooking(bookingId);
          const updatedBookings = bookings.filter(booking => booking.id !== bookingId);
          setBookings(updatedBookings);

          const statsData = await apiService.getStats();
          setStats(statsData);

          setSuccessDialog({
            visible: true,
            message: 'Booking deleted successfully'
          });
        } catch (error) {
          setErrorDialog({
            visible: true,
            message: 'Failed to delete booking.'
          });
          console.error('Error deleting booking:', error);
        }
      }
    });
  };

  const handleDeleteFeedback = async (feedbackId) => {
    setConfirmDialog({
      visible: true,
      title: 'Delete Feedback',
      message: 'Are you sure you want to delete this feedback? This action cannot be undone.',
      confirmText: 'Delete',
      confirmColor: '#EF4444',
      onConfirm: async () => {
        setConfirmDialog({ ...confirmDialog, visible: false });
        try {
          await apiService.deleteFeedback(feedbackId);
          const updatedFeedbacks = feedbacks.filter(feedback => feedback.id !== feedbackId);
          setFeedbacks(updatedFeedbacks);
          setSuccessDialog({
            visible: true,
            message: 'Feedback deleted successfully'
          });
        } catch (error) {
          setErrorDialog({
            visible: true,
            message: 'Failed to delete feedback.'
          });
          console.error('Error deleting feedback:', error);
        }
      }
    });
  };

  const handleAddService = async () => {
    if (!newService.name || !newService.duration || !newService.category) {
      setErrorDialog({
        visible: true,
        message: 'Please fill all required fields'
      });
      return;
    }

    if (!newService.requiresQuotation && !newService.price) {
      setErrorDialog({
        visible: true,
        message: 'Please enter a price or select "Requires Quotation"'
      });
      return;
    }

    try {
      const serviceData = {
        name: newService.name,
        description: newService.description || '',
        price: newService.requiresQuotation ? null : parseFloat(newService.price),
        duration: parseInt(newService.duration),
        category: newService.category
      };

      const newServiceItem = await apiService.addService(serviceData);
      setServices([...services, newServiceItem]);
      setNewService({
        name: '',
        description: '',
        price: '',
        duration: '',
        category: '',
        requiresQuotation: false
      });
      setModalVisible(false);
      setSuccessDialog({
        visible: true,
        message: 'Service added successfully'
      });
    } catch (error) {
      setErrorDialog({
        visible: true,
        message: 'Failed to add service.'
      });
      console.error('Error adding service:', error);
    }
  };

  const handleEditService = (service) => {
    if (service) {
      setEditingService({
        id: service.id,
        name: service.name || '',
        description: service.description || '',
        price: service.price ? String(service.price) : '',
        duration: String(service.duration || ''),
        category: service.category || '',
        requiresQuotation: service.price === null
      });
      setActiveModal('edit_service');
      setModalVisible(true);
    }
  };

  const handleUpdateService = async () => {
    if (!editingService || !editingService.name || !editingService.duration || !editingService.category) {
      setErrorDialog({
        visible: true,
        message: 'Please fill all required fields'
      });
      return;
    }

    if (!editingService.requiresQuotation && !editingService.price) {
      setErrorDialog({
        visible: true,
        message: 'Please enter a price or select "Requires Quotation"'
      });
      return;
    }

    try {
      const serviceData = {
        name: editingService.name,
        description: editingService.description || '',
        price: editingService.requiresQuotation ? null : parseFloat(editingService.price),
        duration: parseInt(editingService.duration),
        category: editingService.category
      };

      const updatedService = await apiService.updateService(editingService.id, serviceData);

      const updatedServices = services.map(service =>
        service.id === editingService.id ? updatedService : service
      );
      setServices(updatedServices);

      setEditingService(null);
      setModalVisible(false);
      setSuccessDialog({
        visible: true,
        message: 'Service updated successfully'
      });
    } catch (error) {
      setErrorDialog({
        visible: true,
        message: 'Failed to update service.'
      });
      console.error('Error updating service:', error);
    }
  };

  const handleDeleteService = async (serviceId) => {
    setConfirmDialog({
      visible: true,
      title: 'Delete Service',
      message: 'Are you sure you want to delete this service?',
      confirmText: 'Delete',
      confirmColor: '#EF4444',
      onConfirm: async () => {
        setConfirmDialog({ ...confirmDialog, visible: false });
        try {
          await apiService.deleteService(serviceId);
          const updatedServices = services.filter(service => service.id !== serviceId);
          setServices(updatedServices);
          setSuccessDialog({
            visible: true,
            message: 'Service deleted successfully'
          });
        } catch (error) {
          setErrorDialog({
            visible: true,
            message: 'Failed to delete service.'
          });
          console.error('Error deleting service:', error);
        }
      }
    });
  };

  const handleViewCustomers = () => {
    setActiveModal('customers');
    setModalVisible(true);
  };

  const handleViewFeedbacks = () => {
    setActiveModal('feedbacks');
    setModalVisible(true);
  };

  const handleViewBookings = () => {
    setActiveView('bookings');
  };

  const handleBackToDashboard = () => {
    setActiveView('dashboard');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return '#059669';
      case 'pending': return '#F59E0B';
      case 'cancelled': return '#DC2626';
      case 'completed': return '#6366F1';
      default: return '#6B7280';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'confirmed': return <CheckCircle size={16} color="#059669" />;
      case 'pending': return <AlertCircle size={16} color="#F59E0B" />;
      case 'cancelled': return <XCircle size={16} color="#DC2626" />;
      default: return <Clock size={16} color="#6B7280" />;
    }
  };

  const filteredBookings = filterStatus === 'all'
    ? bookings
    : bookings.filter(booking => booking.status === filterStatus);

  const todaysBookings = bookings.filter(booking => {
    const today = new Date().toISOString().split('T')[0];
    return booking.scheduled_date === today;
  });

  const tomorrowsBookings = bookings.filter(booking => {
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
    return booking.scheduled_date === tomorrow;
  });

  const renderServiceManagement = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Service Management</Text>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => {
            setActiveModal('add_service');
            setNewService({
              name: '',
              description: '',
              price: '',
              duration: '',
              category: '',
              requiresQuotation: false
            });
            setModalVisible(true);
          }}
        >
          <Plus size={20} color="#059669" />
        </TouchableOpacity>
      </View>

      {services.map(service => (
        <View key={service.id} style={styles.serviceItem}>
          <View style={styles.serviceInfo}>
            <Text style={styles.serviceName}>{service.name}</Text>
            <Text style={styles.serviceDetails}>
              {service.price ? `$${service.price}` : 'Price on quotation'} • {service.duration} hours • {service.category}
            </Text>
            {service.description && (
              <Text style={styles.serviceDescription} numberOfLines={1}>
                {service.description}
              </Text>
            )}
          </View>
          <View style={styles.serviceActions}>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => handleEditService(service)}
            >
              <Edit3 size={16} color="#3B82F6" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => handleDeleteService(service.id)}
            >
              <Trash2 size={16} color="#EF4444" />
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </View>
  );

  const renderBookingCard = (booking) => (
    <View key={booking.id} style={styles.bookingCard}>
      <View style={styles.bookingHeader}>
        <View style={styles.bookingInfo}>
          <Text style={styles.customerName}>{booking.client_full_name}</Text>
          <Text style={styles.serviceName}>{booking.service_name}</Text>
          {booking.total_price ? (
            <Text style={styles.priceText}>${booking.total_price}</Text>
          ) : (
            <Text style={styles.quotationText}>Price to be quoted</Text>
          )}
        </View>

        <View style={styles.bookingStatus}>
          {getStatusIcon(booking.status)}
          <Text style={[styles.statusText, { color: getStatusColor(booking.status) }]}>
            {booking.status.split('_').map(word =>
              word.charAt(0).toUpperCase() + word.slice(1)
            ).join(' ')}
          </Text>
        </View>
      </View>

      <View style={styles.bookingDetails}>
        <View style={styles.detailRow}>
          <Clock size={16} color="#6B7280" />
          <Text style={styles.detailText}>{booking.scheduled_time} on {booking.scheduled_date}</Text>
        </View>

        <View style={styles.detailRow}>
          <MapPin size={16} color="#6B7280" />
          <Text style={styles.detailText}>{booking.address}</Text>
        </View>

        <View style={styles.detailRow}>
          <Phone size={16} color="#6B7280" />
          <Text style={styles.detailText}>{booking.client_phone}</Text>
        </View>

        {booking.special_instructions && (
          <View style={styles.detailRow}>
            <ClipboardList size={16} color="#6B7280" />
            <Text style={styles.detailText} numberOfLines={1}>
              {booking.special_instructions}
            </Text>
          </View>
        )}
      </View>

      {booking.status === 'pending' && (
        <View style={styles.bookingActions}>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: '#059669' }]}
            onPress={() => handleStatusUpdate(booking.id, 'confirmed')}
          >
            <Text style={styles.actionBtnText}>Confirm</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: '#DC2626' }]}
            onPress={() => handleStatusUpdate(booking.id, 'cancelled')}
          >
            <Text style={styles.actionBtnText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      )}

      {booking.status === 'confirmed' && (
        <TouchableOpacity
          style={[
            styles.actionBtn,
            canMarkAsComplete(booking)
              ? { backgroundColor: '#6366F1' }
              : { backgroundColor: '#9CA3AF', opacity: 0.7 }
          ]}
          onPress={canMarkAsComplete(booking) ? () => handleStatusUpdate(booking.id, 'completed') : null}
          disabled={!canMarkAsComplete(booking)}
        >
          <Text style={styles.actionBtnText}>
            {canMarkAsComplete(booking) ? 'Mark Complete' : 'Complete after scheduled time'}
          </Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity
        style={[styles.actionBtn, { backgroundColor: '#EF4444', marginTop: 8 }]}
        onPress={() => handleDeleteBooking(booking.id)}
      >
        <Trash2 size={16} color="white" />
        <Text style={styles.actionBtnText}>Delete Booking</Text>
      </TouchableOpacity>
    </View>
  );

  const renderModalContent = () => {
    switch (activeModal) {
      case 'add_service':
        return (
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add New Service</Text>

            <Text style={styles.inputLabel}>Service Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter service name"
              placeholderTextColor="#9CA3AF"
              value={newService.name}
              onChangeText={text => setNewService({...newService, name: text})}
            />

            <Text style={styles.inputLabel}>Description</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter description (optional)"
              placeholderTextColor="#9CA3AF"
              value={newService.description}
              onChangeText={text => setNewService({...newService, description: text})}
            />

            <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>Requires Quotation</Text>
              <Switch
                value={newService.requiresQuotation}
                onValueChange={value => setNewService({
                  ...newService,
                  requiresQuotation: value,
                  price: value ? '' : newService.price
                })}
                trackColor={{ false: '#E5E7EB', true: '#059669' }}
                thumbColor="white"
              />
            </View>

            {!newService.requiresQuotation && (
              <>
                <Text style={styles.inputLabel}>Price *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter price"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="numeric"
                  value={newService.price}
                  onChangeText={text => setNewService({...newService, price: text})}
                />
              </>
            )}

            <Text style={styles.inputLabel}>Duration (hours) *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter duration in hours"
              placeholderTextColor="#9CA3AF"
              keyboardType="numeric"
              value={newService.duration}
              onChangeText={text => setNewService({...newService, duration: text})}
            />

            <Text style={styles.inputLabel}>Category *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter category (e.g., residential, commercial)"
              placeholderTextColor="#9CA3AF"
              value={newService.category}
              onChangeText={text => setNewService({...newService, category: text})}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handleAddService}
              >
                <Text style={styles.modalButtonText}>Add Service</Text>
              </TouchableOpacity>
            </View>
          </View>
        );

      case 'edit_service':
        return (
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Service</Text>

            <Text style={styles.inputLabel}>Service Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter service name"
              placeholderTextColor="#9CA3AF"
              value={editingService?.name || ''}
              onChangeText={text => setEditingService({...editingService, name: text})}
            />

            <Text style={styles.inputLabel}>Description</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter description (optional)"
              placeholderTextColor="#9CA3AF"
              value={editingService?.description || ''}
              onChangeText={text => setEditingService({...editingService, description: text})}
            />

            <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>Requires Quotation</Text>
              <Switch
                value={editingService?.requiresQuotation || false}
                onValueChange={value => setEditingService({
                  ...editingService,
                  requiresQuotation: value,
                  price: value ? '' : editingService.price
                })}
                trackColor={{ false: '#E5E7EB', true: '#059669' }}
                thumbColor="white"
              />
            </View>

            {!editingService?.requiresQuotation && (
              <>
                <Text style={styles.inputLabel}>Price *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter price"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="numeric"
                  value={editingService?.price || ''}
                  onChangeText={text => setEditingService({...editingService, price: text})}
                />
              </>
            )}

            <Text style={styles.inputLabel}>Duration (hours) *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter duration in hours"
              placeholderTextColor="#9CA3AF"
              keyboardType="numeric"
              value={editingService?.duration || ''}
              onChangeText={text => setEditingService({...editingService, duration: text})}
            />

            <Text style={styles.inputLabel}>Category *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter category (e.g., residential, commercial)"
              placeholderTextColor="#9CA3AF"
              value={editingService?.category || ''}
              onChangeText={text => setEditingService({...editingService, category: text})}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setEditingService(null);
                  setModalVisible(false);
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handleUpdateService}
              >
                <Text style={styles.modalButtonText}>Update Service</Text>
              </TouchableOpacity>
            </View>
          </View>
        );

      case 'customers':
        return (
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>All Customers</Text>
            <Text style={styles.modalSubtitle}>Total: {customers.length} customers</Text>

            <ScrollView style={styles.customersList}>
              {customers.map(customer => (
                <View key={customer.id} style={styles.customerItem}>
                  <Text style={styles.customerName}>{customer.full_name}</Text>
                  <Text style={styles.customerEmail}>{customer.email}</Text>
                  <Text style={styles.customerPhone}>{customer.phone || 'No phone number'}</Text>
                </View>
              ))}
            </ScrollView>

            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton, { marginTop: 16 }]}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.cancelButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        );

      case 'feedbacks':
        return (
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Customer Feedbacks</Text>
            <Text style={styles.modalSubtitle}>Total: {feedbacks.length} feedbacks</Text>

            <ScrollView style={styles.feedbacksList}>
              {feedbacks.map(feedback => (
                <View key={feedback.id} style={styles.feedbackItem}>
                  <View style={styles.feedbackHeader}>
                    <Text style={styles.feedbackName}>
                      {feedback.client_name || 'Anonymous'}
                    </Text>
                    {feedback.rating && (
                      <Text style={styles.feedbackRating}>
                        {'★'.repeat(feedback.rating)}{'☆'.repeat(5 - feedback.rating)}
                      </Text>
                    )}
                  </View>
                  <Text style={styles.feedbackComment}>{feedback.comment}</Text>
                  <Text style={styles.feedbackDate}>
                    {new Date(feedback.created_at).toLocaleDateString()}
                  </Text>
                  <TouchableOpacity
                    style={styles.deleteFeedbackButton}
                    onPress={() => handleDeleteFeedback(feedback.id)}
                  >
                    <Trash2 size={16} color="#EF4444" />
                    <Text style={styles.deleteFeedbackText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>

            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton, { marginTop: 16 }]}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.cancelButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        );

      default:
        return (
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Filter Bookings</Text>
            {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map(status => (
              <TouchableOpacity
                key={status}
                style={[
                  styles.filterOption,
                  filterStatus === status && styles.selectedFilterOption
                ]}
                onPress={() => {
                  setFilterStatus(status);
                  setModalVisible(false);
                  loadData();
                }}
              >
                <Text style={[
                  styles.filterOptionText,
                  filterStatus === status && styles.selectedFilterOptionText
                ]}>
                  {status.split('_').map(word =>
                    word.charAt(0).toUpperCase() + word.slice(1)
                  ).join(' ')}
                </Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton, { marginTop: 16 }]}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        );
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#059669" />
        <Text style={styles.loadingText}>Loading Dashboard...</Text>
      </View>
    );
  }

  if (activeView === 'bookings') {
    return (
      <>
        <MyBookingsView
          bookings={bookings}
          onBack={handleBackToDashboard}
          onStatusUpdate={handleStatusUpdate}
          onDeleteBooking={handleDeleteBooking}
        />
        <ConfirmDialog
          visible={confirmDialog.visible}
          title={confirmDialog.title}
          message={confirmDialog.message}
          onConfirm={confirmDialog.onConfirm}
          onCancel={() => setConfirmDialog({ ...confirmDialog, visible: false })}
          confirmText={confirmDialog.confirmText}
          confirmColor={confirmDialog.confirmColor}
        />
        <SuccessDialog
          visible={successDialog.visible}
          message={successDialog.message}
          onClose={() => setSuccessDialog({ visible: false, message: '' })}
        />
        <ErrorDialog
          visible={errorDialog.visible}
          message={errorDialog.message}
          onClose={() => setErrorDialog({ visible: false, message: '' })}
        />
      </>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Admin Dashboard</Text>
          <Text style={styles.headerSubtitle}>Manage your cleaning business</Text>
        </View>

        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.iconButton}>
            <Settings size={20} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.statsContainer}>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Calendar size={24} color="#059669" />
              <Text style={styles.statNumber}>{stats.totalBookings}</Text>
              <Text style={styles.statLabel}>Total Bookings</Text>
            </View>

            <View style={styles.statCard}>
              <Users size={24} color="#059669" />
              <Text style={styles.statNumber}>{stats.totalCustomers}</Text>
              <Text style={styles.statLabel}>Customers</Text>
            </View>

            <View style={styles.statCard}>
              <AlertCircle size={24} color="#059669" />
              <Text style={styles.statNumber}>{stats.pendingBookings}</Text>
              <Text style={styles.statLabel}>Pending</Text>
            </View>

            <View style={styles.statCard}>
              <CheckCircle size={24} color="#059669" />
              <Text style={styles.statNumber}>{stats.completedBookings}</Text>
              <Text style={styles.statLabel}>Completed</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>

          <View style={styles.quickActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleViewCustomers}
            >
              <Users size={20} color="white" />
              <Text style={styles.actionButtonText}>View Customers</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleViewBookings}
            >
              <BookOpen size={20} color="white" />
              <Text style={styles.actionButtonText}>Bookings</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleViewFeedbacks}
            >
              <ClipboardList size={20} color="white" />
              <Text style={styles.actionButtonText}>Feedbacks</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Customer Feedbacks</Text>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={handleViewFeedbacks}
            >
              <ClipboardList size={20} color="#059669" />
            </TouchableOpacity>
          </View>

          <Text style={styles.feedbackSummary}>
            {feedbacks.length} total feedbacks, {feedbacks.filter(f => f.rating >= 4).length} positive
          </Text>
        </View>

        {renderServiceManagement()}

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Today's Bookings</Text>
            <Text style={styles.bookingCount}>{todaysBookings.length} bookings</Text>
          </View>

          {todaysBookings.length > 0 ? (
            todaysBookings.map(renderBookingCard)
          ) : (
            <Text style={styles.noDataText}>No bookings for today</Text>
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Tomorrow's Bookings</Text>
            <Text style={styles.bookingCount}>{tomorrowsBookings.length} bookings</Text>
          </View>

          {tomorrowsBookings.length > 0 ? (
            tomorrowsBookings.map(renderBookingCard)
          ) : (
            <Text style={styles.noDataText}>No bookings for tomorrow</Text>
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>All Bookings</Text>
            <TouchableOpacity
              style={styles.filterButton}
              onPress={() => {
                setActiveModal('filter');
                setModalVisible(true);
              }}
            >
              <Filter size={16} color="#059669" />
              <Text style={styles.filterText}>
                Filter: {filterStatus.split('_').map(word =>
                  word.charAt(0).toUpperCase() + word.slice(1)
                ).join(' ')}
              </Text>
            </TouchableOpacity>
          </View>

          {filteredBookings.length > 0 ? (
            filteredBookings.map(renderBookingCard)
          ) : (
            <Text style={styles.noDataText}>No bookings found</Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Settings</Text>

          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Push Notifications</Text>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: '#E5E7EB', true: '#059669' }}
              thumbColor="white"
            />
          </View>
        </View>
      </ScrollView>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalView}>
            {renderModalContent()}
          </View>
        </View>
      </Modal>

      <ConfirmDialog
        visible={confirmDialog.visible}
        title={confirmDialog.title}
        message={confirmDialog.message}
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog({ ...confirmDialog, visible: false })}
        confirmText={confirmDialog.confirmText}
        confirmColor={confirmDialog.confirmColor}
      />

      <SuccessDialog
        visible={successDialog.visible}
        message={successDialog.message}
        onClose={() => setSuccessDialog({ visible: false, message: '' })}
      />

      <ErrorDialog
        visible={errorDialog.visible}
        message={errorDialog.message}
        onClose={() => setErrorDialog({ visible: false, message: '' })}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
  header: {
    backgroundColor: '#059669',
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  content: {
    flex: 1,
  },
  statsContainer: {
    backgroundColor: 'white',
    marginHorizontal: 24,
    marginTop: -12,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  statCard: {
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    width: '47%',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
    textAlign: 'center',
  },
  section: {
    backgroundColor: 'white',
    marginHorizontal: 24,
    marginTop: 16,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  bookingCount: {
    fontSize: 14,
    color: '#6B7280',
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    backgroundColor: '#059669',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    flex: 1,
    justifyContent: 'center',
    gap: 8,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  settingLabel: {
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '500',
  },
  bookingCard: {
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    paddingBottom: 16,
    marginBottom: 16,
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  bookingInfo: {
    flex: 1,
  },
  customerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  serviceName: {
    fontSize: 14,
    color: '#6B7280',
  },
  priceText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#059669',
    marginTop: 4,
  },
  quotationText: {
    fontSize: 14,
    fontStyle: 'italic',
    color: '#F59E0B',
    marginTop: 4,
  },
  bookingStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  bookingDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#4B5563',
    flex: 1,
  },
  bookingActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  actionBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 4,
  },
  actionBtnText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  iconButton: {
    padding: 4,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    padding: 8,
    backgroundColor: '#F0FDF4',
    borderRadius: 8,
  },
  filterText: {
    color: '#059669',
    fontSize: 12,
    fontWeight: '600',
  },
  serviceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  serviceInfo: {
    flex: 1,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  serviceDetails: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  serviceDescription: {
    fontSize: 12,
    color: '#9CA3AF',
    fontStyle: 'italic',
  },
  serviceActions: {
    flexDirection: 'row',
    gap: 8,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    width: '90%',
    maxHeight: '80%',
  },
  modalContent: {
    width: '100%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6,
    marginTop: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    color: '#1F2937',
    backgroundColor: 'white',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#E5E7EB',
  },
  confirmButton: {
    backgroundColor: '#059669',
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  filterOption: {
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    marginBottom: 8,
  },
  selectedFilterOption: {
    backgroundColor: '#F0FDF4',
    borderColor: '#059669',
  },
  filterOptionText: {
    fontSize: 16,
    color: '#1F2937',
  },
  selectedFilterOptionText: {
    color: '#059669',
    fontWeight: '600',
  },
  noDataText: {
    textAlign: 'center',
    color: '#6B7280',
    fontStyle: 'italic',
    marginVertical: 16,
  },
  customersList: {
    maxHeight: 300,
  },
  customerItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  customerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  customerEmail: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 2,
  },
  customerPhone: {
    fontSize: 14,
    color: '#6B7280',
  },
  feedbacksList: {
    maxHeight: 400,
  },
  feedbackItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    marginBottom: 12,
  },
  feedbackHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  feedbackName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  feedbackRating: {
    fontSize: 14,
    color: '#F59E0B',
  },
  feedbackComment: {
    fontSize: 14,
    color: '#4B5563',
    marginBottom: 8,
    lineHeight: 20,
  },
  feedbackDate: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 8,
  },
  deleteFeedbackButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-end',
  },
  deleteFeedbackText: {
    color: '#EF4444',
    fontSize: 12,
  },
  feedbackSummary: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  confirmOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  confirmDialog: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    width: '85%',
    maxWidth: 400,
  },
  confirmTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 12,
    textAlign: 'center',
  },
  confirmMessage: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 22,
  },
  confirmActions: {
    flexDirection: 'row',
    gap: 12,
  },
  confirmButton: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  confirmCancelButton: {
    backgroundColor: '#E5E7EB',
  },
  confirmCancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  confirmConfirmText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
});
