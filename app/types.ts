export interface Premise {
  id: number;
  name: string;
  address: string;
  lastVisit: string;
  status: 'completed' | 'issues' | 'pending';
  cleaner: string;
  nextScheduled: string;
}

export interface InspectionData {
  id: string;
  premiseId: number;
  date: string;
  inspector: string;
  checklist: {
    item: string;
    status: 'pass' | 'fail' | 'na';
    notes: string;
  }[];
  overallStatus: 'completed' | 'issues' | 'pending';
  issuesFound: number;
  images?: string[];
  signature?: string;
}