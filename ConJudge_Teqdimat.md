# ConJudge Platforması - Tam Əhatəli Təqdimat

## 1. Giriş
**ConJudge**, süni intellekt (AI) dəstəkli, yeni nəsil rəqabətli proqramlaşdırma platformasidır. Bu platforma, istifadəçilərə kodlaşdırma bacarıqlarını inkişaf etdirmək, real vaxt rejimində digər proqramçılarla yarışmaq və süni intellekt tərəfindən idarə olunan analizlərdən faydalanmaq imkanı verir. Məqsəd sadə bir kod yoxlama sistemi deyil, tam təchizatlı bir **"Coding Esports"** ekosistemi yaratmaqdır.

---

## 2. Texnoloji Stack
Layihə ən müasir texnologiyalar əsasında qurulmuşdur:

*   **Frontend**: Next.js 16 (App Router), React, Tailwind CSS, TypeScript, Framer Motion (animasiyalar üçün).
*   **Backend**: Node.js, Express.js, TypeScript.
*   **Verilənlər Bazası**: PostgreSQL, Prisma ORM.
*   **Real-time**: Socket.IO (Canlı döyüşlər və bildirişlər üçün).
*   **Təhlükəsizlik**: JWT (JSON Web Token), bcrypt (Şifrələmə).
*   **Dil Dəstəyi**: Next-intl (Azərbaycan, İngilis, Rus, Türk və s. daxil olmaqla çoxdilli interfeys).
*   **Kod İcrası**: Təhlükəsiz mühitdə (Sandbox) C++, Python, JavaScript kodlarının icrası.

---

## 3. Səhifələr və Funksionallıqlar

Aşağıda platformadakı hər bir səhifənin və modulun ətraflı təsviri verilmişdir:

### 3.1. Ana Səhifə (Landing Page)
*   **URL**: `/`
*   **Təsvir**: İstifadəçiləri qarşılayan, müasir və premium dizayna malik giriş səhifəsi.
*   **Xüsusiyyətlər**:
    *   Dinamik animasiyalar və "Glassmorphism" dizayn elementləri.
    *   Platformanın əsas üstünlüklərini (AI Analiz, Real-time Döyüşlər, BrainType) vurğulayan bölmələr.
    *   İnteraktiv "Hərəkətə Keç" (Call-to-Action) düymələri.
    *   Sürətli yükləmə və SEO optimizasiyası.

### 3.2. Autentifikasiya və Təhlükəsizlik
*   **Səhifələr**: `/login`, `/signup`, `/verify-email`, `/forgot-password`, `/reset-password`
*   **Funksionallıq**:
    *   **Qeydiyyat**: İstifadəçi adı, email və şifrə ilə qeydiyyat. Şifrə təhlükəsizliyi yoxlanılır.
    *   **Giriş**: JWT token əsaslı sessiya idarəetməsi.
    *   **Email Təsdiqi**: Hesabın təhlükəsizliyi üçün email doğrulama sistemi.
    *   **Şifrə Bərpası**: Unudulmuş şifrələrin email vasitəsilə bərpası.

### 3.3. Dashboard (İdarə Paneli)
*   **URL**: `/dashboard`
*   **Təsvir**: İstifadəçinin əsas mərkəzi.
*   **Xüsusiyyətlər**:
    *   **Statistika**: Həll edilmiş məsələlərin sayı, ümumi xal, qazanılmış nailiyyətlər.
    *   **Aktivlik Qrafiki**: Günlük/həftəlik aktivliyin vizual təsviri (GitHub stilində).
    *   **Tövsiyə Olunan Məsələlər**: İstifadəçinin reytinqinə uyğun avtomatik seçilmiş məsələlər.
    *   **Davam Edən Yarışlar**: Aktiv yarışların və döyüşlərin qısa xülasəsi.

### 3.4. Məsələlər Bankı (Problems)
*   **URL**: `/problems`
*   **Təsvir**: Bütün alqoritmik məsələlərin siyahısı.
*   **Funksionallıq**:
    *   **Filtr**: Çətinlik (Easy, Medium, Hard, Insane), Kateqoriya (DP, Graph, Greedy və s.), Status (Həll edilib/edilməyib) üzrə axtarış.
    *   **Cədvəl Görünüşü**: Məsələnin adı, reytinqi, həll sayı və istifadəçi statusu.
    *   **AI Generate**: Adminlər üçün birbaşa bu səhifədən AI vasitəsilə yeni məsələ yaratma imkanı.

### 3.5. Həll Mühiti (Problem Solver)
*   **URL**: `/problems/[id]`
*   **Təsvir**: Məsələnin həlli üçün inteqrasiya olunmuş IDE.
*   **Xüsusiyyətlər**:
    *   **Sol Panel**: Məsələnin şərti, nümunə testlər (Input/Output), məhdudiyyətlər (Vaxt/Yaddaş).
    *   **Kod Editoru**: Sintaksis işıqlandırması (Syntax Highlighting), sətir nömrələri, avtomatik tamamlama.
    *   **Dillər**: Python, C++, JavaScript dəstəyi.
    *   **Konsol**: Özəl testləri (Custom Input) yoxlamaq və nəticəni görmək imkanı.
    *   **Göndərişlər Tarixçəsi (Submissions)**: İstifadəçinin həmin məsələ üzrə bütün cəhdləri, statusları (AC, WA, TLE), icra müddəti və yaddaş istifadəsi. "View Code" düyməsi ilə əvvəlki kodlara baxış.

### 3.6. Döyüş Arenası (Battle Arena)
*   **URL**: `/battles`
*   **Təsvir**: Real vaxt rejimində multiplayer yarış sistemi.
*   **Xüsusiyyətlər**:
    *   **Lobbi**: Açıq otaqların siyahısı, filtrləmə.
    *   **Otaq Yaratma**: Döyüş növü (1v1, Team, Blitz), Müddət, Çətinlik seçimi.
    *   **Tez Həll (Quick Match)**: ELO reytinqinə uyğun rəqibin avtomatik tapılması.
    *   **Canlı Döyüş (Battle Room)**:
        *   Rəqiblərin canlı xalları (Live Scoreboard).
        *   Eyni anda məsələ həlli.
        *   Döyüş bitdikdən sonra ELO reytinqinin yenilənməsi.

### 3.7. Reytinq Cədvəli (Rankings)
*   **URL**: `/rankings`
*   **Təsvir**: Ən güclü istifadəçilərin qlobal siyahısı.
*   **Xüsusiyyətlər**:
    *   Qlobal reytinq, Ölkə üzrə reytinq.
    *   İstifadəçi adı, ölkə bayrağı, reytinq xalı və liqa (Grandmaster, Master, Expert və s.) göstəricisi.
    *   Axtarış sistemi.

### 3.8. Profil Səhifəsi (Profile)
*   **URL**: `/profile/[username]`
*   **Təsvir**: İstifadəçinin portfoliosu.
*   **Xüsusiyyətlər**:
    *   **Şəxsi Məlumatlar**: Profil şəkli, Bio, Ölkə, Sosial media linkləri.
    *   **Statistika**: Ümumi həll sayı, reytinq tarixçəsi qrafiki.
    *   **Son Fəaliyyətlər**: Son göndərilən həllər.
    *   **Dostluq Sistemi**: Dostluq göndərmə, qəbul etmə və dostların siyahısı.
    *   **Admin Nəzarəti**: Əgər baxan şəxs Admindirsə, istifadəçini banlamaq/silmək/redaktə etmək imkanı.

### 3.9. Admin Panel
*   **URL**: `/admin`
*   **Təsvir**: Platformanın idarəetmə mərkəzi (Yalnız Adminlər üçün).
*   **Alt Bölmələr**:
    *   **Dashboard**: Ümumi statistika (İstifadəçi sayı, Məsələ sayı, Server statusu).
    *   **İstifadəçilər (Users)**: İstifadəçilərin siyahısı, rolların dəyişdirilməsi, banlanması, redaktəsi.
    *   **Məsələlər (Problems)**: Yeni məsələ yaratma, mövcud məsələləri redaktə etmə, Codeforces-dan import etmə.
    *   **AI Studio**: Avtomatik məsələ generasiyası üçün interfeys.
    *   **Göndərişlər (Submissions)**: Bütün istifadəçilərin göndərdiyi kodlara nəzarət.
    *   **Elanlar (Announcements)**: Saytda görünəcək elanların idarə edilməsi.

### 3.10. ConJudge PRO (Premium)
*   **URL**: `/pro` (və ya Abunəlik Panelindən)
*   **Təsvir**: Peşəkar inkişaf və daha dərin analiz istəyən istifadəçilər üçün xüsusi moduldur.
*   **Xüsusiyyətlər**:
    *   **Limitsiz AI Analiz**: Məsələ həllərində səhv tapıldıqda, AI məhdudiyyətsiz olaraq səhvin səbəbini və həll yolunu izah edir.
    *   **Qabaqcıl Statistika**: Rəqiblərlə müqayisəli analizlər, zəif nöqtələrin (məs. DP, Qraflar) avtomatik aşkarlanması.
    *   **Prioritetli Dəstək**: Serverdə kodların daha sürətli icrası (Dedicated Runners).
    *   **Şəxsi Təlim Planı**: AI tərəfindən istifadəçinin səviyyəsinə uyğun gündəlik məşq proqramının hazırlanması.

### 3.11. ConJudge SCHOOL (Təhsil Modulu)
*   **URL**: `/school`
*   **Təsvir**: Məktəblər, universitetlər və tədris mərkəzləri üçün idarəetmə sistemi.
*   **Rollara Görə Funksionallıq**:
    *   **Müəllimlər**:
        *   Şagird qrupları (Siniflər) yaratmaq.
        *   Xüsusi yarışlar və ev tapşırıqları (Homework) təyin etmək.
        *   Şagirdlərin irəliləyişini (Progress Report) real vaxtda izləmək.
    *   **Şagirdlər**:
        *   Müəllimin təyin etdiyi tapşırıqları həll etmək.
        *   Sinif daxili reytinq cədvəlində yarışmaq.
    *   **Monitorinq**: Müəllimlər şagirdlərin hansı məsələdə ilişib qaldığını və nə vaxt həll göndərdiyini görə bilir.

### 3.12. Digər Modullar
*   **Contests (Yarışlar)**: `/contests` - Müəyyən zaman aralığında keçirilən rəsmi yarışlar.
*   **BrainType**: `/braintype` - İstifadəçinin həll tərzinə görə koqnitiv profilinin (Məsələn: "Architect", "Speedster") müəyyən edilməsi.
*   **Ödənişlər (Pricing)**: `/pricing` - Premium xüsusiyyətlər üçün abunəlik planları (Stripe inteqrasiyası).

---

## 4. Xüsusi Texniki Həllər

### Real-time Sistem (Socket.IO)
Platforma tamamilə canlıdır. Bir istifadəçi döyüş otağına girdikdə, digər istifadəçilər bunu dərhal görür. Kod göndərildikdə və ya nəticə çıxdıqda, məlumatlar səhifəni yeniləmədən (refresh etmədən) qarşı tərəfə ötürülür.

### Təhlükəsiz Kod İcrası (Judge System)
İstifadəçilərin göndərdiyi kodlar serverdə təcrid olunmuş mühitdə işlədilir. Bu, sonsuz dövrlərin (infinite loops) və zərərli kodların serverə ziyan vurmasının qarşısını alır.

### Çoxdilli Dəstək (i18n)
Platforma qlobal auditoriya üçün nəzərdə tutulub. `next-intl` kitabxanası vasitəsilə bütün interfeys (düymələr, mesajlar, xətalar) seçilən dilə uyğun dərhal dəyişir.

---

## 5. Nəticə

**ConJudge**, sadəcə bir kodlaşdırma saytı deyil, bir **karyera və inkişaf platformasıdır**. Müasir dizaynı, güclü texniki infrastrukturu və AI inteqrasiyası ilə istifadəçilərə bənzərsiz təcrübə təqdim edir. Admin paneli sayəsində idarəetmə asandır, "Battles" sistemi ilə isə öyrənmə prosesi əyləncəli və rəqabətli hala gətirilir.
