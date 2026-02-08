export const formatCarBrands = (carBrands?: string[]): string => {
  if (!carBrands || carBrands.length === 0) return 'مش متحدد';

  const brandModels = new Map<string, Set<string>>();
  const brandOnly = new Set<string>();

  carBrands.forEach((entry) => {
    const trimmed = entry.trim();
    if (!trimmed) return;
    const parts = trimmed.split(' - ');
    if (parts.length === 2) {
      const [brand, model] = parts;
      if (!brandModels.has(brand)) {
        brandModels.set(brand, new Set());
      }
      if (model) {
        brandModels.get(brand)!.add(model);
      }
    } else {
      brandOnly.add(trimmed);
    }
  });

  const brandNames = new Set<string>([...brandModels.keys(), ...brandOnly]);
  const output: string[] = [];

  Array.from(brandNames).forEach((brand) => {
    const models = brandModels.get(brand);
    if (models && models.size > 0) {
      output.push(`${brand} (${Array.from(models).join(', ')})`);
    } else {
      output.push(brand);
    }
  });

  return output.join(', ');
};
