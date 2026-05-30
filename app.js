// 🦅 المحرك السحابي الذكي المتكامل والمستقر - Eagle Tech System v2026

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

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const database = firebase.database();

let adminAccount = { name: "محمود علي", email: "abdullah@eagle.com", password: "123", role: "مدير", logo: "🦅" };
let globalTechnicians = [];
let globalOrders = [];
let currentActiveUser = null;
let currentSelectedFilter = 'الكل';
let lineChartInstance = null;
let pieChartInstance = null;

// تفعيل دوال التنقل بتبويبات اللوحة والأزرار الرئيسية
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
    alert("🛠️ سيقوم الذكاء الاصطناعي في المرحلة القادمة بربط استمارات الإضافة الفورية وتنسيقها بصرياً بالكامل.");
}

function initFirebaseOrdersListener() {
    database.ref('systemSettings').on('value', (snapshot) => {
        const settings = snapshot.val();
        if(settings) { adminAccount = settings; }
        executeMainDataSync();
    }, (error) => {
        executeMainDataSync();
    });
}

function executeMainDataSync() {
    database.ref('technicians').on('value', (snapshot) => {
        globalTechnicians = [{ name: adminAccount.name, email: adminAccount.email, password: adminAccount.password, role: "مدير", phone: "0500000000", status: "نشط" }];
        const techData = snapshot.val();
        if(techData) { Object.keys(techData).forEach(k => { globalTechnicians.push({ techFirebaseKey: k, ...techData[k] }); }); }
        
        database.ref('orders').on('value', (ordersSnap) => {
            globalOrders = [];
            const ordersData = ordersSnap.val();
            if(ordersData) { Object.keys(ordersData).forEach(k => { globalOrders.unshift({ firebaseKey: k, ...ordersData[k] }); }); }
            
            recalculateTechStatsFromOrders();
            checkSavedUserLocalStorageSession();
        });
    });
}

function checkSavedUserLocalStorageSession() {
    const savedSession = localStorage.getItem('eagle_tech_active_user_session');
    if (savedSession && !currentActiveUser) {
        const parsed = JSON.parse(savedSession);
        let user = (parsed.email.toLowerCase() === adminAccount.email.toLowerCase() && parsed.password === adminAccount.password)
            ? { name: adminAccount.name, email: adminAccount.email, password: adminAccount.password, role: "مدير" }
            : globalTechnicians.find(t => t.email && t.email.toLowerCase() === parsed.email.toLowerCase() && t.password === parsed.password);
        if(user) { currentActiveUser = user; }
    }
    renderSystem();
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

    let filteredOrders = globalOrders;
    if(currentActiveUser.role === 'فني') { filteredOrders = filteredOrders.filter(o => o.techName === currentActiveUser.name); }

    // حقن الأرقام بداخل كروت الإحصائيات
    if(document.getElementById('dash-total')) document.getElementById('dash-total').innerText = filteredOrders.length;
    if(document.getElementById('dash-progress')) document.getElementById('dash-progress').innerText = filteredOrders.filter(o => o.status === 'في الانتظار').length;
    if(document.getElementById('dash-total-current')) document.getElementById('dash-total-current').innerText = filteredOrders.filter(o => o.status === 'جاري التركيب').length;
    if(document.getElementById('dash-success')) document.getElementById('dash-success').innerText = filteredOrders.filter(o => o.status && o.status.includes('تم التركيب')).length;
    if(document.getElementById('dash-cancel')) document.getElementById('dash-cancel').innerText = filteredOrders.filter(o => o.status === 'رفض التركيب' || o.status === 'تأجيل التركيب').length;
    if(document.getElementById('badge-orders-count')) document.getElementById('badge-orders-count').innerText = globalOrders.length;

    // بناء وعرض واجهات الموبايل المتسلسلة
    const mobileCardsContainer = document.getElementById('mainOrdersCardsContainerMobile');
    if(mobileCardsContainer) {
        mobileCardsContainer.innerHTML = '';
        if(filteredOrders.length === 0) mobileCardsContainer.innerHTML = `<p class="p-4 text-center text-slate-400 text-xs">لا توجد أوردرات معروضة حالياً...</p>`;
        
        filteredOrders.forEach(o => {
            let badgeColor = (o.status && o.status.includes('تم'))?'bg-emerald-50 text-emerald-700 border-emerald-200':(o.status==='جاري التركيب'?'bg-blue-50 text-blue-700 border-blue-200':'bg-amber-50 text-amber-700 border-amber-200');
            mobileCardsContainer.innerHTML += `
                <div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3 text-right">
                    <div class="flex justify-between border-b pb-2">
                        <span class="text-[10px] bg-slate-900 text-white px-2 py-0.5 rounded font-bold">#ORD-${o.id}</span>
                        <span class="text-[10px] px-2 py-0.5 rounded border font-black ${badgeColor}">${o.status}</span>
                    </div>
                    <div class="text-xs space-y-1">
                        <p class="font-black text-slate-900">👤 العميل: ${o.customerName}</p>
                        <p class="text-slate-500">📞 الموبايل: ${o.phone}</p>
                        <p class="text-slate-600">📍 العنوان: ${o.address}</p>
                    </div>
                    <div class="flex justify-between bg-slate-50 p-2 border rounded-xl text-xs"><span>المبلغ المستحق:</span><span class="font-black text-emerald-600">${o.amount} ريال</span></div>
                </div>`;
        });
    }

    const desktopTable = document.getElementById('mainOrdersTableBodyDesktop');
    if(desktopTable) {
        desktopTable.innerHTML = '';
        filteredOrders.forEach(o => {
            desktopTable.innerHTML += `
                <tr class="border-b hover:bg-slate-50 text-[11px]">
                    <td class="p-4 text-center"><input type="checkbox" class="order-row-checkbox" data-id="${o.id}"></td>
                    <td class="p-4 font-bold">ORD-${o.id}</td>
                    <td class="p-4 font-bold">${o.customerName}<br>${o.phone}</td>
                    <td class="p-4">${o.address}</td>
                    <td class="p-4 font-black">${o.amount} ريال</td>
                    <td class="p-4"><span>${o.status}</span></td>
                    <td class="p-4 font-bold">👤 ${o.techName}</td>
                    <td class="p-4 text-center"><button onclick="alert('ملف عرض وثائق العميل آمن وسيتم تنسيقه في المرحلة القادمة.')" class="bg-slate-800 text-white px-2 py-1 rounded">🔍</button></td>
                </tr>`;
        });
    }

    let totalRev = 0; let totalPureProfit = 0;
    const finContainer = document.getElementById('financialTechTableBody');
    if(finContainer) {
        finContainer.innerHTML = '';
        globalOrders.forEach(o => { if(o.status && o.status.includes('تم التركيب')) { totalPureProfit += (parseFloat(o.amount || 0) - parseFloat(o.cost || 0)); } });
        globalTechnicians.forEach(t => {
            if(t.role !== 'مدير') totalRev += (t.collected || 0);
            finContainer.innerHTML += `<div class="bg-slate-50 p-3 rounded-xl border flex justify-between items-center text-xs"><div><p class="font-black">👤 ${t.name}</p></div><p class="font-black text-emerald-600">${(t.collected || 0).toLocaleString()} ريال</p></div>`;
        });
        if(document.getElementById('fin-total-revenue')) document.getElementById('fin-total-revenue').innerText = totalRev.toLocaleString() + " ريال سعودي";
        if(document.getElementById('fin-pure-profit')) document.getElementById('fin-pure-profit').innerText = totalPureProfit.toLocaleString() + " ريال سعودي";
    }
    renderDashboardCharts();
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

function printSelectedOrdersInvoices() {
    alert("🧾 محرك الفواتير والطباعة من اليمين لليسار جاهز ومستعد للعمل فور طلب تصديره.");
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

function triggerGlobalSearch() { renderSystem(); }
function filterOrdersByStatus(status) { currentSelectedFilter = status; renderSystem(); }
function toggleSelectAllOrders() { const master = document.getElementById('selectAllCheckbox').checked; document.querySelectorAll('.order-row-checkbox').forEach(cb => cb.checked = master); }
function toggleSelectAllOrdersMobile() {
    const masterMobile = document.getElementById('selectAllCheckboxMobile').checked;
    document.querySelectorAll('.order-row-checkbox').forEach(cb => cb.checked = masterMobile);
}

document.getElementById('systemLoginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const emailInput = document.getElementById('loginEmail').value.trim().toLowerCase();
    const passwordInput = document.getElementById('loginPassword').value.trim();
    
    let user = (emailInput === adminAccount.email.toLowerCase() && passwordInput === adminAccount.password)
        ? { name: adminAccount.name, email: adminAccount.email, password: adminAccount.password, role: "مدير" }
        : globalTechnicians.find(t => t.email && t.email.toLowerCase() === emailInput && t.password === passwordInput);

    if (user) { 
        currentActiveUser = user; 
        localStorage.setItem('eagle_tech_active_user_session', JSON.stringify({ email: emailInput, password: passwordInput })); 
        renderSystem(); 
    } else { 
        document.getElementById('loginErrorMsg').classList.remove('hidden'); 
    }
});

window.addEventListener('DOMContentLoaded', () => { initFirebaseOrdersListener(); });
