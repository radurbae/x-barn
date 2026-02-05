import { beforeEach, describe, expect, it } from "vitest";
import { useCartStore } from "./cart-store";

const espresso = {
  id: "1",
  name: "Espresso",
  price: 30000,
  category: "Coffee",
  image_url: "/images/products/espresso.png",
  description: "Strong espresso shot",
  is_available: true,
  created_at: "",
  updated_at: "",
};

describe("cart-store", () => {
  beforeEach(() => {
    useCartStore.setState({ items: [] });
  });

  it("adds items and updates quantity", () => {
    useCartStore.getState().addItem(espresso);
    useCartStore.getState().addItem(espresso);
    const { items } = useCartStore.getState();
    expect(items.length).toBe(1);
    expect(items[0].quantity).toBe(2);
  });

  it("removes items when quantity reaches zero", () => {
    useCartStore.getState().addItem(espresso);
    useCartStore.getState().updateQuantity(espresso.id, 0);
    expect(useCartStore.getState().items.length).toBe(0);
  });

  it("calculates totals", () => {
    useCartStore.getState().addItem(espresso);
    useCartStore.getState().addItem(espresso);
    expect(useCartStore.getState().getTotal()).toBe(60000);
    expect(useCartStore.getState().getItemCount()).toBe(2);
  });
});
