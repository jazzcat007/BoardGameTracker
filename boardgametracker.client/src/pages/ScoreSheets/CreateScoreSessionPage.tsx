import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Bars } from 'react-loading-icons';

import { BgtPage } from '@/components/BgtLayout/BgtPage';
import { BgtPageContent } from '@/components/BgtLayout/BgtPageContent';
import { BgtCenteredCard } from '@/components/BgtCard/BgtCenteredCard';
import BgtButton from '@/components/BgtButton/BgtButton';
import { useToast } from '@/providers/BgtToastProvider';

import {
  getTemplatesByGame,
  getAllTemplates,
  createTemplate,
  createSession,
} from '@/services/ScoreSheetService';
import { ScorePlayer, ScoreSessionData, ScoreSheetTemplate } from '@/models/ScoreSheet';
import {
  createRoundsTemplate,
  serializeTemplateDefinition,
  deserializeTemplateDefinition,
  calculateTotals,
} from '@/utils/scoreSheetUtils';
import { getPlayers } from '@/hooks/services/playerService';
import { Player } from '@/models';

export const CreateScoreSessionPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { gameId } = useParams<{ gameId: string }>();
  const [searchParams] = useSearchParams();
  const { showInfoToast, showErrorToast } = useToast();

  const [templates, setTemplates] = useState<ScoreSheetTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<ScoreSheetTemplate | null>(null);
  const [sessionName, setSessionName] = useState('');
  const [availablePlayers, setAvailablePlayers] = useState<Player[]>([]);
  const [selectedPlayerIds, setSelectedPlayerIds] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  const parsedGameId = useMemo(() => (gameId ? parseInt(gameId, 10) : undefined), [gameId]);
  const templateIdFromQuery = useMemo(() => {
    const value = searchParams.get('templateId');
    return value ? parseInt(value, 10) : undefined;
  }, [searchParams]);

  useEffect(() => {
    const abortController = new AbortController();

    const loadTemplates = async () => {
      try {
        let fetchedTemplates = parsedGameId
          ? await getTemplatesByGame(parsedGameId, abortController.signal)
          : await getAllTemplates(abortController.signal);

        if (fetchedTemplates.length === 0 && parsedGameId) {
          const defaultTemplateDefinition = createRoundsTemplate(5);
          const defaultTemplate: Omit<ScoreSheetTemplate, 'id'> = {
            name: 'Default Rounds Template',
            description: 'Automatically created rounds template',
            mode: 'rounds',
            minPlayers: 2,
            maxPlayers: 8,
            version: '1.0',
            jsonDefinition: serializeTemplateDefinition(defaultTemplateDefinition),
            gameId: parsedGameId,
            isPublic: false,
            createdByUserId: 'system',
            createdAt: new Date(),
            updatedAt: new Date(),
          };

          try {
            const createdTemplate = await createTemplate(defaultTemplate);
            fetchedTemplates = [createdTemplate];
            showInfoToast('Created a default rounds template for this game.');
          } catch (error) {
            console.error('Failed to auto-create default template:', error);
          }
        }

        setTemplates(fetchedTemplates);

        // Resolve selected template from query param if provided, otherwise use the first available.
        const resolvedTemplate =
          (templateIdFromQuery
            ? fetchedTemplates.find((t) => t.id === templateIdFromQuery)
            : null) || fetchedTemplates[0] || null;
        setSelectedTemplate(resolvedTemplate);

        const fetchedPlayers = await getPlayers(abortController.signal);
        setAvailablePlayers(fetchedPlayers);
      } catch (error) {
        console.error('Failed to load score sheet data:', error);
        showErrorToast('Failed to load score sheet data');
      } finally {
        setIsLoading(false);
      }
    };

    loadTemplates();
    return () => abortController.abort();
  }, [parsedGameId, templateIdFromQuery, showErrorToast, showInfoToast]);

  const handleCreateSession = async () => {
    if (!selectedTemplate || !sessionName.trim()) {
      showErrorToast('Please select a template and provide a session name');
      return;
    }

    if (
      selectedPlayerIds.length < selectedTemplate.minPlayers ||
      selectedPlayerIds.length > selectedTemplate.maxPlayers
    ) {
      showErrorToast(
        `Select between ${selectedTemplate.minPlayers} and ${selectedTemplate.maxPlayers} players for this template.`
      );
      return;
    }

    const templateDefinition = deserializeTemplateDefinition(selectedTemplate.jsonDefinition);
    const selectedPlayers = availablePlayers.filter((p) => selectedPlayerIds.includes(p.id));

    const scorePlayers: ScorePlayer[] = selectedPlayers.map((player, index) => ({
      id: player.id.toString(),
      name: player.name,
      order: index + 1,
    }));

    const fieldValues: Record<string, Record<string, any>> = {};
    scorePlayers.forEach((player) => {
      fieldValues[player.id] = {};
      templateDefinition.fields.forEach((field) => {
        const defaultValue =
          field.defaultValue !== undefined
            ? field.defaultValue
            : field.type === 'number'
              ? 0
              : field.type === 'checkbox'
                ? false
                : '';
        fieldValues[player.id][field.id] = defaultValue;
      });
    });

    const sessionData: ScoreSessionData = {
      players: scorePlayers,
      fieldValues,
      totals: calculateTotals(templateDefinition, fieldValues),
    };

    setIsCreating(true);
    try {
      const sessionPayload = {
        name: sessionName.trim(),
        scoreSheetTemplateId: selectedTemplate.id!,
        templateVersionSnapshot: selectedTemplate.jsonDefinition,
        jsonData: JSON.stringify(sessionData),
        gameId: parsedGameId,
        createdByUserId: 'current-user-id', // Replace with actual user ID
        createdAt: new Date(),
        updatedAt: new Date(),
        notes: '',
        isCompleted: false,
      };

      const createdSession = await createSession(sessionPayload);
      showInfoToast('Score session created successfully!');
      navigate(`/score-sheets/${createdSession.id}`);
    } catch (error) {
      console.error('Failed to create session:', error);
      showErrorToast('Failed to create score session');
    } finally {
      setIsCreating(false);
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

  return (
    <BgtPage>
      <BgtPageContent>
        <BgtCenteredCard title={t('score-sheets.create.title')}>
          <div className="flex flex-col gap-4 w-full">
            <div className="flex flex-col gap-2">
              <label className="text-[15px] font-medium leading-[35px] uppercase">
                {t('score-sheets.create.session-name')}
              </label>
              <input
                type="text"
                value={sessionName}
                onChange={(e) => setSessionName(e.target.value)}
                placeholder={t('score-sheets.create.session-name-placeholder')}
                disabled={isCreating}
                className="px-4 py-2 h-[45px] shadow-none bg-input uppercase inline-flex justify-between items-center rounded-lg leading-none text-[12px]"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[15px] font-medium leading-[35px] uppercase">
                {t('score-sheets.create.template')}
              </label>
              <select
                value={selectedTemplate?.id?.toString() || ''}
                onChange={(e) => {
                  const template = templates.find(t => t.id?.toString() === e.target.value);
                  setSelectedTemplate(template || null);
                }}
                disabled={isCreating || templates.length === 0}
                className="px-4 py-2 h-[45px] shadow-none bg-input uppercase inline-flex justify-between items-center rounded-lg leading-none text-[12px]"
              >
                <option value="">{t('score-sheets.create.template-placeholder')}</option>
                {templates.map(template => (
                  <option key={template.id} value={template.id}>
                    {template.name}
                  </option>
                ))}
              </select>
              {selectedTemplate && (
                <p className="text-xs text-gray-500 mt-1">
                  {t('score-sheets.create.players-range')}: {selectedTemplate.minPlayers}-
                  {selectedTemplate.maxPlayers}
                </p>
              )}
            </div>

            {selectedTemplate && (
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm text-gray-600">
                  <strong>{t('score-sheets.create.template-info')}</strong>
                </p>
                <p className="text-sm">
                  {t('score-sheets.create.mode')}: {selectedTemplate.mode}
                </p>
                <p className="text-sm">
                  {t('score-sheets.create.players-range')}: {selectedTemplate.minPlayers}-{selectedTemplate.maxPlayers}
                </p>
              </div>
            )}

            <div className="flex flex-col gap-2">
              <label className="text-[15px] font-medium leading-[35px] uppercase">
                {t('score-sheets.create.players')}
              </label>
              <div className="bg-gray-50 p-3 rounded-lg flex flex-col gap-2">
                {availablePlayers.length === 0 && (
                  <p className="text-sm text-gray-600">{t('score-sheets.create.players-note')}</p>
                )}
                {availablePlayers.map((player) => (
                  <label key={player.id} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={selectedPlayerIds.includes(player.id)}
                      onChange={() => {
                        setSelectedPlayerIds((prev) =>
                          prev.includes(player.id)
                            ? prev.filter((id) => id !== player.id)
                            : [...prev, player.id]
                        );
                      }}
                      disabled={isCreating}
                    />
                    {player.name}
                  </label>
                ))}
                {selectedTemplate && (
                  <p className="text-xs text-gray-500">
                    {t('score-sheets.create.players-note')} (
                    {selectedTemplate.minPlayers}-{selectedTemplate.maxPlayers}{' '}
                    {t('common.players')})
                  </p>
                )}
              </div>
            </div>

            <div className="flex flex-row gap-2 mt-4">
              <BgtButton
                variant="outline"
                type="button"
                disabled={isCreating}
                className="flex-none"
                onClick={() => navigate(-1)}
              >
                {isCreating && <Bars className="size-4" />}
                {t('common.cancel')}
              </BgtButton>
              <BgtButton
                type="button"
                disabled={
                  isCreating ||
                  !selectedTemplate ||
                  !sessionName.trim() ||
                  selectedPlayerIds.length < (selectedTemplate?.minPlayers ?? 1) ||
                  selectedPlayerIds.length > (selectedTemplate?.maxPlayers ?? Number.MAX_SAFE_INTEGER)
                }
                className="flex-1"
                variant="soft"
                onClick={handleCreateSession}
              >
                {isCreating && <Bars className="size-4" />}
                {t('score-sheets.create.start-session')}
              </BgtButton>
            </div>
          </div>
        </BgtCenteredCard>
      </BgtPageContent>
    </BgtPage>
  );
};
