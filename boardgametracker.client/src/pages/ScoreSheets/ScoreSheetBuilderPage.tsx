import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Bars } from 'react-loading-icons';

import { BgtPage } from '@/components/BgtLayout/BgtPage';
import { BgtPageContent } from '@/components/BgtLayout/BgtPageContent';
import { BgtCenteredCard } from '@/components/BgtCard/BgtCenteredCard';
import { BgtInputField } from '@/components/BgtForm/BgtInputField';
import { BgtSelect } from '@/components/BgtForm/BgtSelect';
import { BgtTextArea } from '@/components/BgtForm/BgtTextArea';
import BgtButton from '@/components/BgtButton/BgtButton';
import { useToast } from '@/providers/BgtToastProvider';

import { getTemplateById, createTemplate, updateTemplate } from '@/services/ScoreSheetService';
import { ScoreSheetTemplate } from '@/models/ScoreSheet';
import {
  createSimpleHighScoreTemplate,
  createSimpleLowScoreTemplate,
  createRoundsTemplate,
  createCategoriesTemplate,
  serializeTemplateDefinition,
  deserializeTemplateDefinition
} from '@/utils/scoreSheetUtils';

export const ScoreSheetBuilderPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { showInfoToast, showErrorToast } = useToast();

  const templateId = searchParams.get('id');
  const [template, setTemplate] = useState<Omit<ScoreSheetTemplate, 'id'> | null>(null);
  const [definition, setDefinition] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(!!templateId);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const loadTemplate = async () => {
      if (templateId) {
        try {
          const loadedTemplate = await getTemplateById(parseInt(templateId));
          setTemplate({
            name: loadedTemplate.name,
            description: loadedTemplate.description,
            mode: loadedTemplate.mode,
            minPlayers: loadedTemplate.minPlayers,
            maxPlayers: loadedTemplate.maxPlayers,
            version: loadedTemplate.version,
            jsonDefinition: loadedTemplate.jsonDefinition,
            gameId: loadedTemplate.gameId,
            isPublic: loadedTemplate.isPublic,
            createdByUserId: loadedTemplate.createdByUserId,
            createdAt: loadedTemplate.createdAt,
            updatedAt: loadedTemplate.updatedAt,
          });

          const parsedDefinition = deserializeTemplateDefinition(loadedTemplate.jsonDefinition);
          setDefinition(parsedDefinition);
        } catch (error) {
          console.error('Failed to load template:', error);
          showErrorToast('Failed to load score sheet template');
        } finally {
          setIsLoading(false);
        }
      }
    };

    loadTemplate();
  }, [templateId]);

  const handlePresetSelect = (preset: string) => {
    let newDefinition;

    switch (preset) {
      case 'simple-high':
        newDefinition = createSimpleHighScoreTemplate();
        break;
      case 'simple-low':
        newDefinition = createSimpleLowScoreTemplate();
        break;
      case 'rounds':
        newDefinition = createRoundsTemplate(5);
        break;
      case 'categories':
        newDefinition = createCategoriesTemplate();
        break;
      default:
        return;
    }

    setDefinition(newDefinition);

    if (!template) {
      setTemplate({
        name: `${preset.replace('-', ' ')} template`,
        description: `Automatically created ${preset} template`,
        mode: preset.includes('rounds') ? 'rounds' : preset.includes('categories') ? 'categories' : 'rounds',
        minPlayers: 2,
        maxPlayers: 8,
        version: '1.0',
        jsonDefinition: serializeTemplateDefinition(newDefinition),
        gameId: undefined,
        isPublic: false,
        createdByUserId: 'current-user', // Replace with actual user ID
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    } else {
      setTemplate({
        ...template,
        jsonDefinition: serializeTemplateDefinition(newDefinition),
      });
    }
  };

  const handleSaveTemplate = async () => {
    if (!template || !definition) {
      showErrorToast('Please fill in all required fields');
      return;
    }

    setIsSaving(true);
    try {
      const templateToSave = {
        ...template,
        jsonDefinition: serializeTemplateDefinition(definition),
      };

      if (templateId) {
        // Update existing template
        const updatedTemplate = await updateTemplate({
          ...templateToSave,
          id: parseInt(templateId),
        });
        showInfoToast('Score sheet template updated successfully!');
      } else {
        // Create new template
        const createdTemplate = await createTemplate(templateToSave);
        showInfoToast('Score sheet template created successfully!');
        navigate(`/score-sheets/templates/builder?id=${createdTemplate.id}`);
      }
    } catch (error) {
      console.error('Failed to save template:', error);
      showErrorToast('Failed to save score sheet template');
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

  return (
    <BgtPage>
      <BgtPageContent>
        <BgtCenteredCard title={templateId ? t('score-sheets.builder.edit-template') : t('score-sheets.builder.create-template')}>
          <div className="flex flex-col gap-4 w-full">
            {/* Template Info */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-3">{t('score-sheets.builder.basic-info')}</h3>

              <BgtInputField
                name="name"
                type="text"
                value={template?.name || ''}
                onChange={(e) => template && setTemplate({...template, name: e.target.value})}
                label={t('common.name')}
                placeholder={t('score-sheets.builder.template-name-placeholder')}
                disabled={isSaving}
              />

              <BgtTextArea
                name="description"
                value={template?.description || ''}
                onChange={(e) => template && setTemplate({...template, description: e.target.value})}
                label={t('common.description')}
                placeholder={t('score-sheets.builder.template-description-placeholder')}
                disabled={isSaving}
                rows={3}
              />

              <div className="grid grid-cols-2 gap-4">
                <BgtSelect
                  label={t('score-sheets.builder.mode')}
                  items={[
                    { value: 'rounds', label: t('score-sheets.builder.mode-rounds') },
                    { value: 'categories', label: t('score-sheets.builder.mode-categories') },
                    { value: 'hybrid', label: t('score-sheets.builder.mode-hybrid') },
                  ]}
                  value={template?.mode || 'rounds'}
                  onChange={(value) => template && setTemplate({...template, mode: value as 'rounds' | 'categories' | 'hybrid'})}
                  disabled={isSaving}
                />

                <BgtInputField
                  name="minPlayers"
                  type="number"
                  value={template?.minPlayers || 1}
                  onChange={(e) => template && setTemplate({...template, minPlayers: parseInt(e.target.value) || 1})}
                  label={t('score-sheets.builder.min-players')}
                  min={1}
                  disabled={isSaving}
                />

                <BgtInputField
                  name="maxPlayers"
                  type="number"
                  value={template?.maxPlayers || 10}
                  onChange={(e) => template && setTemplate({...template, maxPlayers: parseInt(e.target.value) || 10})}
                  label={t('score-sheets.builder.max-players')}
                  min={1}
                  disabled={isSaving}
                />
              </div>
            </div>

            {/* Presets */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-3">{t('score-sheets.builder.presets')}</h3>
              <p className="text-sm text-gray-600 mb-3">{t('score-sheets.builder.presets-description')}</p>

              <div className="grid grid-cols-2 gap-3">
                <BgtButton
                  variant="outline"
                  onClick={() => handlePresetSelect('simple-high')}
                  disabled={isSaving}
                >
                  {t('score-sheets.builder.preset-simple-high')}
                </BgtButton>

                <BgtButton
                  variant="outline"
                  onClick={() => handlePresetSelect('simple-low')}
                  disabled={isSaving}
                >
                  {t('score-sheets.builder.preset-simple-low')}
                </BgtButton>

                <BgtButton
                  variant="outline"
                  onClick={() => handlePresetSelect('rounds')}
                  disabled={isSaving}
                >
                  {t('score-sheets.builder.preset-rounds')}
                </BgtButton>

                <BgtButton
                  variant="outline"
                  onClick={() => handlePresetSelect('categories')}
                  disabled={isSaving}
                >
                  {t('score-sheets.builder.preset-categories')}
                </BgtButton>
              </div>
            </div>

            {/* Template Definition Preview */}
            {definition && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-3">{t('score-sheets.builder.template-preview')}</h3>
                <div className="bg-white p-3 rounded border overflow-x-auto">
                  <pre className="text-sm">{JSON.stringify(definition, null, 2)}</pre>
                </div>
              </div>
            )}

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
                {t('common.cancel')}
              </BgtButton>
              <BgtButton
                type="button"
                disabled={isSaving || !template || !definition}
                className="flex-1"
                variant="soft"
                onClick={handleSaveTemplate}
              >
                {isSaving && <Bars className="size-4" />}
                {t('common.save')}
              </BgtButton>
            </div>
          </div>
        </BgtCenteredCard>
      </BgtPageContent>
    </BgtPage>
  );
};