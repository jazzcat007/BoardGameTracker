export interface ScoreSheetTemplate {
  id?: number;
  name: string;
  description: string;
  mode: 'rounds' | 'categories' | 'hybrid';
  minPlayers: number;
  maxPlayers: number;
  version: string;
  jsonDefinition: string;
  gameId?: number;
  isPublic: boolean;
  createdByUserId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ScoreSheetTemplateDefinition {
  fields: ScoreField[];
  rules?: ScoreRule[];
  sections?: ScoreSection[];
}

export interface ScoreField {
  id: string;
  name: string;
  type: 'number' | 'text' | 'checkbox';
  defaultValue?: number | string | boolean;
  minValue?: number;
  maxValue?: number;
  isRequired?: boolean;
  sectionId?: string;
}

export interface ScoreSection {
  id: string;
  name: string;
  order: number;
}

export interface ScoreRule {
  id: string;
  name: string;
  expression: string;
  targetFieldId: string;
}