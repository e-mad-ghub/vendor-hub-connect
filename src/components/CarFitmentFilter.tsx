import React from 'react';
import { Check, ChevronsUpDown, Share2, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

type TypeaheadSelectProps = {
  id: string;
  placeholder: string;
  searchPlaceholder: string;
  emptyLabel: string;
  value: string;
  options: string[];
  disabled?: boolean;
  onChange: (value: string) => void;
};

const TypeaheadSelect: React.FC<TypeaheadSelectProps> = ({
  id,
  placeholder,
  searchPlaceholder,
  emptyLabel,
  value,
  options,
  disabled = false,
  onChange,
}) => {
  const [open, setOpen] = React.useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn('w-full justify-between', !value && 'text-muted-foreground')}
          disabled={disabled}
        >
          <span className="truncate">{value || placeholder}</span>
          <ChevronsUpDown className="mr-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
        <Command>
          <CommandInput placeholder={searchPlaceholder} />
          <CommandList>
            <CommandEmpty>{emptyLabel}</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option}
                  value={option}
                  onSelect={() => {
                    onChange(option === value ? '' : option);
                    setOpen(false);
                  }}
                >
                  <Check className={cn('ml-2 h-4 w-4', value === option ? 'opacity-100' : 'opacity-0')} />
                  {option}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

type CarFitmentFilterProps = {
  brands: string[];
  models: string[];
  selectedBrand: string;
  selectedModel: string;
  nameQuery: string;
  resultCount: number;
  isModelDisabled: boolean;
  onBrandChange: (value: string) => void;
  onModelChange: (value: string) => void;
  onNameQueryChange: (value: string) => void;
  onClearModel: () => void;
  onClearAll: () => void;
  onClearCarOnly: () => void;
  onShare: () => void;
};

export const CarFitmentFilter: React.FC<CarFitmentFilterProps> = ({
  brands,
  models,
  selectedBrand,
  selectedModel,
  nameQuery,
  resultCount,
  isModelDisabled,
  onBrandChange,
  onModelChange,
  onNameQueryChange,
  onClearModel,
  onClearAll,
  onClearCarOnly,
  onShare,
}) => {
  const hasCarSelection = !!selectedBrand;

  return (
    <section className="container mt-6" aria-label="Car fitment filters">
      <div className="bg-card rounded-xl shadow-card p-4 md:p-5 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs text-muted-foreground mb-1">اختيار حسب السيارة</p>
            <h3 className="font-semibold text-foreground">فلترة القطع المتوافقة</h3>
          </div>
          <Button type="button" variant="ghost" size="sm" className="gap-2" onClick={onShare}>
            <Share2 className="h-4 w-4" />
            مشاركة
          </Button>
        </div>

        <div className="grid gap-3 md:grid-cols-12">
          <div className="md:col-span-4">
            <Label htmlFor="fitment-brand" className="mb-2 block">الماركة</Label>
            <TypeaheadSelect
              id="fitment-brand"
              value={selectedBrand}
              options={brands}
              placeholder="اختر الماركة"
              searchPlaceholder="ابحث عن الماركة"
              emptyLabel="لا توجد ماركات"
              onChange={onBrandChange}
            />
          </div>

          <div className="md:col-span-4">
            <Label htmlFor="fitment-model" className="mb-2 block">الموديل</Label>
            <TypeaheadSelect
              id="fitment-model"
              value={selectedModel}
              options={models}
              placeholder="اختر الموديل"
              searchPlaceholder="ابحث عن الموديل"
              emptyLabel={selectedBrand ? 'لا توجد موديلات لهذه الماركة' : 'اختر الماركة أولًا'}
              disabled={isModelDisabled}
              onChange={onModelChange}
            />
          </div>

          <div className="md:col-span-4">
            <Label htmlFor="within-results-search" className="mb-2 block">بحث داخل النتائج</Label>
            <Input
              id="within-results-search"
              value={nameQuery}
              onChange={(event) => onNameQueryChange(event.target.value)}
              placeholder="ابحث داخل النتائج"
              autoComplete="off"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {hasCarSelection && (
              <Badge variant="secondary" className="gap-2 text-xs">
                سيارتك: {selectedBrand} {selectedModel ? `· ${selectedModel}` : ''}
                <button
                  type="button"
                  onClick={onClearCarOnly}
                  aria-label="مسح اختيار السيارة"
                  className="inline-flex h-4 w-4 items-center justify-center rounded-full hover:bg-background/70"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}

            <span className="text-sm text-muted-foreground">عدد النتائج: {resultCount}</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button type="button" variant="outline" size="sm" onClick={onClearModel} disabled={!selectedModel}>
              مسح الموديل فقط
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={onClearAll}>
              مسح الفلاتر
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};
