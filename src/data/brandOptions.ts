export type BrandOption = {
  brand: string;
  models: string[];
};

export const BRAND_OPTIONS_KEY = 'vhc_brand_options';

export const defaultBrandOptions: BrandOption[] = [
  { brand: 'نيسان', models: ['قشقاي', 'صني', 'سنترا'] },
  { brand: 'رينو', models: ['كادجار'] },
  { brand: 'تويوتا', models: ['كورولا'] },
  { brand: 'ميتسوبيشي', models: ['إكليبس كروس'] },
  { brand: 'فولكسفاجن', models: ['تيجوان'] },
  { brand: 'سكودا', models: ['كودياك'] },
  { brand: 'كوبرا', models: [] },
  { brand: 'أوبل', models: [] },
  { brand: 'بيجو', models: [] },
  { brand: 'سيتروين', models: [] },
  { brand: 'هيونداي', models: ['إلنترا', 'توسان'] },
  { brand: 'كيا', models: ['سيراتو', 'سبورتاج'] },
  { brand: 'فيات', models: ['تيبو'] },
  { brand: 'سوزوكي', models: ['سويفت', 'فيتارا'] },
  { brand: 'شيري', models: ['تيجو 4', 'أريزو 5', 'تيجو 7', 'تيجو 8'] },
  { brand: 'إم جي', models: ['زد إس', 'آر إكس 5'] },
  { brand: 'جيلي', models: ['كولراي', 'ستاراي', 'أوكافانجو'] },
  { brand: 'شانجان', models: [] },
];

const brandMap: Record<string, string> = {
  Nissan: 'نيسان',
  Renault: 'رينو',
  Toyota: 'تويوتا',
  Mitsubishi: 'ميتسوبيشي',
  Volkswagen: 'فولكسفاجن',
  Skoda: 'سكودا',
  CUPRA: 'كوبرا',
  Opel: 'أوبل',
  Peugeot: 'بيجو',
  Citroen: 'سيتروين',
  Hyundai: 'هيونداي',
  Kia: 'كيا',
  Fiat: 'فيات',
  Suzuki: 'سوزوكي',
  Chery: 'شيري',
  MG: 'إم جي',
  Geely: 'جيلي',
  Changan: 'شانجان',
};

const modelMap: Record<string, string> = {
  Qashqai: 'قشقاي',
  Sunny: 'صني',
  Sentra: 'سنترا',
  Kadjar: 'كادجار',
  Corolla: 'كورولا',
  'Eclipse Cross': 'إكليبس كروس',
  Tiguan: 'تيجوان',
  Kodiaq: 'كودياك',
  Elantra: 'إلنترا',
  Tucson: 'توسان',
  Cerato: 'سيراتو',
  Sportage: 'سبورتاج',
  Tipo: 'تيبو',
  Swift: 'سويفت',
  Vitara: 'فيتارا',
  'Tiggo 4': 'تيجو 4',
  'Arrizo 5': 'أريزو 5',
  'Tiggo 7': 'تيجو 7',
  'Tiggo 8': 'تيجو 8',
  ZS: 'زد إس',
  RX5: 'آر إكس 5',
  Coolray: 'كولراي',
  Starray: 'ستاراي',
  Okavango: 'أوكافانجو',
};

export const translateBrandLabel = (value: string): string => {
  if (!value) return value;
  if (brandMap[value]) return brandMap[value];
  const split = value.split(' - ');
  if (split.length === 2) {
    const [brand, model] = split;
    const translatedBrand = brandMap[brand] || brand;
    const translatedModel = modelMap[model] || model;
    return `${translatedBrand} - ${translatedModel}`;
  }
  return value;
};

export const translateBrandOptions = (options: BrandOption[]): BrandOption[] => {
  return options.map((option) => ({
    brand: brandMap[option.brand] || option.brand,
    models: option.models.map((model) => modelMap[model] || model),
  }));
};

export const expandBrandsWithModels = (
  selections: string[] | undefined,
  brandOptions: BrandOption[]
): string[] => {
  if (!selections || selections.length === 0) return [];

  const modelsByBrand = new Map<string, string[]>();
  brandOptions.forEach((option) => {
    modelsByBrand.set(option.brand, option.models);
  });

  const output = new Set<string>();
  selections.forEach((value) => {
    const trimmed = value.trim();
    if (!trimmed) return;
    output.add(trimmed);
    const parts = trimmed.split(' - ');
    if (parts.length === 1) {
      const models = modelsByBrand.get(trimmed) || [];
      models.forEach((model) => {
        output.add(`${trimmed} - ${model}`);
      });
    }
  });

  return Array.from(output);
};
