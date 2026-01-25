import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Bars } from 'react-loading-icons';

import { BgtPage } from '@/components/BgtLayout/BgtPage';
import { BgtPageContent } from '@/components/BgtLayout/BgtPageContent';
import { BgtCenteredCard } from '@/components/BgtCard/BgtCenteredCard';
import { BgtInputField } from '@/components/BgtForm/BgtInputField';
import BgtButton from '@/components/BgtButton/BgtButton';
import { useToast } from '@/providers/BgtToastProvider';

import { getSessionById, updateSession, completeSession } from '@/services/ScoreSheetService';
import { ScoreSession, ScoreSessionData, ScorePlayer } from '@/models/ScoreSheet';
import { deserializeTemplateDefinition, calculateTotals } from '@/utils/scoreSheetUtils';

export const ScoreSessionPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { sessionId } = useParams<{ sessionId: string }>();
  const { showInfoToast, showErrorToast } = useToast();

  const [session, setSession] = useState<ScoreSession | null>(null);
  const [sessionData, setSessionData] = useState<ScoreSessionData | null>(null);
  const [templateDefinition, setTemplateDefinition] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    const loadSession = async () => {
      try {
        if (sessionId) {
          const loadedSession = await getSessionById(parseInt(sessionId));
          setSession(loadedSession);

          if (loadedSession.jsonData) {
            const data = JSON.parse(loadedSession.jsonData);
            setSessionData(data);
            setNotes(loadedSession.notes || '');
          }

          if (loadedSession.templateVersionSnapshot) {
            const definition = JSON.parse(loadedSession.templateVersionSnapshot);
            setTemplateDefinition(definition);
          }
        }
      } catch (error) {
        console.error('Failed to load session:', error);
        showErrorToast('Failed to load score session');
      } finally {
        setIsLoading(false);
      }
    };

    loadSession();
  }, [sessionId]);

  const handleFieldChange = (playerId: string, fieldId: string, value: any) => {
    if (!sessionData) return;

    const updatedFieldValues = {
      ...sessionData.fieldValues,
      [playerId]: {
        ...sessionData.fieldValues[playerId],
        [fieldId]: value,
      },
    };

    const updatedData = {
      ...sessionData,
      fieldValues: updatedFieldValues,
    };

    setSessionData(updatedData);

    // Calculate totals
    if (templateDefinition) {
      const totals = calculateTotals(templateDefinition, updatedFieldValues);
      updatedData.totals = totals;
    }
  };

  const handleSaveSession = async () => {
    if (!session || !sessionData) return;

    setIsSaving(true);
    try {
      const updatedSession = {
        ...session,
        jsonData: JSON.stringify(sessionData),
        notes: notes,
      };

      await updateSession(updatedSession);
      showInfoToast('Score session saved successfully!');
    } catch (error) {
      console.error('Failed to save session:', error);
      showErrorToast('Failed to save score session');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCompleteSession = async () => {
    if (!sessionId) return;

    setIsSaving(true);
    try {
      await completeSession(parseInt(sessionId));
      showInfoToast('Score session completed!');
      navigate('/score-sheets');
    } catch (error) {
      console.error('Failed to complete session:', error);
      showErrorToast('Failed to complete score session');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <BgtPage>
        <BgtPageContent>
          <div className="flex justify-center items-center h-64">
            <Bars className="size-8" />
          </div>
        </BgtPageContent>
      </BgtPage>
    );
  }

  if (!session || !sessionData || !templateDefinition) {
    return (
      <BgtPage>
        <BgtPageContent>
          <BgtCenteredCard title={t('score-sheets.session.not-found')}>
            <p>{t('score-sheets.session.not-found-message')}</p>
            <BgtButton onClick={() => navigate('/score-sheets')} className="mt-4">
              {t('common.back')}
            </BgtButton>
          </BgtCenteredCard>
        </BgtPageContent>
      </BgtPage>
    );
  }

  return (
    <BgtPage>
      <BgtPageContent>
        <BgtCenteredCard title={session.name}>
          <div className="flex flex-col gap-4 w-full">
            {/* Session Info */}
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-sm">
                <strong>{t('score-sheets.session.template')}</strong>: {session.scoreSheetTemplateId}
              </p>
              <p className="text-sm">
                <strong>{t('score-sheets.session.created')}</strong>: {new Date(session.createdAt).toLocaleString()}
              </p>
              <p className="text-sm">
                <strong>{t('score-sheets.session.status')}</strong>: {session.isCompleted ? t('common.completed') : t('common.in-progress')}
              </p>
            </div>

            {/* Notes */}
            <BgtInputField
              name="notes"
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              label={t('score-sheets.session.notes')}
              placeholder={t('score-sheets.session.notes-placeholder')}
              disabled={isSaving || session.isCompleted}
            />

            {/* Score Input */}
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold mb-3">{t('score-sheets.session.scoring')}</h3>

              {/* Players and Fields */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="p-2 text-left">{t('common.player')}</th>
                      {templateDefinition.fields.map((field: any) => (
                        <th key={field.id} className="p-2 text-left">{field.name}</th>
                      ))}
                      <th className="p-2 text-left">{t('common.total')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sessionData.players.map((player: ScorePlayer) => (
                      <tr key={player.id} className="border-t">
                        <td className="p-2 font-medium">{player.name}</td>
                        {templateDefinition.fields.map((field: any) => (
                          <td key={field.id} className="p-2">
                            <input
                              type={field.type === 'number' ? 'number' : 'text'}
                              value={sessionData.fieldValues[player.id]?.[field.id] || field.defaultValue || ''}
                              onChange={(e) => handleFieldChange(player.id, field.id, field.type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value)}
                              className="w-20 p-1 border rounded text-center"
                              disabled={isSaving || session.isCompleted}
                              min={field.minValue}
                              max={field.maxValue}
                            />
                          </td>
                        ))}
                        <td className="p-2 font-bold">
                          {sessionData.totals[player.id] !== undefined ? sessionData.totals[player.id] : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-row gap-2 mt-4">
              <BgtButton
                variant="outline"
                type="button"
                disabled={isSaving}
                className="flex-none"
                onClick={() => navigate(-1)}
              >
                {isSaving && <Bars className="size-4" />}
                {t('common.back')}
              </BgtButton>

              {!session.isCompleted && (
                <>
                  <BgtButton
                    type="button"
                    disabled={isSaving}
                    className="flex-1"
                    onClick={handleSaveSession}
                  >
                    {isSaving && <Bars className="size-4" />}
                    {t('common.save')}
                  </BgtButton>

                  <BgtButton
                    type="button"
                    disabled={isSaving}
                    className="flex-none"
                    variant="soft"
                    onClick={handleCompleteSession}
                  >
                    {isSaving && <Bars className="size-4" />}
                    {t('score-sheets.session.complete')}
                  </BgtButton>
                </>
              )}
            </div>
          </div>
        </BgtCenteredCard>
      </BgtPageContent>
    </BgtPage>
  );
};