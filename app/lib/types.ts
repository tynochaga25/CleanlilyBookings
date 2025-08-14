// lib/types.ts
export interface Premise {
  id: string;
  name: string;
  address: string;
  cleaner?: string;
}

export interface InspectionIssue {
  id: string;
  area: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  image?: string;
  resolved: boolean;
}

export interface InspectionReport {
  id: string;
  premiseId: string;
  date: string;
  inspector: string;
  notes: string;
  issues: InspectionIssue[];
  overallRating: number;
}