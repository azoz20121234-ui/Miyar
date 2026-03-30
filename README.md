# ميار | محرك قرار تشغيلي قبل التوظيف

منصة عربية RTL مبنية بـ `Next.js + TypeScript + Tailwind` لتحويل قرار توظيف الأشخاص ذوي الإعاقة في السعودية من خطاب عام إلى قرار تشغيلي واضح:

`الوظيفة × القدرات المثبتة + التكييف المسعّر = توظيف أكثر استدامة`

هذه المنصة ليست:
- لوحة وظائف
- نظام ATS
- منصة سير ذاتية
- موقع توعوي

هي منتج قرار قبل التوظيف.

## التشغيل

```bash
npm install
npm run dev
```

## النشر

### Vercel

```bash
npm install
npm run build
npm run deploy:preview
```

وللنشر الإنتاجي:

```bash
npm run deploy:prod
```

لا توجد متغيرات بيئة مطلوبة لهذه النسخة لأن الديمو يعمل بالكامل على `mock data`.

### GitHub Pages

المشروع مهيأ للتصدير الثابت أيضًا على GitHub Pages.

- المستودع: [https://github.com/azoz20121234-ui/Miyar](https://github.com/azoz20121234-ui/Miyar)
- الرابط: [https://azoz20121234-ui.github.io/Miyar/](https://azoz20121234-ui.github.io/Miyar/)

## المسارات

- `/` الصفحة التنفيذية
- `/workspace` مساحة صاحب العمل
- `/job-analysis` تحليل الوظيفة
- `/candidate-profile` ملف القدرات التشغيلية
- `/matching` المطابقة والفجوات
- `/accommodation-plan` خطة التكييف
- `/readiness-report` التقرير التنفيذي
- `/dashboard` لوحة تنفيذية

## منطق القرار

النسخة الحالية مبنية على pipeline واضح وقابل للتفسير:

1. `task-engine.ts`
   يحوّل كل مهمة إلى `Task Fit` قابل للتفسير بناءً على:
   - الحس البصري
   - الحس السمعي
   - المتطلبات الحركية الدقيقة والعامة
   - الحمل المعرفي
   - متطلبات التواصل
   - التنقل الرقمي
   - أثر البيئة الحالية على المهمة نفسها

2. `barrier-engine.ts`
   يشتق العوائق من:
   - نتائج المهام
   - صيغة الملفات
   - نضج الوصول الرقمي
   - الإضاءة
   - مخاطر الدور
   - بنية الأدوات

   أمثلة العوائق:
   - `ui-readability`
   - `navigation-speed`
   - `document-review`
   - `tool-structure-gap`
   - `quality-check-overhead`

3. `accommodation-engine.ts`
   لا يربط التكييف بالإعاقة فقط، بل يربطه بـ:
   - العائق
   - المهمة المتأثرة
   - الجاهزية المحلية
   - الجهد التنفيذي
   - التكلفة
   - الزمن

4. `report-engine.ts`
   يبني `Executive Decision Report` من:
   - `Task Fit`
   - `Environment Fit`
   - `Critical Coverage`
   - `Accommodation Feasibility`
   - الجاهزية قبل التهيئة وبعدها
   - المخاطر المتبقية
   - إشارات Saudi-first

## Saudi-first Signals

هذه الإشارات ليست فتاوى قانونية، بل مؤشرات تشغيلية داخلية تساعد لجنة القرار:

- `Role Clarity Signal`
- `Real-Task Alignment Signal`
- `Accommodation Sufficiency Signal`
- `Fake-Role Risk Signal`
- `Sustainability Likelihood Signal`

## البيانات والنطاق

### Task Bank

تم توسيع بنية المهمة لتشمل:

- نوع المهمة: أساسية / ثانوية
- التكرار
- المدة
- الشدة
- الحس البصري
- الحس السمعي
- المتطلبات الحركية الدقيقة
- المتطلبات الحركية العامة
- المتطلبات المعرفية
- متطلبات التواصل
- أداة العمل
- قابلية إعادة التوزيع أو التعديل

النسخة الحالية تشمل أدوارًا مكتبية وإدارية ورقمية فقط داخل نطاق MVP.

### Accommodation Library

كل عنصر في المكتبة يحتوي على:

- `targetBarrierIds`
- `supportedTaskIds`
- `expectedEffectiveness`
- `implementationEffort`
- `estimatedCostRangeSar`
- `estimatedTimeToImplementDays`
- `dependencyRequirements`
- `localReadinessFlag`
- `priorityLevel`
- `investmentClass`

## سيناريو الديمو

الديمو الافتراضي الجاهز:

- الوظيفة: دعم إداري / إدخال بيانات
- المرشح: ضعف بصري
- البيئة: مكتب + أنظمة + بريد + جداول + اجتماعات محدودة
- العوائق: قراءة الواجهات + سرعة التنقل + مراجعة الملفات + بنية الأدوات
- التكييفات: قارئ شاشة + تكبير ذكي + keyboard workflow + process adaptation
- القرار النهائي: `مناسب بعد التهيئة`

## هيكل المشروع

- `src/models`
  نماذج البيانات والأنواع
- `src/data`
  Task Bank وAccommodation Library وبيانات الديمو وقوالب الأدوار
- `src/lib/task-engine.ts`
  منطق تقييم المهمة
- `src/lib/barrier-engine.ts`
  اشتقاق العوائق
- `src/lib/accommodation-engine.ts`
  مطابقة التكييفات وبناء الخطة
- `src/lib/report-engine.ts`
  بناء التقرير التنفيذي والإشارات
- `src/lib/scoring.ts`
  طبقة orchestration والتنسيقات
- `src/store`
  حالة الديمو المشتركة بين الصفحات
- `src/components`
  المكونات المشتركة
- `src/app`
  الصفحات

## تحقق محلي

تم التحقق من البناء عبر:

```bash
npm run build
```
