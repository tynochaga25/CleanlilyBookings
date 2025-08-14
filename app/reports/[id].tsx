import { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, 
  ActivityIndicator, Alert, Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import {
  ArrowLeft, Calendar, User, Clock, FileText, Download,
  Star, MapPin, ChevronRight, Table2
} from 'lucide-react-native';
import { supabase } from '../lib/supabase';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import * as XLSX from 'xlsx';

// Replace with your actual company logo import
const companyLogo = require('../cleanlily.png');

interface ReportArea {
  rating: string;
  comment?: string;
}

interface Report {
  id: number;
  date: string;
  time: string;
  inspector_name: string;
  overall_rating: string;
  sites_visited: string;
  areas: Record<string, ReportArea>;
  client_feedback?: string;
  time_in: string;
  time_out: string;
  created_at: string;
}

interface Premise {
  id: number;
  name: string;
  address: string;
}

export default function ReportsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [premise, setPremise] = useState<Premise | null>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [generatingPdfId, setGeneratingPdfId] = useState<number | null>(null);
  const [generatingExcelId, setGeneratingExcelId] = useState<number | null>(null);
  const [expandedReportId, setExpandedReportId] = useState<number | null>(null);

  const companyInfo = {
    name: "Cleanlily Cleaners",
    slogan: "Professional Cleaning Services",
    address: "21 Downie Avenue, Belgravia, Harare, Zimbabwe",
    phone: "+263 78 411 5935",
    email: "info@cleanlily.co.zw",
    website: "https://cleanlily.co.zw",
    services: [
      "Office Cleaning",
      "Industrial Cleaning",
      "Home Cleaning",
      "Post Construction Cleaning",
      "Window Cleaning",
      "Carpet Cleaning"
    ]
  };

  useEffect(() => {
    fetchPremiseAndReports();
  }, [id]);

  const fetchPremiseAndReports = async () => {
    try {
      setLoading(true);
      
      const { data: premiseData, error: premiseError } = await supabase
        .from('premises')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      
      if (premiseError) throw premiseError;
      setPremise(premiseData);
      
      const { data: reportsData, error: reportsError } = await supabase
        .from('inspection_reports')
        .select(`*, report_areas(*)`)
        .eq('premise_id', id)
        .order('created_at', { ascending: false });
      
      if (reportsError) throw reportsError;
      
      const formattedReports = reportsData.map(report => ({
        id: report.id,
        date: new Date(report.date).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        }),
        time: formatTime(report.created_at),
        inspector_name: report.inspector_name,
        overall_rating: report.overall_rating,
        sites_visited: report.sites_visited,
        areas: report.report_areas.reduce((acc: Record<string, ReportArea>, area: any) => {
          acc[area.area_name] = {
            rating: area.rating,
            comment: area.comments
          };
          return acc;
        }, {}),
        client_feedback: report.client_feedback,
        time_in: report.time_in,
        time_out: report.time_out,
        created_at: report.created_at
      }));
      
      setReports(formattedReports);
    } catch (error) {
      console.error('Error fetching reports:', error);
      Alert.alert('Error', 'Failed to load reports. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRatingColor = (rating: string) => {
    switch (rating) {
      case 'Excellent': return '#059669';
      case 'Very Good': return '#10B981';
      case 'Good': return '#F59E0B';
      case 'Poor': return '#DC2626';
      default: return '#6B7280';
    }
  };

  const toggleReportExpansion = (reportId: number) => {
    setExpandedReportId(expandedReportId === reportId ? null : reportId);
  };

  const generateHtmlContent = (report: Report, premise: Premise) => {
    return `
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            .header { display: flex; justify-content: space-between; margin-bottom: 20px; }
            .company-info { margin-bottom: 10px; }
            .company-name { font-size: 18px; font-weight: bold; color: #111827; }
            .company-slogan { font-size: 14px; color: #4B5563; margin-bottom: 5px; }
            .report-title { 
              font-size: 22px; 
              font-weight: bold; 
              color: #059669; 
              text-align: center;
              margin: 15px 0;
            }
            .section { margin-bottom: 15px; }
            .section-title { 
              font-weight: bold; 
              font-size: 16px; 
              margin-bottom: 8px;
              color: #111827;
              border-bottom: 2px solid #059669;
              padding-bottom: 4px;
            }
            .info-row { display: flex; margin-bottom: 5px; }
            .info-label { width: 150px; font-weight: bold; color: #374151; }
            .info-value { color: #4B5563; }
            .area-item { 
              margin-bottom: 10px; 
              padding: 10px;
              background-color: #F9FAFB;
              border-radius: 6px;
            }
            .area-header { display: flex; justify-content: space-between; }
            .area-name { font-weight: 600; color: #111827; }
            .rating { 
              padding: 2px 8px; 
              border-radius: 4px; 
              font-weight: bold;
              font-size: 12px;
            }
            .comment { 
              color: #4B5563; 
              margin-top: 4px;
              padding: 8px;
              background-color: white;
              border-radius: 4px;
            }
            .footer {
              margin-top: 30px;
              padding-top: 10px;
              border-top: 1px solid #E5E7EB;
              font-size: 12px;
              color: #6B7280;
              text-align: center;
            }
            .logo { height: 60px; margin-bottom: 10px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="company-info">
              <img src="https://cleanlily.co.zw/wp-content/uploads/2024/04/Cleanlily-Cleaners-logo-png.png" class="logo" alt="Clean Lily Logo">
              <div class="company-name">${companyInfo.name}</div>
              <div class="company-slogan">${companyInfo.slogan}</div>
              <div>${companyInfo.address}</div>
              <div>Phone: ${companyInfo.phone}</div>
            </div>
            <div>
              <div>Report ID: ${report.id}</div>
              <div>Date Generated: ${new Date().toLocaleDateString()}</div>
            </div>
          </div>

          <div class="report-title">${premise.name} Inspection Report</div>

          <div class="section">
            <div class="section-title">Inspection Details</div>
            <div class="info-row">
              <span class="info-label">Premise Name:</span>
              <span class="info-value">${premise.name}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Address:</span>
              <span class="info-value">${premise.address}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Inspection Date:</span>
              <span class="info-value">${report.date}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Time:</span>
              <span class="info-value">${report.time_in} - ${report.time_out}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Inspector:</span>
              <span class="info-value">${report.inspector_name}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Overall Rating:</span>
              <span class="rating" style="color: ${getRatingColor(report.overall_rating)}; background-color: ${getRatingColor(report.overall_rating)}20">
                ${report.overall_rating}
              </span>
            </div>
          </div>

          <div class="section">
            <div class="section-title">Areas Inspected</div>
            ${Object.entries(report.areas).map(([area, details]) => `
              <div class="area-item">
                <div class="area-header">
                  <span class="area-name">${area}</span>
                  <span class="rating" style="color: ${getRatingColor(details.rating)}; background-color: ${getRatingColor(details.rating)}20">
                    ${details.rating}
                  </span>
                </div>
                ${details.comment ? `<div class="comment">${details.comment}</div>` : ''}
              </div>
            `).join('')}
          </div>

          ${report.client_feedback ? `
            <div class="section">
              <div class="section-title">Client Feedback</div>
              <div class="comment">${report.client_feedback}</div>
            </div>
          ` : ''}

          <div class="footer">
            ${companyInfo.name} - ${companyInfo.slogan}<br>
            ${companyInfo.address} | Phone: ${companyInfo.phone} | Email: ${companyInfo.email}<br>
            Generated on ${new Date().toLocaleDateString()}
          </div>
        </body>
      </html>
    `;
  };

  const handleExportPDF = async (reportId: number) => {
    if (!premise) return;

    const report = reports.find(r => r.id === reportId);
    if (!report) return;

    try {
      setGeneratingPdfId(reportId);
      
      const html = generateHtmlContent(report, premise);
      
      const { uri } = await Print.printToFileAsync({
        html,
        width: 612,
        height: 792,
        base64: false
      });

      if (!uri) throw new Error('Failed to generate PDF file');

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          mimeType: 'application/pdf',
          dialogTitle: 'Share Inspection Report',
          UTI: 'com.adobe.pdf'
        });
      } else {
        Alert.alert('Success', `PDF generated at: ${uri}`);
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      Alert.alert('Error', 'Failed to generate PDF. Please try again.');
    } finally {
      setGeneratingPdfId(null);
    }
  };

  const handleExportExcel = async (reportId: number) => {
    if (!premise) return;

    const report = reports.find(r => r.id === reportId);
    if (!report) return;

    try {
      setGeneratingExcelId(reportId);
      
      // Prepare data for Excel
      const excelData = [
        // Header row
        ['Cleanlily Cleaners - Inspection Report'],
        [''],
        ['Premise Name', premise.name],
        ['Address', premise.address],
        ['Inspection Date', report.date],
        ['Time', `${report.time_in} - ${report.time_out}`],
        ['Inspector', report.inspector_name],
        ['Overall Rating', report.overall_rating],
        ['Sites Visited', report.sites_visited],
        [''],
        ['Areas Inspected', 'Rating', 'Comments']
      ];

      // Add areas data
      Object.entries(report.areas).forEach(([area, details]) => {
        excelData.push([area, details.rating, details.comment || '']);
      });

      // Add client feedback if exists
      if (report.client_feedback) {
        excelData.push(['']);
        excelData.push(['Client Feedback']);
        excelData.push([report.client_feedback]);
      }

      // Create workbook
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.aoa_to_sheet(excelData);
      
      // Set column widths
      ws['!cols'] = [
        { wch: 30 }, // Area name column width
        { wch: 15 }, // Rating column width
        { wch: 50 }  // Comments column width
      ];

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(wb, ws, 'Inspection Report');

      // Generate file
      const wbout = XLSX.write(wb, { type: 'base64', bookType: 'xlsx' });
      
      // Get directory and create file path
      const directory = `${FileSystem.cacheDirectory}Cleanlily`;
      await FileSystem.makeDirectoryAsync(directory, { intermediates: true });
      
      const fileUri = `${directory}/Report_${reportId}.xlsx`;
      await FileSystem.writeAsStringAsync(fileUri, wbout, {
        encoding: FileSystem.EncodingType.Base64
      });

      // Share the file
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          dialogTitle: 'Share Inspection Report',
          UTI: 'org.openxmlformats.spreadsheetml.sheet'
        });
      } else {
        Alert.alert('Success', `Excel file generated at: ${fileUri}`);
      }
    } catch (error) {
      console.error('Error generating Excel:', error);
      Alert.alert('Error', 'Failed to generate Excel file. Please try again.');
    } finally {
      setGeneratingExcelId(null);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#059669" />
      </SafeAreaView>
    );
  }

  if (!premise) {
    return (
      <SafeAreaView style={styles.container}>
        <Text>Premise not found</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with company branding */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Image source={companyLogo} style={styles.logo} />
          <View>
            <Text style={styles.companyName}>Inspection Reports</Text>
          </View>
        </View>
      </View>

      {/* Premise information */}
      <View style={styles.premiseCard}>
        <Text style={styles.premiseName}>{premise.name}</Text>
        <View style={styles.addressContainer}>
          <MapPin size={16} color="#6B7280" />
          <Text style={styles.premiseAddress}>{premise.address}</Text>
        </View>
        <View style={styles.reportSummary}>
          <Text style={styles.summaryText}>
            <Text style={styles.summaryNumber}>{reports.length}</Text> inspections
          </Text>
        </View>
      </View>

      {/* Reports list */}
      <ScrollView style={styles.reportsContainer}>
        <Text style={styles.sectionTitle}>Inspection Reports</Text>
        
        {reports.map((report) => (
          <View key={report.id} style={styles.reportCard}>
            <TouchableOpacity 
              onPress={() => toggleReportExpansion(report.id)}
              activeOpacity={0.9}
            >
              <View style={styles.reportHeader}>
                <View style={styles.reportDateContainer}>
                  <Calendar size={18} color="#059669" />
                  <Text style={styles.reportDate}>{report.date}</Text>
                </View>
                <View style={[
                  styles.ratingContainer,
                  { backgroundColor: `${getRatingColor(report.overall_rating)}15` }
                ]}>
                  <Text style={[
                    styles.ratingText,
                    { color: getRatingColor(report.overall_rating) }
                  ]}>
                    {report.overall_rating}
                  </Text>
                </View>
              </View>

              <View style={styles.reportDetails}>
                <View style={styles.detailRow}>
                  <User size={16} color="#6B7280" />
                  <Text style={styles.detailText}>{report.inspector_name}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Clock size={16} color="#6B7280" />
                  <Text style={styles.detailText}>{report.time_in} - {report.time_out}</Text>
                </View>
              </View>

              <View style={styles.reportFooter}>
                <Text style={styles.sitesText}>{report.sites_visited} sites visited</Text>
                <View style={styles.actions}>
                  <TouchableOpacity 
                    style={[styles.exportButton, { backgroundColor: '#059669' }]}
                    onPress={(e) => {
                      e.stopPropagation();
                      handleExportPDF(report.id);
                    }}
                    disabled={generatingPdfId === report.id}
                  >
                    {generatingPdfId === report.id ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <>
                        <Download size={16} color="#FFFFFF" />
                        <Text style={styles.exportButtonText}>PDF</Text>
                      </>
                    )}
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[styles.exportButton, { backgroundColor: '#1D4ED8', marginLeft: 8 }]}
                    onPress={(e) => {
                      e.stopPropagation();
                      handleExportExcel(report.id);
                    }}
                    disabled={generatingExcelId === report.id}
                  >
                    {generatingExcelId === report.id ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <>
                        <Table2 size={16} color="#FFFFFF" />
                        <Text style={styles.exportButtonText}>Excel</Text>
                      </>
                    )}
                  </TouchableOpacity>
                  
                  <ChevronRight 
                    size={20} 
                    color="#9CA3AF" 
                    style={{
                      transform: [{ rotate: expandedReportId === report.id ? '90deg' : '0deg' }],
                      marginLeft: 12
                    }}
                  />
                </View>
              </View>
            </TouchableOpacity>

            {expandedReportId === report.id && (
              <View style={styles.expandedContent}>
                {/* Areas Inspected */}
                <Text style={styles.subSectionTitle}>Areas Inspected</Text>
                {Object.entries(report.areas).map(([area, details]) => (
                  <View key={area} style={styles.areaItem}>
                    <View style={styles.areaHeader}>
                      <Text style={styles.areaName}>{area}</Text>
                      <View style={[
                        styles.areaRating,
                        { backgroundColor: `${getRatingColor(details.rating)}15` }
                      ]}>
                        <Text style={[
                          styles.areaRatingText,
                          { color: getRatingColor(details.rating) }
                        ]}>
                          {details.rating}
                        </Text>
                      </View>
                    </View>
                    {details.comment && (
                      <Text style={styles.areaComment}>{details.comment}</Text>
                    )}
                  </View>
                ))}

                {/* Client Feedback */}
                {report.client_feedback && (
                  <>
                    <Text style={styles.subSectionTitle}>Client Feedback</Text>
                    <Text style={styles.clientFeedback}>{report.client_feedback}</Text>
                  </>
                )}
              </View>
            )}
          </View>
        ))}
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
    backgroundColor: '#059669',
    paddingBottom: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  backButton: {
    marginRight: 16,
  },
  logo: {
    width: 60,
    height: 30,
    borderRadius: 8,
    marginRight: 12,
  },
  companyName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  premiseCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    margin: 20,
    marginTop: -10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  premiseName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  premiseAddress: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 6,
  },
  reportSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryText: {
    fontSize: 14,
    color: '#6B7280',
  },
  summaryNumber: {
    fontWeight: '700',
    color: '#059669',
  },
  reportsContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  reportCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  reportDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reportDate: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginLeft: 8,
  },
  ratingContainer: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
  },
  reportDetails: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  detailText: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 8,
  },
  reportFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  sitesText: {
    fontSize: 14,
    color: '#6B7280',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  exportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  exportButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 6,
  },
  expandedContent: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  subSectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
    marginTop: 8,
  },
  areaItem: {
    marginBottom: 12,
    padding: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
  },
  areaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  areaName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
  },
  areaRating: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  areaRatingText: {
    fontSize: 12,
    fontWeight: '600',
  },
  areaComment: {
    fontSize: 14,
    color: '#4B5563',
    marginTop: 8,
    lineHeight: 20,
  },
  clientFeedback: {
    fontSize: 14,
    color: '#4B5563',
    marginTop: 8,
    lineHeight: 20,
    padding: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
  },
});