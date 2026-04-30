import { useMemo, useState } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, router, useForm } from "@inertiajs/react";
import {
    PencilSquareIcon,
    TrashIcon,
    BeakerIcon,
    UserGroupIcon,
    ShoppingBagIcon,
    CubeIcon,
    PlusIcon,
    XMarkIcon,
    MagnifyingGlassIcon,
    CheckCircleIcon,
    ExclamationCircleIcon,
} from "@heroicons/react/24/solid";

// ─── Notification ────────────────────────────────────────────────────────────
function Notification({ notif }) {
    if (!notif) return null;
    const isSuccess = notif.type === "success";
    return (
        <div
            className={`fixed top-4 left-1/2 -translate-x-1/2 z-[70]
                ${isSuccess ? "bg-green-500" : "bg-red-500"}
                text-white rounded-2xl shadow-2xl p-5 max-w-sm w-full
                animate-in fade-in slide-in-from-top-4 duration-300`}
        >
            <div className="flex items-center gap-3">
                {isSuccess
                    ? <CheckCircleIcon className="w-7 h-7 shrink-0" />
                    : <ExclamationCircleIcon className="w-7 h-7 shrink-0" />}
                <div>
                    <p className="font-bold">{notif.title}</p>
                    {notif.message && (
                        <p className="text-sm opacity-90">{notif.message}</p>
                    )}
                </div>
            </div>
        </div>
    );
}

// ─── Tab Button ───────────────────────────────────────────────────────────────
function TabBtn({ active, onClick, icon: Icon, label }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200
                ${active
                    ? "bg-white text-orange-500 shadow-md"
                    : "bg-white/20 text-white hover:bg-white/30"}`}
        >
            <Icon className="w-4 h-4" />
            {label}
        </button>
    );
}

// ─── Glass Card ───────────────────────────────────────────────────────────────
function GlassCard({ children, className = "" }) {
    return (
        <div className={`bg-white/30 backdrop-blur-xl rounded-2xl border border-white/30 shadow-lg ${className}`}>
            {children}
        </div>
    );
}

// ─── Modal Wrapper ────────────────────────────────────────────────────────────
function Modal({ show, onClose, title, subtitle, children, footer }) {
    if (!show) return null;
    return (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center px-4">
            <div className="w-full max-w-md bg-white/10 backdrop-blur-2xl rounded-3xl border border-white/30 shadow-2xl overflow-hidden text-white">
                {/* Header */}
                <div className="px-6 py-4 border-b border-white/20 flex justify-between items-center">
                    <div>
                        <h2 className="text-lg font-bold">{title}</h2>
                        {subtitle && <p className="text-xs text-white/60">{subtitle}</p>}
                    </div>
                    <button onClick={onClose} className="hover:bg-white/20 p-1.5 rounded-lg transition">
                        <XMarkIcon className="w-5 h-5" />
                    </button>
                </div>
                {/* Body */}
                <div className="p-6 space-y-3">{children}</div>
                {/* Footer */}
                {footer && (
                    <div className="px-6 py-4 border-t border-white/20 bg-black/10 flex justify-end gap-3">
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );
}

// ─── Input Styles ─────────────────────────────────────────────────────────────
const inputCls = "w-full rounded-xl bg-white/20 border border-white/30 px-4 py-2.5 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 transition";
const labelCls = "block text-xs font-semibold text-white/70 mb-1";

// ─── Main Component ───────────────────────────────────────────────────────────
export default function KelolaToko({
    auth,
    products = [],
    categories = [],
    materials = [],
    users = [],
}) {
    const [tab, setTab] = useState("menu");
    const [search, setSearch] = useState("");
    const [notif, setNotif] = useState(null);

    const [showMenuModal, setShowMenuModal] = useState(false);
    const [showMaterialModal, setShowMaterialModal] = useState(false);
    const [showUserModal, setShowUserModal] = useState(false);
    const [showRecipeModal, setShowRecipeModal] = useState(false);

    const [editingMaterial, setEditingMaterial] = useState(null);
    const [editingUser, setEditingUser] = useState(null);
    const [qtyInputs, setQtyInputs] = useState({});
    const [stockModes, setStockModes] = useState({});
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [recipeItems, setRecipeItems] = useState([]);

    const isSuperadmin = auth?.roles?.includes("superadmin");

    const showNotif = (type, title, message) => {
        setNotif({ type, title, message });
        setTimeout(() => setNotif(null), 3500);
    };

    const { data, setData, post, put, reset } = useForm({
        name: "", category_id: "", selling_price: "", image: null,
        sku: "SKU-" + Date.now(), cost_price: 0, stock: 0, unit: "pcs",
        is_active: 1, min_stock: 0, buy_price: 0, qty: 0,
        initial_qty: 0, use_initial_qty: false,
        email: "", password: "", role: "",
    });

    // ── Filtered lists ──────────────────────────────────────────────────────
    const filteredProducts = useMemo(() =>
        products.filter((i) => (i.name || "").toLowerCase().includes(search.toLowerCase())),
        [products, search]);

    const filteredMaterials = useMemo(() =>
        materials.filter((i) => (i.name || "").toLowerCase().includes(search.toLowerCase())),
        [materials, search]);

    // ── Helpers ─────────────────────────────────────────────────────────────
    const getInitials = (name = "") =>
        name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);

    const formatRp = (v) =>
        new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(v || 0);

    // ── Menu ─────────────────────────────────────────────────────────────────
    const openAddMenu = () => {
        reset();
        setData({ name: "", category_id: "", selling_price: "", image: null, sku: "SKU-" + Date.now(), cost_price: 0, stock: 0, unit: "pcs", is_active: 1, min_stock: 0, buy_price: 0, qty: 0 });
        setShowMenuModal(true);
    };

    const saveMenu = () => {
        post("/products", {
            forceFormData: true, preserveScroll: true,
            onSuccess: () => { setShowMenuModal(false); reset(); showNotif("success", "Menu berhasil ditambahkan!"); },
            onError: () => showNotif("error", "Gagal menyimpan menu."),
        });
    };

    // ── Material ─────────────────────────────────────────────────────────────
    const openAddMaterial = () => {
        setEditingMaterial(null); reset();
        setData({ name: "", stock: "", unit: "pcs", min_stock: "", buy_price: "", qty: "" });
        setShowMaterialModal(true);
    };

    const openEditMaterial = (item) => {
        setEditingMaterial(item);
        setData({ name: item.name ?? "", stock: item.stock ?? 0, unit: item.unit ?? "pcs", min_stock: item.min_stock ?? 0, buy_price: item.buy_price ?? 0, qty: "" });
        setShowMaterialModal(true);
    };

    const saveMaterial = () => {
        const opts = {
            preserveScroll: true,
            onSuccess: () => { setShowMaterialModal(false); reset(); showNotif("success", editingMaterial ? "Bahan diperbarui!" : "Bahan ditambahkan!"); },
            onError: () => showNotif("error", "Gagal menyimpan bahan."),
        };
        editingMaterial ? put(`/bahan/${editingMaterial.id}`, opts) : post("/bahan", opts);
    };

    const adjustStock = (item) => {
        const qty = Number(qtyInputs[item.id] || 0);
        const type = stockModes[item.id] || "in";
        if (qty <= 0) return;
        router.post(`/bahan/${item.id}/stock`, { type, qty }, {
            preserveScroll: true,
            onSuccess: () => { setQtyInputs((p) => ({ ...p, [item.id]: "" })); showNotif("success", "Stok berhasil diperbarui!"); },
            onError: () => showNotif("error", "Gagal update stok."),
        });
    };

    // ── User ─────────────────────────────────────────────────────────────────
    const openAddUser = () => {
        setEditingUser(null); reset();
        setData({ name: "", email: "", password: "", role: "" });
        setShowUserModal(true);
    };

    const openEditUser = (user) => {
        setEditingUser(user);
        setData({ name: user.name ?? "", email: user.email ?? "", password: "", role: user.roles?.[0]?.name ?? "" });
        setShowUserModal(true);
    };

    const saveUser = () => {
        const opts = {
            preserveScroll: true,
            onSuccess: () => { setShowUserModal(false); setEditingUser(null); reset(); showNotif("success", editingUser ? "Pengguna diperbarui!" : "Pengguna ditambahkan!"); },
            onError: () => showNotif("error", "Gagal menyimpan pengguna."),
        };
        editingUser ? put(`/users/${editingUser.id}`, opts) : post("/users", opts);
    };

    // ── Recipe ────────────────────────────────────────────────────────────────
    const openRecipe = (item) => {
        setSelectedProduct(item);
        setRecipeItems(
            item.recipe?.items?.length
                ? item.recipe.items.map((r) => ({ material_id: r.material_id, qty: r.qty }))
                : [{ material_id: "", qty: "" }]
        );
        setShowRecipeModal(true);
    };

    const saveRecipe = () => {
        router.post(`/products/${selectedProduct.id}/recipe`, { items: recipeItems }, {
            preserveScroll: true,
            onSuccess: () => { setShowRecipeModal(false); showNotif("success", "Resep disimpan!"); },
            onError: () => showNotif("error", "Gagal menyimpan resep."),
        });
    };

    const recipeTotalHPP = recipeItems.reduce((total, row) => {
        const mat = materials.find((m) => String(m.id) === String(row.material_id));
        if (mat && Number(mat.initial_qty) > 0) {
            return total + (Number(mat.buy_price) / Number(mat.initial_qty)) * Number(row.qty || 0);
        }
        return total;
    }, 0);

    // ─────────────────────────────────────────────────────────────────────────
    return (
    <AuthenticatedLayout hideSearch>
        <Head title="Kelola Toko" />

            <Notification notif={notif} />

            <div className="flex flex-col gap-4 h-full">

                {/* ── TOP BAR ─────────────────────────────────────────────── */}
                <GlassCard className="px-5 py-3 flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
                    <h1 className="text-xl font-bold text-white">Kelola Toko</h1>

                    {/* TABS */}
                    <div className="flex gap-2 flex-wrap">
                        <TabBtn active={tab === "menu"} onClick={() => setTab("menu")} icon={ShoppingBagIcon} label="Menu" />
                        <TabBtn active={tab === "bahan"} onClick={() => setTab("bahan")} icon={CubeIcon} label="Bahan" />
                        {isSuperadmin && (
                            <TabBtn active={tab === "pengguna"} onClick={() => setTab("pengguna")} icon={UserGroupIcon} label="Pengguna" />
                        )}
                    </div>

                    {/* SEARCH */}
                    <div className="flex items-center bg-white/20 rounded-full px-3 py-1.5 gap-2 w-full sm:w-64">
                        <MagnifyingGlassIcon className="w-4 h-4 text-white/70 shrink-0" />
                        <input
                            placeholder="Cari..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="bg-transparent flex-1 text-orange-400 font-bold placeholder-white/90 text-sm outline-none focus:outline-none focus:ring-0 border-none"
                        />
                    </div>
                </GlassCard>

                {/* ── CONTENT ─────────────────────────────────────────────── */}
                <div className="flex-1 overflow-auto no-scrollbar">

                    {/* ── MENU TAB ──────────────────────────────────────────── */}
                    {tab === "menu" && (
                        <GlassCard className="p-4 space-y-4">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h2 className="font-bold text-white text-lg">Master Menu</h2>
                                    <p className="text-xs text-white/60">Daftar menu yang tersedia</p>
                                </div>
                                <button type="button" onClick={openAddMenu}
                                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white text-orange-500 font-semibold text-sm hover:bg-orange-50 transition shadow">
                                    <PlusIcon className="w-4 h-4" /> Tambah Menu
                                </button>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {filteredProducts.map((item) => (
                                    <div key={item.id}
                                        className="bg-white/20 backdrop-blur-md rounded-2xl overflow-hidden border border-white/20 hover:scale-[1.02] transition-all duration-200 shadow">

                                        {/* Image */}
                                        <div className="relative h-36 bg-gradient-to-br from-orange-300 to-orange-500 flex items-center justify-center text-white text-2xl font-bold overflow-hidden">
                                            {item.image
                                                ? <img src={`/storage/${item.image}`} alt={item.name} className="w-full h-full object-cover" />
                                                : <span>{getInitials(item.name)}</span>}
                                            <span className={`absolute top-2 right-2 px-2 py-1 rounded-lg text-xs font-semibold
                                                ${item.available_stock > 0 ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"}`}>
                                                {item.available_stock > 0 ? "Ready" : "Habis"}
                                            </span>
                                        </div>

                                        {/* Info */}
                                        <div className="p-3 space-y-2">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <p className="font-semibold text-orange-600 text-sm">{item.name}</p>
                                                    <p className="text-xs text-orange-600/90">{item.category?.name ?? "-"}</p>
                                                </div>
                                                <p className="font-bold text-orange-600 text-sm">{formatRp(item.selling_price)}</p>
                                            </div>

                                            <p className="text-xs text-orange-600/60">Stok: {Math.floor(item.available_stock || 0)}</p>

                                            {/* Actions */}
                                            <div className="flex gap-2 pt-1">
                                                <button type="button" onClick={() => openRecipe(item)}
                                                    className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg bg-purple-500/40 text-purple-800 text-xs font-semibold hover:bg-purple-500/60 transition">
                                                    <BeakerIcon className="w-3.5 h-3.5" /> Resep
                                                </button>
                                                <button type="button"
                                                    className="p-1.5 rounded-lg bg-blue-500/30 text-blue-800 hover:bg-blue-500/50 transition">
                                                    <PencilSquareIcon className="w-4 h-4" />
                                                </button>
                                                <button type="button"
                                                    onClick={() => router.delete(`/products/${item.id}`, {
                                                        onSuccess: () => showNotif("success", "Menu dihapus!"),
                                                    })}
                                                    className="p-1.5 rounded-lg bg-red-500/30 text-red-800 hover:bg-red-500/50 transition">
                                                    <TrashIcon className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                {filteredProducts.length === 0 && (
                                    <div className="col-span-full text-center py-12 text-white/50">
                                        Belum ada menu.
                                    </div>
                                )}
                            </div>
                        </GlassCard>
                    )}

                    {/* ── BAHAN TAB ─────────────────────────────────────────── */}
                    {tab === "bahan" && (
                        <GlassCard className="p-4 space-y-4">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h2 className="font-bold text-white text-lg">Master Bahan</h2>
                                    <p className="text-xs text-white/60">Daftar bahan baku</p>
                                </div>
                                <button type="button" onClick={openAddMaterial}
                                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white text-orange-500 font-semibold text-sm hover:bg-orange-50 transition shadow">
                                    <PlusIcon className="w-4 h-4" /> Tambah Bahan
                                </button>
                            </div>

                            {filteredMaterials.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {filteredMaterials.map((item) => (
                                        <div key={item.id}
                                            className="bg-white/20 backdrop-blur-md rounded-2xl border border-white/20 p-4 space-y-3 shadow">

                                            {/* Info */}
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h3 className="font-semibold text-orange-600">{item.name}</h3>
                                                    <p className="text-xs text-orange-600/60">Stok: {item.stock} {item.unit}</p>
                                                </div>
                                                <div className="flex flex-col items-end gap-1">
                                                    <span className="text-xs px-2 py-0.5 rounded-lg bg-orange-500/30 text-orange-800">{item.unit}</span>
                                                    <span className={`text-xs px-2 py-0.5 rounded-lg font-semibold
                                                        ${item.stock <= item.min_stock ? "bg-red-500/40 text-red-800" : "bg-green-500/40 text-green-800"}`}>
                                                        {item.stock <= item.min_stock ? "Menipis" : "Aman"}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Harga */}
                                            <div className="grid grid-cols-2 gap-2">
                                                <div className="bg-white/10 rounded-xl p-2.5">
                                                    <p className="text-xs text-orange-600/90">Harga Beli</p>
                                                    <p className="font-bold text-orange-800 text-sm">{formatRp(item.buy_price)}</p>
                                                </div>
                                                <div className="bg-white/10 rounded-xl p-2.5">
                                                    <p className="text-xs text-orange-600/90">Nilai Stok</p>
                                                    <p className="font-bold text-green-800 text-sm">
                                                        {formatRp(
                                                            Number(item.initial_qty) > 0
                                                                ? (Number(item.buy_price) / Number(item.initial_qty)) * Number(item.stock)
                                                                : 0
                                                        )}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Stock adjustment */}
                                            <div className="grid grid-cols-3 gap-2">
                                                <select
                                                    value={stockModes[item.id] || "in"}
                                                    onChange={(e) => setStockModes((p) => ({ ...p, [item.id]: e.target.value }))}
                                                    className="px-2 py-2 rounded-xl bg-white/60 border border-white/50 text-orange-600 text-sm focus:outline-none"
                                                >
                                                    <option value="in">Masuk</option>
                                                    <option value="out">Keluar</option>
                                                </select>
                                                <input
                                                    type="number" min="1" placeholder="Qty"
                                                    value={qtyInputs[item.id] || ""}
                                                    onChange={(e) => setQtyInputs((p) => ({ ...p, [item.id]: e.target.value }))}
                                                    className="px-2 py-2 rounded-xl bg-white/60 border border-white/50 text-orange-600 text-sm placeholder-orange-300 focus:outline-none"
                                                />
                                                <button type="button" onClick={() => adjustStock(item)}
                                                    className="py-2 rounded-xl bg-green-500 text-white font-semibold text-sm hover:bg-green-600 transition">
                                                    Proses
                                                </button>
                                            </div>

                                            {/* Action */}
                                            <div className="flex justify-end gap-2 pt-1 border-t border-white/10">
                                                <button type="button" onClick={() => openEditMaterial(item)}
                                                    className="px-3 py-1.5 rounded-xl bg-blue-500/30 text-blue-800 text-xs font-semibold hover:bg-blue-500/50 transition">
                                                    Edit
                                                </button>
                                                <button type="button"
                                                    onClick={() => router.delete(`/bahan/${item.id}`, {
                                                        onSuccess: () => showNotif("success", "Bahan dihapus!"),
                                                    })}
                                                    className="px-3 py-1.5 rounded-xl bg-red-500/30 text-red-800 text-xs font-semibold hover:bg-red-500/50 transition">
                                                    Hapus
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12 text-white/50">Belum ada bahan.</div>
                            )}
                        </GlassCard>
                    )}

                    {/* ── PENGGUNA TAB ───────────────────────────────────────── */}
                    {isSuperadmin && tab === "pengguna" && (
                        <GlassCard className="p-4 space-y-4">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h2 className="font-bold text-white text-lg">Master Pengguna</h2>
                                    <p className="text-xs text-white/60">Daftar pengguna sistem</p>
                                </div>
                                <button type="button" onClick={openAddUser}
                                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white text-orange-500 font-semibold text-sm hover:bg-orange-50 transition shadow">
                                    <PlusIcon className="w-4 h-4" /> Tambah Pengguna
                                </button>
                            </div>

                            <div className="space-y-3">
                                {users.map((user) => (
                                    <div key={user.id}
                                        className="bg-white/20 backdrop-blur-md rounded-2xl border border-white/20 p-4 flex flex-col sm:flex-row sm:items-center gap-3 justify-between shadow">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-white text-orange-500 flex items-center justify-center font-bold text-sm shrink-0">
                                                {getInitials(user.name)}
                                            </div>
                                            <div>
                                                <p className="font-bold text-orange-800">{user.name}</p>
                                                <p className="text-xs text-orange-800">{user.email}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="px-3 py-1 rounded-lg bg-orange-500/30 text-orange-800 text-xs font-semibold capitalize">
                                                {user.roles.map((r) => r.name).join(", ")}
                                            </span>
                                            <button type="button" onClick={() => openEditUser(user)}
                                                className="px-3 py-1.5 rounded-xl bg-blue-500/30 text-blue-800 text-xs font-semibold hover:bg-blue-500/50 transition">
                                                Edit
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                {users.length === 0 && (
                                    <div className="text-center py-12 text-white/50">Belum ada pengguna.</div>
                                )}
                            </div>
                        </GlassCard>
                    )}

                </div>
            </div>

            {/* ══ MODAL MENU ══════════════════════════════════════════════════ */}
            <Modal show={showMenuModal} onClose={() => setShowMenuModal(false)}
                title="Tambah Menu" subtitle="Tambahkan produk baru ke daftar menu"
                footer={<>
                    <button onClick={() => setShowMenuModal(false)}
                        className="px-5 py-2 rounded-xl bg-white/20 text-white hover:bg-white/30 transition text-sm">Batal</button>
                    <button onClick={saveMenu}
                        className="px-5 py-2 rounded-xl bg-white text-orange-500 font-semibold hover:bg-orange-50 transition text-sm">Simpan</button>
                </>}>
                <div>
                    <label className={labelCls}>Nama Menu</label>
                    <input placeholder="Contoh: Americano" className={inputCls}
                        onChange={(e) => setData("name", e.target.value)} />
                </div>
                <div>
                    <label className={labelCls}>Kategori</label>
                    <select className={inputCls} onChange={(e) => setData("category_id", e.target.value)}>
                        <option value="">Pilih Kategori</option>
                        {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                </div>
                <div>
                    <label className={labelCls}>Harga Jual</label>
                    <input type="number" placeholder="0" className={inputCls}
                        onChange={(e) => setData("selling_price", e.target.value)} />
                </div>
            </Modal>

            {/* ══ MODAL BAHAN ═════════════════════════════════════════════════ */}
            <Modal show={showMaterialModal} onClose={() => setShowMaterialModal(false)}
                title={editingMaterial ? "Edit Bahan" : "Tambah Bahan"} subtitle="Kelola bahan baku inventory"
                footer={<>
                    <button onClick={() => setShowMaterialModal(false)}
                        className="px-5 py-2 rounded-xl bg-white/20 text-white hover:bg-white/30 transition text-sm">Batal</button>
                    <button onClick={saveMaterial}
                        className="px-5 py-2 rounded-xl bg-white text-orange-500 font-semibold hover:bg-orange-50 transition text-sm">Simpan</button>
                </>}>
                <div>
                    <label className={labelCls}>Nama Bahan</label>
                    <input value={data.name} onChange={(e) => setData("name", e.target.value)} placeholder="Nama Bahan" className={inputCls} />
                </div>
                <div>
                    <label className={labelCls}>Satuan</label>
                    <select value={data.unit} onChange={(e) => setData("unit", e.target.value)} className={inputCls}>
                        <option value="pcs">pcs</option>
                        <option value="gr">gr</option>
                        <option value="ml">ml</option>
                        <option value="liter">liter</option>
                    </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className={labelCls}>Stok</label>
                        <input type="number" value={data.stock} onChange={(e) => setData("stock", e.target.value)} placeholder="0" className={inputCls} />
                    </div>
                    <div>
                        <label className={labelCls}>Min Stok</label>
                        <input type="number" value={data.min_stock} onChange={(e) => setData("min_stock", e.target.value)} placeholder="0" className={inputCls} />
                    </div>
                </div>
                <div>
                    <label className={labelCls}>Harga Beli</label>
                    <input type="number" value={data.buy_price} onChange={(e) => setData("buy_price", e.target.value)} placeholder="0" className={inputCls} />
                </div>
                <label className="flex items-center gap-3 bg-white/10 border border-white/20 rounded-xl px-4 py-3 cursor-pointer">
                    <input type="checkbox" checked={data.use_initial_qty}
                        onChange={(e) => setData("use_initial_qty", e.target.checked)}
                        className="w-4 h-4 accent-orange-500" />
                    <span className="text-sm text-white/80">Gunakan stok ini sebagai kuantitas awal</span>
                </label>
            </Modal>

            {/* ══ MODAL PENGGUNA ══════════════════════════════════════════════ */}
            <Modal show={showUserModal} onClose={() => setShowUserModal(false)}
                title={editingUser ? "Edit Pengguna" : "Tambah Pengguna"} subtitle="Kelola pengguna sistem"
                footer={<>
                    <button onClick={() => setShowUserModal(false)}
                        className="px-5 py-2 rounded-xl bg-white/20 text-white hover:bg-white/30 transition text-sm">Batal</button>
                    <button onClick={saveUser}
                        className="px-5 py-2 rounded-xl bg-white text-orange-500 font-semibold hover:bg-orange-50 transition text-sm">Simpan</button>
                </>}>
                <div>
                    <label className={labelCls}>Nama Lengkap</label>
                    <input value={data.name} onChange={(e) => setData("name", e.target.value)}
                        placeholder="Nama" disabled={!!editingUser}
                        className={`${inputCls} ${editingUser ? "opacity-50 cursor-not-allowed" : ""}`} />
                </div>
                <div>
                    <label className={labelCls}>Email</label>
                    <input type="email" value={data.email} onChange={(e) => setData("email", e.target.value)}
                        placeholder="Email" disabled={!!editingUser}
                        className={`${inputCls} ${editingUser ? "opacity-50 cursor-not-allowed" : ""}`} />
                </div>
                {!editingUser && (
                    <div>
                        <label className={labelCls}>Password</label>
                        <input type="password" value={data.password} onChange={(e) => setData("password", e.target.value)}
                            placeholder="Password" className={inputCls} />
                    </div>
                )}
                <div>
                    <label className={labelCls}>Role</label>
                    <select value={data.role} onChange={(e) => setData("role", e.target.value)} className={inputCls}>
                        <option value="">Pilih Role</option>
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                        <option value="superadmin">Superadmin</option>
                    </select>
                </div>
            </Modal>

            {/* ══ MODAL RESEP ═════════════════════════════════════════════════ */}
            {showRecipeModal && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center px-4">
                    <div className="w-full max-w-xl bg-white/10 backdrop-blur-2xl rounded-3xl border border-white/30 shadow-2xl text-white overflow-hidden">
                        {/* Header */}
                        <div className="px-6 py-4 border-b border-white/20 flex justify-between items-center">
                            <div>
                                <h2 className="text-lg font-bold">Atur Resep</h2>
                                <p className="text-xs text-white/60">{selectedProduct?.name}</p>
                            </div>
                            <button onClick={() => setShowRecipeModal(false)} className="hover:bg-white/20 p-1.5 rounded-lg transition">
                                <XMarkIcon className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="p-6 space-y-3 max-h-[60vh] overflow-y-auto no-scrollbar">
                            {recipeItems.map((row, index) => {
                                const mat = materials.find((m) => String(m.id) === String(row.material_id));
                                const cost = mat && Number(mat.initial_qty) > 0
                                    ? (Number(mat.buy_price) / Number(mat.initial_qty)) * Number(row.qty || 0)
                                    : 0;
                                return (
                                    <div key={index} className="grid grid-cols-12 gap-2 items-center">
                                        <div className="col-span-5">
                                            <select value={row.material_id}
                                                onChange={(e) => {
                                                    const u = [...recipeItems];
                                                    u[index].material_id = e.target.value;
                                                    setRecipeItems(u);
                                                }}
                                                className="w-full px-3 py-2 rounded-xl bg-white/20 border border-white/20 text-white text-sm focus:outline-none">
                                                <option value="">Pilih Bahan</option>
                                                {materials.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
                                            </select>
                                        </div>
                                        <div className="col-span-2">
                                            <input type="number" placeholder="Qty"
                                                value={row.qty === 0 ? "" : row.qty}
                                                onChange={(e) => {
                                                    const u = [...recipeItems];
                                                    u[index].qty = e.target.value;
                                                    setRecipeItems(u);
                                                }}
                                                className="w-full px-3 py-2 rounded-xl bg-white/20 border border-white/20 text-white text-sm focus:outline-none placeholder-white/40" />
                                        </div>
                                        <div className="col-span-1 text-xs text-white/60 font-semibold">{mat?.unit || ""}</div>
                                        <div className="col-span-3">
                                            <div className="px-3 py-2 rounded-xl bg-white/10 border border-white/10 text-cyan-300 font-semibold text-xs">
                                                {formatRp(Math.round(cost))}
                                            </div>
                                        </div>
                                        <div className="col-span-1 flex justify-center">
                                            <button type="button"
                                                onClick={() => setRecipeItems(recipeItems.filter((_, i) => i !== index))}
                                                className="text-red-300 hover:text-red-400 transition">
                                                <XMarkIcon className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}

                            <button type="button"
                                onClick={() => setRecipeItems([...recipeItems, { material_id: "", qty: "" }])}
                                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/20 text-white text-sm hover:bg-white/30 transition">
                                <PlusIcon className="w-4 h-4" /> Tambah Bahan
                            </button>

                            {/* Total HPP */}
                            <div className="border-t border-white/20 pt-3 flex justify-between items-center">
                                <span className="text-white/60 text-sm">Total HPP</span>
                                <span className="text-xl font-bold text-orange-300">{formatRp(Math.round(recipeTotalHPP))}</span>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="px-6 py-4 border-t border-white/20 bg-black/10 flex justify-end gap-3">
                            <button onClick={() => setShowRecipeModal(false)}
                                className="px-5 py-2 rounded-xl bg-white/20 text-white hover:bg-white/30 transition text-sm">Batal</button>
                            <button onClick={saveRecipe}
                                className="px-5 py-2 rounded-xl bg-white text-orange-500 font-semibold hover:bg-orange-50 transition text-sm">Simpan</button>
                        </div>
                    </div>
                </div>
            )}

        </AuthenticatedLayout>
    );
}