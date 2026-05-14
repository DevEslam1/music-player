# 🎤 GiG Player - Technical Highlights & Implementation

ملخص شامل للتحسينات التقنية، الأدوات المستخدمة، وكيفية التنفيذ برمجياً (Technical Deep-Dive).

---

## 🚀 1. تحسينات الأداء (Performance Optimizations)

### **A. Redux Memoization & Selectors**
*   **ماذا فعلنا:** استخدمنا `reselect` لمنع إعادة رندر المكونات إلا إذا تغيرت البيانات الفعلية.
*   **الكود:**
```typescript
// استخدام selectors ذكية تمنع الـ re-render
const { positionMillis, durationMillis } = useSelector(
  (state: RootState) => ({
    positionMillis: state.player.positionMillis,
    durationMillis: state.player.durationMillis,
  }),
  shallowEqual // استخدام shallowEqual للمقارنة السطحية بدلاً من المقارنة المرجعية
);
```

### **B. Throttled Audio Updates**
*   **ماذا فعلنا:** قللنا عدد مرات تحديث الـ Redux State الخاص بالتقدم في الأغنية لتوفير الـ CPU.
*   **الكود:**
```typescript
// تحديث التقدم كل 500ms فقط
const now = Date.now();
if (now - this.lastProgressDispatch >= 500 || status.didJustFinish) {
  store.dispatch(setProgress({
    position: (status.currentTime || 0) * 1000,
    duration: status.duration * 1000,
  }));
  this.lastProgressDispatch = now;
}
```

### **C. Silent Auth Refresh (Axios Interceptors)**
*   **ماذا فعلنا:** تأمين تجربة مستخدم مستمرة بدون تسجيل خروج مفاجئ عن طريق تجديد الـ Token تلقائياً.
*   **الكود:**
```typescript
axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const nextAccessToken = await refreshAccessToken();
      applyAuthorizationHeader(originalRequest, nextAccessToken);
      return axiosClient(originalRequest); // إعادة الطلب الأصلي بالتوكن الجديد
    }
  }
);
```

---

## ✨ 2. تجربة المستخدم الـ Premium (UI/UX)

### **A. MiniPlayer Gestures & Physics**
*   **ماذا فعلنا:** استخدمنا Reanimated و Gesture Handler لتنفيذ تحويل الـ Player لـ CD دوار مع فيزياء حقيقية.
*   **الكود:**
```typescript
const swipeGesture = Gesture.Pan()
  .onUpdate((e) => {
    // سحب رأسي لتحويل الـ Player لـ CD
    if (gestureDirection.value === 'vertical') {
      const newCompact = Math.max(0, Math.min(1, startCompactProgress.value + e.translationY / 100));
      compactProgress.value = newCompact;
    }
  })
  .onEnd(() => {
    // تطبيق حركة Spring ناعمة عند الانتهاء
    compactProgress.value = withSpring(compactProgress.value > 0.5 ? 1 : 0);
  });
```

### **B. Glass-Morphism & Blur Intensity**
*   **ماذا فعلنا:** دمجنا `expo-blur` مع قيم متغيرة يتحكم فيها المستخدم.
```typescript
<BlurView
  intensity={blurIntensity} // قيمة متغيرة من الإعدادات (10-100)
  tint={isDarkMode ? "dark" : "light"}
  style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(255,255,255,0.3)' }]}
/>
```

---

## 🎧 3. مميزات متقدمة (Advanced Features)

### **A. Offline Smart Switching**
*   **ماذا فعلنا:** ذكاء اصطناعي بسيط يختار تشغيل الملف من الجهاز (لو موجود) أو من السيرفر.
*   **الكود:**
```typescript
const localUri = await DownloadService.getLocalUri(track.id);
if (localUri) {
  // تشغيل الملف محلياً بدون استهلاك انترنت
  playerSource.uri = localUri;
  delete playerSource.headers; // الملفات المحلية لا تحتاج Authorization
} else {
  // تشغيل عبر الـ Streaming مع إضافة التوكن
  playerSource.uri = track.uri;
  playerSource.headers = { Authorization: `Bearer ${token}` };
}
```

### **B. Background Audio & Android 12**
*   **ماذا فعلنا:** ضمان عدم توقف الموسيقى عند الخروج من التطبيق.
*   **الكود:**
```typescript
// تحديث الملف الصوتي بدون إغلاق الـ Service
this.player.replace(playerSource);
this.player.updateLockScreenMetadata(metadata);
this.player.play();
```

---

## 🛠 4. الأدوات الأساسية (Tech Stack)

| الأداة | الغرض من الاستخدام |
|---|---|
| **React Native Reanimated** | كل حركات الـ UI (60 FPS animations) |
| **Expo Audio** | المحرك الصوتي والتحكم من شاشة القفل |
| **Redux Toolkit** | إدارة حالة المشغل، المكتبة، والتحميلات |
| **Expo FileSystem** | إدارة تحميل وحفظ الأغاني محلياً |
| **Axios** | التواصل مع الـ Backend والتعامل مع التوكنز |

---

## 🔐 5. نظام المصادقة والأمان (Authentication & Security)

*   **الاستراتيجية:** JWT (Access & Refresh Tokens).
*   **التخزين:** آمن ومستمر عبر `AsyncStorage`.
*   **الأتمتة (Axios Interceptors):**
    *   **Request:** حقن التوكن تلقائياً في كل Headers الطلبات.
    *   **Response:** التعامل مع خطأ **401** وتجديد التوكن في الخلفية بدون شعور المستخدم (Silent Refresh).

### **كود الـ Interceptor الذكي:**
```typescript
// تجديد التوكن وإعادة الطلب الأصلي تلقائياً
axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const nextAccessToken = await refreshAccessToken(); // تجديد التوكن
      if (nextAccessToken) {
        applyAuthorizationHeader(originalRequest, nextAccessToken);
        return axiosClient(originalRequest); // إعادة تنفيذ الطلب الفاشل بنجاح
      }
    }
    return Promise.reject(error);
  }
);
```

### **الـ Auth Bootstrapping:**
عند فتح التطبيق، المكون `AuthInitializer` يقوم بفحص التوكن وجلب بيانات المستخدم قبل ظهور الشاشة الرئيسية، مما يضمن عدم وجود "Flicker" في الواجهة.

---

## 📥 6. نظام التحميلات (Offline Downloads System)

*   **الأداة:** `expo-file-system` مع استخدام `DownloadResumable`.
*   **المميزات:**
    *   **تتبع التقدم (Progress Tracking):** عرض النسبة المئوية للتحميل في الوقت الفعلي.
    *   **التحقق من المساحة:** فحص وجود مساحة كافية (>50MB) قبل بدء التحميل.
    *   **إدارة الملفات التالفة:** فحص حجم الملف بعد التحميل للتأكد من سلامته.
    *   **إلغاء التحميل (Cancellation):** دعم إيقاف التحميل ومسح الملفات المؤقتة لتوفير المساحة.

### **كود إدارة التحميل والتقدم:**
```typescript
// إنشاء طلب تحميل يدعم تتبع التقدم والإلغاء
const downloadResumable = FileSystem.createDownloadResumable(
  urlToDownload,
  fileUri,
  { headers },
  (progress) => {
    const percent = progress.totalBytesWritten / progress.totalBytesExpectedToWrite;
    dispatch(setDownloadProgress({ trackId, progress: percent }));
  }
);
```

### **حل مشكلة الـ Circular Dependencies:**
استخدمنا نمط **Dependency Injection** لحقن الـ Redux Store داخل الـ Service عند بداية التشغيل، مما يسمح للخدمة بتحديث الواجهة دون التسبب في أخطاء برمجية دائرية.

---

> [!IMPORTANT]
> **رسالة البريزنتيشن:** "مشروع GiG Player ليس مجرد مشغل موسيقى، بل هو تطبيق يدمج بين كفاءة الأداء (Performance) وجمالية التصميم (Aesthetics) باستخدام أحدث تقنيات React Native."
