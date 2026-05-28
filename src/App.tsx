import React, { useState, useEffect, useMemo } from 'react';
import { ShoppingBag, DollarSign, User, TrendingUp, Search, RefreshCw, Loader2 } from 'lucide-react';
import { Order, MenuItem, Toast } from './types';
import ToastContainer from './components/ToastContainer';
import OrderForm from './components/OrderForm';
import OrderItem from './components/OrderItem';

// API Google Apps Script Endpoint Web App
const API_URL = "https://script.google.com/macros/s/AKfycby4uKE67C0iey0Jt0BefVIIKoZpPYmHEy-hS9idAzRPAwXXy2SmjpLjhM36HA9RUt74/exec";

// Premium Mock menu as a perfect fallback if the API hasn't loaded or is empty.
const DEFAULT_MENU: MenuItem[] = [
  { name: "珍珠厚鮮牛奶茶", price: 65, category: "鮮奶茶類", description: "香濃黑糖手作珍珠，搭配頂級特濃光泉鮮乳，濃醇回甘。" },
  { name: "芋頭椰果西米露", price: 70, category: "暖胃甜品類", description: "手搗濃密大甲芋頭泥，完美搭配 Q 彈椰果與香滑西米露。" },
  { name: "翡翠檸檬玉露", price: 55, category: "清爽鮮果茶", description: "黃金比例的新鮮現壓檸檬原汁，清透解膩的午茶爽口必備。" },
  { name: "古早味黑糖珍奶", price: 55, category: "濃厚奶茶類", description: "慢火熬烏黑糖蜜，裹勻滾熱珍珠，完美點綴經典英式紅茶底。" },
  { name: "茉香翠綠茶", price: 35, category: "經典原味茶", description: "特選新鮮茉莉花低溫多重慢薰，茶湯呈清漾碧玉色澤。" },
  { name: "嚴選四季青茶", price: 35, category: "經典原味茶", description: "香氣清爽高雅，入喉順口不澀，辦公室最耐喝的原茶推薦。" },
  { name: "百香雙Q綠茶", price: 60, category: "清爽鮮果茶", description: "新鮮百香果粒，驚喜加入脆口蘆薈與香軟椰果，雙倍咀嚼享受。" },
  { name: "芒果椰奶冰沙", price: 80, category: "清透冰沙類", description: "當季優鮮芒果泥，淋上椰奶與雪白香草奶蓋，熱烈夏天消暑巨星。" },
  { name: "芝芝可可燕麥奶", price: 75, category: "濃厚奶茶類", description: "特濃比利時黑可可融合優質燕麥乳，附上鹹甜芝士厚奶蓋。" }
];

export default function App() {
  // Core Web states
  const [orders, setOrders] = useState<Order[]>([]);
  const [menu, setMenu] = useState<MenuItem[]>(DEFAULT_MENU);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);
  
  // Form & Editing States
  const [formState, setFormState] = useState({
    name: "",
    drink: "",
    sugar: "半糖",
    ice: "少冰",
    quantity: 1,
    price: 0,
    totalPrice: 0
  });
  const [editOrderId, setEditOrderId] = useState<string | null>(null);

  // Filter / Search states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("全部");

  // Toast states
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Form input auto-persister for user convenience on reload
  useEffect(() => {
    const savedName = localStorage.getItem("boba_orderer_name");
    if (savedName) {
      setFormState(prev => ({ ...prev, name: savedName }));
    }
  }, []);

  // Notification handler
  const addToast = (message: string, type: 'success' | 'error' | 'info' = "info") => {
    const id = Date.now() + Math.random().toString(36).substring(2, 7);
    setToasts(prev => [...prev, { id, message, type }]);
    
    // Auto remove after 3.5s
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3500);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Get live orders list and standard dynamic menus
  const fetchData = async (isManual = false) => {
    setIsLoading(true);
    try {
      const resp = await fetch(API_URL);
      const resData = await resp.json();
      
      // Handle retrieved menu
      if (resData.menu && resData.menu.length > 0) {
        setMenu(resData.menu);
      } else {
        // Fallback menu when sheets don't exist
        setMenu(DEFAULT_MENU);
      }

      // Handle retrieved orders
      if (resData.orders) {
        setOrders(resData.orders);
      } else {
        setOrders([]);
      }

      if (isManual) {
        addToast("成功同步最新點單與菜單！", "success");
      }
    } catch (err) {
      console.error("API error", err);
      addToast("連線 Google Apps Script 失敗。已加載本地預載設定以保證順暢運作！", "info");
      // If API fails, ensure fallback menu is loaded
      setMenu(DEFAULT_MENU);
    } finally {
      setIsLoading(false);
    }
  };

  // Trigger on load
  useEffect(() => {
    fetchData();
  }, []);

  // Search and Categorization logic
  const menuCategories = useMemo(() => {
    const cats = new Set(menu.map(item => item.category));
    return ["全部", ...Array.from(cats).filter(Boolean)];
  }, [menu]);

  const filteredMenu = useMemo(() => {
    return menu.filter(item => {
      const matchesQuery = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesCat = selectedCategory === "全部" || item.category === selectedCategory;
      return matchesQuery && matchesCat;
    });
  }, [menu, searchQuery, selectedCategory]);

  // Form selection trigger from beverage card
  const handleSelectDrink = (bev: MenuItem) => {
    setFormState(prev => ({
      ...prev,
      drink: bev.name,
      price: bev.price,
      totalPrice: prev.quantity * bev.price
    }));
    addToast(`已載入飲品：${bev.name} (NT$ ${bev.price})`, "success");
  };

  // Statistics computation in real-time
  const statistics = useMemo(() => {
    const totalCups = orders.reduce((sum, o) => sum + (o.quantity || 0), 0);
    const totalAmount = orders.reduce((sum, o) => sum + (o.totalPrice || 0), 0);
    const uniqueNames = new Set(orders.map(o => o.name?.trim()).filter(Boolean));
    
    // Popular computation
    const popularity: Record<string, number> = {};
    orders.forEach(o => {
      if (o.drink) {
        popularity[o.drink] = (popularity[o.drink] || 0) + o.quantity;
      }
    });
    let hotDrinkName = "-";
    let hotDrinkCount = 0;
    Object.entries(popularity).forEach(([name, count]) => {
      if (count > hotDrinkCount) {
        hotDrinkName = name;
        hotDrinkCount = count;
      }
    });

    return {
      totalCups,
      totalAmount,
      peopleCount: uniqueNames.size,
      popularText: hotDrinkCount > 0 ? `${hotDrinkName} (${hotDrinkCount}杯)` : "無"
    };
  }, [orders]);

  // Form Submit Actions
  const handleFormSubmit = async () => {
    setIsSubmitting(true);
    
    // Save orderer name in localstorage
    localStorage.setItem("boba_orderer_name", formState.name.trim());

    const action = editOrderId ? "update" : "create";
    const payload = {
      action: action,
      data: {
        orderId: editOrderId,
        name: formState.name.trim(),
        drink: formState.drink,
        sugar: formState.sugar,
        ice: formState.ice,
        quantity: formState.quantity,
        totalPrice: formState.totalPrice
      }
    };

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "text/plain;charset=utf-8"
        },
        body: JSON.stringify(payload)
      });
      const result = await response.json();

      if (result.status === "success") {
        addToast(editOrderId ? "點單內容修改成功！" : "美味飲料已送出，快遞給工作表紀錄！", "success");
        // Clear state including current user name
        setFormState({
          name: "",
          drink: "",
          price: 0,
          totalPrice: 0,
          quantity: 1,
          sugar: "半糖",
          ice: "少冰"
        });
        setEditOrderId(null);
        // Fetch latest orders
        fetchData();
      } else {
        addToast(`GAS 錯誤: ${result.message}`, "error");
      }
    } catch (err) {
      console.error("Post error", err);
      addToast("連線後端錯誤。請檢查您的網路或確認 GAS 配額。", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Form Edit loader
  const handleEdit = (order: Order) => {
    const matched = menu.find(item => item.name === order.drink);
    const singlePrice = matched ? matched.price : Math.round(order.totalPrice / order.quantity);

    setEditOrderId(order.orderId);
    setFormState({
      name: order.name,
      drink: order.drink,
      sugar: order.sugar,
      ice: order.ice,
      quantity: order.quantity,
      price: singlePrice,
      totalPrice: order.totalPrice
    });
    
    addToast(`已載入 ${order.name} 於修改視窗`, "info");
    // Smooth scroll to form on small screens
    window.scrollTo({ top: 300, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditOrderId(null);
    setFormState(prev => ({
      ...prev,
      drink: "",
      price: 0,
      totalPrice: 0,
      quantity: 1,
      sugar: "半糖",
      ice: "少冰"
    }));
    addToast("已返回新建點單模式", "info");
  };

  // Form Delete item
  const handleDelete = async (orderId: string) => {
    setIsDeletingId(orderId);
    const payload = {
      action: "delete",
      data: { orderId }
    };

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "text/plain;charset=utf-8"
        },
        body: JSON.stringify(payload)
      });
      const result = await response.json();

      if (result.status === "success") {
        addToast("點單刪除成功！工作表已同步。", "success");
        fetchData();
        // If we were editing that specific deleted order, clear form
        if (editOrderId === orderId) {
          handleCancelEdit();
        }
      } else {
        addToast(`刪除失敗: ${result.message}`, "error");
      }
    } catch (err) {
      console.error("Delete error", err);
      addToast("連線後端錯誤。刪除作業未竟，請重試。", "error");
    } finally {
      setIsDeletingId(null);
    }
  };

  return (
    <div className="min-h-screen pb-16 relative overflow-x-hidden font-sans">
      {/* Decorative Geometric Clean Background Grid */}
      <div className="geo-grid fixed inset-0 z-0">
        <div className="geo-circle animate-pulse-subtle" style={{ left: '5%', top: '15%', width: '150px', height: '150px' }}></div>
        <div className="geo-circle animate-pulse-subtle" style={{ right: '8%', top: '35%', width: '220px', height: '220px' }}></div>
        <div className="geo-circle animate-pulse-subtle" style={{ left: '15%', bottom: '10%', width: '130px', height: '130px' }}></div>
        <div className="geo-circle animate-pulse-subtle" style={{ right: '20%', bottom: '15%', width: '180px', height: '180px' }}></div>
      </div>

      <div className="relative z-10">
        {/* Header section with brand and description */}
        <header className="bg-gradient-to-r from-matcha-700 via-matcha-600 to-matcha-800 text-white shadow-premium select-none">
          <div className="max-w-7xl mx-auto px-4 py-8 md:py-10">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              
              {/* Left Brand Area */}
              <div className="flex items-center gap-4 text-center md:text-left">
                <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/20 shadow-inner animate-bounce-slow flex items-center justify-center">
                  <div className="text-3xl text-matcha-100">🧋</div>
                </div>
                <div>
                  <h1 className="text-2xl md:text-3.5xl font-extrabold font-display tracking-tight text-white flex items-center gap-2 justify-center md:justify-start">
                    辦公室飲料揪團系統
                    <span className="text-stone-300 font-normal text-sm bg-stone-900/40 px-2.5 py-1 rounded-full hidden md:inline-block">
                      下午茶救星
                    </span>
                  </h1>
                  <p className="text-stone-200/95 text-xs md:text-sm font-medium mt-1.5 leading-relaxed tracking-wide">
                    凝聚辦公室的甜度小確幸！一鍵快速點單、Google Sheets 自動即時同步。
                  </p>
                </div>
              </div>

              {/* Right Actions Area */}
              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <span className="text-[10px] uppercase font-mono tracking-widest text-[#a3d1bb] block">
                    今日點單統計日
                  </span>
                  <span className="font-mono text-sm font-bold text-[#faf3e9] block mt-0.5">
                    {new Date().toISOString().split('T')[0]}
                  </span>
                </div>

                <button
                  onClick={() => fetchData(true)}
                  disabled={isLoading}
                  className="bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/15 px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all active:scale-95 text-white cursor-pointer"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <RefreshCw className="w-4 h-4" />
                  )}
                  {isLoading ? "載入中..." : "同步數據"}
                </button>
              </div>

            </div>
          </div>
        </header>

        {/* Main Application Interface */}
        <main className="max-w-7xl mx-auto px-4 mt-8">
          
          {/* Stats Cards Section */}
          <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {/* Stat 1: Total Cups */}
            <div className="bg-white rounded-xl p-4 md:p-5 border border-slate-200 shadow-card flex items-center gap-3.5 smooth-transition hover:translate-y-[-2px]">
              <div className="p-3 bg-matcha-50 text-matcha-600 rounded-xl flex items-center justify-center">
                <ShoppingBag className="w-5 h-5 md:w-6 md:h-6" />
              </div>
              <div>
                <span className="text-[10px] md:text-xs text-slate-400 font-bold block select-none">今日總杯數</span>
                <span className="text-lg md:text-2xl font-black text-slate-800 tracking-tight block mt-0.5">
                  {isLoading ? "---" : `${statistics.totalCups} 杯`}
                </span>
              </div>
            </div>

            {/* Stat 2: Total Amount */}
            <div className="bg-white rounded-xl p-4 md:p-5 border border-slate-200 shadow-card flex items-center gap-3.5 smooth-transition hover:translate-y-[-2px]">
              <div className="p-3 bg-boba-50 text-boba-500 rounded-xl flex items-center justify-center">
                <DollarSign className="w-5 h-5 md:w-6 md:h-6" />
              </div>
              <div>
                <span className="text-[10px] md:text-xs text-slate-400 font-bold block select-none">今日累積金額</span>
                <span className="text-lg md:text-2xl font-black text-slate-800 tracking-tight block mt-0.5">
                  {isLoading ? "---" : `NT$ ${statistics.totalAmount}`}
                </span>
              </div>
            </div>

            {/* Stat 3: Participants */}
            <div className="bg-white rounded-xl p-4 md:p-5 border border-slate-200 shadow-card flex items-center gap-3.5 smooth-transition hover:translate-y-[-2px]">
              <div className="p-3 bg-sky-50 text-sky-600 rounded-xl flex items-center justify-center">
                <User className="w-5 h-5 md:w-6 md:h-6" />
              </div>
              <div>
                <span className="text-[10px] md:text-xs text-slate-400 font-bold block select-none">點單參與人數</span>
                <span className="text-lg md:text-2xl font-black text-slate-800 tracking-tight block mt-0.5">
                  {isLoading ? "---" : `${statistics.peopleCount} 人`}
                </span>
              </div>
            </div>

            {/* Stat 4: Popular Drink */}
            <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-card flex items-center gap-3.5 smooth-transition hover:translate-y-[-2px] overflow-hidden">
              <div className="p-3 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-5 h-5 md:w-6 md:h-6" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[10px] md:text-xs text-slate-400 font-bold block select-none">最暢銷飲品</span>
                <span className="text-sm md:text-base font-black text-slate-800 tracking-tight block truncate mt-1">
                  {isLoading ? "---" : statistics.popularText}
                </span>
              </div>
            </div>
          </section>

          {/* Layout splits into Order Column and Menu/List Columns */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Side: Order Form (Cols span 4) */}
            <div className="lg:col-span-4 lg:sticky lg:top-6 space-y-4">
              <OrderForm
                menu={menu}
                formState={formState}
                setFormState={setFormState}
                isSubmitting={isSubmitting}
                onSubmit={handleFormSubmit}
                editOrderId={editOrderId}
                onCancelEdit={handleCancelEdit}
                addToast={addToast}
              />

              {/* Cute Tips Panel */}
              <div className="bg-white rounded-xl p-4.5 border border-slate-200 flex gap-3 text-slate-500 text-xs leading-relaxed select-none">
                <div className="text-lg mt-0.5">💡</div>
                <div>
                  <p className="font-bold text-slate-700">小提醒：</p>
                  <p className="mt-1">如果您不知道要選什麼，可以在右方的「飲料菜單」中挑選。直接點選飲料卡片，便能為您自動代入杯單資訊！</p>
                </div>
              </div>
            </div>

            {/* Right Side: Menu Grid & Active Orders (Cols span 8) */}
            <div className="lg:col-span-8 space-y-8">
              
              {/* Part 1: Menu Grid Segment */}
              <section className="bg-white rounded-2xl p-6 shadow-premium border border-slate-200">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 select-none">
                  <div className="flex items-center gap-2 pl-3 border-l-4 border-matcha-500">
                    <h2 className="text-lg font-bold tracking-tight text-slate-800">
                      🧋 飲料菜單 (快速點單)
                    </h2>
                  </div>

                  {/* Menu Search Field */}
                  <div className="relative w-full sm:w-64">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Search className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="搜尋飲料名稱、描述..."
                      className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-matcha-500 focus:bg-white smooth-transition text-slate-800 font-medium"
                    />
                  </div>
                </div>

                {/* Category Filter Chips */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-4 mb-4 select-none">
                  {menuCategories.map((cat) => {
                    const isSelected = selectedCategory === cat;
                    return (
                      <button
                        type="button"
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-bold leading-none tracking-wider transition-all sm:py-2 cursor-pointer ${
                          isSelected 
                            ? 'bg-matcha-500 text-white shadow-sm scale-102' 
                            : 'bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        {cat}
                      </button>
                    );
                  })}
                </div>

                {/* Loaded Menu Grid Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 max-h-[350px] overflow-y-auto pr-1.5">
                  {filteredMenu.length > 0 ? (
                    filteredMenu.map((bev) => {
                      const isSelected = formState.drink === bev.name;
                      return (
                        <div
                          key={bev.name}
                          onClick={() => handleSelectDrink(bev)}
                          className={`rounded-xl p-4 border text-left cursor-pointer smooth-transition group relative ${
                            isSelected 
                              ? 'bg-[#ecfdf5] border-matcha-400 shadow-sm ring-1 ring-matcha-300' 
                              : 'bg-slate-50 border-slate-200/60 hover:bg-slate-100/50 hover:border-slate-300'
                          }`}
                        >
                          <div className="flex justify-between items-start gap-2 mb-1.5">
                            <span className="font-extrabold text-slate-800 text-sm group-hover:text-matcha-700 smooth-transition">
                              {bev.name}
                            </span>
                            <span className="font-mono text-xs font-bold text-matcha-600 min-w-max">
                              ${bev.price}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 leading-relaxed font-medium line-clamp-2">
                            {bev.description || "辦公室高人氣招招牌，採用嚴選頂級調配茶味。"}
                          </p>
                          <div className="mt-2.5 flex items-center justify-between">
                            <span className="text-[9px] font-bold text-slate-450 uppercase tracking-widest px-1.5 py-0.5 bg-slate-100 rounded">
                              {bev.category || "人氣經典"}
                            </span>
                            <span className={`text-[10px] items-center gap-1 font-bold group-hover:flex ${isSelected ? 'flex text-matcha-600' : 'hidden text-slate-400'}`}>
                              點選入單 <span className="text-xs">➔</span>
                            </span>
                          </div>
                        </div>
                      )
                    })
                  ) : (
                    <div className="col-span-full py-8 text-center text-slate-400 text-xs">
                      沒有找到相符的特色飲品，要不要換個關鍵詞搜尋？
                    </div>
                  )}
                </div>
              </section>

              {/* Part 2: Active Orders lists segment */}
              <section className="bg-white rounded-2xl p-6 shadow-premium border border-slate-200">
                <div className="flex items-center justify-between mb-5 select-none">
                  <div className="flex items-center gap-2 pl-3 border-l-4 border-matcha-500">
                    <h2 className="text-lg font-bold tracking-tight text-slate-800">
                      📋 今日點單列表
                    </h2>
                  </div>
                  <span className="text-xs text-slate-400 font-mono font-bold">
                    今日累積共: <span className="text-slate-700">{orders.length} 筆</span>
                  </span>
                </div>

                {/* Skeletons on loading, or loaded custom list rendered below */}
                {isLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((idx) => (
                      <div key={idx} className="animate-pulse bg-stone-50 border border-stone-100 p-4 rounded-2xl flex items-center justify-between">
                        <div className="flex items-center gap-3 w-2/3">
                          <div className="w-10 h-10 rounded-full bg-stone-200"></div>
                          <div className="space-y-2 flex-grow">
                            <div className="h-4 bg-stone-200 rounded w-1/3"></div>
                            <div className="h-3 bg-stone-200 rounded w-1/2"></div>
                          </div>
                        </div>
                        <div className="h-6 bg-stone-200 rounded w-16"></div>
                      </div>
                    ))}
                  </div>
                ) : orders.length > 0 ? (
                  <div className="space-y-3 max-h-[450px] overflow-y-auto pr-1">
                    {orders.map((order) => (
                      <OrderItem
                        key={order.orderId}
                        order={order}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        isDeletingId={isDeletingId}
                      />
                    ))}
                  </div>
                ) : (
                  /* Highlight Empty State Design */
                  <div className="border-2 border-dashed border-stone-100 rounded-3xl p-8 py-12 text-center select-none bg-stone-50/40">
                    <div className="text-5xl animate-bounce-slow filter drop-shadow">🧋</div>
                    <h4 className="text-base font-bold text-stone-700 tracking-tight mt-5">
                      目前還沒有任何人點單唷！
                    </h4>
                    <p className="text-stone-400 text-xs mt-1.5 max-w-sm mx-auto leading-relaxed">
                      不要再猶豫了，快使用左邊的表單填寫或在飲料菜單中直接點擊，成為今日揪團發起的第一位品嚐者吧！
                    </p>
                    <div className="mt-5">
                      <span className="inline-flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-widest text-[#1e6b4e] bg-[#e1f0e8] px-3.5 py-1.5 rounded-full">
                        ✨ 點單帶動辦公室活力 ✨
                      </span>
                    </div>
                  </div>
                )}
              </section>
              
            </div>

          </div>
        </main>

        {/* Custom Interactive Toasts rendering container */}
        <ToastContainer toasts={toasts} removeToast={removeToast} />
        
        {/* Minimal aesthetic Footer */}
        <footer className="mt-20 text-center select-none">
          <p className="text-xs text-stone-400 font-medium">
            辦公室飲料揪團系統 © 2026 Afternoon Tea Ordering Co.
          </p>
          <div className="mt-2 flex items-center justify-center gap-1.5 text-[10px] text-stone-400 font-bold uppercase tracking-wider">
            <span>自動儲存姓名</span>
            <span>•</span>
            <span>即時 Google Sheets 人流同步</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
