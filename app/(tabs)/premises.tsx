import { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  TextInput, 
  ActivityIndicator,
  Alert,
  RefreshControl
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  MapPin, 
  Search, 
  CircleCheck as CheckCircle, 
  Clock, 
  TriangleAlert as AlertTriangle, 
  Plus, 
  FileText,
  Trash2 
} from 'lucide-react-native';
import { router } from 'expo-router';
import { supabase } from '../lib/supabase';
import InspectionForm from '../components/InspectionForm';
import AddPremiseModal from '../components/AddPremiseModal';

export default function Premises() {
  const [searchQuery, setSearchQuery] = useState('');
  const [premises, setPremises] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [inspectionFormVisible, setInspectionFormVisible] = useState(false);
  const [addPremiseVisible, setAddPremiseVisible] = useState(false);
  const [selectedPremise, setSelectedPremise] = useState<any>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUserEmail(user?.email || null);
    };

    getUser();
    fetchPremises();

    const subscription = supabase
      .channel('premises_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'premises' },
        () => fetchPremises()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [searchQuery]);

  const fetchPremises = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('premises')
        .select(`
          id,
          name,
          address,
          inspection_reports(
            id,
            created_at,
            overall_rating,
            inspector_name
          )
        `)
        .order('name', { ascending: true });
        
      if (searchQuery) {
        query = query.or(`name.ilike.%${searchQuery}%,address.ilike.%${searchQuery}%`);
      }

      const { data, error } = await query;

      if (error) throw error;

      setPremises(data.map(premise => ({
        id: premise.id,
        name: premise.name,
        address: premise.address,
        lastVisit: premise.inspection_reports[0]?.created_at 
          ? formatTimeAgo(premise.inspection_reports[0].created_at)
          : 'Never visited',
        status: premise.inspection_reports[0]?.overall_rating === 'Poor' 
          ? 'issues' 
          : premise.inspection_reports[0] ? 'completed' : 'pending',
        cleaner: premise.inspection_reports[0]?.inspector_name || 'Not assigned',
        nextScheduled: 'Tomorrow 9:00 AM'
      })));
    } catch (error) {
      console.error('Error fetching premises:', error);
      Alert.alert('Error', 'Failed to load premises. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchPremises();
    setRefreshing(false);
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return `${seconds} seconds ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    return `${Math.floor(seconds / 86400)} days ago`;
  };

  const handleVisitNow = (premise: any) => {
    setSelectedPremise(premise);
    setInspectionFormVisible(true);
  };

  const handleViewReports = (premiseId: number) => {
    router.push(`/reports/${premiseId}`);
  };

  const handleDeletePremise = async (premiseId: number) => {
    if (userEmail !== 'tynochagaka@gmail.com') {
      Alert.alert('Permission Denied', 'You do not have permission to delete premises.');
      return;
    }

    try {
      Alert.alert(
        'Delete Premise',
        'Are you sure you want to delete this premise? All related inspection reports will also be deleted.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: async () => {
              setLoading(true);

              const { error: reportsError } = await supabase
                .from('inspection_reports')
                .delete()
                .eq('premise_id', premiseId);

              if (reportsError) throw reportsError;

              const { error } = await supabase
                .from('premises')
                .delete()
                .eq('id', premiseId);

              if (error) throw error;

              fetchPremises();
            },
          },
        ],
        { cancelable: true }
      );
    } catch (error) {
      console.error('Error deleting premise:', error);
      Alert.alert('Error', 'Failed to delete premise. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle size={20} color="#059669" />;
      case 'issues':
        return <AlertTriangle size={20} color="#DC2626" />;
      case 'pending':
        return <Clock size={20} color="#F59E0B" />;
      default:
        return <Clock size={20} color="#6B7280" />;
    }
  };

  if (loading && premises.length === 0) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#059669" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Premises</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => setAddPremiseVisible(true)}
        >
          <Plus size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.topSection}>
        <View style={styles.searchContainer}>
          <Search size={20} color="#6B7280" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search premises..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#9CA3AF"
          />
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{premises.length}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: '#059669' }]}>
              {premises.filter(p => p.status === 'completed').length}
            </Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: '#F59E0B' }]}>
              {premises.filter(p => p.status === 'pending').length}
            </Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: '#DC2626' }]}>
              {premises.filter(p => p.status === 'issues').length}
            </Text>
            <Text style={styles.statLabel}>Issues</Text>
          </View>
        </View>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#059669']}
            tintColor="#059669"
          />
        }
      >
        {premises.length === 0 && !loading ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No premises found</Text>
            <TouchableOpacity 
              style={styles.emptyStateButton}
              onPress={() => setAddPremiseVisible(true)}
            >
              <Text style={styles.emptyStateButtonText}>Add New Premise</Text>
            </TouchableOpacity>
          </View>
        ) : (
          premises.map((premise) => (
            <View key={premise.id} style={styles.premiseCard}>
              <View style={styles.premiseHeader}>
                <View style={styles.premiseInfo}>
                  <Text style={styles.premiseName}>{premise.name}</Text>
                  <View style={styles.addressContainer}>
                    <MapPin size={14} color="#6B7280" />
                    <Text style={styles.address}>{premise.address}</Text>
                  </View>
                </View>
                <View style={styles.statusContainer}>
                  {getStatusIcon(premise.status)}
                </View>
              </View>

              <View style={styles.premiseDetails}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Last Visit:</Text>
                  <Text style={styles.detailValue}>{premise.lastVisit}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Inspector:</Text>
                  <Text style={[
                    styles.detailValue,
                    { color: premise.cleaner === 'Not assigned' ? '#DC2626' : '#111827' }
                  ]}>
                    {premise.cleaner}
                  </Text>
                </View>
              </View>

              <View style={styles.premiseActions}>
                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={() => handleVisitNow(premise)}
                >
                  <Text style={styles.actionButtonText}>Visit Now</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.actionButton, styles.secondaryButton]}
                  onPress={() => handleViewReports(premise.id)}
                >
                  <FileText size={16} color="#374151" />
                  <Text style={[styles.actionButtonText, styles.secondaryButtonText]}>
                    Reports
                  </Text>
                </TouchableOpacity>

                {userEmail === 'tynochagaka@gmail.com' && (
                  <TouchableOpacity 
                    style={[styles.actionButton, styles.deleteButton]}
                    onPress={() => handleDeletePremise(premise.id)}
                  >
                    <Trash2 size={16} color="#FFFFFF" />
                    <Text style={[styles.actionButtonText, { marginLeft: 6 }]}>
                      Delete
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* Modals */}
      {selectedPremise && (
        <InspectionForm
          visible={inspectionFormVisible}
          onClose={() => {
            setInspectionFormVisible(false);
            setSelectedPremise(null);
          }}
          premise={selectedPremise}
        />
      )}

      <AddPremiseModal
        visible={addPremiseVisible}
        onClose={() => setAddPremiseVisible(false)}
        onSuccess={() => {
          setAddPremiseVisible(false);
          fetchPremises();
        }}
      />
    </SafeAreaView>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
  },
  addButton: {
    backgroundColor: '#059669',
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topSection: {
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#111827',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#FFFFFF',
    marginTop: 12,
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  emptyState: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 16,
  },
  emptyStateButton: {
    backgroundColor: '#059669',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  emptyStateButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  premiseCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  premiseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  premiseInfo: {
    flex: 1,
  },
  premiseName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  address: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 6,
    flex: 1,
  },
  statusContainer: {
    marginLeft: 16,
  },
  premiseDetails: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '600',
  },
  premiseActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#059669',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  secondaryButton: {
    backgroundColor: '#F3F4F6',
  },
  deleteButton: {
    backgroundColor: '#DC2626',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  secondaryButtonText: {
    color: '#374151',
    marginLeft: 6,
  },
});