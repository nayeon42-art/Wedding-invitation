WEDDING INVITATION - FIREBASE VERSION

1) ارفعي هذه الملفات معًا:
   index.html
   admin.html
   app.js
   admin.js
   firebase.js
   style.css

2) في Firebase:
   Authentication > Sign-in method > Email/Password > Enable

3) Firestore:
   collection اسمها guests.
   لا تحتاجين إنشاء الحقول يدويًا. الكود ينشئها عند أول مدعو.

4) Firestore Rules:
   انسخي محتوى firestore.rules إلى تبويب Rules.
   قبل الحفظ استبدلي:
   YOUR_ADMIN_EMAIL@example.com
   ببريد حساب العروسين الذي سيستخدم صفحة admin.html.

5) صفحة الإدارة:
   افتحي:
   admin.html
   وسجلي الدخول بنفس حساب العروسين الموجود في Authentication.

6) مهم:
   هذه النسخة تستخدم Email + Password لأن Firebase Authentication يحتاج طريقة مصادقة فعلية.
   لا تضعي Service Account JSON أو مفاتيح Admin SDK داخل الموقع.

7) غيّري أسماء العروسين والتاريخ والوقت ورابط Google Maps داخل index.html وapp.js.

8) QR حاليًا يحتوي على invitationCode. في مرحلة لاحقة يمكننا بناء صفحة تحقق منفصلة تمسح QR وتتحقق منه مباشرة من Firestore.
