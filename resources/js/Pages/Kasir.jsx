import { useState, useEffect, useRef } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head } from "@inertiajs/react";
import Menu from "@/Components/Menu";
import Cart from "@/Components/Cart";

<<<<<<< HEAD
<<<<<<< HEAD
export default function Kasir() {
=======
export default function Kasir({ products = [], categories = [] }) {
>>>>>>> 49979cee001e869504cc1e09c0091dd308ddb19d
=======
export default function Kasir({ products = [], categories = [], qris_image = null, store = null, kasir_name = "" }) {
>>>>>>> 0151fbfc670c72da9535374da1cc993b038a6eab
    const [cart, setCart] = useState([]);
    const [openCart, setOpenCart] = useState(false);
    const isMobileRef = useRef(false);

    useEffect(() => {
        isMobileRef.current = window.innerWidth < 640;
    }, []);

    const handleAddToCart = (item) => {
        setCart((prev) => {
<<<<<<< HEAD
            const exist = prev.find((i) => i.name === item.name);

            if (exist) {
                return prev.map((i) =>
                    i.name === item.name
=======
            const exist = prev.find((i) => i.id === item.id);
            if (exist) {
                return prev.map((i) =>
<<<<<<< HEAD
                    i.id === item.id
>>>>>>> 49979cee001e869504cc1e09c0091dd308ddb19d
                        ? { ...i, qty: i.qty + 1 }
                        : i
=======
                    i.id === item.id ? { ...i, qty: i.qty + 1 } : i
>>>>>>> 0151fbfc670c72da9535374da1cc993b038a6eab
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
<<<<<<< HEAD
                <div className="flex-1 min-w-0">
<<<<<<< HEAD
                    <Menu onAdd={handleAddToCart} openCart={openCart} />
=======
                    <Menu 
                        onAdd={handleAddToCart} 
=======
                <div className="flex-1 min-w-0 min-h-0 px-0">
                    <Menu
                        onAdd={handleAddToCart}
>>>>>>> 0151fbfc670c72da9535374da1cc993b038a6eab
                        openCart={openCart}
                        setOpenCart={setOpenCart}
                        cart={cart}
                        products={products}
                        categories={categories}
                    />
>>>>>>> 49979cee001e869504cc1e09c0091dd308ddb19d
                </div>

                {/* CART — side panel on desktop only */}
                <div className={`hidden sm:block shrink-0 transition-all duration-300 ${openCart ? "w-[320px]" : "w-0 overflow-hidden"}`}>
                    <Cart
                        cart={cart}
                        open={openCart}
                        setOpen={setOpenCart}
                        setCart={setCart}
                        qrisImage={qris_image}
                        store={store}
                        kasirName={kasir_name}
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
                        store={store}
                        kasirName={kasir_name}
                        isMobile
                    />
                </div>

            </div>
        </AuthenticatedLayout>
    );
}
