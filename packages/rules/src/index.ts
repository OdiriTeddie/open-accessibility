export interface ExplanationRule {
  id: string;
  title: string;
  explain: (context: unknown) => string | undefined;
}

export const rules: ExplanationRule[] = [];
