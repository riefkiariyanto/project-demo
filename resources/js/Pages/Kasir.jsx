import { useState, useEffect, useRef } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head } from "@inertiajs/react";
import Menu from "@/Components/Menu";
import Cart from "@/Components/Cart";

export default function Kasir({ products = [], categories = [], qris_image = null }) {
    const [cart, setCart] = useState([]);
    const [openCart, setOpenCart] = useState(false);
    const isMobileRef = useRef(false);

    useEffect(() => {
        isMobileRef.current = window.innerWidth < 640;
    }, []);

    const handleAddToCart = (item) => {
        setCart((prev) => {
            const exist = prev.find((i) => i.id === item.id);
            if (exist) {
                return prev.map((i) =>
                    i.id === item.id ? { ...i, qty: i.qty + 1 } : i
                );
            }
            return [...prev, { ...item, qty: 1 }];
        });

        // Auto-open cart on desktop when adding first item
        if (!isMobileRef.current) {
            setOpenCart(true);
        }
    };

    return (
        <AuthenticatedLayout hideSearch openCart={openCart}>
            <Head title="Kasir" />

            <div className="flex gap-1 h-full overflow-hidden px-1" style={{ touchAction: 'pan-y' }}>

                {/* MENU */}
                <div className="flex-1 min-w-0 min-h-0 px-0">
                    <Menu
                        onAdd={handleAddToCart}
                        openCart={openCart}
                        setOpenCart={setOpenCart}
                        cart={cart}
                        products={products}
                        categories={categories}
                    />
                </div>

                {/* CART — side panel on desktop only */}
                <div className={`hidden sm:block shrink-0 transition-all duration-300 ${openCart ? "w-[320px]" : "w-0 overflow-hidden"}`}>
                    <Cart
                        cart={cart}
                        open={openCart}
                        setOpen={setOpenCart}
                        setCart={setCart}
                        qrisImage={qris_image}
                    />
                </div>

                {/* CART — full screen overlay on mobile */}
                <div className="sm:hidden">
                    <Cart
                        cart={cart}
                        open={openCart}
                        setOpen={setOpenCart}
                        setCart={setCart}
                        qrisImage={qris_image}
                        isMobile
                    />
                </div>

            </div>
        </AuthenticatedLayout>
    );
}
