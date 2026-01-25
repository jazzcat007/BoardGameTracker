export interface ScoreSession {
  id?: number;
  name: string;
  scoreSheetTemplateId: number;
  templateVersionSnapshot: string;
  jsonData: string;
  gameId?: number;
  locationId?: number;
  createdByUserId: string;
  createdAt: Date;
  updatedAt: Date;
  finishedAt?: Date;
  notes: string;
  isCompleted: boolean;
}

export interface ScoreSessionData {
  players: ScorePlayer[];
  rounds?: ScoreRound[];
  fieldValues: Record<string, Record<string, any>>; // playerId -> fieldId -> value
  totals: Record<string, number>; // playerId -> total
}

export interface ScorePlayer {
  id: string;
  name: string;
  order: number;
}

export interface ScoreRound {
  id: string;
  name: string;
  order: number;
  fieldValues: Record<string, Record<string, any>>; // playerId -> fieldId -> value
}