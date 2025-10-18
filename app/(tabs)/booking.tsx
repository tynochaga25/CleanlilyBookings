import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  Alert,
  useWindowDimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { supabase } from "../lib/supabase";

const logo = require("../cleanlily.png");

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [userId, setUserId] = useState<string | null>(null);
  const { width, height } = useWindowDimensions();
  
  // Responsive breakpoints
  const isSmallScreen = width < 768;
  const isLargeScreen = width > 1024;
  const isExtraLargeScreen = width > 1440;

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
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    Alert.alert(
      "Confirm Cancellation",
      "Are you sure you want to cancel this booking?",
      [
        {
          text: "No",
          style: "cancel"
        },
        { 
          text: "Yes", 
          onPress: async () => {
            try {
              const { error } = await supabase
                .from("bookings")
                .update({ status: "cancelled" })
                .eq("id", bookingId);
              
              if (error) throw error;
              
              setBookings(bookings.map(booking => 
                booking.id === bookingId 
                  ? { ...booking, status: "cancelled" } 
                  : booking
              ));
              
              Alert.alert("Success", "Booking cancelled successfully");
            } catch (error) {
              console.error("Error cancelling booking:", error);
              Alert.alert("Error", "Failed to cancel booking");
            }
          }
        }
      ]
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
    return booking.status === "pending" || booking.status === "confirmed";
  };

  const renderBookingItem = ({ item }) => {
    if (isSmallScreen) {
      return (
        <View style={styles.mobileCard}>
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
              style={styles.cancelButton}
              onPress={() => handleCancelBooking(item.id)}
            >
              <Text style={styles.cancelButtonText}>Cancel Booking</Text>
            </TouchableOpacity>
          )}
        </View>
      );
    }

    return (
      <View style={styles.desktopCard}>
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
                style={styles.cancelButton}
                onPress={() => handleCancelBooking(item.id)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
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
    <LinearGradient 
      colors={["#f0fdf4", "#ecfdf5", "#d1fae5"]} 
      style={styles.gradient}
    >
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={[
          styles.container, 
          isExtraLargeScreen && styles.containerExtraLarge,
          isLargeScreen && styles.containerLarge,
          isSmallScreen && styles.containerSmall
        ]}>
          {/* Simplified Header */}
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

          {/* Enhanced Filter Tabs */}
          <View style={styles.filterContainer}>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
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
            </View>
          ) : (
            <FlatList
              data={filteredBookings}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              renderItem={renderBookingItem}
              contentContainerStyle={styles.listContent}
            />
          )}
        </View>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  containerSmall: {
    paddingHorizontal: 12,
    paddingVertical: 16,
  },
  containerLarge: {
    paddingHorizontal: 24,
    paddingVertical: 24,
    maxWidth: 1200,
    alignSelf: 'center',
    width: '100%',
  },
  containerExtraLarge: {
    maxWidth: 1400,
  },
  loadingContainer: { 
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center", 
    backgroundColor: '#f0fdf4',
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
    padding: 24,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerText: {
    marginLeft: 16,
    flex: 1,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#065f46",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: "#6b7280",
    lineHeight: 22,
  },
  headerStats: {
    alignItems: 'center',
  },
  bookingCount: {
    backgroundColor: "#10b981",
    color: "white",
    fontSize: 14,
    fontWeight: "600",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  logo: {
    width: 60,
    height: 60,
    resizeMode: "contain",
  },

  // Filter Styles
  filterContainer: {
    marginBottom: 24,
  },
  filterScrollContent: {
    paddingHorizontal: 8,
  },
  filterTab: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: "#fff",
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginHorizontal: 6,
    minWidth: 120,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  filterTabActive: {
    backgroundColor: "#065f46",
    shadowColor: "#065f46",
    shadowOpacity: 0.2,
  },
  filterIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  filterLabel: {
    fontSize: 14,
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
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 8,
  },
  columnHeader: {
    fontSize: 14,
    fontWeight: "700",
    color: "#fff",
    letterSpacing: 0.5,
  },
  serviceColumn: { flex: 3, textAlign: 'left' },
  datetimeColumn: { flex: 2, textAlign: 'center' },
  priceColumn: { flex: 1, textAlign: 'center' },
  statusColumn: { flex: 1.5, textAlign: 'center' },
  actionColumn: { flex: 1, textAlign: 'center' },

  // List Content
  listContent: {
    paddingBottom: 20,
  },

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
  },
  mobileCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
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
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
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
  },
  desktopCardContent: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  serviceSection: {
    flex: 3,
  },
  desktopServiceName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
  },
  desktopServiceDetails: {
    fontSize: 13,
    color: "#6b7280",
  },
  datetimeSection: {
    flex: 2,
    alignItems: 'center',
  },
  dateText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#111827",
    marginBottom: 2,
  },
  timeText: {
    fontSize: 13,
    color: "#6b7280",
  },
  priceSection: {
    flex: 1,
    alignItems: 'center',
  },
  priceText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#059669",
  },
  statusSection: {
    flex: 1.5,
    alignItems: 'center',
  },
  statusBadge: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
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
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cancelButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  noActionText: {
    color: "#9ca3af",
    fontSize: 12,
    fontStyle: "italic",
  },

  // Empty State
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
    paddingHorizontal: 20,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    borderRadius: 20,
    marginTop: 20,
  },
  emptyStateIcon: {
    fontSize: 64,
    marginBottom: 20,
  },
  emptyStateTitle: {
    fontSize: 22,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 12,
    textAlign: "center",
  },
  emptyStateText: {
    fontSize: 16,
    color: "#6b7280",
    textAlign: "center",
    lineHeight: 24,
    maxWidth: 400,
  },
});

export default MyBookings;