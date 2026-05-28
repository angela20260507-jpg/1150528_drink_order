import React from 'react';
import { Edit, Trash2, Loader2 } from 'lucide-react';
import { Order } from '../types';

interface OrderItemProps {
  order: Order;
  onEdit: (order: Order) => void;
  onDelete: (orderId: string) => void;
  isDeletingId: string | null;
}

export default function OrderItem({ order, onEdit, onDelete, isDeletingId }: OrderItemProps) {
  const isDeleting = isDeletingId === order.orderId;

  return (
    <div 
      className="bg-white rounded-2xl p-4 shadow-card hover:shadow-md transition-all border border-stone-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative overflow-hidden group"
    >
      {/* Decorative vertical line in corner */}
      <div className="absolute top-0 right-0 w-2 h-full bg-matcha-500/20 group-hover:bg-matcha-500 smooth-transition"></div>

      <div className="flex items-center gap-3">
        {/* Avatar Initial Circle */}
        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-matcha-100 to-matcha-50 border border-matcha-200 flex items-center justify-center font-display font-bold text-matcha-700 select-none">
          {order.name.substring(0, 1).toUpperCase()}
        </div>

        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-stone-800 text-sm tracking-tight">{order.name}</span>
            <span className="text-[10px] bg-stone-100 px-2 py-0.5 rounded-full text-stone-500 font-mono">
              {order.timestamp ? new Date(order.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '剛剛'}
            </span>
          </div>
          <div className="text-xs font-bold text-stone-500 mt-0.5 flex flex-wrap items-center gap-x-2">
            <span className="text-stone-800 text-sm font-black mr-0.5">{order.drink}</span>
            <span className="px-1.5 py-0.5 bg-boba-50 text-boba-700 rounded border border-boba-100/60 font-medium">{order.sugar}</span>
            <span className="px-1.5 py-0.5 bg-sky-50 text-sky-700 rounded border border-sky-100/60 font-medium">{order.ice}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between sm:justify-end gap-5 w-full sm:w-auto">
        {/* Quantity & Pricing */}
        <div className="text-left sm:text-right">
          <span className="text-xs font-mono text-stone-400 font-medium block">
            {order.quantity} 杯
          </span>
          <span className="text-sm font-bold text-stone-800">
            NT$ {order.totalPrice}
          </span>
        </div>

        {/* Actions edit and delete */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => onEdit(order)}
            title="編輯訂單"
            className="p-1.5 text-stone-400 hover:text-matcha-600 rounded-lg hover:bg-stone-50 active:scale-95 smooth-transition border border-stone-100 cursor-pointer"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            disabled={isDeleting}
            onClick={() => onDelete(order.orderId)}
            title="刪除"
            className={`p-1.5 rounded-lg border border-stone-100 smooth-transition cursor-pointer ${
              isDeleting 
                ? 'text-red-400 cursor-wait bg-red-50' 
                : 'text-stone-400 hover:text-red-500 hover:bg-red-50 active:scale-95'
            }`}
          >
            {isDeleting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
