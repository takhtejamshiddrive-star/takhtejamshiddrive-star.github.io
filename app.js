// تنظیمات اتصال Google Sheets: پس از انتشار Apps Script، آدرس Web App را اینجا قرار بده.
const SHEETS_WEB_APP_URL = ""; // نمونه: https://script.google.com/macros/s/DEPLOYMENT_ID/exec
window.TJ_SHEETS_URL = SHEETS_WEB_APP_URL;

// نمایش پیام کوتاه
function showToast(message) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('show');
  window.setTimeout(() => toast.classList.remove('show'), 3200);
}

// فرم‌ها: در صورت تنظیم آدرس Apps Script، اطلاعات به Google Sheets ارسال می‌شوند.
document.querySelectorAll('.lead-form').forEach(form => {
  form.addEventListener('submit', async event => {
    event.preventDefault();
    const status = form.querySelector('.form-status');
    const submit = form.querySelector('[type="submit"]');
    const data = Object.fromEntries(new FormData(form).entries());
    data.formType = form.dataset.formType || 'unknown';
    data.createdAt = new Date().toISOString();
    data.pageUrl = window.location.href;
    data.paymentStatus = data.registrationType === 'بیعانه' ? 'در انتظار اتصال درگاه؛ پرداختی انجام نشده' : (data.registrationType === 'حضوری' ? 'ثبت‌نام حضوری؛ بدون پرداخت آنلاین' : 'درخواست دریافت شد');
    if (status) { status.classList.remove('error'); status.textContent = ''; }
    if (!SHEETS_WEB_APP_URL) {
      if (status) { status.classList.add('error'); status.textContent = 'فرم آماده است؛ برای ارسال واقعی، ابتدا آدرس Web App گوگل را در app.js قرار بده. هنوز اطلاعاتی ارسال نشده است.'; }
      return;
    }
    if (submit) { submit.disabled = true; submit.dataset.oldText = submit.textContent; submit.textContent = 'در حال ارسال…'; }
    try {
      const body = new URLSearchParams();
      Object.entries(data).forEach(([key, value]) => body.append(key, String(value)));
      // Apps Script ممکن است پاسخ CORS را در مرورگر قابل خواندن نکند؛ برای این حالت ارسال no-cors است.
      await fetch(SHEETS_WEB_APP_URL, { method: 'POST', mode: 'no-cors', body });
      if (status) status.textContent = 'درخواست ارسال شد. برای اطمینان از ثبت، شیت Google Sheets را بررسی کن.';
      form.reset();
      showToast('درخواست ارسال شد');
    } catch (error) {
      if (status) { status.classList.add('error'); status.textContent = 'ارسال انجام نشد. اتصال اینترنت و آدرس Web App را بررسی کن.'; }
    } finally {
      if (submit) { submit.disabled = false; submit.textContent = submit.dataset.oldText || 'ارسال درخواست'; }
    }
  });
});



// انتخاب نوع ثبت‌نام
const paymentForm = document.getElementById('paymentForm');
const paymentTitle = document.getElementById('paymentFormTitle');
const paymentNote = document.getElementById('paymentFormNote');
const paymentNotice = document.getElementById('paymentNotice');
const paymentSubmit = document.getElementById('paymentSubmit');
document.querySelectorAll('[data-payment-choice]').forEach(button => {
  button.addEventListener('click', () => {
    document.querySelectorAll('[data-payment-choice]').forEach(item => item.classList.toggle('selected', item === button));
    const deposit = button.dataset.paymentChoice === 'deposit';
    const hidden = paymentForm?.querySelector('[name="registrationType"]');
    if (hidden) hidden.value = deposit ? 'بیعانه' : 'حضوری';
    if (paymentTitle) paymentTitle.textContent = deposit ? 'ثبت درخواست با بیعانه' : 'ثبت درخواست ثبت‌نام حضوری';
    if (paymentNote) paymentNote.textContent = deposit ? 'پرداخت آنلاین هنوز فعال نیست' : 'بدون پرداخت آنلاین';
    if (paymentNotice) paymentNotice.innerHTML = deposit ? '<b>مرحله فعلی:</b> این فرم درخواست بیعانه را ثبت می‌کند؛ پولی دریافت نمی‌شود تا درگاه واقعی متصل شود.' : '<b>ثبت‌نام حضوری:</b> اطلاعات برای پیگیری آموزشگاه ثبت می‌شود؛ پرداختی در این صفحه انجام نمی‌شود.';
    if (paymentSubmit) paymentSubmit.innerHTML = (deposit ? 'ثبت درخواست با بیعانه' : 'ثبت درخواست حضوری') + ' <span>←</span>';
  });
});

// منوی موبایل
const mobileMenu = document.getElementById('mobileMenu');
if (mobileMenu) mobileMenu.addEventListener('click', () => {
  const nav = document.querySelector('.desktop-nav');
  if (!nav) return;
  const visible = nav.style.display === 'flex';
  nav.style.display = visible ? '' : 'flex';
  if (!visible) { nav.style.position='absolute'; nav.style.top='76px'; nav.style.right='16px'; nav.style.left='16px'; nav.style.zIndex='20'; nav.style.padding='16px'; nav.style.background='var(--panel,#101b2d)'; nav.style.border='1px solid var(--line,rgba(255,255,255,.12))'; nav.style.borderRadius='16px'; nav.style.flexDirection='column'; }
});

// ابزارهای موجود در نسخه قبلی سایت، اگر عناصرشان وجود داشته باشند.
const themeToggle = document.getElementById('themeToggle');
if (themeToggle) themeToggle.addEventListener('click', () => {
  document.body.classList.toggle('light-mode');
  localStorage.setItem('tjd-theme', document.body.classList.contains('light-mode') ? 'light' : 'dark');
});
if (localStorage.getItem('tjd-theme') === 'light') document.body.classList.add('light-mode');

// بانک نمونه برای رابط آزمون؛ آزمون‌های اختصاصی کاربر بعداً قابل جایگزینی‌اند.
const sampleQuestions = {
  quick: [
    {q:'هنگام نزدیک‌شدن به خط عابر پیاده، راننده چه وظیفه‌ای دارد؟',o:['سرعت را افزایش دهد','آماده توقف باشد و حق تقدم عابر را رعایت کند','فقط بوق بزند','بدون توجه ادامه دهد'],a:1,e:'راننده باید مراقب عابران باشد و در صورت نیاز برای عبور ایمن آن‌ها توقف کند.'},
    {q:'کمربند ایمنی برای چه کسانی باید بسته شود؟',o:['فقط راننده','فقط سرنشین جلو','راننده و سرنشینان طبق مقررات','فقط در جاده'],a:2,e:'استفاده از کمربند ایمنی برای راننده و سرنشینان مشمول مقررات ضروری است.'},
    {q:'در تقاطع بدون چراغ و تابلو، چه چیزی اهمیت اساسی دارد؟',o:['سرعت بیشتر','احتیاط و رعایت حق تقدم طبق مقررات','استفاده مداوم از بوق','توقف همیشگی بدون بررسی'],a:1,e:'در تقاطع‌ها باید با احتیاط و با توجه به قواعد حق تقدم حرکت کرد.'},
    {q:'هنگام بارندگی، فاصله با خودروی جلویی بهتر است چگونه باشد؟',o:['کمتر شود','بیشتر شود','بدون تغییر و با سرعت بیشتر','فقط در بزرگراه بیشتر شود'],a:1,e:'سطح لغزنده می‌تواند مسافت توقف را افزایش دهد؛ فاصله ایمن را بیشتر کنید.'},
    {q:'اگر چراغ راهنمایی قرمز باشد، چه باید کرد؟',o:['پس از کم‌کردن سرعت عبور کرد','پشت خط توقف ایستاد','فقط در نبود خودرو عبور کرد','با بوق عبور کرد'],a:1,e:'چراغ قرمز فرمان توقف است و باید پشت خط توقف ایستاد.'}
  ],
  signs: [
    {q:'تابلوی هشت‌ضلعی قرمز با واژه «ایست» چه مفهومی دارد؟',o:['کاهش سرعت','توقف کامل','پایان محدودیت سرعت','عبور یک‌طرفه'],a:1,e:'تابلوی ایست الزام به توقف کامل و سپس حرکت با رعایت ایمنی دارد.'},
    {q:'تابلوهای مثلثی با حاشیه قرمز معمولاً چه نوع پیامی می‌دهند؟',o:['هشدار خطر','اطلاعات گردشگری','پایان مسیر','پارکینگ'],a:0,e:'بسیاری از تابلوهای مثلثی با حاشیه قرمز برای هشدار درباره خطر یا شرایط مسیر هستند.'},
    {q:'دیدن تابلوی محدودیت سرعت چه معنایی دارد؟',o:['سرعت پیشنهادی بدون الزام','باید محدودیت اعلام‌شده رعایت شود','فقط خودروهای سنگین رعایت کنند','در شب اعتباری ندارد'],a:1,e:'محدودیت اعلام‌شده باید رعایت شود؛ شرایط مسیر نیز نیازمند احتیاط است.'},
    {q:'تابلوی ورود ممنوع چه دستوری می‌دهد؟',o:['ورود از آن مسیر ممنوع است','فقط توقف ممنوع است','سرعت باید کم شود','پارک ممنوع است'],a:0,e:'این تابلو ورود وسایل نقلیه از جهت مشخص‌شده را منع می‌کند.'},
    {q:'هنگام دیدن تابلوی پیچ خطرناک چه کاری مناسب‌تر است؟',o:['شتاب‌گیری','کاهش سرعت متناسب و حفظ کنترل خودرو','ترمز ناگهانی داخل پیچ','حرکت در خلاف مسیر'],a:1,e:'سرعت را پیش از پیچ متناسب کنید و از حرکات ناگهانی پرهیز کنید.'}
  ]
};
sampleQuestions.full = [...sampleQuestions.quick, ...sampleQuestions.signs];
let activeExam = [], activeQuestion = 0, examScore = 0, answerLocked = false;
const quizModal = document.getElementById('quizModal'), quizContent = document.getElementById('quizContent');
function openExam(name){activeExam=(sampleQuestions[name]||sampleQuestions.quick).slice();activeQuestion=0;examScore=0;answerLocked=false;if(quizModal){quizModal.classList.add('open');quizModal.setAttribute('aria-hidden','false');renderQuestion();}}
function renderQuestion(){if(!quizContent)return;if(activeQuestion>=activeExam.length){quizContent.innerHTML=`<h3>آزمون به پایان رسید</h3><p>نتیجه شما: ${examScore} از ${activeExam.length}</p><p class="quiz-feedback">این پرسش‌ها نمونه آموزشی‌اند؛ برای آزمون رسمی، بانک سؤال معتبر را جایگزین کنید.</p><button class="btn btn-primary" id="finishExam">بستن نتیجه</button>`;document.getElementById('finishExam')?.addEventListener('click',closeExam);return;}answerLocked=false;const q=activeExam[activeQuestion];quizContent.innerHTML=`<div class="quiz-progress">سؤال ${activeQuestion+1} از ${activeExam.length}</div><p class="quiz-question">${q.q}</p><div class="quiz-options">${q.o.map((v,i)=>`<button class="quiz-answer" data-answer="${i}">${['الف','ب','ج','د'][i]}. ${v}</button>`).join('')}</div><p class="quiz-feedback" id="quizFeedback"></p><button class="btn btn-primary" id="nextQuestion" disabled>${activeQuestion===activeExam.length-1?'دیدن نتیجه':'سؤال بعدی'} ←</button>`;quizContent.querySelectorAll('[data-answer]').forEach(b=>b.addEventListener('click',()=>chooseAnswer(Number(b.dataset.answer))));document.getElementById('nextQuestion')?.addEventListener('click',()=>{if(!answerLocked)return;activeQuestion++;renderQuestion();});}
function chooseAnswer(i){if(answerLocked)return;answerLocked=true;const q=activeExam[activeQuestion];if(i===q.a)examScore++;quizContent.querySelectorAll('[data-answer]').forEach((b,n)=>{b.disabled=true;if(n===q.a)b.classList.add('correct');else if(n===i)b.classList.add('wrong');});const feedback=document.getElementById('quizFeedback');if(feedback)feedback.textContent=q.e;const next=document.getElementById('nextQuestion');if(next)next.disabled=false;const done=Number(localStorage.getItem('tjd-tests')||0)+1;localStorage.setItem('tjd-tests',String(done));const el=document.getElementById('testsDone');if(el)el.textContent=done.toLocaleString('fa-IR');}
function closeExam(){quizModal?.classList.remove('open');quizModal?.setAttribute('aria-hidden','true');}
document.querySelectorAll('[data-exam]').forEach(b=>b.addEventListener('click',()=>openExam(b.dataset.exam)));
document.getElementById('signQuizBtn')?.addEventListener('click',()=>openExam('signs'));
document.getElementById('closeQuiz')?.addEventListener('click',closeExam);
quizModal?.addEventListener('click',e=>{if(e.target===quizModal)closeExam();});
document.querySelectorAll('[data-category]').forEach(b=>b.addEventListener('click',()=>openExam(b.dataset.category==='signs'?'signs':'quick')));
const savedTests=Number(localStorage.getItem('tjd-tests')||0);const testsEl=document.getElementById('testsDone');if(testsEl)testsEl.textContent=savedTests.toLocaleString('fa-IR');

// آمار حداقلی و بدون اطلاعات هویتی؛ فقط پس از تنظیم URL به مخزن ارسال می‌شود.
(function initSiteAnalytics(){
  if(!SHEETS_WEB_APP_URL)return;
  let session='';try{session=sessionStorage.getItem('tj_site_session')||'';if(!session){session=(window.crypto&&crypto.randomUUID)?crypto.randomUUID():String(Date.now())+'-'+Math.random().toString(36).slice(2);sessionStorage.setItem('tj_site_session',session)}}catch(e){session='session-'+Date.now()}
  function track(event){try{const body=new URLSearchParams({action:'event',event,page:location.pathname+location.hash,session});fetch(SHEETS_WEB_APP_URL,{method:'POST',mode:'no-cors',body,keepalive:true}).catch(()=>{})}catch(e){}}
  track('page_view');
  document.addEventListener('click',e=>{const a=e.target.closest('a');if(!a)return;if(a.matches('a[href^="tel:"]'))track('click_call');else if(a.matches('a[href*="#register"]'))track('click_register');else if(a.matches('a[href*="#lesson-booking"]'))track('click_lesson');});
})();
