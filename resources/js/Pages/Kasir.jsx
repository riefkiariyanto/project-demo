import { useState } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head } from "@inertiajs/react";
import Menu from "@/Components/Menu";
import Cart from "@/Components/Cart";

export default function Kasir({ products = [], categories = [] }) {
    const [cart, setCart] = useState([]);
    const [openCart, setOpenCart] = useState(false);
    const handleAddToCart = (item) => {
        setCart((prev) => {
            const exist = prev.find((i) => i.id === item.id);

            if (exist) {
                return prev.map((i) =>
                    i.id === item.id
                        ? { ...i, qty: i.qty + 1 }
                        : i
                );
            }

            return [...prev, { ...item, qty: 1 }];
        });

        setOpenCart(true);
    };

    return (
        <AuthenticatedLayout hideSearch openCart={openCart}>
            <Head title="Kasir" />

            <div className="flex gap-4 h-full overflow-hidden">

                {/* MENU */}
                <div className="flex-1 min-w-0 min-h-0">
                    <Menu 
                        onAdd={handleAddToCart} 
                        openCart={openCart}
                        products={products}
                        categories={categories}
                    />
                </div>

                {/* 🔥 CART */}
                <div
                    className={`${openCart ? "w-[320px]" : "w-0 overflow-hidden"}`}
                >
                    <Cart
                        cart={cart}
                        open={openCart}
                        setOpen={setOpenCart}
                        setCart={setCart}
                    />
                </div>

            </div>
        </AuthenticatedLayout>
    );
}