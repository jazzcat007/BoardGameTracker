import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Bars } from 'react-loading-icons';

import { BgtPage } from '@/components/BgtLayout/BgtPage';
import { BgtPageContent } from '@/components/BgtLayout/BgtPageContent';
import { BgtCenteredCard } from '@/components/BgtCard/BgtCenteredCard';
import { BgtSelect } from '@/components/BgtForm/BgtSelect';
import { BgtInputField } from '@/components/BgtForm/BgtInputField';
import { BgtPlayerSelector } from '@/components/BgtForm/BgtPlayerSelector';
import BgtButton from '@/components/BgtButton/BgtButton';
import { useToast } from '@/providers/BgtToastProvider';

import { getTemplatesByGame } from '@/services/ScoreSheetService';
import { ScoreSheetTemplate } from '@/models/ScoreSheet';
import { createRoundsTemplate, serializeTemplateDefinition } from '@/utils/scoreSheetUtils';
import { createTemplate } from '@/services/ScoreSheetService';

export const CreateScoreSessionPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { gameId } = useParams<{ gameId: string }>();
  const { showInfoToast, showErrorToast } = useToast();

  const [templates, setTemplates] = useState<ScoreSheetTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<ScoreSheetTemplate | null>(null);
  const [sessionName, setSessionName] = useState('');
  const [players, setPlayers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    const loadTemplates = async () => {
      try {
        if (gameId) {
          const gameTemplates = await getTemplatesByGame(parseInt(gameId));
          setTemplates(gameTemplates);

          // If no templates exist for this game, create a default rounds template
          if (gameTemplates.length === 0) {
            const defaultTemplate: Omit<ScoreSheetTemplate, 'id'> = {
              name: 'Default Rounds Template',
              description: 'Automatically created rounds template',
              mode: 'rounds',
              minPlayers: 2,
              maxPlayers: 8,
              version: '1.0',
              jsonDefinition: serializeTemplateDefinition(createRoundsTemplate(5)),
              gameId: parseInt(gameId),
              isPublic: false,
              createdByUserId: 'system', // In real app, use current user ID
              createdAt: new Date(),
              updatedAt: new Date(),
            };

            // TODO: Create the template via API
            // const createdTemplate = await createTemplate(defaultTemplate);
            // setTemplates([createdTemplate]);
          }
        }
      } catch (error) {
        console.error('Failed to load templates:', error);
        showErrorToast('Failed to load score sheet templates');
      } finally {
        setIsLoading(false);
      }
    };

    loadTemplates();
  }, [gameId]);

  const handleCreateSession = async () => {
    if (!selectedTemplate || !sessionName) {
      showErrorToast('Please select a template and provide a session name');
      return;
    }

    setIsCreating(true);
    try {
      const sessionData = {
        name: sessionName,
        scoreSheetTemplateId: selectedTemplate.id!,
        templateVersionSnapshot: selectedTemplate.version,
        jsonData: JSON.stringify({
          players: [],
          fieldValues: {},
          totals: {},
        }),
        gameId: gameId ? parseInt(gameId) : undefined,
        createdByUserId: 'current-user-id', // Replace with actual user ID
        notes: '',
        isCompleted: false,
      };

      // TODO: Uncomment when createSession API is implemented
      // const createdSession = await createSession(sessionData);
      showInfoToast('Score session created successfully!');
      navigate(`/score-sheets/${'new-session-id'}`); // Replace with actual ID
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
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm text-gray-600">
                  {t('score-sheets.create.players-note')}
                </p>
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
                disabled={isCreating || !selectedTemplate || !sessionName || players.length === 0}
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