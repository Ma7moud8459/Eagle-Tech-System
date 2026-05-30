// 🦅 محرك إدارة الأسطول والفنيين وتوثيق الجودة الميدانية - Eagle Tech v2.6 [cite: 1, 5]

let globalTechnicians = [
    { id: 201, name: "عبدالله الزهراني", email: "abdullah@eagle.com", phone: "8901 567 56 966+", role: "مدير", rate: "96%", total: 51, done: 49, status: "في مهمة", initials: "AA", color: "bg-purple-600", collected: 8500, paidToAdmin: 7000 },
    { id: 202, name: "سالم البلوي", email: "salem@eagle.com", phone: "7890 456 54 966+", role: "فني", rate: "95%", total: 19, done: 18, status: "غير متاح", initials: "SA", color: "bg-amber-500", collected: 4200, paidToAdmin: 4200 },
    { id: 203, name: "خالد الرشيد", email: "khaled@eagle.com", phone: "6789 345 50 971+", role: "فني", rate: "93%", total: 28, done: 26, status: "متاح", initials: "KA", color: "bg-emerald-500", collected: 6100, paidToAdmin: 5000 },
    { id: 204, name: "محمود", email: "mohamed@eagle.com", phone: "5678 234 55 966+", role: "فني", rate: "94%", total: 35, done: 33, status: "متاح", initials: "MA", color: "bg-pink-500", collected: 12400, paidToAdmin: 9000 },
    { id: 205, name: "أحمد السيد", email: "ahmed@eagle.com", phone: "4567 123 50 966+", role: "فني", rate: "90%", total: 42, done: 38, status: "في مهمة", initials: "AA", color: "bg-blue-900", collected: 15300, paidToAdmin: 14000 },
    { id: 206, name: "فيصل الشهري", email: "faisal@eagle.com", phone: "9012 678 99 965+", role: "فني", rate: "88%", total: 24, done: 21, status: "متاح", initials: "FA", color: "bg-teal-500", collected: 38500, paidToAdmin: 38500 }
]; // [cite: 84, 85, 86]

let currentActiveUser = globalTechnicians[0]; // [cite: 87]
let globalOrders = [];
let idCounter = 1001; // [cite: 87]
let currentSelectedFilter = 'الكل'; // [cite: 88]
let lineChartInstance = null;
let pieChartInstance = null;
let analyticsLineInstance = null;
let analyticsBarInstance = null;

function switchTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active')); // [cite: 89]
    const target = document.getElementById(`tab-${tabId}`);
    if(target) target.classList.add('active'); // [cite: 90]
    
    document.querySelectorAll('nav button').forEach(btn => btn.classList.remove('bg-slate-800', 'text-white')); // [cite: 90]
    const navBtn = document.getElementById(`nav-${tabId}`);
    if(navBtn) navBtn.classList.add('bg-slate-800', 'text-white'); // [cite: 90]
    
    if(tabId === 'dashboard') { renderDashboardCharts(); } // [cite: 90]
    if(tabId === 'analytics') { renderAdvancedAnalyticsCharts(); } // [cite: 91]
}

function toggleSidebarSettingsModal(open) {
    const modal = document.getElementById('addTechModal');
    if(open) modal.classList.remove('hidden'); else modal.classList.add('hidden'); // [cite: 93]
}

function toggleOrderModal(open) {
    const modal = document.getElementById('addOrderModal');
    if(open) modal.classList.remove('hidden'); else modal.classList.add('hidden'); // [cite: 94]
}

function toggleInstallationUploadModal(open) {
    const modal = document.getElementById('closeOrderInstallationModal');
    if(modal) { if(open) modal.classList.remove('hidden'); else modal.classList.add('hidden'); }
}

function openNewOrderModal() {
    updateTechSelectOptions(); // [cite: 94]
    toggleOrderModal(true); // [cite: 95]
}

function updateTechSelectOptions() {
    const select = document.getElementById('moTech');
    if(!select) return; // [cite: 96]
    select.innerHTML = '';
    globalTechnicians.forEach(t => {
        select.innerHTML += `<option value="${t.name}">${t.name}</option>`;
    }); // [cite: 96]
}

function settleTechWallet(techId) {
    const tech = globalTechnicians.find(t => t.id === techId);
    if(tech) { // [cite: 97]
        const amountDue = tech.collected - tech.paidToAdmin; // [cite: 98]
        if(amountDue <= 0) return alert("الحساب المالي للفني مستقر ولا توجد مبالغ متبقية بذمته!"); // [cite: 99]
        const confirmSettle = confirm(`هل تؤكد استلام مبلغ ${amountDue} ريال كاش من ${tech.name} وتسويته بالخزينة الكلية؟`); // [cite: 100]
        if(confirmSettle) {
            tech.paidToAdmin += amountDue; // [cite: 101]
            renderSystem(); // [cite: 102]
            alert("تمت التسوية المالية وتحديث عهدة الفني الحركية بنجاح."); // [cite: 102]
        }
    }
}

function clearAllTechWallets() {
    if(confirm("هل أنت متأكد من تصفير كافة الحسابات المالية والتحصيلات للعهد؟")) {
        globalTechnicians.forEach(t => { t.collected = 0; t.paidToAdmin = 0; }); // [cite: 102]
        renderSystem(); // [cite: 103]
    }
}

document.getElementById('modalTechForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const name = document.getElementById('mTechName').value; // [cite: 103]
    const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0,2); // [cite: 103]
    globalTechnicians.push({
        id: Date.now(), // [cite: 104]
        name: name, // [cite: 104]
        email: document.getElementById('mTechEmail').value, // [cite: 104]
        phone: document.getElementById('mTechPhone').value, // [cite: 104]
        role: "فني", // [cite: 104]
        rate: "100%", // [cite: 104]
        total: 0, done: 0, // [cite: 105]
        status: "متاح", // [cite: 105]
        initials: initials, // [cite: 105]
        color: "bg-pink-600", // [cite: 105]
        collected: 0, // [cite: 105]
        paidToAdmin: 0 // [cite: 105]
    });
    document.getElementById('modalTechForm').reset(); // [cite: 106]
    toggleSidebarSettingsModal(false); // [cite: 106]
    populateUserSimulatorSelect(); // [cite: 106]
    renderSystem(); // [cite: 107]
    alert("تم تسجيل حساب الفني بنجاح وتحديث قائمة الأسطول."); // [cite: 107]
});

document.getElementById('modalOrderForm').addEventListener('submit', function(e) {
    e.preventDefault();
    try {
        const amount = parseFloat(document.getElementById('moAmount').value); // [cite: 108]
        const assignedTechName = document.getElementById('moTech').value; // [cite: 108]
        const locationUrl = document.getElementById('moLocationUrl').value; // [cite: 109]
        
        const automaticDateTime = new Date().toLocaleString('ar-EG', { 
            year: 'numeric', month: 'numeric', day: 'numeric', 
            hour: '2-digit', minute: '2-digit', hour12: true 
        }); // [cite: 109, 110, 111]
        
        globalOrders.unshift({
            id: idCounter++, // [cite: 111]
            customerName: document.getElementById('moCustName').value, // [cite: 111]
            phone: document.getElementById('moCustPhone').value, // [cite: 112]
            address: document.getElementById('moAddress').value, // [cite: 112]
            locationUrl: locationUrl, // [cite: 112]
            amount: amount, // [cite: 112]
            techName: assignedTechName, // [cite: 112]
            details: document.getElementById('moDetails').value, // [cite: 113]
            status: "في الانتظار", // [cite: 113]
            time: automaticDateTime, // [cite: 113]
            installationPhotosArray: []
        });
        const tech = globalTechnicians.find(t => t.name === assignedTechName);
        if(tech) {
            tech.total += 1; // [cite: 114]
            tech.collected += amount; // [cite: 115]
        }

        document.getElementById('modalOrderForm').reset(); // [cite: 115]
        toggleOrderModal(false); // [cite: 116]
        renderSystem(); // [cite: 116]
        alert("تم حفظ الطلب وتوثيق وقت الاستقبال تلقائياً بنجاح."); // [cite: 116]
    } catch(err) {
        renderSystem(); // [cite: 118]
    }
});

// فتح نافذة توثيق وإغلاق التركيبات برفع ملفات الجوال دفعة واحدة للفني
function triggerInstallationCloseWorkflow(orderId) {
    document.getElementById('installationUploadForm').reset();
    document.getElementById('uploadTargetOrderId').value = orderId;
    toggleInstallationUploadModal(true);
}

document.getElementById('installationUploadForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const orderId = document.getElementById('uploadTargetOrderId').value;
    const commentsText = document.getElementById('uploadTechComments').value.trim();
    const filesInput = document.getElementById('installationPhotosInput');
    
    const order = globalOrders.find(o => o.id.toString() === orderId.toString());
    if(!order) return;

    let base64ImagesArray = [];
    const files = filesInput.files;

    const finalizeUpload = (imgArray) => {
        order.status = "تم التركيب";
        order.reason = commentsText || "تم التركيب والحمد لله الميداني";
        if(imgArray.length > 0) { order.installationPhotosArray = imgArray; }

        const tech = globalTechnicians.find(t => t.name === order.techName);
        if(tech) tech.done += 1;

        toggleInstallationUploadModal(false);
        renderSystem();
        alert("🟢 تم حفظ مستندات جودة التركيبات ورفع ملفات الصور بنجاح، وإغلاق الأوردر!");
    };

    if (files.length > 0) {
        let readCount = 0;
        for (let i = 0; i < files.length; i++) {
            let reader = new FileReader();
            reader.onload = function(event) {
                base64ImagesArray.push(event.target.result);
                readCount++;
                if (readCount === files.length) { finalizeUpload(base64ImagesArray); }
            };
            reader.readAsDataURL(files[i]);
        }
    } else {
        finalizeUpload([]);
    }
});

function updateOrderStatusDirectly(orderId, nextStatus) {
    if(nextStatus === 'تم التركيب') {
        triggerInstallationCloseWorkflow(orderId);
        return;
    }
    const order = globalOrders.find(o => o.id === orderId);
    if(order) { // [cite: 119]
        order.status = nextStatus; // [cite: 120]
        renderSystem(); // [cite: 122]
    }
}

function filterOrdersByStatus(status) {
    currentSelectedFilter = status; // [cite: 123]
    renderSystem(); // [cite: 124]
}

function triggerGlobalSearch() {
    renderSystem(); // [cite: 124]
}

function changeActiveUser(userId) {
    currentActiveUser = globalTechnicians.find(t => t.id == userId); // [cite: 125]
    renderSystem(); // [cite: 126]
}

function populateUserSimulatorSelect() {
    const select = document.getElementById('userSimulator');
    if(!select) return; // [cite: 126]
    select.innerHTML = '';
    globalTechnicians.forEach(t => {
        select.innerHTML += `<option value="${t.id}">${t.name} (${t.role})</option>`;
    }); // [cite: 127]
}

function renderSystem() {
    const searchQuery = document.getElementById('globalSearch').value.toLowerCase(); // [cite: 128]
    let filteredOrders = globalOrders; // [cite: 129]
    if(currentActiveUser.role === 'فني') {
        filteredOrders = filteredOrders.filter(o => o.techName === currentActiveUser.name); // [cite: 129]
    }

    if(currentSelectedFilter !== 'الكل') {
        filteredOrders = filteredOrders.filter(o => o.status === currentSelectedFilter); // [cite: 130]
    }

    if(searchQuery) {
        filteredOrders = filteredOrders.filter(o => o.customerName.toLowerCase().includes(searchQuery) || o.techName.toLowerCase().includes(searchQuery) || o.id.toString().includes(searchQuery)); // [cite: 131]
    }

    document.getElementById('dash-total').innerText = filteredOrders.length; // [cite: 132]
    document.getElementById('dash-progress').innerText = filteredOrders.filter(o => o.status === 'في الانتظار').length; // [cite: 133]
    document.getElementById('dash-success').innerText = filteredOrders.filter(o => o.status === 'تم التركيب').length; // [cite: 133]
    document.getElementById('dash-cancel').innerText = filteredOrders.filter(o => o.status === 'رفض التركيب').length; // [cite: 134]
    document.getElementById('badge-orders-count').innerText = globalOrders.length; // [cite: 134]

    const latestTable = document.getElementById('dashLatestOrdersTable');
    if(latestTable) { // [cite: 135]
        latestTable.innerHTML = ''; // [cite: 136]
        filteredOrders.slice(0, 5).forEach(o => { // [cite: 137]
            let bStyle = o.status === 'تم التركيب' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-amber-50 text-amber-700 border-amber-200'; // [cite: 137]
            latestTable.innerHTML += `
                <tr class="border-b border-slate-100 hover:bg-slate-50">
                    <td class="p-3 font-mono font-bold text-blue-900">#ORD-${o.id}</td>
                    <td class="p-3 font-bold">${o.customerName}</td>
                    <td class="p-3"><span class="px-2 py-0.5 rounded border text-[10px] font-bold ${bStyle}">${o.status}</span></td>
                    <td class="p-3 font-medium">👤 ${o.techName}</td>
                </tr>`; // [cite: 138, 139]
        });
    }

    // 📱 حقن وبناء شريط تمرير كروت الجوال المحدثة لتظهر كشريط متكامل متتالي مريح للعين
    const mobileContainer = document.getElementById('mainOrdersCardsContainerMobile');
    if(mobileContainer) {
        mobileContainer.innerHTML = '';
        filteredOrders.forEach(o => {
            let badge = o.status === 'تم التركيب' ? "bg-green-50 text-green-700 border-green-200" : "bg-blue-50 text-blue-700 border-blue-200";
            if (o.status === 'رفض التركيب') badge = "bg-red-50 text-red-700 border-red-200";
            
            let locBtn = o.locationUrl ? `<a href="${o.locationUrl}" target="_blank" class="text-[11px] text-blue-600 bg-blue-50 border border-blue-200 px-3 py-1 rounded-lg font-bold block text-center mt-1">📍 فتح لوكيشن جوجل ماب العميل</a>` : '';
            
            mobileContainer.innerHTML += `
                <div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3 text-right relative">
                    <div class="flex justify-between items-start border-b pb-2">
                        <div><span class="text-[10px] bg-slate-900 text-white font-mono px-2 py-0.5 rounded font-bold">#ORD-${o.id}</span><p class="text-[9px] text-slate-400 mt-1">${o.time}</p></div>
                        <span class="text-[10px] px-2 py-0.5 rounded border font-black ${badge}">${o.status}</span>
                    </div>
                    <div class="text-xs space-y-1">
                        <p class="font-black text-slate-900">👤 العميل: ${o.customerName}</p>
                        <p class="text-slate-500 font-bold">📞 الجوال: <a href="tel:${o.phone}" class="text-pink-500 underline">${o.phone}</a></p>
                        <p class="text-slate-600">📍 العنوان: ${o.address}</p>
                        <div class="bg-slate-50 p-2 border rounded-xl text-[11px] text-slate-700 font-medium">${o.details}</div>
                    </div>
                    <div class="flex justify-between items-center bg-slate-50 p-2 border rounded-xl text-xs"><span class="font-bold text-slate-400">الحساب الإجمالي:</span><span class="font-black text-emerald-600">${o.amount} ريال</span></div>
                    ${locBtn}
                    <div class="flex gap-1.5 pt-2 border-t">
                        <button onclick="updateOrderStatusDirectly(${o.id}, 'جاري التركيب')" class="flex-1 bg-blue-600 text-white font-black py-2 rounded-xl text-xs">🚚 جاري التركيب</button>
                        <button onclick="updateOrderStatusDirectly(${o.id}, 'تم التركيب')" class="flex-1 bg-emerald-600 text-white font-black py-2 rounded-xl text-xs">✅ تم التركيب</button>
                        <button onclick="updateOrderStatusDirectly(${o.id}, 'رفض التركيب')" class="flex-1 bg-rose-600 text-white font-bold py-2 rounded-xl text-xs">🛑 رفض</button>
                    </div>
                </div>`;
        });
    }

    const mainOrdersTable = document.getElementById('mainOrdersTableBody');
    if(mainOrdersTable) { // [cite: 140]
        mainOrdersTable.innerHTML = ''; // [cite: 141]
        if(filteredOrders.length === 0) {
            mainOrdersTable.innerHTML = `<tr><td colspan="8" class="p-8 text-center text-slate-400 font-bold">لا توجد أوردرات مطابقة للبحث أو الفلترة حالياً.</td></tr>`; // [cite: 142]
        }
        filteredOrders.forEach(o => { // [cite: 143]
            let badge = "bg-blue-50 text-blue-700 border-blue-200"; // [cite: 143]
            if (o.status === 'تم التركيب') badge = "bg-green-50 text-green-700 border-green-200"; // [cite: 143]
            if (o.status === 'رفض التركيب') badge = "bg-red-50 text-red-700 border-red-200"; // [cite: 143, 144]
            
            let locationBtn = o.locationUrl ? `<a href="${o.locationUrl}" target="_blank" class="mr-1 text-[10px] text-blue-600 bg-blue-50 border border-blue-200 px-1.5 py-0.5 rounded font-bold hover:underline">📍 الخريطة</a>` : ''; // [cite: 144]
            
            mainOrdersTable.innerHTML += `
                <tr class="border-b border-slate-100 hover:bg-slate-50 font-medium">
                    <td class="p-4 text-center"><input type="checkbox" class="order-row-checkbox" data-id="${o.id}"></td>
                    <td class="p-4 font-mono font-bold text-slate-900">
                        <p>ORD-${o.id}</p>
                        <p class="text-[9px] text-slate-400 font-sans font-normal mt-0.5">${o.time}</p>
                    </td>
                    <td class="p-4">
                        <p class="font-bold text-slate-900">${o.customerName}</p>
                        <p class="text-[10px] text-slate-400">${o.phone}</p>
                    </td>
                    <td class="p-4 text-slate-500">
                        <span>${o.address}</span>
                        ${locationBtn}
                    </td>
                    <td class="p-4">
                        <p class="text-slate-800 font-bold">${o.amount} ريال</p>
                        <p class="text-[10px] text-slate-400 truncate max-w-[150px]">${o.details}</p>
                    </td>
                    <td class="p-4"><span class="px-2 py-0.5 border text-[10px] rounded-full font-bold ${badge}">${o.status}</span></td>
                    <td class="p-4 font-bold text-slate-700">👤 ${o.techName}</td>
                    <td class="p-4 text-center">
                        <div class="flex gap-1 justify-center">
                            <button onclick="updateOrderStatusDirectly(${o.id}, 'تم التركيب')" class="bg-emerald-600 text-white text-[10px] px-2 py-1 rounded font-bold shadow-sm">✅ تم</button>
                            <button onclick="updateOrderStatusDirectly(${o.id}, 'رفض التركيب')" class="bg-rose-600 text-white text-[10px] px-2 py-1 rounded font-bold shadow-sm">🛑 رفض</button>
                        </div>
                    </td>
                </tr>`; // [cite: 145, 146, 147, 148, 149, 150, 151, 152, 153]
        });
    }

    const cardsGrid = document.getElementById('techCardsGrid');
    if(cardsGrid) { // [cite: 154]
        cardsGrid.innerHTML = ''; // [cite: 155]
        globalTechnicians.forEach(t => { // [cite: 156]
            let sBadge = t.status === 'متاح' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-pink-50 text-pink-600 border-pink-200'; // [cite: 156]
            if(t.status === 'غير متاح') sBadge = 'bg-slate-100 text-slate-500 border-slate-200'; // [cite: 156]
            
            cardsGrid.innerHTML += `
                <div class="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex flex-col items-center text-center space-y-3 relative hover:border-pink-400 transition-all">
                    <div class="w-12 h-12 rounded-full ${t.color} text-white font-black text-sm flex items-center justify-center shadow-inner">${t.initials}</div>
                    <div>
                        <h4 class="font-black text-sm text-slate-900">${t.name}</h4>
                        <p class="text-[10px] font-mono text-slate-400 mt-0.5">${t.phone}</p>
                    </div>
                    <div class="grid grid-cols-3 gap-2 w-full pt-2 border-t border-slate-100 text-center">
                        <div><p class="text-xs font-black text-slate-800">${t.total}</p><p class="text-[9px] text-slate-400 font-bold">طلبات</p></div>
                        <div><p class="text-xs font-black text-emerald-600">${t.done}</p><p class="text-[9px] text-slate-400 font-bold">منجز</p></div>
                        <div><p class="text-xs font-black text-pink-500">${t.rate}</p><p class="text-[9px] text-slate-400 font-bold">Rate</p></div>
                    </div>
                    <span class="text-[9px] font-bold px-3 py-0.5 rounded-full border ${sBadge}">● ${t.status}</span>
                </div>`; // [cite: 157, 158, 159, 160, 161]
        });
    }

    let totalRev = 0; let totalColl = 0; let totalPend = 0; // [cite: 162, 163]
    const finTable = document.getElementById('financialTechTableBody');
    if(finTable) { // [cite: 163]
        finTable.innerHTML = ''; // [cite: 164]
        globalTechnicians.forEach(t => { // [cite: 165]
            const remainingDue = t.collected - t.paidToAdmin; // [cite: 165]
            totalRev += t.collected; // [cite: 165]
            totalColl += t.paidToAdmin; // [cite: 165]
            totalPend += remainingDue; // [cite: 165]

            finTable.innerHTML += `
                <tr class="border-b border-slate-100 hover:bg-slate-50 font-medium">
                    <td class="p-3 font-bold text-slate-900">👤 ${t.name} <span class="text-[10px] bg-slate-100 text-slate-500 font-bold px-1.5 py-0.5 rounded ml-1">${t.role}</span></td>
                    <td class="p-3 font-black text-slate-800">${t.collected.toLocaleString()} ريال</td>
                    <td class="p-3 font-black text-emerald-600">${t.paidToAdmin.toLocaleString()} ريال</td>
                    <td class="p-3 font-black ${remainingDue > 0 ? 'text-rose-600 bg-rose-50/50 rounded-lg' : 'text-slate-400'}">${remainingDue.toLocaleString()} ريال</td>
                    <td class="p-3 text-center">
                        <button onclick="settleTechWallet(${t.id})" class="bg-slate-900 text-white font-bold text-[10px] px-3 py-1.5 rounded-lg hover:bg-pink-500 transition-all shadow-sm">💵 تسوية الحساب الكاش</button>
                    </td>
                </tr>`; // [cite: 166, 167, 168, 169]
        });
        if(document.getElementById('fin-total-revenue')) document.getElementById('fin-total-revenue').innerText = totalRev.toLocaleString() + " ريال"; // [cite: 169]
        if(document.getElementById('fin-total-collected')) document.getElementById('fin-total-collected').innerText = totalColl.toLocaleString() + " ريال"; // [cite: 170]
        if(document.getElementById('fin-total-pending')) document.getElementById('fin-total-pending').innerText = totalPend.toLocaleString() + " ريال"; // [cite: 170]
    }

    const trackingList = document.getElementById('trackingTechList');
    if(trackingList) { // [cite: 171]
        trackingList.innerHTML = ''; // [cite: 172]
        globalTechnicians.slice(0, 4).forEach(t => { // [cite: 173]
            let taskBadge = t.status === 'في مهمة' ? 'bg-pink-500' : 'bg-emerald-500'; // [cite: 173]
            trackingList.innerHTML += `
                <div class="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs font-bold">
                    <div class="flex items-center gap-2">
                        <span class="w-2 h-2 rounded-full ${taskBadge}"></span>
                        <p class="text-slate-800">${t.name}</p>
                    </div>
                    <span class="text-[10px] text-slate-400">${t.status}</span>
                </div>`; // [cite: 174, 175]
        });
    }
    renderDashboardCharts(); // [cite: 176]
}

function renderDashboardCharts() {
    const ctxLine = document.getElementById('dashLineChart');
    if(ctxLine) { // [cite: 177]
        if(lineChartInstance) lineChartInstance.destroy(); // [cite: 178]
        lineChartInstance = new Chart(ctxLine.getContext('2d'), {
            type: 'bar',
            data: {
                labels: ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'],
                datasets: [{ label: 'التوصيلات اليومية والمهمات المنجزة', data: [170, 195, 210, 185, 230, 240, 247], backgroundColor: '#1e3a8a', borderRadius: 8 }] // [cite: 179, 180]
            },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
        });
    }

    const ctxPie = document.getElementById('dashPieChart');
    if(ctxPie) { // [cite: 181]
        if(pieChartInstance) pieChartInstance.destroy(); // [cite: 182]
        const progress = globalOrders.filter(o => o.status === 'في الانتظار').length || 15; // [cite: 183]
        const success = globalOrders.filter(o => o.status === 'تم التركيب').length || 30; // [cite: 184]
        const cancel = globalOrders.filter(o => o.status === 'رفض التركيب').length || 5; // [cite: 185]
        pieChartInstance = new Chart(ctxPie.getContext('2d'), {
            type: 'doughnut',
            data: {
                labels: ['منجز', 'قيد التنفيذ', 'مشاكل وبلاغات'],
                datasets: [{ data: [success, progress, cancel], backgroundColor: ['#10b981', '#f59e0b', '#ef4444'] }] // [cite: 186, 187]
            },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 10 } } } } }
        });
    }
}

function renderAdvancedAnalyticsCharts() {
    const ctxAnalLine = document.getElementById('analyticsLineChart');
    if(ctxAnalLine) { // [cite: 188]
        if(analyticsLineInstance) analyticsLineInstance.destroy(); // [cite: 189]
        analyticsLineInstance = new Chart(ctxAnalLine.getContext('2d'), {
            type: 'line',
            data: {
                labels: ['1 مايو', '5 مايو', '10 مايو', '15 مايو', '20 مايو', '25 مايو', '30 مايو'],
                datasets: [{ label: 'معدل الإنتاجية التصاعدي', data: [120, 150, 140, 190, 230, 260, 247], borderColor: '#db2777', backgroundColor: 'rgba(219, 39, 119, 0.1)', fill: true, tension: 0.4 }] // [cite: 190, 191]
            },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
        });
    }

    const ctxAnalBar = document.getElementById('analyticsCityBarChart');
    if(ctxAnalBar) { // [cite: 192]
        if(analyticsBarInstance) analyticsBarInstance.destroy(); // [cite: 193]
        analyticsBarInstance = new Chart(ctxAnalBar.getContext('2d'), {
            type: 'bar',
            data: {
                labels: ['الرياض', 'جدة', 'الدمام', 'الخبر', 'مكة'],
                datasets: [{ label: 'الأوردرات لكل مدينة', data: [520, 380, 290, 210, 140], backgroundColor: ['#0f172a', '#db2777', '#10b981', '#f59e0b', '#6366f1'] }] // [cite: 194, 195]
            },
            options: { indexAxis: 'y', responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
        });
    }
}

// 🖨️ بناء الفاتورة والـ PDF المطور الاحترافي المنحاز كلياً لليمين 100% ليُرسل للعميل
function printSelectedOrdersInvoices() {
    const checkedBoxes = document.querySelectorAll('.order-row-checkbox:checked');
    if(checkedBoxes.length === 0) { alert("⚠️ يرجى تحديد أوردر واحد على الأقل من الجدول لطباعة فاتورته!"); return; }
    
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
                            <p style="font-size: 11px; color: #64748b; font-weight: bold; margin: 0; text-align: right !important;">للانظمة الأمنية، الكاميرات، وشبكات الاتصال الميدانية</p>
                        </div>
                        <div style="text-align: left !important; width: 40%; direction: rtl !important;">
                            <span style="font-size: 12px; background-color: #f1f5f9; color: #0f172a; font-weight: 900; padding: 6px 12px; border-radius: 8px; border: 1px solid #e2e8f0; display: inline-block; text-align: right !important;">رقم الفاتورة: ORD-${order.id}</span>
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
                                    <td style="padding: 14px; border: 1px solid #e2e8f0; vertical-align: top; font-weight: bold; color: #4338ca; line-height: 1.6; background-color: #fcfdf7; text-align: right !important;">تمديدات وكاميرات صيانة معتمدة بالموقع.</td>
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
                            <p style="font-size: 10px; color: #15803d; margin-top: 6px; margin-bottom: 0; text-align: right !important; font-weight: bold;">* الفاتورة معتمدة وتشمل أجور التركيب والبرمجة والضمان الميداني.</p>
                        </div>
                    </div>

                    <div style="position: absolute; bottom: 40px; left: 32px; right: 32px; display: flex; flex-direction: row !important; justify-content: space-between; align-items: center; font-size: 12px; color: #475569; border-top: 1px dashed #cbd5e1; padding-top: 20px; direction: rtl !important;">
                        <div style="text-align: right !important; width: 50%;">
                            <p style="margin: 0; font-weight: bold; text-align: right !important;">👤 فني التركيب المعتمد:</p>
                            <p style="margin: 4px 0 0 0; font-weight: 900; color: #0f172a; font-size: 13px; text-align: right !important;">${order.techName}</p>
                            <div style="margin-top: 12px; width: 140px; border-bottom: 1px solid #94a3b8; height: 20px; text-align: right !important;"></div>
                            <span style="font-size: 9px; color: #94a3b8; display: block; margin-top: 2px; text-align: right !important;">التوقيع الميداني الخطّي</span>
                        </div>
                        <div style="text-align: left !important; width: 50%;">
                            <div style="width: 110px; height: 110px; border: 2px dashed #cbd5e1; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #cbd5e1; font-size: 10px; font-weight: bold; margin-right: auto; margin-left: 0;">ختم المؤسسة الرسمي</div>
                        </div>
                    </div>
                </div>`;
        }
    });
    
    window.print();
    setTimeout(() => { printArea.classList.add('hidden'); }, 500);
}

function seedSystemDataData() {
    const mockNames = ["خالد العتيبي", "فيصل الدوسري", "منصور العنزي", "ماجد الشمري", "سلطان القحطاني"]; // [cite: 196]
    const mockAddresses = ["الدمام - حي النزهة", "الخبر - حي الجسر", "الرياض - العليا", "الدمام - حي البادية"]; // [cite: 197]
    const mockTechs = globalTechnicians.map(t => t.name); // [cite: 198]
    const mockStatuses = ["تم التركيب", "في الانتظار", "تم التركيب", "رفض التركيب"]; // [cite: 198]
    const defaultDate = new Date().toLocaleDateString('ar-EG', { year: 'numeric', month: 'numeric', day: 'numeric' }); // [cite: 199]
    for(let i=0; i<50; i++) { // [cite: 200]
        const amount = Math.floor(Math.random() * 2500) + 1200; // [cite: 200]
        const assignedTech = mockTechs[Math.floor(Math.random() * mockTechs.length)]; // [cite: 201]
        const status = mockStatuses[Math.floor(Math.random() * mockStatuses.length)]; // [cite: 201]
        globalOrders.push({ // [cite: 202]
            id: idCounter++, // [cite: 202]
            customerName: mockNames[Math.floor(Math.random() * mockNames.length)] + " (عميل تجريبي)", // [cite: 202]
            phone: "05" + Math.floor(10000000 + Math.random() * 90000000), // [cite: 202]
            address: mockAddresses[Math.floor(Math.random() * mockAddresses.length)], // [cite: 202]
            locationUrl: "https://maps.google.com", // [cite: 203]
            amount: amount, // [cite: 203]
            techName: assignedTech, // [cite: 203]
            details: "تأمين كاميرات مراقبة وتمديد ألياف مع اختبار كفاءة الاتصال والربط بسيرفر الشركة.", // [cite: 203]
            status: status, // [cite: 204]
            time: `${defaultDate} - ${Math.floor(Math.random() * 12) + 1}:00 م` // [cite: 204]
        });
        const tech = globalTechnicians.find(t => t.name === assignedTech);
        if(tech) {
            tech.total += 1; // [cite: 205]
            if(status === 'تم التركيب') {
                tech.done += 1; // [cite: 206]
            }
        }
    }
}

function exportOrdersToExcel() {
    const dataToExport = globalOrders.map(o => ({ "رقم الأوردر": `ORD-${o.id}`, "اسم العميل": o.customerName, "المسار / العنوان": o.address, "المبلغ مالي": o.amount, "الفني المكلف": o.techName, "الحالة": o.status })); // [cite: 207]
    const ws = XLSX.utils.json_to_sheet(dataToExport); const wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, ws, "الطلبات"); XLSX.writeFile(wb, "كشف_طلبات_إيجل_تيك.xlsx"); // [cite: 208]
}

function toggleSelectAllOrders() {
    const master = document.getElementById('selectAllCheckbox').checked;
    document.querySelectorAll('.order-row-checkbox').forEach(cb => cb.checked = master);
}

function toggleSelectAllOrdersMobile() {
    const masterMobile = document.getElementById('selectAllCheckboxMobile').checked;
    document.querySelectorAll('.order-row-checkbox').forEach(cb => cb.checked = masterMobile);
}

window.addEventListener('DOMContentLoaded', () => {
    seedSystemDataData(); // [cite: 209]
    populateUserSimulatorSelect(); // [cite: 209]
    renderSystem(); // [cite: 209]
    switchTab('dashboard'); // [cite: 209]
});
