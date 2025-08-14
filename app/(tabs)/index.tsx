import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CircleCheck as CheckCircle, Clock, TriangleAlert as AlertTriangle, MapPin, Users, Calendar } from 'lucide-react-native';
import { router } from 'expo-router';
import { supabase } from '../lib/supabase';

export default function Dashboard() {
  const [currentDate, setCurrentDate] = useState('');
  const [currentTime, setCurrentTime] = useState('');
  const [greeting, setGreeting] = useState('');
  const [stats, setStats] = useState({
    completedToday: 0,
    pendingTasks: 0,
    issuesFound: 0,
    activePremises: 0
  });
  const [recentVisits, setRecentVisits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    updateDateTime();
    const interval = setInterval(updateDateTime, 1000);
    
    fetchDashboardData();
    
    // Set up real-time subscription
    const subscription = supabase
      .channel('dashboard_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'inspection_reports' },
        () => fetchDashboardData()
      )
      .subscribe();

    return () => {
      clearInterval(interval);
      supabase.removeChannel(subscription);
    };
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch stats
      const { data: statsData, error: statsError } = await supabase
        .from('dashboard_stats')
        .select('*')
        .maybeSingle();
      
      if (statsError) throw statsError;
      
      // Calculate pending tasks (premises without inspections today)
      const { count: pendingCount } = await supabase
        .from('premises')
        .select('*', { count: 'exact', head: true })
        .not('id', 'in', 
          supabase
            .from('inspection_reports')
            .select('premise_id')
            .eq('date', new Date().toISOString().split('T')[0])
        );
      
      setStats({
        completedToday: statsData.completed_today,
        pendingTasks: pendingCount || 0,
        issuesFound: statsData.issues_found,
        activePremises: statsData.active_premises
      });
      
      // Fetch recent visits
      const { data: visitsData, error: visitsError } = await supabase
        .from('inspection_reports')
        .select(`
          id,
          created_at,
          overall_rating,
          inspector_name,
          premises(name)
        `)
        .order('created_at', { ascending: false })
        .limit(3);
      
      if (visitsError) throw visitsError;
      
      setRecentVisits(visitsData.map(visit => ({
        id: visit.id,
        premise: visit.premises?.name || 'Unknown Premise',
        time: formatTimeAgo(visit.created_at),
        status: visit.overall_rating === 'Poor' ? 'issues' : 'completed',
        cleaner: visit.inspector_name,
        rating: visit.overall_rating
      })));
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
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

  const updateDateTime = () => {
    const now = new Date();
    
    // Format date
    const options: Intl.DateTimeFormatOptions = { weekday: 'long', month: 'short', day: 'numeric' };
    const formattedDate = now.toLocaleDateString('en-US', options);
    setCurrentDate(formattedDate);
    
    // Format time
    const hours = now.getHours();
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 || 12;
    setCurrentTime(`${formattedHours}:${minutes} ${ampm}`);
    
    // Set greeting
    if (hours < 12) setGreeting('Good Morning!');
    else if (hours < 18) setGreeting('Good Afternoon!');
    else setGreeting('Good Evening!');
  };

  const statsData = [
    { title: 'Completed Today', value: stats.completedToday.toString(), icon: CheckCircle, color: '#059669' },
    { title: 'Pending Tasks', value: stats.pendingTasks.toString(), icon: Clock, color: '#F59E0B' },
    { title: 'Issues Found', value: stats.issuesFound.toString(), icon: AlertTriangle, color: '#DC2626' },
    { title: 'Active Premises', value: stats.activePremises.toString(), icon: MapPin, color: '#3B82F6' },
  ];

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#059669" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.headerTextContainer}>
              <Text style={styles.greeting}>{greeting}</Text>
              <Text style={styles.subtitle}>Quality Control Dashboard</Text>
            </View>
            <View style={styles.dateContainer}>
              <Calendar size={20} color="#059669" style={styles.calendarIcon} />
              <View>
                <Text style={styles.date}>{currentDate}</Text>
                <Text style={styles.time}>{currentTime}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          {statsData.map((stat, index) => (
            <TouchableOpacity key={index} style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: `${stat.color}15` }]}>
                <stat.icon size={24} color={stat.color} />
              </View>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statTitle}>{stat.title}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionGrid}>
            <TouchableOpacity 
              style={styles.actionCard}
              onPress={() => router.push('/premises')}
            >
              <MapPin size={24} color="#059669" />
              <Text style={styles.actionText}>Visit Premise</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.actionCard}
              onPress={() => router.push('/team')}
            >
              <Users size={24} color="#059669" />
              <Text style={styles.actionText}>Get Help</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Visits */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Visits</Text>
          {recentVisits.map((visit) => (
            <TouchableOpacity 
              key={visit.id} 
              style={styles.visitCard}
              onPress={() => router.push(`/reports/${visit.id}`)}
            >
              <View style={styles.visitHeader}>
                <Text style={styles.premiseName}>{visit.premise}</Text>
                <View style={[
                  styles.statusBadge,
                  { backgroundColor: visit.status === 'completed' ? '#059669' : '#DC2626' }
                ]}>
                  <Text style={styles.statusText}>
                    {visit.status === 'completed' ? 'Completed' : 'Issues'}
                  </Text>
                </View>
              </View>
              <View style={styles.visitDetails}>
                <Text style={styles.cleanerName}>Inspector: {visit.cleaner}</Text>
                <Text style={styles.visitTime}>{visit.time}</Text>
              </View>
              <Text style={[
                styles.rating,
                { color: visit.status === 'completed' ? '#059669' : '#DC2626' }
              ]}>
                Rating: {visit.rating}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
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
    padding: 20,
    backgroundColor: '#FFFFFF',
    marginBottom: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTextContainer: {
    flex: 1,
  },
  greeting: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 15,
    color: '#6B7280',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    marginLeft: 10,
  },
  calendarIcon: {
    marginRight: 8,
  },
  date: {
    fontSize: 13,
    fontWeight: '600',
    color: '#059669',
  },
  time: {
    fontSize: 13,
    fontWeight: '600',
    color: '#059669',
    textAlign: 'right',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  statCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    marginRight: '2%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  statTitle: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    fontWeight: '500',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  actionGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    marginHorizontal: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  actionText: {
    marginTop: 12,
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  visitCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  visitHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  premiseName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  visitDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  cleanerName: {
    fontSize: 14,
    color: '#6B7280',
  },
  visitTime: {
    fontSize: 14,
    color: '#6B7280',
  },
  rating: {
    fontSize: 14,
    fontWeight: '600',
  },
});