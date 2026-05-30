// 🦅 المحرك السحابي المحمي ضد الصدمات والتحديثات - Eagle Tech System v2026

const firebaseConfig = {
  apiKey: "AIzaSyAP9PfsTXFylSaioJGGi6L-EwVCbVh1SxU",
  authDomain: "eagle-tech-system.firebaseapp.com",
  databaseURL: "https://eagle-tech-system-default-rtdb.firebaseio.com", 
  projectId: "eagle-tech-system",
  storageBucket: "eagle-tech-system.firebasestorage.app",
  messagingSenderId: "546590584298",
  appId: "1:546590584298:web:f70c8cc63c4495c38c9693",
  measurementId: "G-Y7VVEQMYNN"
};

// 1. حماية المنظومة من التكرار والكراش أثناء الحفظ في الـ VS Code
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
} else {
    firebase.app(); 
}
const database = firebase.database();

// الحسابات والبيانات الثابتة
let adminAccount = { name: "عبدالله الزهراني", email: "abdullah@eagle.com", password: "123", role: "مدير", logo: "🦅" };
let globalTechnicians = [];
let globalOrders = [];
let globalTrashOrders = []; 
let globalClearanceLogs = [];
let currentActiveUser = null; 
let currentSelectedFilter = 'الكل';
let lineChartInstance = null;
let pieChartInstance = null;
let isDarkModeEnabled = false;

// دوال التنقل والقوائم
function toggleMobileMenu() { 
    if(document.getElementById('sidebarMenu')) {
        document.getElementById('sidebarMenu').classList.toggle('translate-x-full');
    }
}

function switchTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
    const targetTab = document.getElementById(`tab-${tabId}`);
    if(targetTab) targetTab.classList.add('active');
    
    document.querySelectorAll('nav button').forEach(btn => btn.classList.remove('bg-slate-800', 'text-white'));
    const activeBtn = document.getElementById(`nav-${tabId}`);
    if(activeBtn) activeBtn.classList.add('bg-slate-800', 'text-white');
    
    if(window.innerWidth < 768) { toggleMobileMenu(); }
    if(tabId === 'dashboard') { renderDashboardCharts(); }
}

function toggleOrderModal(open) { const modal = document.getElementById('addOrderModal'); if(modal) { if(open) modal.classList.remove('hidden'); else modal.classList.add('hidden'); } }
function toggleTechModal(open) { const modal = document.getElementById('addTechModal'); if(modal) { if(open) modal.classList.remove('hidden'); else modal.classList.add('hidden'); } }
function toggleViewDetailsModal(open) { const modal = document.getElementById('viewOrderDetailsModal'); if(modal) { if(open) modal.classList.remove('hidden'); else modal.classList.add('hidden'); } }
function toggleInstallationUploadModal(open) { const modal = document.getElementById('closeOrderInstallationModal'); if(modal) { if(open) modal.classList.remove('hidden'); else modal.classList.add('hidden'); } }

function openNewOrderModal() {
    if(document.getElementById('modalOrderForm')) document.getElementById('modalOrderForm').reset();
    if(document.getElementById('moEditKey')) document.getElementById('moEditKey').value = '';
    if(document.getElementById('orderModalTitle')) document.getElementById('orderModalTitle').innerText = '➕ استقبال وتوجيه أوردر ميداني جديد';
    updateTechSelectOptions();
    toggleOrderModal(true);
}

function updateTechSelectOptions() {
    const select = document.getElementById('moTech'); if(!select) return;
    select.innerHTML = '<option value="">-- اختر الفني لتوجيه الطلب له --</option>';
    globalTechnicians.forEach(t => { select.innerHTML += `<option value="${t.name}">${t.name} (${t.role})</option>`; });
}

function toggleAppThemeModeAction() {
    isDarkModeEnabled = !isDarkModeEnabled;
    const targetBody = document.getElementById('masterAppBody');
    if(isDarkModeEnabled) {
        targetBody.classList.remove('bg-slate-50', 'text-slate-800');
        targetBody.classList.add('bg-slate-900', 'text-slate-100');
    } else {
        targetBody.classList.remove('bg-slate-900', 'text-slate-100');
        targetBody.classList.add('bg-slate-50', 'text-slate-800');
    }
}

function updateTechActiveRadarStatus(statusText) {
    if(!currentActiveUser) return;
    const userKey = currentActiveUser.techFirebaseKey || "admin_session";
    if(currentActiveUser.role === 'مدير') {
        alert(`🚦 رادار الحالات: تم تعيين حالتك الإدارية إلى [${statusText}] بنجاح!`);
        return;
    }
    database.ref('technicians/' + userKey).update({ status: statusText })
        .then(() => alert(`تم تحديث رادار حالتك بالسيستم إلى: [${statusText}]`));
}

function openOrderDetailsFileReadOnly(orderId) {
    const order = globalOrders.find(o => o.id.toString() === orderId.toString());
    if(!order) return;
    const contentArea = document.getElementById('viewDetailsModalContentArea');
    let mapLink = order.locationUrl ? `<a href="${order.locationUrl}" target="_blank" class="text-indigo-600 underline font-black block">🗺️ تشغيل الـ GPS واللوكيشن المباشر للعميل</a>` : 'لا يوجد رابط خريطة مرفق بالطلب';
    let pureProfit = parseFloat(order.amount || 0) - parseFloat(order.cost || 0);

    document.getElementById('btnSingleOrderPrint').onclick = function() {
        const printArea = document.getElementById('invoicePrintArea'); printArea.innerHTML = '';
        printArea.classList.remove('hidden');
        printArea.innerHTML = `
            <div class="border-4 border-double border-slate-700 p-6 rounded-xl space-y-4 bg-white" style="min-height: 500px; direction: rtl !important; text-align: right !important;">
                <div class="flex justify-between items-center border-b pb-4"><h1 class="text-xl font-black">🦅 مؤسسة EAGLE TECH للأنظمة الأمنية</h1><div class="text-xs text-slate-400 font-mono">فاتورة أوردر رقم: ORD-${order.id}</div></div>
                <div class="grid grid-cols-2 gap-4 text-sm"><div><strong>اسم العميل:</strong> ${order.customerName}</div><div><strong>رقم الجوال:</strong> ${order.phone}</div><div><strong>المسار والعنوان:</strong> ${order.address}</div><div><strong>التاريخ والوقت:</strong> ${order.time}</div></div>
                <div class="border p-3 rounded-xl bg-slate-50 text-xs"><strong>المواد والقطع المستخدمة بالتنفيذ:</strong><p class="font-bold text-indigo-700 mt-1">${order.inventoryNotes || 'أنظمة وكاميرات صيانة معتمدة'}</p></div>
                <div class="border p-4 rounded-xl bg-slate-50 text-xs min-h-24"><strong>بيان المعدات المطلوبة:</strong><p class="mt-2 font-medium text-slate-700">${order.details}</p></div>
                <div class="flex justify-between items-center pt-4 border-t text-sm font-black"><span>الفني المكلف بالتركيب: ${order.techName}</span><span class="text-xl text-emerald-600">المبلغ: ${order.amount} ريال</span></div>
            </div>`;
        window.print();
        printArea.classList.add('hidden');
    };

    document.getElementById('btnSingleOrderExcel').onclick = function() {
        const data = [{ "رقم الأوردر": `ORD-${order.id}`, "العميل": order.customerName, "الجوال": order.phone, "العنوان": order.address, "المبلغ": order.amount, "التكلفة": order.cost, "صافي الربح": pureProfit, "الفني": order.techName, "الحالة": order.status, "المواد": order.inventoryNotes || "", "التفاصيل": order.details }];
        const ws = XLSX.utils.json_to_sheet(data); const wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, ws, "الطلب"); XLSX.writeFile(wb, `طلب_ORD_${order.id}.xlsx`);
    };

    let imagesHtmlRows = '<p class="text-slate-400 font-bold text-xs mt-1">⚠️ لم يقم الفني برفع صور التوثيق الميداني حتى الآن.</p>';
    if (order.installationPhotosArray && order.installationPhotosArray.length > 0) {
        imagesHtmlRows = `<div class="grid grid-cols-2 gap-2 mt-2">` + 
            order.installationPhotosArray.map((imgData) => `
                <div class="border rounded-xl overflow-hidden bg-slate-100">
                    <img src="${imgData}" class="w-full h-24 object-cover">
                    <a href="${imgData}" target="_blank" class="block bg-slate-900 text-white text-[9px] py-1 text-center font-bold">معاينة 🖼️</a>
                </div>
            `).join('') + `</div>`;
    }

    contentArea.innerHTML = `
        <div class="p-4 bg-slate-100 border rounded-2xl space-y-3 text-sm">
            <p class="text-base font-black text-slate-900 border-b pb-1.5">📦 ملف الأوردر: <span class="font-mono text-pink-600">ORD-${order.id}</span></p>
            <p class="text-xs text-slate-500 font-bold">⏳ تاريخ ووقت استقبال الأوردر بالسيستم: ${order.time}</p>
            <p class="text-sm font-black text-slate-900">👤 اسم العميل بالكامل: <span class="text-indigo-600">${order.customerName}</span></p>
            <p class="text-sm font-black text-slate-900">📞 موبايل العميل المباشر: <a href="tel:${order.phone}" class="text-pink-500 underline font-mono">${order.phone}</a></p>
            <p class="text-sm font-black text-slate-800">📍 مسار العنوان الميداني: <span class="text-slate-900 font-bold">${order.address}</span></p>
            <div class="pt-1">${mapLink}</div>
        </div>
        <div class="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-2 text-sm">
            <p class="font-black text-slate-900">💰 قيمة الحساب المطلوب من العميل: <span class="text-base text-emerald-600 font-black">${order.amount} ريال سعودي</span></p>
            <p class="font-bold text-slate-600">📉 تكلفة وشراء المواد الرأسمالية: ${order.cost || 0} ريال</p>
            <p class="font-black text-indigo-700 pt-1 border-t border-emerald-100">📈 صافي أرباح المؤسسة المحققة: <span class="text-base">${pureProfit} ريال</span></p>
        </div>
        <div class="p-4 bg-slate-50 border rounded-2xl text-sm">
            <p class="font-black text-slate-900 mb-1">📦 الأجهزة والقطع المستخدمة بالتنفيذ:</p>
            <p class="text-slate-700 font-semibold bg-white p-2 border rounded-xl">${order.inventoryNotes || 'لم تقيد مستلزمات أو قطع غيار لهذا الأوردر بعد'}</p>
        </div>
        <div class="p-4 bg-slate-50 border rounded-2xl text-sm">
            <p class="font-black text-slate-900 mb-1">📝 تفاصيل وبيان المهمة المطلوبة بالكاميرات:</p>
            <p class="text-slate-700 font-semibold bg-white p-2 border rounded-xl">${order.details}</p>
        </div>
        <div class="p-4 bg-indigo-50/50 border border-indigo-100 rounded-2xl text-sm">
            <p class="font-black text-slate-900 mb-1">📸 معرض صور الجودة الميدانية المرفوعة مباشرة من ملفات جوال الفني:</p>
            ${imagesHtmlRows}
        </div>
        <div class="p-4 bg-slate-100 border rounded-2xl text-sm">
            <p class="font-bold text-slate-800">👤 الفني المكلف بالتركيب: <span class="text-slate-900 font-black">${order.techName}</span></p>
            <p class="font-bold text-slate-800 mt-1">🚦 الحالة الميدانية الحالية للأوردر: <span class="px-2 py-0.5 bg-slate-900 text-white rounded font-black text-xs">${order.status}</span></p>
            ${order.reason ? `<p class="text-rose-600 font-black mt-2 bg-rose-50 border border-rose-100 p-2 rounded-xl">💬 بيان فني الميدان: ${order.reason}</p>` : ''}
        </div>
    `;
    toggleViewDetailsModal(true);
}

function exportSelectedOrdersToWordDoc() {
    const checkedBoxes = document.querySelectorAll('.order-row-checkbox:checked');
    if(checkedBoxes.length === 0) { alert("⚠️ يرجى تحديد أوردر واحد على الأقل لتصديره Word!"); return; }
    let docContent = "🦅 كشف وثائق وأوردرات مؤسسة Eagle Tech للأنظمة الأمنية 2026\r\n==================================================\r\n\r\n";
    checkedBoxes.forEach(cb => {
        const orderId = cb.getAttribute('data-id');
        const order = globalOrders.find(o => o.id.toString() === orderId.toString());
        if(order) {
            docContent += `• أوردر رقم: ORD-${order.id}\r\n  العميل: ${order.customerName}\r\n  الجوال: ${order.phone}\r\n  العنوان: ${order.address}\r\n  المبلغ: ${order.amount} ريال\r\n  الفني: ${order.techName}\r\n  الحالة: ${order.status}\r\n--------------------------------------------------\r\n\r\n`;
        }
    });
    const blob = new Blob([docContent], { type: "application/msword;charset=utf-8" });
    const link = document.createElement("a"); link.href = URL.createObjectURL(blob); link.download = "تقرير_أوردرات_إيجل_تيك.doc"; link.click();
}

function triggerInstallationCloseWorkflow(firebaseKey) {
    document.getElementById('installationUploadForm').reset();
    document.getElementById('uploadTargetFirebaseKey').value = firebaseKey;
    toggleInstallationUploadModal(true);
}

document.getElementById('installationUploadForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const targetKey = document.getElementById('uploadTargetFirebaseKey').value;
    const commentsText = document.getElementById('uploadTechComments').value.trim();
    const filesInput = document.getElementById('installationPhotosInput');
    
    if(!targetKey) return;
    let base64ImagesArray = []; const files = filesInput.files;

    const updateOrderInFirebase = (imgArray) => {
        let payload = { status: "تم التركيب", reason: commentsText || "تم التركيب والحمدلله" };
        if(imgArray.length > 0) { payload.installationPhotosArray = imgArray; }
        
        const order = globalOrders.find(o => o.firebaseKey === targetKey);
        if(order && order.startTimestamp) {
            const diffMins = Math.round((Date.now() - order.startTimestamp) / 60000);
            payload.taskTimer = diffMins > 0 ? diffMins : 40;
        }

        database.ref('orders/' + targetKey).update(payload).then(() => {
            toggleInstallationUploadModal(false);
            triggerInstantAudioSignalAlert();
            alert("🟢 تم حفظ صور التركيبات وإغلاق الأوردر سحابياً بنجاح!");
        });
    };

    if (files.length > 0) {
        let readCount = 0;
        for (let i = 0; i < files.length; i++) {
            let reader = new FileReader();
            reader.onload = function(event) {
                base64ImagesArray.push(event.target.result);
                readCount++;
                if (readCount === files.length) { updateOrderInFirebase(base64ImagesArray); }
            };
            reader.readAsDataURL(files[i]);
        }
    } else { updateOrderInFirebase([]); }
});

function moveOrderToSecureTrashBinCloud(firebaseKey) {
    if(confirm("🗑️ هل أنت متأكد من مسح الأوردر وأرشفته في سلة المحذوفات السرية؟")) {
        const target = globalOrders.find(o => o.firebaseKey === firebaseKey);
        if(target) { database.ref('trashBinOrders').push(target).then(() => { database.ref('orders/' + firebaseKey).remove(); }); }
    }
}

function initFirebaseOrdersListener() {
    database.ref('systemSettings').on('value', (snapshot) => {
        const settings = snapshot.val();
        if(settings) {
            adminAccount = settings;
            document.querySelectorAll('.system-logo-span').forEach(el => el.innerText = adminAccount.logo || "🦅");
        }
        executeMainDataSync();
    }, () => { executeMainDataSync(); });
}

function executeMainDataSync() {
    database.ref('technicians').on('value', (snapshot) => {
        globalTechnicians = [];
        // حماية حساب المدير الافتراضي من الحذف أو التعديل الخارجي
        globalTechnicians.push({
            name: adminAccount.name, email: adminAccount.email, password: adminAccount.password,
            role: "مدير", phone: "0500000000", status: "نشط", initials: "AZ", color: "bg-purple-600", total: 0, done: 0, collected: 0
        });

        const techData = snapshot.val();
        if(techData) { Object.keys(techData).forEach(key => { globalTechnicians.push({ techFirebaseKey: key, total: 0, done: 0, collected: 0, ...techData[key] }); }); }
        updateTechSelectOptions();

        database.ref('orders').off();
        database.ref('orders').on('value', (ordersSnapshot) => {
            globalOrders = [];
            const ordersData = ordersSnapshot.val();
            if(ordersData) { Object.keys(ordersData).forEach(key => { globalOrders.unshift({ firebaseKey: key, ...ordersData[key] }); }); }
            
            recalculateTechStatsFromOrders();
            calculateTopPerformanceAndAnalytics();
            
            // فحص وتشغيل الجلسة السابقة فوراً وبأمان تام
            checkSavedUserLocalStorageSession();
        });
    });
}

function checkSavedUserLocalStorageSession() {
    const savedSession = localStorage.getItem('eagle_tech_active_user_session');
    if (savedSession && !currentActiveUser) {
        const parsedSession = JSON.parse(savedSession);
        // مطابقة مرنة للحسابات تمنع الكراش أثناء الحفظ التلقائي للـ VS Code
        let verifiedUser = (parsedSession.email.toLowerCase() === adminAccount.email.toLowerCase() && parsedSession.password === adminAccount.password) 
            ? { name: adminAccount.name, email: adminAccount.email, password: adminAccount.password, role: "مدير" }
            : globalTechnicians.find(t => t.email && t.email.toLowerCase() === parsedSession.email.toLowerCase() && t.password === parsedSession.password);
        
        if (verifiedUser) { 
            currentActiveUser = verifiedUser; 
        }
    }
    renderSystem();
}

function logOutSystemAccountForce() {
    if(confirm("🚪 هل أنت متأكد من تسجيل الخروج بالكامل من المنظومة؟")) {
        localStorage.removeItem('eagle_tech_active_user_session');
        currentActiveUser = null;
        document.getElementById('loginPageGate').style.display = 'flex';
        window.location.reload();
    }
}

function recalculateTechStatsFromOrders() {
    globalTechnicians.forEach(t => { t.total = 0; t.done = 0; t.collected = 0; });
    globalOrders.forEach(o => {
        const tech = globalTechnicians.find(t => t.name === o.techName);
        if(tech) {
            tech.total += 1;
            if(o.status === 'تم التركيب' || o.status === 'تم التركيب ومغلق مالياً') { tech.done += 1; tech.collected += parseFloat(o.amount || 0); }
        }
    });
}

function calculateTopPerformanceAndAnalytics() {
    let maxDone = -1; let topDoneTech = "لا يوجد حالياً";
    let maxMoney = -1; let topMoneyTech = "لا يوجد حالياً";
    globalTechnicians.forEach(t => {
        if(t.role !== 'مدير') {
            if(t.done > maxDone && t.done > 0) { maxDone = t.done; topDoneTech = `${t.name} (${t.done} أوردرات)`; }
            if(t.collected > maxMoney && t.collected > 0) { maxMoney = t.collected; topMoneyTech = `${t.name} (${t.collected.toLocaleString()} ريال)`; }
        }
    });
    if(document.getElementById('perf-top-done')) document.getElementById('perf-top-done').innerText = topDoneTech;
    if(document.getElementById('perf-top-money')) document.getElementById('perf-top-money').innerText = topMoneyTech;
}

function updateOrderStatusWithReason(firebaseKey, nextStatus) {
    if(!firebaseKey) return;
    if(nextStatus === 'تم التركيب') { triggerInstallationCloseWorkflow(firebaseKey); return; }
    let reason = "";
    if(nextStatus === 'رفض التركيب' || nextStatus === 'تأجيل التركيب') {
        reason = prompt(`يرجى كتابة سبب (${nextStatus}) بالتفصيل:`);
        if(reason === null) return;
        if(reason.trim() === "") { alert("❌ يجب كتابة السبب لتحديث الحالة!"); return; }
    }
    let updatePayload = { status: nextStatus, reason: reason.trim() };
    if(nextStatus === 'جاري التركيب') { updatePayload.startTimestamp = Date.now(); }
    database.ref('orders/' + firebaseKey).update(updatePayload).then(() => { triggerInstantAudioSignalAlert(); });
}

// الفلاتر والبحث
function triggerGlobalSearch() { renderSystem(); }
function filterOrdersByStatus(status) { currentSelectedFilter = status; renderSystem(); }
function toggleSelectAllOrders() { const master = document.getElementById('selectAllCheckbox').checked; document.querySelectorAll('.order-row-checkbox').forEach(cb => cb.checked = master); }
function toggleSelectAllOrdersMobile() {
    const masterMobile = document.getElementById('selectAllCheckboxMobile').checked;
    document.querySelectorAll('.order-row-checkbox').forEach(cb => cb.checked = masterMobile);
}

function exportOrdersToExcel() {
    const checkedBoxes = document.querySelectorAll('.order-row-checkbox:checked');
    let sourceArray = globalOrders;
    if (checkedBoxes.length > 0) {
        const checkedIds = Array.from(checkedBoxes).map(cb => cb.getAttribute('data-id'));
        sourceArray = globalOrders.filter(o => checkedIds.includes(o.id.toString()));
    }
    const ws = XLSX.utils.json_to_sheet(sourceArray.map(o => ({ "رقم الطلب": o.id, "العميل": o.customerName, "الجوال": o.phone, "العنوان": o.address, "المبلغ": o.amount, "التكلفة": o.cost, "الفني": o.techName, "الحالة": o.status, "المواد": o.inventoryNotes || "", "التفاصيل": o.details })));
    const wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, ws, "الأوردرات"); XLSX.writeFile(wb, "تقرير_أوردرات_إيجل_تيك.xlsx");
}

function printSelectedOrdersInvoices() {
    const checkedBoxes = document.querySelectorAll('.order-row-checkbox:checked');
    if(checkedBoxes.length === 0) { alert("⚠️ يرجى تحديد أوردر واحد على الأقل لطباعة فاتورته!"); return; }
    
    const printArea = document.getElementById('invoicePrintArea'); 
    printArea.innerHTML = '';
    printArea.classList.remove('hidden');
    
    checkedBoxes.forEach(cb => {
        const orderId = cb.getAttribute('data-id'); 
        const order = globalOrders.find(o => o.id.toString() === orderId.toString());
        if(order) {
            printArea.innerHTML += `
                <div class="invoice-container bg-white p-8 max-w-3xl mx-auto my-4 border border-slate-200" style="page-break-after: always; font-family: 'Cairo', sans-serif; color: #1e293b !important; text-align: right !important; direction: rtl !important; min-height: 842px; position: relative;">
                    <div style="display: flex; justify-content: space-between; align-items: center; padding-bottom: 20px; margin-bottom: 24px; border-bottom: 3px solid #0f172a;">
                        <div>
                            <h1 style="font-size: 24px; font-weight: 900; color: #0f172a; margin: 0; padding-bottom: 4px;">🦅 مؤسسة إيجل تيك الذكية</h1>
                            <p style="font-size: 11px; color: #64748b; font-weight: bold; margin: 0;">للانظمة الأمنية، الكاميرات، وشبكات الاتصال السحابية</p>
                        </div>
                        <div style="text-align: left; direction: ltr;">
                            <span style="font-size: 12px; background-color: #f1f5f9; color: #0f172a; font-weight: 900; padding: 6px 12px; border-radius: 8px; border: 1px solid #e2e8f0; display: inline-block;">INVOICE: ORD-${order.id}</span>
                            <p style="font-size: 11px; color: #64748b; margin-top: 6px; margin-bottom: 0; font-weight: 600;">التاريخ: ${order.time}</p>
                        </div>
                    </div>
                    <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; margin-bottom: 24px;">
                        <h3 style="font-size: 13px; font-weight: 800; color: #475569; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px; margin-top: 0; margin-bottom: 12px;">👤 بيانات العميل وموقع التنفيذ الميداني</h3>
                        <div style="display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; font-size: 12px; color: #334155;">
                            <div><strong>اسم العميل بالكامل:</strong> <span style="font-weight: 700; color: #0f172a;">${order.customerName}</span></div>
                            <div><strong>رقم الموبايل المباشر:</strong> <span style="font-weight: 700; color: #0f172a; font-family: sans-serif;">${order.phone}</span></div>
                            <div style="grid-column: span 2 / span 2;"><strong>مسار المسكن والعنوان المعتمد:</strong> <span style="font-weight: 700; color: #0f172a;">${order.address}</span></div>
                        </div>
                    </div>
                    <div style="border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; margin-bottom: 24px;">
                        <table style="width: 100%; border-collapse: collapse; font-size: 12px; text-align: right;">
                            <thead style="background-color: #0f172a; color: #ffffff;">
                                <tr>
                                    <th style="padding: 10px 14px; font-weight: 700; border: 1px solid #1e293b;">بيان التكليف والأنظمة الموردة</th>
                                    <th style="padding: 10px 14px; font-weight: 700; border: 1px solid #1e293b; width: 350px;">المواد والقطع غيار المعينة</th>
                                </tr>
                            </thead>
                            <tbody style="color: #334155;">
                                <tr style="background-color: #ffffff;">
                                    <td style="padding: 14px; border: 1px solid #e2e8f0; vertical-align: top; font-weight: 600; line-height: 1.6;">${order.details}</td>
                                    <td style="padding: 14px; border: 1px solid #e2e8f0; vertical-align: top; font-weight: bold; color: #4338ca; line-height: 1.6; background-color: #fcfdf7;">${order.inventoryNotes || 'تمديدات، صيانة دورية، وفحص كامل للأنظمة المعتمدة.'}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <div style="display: flex; justify-content: flex-end; margin-bottom: 60px;">
                        <div style="width: 280px; background-color: #f0fdf4; border: 2px solid #bbf7d0; border-radius: 12px; padding: 14px; text-align: left; direction: ltr;">
                            <div style="display: flex; justify-content: space-between; align-items: center; font-size: 14px; font-weight: 900; color: #166534; direction: rtl;">
                                <span>المبلغ الإجمالي المستحق:</span>
                                <span style="font-size: 18px; font-family: sans-serif;">${order.amount} ريال</span>
                            </div>
                            <p style="font-size: 9px; color: #15803d; margin-top: 4px; margin-bottom: 0; text-align: right; font-weight: bold; direction: rtl;">* الفاتورة معتمدة سحابياً وتشمل أجور التركيب والبرمجة والضمان الميداني.</p>
                        </div>
                    </div>
                    <div style="position: absolute; bottom: 40px; left: 32px; right: 32px; display: flex; justify-content: space-between; align-items: center; font-size: 12px; color: #475569; border-top: 1px dashed #cbd5e1; padding-top: 20px;">
                        <div style="text-align: right;">
                            <p style="margin: 0; font-weight: bold;">👤 فني التركيب المعتمد:</p>
                            <p style="margin: 4px 0 0 0; font-weight: 900; color: #0f172a; font-size: 13px;">${order.techName}</p>
                            <div style="margin-top: 12px; width: 140px; border-bottom: 1px solid #94a3b8; height: 20px;"></div>
                        </div>
                        <div style="text-align: center;">
                            <div style="width: 100px; height: 100px; border: 2px dashed #cbd5e1; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #cbd5e1; font-size: 10px; font-weight: bold; margin: 0 auto;">ختم المؤسسة الرسمي</div>
                        </div>
                    </div>
                </div>`;
        }
    });
    
    window.print();
    setTimeout(() => { printArea.classList.add('hidden'); }, 500);
}

function renderDashboardCharts() {
    const ctxLine = document.getElementById('dashLineChart'); const ctxPie = document.getElementById('dashPieChart');
    if(!ctxLine || !ctxPie) return;
    if(lineChartInstance) lineChartInstance.destroy(); if(pieChartInstance) pieChartInstance.destroy();
    const successCount = globalOrders.filter(o => o.status && o.status.includes('تم التركيب')).length;
    const progressCount = globalOrders.filter(o => o.status === 'في الانتظار').length;
    const currentCount = globalOrders.filter(o => o.status === 'جاري التركيب').length;
    const failCount = globalOrders.filter(o => o.status === 'رفض التركيب' || o.status === 'تأجيل التركيب').length;

    lineChartInstance = new Chart(ctxLine, { type: 'line', data: { labels: ['في الانتظار', 'جاري التركيب', 'تم الإنجاز', 'المؤجل والمرفوض'], datasets: [{ label: 'تدفق الحركة الميدانية للأوردرات', data: [progressCount, currentCount, successCount, failCount], borderColor: '#ec4899', tension: 0.4, fill: false }] }, options: { responsive: true, maintainAspectRatio: false } });
    pieChartInstance = new Chart(ctxPie, { type: 'doughnut', data: { labels: ['تم بنجاح', 'معلق', 'جاري الميدان', 'مشاكل'], datasets: [{ data: [successCount, progressCount, currentCount, failCount], backgroundColor: ['#10b981', '#f59e0b', '#3b82f6', '#ef4444'] }] }, options: { responsive: true, maintainAspectRatio: false } });
}

function renderSystem() {
    if(!currentActiveUser) {
        document.getElementById('loginPageGate').style.display = 'flex';
        return;
    }
    
    document.getElementById('loginPageGate').style.display = 'none';
    if(document.getElementById('activeUserNameText')) {
        document.getElementById('activeUserNameText').innerText = `${currentActiveUser.name} (${currentActiveUser.role})`;
    }
    
    if(currentActiveUser.role === 'مدير') {
        document.querySelectorAll('.admin-only').forEach(el => el.classList.remove('hidden'));
    } else {
        document.querySelectorAll('.admin-only').forEach(el => el.classList.add('hidden'));
    }

    const searchQuery = document.getElementById('globalSearch').value.toLowerCase();
    let filteredOrders = globalOrders;
    
    if(currentSelectedFilter === 'صيانة دورية') { filteredOrders = filteredOrders.filter(o => o.status && o.status.includes('تم التركيب')); } 
    else if(currentSelectedFilter !== 'الكل') { filteredOrders = filteredOrders.filter(o => o.status === currentSelectedFilter); }

    if(currentActiveUser.role === 'فني') { filteredOrders = filteredOrders.filter(o => o.techName === currentActiveUser.name); }
    if(searchQuery) { filteredOrders = filteredOrders.filter(o => (o.id && o.id.toString().includes(searchQuery)) || (o.customerName && o.customerName.toLowerCase().includes(searchQuery)) || (o.phone && o.phone.includes(searchQuery)) || (o.address && o.address.toLowerCase().includes(searchQuery))); }

    const mobileCardsContainer = document.getElementById('mainOrdersCardsContainerMobile');
    if(mobileCardsContainer) {
        mobileCardsContainer.innerHTML = '';
        if(filteredOrders.length === 0) mobileCardsContainer.innerHTML = `<p class="p-4 text-center text-slate-400 text-xs">لا توجد أوردرات معروضة حالياً...</p>`;
        
        filteredOrders.forEach(o => {
            let badgeColor = (o.status && o.status.includes('تم'))?'bg-emerald-50 text-emerald-700 border-emerald-200':(o.status==='جاري التركيب'?'bg-blue-50 text-blue-700 border-blue-200':'bg-amber-50 text-amber-700 border-amber-200');
            if(o.status==='رفض التركيب' || o.status==='تأجيل التركيب') badgeColor = 'bg-rose-50 text-rose-700 border-rose-200';
            let locAction = o.locationUrl ? `<a href="${o.locationUrl}" target="_blank" class="flex-1 bg-blue-50 text-blue-700 border border-blue-200 text-center py-2 rounded-xl text-xs font-black">📍 الخريطة والـ GPS</a>` : '';
            
            mobileCardsContainer.innerHTML += `
                <div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3 text-right relative">
                    <div class="absolute left-4 top-12 z-10 scale-125"><input type="checkbox" class="order-row-checkbox w-4 h-4 text-pink-600" data-id="${o.id}"></div>
                    <div class="flex justify-between items-start border-b pb-2">
                        <div><span class="text-[10px] bg-slate-900 text-white font-mono px-2 py-0.5 rounded font-bold">#ORD-${o.id}</span><p class="text-[9px] text-slate-400 mt-1">${o.time}</p></div>
                        <span class="text-[10px] px-2 py-0.5 rounded border font-black ${badgeColor}">${o.status}</span>
                    </div>
                    <div class="text-xs space-y-1">
                        <p class="font-black text-slate-900">👤 العميل: ${o.customerName}</p>
                        <p class="text-slate-500 font-bold">📞 الموبايل: <a href="tel:${o.phone}" class="text-pink-500 underline">${o.phone}</a></p>
                        <p class="text-slate-600">📍 العنوان: ${o.address}</p>
                        <div class="bg-slate-50 p-2 border rounded-xl text-[11px] text-slate-700 font-medium">${o.details}</div>
                        ${o.inventoryNotes ? `<p class="text-[10px] font-bold text-indigo-700 bg-indigo-50/50 p-1 rounded">📦 المواد: ${o.inventoryNotes}</p>` : ''}
                    </div>
                    <div class="flex justify-between items-center bg-slate-50 p-2 border rounded-xl text-xs"><span class="font-bold text-slate-400">الحساب المطلوب:</span><span class="font-black text-emerald-600">${o.amount} ريال</span></div>
                    <div class="flex flex-col gap-1.5 pt-1">
                        ${locAction}
                        <div class="grid grid-cols-2 gap-1.5">
                            <button onclick="updateOrderStatusWithReason('${o.firebaseKey}', 'جاري التركيب')" class="bg-blue-600 text-white font-black py-2 rounded-xl text-xs">🚚 جاري التركيب</button>
                            <button onclick="updateOrderStatusWithReason('${o.firebaseKey}', 'تم التركيب')" class="bg-emerald-600 text-white font-black py-2 rounded-xl text-xs">✅ تم التركيب</button>
                            <button onclick="updateOrderStatusWithReason('${o.firebaseKey}', 'تأجيل التركيب')" class="bg-amber-500 text-white font-bold py-2 rounded-xl text-xs">⏳ تأجيل</button>
                            <button onclick="updateOrderStatusWithReason('${o.firebaseKey}', 'رفض التركيب')" class="bg-rose-600 text-white font-bold py-2 rounded-xl text-xs">🛑 رفض الطلب</button>
                        </div>
                        <div class="grid grid-cols-1 mt-1"><button onclick="openOrderDetailsFileReadOnly('${o.id}')" class="w-full bg-slate-800 text-white font-black py-2 rounded-xl text-xs">🔍 فتح ومعاينة وثائق الملف كاملة</button></div>
                    </div>
                </div>`;
        });
    }

    const desktopTable = document.getElementById('mainOrdersTableBodyDesktop');
    if(desktopTable) {
        desktopTable.innerHTML = '';
        filteredOrders.forEach(o => {
            let badgeColor = (o.status && o.status.includes('تم'))?'bg-green-50 text-green-700 border-green-200':(o.status==='جاري التركيب'?'bg-blue-50 text-blue-700 border-blue-200':'bg-amber-50 text-amber-700 border-amber-200');
            let profitMargin = parseFloat(o.amount || 0) - parseFloat(o.cost || 0);
            desktopTable.innerHTML += `
                <tr class="border-b hover:bg-slate-50 text-[11px]">
                    <td class="p-4 text-center"><input type="checkbox" class="order-row-checkbox" data-id="${o.id}"></td>
                    <td class="p-4 font-mono font-bold">ORD-${o.id}</td>
                    <td class="p-4 font-bold">${o.customerName}<br>${o.phone}</td>
                    <td class="p-4">${o.address}</td>
                    <td class="p-4 font-black">${o.amount} ريال<br><span class="text-emerald-600">📈 ربح: ${profitMargin}</span></td>
                    <td class="p-4"><span class="px-2 py-0.5 border rounded font-black ${badgeColor}">${o.status}</span></td>
                    <td class="p-4 font-bold">👤 ${o.techName}</td>
                    <td class="p-4 text-center">
                        <button onclick="openOrderDetailsFileReadOnly('${o.id}')" class="bg-slate-800 text-white px-2 py-1 rounded font-bold">🔍</button>
                    </td>
                </tr>`;
        });
    }

    let totalRev = 0; let totalPureProfit = 0;
    const finContainer = document.getElementById('financialTechTableBody');
    if(finContainer) {
        finContainer.innerHTML = '';
        globalOrders.forEach(o => { if(o.status && o.status.includes('تم التركيب')) { totalPureProfit += (parseFloat(o.amount || 0) - parseFloat(o.cost || 0)); } });
        globalTechnicians.forEach(t => {
            const shouldDisplay = (currentActiveUser.role === 'مدير') || (currentActiveUser.name === t.name);
            if(t.role !== 'مدير') totalRev += t.collected;
            if(shouldDisplay && t.role !== 'مدير') {
                finContainer.innerHTML += `<div class="bg-slate-50 p-3 rounded-xl border flex justify-between items-center text-xs"><div><p class="font-black">👤 ${t.name}</p></div><p class="font-black text-emerald-600">${t.collected.toLocaleString()} RM</p></div>`;
            }
        });
        if(document.getElementById('fin-total-revenue')) document.getElementById('fin-total-revenue').innerText = totalRev.toLocaleString() + " ريال سعودي";
        if(document.getElementById('fin-pure-profit')) document.getElementById('fin-pure-profit').innerText = totalPureProfit.toLocaleString() + " ريال سعودي";
    }

    document.getElementById('dash-total').innerText = filteredOrders.length;
    document.getElementById('dash-progress').innerText = filteredOrders.filter(o => o.status === 'في الانتظار').length;
    document.getElementById('dash-total-current').innerText = filteredOrders.filter(o => o.status === 'جاري التركيب').length;
    document.getElementById('dash-success').innerText = filteredOrders.filter(o => o.status && o.status.includes('تم التركيب')).length;
    document.getElementById('dash-cancel').innerText = filteredOrders.filter(o => o.status === 'رفض التركيب' || o.status === 'تأجيل التركيب').length;
}

document.getElementById('systemLoginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const emailInput = document.getElementById('loginEmail').value.trim().toLowerCase();
    const passwordInput = document.getElementById('loginPassword').value.trim();
    
    let matchedUser = null;
    // مطابقة صلبة وفورية تمنع التهنيج
    if (emailInput === adminAccount.email.toLowerCase() && passwordInput === adminAccount.password) {
        matchedUser = { name: adminAccount.name, email: adminAccount.email, password: adminAccount.password, role: "مدير" };
    } else {
        matchedUser = globalTechnicians.find(t => t.email && t.email.toLowerCase() === emailInput && t.password === passwordInput);
    }

    if (matchedUser) { 
        currentActiveUser = matchedUser; 
        localStorage.setItem('eagle_tech_active_user_session', JSON.stringify({ email: emailInput, password: passwordInput })); 
        document.getElementById('loginPageGate').style.display = 'none'; 
        renderSystem(); 
    } else { 
        document.getElementById('loginErrorMsg').classList.remove('hidden'); 
    }
});

// تشغيل جلب ومزامنة البيانات بشكل آمن
window.addEventListener('DOMContentLoaded', () => { initFirebaseOrdersListener(); });
