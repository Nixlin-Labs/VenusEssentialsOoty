"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  FaMoneyBillWave,
  FaShoppingCart,
  FaBox,
  FaUsers,
  FaClock,
  FaExclamationTriangle,
  FaStar,
} from "react-icons/fa";
import { GiReceiveMoney } from "react-icons/gi";
import adminApi from "@/lib/api";

export default function AdminDashboard() {
  const router = useRouter();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const { data: res } = await adminApi.get("/admin/dashboard");
        setData(res.data);
      } catch (error) {
        console.error("Dashboard fetch error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 animate-pulse">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="h-24 stat-card bg-charcoal-50 rounded-xl" />
        ))}
      </div>
    );
  }

  const getStatColor = (stat) => {
    if (stat.label === "Low Stock Items") {
      return stat.value <= 10
        ? "bg-red-100 text-red-600"
        : "bg-green-100 text-green-600";
    }
    return stat.color;
  };

  const stats = [
    {
      label: "Total Revenue",
      value: `₹${(data?.totalRevenue || 0).toLocaleString("en-IN")}`,
      icon: FaMoneyBillWave,
      color: "bg-green-50 text-green-800",
    },
    {
      label: "Monthly Revenue",
      value: `₹${(data?.monthlyRevenue || 0).toLocaleString("en-IN")}`,
      icon: GiReceiveMoney,
      color: "bg-blue-50 text-blue-800",
    },
    {
      label: "Total Orders",
      value: data?.totalOrders || 0,
      icon: FaShoppingCart,
      color: "bg-sand-50 text-sand-800",
      nav: "/orders",
    },
    {
      label: "Monthly Orders",
      value: data?.monthlyOrders || 0,
      icon: FaBox,
      nav: "/orders",
      color: "bg-purple-50 text-purple-800",
    },
    {
      label: "Total Customers",
      value: data?.totalCustomers || 0,
      icon: FaUsers,
      color: "bg-teal-50 text-teal-800",
    },
    {
      label: "Pending Orders",
      value: data?.pendingOrders || 0,
      icon: FaClock,
      nav: "/orders",
      color: "bg-yellow-50 text-yellow-500",
    },
    {
      label: "Low Stock Items",
      value: data?.lowStockCount || 0,
      icon: FaExclamationTriangle,
      nav: "/products",
      color: "bg-red-50 text-red-800",
    },
    {
      label: "Pending Reviews",
      value: data?.pendingReviews || 0,
      icon: FaStar,
      color: "bg-orange-50 text-orange-500",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div
        className="grid grid-cols-2 gap-4 lg:grid-cols-4"
        id="dashboard-stats"
      >
        {stats.map((stat) => {
          const IconComponent = stat.icon;
          const handleClick = () => {
            if (stat.nav) router.push(stat.nav);
          };
          return (
            <div
              key={stat.label}
              className={`stat-card flex flex-col items-center justify-center text-center ${stat.nav ? "cursor-pointer hover:shadow-lg transition-shadow" : ""}`}
              onClick={handleClick}
            >
              <div
                className={`text-xl p-3 rounded-full mb-3 ${getStatColor(stat)}`}
              >
                <IconComponent />
              </div>
              <div className="stat-value">{stat.value}</div>
              <div className="stat-label">{stat.label}</div>
            </div>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Orders */}
        <div
          className="transition-shadow cursor-pointer admin-card hover:shadow-lg"
          id="recent-orders"
          onClick={() => router.push("/orders")}
        >
          <h3 className="mb-4 text-base font-semibold text-charcoal-900">
            Recent Orders
          </h3>
          {data?.recentOrders?.length > 0 ? (
            <div className="space-y-3">
              {data.recentOrders.map((order) => (
                <div
                  key={order._id}
                  className="flex items-center justify-between py-2 border-b border-border-light last:border-0"
                >
                  <div>
                    <p className="text-sm font-medium text-charcoal-900">
                      {order.orderNumber}
                    </p>
                    <p className="text-xs text-muted">
                      {new Date(order.createdAt).toLocaleDateString("en-IN")}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-charcoal-900">
                      ₹{order.total?.toFixed(0)}
                    </p>
                    <span
                      className={`admin-badge text-[10px] ${
                        order.orderStatus === "delivered"
                          ? "bg-success-bg text-success"
                          : order.orderStatus === "cancelled"
                            ? "bg-error-bg text-error"
                            : "bg-warning-bg text-warning"
                      }`}
                    >
                      {order.orderStatus}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="py-8 text-sm text-center text-muted">
              No recent orders
            </p>
          )}
        </div>

        {/* Top Products */}
        <div
          className="transition-shadow cursor-pointer admin-card hover:shadow-lg"
          id="top-products"
          onClick={() => router.push("/products")}
        >
          <h3 className="mb-4 text-base font-semibold text-charcoal-900">
            Top Products
          </h3>
          {data?.topProducts?.length > 0 ? (
            <div className="space-y-3">
              {data.topProducts.map((product, i) => (
                <div
                  key={product._id}
                  className="flex items-center gap-3 py-2 border-b border-border-light last:border-0"
                >
                  <span className="w-6 text-sm font-bold text-charcoal-300">
                    {i + 1}
                  </span>
                  <div className="relative flex-shrink-0 w-10 h-10 overflow-hidden rounded-lg bg-charcoal-50">
                    {product.images?.[0] ? (
                      <Image
                        src={`http://localhost:5000${product.images[0].url}`}
                        alt=""
                        fill
                        sizes="40px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center w-full h-full">
                        <FaBox className="text-2xl text-charcoal-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate text-charcoal-900">
                      {product.name}
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-forest-800">
                    {product.totalSold} sold
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="py-8 text-sm text-center text-muted">
              No sales data yet
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
