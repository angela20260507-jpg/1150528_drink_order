import React, { useEffect, useMemo, useRef } from 'react';
import { User, Coffee, Minus, Plus, Loader2, Edit, Sparkles } from 'lucide-react';
import { MenuItem } from '../types';

interface FormState {
  name: string;
  drink: string;
  sugar: string;
  ice: string;
  quantity: number;
  price: number;
  totalPrice: number;
}

interface OrderFormProps {
  menu: MenuItem[];
  formState: FormState;
  setFormState: React.Dispatch<React.SetStateAction<FormState>>;
  isSubmitting: boolean;
  onSubmit: () => void;
  onCancelEdit: () => void;
  editOrderId: string | null;
  addToast: (message: string, type: 'success' | 'error' | 'info') => void;
}

export default function OrderForm({ 
  menu, 
  formState, 
  setFormState, 
  isSubmitting, 
  onSubmit, 
  onCancelEdit,
  editOrderId,
  addToast
}: OrderFormProps) {
  const sugarLevels = ["無糖", "微糖", "半糖", "七分糖", "正常糖"];
  const iceLevels = ["去冰", "微冰", "少冰", "正常冰", "溫熱"];
  const formRef = useRef<HTMLDivElement>(null);

  // Highlight form momentarily when a beverage is chosen via fast menu
  useEffect(() => {
    if (formState.drink && formRef.current) {
      formRef.current.classList.add('ring-4', 'ring-matcha-200');
      const timer = setTimeout(() => {
        if (formRef.current) {
          formRef.current.classList.remove('ring-4', 'ring-matcha-200');
        }
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [formState.drink]);

  const handleQuantityChange = (val: number) => {
    const newQty = Math.max(1, formState.quantity + val);
    const priceMultiplier = formState.price || 0;
    setFormState(prev => ({
      ...prev,
      quantity: newQty,
      totalPrice: newQty * priceMultiplier
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.name.trim()) {
      addToast("請填寫訂購人姓名！", "error");
      return;
    }
    if (!formState.drink) {
      addToast("請選擇想喝的飲料！", "error");
      return;
    }
    onSubmit();
  };

  // Find standard price of currently selected drink
  const matchedDrink = useMemo(() => {
    return menu.find(item => item.name === formState.drink);
  }, [menu, formState.drink]);

  return (
    <div 
      ref={formRef}
      className="bg-white rounded-2xl p-6 shadow-premium border border-slate-200 smooth-transition"
    >
      <div className="flex items-center justify-between mb-5 select-none">
        <div className={`flex items-center gap-2 pl-3 border-l-4 ${editOrderId ? 'border-amber-500' : 'border-matcha-500'}`}>
          <h3 className="text-lg font-bold tracking-tight text-slate-800">
            {editOrderId ? '✏️ 修改飲品' : '📝 新填點單'}
          </h3>
        </div>
        {editOrderId && (
          <span className="text-xs bg-amber-50 text-amber-700 px-2.5 py-1 rounded-full font-medium flex items-center gap-1">
            編輯中...
          </span>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Name Field */}
        <div>
          <label className="block text-xs font-semibold tracking-wider text-stone-500 uppercase mb-2">
            1. 訂購人姓名 <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
              <User className="w-4 h-4" />
            </div>
            <input
              type="text"
              required
              value={formState.name}
              onChange={(e) => setFormState(prev => ({ ...prev, name: e.target.value }))}
              placeholder="請輸入您的姓名或綽號 (例如: 小美)"
              className="w-full pl-9 pr-4 py-2.5 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-matcha-500 focus:bg-white smooth-transition text-stone-800 font-medium"
            />
          </div>
        </div>

        {/* Selected Drink Display */}
        <div>
          <label className="block text-xs font-semibold tracking-wider text-stone-500 uppercase mb-2">
            2. 已選飲品 <span className="text-red-500">*</span>
          </label>
          {formState.drink ? (
            <div className="p-3.5 bg-matcha-50/60 rounded-xl border border-matcha-100/50 flex justify-between items-center relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-1 opacity-10">
                <Coffee className="w-20 h-20 text-matcha-600 translate-x-4 translate-y-2" />
              </div>
              <div className="relative z-10">
                <div className="font-bold text-stone-800 text-sm tracking-wide">
                  {formState.drink}
                </div>
                <div className="text-xs text-stone-500 mt-1 max-w-[200px] truncate">
                  {matchedDrink?.description || "經典推薦招牌配方，口感絕配辦公室首選。"}
                </div>
              </div>
              <div className="text-right relative z-10">
                <span className="text-[10px] text-matcha-600/70 font-bold block">單價</span>
                <span className="font-mono text-sm font-bold text-matcha-700">NT$ {formState.price}</span>
              </div>
            </div>
          ) : (
            <div className="p-4 border-2 border-dashed border-stone-200 rounded-xl text-center text-stone-400 text-xs py-5">
              請在右側「飲料菜單」點擊一杯飲料加載入單！
            </div>
          )}
        </div>

        {/* Sugar Level Custom Pill Selector */}
        <div>
          <label className="block text-xs font-bold tracking-wider text-slate-500 uppercase mb-2">
            3. 甜度調整
          </label>
          <div className="grid grid-cols-5 gap-1.5 bg-slate-50 p-1 rounded-xl border border-slate-200/80">
            {sugarLevels.map((lvl) => {
              const isSelected = formState.sugar === lvl;
              return (
                <button
                  type="button"
                  key={lvl}
                  onClick={() => setFormState(prev => ({ ...prev, sugar: lvl }))}
                  className={`py-1.5 rounded-lg text-xs font-bold transition-all smooth-transition cursor-pointer ${
                    isSelected 
                      ? 'bg-matcha-500 text-white border border-matcha-500 shadow-sm scale-[1.02]' 
                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300'
                  }`}
                >
                  {lvl}
                </button>
              );
            })}
          </div>
        </div>

        {/* Ice Level Custom Pill Selector */}
        <div>
          <label className="block text-xs font-bold tracking-wider text-slate-500 uppercase mb-2">
            4. 冰塊溫度
          </label>
          <div className="grid grid-cols-5 gap-1.5 bg-slate-50 p-1 rounded-xl border border-slate-200/80">
            {iceLevels.map((lvl) => {
              const isSelected = formState.ice === lvl;
              return (
                <button
                  type="button"
                  key={lvl}
                  onClick={() => setFormState(prev => ({ ...prev, ice: lvl }))}
                  className={`py-1.5 rounded-lg text-xs font-bold transition-all smooth-transition cursor-pointer ${
                    isSelected 
                      ? 'bg-matcha-500 text-white border border-matcha-500 shadow-sm scale-[1.02]' 
                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300'
                  }`}
                >
                  {lvl}
                </button>
              );
            })}
          </div>
        </div>

        {/* Quantity Changer & Pricing */}
        <div className="grid grid-cols-2 gap-4 pt-1">
          <div>
            <label className="block text-xs font-semibold tracking-wider text-stone-500 uppercase mb-2">
              5. 購買數量
            </label>
            <div className="flex items-center inline-flex bg-stone-50 rounded-xl border border-stone-200/80 p-0.5">
              <button
                type="button"
                onClick={() => handleQuantityChange(-1)}
                className="p-2 hover:bg-stone-200/60 text-stone-500 active:scale-95 smooth-transition rounded-lg cursor-pointer"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="font-mono font-bold text-center w-10 text-sm text-stone-800 select-none">
                {formState.quantity}
              </span>
              <button
                type="button"
                onClick={() => handleQuantityChange(1)}
                className="p-2 hover:bg-stone-200/60 text-stone-500 active:scale-95 smooth-transition rounded-lg cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="text-right flex flex-col justify-end">
            <div className="text-xs text-stone-400 font-medium mb-1 select-none">小計金額</div>
            <div className="text-stone-800 font-display font-black text-xl tracking-wide">
              <span className="text-xs font-sans text-stone-500 font-bold mr-1">NT$</span>
              {formState.totalPrice}
            </div>
          </div>
        </div>

        {/* Submission Submit Buttons */}
        <div className="flex flex-col gap-2 pt-3">
          <button
            type="submit"
            disabled={isSubmitting || !formState.drink}
            className={`w-full py-3 px-4 rounded-xl font-bold tracking-wide text-sm flex items-center justify-center gap-2 shadow-sm transition-all text-white cursor-pointer ${
              !formState.drink 
                ? 'bg-stone-300 cursor-not-allowed text-stone-500 shadow-none' 
                : isSubmitting 
                  ? 'bg-matcha-700 cursor-wait' 
                  : editOrderId 
                    ? 'bg-amber-600 hover:bg-amber-500 hover:shadow-md' 
                    : 'bg-matcha-600 hover:bg-matcha-500 hover:shadow-md'
            }`}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                傳送資料至 Google Sheets...
              </>
            ) : editOrderId ? (
              <>
                <Edit className="w-4 h-4" />
                配合更新我的訂單
              </>
            ) : (
              <>
                <Sparkles className="w-4.5 h-4.5" />
                加入辦公室揪團！
              </>
            )}
          </button>

          {editOrderId && (
            <button
              type="button"
              onClick={onCancelEdit}
              className="w-full py-2.5 px-4 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl font-semibold text-xs text-center smooth-transition cursor-pointer"
            >
              取消修改，改填新點單
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
