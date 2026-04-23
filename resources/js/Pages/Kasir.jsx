import { useState } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head } from "@inertiajs/react";
import Menu from "@/Components/Menu";
import Cart from "@/Components/Cart";

export default function Kasir() {
    const [cart, setCart] = useState([]);
    const [openCart, setOpenCart] = useState(false);
    const handleAddToCart = (item) => {
        setCart((prev) => {
            const exist = prev.find((i) => i.name === item.name);

            if (exist) {
                return prev.map((i) =>
                    i.name === item.name
                        ? { ...i, qty: i.qty + 1 }
                        : i
                );
            }

            return [...prev, { ...item, qty: 1 }];
        });

        setOpenCart(true);
    };

    return (
        <AuthenticatedLayout openCart={openCart}>
            <Head title="Kasir" />

            <div className="flex gap-4 h-full overflow-hidden">

                {/* MENU */}
                <div className="flex-1 min-w-0">
                    <Menu onAdd={handleAddToCart} openCart={openCart} />
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