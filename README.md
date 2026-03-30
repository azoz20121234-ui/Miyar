# ميار | محرك قرار تشغيلي قبل التوظيف

منصة ويب عربية RTL مبنية بـ Next.js + TypeScript + Tailwind لتقييم الجاهزية التشغيلية قبل التوظيف للأشخاص ذوي الإعاقة ضمن وظائف مكتبية ورقمية في السعودية.

## التشغيل

```bash
npm install
npm run dev
```

## النشر

المنصة جاهزة للنشر على Vercel مباشرة لأنها مبنية على `Next.js`.

```bash
npm install
npm run build
npm run deploy:preview
```

وللنشر الإنتاجي:

```bash
npm run deploy:prod
```

إذا كانت هذه أول مرة:

- سجل الدخول إلى Vercel
- اختر أو أنشئ Project جديد
- اترك إعدادات `Build Command` و `Output` الافتراضية
- Framework = `Next.js`

لا توجد متغيرات بيئة مطلوبة في هذه النسخة لأن الديمو يعمل على mock data محلية.

## النشر على GitHub Pages

تمت تهيئة المشروع أيضًا للنشر التلقائي على GitHub Pages من خلال GitHub Actions.

- المستودع: [https://github.com/azoz20121234-ui/Miyar](https://github.com/azoz20121234-ui/Miyar)
- رابط GitHub Pages المتوقع: `https://azoz20121234-ui.github.io/Miyar/`

أي push على `main` سيبني النسخة الثابتة ويعيد نشرها تلقائيًا.

## المسارات

- `/` الصفحة التنفيذية
- `/workspace` مساحة صاحب العمل
- `/job-analysis` تحليل الوظيفة
- `/candidate-profile` ملف القدرات التشغيلية
- `/matching` المطابقة والفجوات
- `/accommodation-plan` خطة التكييف
- `/readiness-report` تقرير الجاهزية
- `/dashboard` لوحة تنفيذية

## هيكل المشروع

- `src/models`: النماذج والأنواع
- `src/data`: بيانات الديمو والمكتبات المحدودة
- `src/lib`: منطق التقييم والتجميع
- `src/store`: حالة الديمو عبر الصفحات
- `src/components`: مكونات العرض المشتركة
- `src/app`: الصفحات والمسارات
