export interface SbLinechartComparison {
  // Label and value matches SelectItem in PrimeNG API - however value is not typed
  label: string;
  value: {
    id: number;
    name: string;
    code: string;
  };
}
