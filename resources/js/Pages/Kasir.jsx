import { useState } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head } from "@inertiajs/react";
import Menu from "@/Components/Menu";
import Cart from "@/Components/Cart";

<<<<<<< HEAD
export default function Kasir() {
=======
export default function Kasir({ products = [], categories = [] }) {
>>>>>>> 49979cee001e869504cc1e09c0091dd308ddb19d
    const [cart, setCart] = useState([]);
    const [openCart, setOpenCart] = useState(false);
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
                    i.id === item.id
>>>>>>> 49979cee001e869504cc1e09c0091dd308ddb19d
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
<<<<<<< HEAD
                    <Menu onAdd={handleAddToCart} openCart={openCart} />
=======
                    <Menu 
                        onAdd={handleAddToCart} 
                        openCart={openCart}
                        products={products}
                        categories={categories}
                    />
>>>>>>> 49979cee001e869504cc1e09c0091dd308ddb19d
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