import { Injectable } from "@nestjs/common";
import {
  User,
  Manufacturer,
  Medication,
  Pharmacy,
  PharmacyInventory,
  Prescription,
  Reservation,
  RareDrugAlert,
  PharmacyReview,
  ChatConversation,
  ChatMessage,
} from "../database/models";

@Injectable()
export class SeedService {
  async seedDatabase(): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
      const existing = await Manufacturer.countDocuments({});
      if (existing > 0) {
        console.log("Database already seeded. Skipping seed.");
        return { success: true, message: "already seeded" };
      }

      console.log("🌱 Seeding Torob Salamat (MongoDB) with realistic demo data...");

      /* ------------------------------- Users ------------------------------ */
      const users = await User.insertMany([
        {
          name: "علی رضایی",
          phone: "09121112233",
          email: "ali.rezaei@gmail.com",
          role: "patient",
          insuranceType: "تامین اجتماعی",
          nationalId: "0012345678",
          city: "تهران",
          neighborhood: "ونک",
          address: "تهران، میدان ونک، خیابان ونک، کوچه آفتاب، پلاک ۱۲، واحد ۳",
          latitude: 35.7575,
          longitude: 51.4099,
          allergies: "حساسیت خفیف به پنی‌سیلین",
        },
        {
          name: "دکتر مهرداد اکبری",
          phone: "09124445566",
          email: "dr.akbari@vanak-pharmacy.ir",
          role: "pharmacist",
          insuranceType: "نیروهای مسلح",
          nationalId: "0078912345",
          city: "تهران",
          neighborhood: "ونک",
          address: "تهران، میدان ونک، ابتدای خیابان ملاصدرا، پلاک ۴",
          latitude: 35.759,
          longitude: 51.411,
        },
        {
          name: "مدیریت ارشد ترب سلامت",
          phone: "09129998877",
          email: "admin@torobsalamat.ir",
          role: "admin",
          insuranceType: "تامین اجتماعی",
          nationalId: "0033221144",
          city: "تهران",
          neighborhood: "مرکزی",
          address: "تهران، کارخانه نوآوری آزادی، ساختمان ترب",
          latitude: 35.7,
          longitude: 51.35,
        },
        {
          name: "مریم سلیمانی (بیمار پیوندی)",
          phone: "09198887766",
          email: "maryam.s@yahoo.com",
          role: "patient",
          insuranceType: "بیمه سلامت (ایرانیان)",
          nationalId: "0045566778",
          city: "تهران",
          neighborhood: "تجریش",
          address: "تهران، میدان تجریش، خیابان مقصودبیک، پلاک ۲۲",
          latitude: 35.805,
          longitude: 51.431,
        },
      ] as any[]);

      /* --------------------------- Manufacturers -------------------------- */
      const manufacturers = await Manufacturer.insertMany([
        { name: "F. Hoffmann-La Roche Ltd", persianName: "داروسازی روش (سوئیس)", country: "سوئیس", qualityTier: "A+", qualityScore: 98, reputationNotes: "بالاترین استاندارد زیست‌فناوری جهان، سازنده داروی مرجع سل‌سپت و داروهای انکولوژی درجه یک", isIranian: false, website: "https://www.roche.com" },
        { name: "Novartis AG", persianName: "نووارتیس (سوئیس)", country: "سوئیس", qualityTier: "A+", qualityScore: 97, reputationNotes: "پیشگام داروهای اعصاب و پیوند، سازنده ریتالین اصل، گلیوک و داروهای پیوندی با خلوص فرمولاسیون ۹۹.۸٪", isIranian: false, website: "https://www.novartis.com" },
        { name: "Sanofi S.A.", persianName: "سانوفی (فرانسه)", country: "فرانسه", qualityTier: "A+", qualityScore: 96, reputationNotes: "سازنده معتبرترین قلم‌های انسولین دنیا (لانتوس سولوستار) با ماندگاری ۲۴ ساعته خطی و ثابت", isIranian: false, website: "https://www.sanofi.com" },
        { name: "Dr. Abidi Pharmaceuticals", persianName: "داروسازی دکتر عبیدی", country: "ایران", qualityTier: "A+", qualityScore: 93, reputationNotes: "برترین شرکت داروسازی ایران و دارنده خطوط تولید مدرن cGMP با بیشترین میزان رضایت پزشکان و کمترین عوارض جانبی", isIranian: true, website: "https://abidipharma.com" },
        { name: "Actoverco Pharmaceutical", persianName: "گروه دارویی اکتوورکو", country: "ایران / اسپانیا", qualityTier: "A", qualityScore: 91, reputationNotes: "تولید تحت لیسانس معتبرترین برندهای اروپایی با مواد اولیه وارداتی گرید USP", isIranian: true, website: "https://actoverco.com" },
        { name: "CinnaGen", persianName: "شرکت سیناژن", country: "ایران", qualityTier: "A", qualityScore: 90, reputationNotes: "بزرگترین صادرکننده و تولیدکننده داروهای بیوتکنولوژی، ام‌اس و قلم‌های بیوسیمیلار انسولین در خاورمیانه", isIranian: true, website: "https://cinnagen.com" },
        { name: "Bayer AG", persianName: "بایر (آلمان)", country: "آلمان", qualityTier: "A+", qualityScore: 96, reputationNotes: "سازنده بتافرون و داروهای تخصصی قلب و عروق با رفرنس جهانی", isIranian: false, website: "https://www.bayer.com" },
        { name: "Koushan Pharmed", persianName: "کوشان فارمد", country: "ایران", qualityTier: "A", qualityScore: 88, reputationNotes: "تخصص در اسپری‌های استنشاقی و داروهای پیشرفته تنفسی و آسم", isIranian: true, website: "https://koushanpharmed.com" },
        { name: "Darou Pakhsh", persianName: "کارخانجات داروپخش", country: "ایران", qualityTier: "B+", qualityScore: 84, reputationNotes: "یکی از باقدمت‌ترین هلدینگ‌های دارویی کشور با قیمت مصوب دولتی بسیار مناسب و دسترسی سراسری", isIranian: true, website: "https://daroupakhsh.ir" },
        { name: "Hexal AG", persianName: "هگزال (آلمان / ساندوز)", country: "آلمان", qualityTier: "A", qualityScore: 92, reputationNotes: "تولیدکننده شناخته‌شده داروهای ژنریک با بالاترین جذب زیستی و حداقل ناراحتی گوارشی", isIranian: false, website: "https://www.hexal.de" },
        { name: "Octapharma", persianName: "اکتافارما (اتریش)", country: "اتریش", qualityTier: "A+", qualityScore: 97, reputationNotes: "مرجع فرآورده‌های مشتق از پلاسما و سرم‌های اختصاصی IVIG در جهان", isIranian: false, website: "https://www.octapharma.com" },
      ] as any[]);

      const manMap = new Map<string, number>();
      for (const m of manufacturers) manMap.set((m as any).persianName, (m as any).id);

      /* ----------------------------- Medications -------------------------- */
      const medicationsData: any[] = [
        { genericName: "Mycophenolate Mofetil", persianName: "مایکوفنولات موفتیل (سل‌سپت سوئیسی)", brandName: "CellCept 500mg", category: "پیوند و ایمونولوژی", isRare: true, isColdChain: false, requiresPrescription: true, dosageForm: "قرص روکش‌دار", dosageStrength: "500 میلی‌گرم", manufacturerId: manMap.get("داروسازی روش (سوئیس)"), officialPrice: 1850000, usageSummary: "داروی سرکوب‌کننده سیستم ایمنی بدن جهت جلوگیری قطعی از رد پیوند کلیه، کبد و قلب", sideEffects: "احتمال تهوع ملایم در اوایل مصرف، نیاز به پایش آزمایش خون ماهیانه", storageCondition: "دمای زیر ۲۵ درجه، دور از نور مستقیم", ifdaStatus: "دارای سهمیه و تاییدیه سامانه دارویی غذا و دارو (TTAC)", tags: ["پیوند اعضا", "کمیاب", "سوئیسی", "اورژانسی", "نسخه تایید شده"] },
        { genericName: "Mycophenolate Mofetil", persianName: "مایکوفنولات موفتیل سوپریمون (ایرانی عبیدی)", brandName: "Suprimun 500mg", category: "پیوند و ایمونولوژی", isRare: false, isColdChain: false, requiresPrescription: true, dosageForm: "قرص روکش‌دار", dosageStrength: "500 میلی‌گرم", manufacturerId: manMap.get("داروسازی دکتر عبیدی"), officialPrice: 620000, usageSummary: "جایگزین باکیفیت و استاندارد سل‌سپت با فراهمی زیستی معادل و قیمت مصوب بیمه‌ای", sideEffects: "تحمل گوارشی بالا نسبت به سایر نمونه‌های ژنریک", storageCondition: "دمای ۱۵ تا ۳۰ درجه", ifdaStatus: "تحت پوشش صددرصدی بیمه‌های پایه و تکمیلی", tags: ["پیوند اعضا", "ایرانی ممتاز", "تحت پوشش بیمه"] },
        { genericName: "Insulin Glargine", persianName: "قلم انسولین لانتوس سولوستار", brandName: "Lantus SoloStar 100 IU/ml", category: "دیابت و غدد", isRare: true, isColdChain: true, requiresPrescription: true, dosageForm: "قلم تزریقی آماده", dosageStrength: "۱۰۰ واحد بر میلی‌لیتر (۳ میلی‌لیتر)", manufacturerId: manMap.get("سانوفی (فرانسه)"), officialPrice: 480000, usageSummary: "انسولین پایه و طولانی‌اثر ۲۴ ساعته جهت کنترل قند خون شبانه‌روزی بدون افت ناگهانی قند (هیپوگلیسمی)", sideEffects: "در صورت عدم تنظیم دوز احتمال افت قند، واکنش موضعی در محل تزریق", storageCondition: "الزام نگهداری در زنجیره سرد یخچال ۲ تا ۸ درجه سانتی‌گراد", ifdaStatus: "تاییدیه ثبت در سامانه مدیریت انسولین سازمان غذا و دارو", tags: ["دیابت", "انسولین", "زنجیره سرد", "فرانسه", "کمیاب"] },
        { genericName: "Insulin Glargine", persianName: "قلم انسولین سیناگلار", brandName: "SynaGlar SoloStar 100 IU/ml", category: "دیابت و غدد", isRare: false, isColdChain: true, requiresPrescription: true, dosageForm: "قلم تزریقی آماده", dosageStrength: "۱۰۰ واحد در میلی‌لیتر", manufacturerId: manMap.get("شرکت سیناژن"), officialPrice: 195000, usageSummary: "انسولین پایه بایوسیمیلار ایرانی تولیدشده با تکنولوژی فوق‌پیشرفته و تحت پوشش کامل بیمه", sideEffects: "افت قند در دوزهای اشتباه", storageCondition: "زنجیره سرد ۲ تا ۸ درجه", ifdaStatus: "دارای مجوز و موجود در اکثر داروخانه‌ها", tags: ["دیابت", "انسولین", "زنجیره سرد", "تولید ملی"] },
        { genericName: "Methylphenidate Hydrochloride", persianName: "قرص ریتالین نووارتیس (اصل سوئیس)", brandName: "Ritalin 10mg", category: "اعصاب و روان", isRare: true, isColdChain: false, requiresPrescription: true, dosageForm: "قرص", dosageStrength: "10 میلی‌گرم", manufacturerId: manMap.get("نووارتیس (سوئیس)"), officialPrice: 420000, usageSummary: "درمان اختلال بیش‌فعالی و عدم تمرکز (ADHD) و نارکولپسی با اثرگذاری سریع و دقیق", sideEffects: "کاهش اشتها، بی‌خوابی در صورت مصرف دیرهنگام عصرگاهی، افزایش ضربان قلب", storageCondition: "در دمای اتاق و دور از دسترس کودکان و سوءمصرف", ifdaStatus: "داروی تحت کنترل شدید پوکه دارویی با تاییدیه نسخه پزشک متخصص", tags: ["اعصاب", "بیش‌فعالی", "کمیاب", "سوئیس", "نسخه روانپزشک"] },
        { genericName: "Methylphenidate Hydrochloride", persianName: "قرص متیل فنیدات مداکتول عبیدی", brandName: "Medactol 10mg", category: "اعصاب و روان", isRare: false, isColdChain: false, requiresPrescription: true, dosageForm: "قرص", dosageStrength: "10 میلی‌گرم", manufacturerId: manMap.get("داروسازی دکتر عبیدی"), officialPrice: 145000, usageSummary: "نمونه ایرانی استاندارد ریتالین با آزادسازی پیوسته و یکنواخت", sideEffects: "کاهش اشتهای موقت", storageCondition: "دمای ۱۵ تا ۲۵ درجه", ifdaStatus: "تاییدیه رسمی و سهمیه‌ای", tags: ["اعصاب", "بیش‌فعالی", "ایرانی", "داروسازی عبیدی"] },
        { genericName: "Human Normal Immunoglobulin", persianName: "ویال آی‌وی‌آی‌جی اکتاگام اتریش (IVIG)", brandName: "Octagam 5g / 100ml", category: "پیوند و ایمونولوژی", isRare: true, isColdChain: true, requiresPrescription: true, dosageForm: "محلول تزریقی داخل وریدی", dosageStrength: "۵ گرم در ۱۰۰ میلی‌لیتر (۵٪)", manufacturerId: manMap.get("اکتافارما (اتریش)"), officialPrice: 5800000, usageSummary: "درمان نقص‌های ایمنی مادرزادی، گیلن‌باره، ترومبوسیتوپنی ایمنی (ITP) و بیماری کاوازاکی", sideEffects: "سردرد، لرز موقت حین تزریق، افت فشارخون", storageCondition: "یخچال ۲ تا ۸ درجه سانتی‌گراد، محافظت در برابر نور", ifdaStatus: "توزیع سهمیه‌ای منحصراً در داروخانه‌های منتخب دولتی و هلال احمر", tags: ["ایمونولوژی", "بیمارستانی", "فوق‌العاده کمیاب", "سرم خاص"] },
        { genericName: "Mesalazine", persianName: "کپسول مسالازین پنتازا ۵۰۰ (خارجی)", brandName: "Pentasa Slow Release 500mg", category: "گوارشی", isRare: true, isColdChain: false, requiresPrescription: true, dosageForm: "کپسول پیوسته‌رهش", dosageStrength: "500 میلی‌گرم", manufacturerId: manMap.get("گروه دارویی اکتوورکو"), officialPrice: 890000, usageSummary: "درمان و کنترل عود بیماری‌های التهابی روده شامل کولیت اولسراتیو و کرون با پوشش روده‌ای", sideEffects: "گاهی سردرد یا تهوع خفیف", storageCondition: "دمای زیر ۲۵ درجه", ifdaStatus: "دارای پروانه واردات رسمی", tags: ["گوارش", "کولیت", "کرون", "کمیاب"] },
        { genericName: "Mesalazine", persianName: "قرص مزالازین ۵۰۰ داروپخش", brandName: "Mesalazine DP 500mg", category: "گوارشی", isRare: false, isColdChain: false, requiresPrescription: true, dosageForm: "قرص انتریک کوتد", dosageStrength: "500 میلی‌گرم", manufacturerId: manMap.get("کارخانجات داروپخش"), officialPrice: 220000, usageSummary: "درمان التهاب کولیت با پوشش مقاوم به اسید معده و باز شدن در انتهای روده", sideEffects: "خفیف گوارشی", storageCondition: "محیط خشک و خنک", ifdaStatus: "موجود در تمام داروخانه‌های کشور", tags: ["گوارش", "کولیت", "داروپخش", "قیمت مناسب"] },
        { genericName: "Metformin Hydrochloride", persianName: "قرص متفورمین ۵۰۰ هگزال آلمان", brandName: "Metformin Hexal 500mg", category: "دیابت و غدد", isRare: false, isColdChain: false, requiresPrescription: true, dosageForm: "قرص روکش‌دار", dosageStrength: "500 میلی‌گرم", manufacturerId: manMap.get("هگزال (آلمان / ساندوز)"), officialPrice: 195000, usageSummary: "کنترل قند خون بیماران دیابت نوع دو و کاهش مقاومت به انسولین با کمترین نفخ و عارضه معده", sideEffects: "احتمال طعم فلزی ملایم در دهان", storageCondition: "دمای معمولی اتاق", ifdaStatus: "مجوز رسمی واردات غذا و دارو", tags: ["دیابت", "قند خون", "آلمانی", "کیفیت بالا"] },
        { genericName: "Metformin Hydrochloride", persianName: "قرص متفورمین ۵۰۰ آریا / عبیدی (گلوکوفاژ)", brandName: "Glucophage Abidi 500mg", category: "دیابت و غدد", isRare: false, isColdChain: false, requiresPrescription: false, dosageForm: "قرص روکش‌دار", dosageStrength: "500 میلی‌گرم", manufacturerId: manMap.get("داروسازی دکتر عبیدی"), officialPrice: 65000, usageSummary: "پرمصرف‌ترین داروی کاهش قند خون در ایران با کیفیت ساخت بالا و قیمت بیمه‌ای ارزان", sideEffects: "بهتر است همراه غذا مصرف شود تا از درد معده پیشگیری گردد", storageCondition: "دمای اتاق", ifdaStatus: "تحت پوشش تمام بیمه‌ها", tags: ["دیابت", "عمومی", "ارزان", "پرمصرف"] },
        { genericName: "Interferon Beta-1b", persianName: "ویال بتافرون بایر آلمان (MS)", brandName: "Betaferon 0.25mg (8 MIU)", category: "اعصاب و روان", isRare: true, isColdChain: true, requiresPrescription: true, dosageForm: "پودر برای تهیه سوسپانسیون تزریقی", dosageStrength: "۲۵۰ میکروگرم", manufacturerId: manMap.get("بایر (آلمان)"), officialPrice: 4200000, usageSummary: "کاهش فرکانس و شدت حملات در بیماران مبتلا به ام‌اس (Multiple Sclerosis) عودکننده-فروکش‌کننده", sideEffects: "علائم شبه آنفلوآنزا بعد از تزریق که با استامینوفن برطرف می‌شود", storageCondition: "زنجیره سرد یخچال ۲ تا ۸ درجه", ifdaStatus: "سهمیه پرونده خاص بیماران خاص بنیاد ام‌اس", tags: ["ام‌اس", "بیماری خاص", "زنجیره سرد", "آلمانی", "کمیاب"] },
        { genericName: "Imatinib", persianName: "قرص گلیوک نووارتیس (نووارتیس ۴۰۰)", brandName: "Glivec 400mg", category: "انکولوژی و سرطان", isRare: true, isColdChain: false, requiresPrescription: true, dosageForm: "قرص روکش‌دار", dosageStrength: "400 میلی‌گرم", manufacturerId: manMap.get("نووارتیس (سوئیس)"), officialPrice: 6400000, usageSummary: "درمان لوسمی میلوئید مزمن (CML) و تومورهای استرومال گوارشی (GIST)", sideEffects: "احتباس مایعات، ادم پلک، خستگی و پایش هفتگی آنزیم‌های کبد", storageCondition: "زیر ۳۰ درجه سانتی‌گراد", ifdaStatus: "داروی تک‌نسخه‌ای و پرونده‌ای وزارت بهداشت", tags: ["سرطان", "انکولوژی", "سوئیس", "فوق‌العاده کمیاب"] },
        { genericName: "Fluticasone / Salmeterol", persianName: "اسپری استنشاقی فلوتیکازون سالمترول (سروفلو)", brandName: "Seroflo Inhaler 250", category: "تنفسی", isRare: false, isColdChain: false, requiresPrescription: true, dosageForm: "اسپری استنشاقی دوز سنجیده (MDI)", dosageStrength: "۲۵ / ۲۵۰ میکروگرم", manufacturerId: manMap.get("کوشان فارمد"), officialPrice: 380000, usageSummary: "پیشگیری و کنترل علائم آسم متوسط تا شدید و بیماری مزمن انسدادی ریه (COPD)", sideEffects: "گرفتگی خفیف صدا (توصیه به شستشوی دهان پس از مصرف)", storageCondition: "دور از تابش نور و حرارت بالای ۵۰ درجه", ifdaStatus: "موجود در شبکه رسمی داروخانه‌ها", tags: ["تنفسی", "آسم", "اسپری", "ریه"] },
      ];
      const medications = await Medication.insertMany(medicationsData);
      const medMap = new Map<string, number>();
      for (const m of medications) medMap.set((m as any).brandName, (m as any).id);

      /* ----------------------------- Pharmacies --------------------------- */
      const pharmaciesData: any[] = [
        { userId: (users[1] as any).id, name: "داروخانه شبانه‌روزی ونک (دکتر اکبری)", licenseNumber: "IR-190-88741", licenseType: "شبانه‌روزی", city: "تهران", neighborhood: "ونک", address: "تهران، میدان ونک، ابتدای خیابان ملاصدرا، پلاک ۴ (جنب پایانه تاکسیرانی)", phone: "02188776655", mobile: "09124445566", whatsapp: "+989124445566", latitude: 35.759, longitude: 51.411, is24h: true, isVerified: true, rating: 4.9, totalReviews: 142, insuranceAccepted: ["تامین اجتماعی", "بیمه سلامت", "نیروهای مسلح", "بیمه دی", "بیمه دانا"], deliveryAvailable: true, pharmacistInCharge: "دکتر مهرداد اکبری (دکترای داروسازی بالینی)", emergencyHotlineNote: "دارای انبار مجهز زنجیره سرد و پاسخگویی فوری ۲۴ ساعته" },
        { name: "داروخانه مرکزی هلال احمر (مرجع داروهای کمیاب کشور)", licenseNumber: "IR-190-10001", licenseType: "داروخانه منتخب و مرجع", city: "تهران", neighborhood: "طالقانی", address: "تهران، خیابان آیت‌الله طالقانی، تقاطع خیابان سپهبد قرنی، مجتمع هلال احمر", phone: "02188803890", mobile: "02188803891", whatsapp: "+989129000001", latitude: 35.7032, longitude: 51.4172, is24h: true, isVerified: true, rating: 4.8, totalReviews: 380, insuranceAccepted: ["تامین اجتماعی", "بیمه سلامت", "نیروهای مسلح", "بیمه تکمیلی آتیه‌سازان", "بیمه بانک‌ها"], deliveryAvailable: false, pharmacistInCharge: "دکتر حسینی (مسئول فنی هلال احمر)", emergencyHotlineNote: "بزرگترین مرکز توزیع انسولین‌های خاص، سل‌سپت، آی‌وی‌آی‌جی و داروهای تک‌نسخه‌ای کشوری" },
        { name: "داروخانه شبانه‌روزی ۱۳ آبان (دانشگاه علوم پزشکی تهران)", licenseNumber: "IR-190-10013", licenseType: "داروخانه منتخب و مرجع", city: "تهران", neighborhood: "کریمخان", address: "تهران، خیابان کریمخان زند، نبش خیابان خردمند جنوبی، پلاک ۱۰۴", phone: "02188849011", mobile: "02188849012", whatsapp: "+989129000013", latitude: 35.7171, longitude: 51.4239, is24h: true, isVerified: true, rating: 4.7, totalReviews: 295, insuranceAccepted: ["تامین اجتماعی", "بیمه سلامت", "نیروهای مسلح", "بیمه دی"], deliveryAvailable: false, pharmacistInCharge: "هیات علمی دانشکده داروسازی دانشگاه تهران", emergencyHotlineNote: "پاسخگویی سامانه تلفنی اطلاعات دارویی با خط چهار رقمی ۸۲۱۰۱" },
        { name: "داروخانه ۲۹ فروردین (ارتش جمهوری اسلامی ایران)", licenseNumber: "IR-190-29000", licenseType: "شبانه‌روزی", city: "تهران", neighborhood: "میدان حر", address: "تهران، میدان حر، خیابان کارگر جنوبی، روبروی پادگان حر", phone: "02166401016", mobile: "09123002900", whatsapp: "+989123002900", latitude: 35.688, longitude: 51.396, is24h: true, isVerified: true, rating: 4.6, totalReviews: 210, insuranceAccepted: ["نیروهای مسلح", "تامین اجتماعی", "بیمه سلامت", "کوثر"], deliveryAvailable: true, pharmacistInCharge: "سرهنگ دکتر باقری", emergencyHotlineNote: "تخصصی‌ترین مرکز تامین داروهای شیمی‌درمانی و سهمیه‌های خاص نیروهای مسلح و عموم" },
        { name: "داروخانه شهید کاظمی (تامین اجتماعی)", licenseNumber: "IR-190-33010", licenseType: "داروخانه منتخب و مرجع", city: "تهران", neighborhood: "فاطمی", address: "تهران، خیابان ولیعصر، تقاطع خیابان فاطمی، نبش کوچه بوعلی", phone: "02188902040", mobile: "09121113300", whatsapp: "+989121113300", latitude: 35.7205, longitude: 51.408, is24h: false, isVerified: true, rating: 4.7, totalReviews: 180, insuranceAccepted: ["تامین اجتماعی", "بیمه سلامت"], deliveryAvailable: false, pharmacistInCharge: "دکتر کاظمی", emergencyHotlineNote: "تایید اینترنتی نسخ تامین اجتماعی در محل و تحویل سریع بیماران پیوندی" },
        { name: "داروخانه شبانه‌روزی دکتر شریعتی تجریش", licenseNumber: "IR-190-55421", licenseType: "شبانه‌روزی", city: "تهران", neighborhood: "تجریش", address: "تهران، خیابان شریعتی، بالاتر از پل رومی، روبروی مترو قیطریه، پلاک ۱۸۲۰", phone: "02122201415", mobile: "09122223344", whatsapp: "+989122223344", latitude: 35.798, longitude: 51.433, is24h: true, isVerified: true, rating: 4.9, totalReviews: 112, insuranceAccepted: ["تامین اجتماعی", "بیمه سلامت", "نیروهای مسلح", "بیمه ایران", "بیمه سینا"], deliveryAvailable: true, pharmacistInCharge: "دکتر شریعتی", emergencyHotlineNote: "ارسال با پیک موتوری اکسپرس به سراسر مناطق ۱ و ۳ تهران کمتر از ۳۵ دقیقه" },
        { name: "داروخانه دکتر خانی سعادت‌آباد", licenseNumber: "IR-190-67290", licenseType: "روزانه", city: "تهران", neighborhood: "سعادت‌آباد", address: "تهران، سعادت‌آباد، بالاتر از میدان کاج، نبش خیابان پنجم (نوروزی)، پلاک ۳۴", phone: "02122089910", mobile: "09126667788", whatsapp: "+989126667788", latitude: 35.782, longitude: 51.378, is24h: false, isVerified: true, rating: 4.8, totalReviews: 96, insuranceAccepted: ["تامین اجتماعی", "بیمه سلامت", "بیمه دانا", "بیمه پاسارگاد"], deliveryAvailable: true, pharmacistInCharge: "دکتر پریسا خانی", emergencyHotlineNote: "مشاوره آنلاین داروساز با واتساپ و آماده‌سازی نسخه قبل از حضور بیمار" },
        { name: "داروخانه شبانه‌روزی پاسداران (دکتر نادری)", licenseNumber: "IR-190-77112", licenseType: "شبانه‌روزی", city: "تهران", neighborhood: "پاسداران", address: "تهران، خیابان پاسداران، نبش بوستان پنجم، روبروی پمپ بنزین، پلاک ۲۳۰", phone: "02122554433", mobile: "09127778899", whatsapp: "+989127778899", latitude: 35.768, longitude: 51.462, is24h: true, isVerified: true, rating: 4.8, totalReviews: 88, insuranceAccepted: ["تامین اجتماعی", "بیمه سلامت", "نیروهای مسلح", "بیمه سامان"], deliveryAvailable: true, pharmacistInCharge: "دکتر رضا نادری", emergencyHotlineNote: "موجودی کامل داروهای اعصاب، گوارشی و دیابت با تاییدیه آنلاین" },
        { name: "داروخانه مرکزی کرج (دکتر کمالی)", licenseNumber: "IR-190-41001", licenseType: "شبانه‌روزی", city: "کرج", neighborhood: "طالقانی", address: "البرز، کرج، چهارراه طالقانی به سمت میدان شهدا، جنب بانک ملی مرکزی", phone: "02632223344", mobile: "09129994411", whatsapp: "+989129994411", latitude: 35.832, longitude: 50.991, is24h: true, isVerified: true, rating: 4.7, totalReviews: 165, insuranceAccepted: ["تامین اجتماعی", "بیمه سلامت", "نیروهای مسلح"], deliveryAvailable: true, pharmacistInCharge: "دکتر مسعود کمالی", emergencyHotlineNote: "مرجع اصلی توزیع داروهای کمیاب و انسولین در استان البرز" },
        { name: "داروخانه شبانه‌روزی امام رضا مشهد", licenseNumber: "IR-190-51002", licenseType: "شبانه‌روزی", city: "مشهد", neighborhood: "مرکزی", address: "مشهد، میدان بیمارستان امام رضا (ع)، ابتدای خیابان رازی، پلاک ۱۲", phone: "05138541122", mobile: "09151112233", whatsapp: "+989151112233", latitude: 36.297, longitude: 59.606, is24h: true, isVerified: true, rating: 4.9, totalReviews: 240, insuranceAccepted: ["تامین اجتماعی", "بیمه سلامت", "نیروهای مسلح", "بیمه دی"], deliveryAvailable: true, pharmacistInCharge: "دکتر محمدرضا رضوی", emergencyHotlineNote: "تامین فوری داروهای کمیاب زائرین و مجاورین با ارسال ۲۴ ساعته در مشهد" },
      ];
      const pharmacies = await Pharmacy.insertMany(pharmaciesData);

      /* -------------------------- Pharmacy inventory ---------------------- */
      const inventoryList: any[] = [];
      for (const pharmacy of pharmacies) {
        for (const med of medications) {
          const ph = pharmacy as any;
          const md = med as any;
          let stockStatus = "in_stock";
          let stockQty = Math.floor(Math.random() * 25) + 5;
          let discount = 0;

          if (md.isRare) {
            if (ph.name.includes("هلال احمر") || ph.name.includes("۱۳ آبان") || ph.name.includes("۲۹ فروردین")) {
              stockStatus = "in_stock";
              stockQty = Math.floor(Math.random() * 30) + 15;
            } else if (ph.name.includes("ونک") || ph.name.includes("شریعتی")) {
              stockStatus = Math.random() > 0.3 ? "in_stock" : "low_stock";
              stockQty = Math.floor(Math.random() * 8) + 2;
            } else {
              stockStatus = Math.random() > 0.6 ? "low_stock" : "out_of_stock";
              stockQty = stockStatus === "low_stock" ? 2 : 0;
            }
          } else {
            discount = Math.random() > 0.5 ? Math.floor(Math.random() * 8) + 2 : 0;
          }

          inventoryList.push({
            pharmacyId: ph.id,
            medicationId: md.id,
            stockStatus,
            stockQuantity: stockQty,
            price: md.officialPrice,
            discountPercent: discount,
            batchExpiryDate: "2027-06",
            notes: md.isColdChain
              ? "نگهداری با مانیتورینگ پیوسته دما در سردخانه استاندارد ۲ تا ۸ درجه"
              : "موجودی بررسی‌شده توسط مسئول فنی",
          });
        }
      }
      await PharmacyInventory.insertMany(inventoryList);

      /* ---------------------------- Prescriptions ------------------------- */
      const rx = await Prescription.insertMany([
        {
          userId: (users[0] as any).id,
          patientName: "علی رضایی",
          nationalId: "0012345678",
          trackingCode: "RX-98234-TH",
          doctorName: "دکتر کامران سمیعی (فوق تخصص غدد و متابولیسم)",
          imageUrl: "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=600&q=80",
          itemsJson: [
            { drugName: "قلم انسولین لانتوس سولوستار", dosage: "100IU", count: 3, matchedMedicationId: medMap.get("Lantus SoloStar 100 IU/ml") },
            { drugName: "قرص متفورمین ۵۰۰ هگزال", dosage: "500mg", count: 100, matchedMedicationId: medMap.get("Metformin Hexal 500mg") },
          ],
          status: "analyzed",
          city: "تهران",
          userPhone: "09121112233",
          notes: "بیمار نیازمند تحویل سریع در محدوده ونک به دلیل اتمام انسولین امروز",
        },
        {
          userId: (users[3] as any).id,
          patientName: "مریم سلیمانی",
          nationalId: "0045566778",
          trackingCode: "RX-55410-TX",
          doctorName: "دکتر حمیدرضا علوی (فوق تخصص نفرولوژی و پیوند کلیه)",
          imageUrl: "https://images.unsplash.com/photo-1583912267670-6575ad472688?auto=format&fit=crop&w=600&q=80",
          itemsJson: [
            { drugName: "سل‌سپت ۵۰۰ سوئیسی", dosage: "500mg", count: 120, matchedMedicationId: medMap.get("CellCept 500mg") },
          ],
          status: "reserved",
          city: "تهران",
          userPhone: "09198887766",
          notes: "تاییدیه پیوند کلیه ثبت شده در سامانه بیمه سلامت",
        },
      ] as any[]);

      /* ---------------------------- Reservations -------------------------- */
      await Reservation.insertMany([
        {
          userId: (users[0] as any).id,
          pharmacyId: (pharmacies[0] as any).id,
          medicationId: medMap.get("Lantus SoloStar 100 IU/ml"),
          prescriptionId: (rx[0] as any).id,
          quantity: 2,
          unitPrice: 480000,
          totalPrice: 960000,
          status: "ready_for_pickup",
          deliveryType: "pickup",
          userPhone: "09121112233",
          userAddress: "تهران، میدان ونک، کوچه آفتاب، پلاک ۱۲",
          patientNotes: "لطفا در کیسه یخ مخصوص زنجیره سرد قرار داده شود تا برسم داروخانه",
          pharmacistNotes: "بسته‌بندی در محفظه کلدپک انجام شد. تا ساعت ۲۱ محفوظ است.",
          reservedUntil: new Date(Date.now() + 4 * 3600 * 1000),
        },
        {
          userId: (users[3] as any).id,
          pharmacyId: (pharmacies[1] as any).id,
          medicationId: medMap.get("CellCept 500mg"),
          prescriptionId: (rx[1] as any).id,
          quantity: 1,
          unitPrice: 1850000,
          totalPrice: 1850000,
          status: "confirmed",
          deliveryType: "pickup",
          userPhone: "09198887766",
          patientNotes: "نسخه به تایید نماینده بیمه سلامت در داروخانه رسیده است.",
          pharmacistNotes: "سهمیه ۱۲۰ عددی آماده تحویل با ارائه کارت ملی و پوکه دارو",
          reservedUntil: new Date(Date.now() + 24 * 3600 * 1000),
        },
      ] as any[]);

      /* ---------------------------- Alerts -------------------------------- */
      await RareDrugAlert.insertMany([
        { userId: (users[0] as any).id, medicationId: medMap.get("Ritalin 10mg"), city: "تهران", maxDistanceKm: 15, userPhone: "09121112233", isActive: true, notifiedCount: 2, notes: "در صورت شارژ مجدد ریتالین نووارتیس در داروخانه‌های شمال و مرکز تهران پیامک شود." },
        { userId: (users[3] as any).id, medicationId: medMap.get("Octagam 5g / 100ml"), city: "تهران", maxDistanceKm: 30, userPhone: "09198887766", isActive: true, notifiedCount: 1, notes: "ویال آی‌وی‌آی‌جی ۵ گرمی در هر نقطه از تهران" },
      ] as any[]);

      /* ---------------------------- Reviews ------------------------------- */
      await PharmacyReview.insertMany([
        { pharmacyId: (pharmacies[0] as any).id, userId: (users[0] as any).id, userName: "علی رضایی", rating: 5, stockAccuracyScore: 5, pharmacistServiceScore: 5, comment: "واقعاً سریع‌ترین پاسخگویی رو داشتن. انسولین لانتوس رو دقیقاً همون قیمت مصوب با محفظه یخ تحویل دادن. دکتر اکبری هم نحوه نگهداری رو کامل توضیح داد." },
        { pharmacyId: (pharmacies[1] as any).id, userId: (users[3] as any).id, userName: "مریم سلیمانی", rating: 5, stockAccuracyScore: 5, pharmacistServiceScore: 4, comment: "داروی سل‌سپت سوئیسی که هیچ‌جا پیدا نمیشد رو هلال احمر با قیمت بیمه‌ای تحویل داد. صف کمی شلوغ بود ولی باجه تایید نسخه سریع کار کرد." },
        { pharmacyId: (pharmacies[5] as any).id, userId: (users[0] as any).id, userName: "پیمان خسروی", rating: 5, stockAccuracyScore: 5, pharmacistServiceScore: 5, comment: "پیک اکسپرس کمتر از ۲۵ دقیقه دارو رو دم در رسوند. سیستم ترب سلامت فوق‌العاده‌ست برای بیماران اورژانسی." },
      ] as any[]);

      /* --------------------------- Demo conversation ---------------------- */
      const [convo] = await ChatConversation.insertMany([
        { userId: (users[0] as any).id, title: "یافتن فوری انسولین لانتوس نزدیک ونک", city: "تهران" },
      ] as any[]);

      await ChatMessage.insertMany([
        {
          conversationId: (convo as any).id,
          sender: "user",
          message: "سلام، من ساکن ونک هستم و پدرم دیابت داره. انسولین لانتوس سولوستار فرانسوی لازم داریم یا اگر نبود بهترین مارک موجود چیه؟",
          intent: "find_rare_drug",
        },
        {
          conversationId: (convo as any).id,
          sender: "assistant",
          message: "درود! درخواست شما برای داروی انسولین لانتوس سولوستار در محدوده ونک تهران بررسی شد. نزدیک‌ترین داروخانه با موجودی زنده در ادامه رده‌بندی شده است.",
          intent: "find_rare_drug",
          structuredData: {
            detectedDrug: "Lantus SoloStar (Insulin Glargine)",
            detectedCity: "تهران - ونک",
            manufacturerRanking: [
              { manufacturerName: "سانوفی (فرانسه)", brandName: "Lantus SoloStar 100 IU/ml", country: "فرانسه", tier: "A+", score: 96, price: 480000, pros: "کیفیت ساخت فوق‌العاده، کمترین نوسان قند شبانه", isRecommended: true, medicationId: medMap.get("Lantus SoloStar 100 IU/ml") },
              { manufacturerName: "شرکت سیناژن (ایران)", brandName: "SynaGlar 100 IU/ml", country: "ایران", tier: "A", score: 90, price: 195000, pros: "قیمت مصوب اقتصادی، دسترسی دائمی", isRecommended: false, medicationId: medMap.get("SynaGlar SoloStar 100 IU/ml") },
            ],
            rankedPharmacies: [
              { pharmacyId: (pharmacies[0] as any).id, pharmacyName: "داروخانه شبانه‌روزی ونک (دکتر اکبری)", address: "تهران، میدان ونک، ابتدای ملاصدرا، پلاک ۴", phone: "02188776655", mobile: "09124445566", whatsapp: "+989124445566", distanceKm: 0.4, travelMinutes: 3, is24h: true, stockStatus: "in_stock", stockQuantity: 14, price: 480000, discountPercent: 0, rating: 4.9, insuranceAccepted: ["تامین اجتماعی", "بیمه سلامت", "نیروهای مسلح", "دی"], destinationScore: 98, rankReason: "نزدیک‌ترین داروخانه شبانه‌روزی با موجودی تاییدشده و محفظه کلدپک" },
            ],
          },
        },
      ] as any[]);

      console.log("✅ Seed complete.");
      return { success: true, message: "seeded" };
    } catch (error) {
      console.error("Error seeding database:", error);
      return { success: false, error: String(error) };
    }
  }
}
