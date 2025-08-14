export interface Premise {
  id: string;
  name: string;
  address: string;
  lastVisit?: string;
  status?: 'completed' | 'issues' | 'pending';
  cleaner?: string;
  nextScheduled?: string;
}

export interface Inspection {
  id: string;
  premiseId: string;
  premiseName: string;
  premiseAddress: string;
  inspectorName: string;
  date: string;
  timeIn: string;
  timeOut: string;
  sitesVisited: number;
  clientFeedback: string;
  overallRating: string;
  areas: InspectionArea[];
  createdAt: string;
}

export interface InspectionArea {
  name: string;
  rating: string;
  comments: string;
}