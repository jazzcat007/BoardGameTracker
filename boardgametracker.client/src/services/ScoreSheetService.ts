import { axiosInstance } from '../utils/axiosInstance';
import { ScoreSheetTemplate, ScoreSession } from '../models/ScoreSheet';

const templateDomain = 'score-sheet-template';
const sessionDomain = 'score-session';

export const getAllTemplates = (signal?: AbortSignal): Promise<ScoreSheetTemplate[]> => {
  return axiosInstance.get<ScoreSheetTemplate[]>(templateDomain, { signal }).then((response: { data: ScoreSheetTemplate[] }) => {
    return response.data;
  });
};

export const getTemplateById = (id: number, signal?: AbortSignal): Promise<ScoreSheetTemplate> => {
  return axiosInstance.get<ScoreSheetTemplate>(`${templateDomain}/${id}`, { signal }).then((response: { data: ScoreSheetTemplate }) => {
    return response.data;
  });
};

export const createTemplate = (template: Omit<ScoreSheetTemplate, 'id'>): Promise<ScoreSheetTemplate> => {
  return axiosInstance.post<ScoreSheetTemplate>(templateDomain, template).then((response: { data: ScoreSheetTemplate }) => {
    return response.data;
  });
};

export const updateTemplate = (template: ScoreSheetTemplate): Promise<ScoreSheetTemplate> => {
  return axiosInstance.put<ScoreSheetTemplate>(templateDomain, template).then((response: { data: ScoreSheetTemplate }) => {
    return response.data;
  });
};

export const deleteTemplate = (id: number): Promise<void> => {
  return axiosInstance.delete(`${templateDomain}/${id}`);
};

export const getTemplatesByGame = (gameId: number, signal?: AbortSignal): Promise<ScoreSheetTemplate[]> => {
  return axiosInstance.get<ScoreSheetTemplate[]>(`${templateDomain}/by-game/${gameId}`, { signal }).then((response: { data: ScoreSheetTemplate[] }) => {
    return response.data;
  });
};

export const getAllSessions = (signal?: AbortSignal): Promise<ScoreSession[]> => {
  return axiosInstance.get<ScoreSession[]>(sessionDomain, { signal }).then((response: { data: ScoreSession[] }) => {
    return response.data;
  });
};

export const getSessionById = (id: number, signal?: AbortSignal): Promise<ScoreSession> => {
  return axiosInstance.get<ScoreSession>(`${sessionDomain}/${id}`, { signal }).then((response: { data: ScoreSession }) => {
    return response.data;
  });
};

export const createSession = (session: Omit<ScoreSession, 'id'>): Promise<ScoreSession> => {
  return axiosInstance.post<ScoreSession>(sessionDomain, session).then((response: { data: ScoreSession }) => {
    return response.data;
  });
};

export const updateSession = (session: ScoreSession): Promise<ScoreSession> => {
  return axiosInstance.put<ScoreSession>(sessionDomain, session).then((response: { data: ScoreSession }) => {
    return response.data;
  });
};

export const deleteSession = (id: number): Promise<void> => {
  return axiosInstance.delete(`${sessionDomain}/${id}`);
};

export const completeSession = (id: number): Promise<ScoreSession> => {
  return axiosInstance.post<ScoreSession>(`${sessionDomain}/${id}/complete`).then((response: { data: ScoreSession }) => {
    return response.data;
  });
};

export const getSessionsByGame = (gameId: number, signal?: AbortSignal): Promise<ScoreSession[]> => {
  return axiosInstance.get<ScoreSession[]>(`${sessionDomain}/by-game/${gameId}`, { signal }).then((response: { data: ScoreSession[] }) => {
    return response.data;
  });
};

export const getSessionsByUser = (userId: string, signal?: AbortSignal): Promise<ScoreSession[]> => {
  return axiosInstance.get<ScoreSession[]>(`${sessionDomain}/by-user/${userId}`, { signal }).then((response: { data: ScoreSession[] }) => {
    return response.data;
  });
};
