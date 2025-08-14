// lib/storage.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Premise, InspectionReport } from '../types';

const PREMISES_KEY = '@premises';
const REPORTS_KEY = '@reports';

export const getPremises = async (): Promise<Premise[]> => {
  const jsonValue = await AsyncStorage.getItem(PREMISES_KEY);
  return jsonValue ? JSON.parse(jsonValue) : [];
};

export const addPremise = async (premise: Omit<Premise, 'id'>): Promise<Premise> => {
  const premises = await getPremises();
  const newPremise = {
    ...premise,
    id: Date.now().toString(),
  };
  await AsyncStorage.setItem(PREMISES_KEY, JSON.stringify([...premises, newPremise]));
  return newPremise;
};

export const getReports = async (): Promise<InspectionReport[]> => {
  const jsonValue = await AsyncStorage.getItem(REPORTS_KEY);
  return jsonValue ? JSON.parse(jsonValue) : [];
};

export const saveReport = async (report: Omit<InspectionReport, 'id'>): Promise<void> => {
  const reports = await getReports();
  const newReport = {
    ...report,
    id: Date.now().toString(),
  };
  await AsyncStorage.setItem(REPORTS_KEY, JSON.stringify([...reports, newReport]));
};

export const getReportsForPremise = async (premiseId: string): Promise<InspectionReport[]> => {
  const reports = await getReports();
  return reports.filter(r => r.premiseId === premiseId);
};