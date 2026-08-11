import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Sparkles, Mail, ArrowRight, Package, Clock, ShieldCheck, Truck, RefreshCw } from "lucide-react";
import { customerApi } from "../../../lib/customerApi";

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const fetchOrders = async () => {
      try {
        const res = await customerApi.orders.getAll();
        if (!cancelled) {
          setOrders(res.orders || []);
        }
      } catch (err) {
        console.error("Failed to load customer orders:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchOrders();
    return () => { cancelled = true; };
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case "delivered":
        return "text-green-700 bg-green-50 border-green-200/50";
      case "shipped":
        return "text-blue-700 bg-blue-50 border-blue-200/50";
      case "processing":
      case "packed":
        return "text-amber-700 bg-amber-50 border-amber-200/50";
      case "cancelled":
      case "refunded":
        return "text-red-700 bg-red-50 border-red-200/50";
      default:
        return "text-zinc-600 bg-zinc-50 border-zinc-200/50";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "delivered":
        return <ShieldCheck size={13} className="text-green-600" />;
      case "shipped":
        return <Truck size={13} className="text-blue-600" />;
      case "processing":
      case "packed":
        return <Clock size={13} className="text-amber-600" />;
      default:
        return <Package size={13} className="text-zinc-500" />;
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm("Are you sure you want to cancel this pending order?")) return;
    try {
      await customerApi.orders.cancel(orderId);
      setOrders((prev) =>
        prev.map((o) => ((o._id || o.id) === orderId ? { ...o, status: "cancelled" } : o))
      );
    } catch (err) {
      alert(err.message || "Failed to cancel order.");
    }
  };

  if (loading) {
    return (
      <div className="bg-white border border-[#E6DED4]/40 rounded-[4px] p-6 sm:p-8 shadow-xs flex flex-col items-center justify-center py-20">
        <RefreshCw size={24} className="animate-spin text-[#B58A5B] mb-3" />
        <span className="font-sans text-xs text-[#8A857E]">Loading your orders...</span>
      </div>
    );
  }

  return (
    <div className="bg-white border border-[#E6DED4]/40 rounded-[4px] p-6 sm:p-8 shadow-xs">
      <div className="flex items-center justify-between border-b border-[#E6DED4]/60 pb-4 mb-6">
        <h3 className="font-serif text-[18px] font-normal tracking-wide text-[#1C1916] flex items-center gap-2.5">
          <Sparkles size={16} className="text-[#B58A5B]" /> Latest Orders
        </h3>
      </div>

      {orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <div className="w-12 h-12 rounded-full bg-[#FBF9F6] border border-[#E6DED4]/40 flex items-center justify-center text-[#8A857E] mb-4">
            <Mail size={18} strokeWidth={1.5} />
          </div>
          <p className="font-serif text-[15px] font-light text-[#1C1916] mb-1">
            You have no orders yet.
          </p>
          <p className="font-sans text-[12.5px] text-[#8A857E] font-light mb-5">
            Explore our handwoven, curated heritage pieces.
          </p>
          <Link
            to="/collections"
            className="group inline-flex items-center gap-2 text-[10.5px] font-semibold tracking-[0.2em] uppercase text-[#1C1916] hover:text-[#B58A5B] transition-colors duration-200 cursor-pointer"
          >
            Explore Collection{" "}
            <ArrowRight
              size={12}
              className="transition-transform duration-200 group-hover:translate-x-1"
            />
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div
              key={order._id || order.id}
              className="border border-[#ECE4D8] rounded-[4px] overflow-hidden"
            >
              {/* Order Header */}
              <div className="bg-[#FAF8F5] px-5 py-4 border-b border-[#ECE4D8] flex flex-wrap gap-4 items-center justify-between">
                <div>
                  <span className="block font-sans text-[9px] font-semibold tracking-wider uppercase text-[#8A857E] mb-0.5">
                    Order Number
                  </span>
                  <span className="font-sans text-xs font-semibold text-[#1C1916]">
                    {order.orderNumber}
                  </span>
                </div>
                <div>
                  <span className="block font-sans text-[9px] font-semibold tracking-wider uppercase text-[#8A857E] mb-0.5">
                    Date Placed
                  </span>
                  <span className="font-sans text-xs text-[#3D3833]">
                    {new Date(order.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>
                <div>
                  <span className="block font-sans text-[9px] font-semibold tracking-wider uppercase text-[#8A857E] mb-0.5">
                    Total Amount
                  </span>
                  <span className="font-sans text-xs font-semibold text-[#1C1916]">
                    ₹{order.total.toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="ml-auto flex items-center gap-3">
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[11px] font-medium tracking-wide capitalize ${getStatusColor(
                      order.status
                    )}`}
                  >
                    {getStatusIcon(order.status)}
                    {order.status}
                  </span>
                  {order.status === "pending" && (
                    <button
                      onClick={() => handleCancelOrder(order._id || order.id)}
                      className="px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-[2px] transition-colors"
                    >
                      Cancel Order
                    </button>
                  )}
                </div>
              </div>

              {/* Order Items */}
              <div className="p-5 divide-y divide-[#ECE4D8]/60">
                {order.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="py-4 first:pt-0 last:pb-0 flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-4">
                      {item.product?.images?.[0]?.url ? (
                        <img
                          src={item.product.images[0].url}
                          alt={item.name}
                          className="w-12 h-14 object-cover rounded-[2px] bg-[#EFE9E1]"
                        />
                      ) : (
                        <div className="w-12 h-14 bg-[#EFE9E1] rounded-[2px] flex items-center justify-center text-[#8A857E]">
                          <Package size={16} strokeWidth={1.5} />
                        </div>
                      )}
                      <div>
                        <h4 className="font-serif text-[13.5px] text-[#1C1916]">
                          {item.name}
                        </h4>
                        <span className="block font-sans text-[11px] text-[#8A857E] mt-0.5">
                          Quantity: {item.qty}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-sans text-[13px] font-medium text-[#1C1916]">
                        ₹{(item.price * item.qty).toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
