import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Bars } from 'react-loading-icons';

import { BgtPage } from '@/components/BgtLayout/BgtPage';
import { BgtPageContent } from '@/components/BgtLayout/BgtPageContent';
import { BgtCenteredCard } from '@/components/BgtCard/BgtCenteredCard';
import BgtButton from '@/components/BgtButton/BgtButton';
import { useToast } from '@/providers/BgtToastProvider';

import { getAllTemplates, deleteTemplate } from '@/services/ScoreSheetService';
import { ScoreSheetTemplate } from '@/models/ScoreSheet';

export const ScoreSheetTemplatesPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { showInfoToast, showErrorToast } = useToast();

  const [templates, setTemplates] = useState<ScoreSheetTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const loadTemplates = async () => {
      try {
        const allTemplates = await getAllTemplates();
        setTemplates(allTemplates);
      } catch (error) {
        console.error('Failed to load templates:', error);
        showErrorToast('Failed to load score sheet templates');
      } finally {
        setIsLoading(false);
      }
    };

    loadTemplates();
  }, []);

  const handleDeleteTemplate = async (templateId: number) => {
    if (!window.confirm(t('score-sheets.templates.delete-confirm'))) return;

    setIsDeleting(true);
    try {
      await deleteTemplate(templateId);
      setTemplates(templates.filter(t => t.id !== templateId));
      showInfoToast('Score sheet template deleted successfully!');
    } catch (error) {
      console.error('Failed to delete template:', error);
      showErrorToast('Failed to delete score sheet template');
    } finally {
      setIsDeleting(false);
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
        <BgtCenteredCard title={t('score-sheets.templates.title')}>
          <div className="flex flex-col gap-4 w-full">
            <div className="flex justify-end">
              <BgtButton
                onClick={() => navigate('/score-sheets/templates/builder')}
                disabled={isDeleting}
              >
                {t('score-sheets.templates.create-new')}
              </BgtButton>
            </div>

            {templates.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">{t('score-sheets.templates.no-templates')}</p>
                <BgtButton
                  onClick={() => navigate('/score-sheets/templates/builder')}
                  className="mt-4"
                >
                  {t('score-sheets.templates.create-first')}
                </BgtButton>
              </div>
            ) : (
              <div className="space-y-4">
                {templates.map(template => (
                  <div key={template.id} className="bg-white p-4 rounded-lg shadow-sm border">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{template.name}</h3>
                        <p className="text-sm text-gray-600">{template.description}</p>
                        <div className="mt-2 text-sm">
                          <span className="bg-gray-100 px-2 py-1 rounded">{template.mode}</span>
                          <span className="ml-2 text-gray-500">
                            {template.minPlayers}-{template.maxPlayers} {t('common.players')}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2 ml-4">
                        <BgtButton
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/score-sheets/create?templateId=${template.id}`)}
                          disabled={isDeleting}
                        >
                          {t('score-sheets.templates.use-template')}
                        </BgtButton>
                        <BgtButton
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/score-sheets/templates/builder?id=${template.id}`)}
                          disabled={isDeleting}
                        >
                          {t('common.edit')}
                        </BgtButton>
                        <BgtButton
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteTemplate(template.id!)}
                          disabled={isDeleting}
                        >
                          {isDeleting && <Bars className="size-4" />}
                          {t('common.delete')}
                        </BgtButton>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </BgtCenteredCard>
      </BgtPageContent>
    </BgtPage>
  );
};