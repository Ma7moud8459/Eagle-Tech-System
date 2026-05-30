// 🦅 المحرك السحابي المستقر والآمن الفائق - Eagle Tech System v2026

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
    toggleOrderModal(true);
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
            
            // فحص وتشغيل جلسة الدخول التلقائية المخزنة
            const savedSession = localStorage.getItem('eagle_tech_active_user_session');
            if (savedSession && !currentActiveUser) {
                const parsed = JSON.parse(savedSession);
                let user = (parsed.email.toLowerCase() === adminAccount.email.toLowerCase() && parsed.password === adminAccount.password)
                    ? { name: adminAccount.name, email: adminAccount.email, password: adminAccount.password, role: "مدير" }
                    : globalTechnicians.find(t => t.email && t.email.toLowerCase() === parsed.email.toLowerCase() && t.password === parsed.password);
                if(user) { currentActiveUser = user; }
            }
            renderSystem();
        });
    });
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

    // [تصحيح الربح وتغذية العدادات بالأرقام الحية]
    document.getElementById('dash-total').innerText = filteredOrders.length;
    document.getElementById('dash-progress').innerText = filteredOrders.filter(o => o.status === 'في الانتظار').length;
    document.getElementById('dash-total-current').innerText = filteredOrders.filter(o => o.status === 'جاري التركيب').length;
    document.getElementById('dash-success').innerText = filteredOrders.filter(o => o.status && o.status.includes('تم التركيب')).length;
    document.getElementById('dash-cancel').innerText = filteredOrders.filter(o => o.status === 'رفض التركيب' || o.status === 'تأجيل التركيب').length;
    if(document.getElementById('badge-orders-count')) document.getElementById('badge-orders-count').innerText = globalOrders.length;

    // [إصلاح سطر الخطأ بالملي هنا وعرض الكروت]
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
                    <td class="p-4 text-center"><button onclick="openOrderDetailsFileReadOnly('${o.id}')" class="bg-slate-800 text-white px-2 py-1 rounded">🔍</button></td>
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
                    <div style="display: flex; flex-direction: row !important; justify-content: space-between; align-items: center; padding-bottom: 20px; margin-bottom: 24px; border-bottom: 3px solid #0f172a; direction: rtl !important;">
                        <div style="text-align: right !important; width: 60%;">
                            <h1 style="font-size: 24px; font-weight: 900; color: #0f172a; margin: 0; padding-bottom: 4px; text-align: right !important;">🦅 مؤسسة إيجل تيك الذكية</h1>
                            <p style="font-size: 11px; color: #64748b; font-weight: bold; margin: 0; text-align: right !important;">للانظمة الأمنية، الكاميرات، وشبكات الاتصال السحابية</p>
                        </div>
                        <div style="text-align: left !important; width: 40%; direction: rtl !important;">
                            <span style="font-size: 12px; background-color: #f1f5f9; color: #0f172a; font-weight: 900; padding: 6px 12px; border-radius: 8px; border: 1px solid #e2e8f0; display: inline-block; text-align: right !important;">رقم الأوردر: ORD-${order.id}</span>
                            <p style="font-size: 11px; color: #64748b; margin-top: 6px; margin-bottom: 0; font-weight: 600; text-align: left !important;">التاريخ: ${order.time}</p>
                        </div>
                    </div>
                    <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; margin-bottom: 24px; direction: rtl !important; text-align: right !important;">
                        <h3 style="font-size: 13px; font-weight: 800; color: #475569; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px; margin-top: 0; margin-bottom: 12px; text-align: right !important;">👤 بيانات العميل وموقع التنفيذ الميداني</h3>
                        <div style="display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; font-size: 12px; color: #334155; text-align: right !important;">
                            <div style="text-align: right !important;"><strong>اسم العميل بالكامل:</strong> <span style="font-weight: 700; color: #0f172a;">${order.customerName}</span></div>
                            <div style="text-align: right !important;"><strong>رقم الموبايل المباشر:</strong> <span style="font-weight: 700; color: #0f172a; font-family: sans-serif;">${order.phone}</span></div>
                            <div style="grid-column: span 2 / span 2; text-align: right !important;"><strong>مسار العنوان المعتمد:</strong> <span style="font-weight: 700; color: #0f172a;">${order.address}</span></div>
                        </div>
                    </div>
                    <div style="border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; margin-bottom: 24px; direction: rtl !important;">
                        <table style="width: 100%; border-collapse: collapse; font-size: 12px; text-align: right !important; direction: rtl !important;">
                            <thead style="background-color: #0f172a; color: #ffffff;">
                                <tr>
                                    <th style="padding: 10px 14px; font-weight: 700; border: 1px solid #1e293b; text-align: right !important;">بيان التكليف والأنظمة الموردة</th>
                                    <th style="padding: 10px 14px; font-weight: 700; border: 1px solid #1e293b; width: 350px; text-align: right !important;">المواد والقطع والأجهزة المستخدمة</th>
                                </tr>
                            </thead>
                            <tbody style="color: #334155;">
                                <tr style="background-color: #ffffff;">
                                    <td style="padding: 14px; border: 1px solid #e2e8f0; vertical-align: top; font-weight: 600; line-height: 1.6; text-align: right !important;">${order.details}</td>
                                    <td style="padding: 14px; border: 1px solid #e2e8f0; vertical-align: top; font-weight: bold; color: #4338ca; line-height: 1.6; background-color: #fcfdf7; text-align: right !important;">${order.inventoryNotes || 'تمديدات، صيانة دورية، وفحص كامل للأنظمة المعتمدة.'}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <div style="display: flex; justify-content: flex-start; margin-bottom: 60px; direction: rtl !important;">
                        <div style="width: 340px; background-color: #f0fdf4; border: 2px solid #bbf7d0; border-radius: 12px; padding: 14px; text-align: right !important;">
                            <div style="font-size: 14px; font-weight: 900; color: #166534; text-align: right !important; display: block;">
                                <span style="display: inline-block; width: 160px;">المبلغ الإجمالي المستحق:</span>
                                <span style="font-size: 18px; font-family: 'Cairo', sans-serif; font-weight: 900; color: #059669; display: inline-block;">${order.amount} ريال سعودي</span>
                            </div>
                        </div>
                    </div>
                </div>`;
        }
    });
    
    window.print();
    setTimeout(() => { printArea.classList.add('hidden'); }, 500);
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

function logOutSystemAccountForce() {
    localStorage.removeItem('eagle_tech_active_user_session');
    currentActiveUser = null;
    document.getElementById('loginPageGate').style.display = 'flex';
    window.location.reload();
}

window.addEventListener('DOMContentLoaded', () => { initFirebaseOrdersListener(); });