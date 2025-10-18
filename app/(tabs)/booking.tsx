import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  useWindowDimensions,
  Platform,
  RefreshControl,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { supabase } from "../lib/supabase";

const logo = require("../cleanlily.png");

// Web-compatible alert function
const showAlert = (title, message) => {
  if (Platform.OS === 'web') {
    if (window.confirm(`${title}\n\n${message}`)) {
      return true;
    }
    return false;
  } else {
    Alert.alert(title, message);
    return true;
  }
};

const showConfirmation = (title, message, onConfirm) => {
  if (Platform.OS === 'web') {
    if (window.confirm(`${title}\n\n${message}`)) {
      onConfirm();
    }
  } else {
    Alert.alert(
      title,
      message,
      [
        {
          text: "No",
          style: "cancel"
        },
        { 
          text: "Yes", 
          onPress: onConfirm
        }
      ]
    );
  }
};

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState("all");
  const [userId, setUserId] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const { width, height } = useWindowDimensions();
  
  // Responsive breakpoints
  const isSmallScreen = width < 768;
  const isMediumScreen = width >= 768 && width < 1024;
  const isLargeScreen = width >= 1024;
  const isExtraLargeScreen = width >= 1440;

  useEffect(() => {
    getCurrentUser();
  }, []);

  useEffect(() => {
    if (userId) {
      fetchBookings();
    }
  }, [userId]);

  const getCurrentUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id || null);
    } catch (error) {
      console.error("Error getting current user:", error);
      showAlert("Error", "Failed to get user information");
    }
  };

  const fetchBookings = async () => {
    try {
      setLoading(true);

      const { data: bookingsData, error: bookingsError } = await supabase
        .from("bookings")
        .select("*")
        .eq("client_id", userId)
        .order("created_at", { ascending: false });

      if (bookingsError) throw bookingsError;

      const cleanerIds = [
        ...new Set(bookingsData.map((b) => b.cleaner_id).filter((id) => id)),
      ];
      const serviceIds = [...new Set(bookingsData.map((b) => b.service_id))];

      const { data: cleanersData } = await supabase
        .from("profiles")
        .select("*")
        .in("id", cleanerIds);

      const { data: servicesData } = await supabase
        .from("services")
        .select("*")
        .in("id", serviceIds);

      const enrichedBookings = bookingsData.map((booking) => ({
        ...booking,
        cleaner: cleanersData?.find((c) => c.id === booking.cleaner_id) || null,
        service: servicesData?.find((s) => s.id === booking.service_id) || null,
      }));

      setBookings(enrichedBookings);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      showAlert("Error", "Failed to load bookings");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchBookings();
  };

  const handleCancelBooking = async (bookingId) => {
    showConfirmation(
      "Confirm Cancellation",
      "Are you sure you want to cancel this booking?",
      async () => {
        try {
          setCancellingId(bookingId);
          
          const { error } = await supabase
            .from("bookings")
            .update({ status: "cancelled" })
            .eq("id", bookingId);
          
          if (error) throw error;
          
          // Update local state
          setBookings(bookings.map(booking => 
            booking.id === bookingId 
              ? { ...booking, status: "cancelled" } 
              : booking
          ));
          
          showAlert("Success", "Booking cancelled successfully");
        } catch (error) {
          console.error("Error cancelling booking:", error);
          showAlert("Error", "Failed to cancel booking. Please try again.");
        } finally {
          setCancellingId(null);
        }
      }
    );
  };

  const filteredBookings =
    filter === "all"
      ? bookings
      : bookings.filter((booking) => booking.status === filter);

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "#FFFBEB";
      case "confirmed":
        return "#EFF6FF";
      case "completed":
        return "#F0FDF4";
      case "cancelled":
        return "#FEF2F2";
      default:
        return "#F8FAFC";
    }
  };

  const getStatusTextColor = (status) => {
    switch (status) {
      case "pending":
        return "#F59E0B";
      case "confirmed":
        return "#3B82F6";
      case "completed":
        return "#10B981";
      case "cancelled":
        return "#EF4444";
      default:
        return "#6B7280";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending": return "⏳";
      case "confirmed": return "✅";
      case "completed": return "🎉";
      case "cancelled": return "❌";
      default: return "📋";
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (timeString) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const canCancelBooking = (booking) => {
    return (booking.status === "pending" || booking.status === "confirmed") && cancellingId !== booking.id;
  };

  const renderBookingItem = (item) => {
    const isCancelling = cancellingId === item.id;

    if (isSmallScreen) {
      return (
        <View key={item.id} style={styles.mobileCard}>
          <View style={styles.mobileCardHeader}>
            <View style={styles.serviceInfo}>
              <Text style={styles.mobileServiceName}>
                {item.service?.name || "Unknown Service"}
              </Text>
              <Text style={styles.mobileServiceDuration}>
                {item.service?.duration} hours • ${(item.total_price ?? 0).toFixed(2)}
              </Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
              <Text style={[styles.statusText, { color: getStatusTextColor(item.status) }]}>
                {getStatusIcon(item.status)} {item.status.toUpperCase()}
              </Text>
            </View>
          </View>
          
          <View style={styles.mobileDetails}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>📅 Date & Time</Text>
              <Text style={styles.detailValue}>
                {formatDate(item.scheduled_date)} at {formatTime(item.scheduled_time)}
              </Text>
            </View>
            
            {item.cleaner && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>👤 Cleaner</Text>
                <Text style={styles.detailValue}>
                  {item.cleaner.full_name || "Unknown"}
                </Text>
              </View>
            )}
          </View>

          {canCancelBooking(item) && (
            <TouchableOpacity
              style={[
                styles.cancelButton,
                isCancelling && styles.cancelButtonDisabled
              ]}
              onPress={() => handleCancelBooking(item.id)}
              disabled={isCancelling}
            >
              {isCancelling ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text style={styles.cancelButtonText}>Cancel Booking</Text>
              )}
            </TouchableOpacity>
          )}
        </View>
      );
    }

    return (
      <View key={item.id} style={styles.desktopCard}>
        <View style={styles.desktopCardContent}>
          <View style={styles.serviceSection}>
            <Text style={styles.desktopServiceName}>
              {item.service?.name || "Unknown Service"}
            </Text>
            <Text style={styles.desktopServiceDetails}>
              {item.service?.duration} hours • {item.cleaner?.full_name || "Unknown cleaner"}
            </Text>
          </View>

          <View style={styles.datetimeSection}>
            <Text style={styles.dateText}>{formatDate(item.scheduled_date)}</Text>
            <Text style={styles.timeText}>{formatTime(item.scheduled_time)}</Text>
          </View>

          <View style={styles.priceSection}>
            <Text style={styles.priceText}>${(item.total_price ?? 0).toFixed(2)}</Text>
          </View>

          <View style={styles.statusSection}>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
              <Text style={[styles.statusText, { color: getStatusTextColor(item.status) }]}>
                {getStatusIcon(item.status)} {item.status.toUpperCase()}
              </Text>
            </View>
          </View>

          <View style={styles.actionSection}>
            {canCancelBooking(item) ? (
              <TouchableOpacity
                style={[
                  styles.cancelButton,
                  isCancelling && styles.cancelButtonDisabled
                ]}
                onPress={() => handleCancelBooking(item.id)}
                disabled={isCancelling}
              >
                {isCancelling ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                )}
              </TouchableOpacity>
            ) : (
              <Text style={styles.noActionText}>-</Text>
            )}
          </View>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#10b981" />
        <Text style={styles.loadingText}>Loading your bookings...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={Platform.OS === 'web'}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#10b981"]}
            tintColor="#10b981"
          />
        }
        // Web-specific scroll behavior
        {...(Platform.OS === 'web' && {
          style: { height: '100vh' },
          contentContainerStyle: { minHeight: '100%' }
        })}
      >
        <LinearGradient 
          colors={["#f0fdf4", "#ecfdf5", "#d1fae5"]} 
          style={styles.gradient}
        >
          <View style={styles.mainContainer}>
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.headerContent}>
                <Image source={logo} style={styles.logo} />
                <View style={styles.headerText}>
                  <Text style={styles.headerTitle}>My Bookings</Text>
                  <Text style={styles.headerSubtitle}>
                    Manage your cleaning appointments in one place
                  </Text>
                </View>
              </View>
              
              <View style={styles.headerStats}>
                <Text style={styles.bookingCount}>
                  {filteredBookings.length} {filter === 'all' ? 'total' : filter} 
                  {filteredBookings.length === 1 ? ' booking' : ' bookings'}
                </Text>
              </View>
            </View>

            {/* Filter Tabs */}
            <View style={styles.filterContainer}>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={Platform.OS === 'web'}
                contentContainerStyle={styles.filterScrollContent}
              >
                {[
                  { key: "all", label: "All Bookings", icon: "📋" },
                  { key: "pending", label: "Pending", icon: "⏳" },
                  { key: "confirmed", label: "Confirmed", icon: "✅" },
                  { key: "completed", label: "Completed", icon: "🎉" },
                  { key: "cancelled", label: "Cancelled", icon: "❌" }
                ].map((item) => (
                  <TouchableOpacity
                    key={item.key}
                    style={[
                      styles.filterTab,
                      filter === item.key && styles.filterTabActive,
                    ]}
                    onPress={() => setFilter(item.key)}
                  >
                    <Text style={styles.filterIcon}>{item.icon}</Text>
                    <Text style={[
                      styles.filterLabel,
                      filter === item.key && styles.filterLabelActive,
                    ]}>
                      {item.label}
                    </Text>
                    {filter === item.key && (
                      <View style={styles.activeIndicator} />
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Content Area */}
            <View style={styles.contentArea}>
              {/* Desktop Table Header */}
              {!isSmallScreen && filteredBookings.length > 0 && (
                <View style={styles.tableHeader}>
                  <Text style={[styles.columnHeader, styles.serviceColumn]}>SERVICE</Text>
                  <Text style={[styles.columnHeader, styles.datetimeColumn]}>DATE & TIME</Text>
                  <Text style={[styles.columnHeader, styles.priceColumn]}>PRICE</Text>
                  <Text style={[styles.columnHeader, styles.statusColumn]}>STATUS</Text>
                  <Text style={[styles.columnHeader, styles.actionColumn]}>ACTION</Text>
                </View>
              )}

              {/* Bookings List */}
              {filteredBookings.length === 0 ? (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyStateIcon}>📅</Text>
                  <Text style={styles.emptyStateTitle}>
                    {filter === 'all' ? 'No bookings yet' : `No ${filter} bookings`}
                  </Text>
                  <Text style={styles.emptyStateText}>
                    {filter === 'all' 
                      ? "When you book a cleaning service, it will appear here." 
                      : `You don't have any ${filter} bookings at the moment.`}
                  </Text>
                  {filter !== 'all' && (
                    <TouchableOpacity 
                      style={styles.viewAllButton}
                      onPress={() => setFilter('all')}
                    >
                      <Text style={styles.viewAllButtonText}>View All Bookings</Text>
                    </TouchableOpacity>
                  )}
                </View>
              ) : (
                <View style={styles.bookingsList}>
                  {filteredBookings.map((item) => renderBookingItem(item))}
                </View>
              )}
            </View>

            {/* Footer Spacer for better scrolling */}
            <View style={styles.footerSpacer} />
          </View>
        </LinearGradient>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minHeight: Platform.OS === 'web' ? '100vh' : '100%',
    backgroundColor: '#f0fdf4',
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
    minHeight: Platform.OS === 'web' ? '100vh' : '100%',
  },
  gradient: {
    flex: 1,
    minHeight: Platform.OS === 'web' ? '100vh' : '100%',
  },
  mainContainer: {
    flex: 1,
    paddingHorizontal: Math.max(16, Platform.OS === 'web' ? 24 : 16),
    paddingVertical: Platform.OS === 'web' ? 32 : 20,
    minHeight: Platform.OS === 'web' ? '100vh' : '100%',
    maxWidth: Platform.OS === 'web' ? 1400 : '100%',
    alignSelf: 'center',
    width: '100%',
  },
  contentArea: {
    width: '100%',
    minHeight: 400,
    flex: 1,
  },
  bookingsList: {
    width: '100%',
  },
  footerSpacer: {
    height: Platform.OS === 'web' ? 100 : 50,
  },
  loadingContainer: { 
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center", 
    backgroundColor: '#f0fdf4',
    minHeight: Platform.OS === 'web' ? '100vh' : '100%',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#059669",
    fontWeight: '500',
  },
  
  // Header Styles
  header: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 20,
    padding: Platform.OS === 'web' ? 32 : 24,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    width: '100%',
    ...(Platform.OS === 'web' && {
      backdropFilter: 'blur(10px)',
      WebkitBackdropFilter: 'blur(10px)',
    }),
  },
  headerContent: {
    flexDirection: Platform.OS === 'web' ? 'row' : 'column',
    alignItems: Platform.OS === 'web' ? 'center' : 'flex-start',
    marginBottom: Platform.OS === 'web' ? 0 : 16,
  },
  headerText: {
    marginLeft: Platform.OS === 'web' ? 24 : 0,
    marginTop: Platform.OS === 'web' ? 0 : 16,
    flex: 1,
  },
  headerTitle: {
    fontSize: Platform.OS === 'web' ? 40 : 32,
    fontWeight: "bold",
    color: "#065f46",
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: Platform.OS === 'web' ? 18 : 16,
    color: "#6b7280",
    lineHeight: 24,
  },
  headerStats: {
    alignItems: Platform.OS === 'web' ? 'flex-end' : 'center',
    marginTop: Platform.OS === 'web' ? 0 : 16,
  },
  bookingCount: {
    backgroundColor: "#10b981",
    color: "white",
    fontSize: Platform.OS === 'web' ? 16 : 14,
    fontWeight: "600",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  logo: {
    width: Platform.OS === 'web' ? 80 : 60,
    height: Platform.OS === 'web' ? 80 : 60,
    resizeMode: "contain",
  },

  // Filter Styles
  filterContainer: {
    marginBottom: 24,
    width: '100%',
  },
  filterScrollContent: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  filterTab: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: "#fff",
    borderRadius: 16,
    paddingVertical: Platform.OS === 'web' ? 16 : 12,
    paddingHorizontal: Platform.OS === 'web' ? 24 : 20,
    marginHorizontal: 6,
    minWidth: Platform.OS === 'web' ? 140 : 120,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    transition: 'all 0.2s ease-in-out',
    ...(Platform.OS === 'web' && {
      cursor: 'pointer',
      ':hover': {
        transform: [{ scale: 1.02 }],
        shadowOpacity: 0.1,
      },
    }),
  },
  filterTabActive: {
    backgroundColor: "#065f46",
    shadowColor: "#065f46",
    shadowOpacity: 0.2,
  },
  filterIcon: {
    fontSize: Platform.OS === 'web' ? 18 : 16,
    marginRight: 8,
  },
  filterLabel: {
    fontSize: Platform.OS === 'web' ? 15 : 14,
    fontWeight: "600",
    color: "#6b7280",
  },
  filterLabelActive: {
    color: "#fff",
  },
  activeIndicator: {
    position: 'absolute',
    bottom: -2,
    width: 20,
    height: 3,
    backgroundColor: "#10b981",
    borderRadius: 2,
  },

  // Table Header
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#065f46",
    paddingVertical: Platform.OS === 'web' ? 20 : 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 8,
    width: '100%',
  },
  columnHeader: {
    fontSize: Platform.OS === 'web' ? 15 : 14,
    fontWeight: "700",
    color: "#fff",
    letterSpacing: 0.5,
  },
  serviceColumn: { flex: 3, textAlign: 'left' },
  datetimeColumn: { flex: 2, textAlign: 'center' },
  priceColumn: { flex: 1, textAlign: 'center' },
  statusColumn: { flex: 1.5, textAlign: 'center' },
  actionColumn: { flex: 1, textAlign: 'center' },

  // Mobile Card
  mobileCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    marginVertical: 8,
    marginHorizontal: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    width: '100%',
    maxWidth: '100%',
    ...(Platform.OS === 'web' && {
      transition: 'all 0.2s ease-in-out',
      ':hover': {
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 6,
      },
    }),
  },
  mobileCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
    width: '100%',
  },
  serviceInfo: {
    flex: 1,
    marginRight: 12,
  },
  mobileServiceName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 4,
  },
  mobileServiceDuration: {
    fontSize: 14,
    color: "#6b7280",
    fontWeight: '500',
  },
  mobileDetails: {
    marginBottom: 16,
    width: '100%',
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
    width: '100%',
  },
  detailLabel: {
    fontSize: 14,
    color: "#6b7280",
    fontWeight: "500",
  },
  detailValue: {
    fontSize: 14,
    color: "#111827",
    fontWeight: "500",
    textAlign: "right",
    flex: 1,
    marginLeft: 12,
  },

  // Desktop Card
  desktopCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    marginVertical: 6,
    marginHorizontal: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    width: '100%',
    ...(Platform.OS === 'web' && {
      transition: 'all 0.2s ease-in-out',
      ':hover': {
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 4,
        transform: [{ translateY: -1 }],
      },
    }),
  },
  desktopCardContent: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Platform.OS === 'web' ? 24 : 20,
    paddingHorizontal: 20,
    width: '100%',
  },
  serviceSection: {
    flex: 3,
  },
  desktopServiceName: {
    fontSize: Platform.OS === 'web' ? 17 : 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
  },
  desktopServiceDetails: {
    fontSize: Platform.OS === 'web' ? 14 : 13,
    color: "#6b7280",
  },
  datetimeSection: {
    flex: 2,
    alignItems: 'center',
  },
  dateText: {
    fontSize: Platform.OS === 'web' ? 15 : 14,
    fontWeight: "500",
    color: "#111827",
    marginBottom: 2,
  },
  timeText: {
    fontSize: Platform.OS === 'web' ? 14 : 13,
    color: "#6b7280",
  },
  priceSection: {
    flex: 1,
    alignItems: 'center',
  },
  priceText: {
    fontSize: Platform.OS === 'web' ? 18 : 16,
    fontWeight: "bold",
    color: "#059669",
  },
  statusSection: {
    flex: 1.5,
    alignItems: 'center',
  },
  statusBadge: {
    paddingVertical: Platform.OS === 'web' ? 8 : 6,
    paddingHorizontal: Platform.OS === 'web' ? 16 : 12,
    borderRadius: 12,
  },
  statusText: {
    fontSize: Platform.OS === 'web' ? 13 : 12,
    fontWeight: "700",
    textAlign: "center",
  },
  actionSection: {
    flex: 1,
    alignItems: 'center',
  },

  // Buttons
  cancelButton: {
    backgroundColor: "#f59e0b",
    paddingVertical: Platform.OS === 'web' ? 12 : 10,
    paddingHorizontal: Platform.OS === 'web' ? 24 : 20,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    ...(Platform.OS === 'web' && {
      cursor: 'pointer',
      transition: 'all 0.2s ease-in-out',
      ':hover': {
        backgroundColor: "#e6900b",
        transform: [{ scale: 1.05 }],
      },
    }),
  },
  cancelButtonDisabled: {
    backgroundColor: "#9ca3af",
    opacity: 0.7,
  },
  cancelButtonText: {
    color: "white",
    fontSize: Platform.OS === 'web' ? 15 : 14,
    fontWeight: "600",
  },
  noActionText: {
    color: "#9ca3af",
    fontSize: Platform.OS === 'web' ? 13 : 12,
    fontStyle: "italic",
  },

  // Empty State
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Platform.OS === 'web' ? 120 : 80,
    paddingHorizontal: 20,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    borderRadius: 20,
    marginTop: 20,
    width: '100%',
    minHeight: 300,
  },
  emptyStateIcon: {
    fontSize: Platform.OS === 'web' ? 80 : 64,
    marginBottom: 24,
  },
  emptyStateTitle: {
    fontSize: Platform.OS === 'web' ? 26 : 22,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 12,
    textAlign: "center",
  },
  emptyStateText: {
    fontSize: Platform.OS === 'web' ? 18 : 16,
    color: "#6b7280",
    textAlign: "center",
    lineHeight: 24,
    maxWidth: 400,
    marginBottom: Platform.OS === 'web' ? 24 : 0,
  },
  viewAllButton: {
    backgroundColor: "#10b981",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
    marginTop: 16,
  },
  viewAllButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default MyBookings;
