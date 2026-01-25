import { ScoreSheetTemplateDefinition, ScoreField, ScoreSection } from '@/models/ScoreSheet/ScoreSheetTemplate';

export const createSimpleHighScoreTemplate = (): ScoreSheetTemplateDefinition => {
  return {
    fields: [
      {
        id: 'score',
        name: 'Score',
        type: 'number',
        defaultValue: 0,
        minValue: 0,
      },
    ],
    rules: [
      {
        id: 'total',
        name: 'Total Score',
        expression: 'score',
        targetFieldId: 'score',
      },
    ],
  };
};

export const createSimpleLowScoreTemplate = (): ScoreSheetTemplateDefinition => {
  return {
    fields: [
      {
        id: 'score',
        name: 'Score',
        type: 'number',
        defaultValue: 0,
        minValue: 0,
      },
    ],
    rules: [
      {
        id: 'total',
        name: 'Total Score',
        expression: 'score',
        targetFieldId: 'score',
      },
    ],
  };
};

export const createRoundsTemplate = (roundCount: number = 5): ScoreSheetTemplateDefinition => {
  const fields: ScoreField[] = [];
  const rules: any[] = [];

  // Create round fields
  for (let i = 1; i <= roundCount; i++) {
    fields.push({
      id: `round_${i}`,
      name: `Round ${i}`,
      type: 'number',
      defaultValue: 0,
      minValue: 0,
    });
  }

  // Create total rule
  const roundFields = fields.map(f => f.id).join(' + ');
  rules.push({
    id: 'total',
    name: 'Total',
    expression: roundFields,
    targetFieldId: 'total',
  });

  return {
    fields,
    rules,
  };
};

export const createCategoriesTemplate = (): ScoreSheetTemplateDefinition => {
  return {
    fields: [
      {
        id: 'coins',
        name: 'Coins',
        type: 'number',
        defaultValue: 0,
        minValue: 0,
      },
      {
        id: 'bonuses',
        name: 'Bonuses',
        type: 'number',
        defaultValue: 0,
        minValue: 0,
      },
      {
        id: 'penalties',
        name: 'Penalties',
        type: 'number',
        defaultValue: 0,
        minValue: 0,
      },
    ],
    rules: [
      {
        id: 'total',
        name: 'Total',
        expression: 'coins + bonuses - penalties',
        targetFieldId: 'total',
      },
    ],
  };
};

export const serializeTemplateDefinition = (definition: ScoreSheetTemplateDefinition): string => {
  return JSON.stringify(definition, null, 2);
};

export const deserializeTemplateDefinition = (json: string): ScoreSheetTemplateDefinition => {
  return JSON.parse(json);
};

export const calculateTotals = (
  definition: ScoreSheetTemplateDefinition,
  fieldValues: Record<string, Record<string, any>>
): Record<string, number> => {
  const totals: Record<string, number> = {};

  // Apply rules to calculate totals
  definition.rules?.forEach(rule => {
    Object.keys(fieldValues).forEach(playerId => {
      try {
        // Simple expression evaluation (for demo purposes)
        // In production, you'd want a proper expression evaluator
        const playerValues = fieldValues[playerId];
        let total = 0;

        // Handle simple sum expressions like "field1 + field2"
        const fieldRefs = rule.expression.split(/[\+\-\*\/]/).map(f => f.trim());
        fieldRefs.forEach(fieldRef => {
          if (playerValues[fieldRef] !== undefined) {
            total += Number(playerValues[fieldRef]) || 0;
          }
        });

        totals[playerId] = total;
      } catch (error) {
        console.error(`Error calculating total for player ${playerId} with rule ${rule.id}:`, error);
        totals[playerId] = 0;
      }
    });
  });

  return totals;
};