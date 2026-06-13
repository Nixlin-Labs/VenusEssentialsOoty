"use client";

import Link from "next/link";
import { useMemo, useState, useEffect } from "react";
import OrderSummary from "@/components/checkout/OrderSummary";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { useAuthStore } from "@/lib/authStore";
import { useCart } from "@/lib/cartStore";
import { formatINR } from "@/lib/data";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export default function CheckoutInformationPage() {
  const user = useAuthStore((state) => state.user);
  const addresses = useAuthStore((state) => state.addresses);
  const selectedAddressId = useAuthStore((state) => state.selectedAddressId);
  const selectAddress = useAuthStore((state) => state.selectAddress);
  const addAddress = useAuthStore((state) => state.addAddress);
  const fetchAddresses = useAuthStore((state) => state.fetchAddresses);
  const cartItems = useCart((state) => state.items);

  const [useNewAddress, setUseNewAddress] = useState(false);
  const [newAddress, setNewAddress] = useState({
    label: "Home",
    fullName: "",
    mobile: "",
    line1: "",
    line2: "",
    city: "",
    state: "",
    pincode: "",
    country: "India",
  });

  useEffect(() => {
    fetchAddresses();
  }, [fetchAddresses]);

  useEffect(() => {
    if (user) {
      setNewAddress((p) => ({
        ...p,
        fullName: user.name || "",
        mobile: user.phone || user.mobile || "",
      }));
    }
  }, [user]);

  useEffect(() => {
    if (addresses.length === 0) {
      setUseNewAddress(true);
    }
  }, [addresses]);

  const subtotal = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cartItems],
  );
  const selectedAddress = addresses.find(
    (address) => address.id === selectedAddressId,
  );

  const orderSummaryItems = cartItems.map((item) => ({
    name: item.name,
    variant: item.variant,
    price: formatINR(item.price * item.quantity),
    image: item.image,
    quantity: item.quantity,
  }));

  const handleSaveNewAddress = async () => {
    if (
      !newAddress.fullName ||
      !newAddress.mobile ||
      !newAddress.line1 ||
      !newAddress.city
    ) {
      return;
    }
    const res = await addAddress(newAddress);
    if (res?.success) {
      setUseNewAddress(false);
      setNewAddress({
        label: "Home",
        fullName: user?.name || "",
        mobile: user?.phone || user?.mobile || "",
        line1: "",
        line2: "",
        city: "",
        state: "",
        pincode: "",
        country: "India",
      });
    }
  };

  return (
    <ProtectedRoute>
      <>
        <Navbar />
        <div className="min-h-screen bg-surface pt-20 md:pt-20">
          <div className="container-main py-8">
            <nav className="mb-8 font-body text-[13px] text-[#727973]">
              <Link href="/" className="hover:text-charcoal">
                Cart
              </Link>
              <span className="mx-2">›</span>
              <span className="font-medium text-charcoal">Information</span>
              <span className="mx-2">›</span>
              <span>Shipping</span>
              <span className="mx-2">›</span>
              <span>Payment</span>
            </nav>

            <div className="grid gap-12 lg:grid-cols-[58%_42%]">
              <div>
                <section className="mb-10">
                  <h2 className="mb-6 font-display text-2xl text-charcoal">
                    Shipping address
                  </h2>
                  <div className="space-y-4">
                    {addresses.length === 0 ? (
                      <div className="rounded-lg border border-dashed border-outline-variant p-6 text-center bg-surface-container-low mb-4">
                        <span className="material-symbols-outlined text-[36px] text-on-surface-variant mb-2">location_on</span>
                        <p className="font-body text-sm font-semibold text-charcoal mb-1">No Saved Addresses Found</p>
                        <p className="font-body text-xs text-on-surface-variant">Please fill out the form below to add your shipping address.</p>
                      </div>
                    ) : (
                      addresses.map((address) => (
                        <label
                          key={address.id}
                          className="flex cursor-pointer items-start gap-3 rounded-md border border-outline-variant p-3"
                        >
                          <input
                            type="radio"
                            checked={selectedAddressId === address.id}
                            onChange={() => {
                              selectAddress(address.id);
                              setUseNewAddress(false);
                            }}
                            className="mt-1 accent-primary-container"
                          />
                          <span className="text-sm text-on-surface-variant">
                            <strong className="text-charcoal">
                              {address.label}
                            </strong>{" "}
                            · {address.fullName}, {address.mobile}
                            <br />
                            {address.line1}
                            {address.line2 ? `, ${address.line2}` : ""},{" "}
                            {address.city}, {address.state} - {address.pincode}
                          </span>
                        </label>
                      ))
                    )}

                    {addresses.length > 0 && (
                      <button
                        type="button"
                        className="text-sm text-primary-container underline"
                        onClick={() => setUseNewAddress((prev) => !prev)}
                      >
                        {useNewAddress ? "Cancel new address" : "Use new address"}
                      </button>
                    )}

                    {useNewAddress && (
                      <div className="space-y-4 rounded-md border border-outline-variant p-4">
                        <input
                          className="input-field"
                          placeholder="Address label"
                          value={newAddress.label}
                          onChange={(e) =>
                            setNewAddress((p) => ({
                              ...p,
                              label: e.target.value,
                            }))
                          }
                        />
                        <div className="grid gap-4 sm:grid-cols-2">
                          <input
                            className="input-field"
                            placeholder="Full name"
                            value={newAddress.fullName}
                            onChange={(e) =>
                              setNewAddress((p) => ({
                                ...p,
                                fullName: e.target.value,
                              }))
                            }
                          />
                          <input
                            className="input-field"
                            placeholder="Mobile"
                            value={newAddress.mobile}
                            onChange={(e) =>
                              setNewAddress((p) => ({
                                ...p,
                                mobile: e.target.value,
                              }))
                            }
                          />
                        </div>
                        <input
                          className="input-field"
                          placeholder="Address line 1"
                          value={newAddress.line1}
                          onChange={(e) =>
                            setNewAddress((p) => ({
                              ...p,
                              line1: e.target.value,
                            }))
                          }
                        />
                        <input
                          className="input-field"
                          placeholder="Address line 2 (optional)"
                          value={newAddress.line2}
                          onChange={(e) =>
                            setNewAddress((p) => ({
                              ...p,
                              line2: e.target.value,
                            }))
                          }
                        />
                        <div className="grid gap-4 sm:grid-cols-3">
                          <input
                            className="input-field"
                            placeholder="City"
                            value={newAddress.city}
                            onChange={(e) =>
                              setNewAddress((p) => ({
                                ...p,
                                city: e.target.value,
                              }))
                            }
                          />
                          <input
                            className="input-field"
                            placeholder="State"
                            value={newAddress.state}
                            onChange={(e) =>
                              setNewAddress((p) => ({
                                ...p,
                                state: e.target.value,
                              }))
                            }
                          />
                          <input
                            className="input-field"
                            placeholder="Pincode"
                            value={newAddress.pincode}
                            onChange={(e) =>
                              setNewAddress((p) => ({
                                ...p,
                                pincode: e.target.value,
                              }))
                            }
                          />
                        </div>
                        <button
                          type="button"
                          onClick={handleSaveNewAddress}
                          className="rounded-md bg-primary-container px-4 py-2 text-sm text-white"
                        >
                          Save New Address
                        </button>
                      </div>
                    )}
                  </div>
                </section>

                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <Link
                    href="/shop"
                    className="font-body text-sm text-primary-container hover:underline"
                  >
                    ‹ Return to cart
                  </Link>
                  <Link
                    href="/checkout/payment"
                    className={`inline-flex justify-center rounded-md px-8 py-3 font-body text-sm text-white ${selectedAddress
                      ? "bg-primary-container hover:bg-secondary"
                      : "cursor-not-allowed bg-outline-variant"
                      }`}
                  >
                    Continue to shipping
                  </Link>
                </div>
              </div>

              <div>
                <OrderSummary
                  items={orderSummaryItems}
                  subtotal={formatINR(subtotal)}
                  shippingNote="Calculated at next step"
                  total={formatINR(subtotal)}
                />
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </>
    </ProtectedRoute>
  );
}
