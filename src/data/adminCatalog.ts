import type { Product } from '@/types/marketplace';

export const adminSeedProducts: Product[] = [
  // الفرامل
  { id: 'p1', title: 'تيل فرامل', description: 'تيل فرامل عالي الجودة لأداء ثابت وتقليل الضوضاء.', newAvailable: true, newPrice: 1000, importedAvailable: true, category: 'الفرامل', carBrands: ['تويوتا', 'هيونداي', 'نيسان'], imageDataUrl: '', createdAt: '2024-07-01' },
  { id: 'p2', title: 'طنابير', description: 'طنابير متينة لتبريد أفضل واستجابة فرامل أسرع.', newAvailable: true, newPrice: 1000, importedAvailable: true, category: 'الفرامل', carBrands: ['تويوتا', 'كيا', 'رينو'], imageDataUrl: '', createdAt: '2024-07-02' },
  { id: 'p3', title: 'كاليبر', description: 'كاليبر فرامل مضبوط لضغط ثابت وتآكل متوازن.', newAvailable: true, newPrice: 1000, importedAvailable: true, category: 'الفرامل', carBrands: ['هيونداي', 'كيا', 'شيفروليه'], imageDataUrl: '', createdAt: '2024-07-03' },
  { id: 'p4', title: 'ماستر عمومي', description: 'ماستر عمومي لتحكم دقيق في ضغط الفرامل.', newAvailable: true, newPrice: 1000, importedAvailable: true, category: 'الفرامل', carBrands: ['تويوتا', 'نيسان', 'هيونداي'], imageDataUrl: '', createdAt: '2024-07-04' },
  { id: 'p5', title: 'زيت فرامل', description: 'زيت فرامل بمعايير عالية لتحمل درجات الحرارة.', newAvailable: true, newPrice: 1000, importedAvailable: true, category: 'الفرامل', carBrands: ['تويوتا', 'هيونداي', 'كيا'], imageDataUrl: '', createdAt: '2024-07-05' },
  { id: 'p6', title: 'خرطوم فرامل', description: 'خرطوم فرامل قوي لمقاومة التمدد والتسريب.', newAvailable: true, newPrice: 1000, importedAvailable: true, category: 'الفرامل', carBrands: ['هيونداي', 'نيسان', 'رينو'], imageDataUrl: '', createdAt: '2024-07-06' },

  // العفشة والدركسيون
  { id: 'p7', title: 'مساعدين', description: 'مساعدين ثابتين لراحة أفضل وثبات على الطرق.', newAvailable: true, newPrice: 1000, importedAvailable: true, category: 'العفشة والدركسيون', carBrands: ['تويوتا', 'هيونداي'], imageDataUrl: '', createdAt: '2024-07-01' },
  { id: 'p8', title: 'بطاحات', description: 'بطاحات قوية لتوزيع الحمل وتقليل الاهتزاز.', newAvailable: true, newPrice: 1000, importedAvailable: true, category: 'العفشة والدركسيون', carBrands: ['نيسان', 'هيونداي'], imageDataUrl: '', createdAt: '2024-07-02' },
  { id: 'p9', title: 'مقصات', description: 'مقصات أمامية بخامة متينة لعمر أطول.', newAvailable: true, newPrice: 1000, importedAvailable: true, category: 'العفشة والدركسيون', carBrands: ['تويوتا', 'كيا'], imageDataUrl: '', createdAt: '2024-07-03' },
  { id: 'p10', title: 'جلب مقصات', description: 'جلب مقصات لتقليل الصوت وتحسين التوازن.', newAvailable: true, newPrice: 1000, importedAvailable: true, category: 'العفشة والدركسيون', carBrands: ['هيونداي', 'رينو'], imageDataUrl: '', createdAt: '2024-07-04' },
  { id: 'p11', title: 'تيش دركسيون', description: 'تيش دركسيون لتحكم أدق في التوجيه.', newAvailable: true, newPrice: 1000, importedAvailable: true, category: 'العفشة والدركسيون', carBrands: ['تويوتا', 'نيسان'], imageDataUrl: '', createdAt: '2024-07-05' },
  { id: 'p12', title: 'طرف تيش', description: 'طرف تيش بجودة عالية لثبات التوجيه.', newAvailable: true, newPrice: 1000, importedAvailable: true, category: 'العفشة والدركسيون', carBrands: ['هيونداي', 'كيا'], imageDataUrl: '', createdAt: '2024-07-06' },
  { id: 'p13', title: 'بيض دركسيون', description: 'بيض دركسيون لمرونة حركة التوجيه.', newAvailable: true, newPrice: 1000, importedAvailable: true, category: 'العفشة والدركسيون', carBrands: ['شيفروليه', 'تويوتا'], imageDataUrl: '', createdAt: '2024-07-07' },

  // الموتور
  { id: 'p14', title: 'جوان وش سلندر', description: 'جوان وش سلندر لعزل ممتاز ومنع التسريب.', newAvailable: true, newPrice: 1000, importedAvailable: true, category: 'الموتور', carBrands: ['هيونداي', 'نيسان'], imageDataUrl: '', createdAt: '2024-07-01' },
  { id: 'p15', title: 'جوان غطا تاكيهات', description: 'جوان غطا تاكيهات مقاوم للحرارة والزيت.', newAvailable: true, newPrice: 1000, importedAvailable: true, category: 'الموتور', carBrands: ['تويوتا', 'كيا'], imageDataUrl: '', createdAt: '2024-07-02' },
  { id: 'p16', title: 'طقم جوانات', description: 'طقم جوانات كامل للموتور.', newAvailable: true, newPrice: 1000, importedAvailable: true, category: 'الموتور', carBrands: ['هيونداي', 'رينو'], imageDataUrl: '', createdAt: '2024-07-03' },
  { id: 'p17', title: 'طلمبة ميه', description: 'طلمبة ميه لتدوير التبريد بكفاءة.', newAvailable: true, newPrice: 1000, importedAvailable: true, category: 'الموتور', carBrands: ['نيسان', 'تويوتا'], imageDataUrl: '', createdAt: '2024-07-04' },
  { id: 'p18', title: 'طلمبة زيت', description: 'طلمبة زيت للحفاظ على ضغط الزيت.', newAvailable: true, newPrice: 1000, importedAvailable: true, category: 'الموتور', carBrands: ['هيونداي', 'كيا'], imageDataUrl: '', createdAt: '2024-07-05' },
  { id: 'p19', title: 'سير كاتينة', description: 'سير كاتينة لعزم ثابت وتوقيت مضبوط.', newAvailable: true, newPrice: 1000, importedAvailable: true, category: 'الموتور', carBrands: ['تويوتا', 'شيفروليه'], imageDataUrl: '', createdAt: '2024-07-06' },
  { id: 'p20', title: 'حساس كرنك', description: 'حساس كرنك دقيق لتحسين تشغيل المحرك.', newAvailable: true, newPrice: 1000, importedAvailable: true, category: 'الموتور', carBrands: ['هيونداي', 'رينو'], imageDataUrl: '', createdAt: '2024-07-07' },
  { id: 'p21', title: 'قواعد موتور', description: 'قواعد موتور لامتصاص الاهتزازات.', newAvailable: true, newPrice: 1000, importedAvailable: true, category: 'الموتور', carBrands: ['تويوتا', 'نيسان'], imageDataUrl: '', createdAt: '2024-07-08' },

  // الكهرباء
  { id: 'p22', title: 'بطارية', description: 'بطارية ثابتة الأداء وتشغيل سريع.', newAvailable: true, newPrice: 1000, importedAvailable: true, category: 'الكهرباء', carBrands: ['تويوتا', 'هيونداي', 'نيسان'], imageDataUrl: '', createdAt: '2024-07-01' },
  { id: 'p23', title: 'دينامو', description: 'دينامو يشحن بكفاءة ويحافظ على الكهرباء.', newAvailable: true, newPrice: 1000, importedAvailable: true, category: 'الكهرباء', carBrands: ['هيونداي', 'كيا'], imageDataUrl: '', createdAt: '2024-07-02' },
  { id: 'p24', title: 'مارش', description: 'مارش قوي لتدوير المحرك بسرعة.', newAvailable: true, newPrice: 1000, importedAvailable: true, category: 'الكهرباء', carBrands: ['نيسان', 'تويوتا'], imageDataUrl: '', createdAt: '2024-07-03' },
  { id: 'p25', title: 'ريلاي', description: 'ريلاي كهرباء ثابت لتوزيع الحمل.', newAvailable: true, newPrice: 1000, importedAvailable: true, category: 'الكهرباء', carBrands: ['هيونداي', 'رينو'], imageDataUrl: '', createdAt: '2024-07-04' },
  { id: 'p26', title: 'فيوزات', description: 'طقم فيوزات للأمان وحماية الدوائر.', newAvailable: true, newPrice: 1000, importedAvailable: true, category: 'الكهرباء', carBrands: ['تويوتا', 'كيا'], imageDataUrl: '', createdAt: '2024-07-05' },
  { id: 'p27', title: 'ضفيرة كهرباء', description: 'ضفيرة كهرباء بجودة عالية لتوصيلات ثابتة.', newAvailable: true, newPrice: 1000, importedAvailable: true, category: 'الكهرباء', carBrands: ['هيونداي', 'شيفروليه'], imageDataUrl: '', createdAt: '2024-07-06' },

  // التبريد
  { id: 'p28', title: 'ردياتير', description: 'ردياتير بتبريد قوي وحماية للمحرك.', newAvailable: true, newPrice: 1000, importedAvailable: true, category: 'التبريد', carBrands: ['تويوتا', 'هيونداي'], imageDataUrl: '', createdAt: '2024-07-01' },
  { id: 'p29', title: 'مروحة ردياتير', description: 'مروحة ردياتير لخفض الحرارة بسرعة.', newAvailable: true, newPrice: 1000, importedAvailable: true, category: 'التبريد', carBrands: ['نيسان', 'كيا'], imageDataUrl: '', createdAt: '2024-07-02' },
  { id: 'p30', title: 'قربة ميه', description: 'قربة ميه لحفظ سائل التبريد.', newAvailable: true, newPrice: 1000, importedAvailable: true, category: 'التبريد', carBrands: ['هيونداي', 'رينو'], imageDataUrl: '', createdAt: '2024-07-03' },
  { id: 'p31', title: 'ثرموستات', description: 'ثرموستات لضبط حرارة المحرك.', newAvailable: true, newPrice: 1000, importedAvailable: true, category: 'التبريد', carBrands: ['تويوتا', 'شيفروليه'], imageDataUrl: '', createdAt: '2024-07-04' },
  { id: 'p32', title: 'حساس حرارة', description: 'حساس حرارة دقيق لقراءات ثابتة.', newAvailable: true, newPrice: 1000, importedAvailable: true, category: 'التبريد', carBrands: ['هيونداي', 'كيا'], imageDataUrl: '', createdAt: '2024-07-05' },
  { id: 'p33', title: 'خرطوم ردياتير', description: 'خرطوم ردياتير مقاوم للحرارة والضغط.', newAvailable: true, newPrice: 1000, importedAvailable: true, category: 'التبريد', carBrands: ['نيسان', 'تويوتا'], imageDataUrl: '', createdAt: '2024-07-06' },
];
