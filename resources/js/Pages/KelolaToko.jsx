import { useMemo, useState, useRef, useEffect } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, router, useForm } from "@inertiajs/react";
import {
    PencilSquareIcon, TrashIcon, BeakerIcon, UserGroupIcon,
    ShoppingBagIcon, CubeIcon, PlusIcon, XMarkIcon,
    MagnifyingGlassIcon, CheckCircleIcon, ExclamationCircleIcon,
    ChevronDownIcon, CameraIcon,
} from "@heroicons/react/24/solid";

// ─── Custom Select ────────────────────────────────────────────────────────────
function CustomSelect({ value, onChange, options, placeholder = "Pilih...", disabled = false }) {
    const [open, setOpen] = useState(false);
    const ref = useRef();
    const selected = options.find(o => String(o.value) === String(value));

    useEffect(() => {
        const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    return (
        <div ref={ref} className="relative w-full">
            <button type="button" disabled={disabled}
                onClick={() => !disabled && setOpen(!open)}
                className={`w-full rounded-xl bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 px-4 py-2.5 text-left
                    flex items-center justify-between transition
                    ${disabled ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-100 dark:hover:bg-slate-600 cursor-pointer"}
                    focus:outline-none focus:ring-2 focus:ring-orange-300`}>
                <span className={selected ? "text-gray-900 dark:text-white" : "text-gray-400 dark:text-slate-400"}>
                    {selected ? selected.label : placeholder}
                </span>
                <ChevronDownIcon className={`w-4 h-4 text-gray-400 dark:text-slate-400 transition-transform ${open ? "rotate-180" : ""}`} />
            </button>
            {open && (
                <div className="absolute z-[60] mt-1 w-full rounded-xl bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 shadow-xl max-h-60 overflow-y-auto overscroll-contain no-scrollbar">
                    {options.map((opt) => (
                        <div key={opt.value}
                            onClick={() => { onChange(opt.value); setOpen(false); }}
                            className={`px-4 py-2.5 text-sm cursor-pointer transition
                                ${String(value) === String(opt.value) ? "bg-orange-50 dark:bg-slate-600 text-orange-600 dark:text-white font-semibold" : "text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-600"}`}>
                            {opt.label}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

// ─── Inline Category Select ───────────────────────────────────────────────────
function InlineCategorySelect({ value, onChange, categories, onCategoryCreated, showNotif }) {
    const [addingNew, setAddingNew] = useState(false);
    const [newName, setNewName] = useState("");
    const [saving, setSaving] = useState(false);
    const inputRef = useRef();

    useEffect(() => {
        if (addingNew && inputRef.current) inputRef.current.focus();
    }, [addingNew]);

    const handleCreate = () => {
        if (!newName.trim()) return;
        setSaving(true);
        router.post("/categories", { name: newName.trim() }, {
            preserveScroll: true,
            onSuccess: (page) => {
                // categories prop updated via Inertia — pick the newest one by name
                const created = page.props.categories?.find(c => c.name === newName.trim())
                    ?? page.props.categories?.at(-1);
                if (created) {
                    onChange(created.id);
                    onCategoryCreated(created);
                }
                setNewName("");
                setAddingNew(false);
                showNotif("success", `Kategori "${newName.trim()}" ditambahkan!`);
            },
            onError: () => showNotif("error", "Gagal menambah kategori."),
            onFinish: () => setSaving(false),
        });
    };

    const options = [{ value: "", label: "Pilih Kategori" }, ...categories.map(c => ({ value: c.id, label: c.name }))];

    return (
        <div className="space-y-2">
            <CustomSelect value={value} onChange={onChange} options={options} placeholder="Pilih Kategori" />
            {!addingNew ? (
                <button type="button" onClick={() => setAddingNew(true)}
                    className="flex items-center gap-1 text-xs text-orange-500 hover:text-orange-600 font-medium transition">
                    <PlusIcon className="w-3.5 h-3.5" /> Tambah kategori baru
                </button>
            ) : (
                <div className="flex gap-2 items-center">
                    <input
                        ref={inputRef}
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter") handleCreate(); if (e.key === "Escape") setAddingNew(false); }}
                        placeholder="Nama kategori baru..."
                        className="flex-1 rounded-xl bg-gray-50 dark:bg-slate-700 border border-orange-300 dark:border-orange-500 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-300"
                    />
                    <button type="button" onClick={handleCreate} disabled={!newName.trim() || saving}
                        className="px-3 py-2 rounded-xl bg-orange-500 text-white text-xs font-semibold hover:bg-orange-600 transition disabled:opacity-50">
                        {saving ? "..." : "Simpan"}
                    </button>
                    <button type="button" onClick={() => { setAddingNew(false); setNewName(""); }}
                        className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-700 transition">
                        <XMarkIcon className="w-4 h-4 text-gray-400" />
                    </button>
                </div>
            )}
        </div>
    );
}

// ─── Notification ─────────────────────────────────────────────────────────────
function Notification({ notif }) {
    if (!notif) return null;
    const isSuccess = notif.type === "success";
    return (
        <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-[70]
            ${isSuccess ? "bg-green-500" : "bg-red-500"}
            text-white rounded-2xl shadow-2xl p-5 max-w-sm w-full`}>
            <div className="flex items-center gap-3">
                {isSuccess ? <CheckCircleIcon className="w-7 h-7 shrink-0" /> : <ExclamationCircleIcon className="w-7 h-7 shrink-0" />}
                <div>
                    <p className="font-bold">{notif.title}</p>
                    {notif.message && <p className="text-sm opacity-90">{notif.message}</p>}
                </div>
            </div>
        </div>
    );
}

function TabBtn({ active, onClick, icon: Icon, label }) {
    return (
        <button type="button" onClick={onClick}
            className={`w-full sm:w-auto flex items-center justify-center gap-2 px-2 sm:px-5 py-3 sm:py-2.5 rounded-xl font-semibold text-sm transition-all duration-200
                ${active ? "bg-orange-500 text-white shadow-md" : "bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-600"}`}>
            <Icon className="w-4 h-4" />{label}
        </button>
    );
}

function GlassCard({ children, className = "" }) {
    return (
        <div className={`bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm ${className}`}>
            {children}
        </div>
    );
}

function Modal({ show, onClose, title, subtitle, children, footer }) {
    if (!show) return null;
    return (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center px-4 pb-16 sm:pb-0">
            <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-3xl border border-gray-200 dark:border-slate-700 shadow-2xl overflow-visible">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-700 flex justify-between items-center">
                    <div>
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white">{title}</h2>
                        {subtitle && <p className="text-xs text-gray-500 dark:text-slate-400">{subtitle}</p>}
                    </div>
                    <button onClick={onClose} className="hover:bg-gray-100 dark:hover:bg-slate-700 p-1.5 rounded-lg transition text-gray-500 dark:text-slate-400">
                        <XMarkIcon className="w-5 h-5" />
                    </button>
                </div>
                <div className="p-6 space-y-3 overflow-visible">{children}</div>
                {footer && (
                    <div className="px-6 py-4 border-t border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900/50 flex justify-end gap-3 rounded-b-3xl">
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );
}

const inputCls = "w-full rounded-xl bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 px-4 py-2.5 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-300 dark:focus:ring-orange-500 transition";
const labelCls = "block text-xs font-semibold text-gray-600 dark:text-slate-400 mb-1";

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function KelolaToko({ auth, products = [], categories = [], materials = [], users = [] }) {
    const [tab, setTab] = useState("menu");
    const [search, setSearch] = useState("");
    const [notif, setNotif] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState(null);

    // Category management state
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [categoryName, setCategoryName] = useState("");
    const [categoryLoading, setCategoryLoading] = useState(false);

    const [showMenuModal, setShowMenuModal] = useState(false);
    const [showMaterialModal, setShowMaterialModal] = useState(false);
    const [showUserModal, setShowUserModal] = useState(false);
    const [showRecipeModal, setShowRecipeModal] = useState(false);
    const [showEditMenuModal, setShowEditMenuModal] = useState(false);
    const [editingMaterial, setEditingMaterial] = useState(null);
    const [editingUser, setEditingUser] = useState(null);
    const [editingProduct, setEditingProduct] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [qtyInputs, setQtyInputs] = useState({});
    const [stockModes, setStockModes] = useState({});
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [recipeItems, setRecipeItems] = useState([]);

    const isSuperadmin = auth?.roles?.includes("superadmin");

    const showNotif = (type, title, message) => {
        setNotif({ type, title, message });
        setTimeout(() => setNotif(null), 3500);
    };

    const { data, setData, post, put, reset, errors } = useForm({
        name: "", category_id: "", selling_price: "", image: null,
        sku: "SKU-" + Date.now(), cost_price: 0, stock: 0, unit: "pcs",
        is_active: 1, min_stock: 0, buy_price: 0, qty: 0,
        initial_qty: 0, use_initial_qty: false,
        email: "", password: "", role: "",
    });

    const filteredProducts = useMemo(() =>
        products.filter((i) => {
            const matchSearch = (i.name || "").toLowerCase().includes(search.toLowerCase());
            const matchCat = selectedCategory === null || i.category_id === selectedCategory;
            return matchSearch && matchCat;
        }),
        [products, search, selectedCategory]);

    const filteredMaterials = useMemo(() =>
        materials.filter((i) => (i.name || "").toLowerCase().includes(search.toLowerCase())),
        [materials, search]);

    const openAddCategory = () => {
        setEditingCategory(null);
        setCategoryName("");
        setShowCategoryModal(true);
    };

    const openEditCategory = (cat) => {
        setEditingCategory(cat);
        setCategoryName(cat.name);
        setShowCategoryModal(true);
    };

    const saveCategory = () => {
        if (!categoryName.trim()) return;
        setCategoryLoading(true);
        if (editingCategory) {
            router.put(`/categories/${editingCategory.id}`, { name: categoryName }, {
                preserveScroll: true,
                onSuccess: () => { setShowCategoryModal(false); showNotif("success", "Kategori diperbarui!"); },
                onError: () => showNotif("error", "Gagal memperbarui kategori."),
                onFinish: () => setCategoryLoading(false),
            });
        } else {
            router.post("/categories", { name: categoryName }, {
                preserveScroll: true,
                onSuccess: () => { setShowCategoryModal(false); showNotif("success", "Kategori ditambahkan!"); },
                onError: () => showNotif("error", "Gagal menambah kategori."),
                onFinish: () => setCategoryLoading(false),
            });
        }
    };

    const deleteCategory = (cat) => {
        if (!confirm(`Hapus kategori "${cat.name}"?`)) return;
        router.delete(`/categories/${cat.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                if (selectedCategory === cat.id) setSelectedCategory(null);
                showNotif("success", "Kategori dihapus!");
            },
            onError: (errors) => showNotif("error", errors?.message || "Kategori masih digunakan produk."),
        });
    };

    const getInitials = (name = "") => name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
    const formatRp = (v) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(v || 0);

    const categoryOptions = [{ value: "", label: "Pilih Kategori" }, ...categories.map(c => ({ value: c.id, label: c.name }))];
    const unitOptions = [{ value: "pcs", label: "pcs" }, { value: "gr", label: "gr" }, { value: "ml", label: "ml" }, { value: "liter", label: "liter" }];
    const roleOptions = [{ value: "", label: "Pilih Role" }, { value: "user", label: "User" }, { value: "admin", label: "Admin" }, { value: "superadmin", label: "Superadmin" }];
    const stockModeOptions = [{ value: "in", label: "Masuk" }, { value: "out", label: "Keluar" }];
    const materialOptions = [{ value: "", label: "Pilih Bahan" }, ...materials.map(m => ({ value: m.id, label: m.name }))];

    // ── Menu ──────────────────────────────────────────────────────────────────
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

    const openEditMenu = (item) => {
        setEditingProduct(item);
        setImagePreview(item.image ? `/storage/${item.image}` : null);
        setData({
            name: item.name ?? "", category_id: item.category_id ?? "",
            selling_price: item.selling_price ?? "", sku: item.sku ?? "",
            cost_price: item.cost_price ?? 0, stock: item.stock ?? 0,
            unit: item.unit ?? "pcs", is_active: item.is_active ? 1 : 0,
            min_stock: item.min_stock ?? 0, image: null,
        });
        setShowEditMenuModal(true);
    };

    const saveEditMenu = () => {
        router.post(`/products/${editingProduct.id}`, {
            _method: 'PUT',
            name: data.name,
            category_id: data.category_id,
            selling_price: Number(data.selling_price),
            sku: editingProduct.sku,
            cost_price: Number(editingProduct.cost_price ?? 0),
            stock: Math.max(0, Math.floor(Number(editingProduct.stock ?? 0))),
            unit: editingProduct.unit ?? "pcs",
            is_active: editingProduct.is_active ? 1 : 0,
            ...(data.image ? { image: data.image } : {}),
        }, {
            forceFormData: true, preserveScroll: true,
            onSuccess: () => { setShowEditMenuModal(false); setEditingProduct(null); setImagePreview(null); reset(); showNotif("success", "Menu berhasil diupdate!"); },
            onError: (e) => showNotif("error", "Gagal mengupdate menu."),
        });
    };

    // ── Material ──────────────────────────────────────────────────────────────
    const openAddMaterial = () => {
        setEditingMaterial(null); reset();
        setData({ name: "", stock: "", unit: "pcs", min_stock: "", buy_price: "", qty: "", use_initial_qty: false });
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

    // ── User ──────────────────────────────────────────────────────────────────
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
        setRecipeItems(item.recipe?.items?.length ? item.recipe.items.map((r) => ({ material_id: r.material_id, qty: r.qty })) : [{ material_id: "", qty: "" }]);
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
        if (mat && Number(mat.initial_qty) > 0)
            return total + (Number(mat.buy_price) / Number(mat.initial_qty)) * Number(row.qty || 0);
        return total;
    }, 0);

    return (
        <AuthenticatedLayout hideSearch>
            <Head title="Kelola Toko" />
            <Notification notif={notif} />

            <div className="flex flex-col gap-4 h-full">

                {/* TOP BAR */}
                <GlassCard className="px-5 py-3 flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
                    <h1 className="text-xl font-bold text-gray-900 dark:text-white">Kelola Toko</h1>
                    <div className="
    grid grid-cols-3 gap-2 w-full
    sm:flex sm:flex-wrap sm:w-auto
">

    <TabBtn
        active={tab === "menu"}
        onClick={() => setTab("menu")}
        icon={ShoppingBagIcon}
        label="Menu"
    />

    <TabBtn
        active={tab === "bahan"}
        onClick={() => setTab("bahan")}
        icon={CubeIcon}
        label="Bahan"
    />


</div>
                    <div className="flex items-center bg-white/20 rounded-full px-3 py-1.5 gap-2 w-full sm:w-64">
                        <MagnifyingGlassIcon className="w-4 h-4 text-gray-400 dark:text-slate-400 shrink-0" />
                        <input placeholder="Cari..." value={search} onChange={(e) => setSearch(e.target.value)}
                            className="bg-transparent flex-1 text-orange-400 dark:text-white font-bold placeholder-white/90 text-sm outline-none focus:outline-none focus:ring-0 border-none" />
                    </div>
                </GlassCard>

                <div className="flex-1 overflow-auto no-scrollbar">

                    {/* ── MENU TAB ──────────────────────────────────────────── */}
                    {tab === "menu" && (
                        <GlassCard className="p-4 space-y-4">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h2 className="font-bold text-gray-900 dark:text-white text-lg">Master Menu</h2>
                                    <p className="text-xs text-gray-500 dark:text-slate-400">Daftar menu yang tersedia</p>
                                </div>
                                <button type="button" onClick={openAddMenu}
                                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white text-orange-500 font-semibold text-sm hover:bg-orange-50 transition shadow">
                                    <PlusIcon className="w-4 h-4" /> Tambah Menu
                                </button>
                            </div>

                            {/* CATEGORY PILLS */}
                            <div className="flex items-center gap-2 flex-wrap">
                                <button
                                    onClick={() => setSelectedCategory(null)}
                                    className={`px-4 py-1.5 rounded-xl text-sm font-medium border transition ${selectedCategory === null ? "bg-orange-500 text-white border-orange-500" : "bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300 border-gray-200 dark:border-slate-600 hover:bg-orange-50"}`}>
                                    Semua
                                </button>
                                {categories.map((cat) => (
                                    <div key={cat.id} className="flex items-center gap-1">
                                        <button
                                            onClick={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)}
                                            className={`px-4 py-1.5 rounded-xl text-sm font-medium border transition ${selectedCategory === cat.id ? "bg-orange-500 text-white border-orange-500" : "bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300 border-gray-200 dark:border-slate-600 hover:bg-orange-50"}`}>
                                            {cat.name}
                                            <span className="ml-1.5 text-xs opacity-60">({cat.products_count})</span>
                                        </button>
                                        <button onClick={() => openEditCategory(cat)}
                                            className="p-1 rounded-lg text-gray-400 hover:text-blue-500 transition">
                                            <PencilSquareIcon className="w-3.5 h-3.5" />
                                        </button>
                                        <button onClick={() => deleteCategory(cat)}
                                            className="p-1 rounded-lg text-gray-400 hover:text-red-500 transition">
                                            <TrashIcon className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                ))}
                                <button onClick={openAddCategory}
                                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-sm font-medium border border-dashed border-orange-300 text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-500/10 transition">
                                    <PlusIcon className="w-3.5 h-3.5" /> Kategori
                                </button>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-4">
                                {filteredProducts.map((item) => (
                                    <div key={item.id} className="bg-white/20 backdrop-blur-md rounded-2xl overflow-hidden border border-white/20 hover:scale-[1.02] transition-all duration-200 shadow">
                                        <div className="relative aspect-square bg-gradient-to-br from-orange-300 to-orange-500 flex items-center justify-center text-white text-2xl font-bold overflow-hidden">
                                            {item.image ? <img src={`/storage/${item.image}`} alt={item.name} className="w-full h-full object-cover" /> : <span>{getInitials(item.name)}</span>}
                                            <span className={`absolute top-2 right-2 px-2 py-1 rounded-lg text-xs font-semibold ${item.available_stock > 0 ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"}`}>
                                                {item.available_stock > 0 ? "Ready" : "Habis"}
                                            </span>
                                        </div>
                                        <div className="p-3 space-y-2">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <p className="font-semibold text-orange-600 dark:text-white text-sm">{item.name}</p>
                                                    <p className="text-xs text-orange-600/90 dark:text-white/70">{item.category?.name ?? "-"}</p>
                                                </div>
                                                <p className="font-bold text-orange-600 dark:text-white text-sm">{formatRp(item.selling_price)}</p>
                                            </div>
                                            <p className="text-xs text-orange-600/60 dark:text-gray-400 dark:text-slate-500">Stok: {Math.floor(item.available_stock || 0)}</p>
                                            <div className="flex gap-2 pt-1">
                                                <button type="button" onClick={() => openRecipe(item)}
                                                    className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg bg-purple-500/40 text-purple-800 dark:text-white text-xs font-semibold hover:bg-purple-500/60 transition">
                                                    <BeakerIcon className="w-3.5 h-3.5" /> Resep
                                                </button>
                                                <button type="button" onClick={() => openEditMenu(item)}
                                                    className="p-1.5 rounded-lg bg-blue-500/30 text-blue-800 dark:text-white hover:bg-blue-500/50 transition">
                                                    <PencilSquareIcon className="w-4 h-4" />
                                                </button>
                                                <button type="button" onClick={() => router.delete(`/products/${item.id}`, { onSuccess: () => showNotif("success", "Menu dihapus!") })}
                                                    className="p-1.5 rounded-lg bg-red-500/30 text-red-800 dark:text-white hover:bg-red-500/50 transition">
                                                    <TrashIcon className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {filteredProducts.length === 0 && <div className="col-span-full text-center py-12 text-gray-400 dark:text-slate-500">Belum ada menu.</div>}
                            </div>
                        </GlassCard>
                    )}

                    {/* ── BAHAN TAB ─────────────────────────────────────────── */}
                    {tab === "bahan" && (
                        <GlassCard className="p-4 space-y-4">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h2 className="font-bold text-gray-900 dark:text-white text-lg">Master Bahan</h2>
                                    <p className="text-xs text-gray-500 dark:text-slate-400">Daftar bahan baku</p>
                                </div>
                                <button type="button" onClick={openAddMaterial}
                                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white text-orange-500 font-semibold text-sm hover:bg-orange-50 transition shadow">
                                    <PlusIcon className="w-4 h-4" /> Tambah Bahan
                                </button>
                            </div>
                            {filteredMaterials.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {filteredMaterials.map((item) => (
                                        <div key={item.id} className="bg-white/20 backdrop-blur-md rounded-2xl border border-white/20 p-4 space-y-3 shadow">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h3 className="font-semibold text-orange-600 dark:text-white">{item.name}</h3>
                                                    <p className="text-xs text-orange-600/60 dark:text-gray-400 dark:text-slate-500">Stok: {item.stock} {item.unit}</p>
                                                </div>
                                                <div className="flex flex-col items-end gap-1">
                                                    <span className="text-xs px-2 py-0.5 rounded-lg bg-orange-500/30 text-orange-800 dark:text-white">{item.unit}</span>
                                                    <span className={`text-xs px-2 py-0.5 rounded-lg font-semibold ${item.stock <= item.min_stock ? "bg-red-500/40 text-red-800 dark:text-white" : "bg-green-500/40 text-green-800 dark:text-white"}`}>
                                                        {item.stock <= item.min_stock ? "Menipis" : "Aman"}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-2">
                                                <div className="bg-white/10 rounded-xl p-2.5">
                                                    <p className="text-xs text-orange-600/90 dark:text-white/70">Harga Beli</p>
                                                    <p className="font-bold text-orange-800 dark:text-white text-sm">{formatRp(item.buy_price)}</p>
                                                </div>
                                                <div className="bg-white/10 rounded-xl p-2.5">
                                                    <p className="text-xs text-orange-600/90 dark:text-white/70">Nilai Stok</p>
                                                    <p className="font-bold text-green-800 dark:text-white text-sm">
                                                        {formatRp(Number(item.initial_qty) > 0 ? (Number(item.buy_price) / Number(item.initial_qty)) * Number(item.stock) : 0)}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-3 gap-2">
                                                <CustomSelect value={stockModes[item.id] || "in"} onChange={(v) => setStockModes((p) => ({ ...p, [item.id]: v }))} options={stockModeOptions} />
                                                <input type="number" min="1" placeholder="Qty" value={qtyInputs[item.id] || ""}
                                                    onChange={(e) => setQtyInputs((p) => ({ ...p, [item.id]: e.target.value }))}
                                                    className="px-2 py-2 rounded-xl bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 text-gray-900 dark:text-white text-sm placeholder-gray-400 focus:outline-none" />
                                                <button type="button" onClick={() => adjustStock(item)}
                                                    className="py-2 rounded-xl bg-white text-orange-500 font-semibold text-sm hover:bg-orange-50 transition">Proses</button>
                                            </div>
                                            <div className="flex justify-end gap-2 pt-1 border-t border-white/10">
                                                <button type="button" onClick={() => openEditMaterial(item)}
                                                    className="px-3 py-1.5 rounded-xl bg-blue-500/30 text-blue-800 dark:text-white text-xs font-semibold hover:bg-blue-500/50 transition">Edit</button>
                                                <button type="button" onClick={() => router.delete(`/bahan/${item.id}`, { onSuccess: () => showNotif("success", "Bahan dihapus!") })}
                                                    className="px-3 py-1.5 rounded-xl bg-red-500/30 text-red-800 dark:text-white text-xs font-semibold hover:bg-red-500/50 transition">Hapus</button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12 text-gray-400 dark:text-slate-500">Belum ada bahan.</div>
                            )}
                        </GlassCard>
                    )}

                    {/* ── PENGGUNA TAB ───────────────────────────────────────── */}
                    {isSuperadmin && tab === "pengguna" && (
                        <GlassCard className="p-4 space-y-4">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h2 className="font-bold text-gray-900 dark:text-white text-lg">Master Pengguna</h2>
                                    <p className="text-xs text-gray-500 dark:text-slate-400">Daftar pengguna sistem</p>
                                </div>
                                <button type="button" onClick={openAddUser}
                                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white text-orange-500 font-semibold text-sm hover:bg-orange-50 transition shadow">
                                    <PlusIcon className="w-4 h-4" /> Tambah Pengguna
                                </button>
                            </div>
                            <div className="space-y-3">
                                {users.map((user) => (
                                    <div key={user.id} className="bg-white/20 backdrop-blur-md rounded-2xl border border-white/20 p-4 flex flex-col sm:flex-row sm:items-center gap-3 justify-between shadow">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-white text-orange-500 flex items-center justify-center font-bold text-sm shrink-0">
                                                {getInitials(user.name)}
                                            </div>
                                            <div>
                                                <p className="font-bold text-orange-800 dark:text-white">{user.name}</p>
                                                <p className="text-xs text-orange-800 dark:text-white/70">{user.email}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="px-3 py-1 rounded-lg bg-orange-500/30 text-orange-800 dark:text-white text-xs font-semibold capitalize">
                                                {user.roles.map((r) => r.name).join(", ")}
                                            </span>
                                            <button type="button" onClick={() => openEditUser(user)}
                                                className="px-3 py-1.5 rounded-xl bg-blue-500/30 text-blue-800 dark:text-white text-xs font-semibold hover:bg-blue-500/50 transition">Edit</button>
                                        </div>
                                    </div>
                                ))}
                                {users.length === 0 && <div className="text-center py-12 text-gray-400 dark:text-slate-500">Belum ada pengguna.</div>}
                            </div>
                        </GlassCard>
                    )}

                </div>
            </div>

            {/* MODAL MENU */}
            <Modal show={showMenuModal} onClose={() => setShowMenuModal(false)}
                title="Tambah Menu" subtitle="Tambahkan produk baru ke daftar menu"
                footer={<>
                    <button onClick={() => setShowMenuModal(false)} className="px-5 py-2 rounded-xl bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-600 transition text-sm">Batal</button>
                    <button onClick={saveMenu} className="px-5 py-2 rounded-xl bg-white text-orange-500 font-semibold hover:bg-orange-50 transition text-sm">Simpan</button>
                </>}>
                <div><label className={labelCls}>Nama Menu</label>
                    <input placeholder="Contoh: Americano" className={inputCls} onChange={(e) => setData("name", e.target.value)} /></div>
                <div>
                    <label className={labelCls}>Kategori</label>
                    <InlineCategorySelect
                        value={data.category_id}
                        onChange={(v) => setData("category_id", v)}
                        categories={categories}
                        onCategoryCreated={(newCat) => setData("category_id", newCat.id)}
                        showNotif={showNotif}
                    />
                </div>
                <div><label className={labelCls}>Harga Jual</label>
                    <input type="number" placeholder="0" className={inputCls} onChange={(e) => setData("selling_price", e.target.value)} /></div>
            </Modal>

            {/* MODAL EDIT MENU */}
            <Modal show={showEditMenuModal} onClose={() => { setShowEditMenuModal(false); setImagePreview(null); }}
                title="Edit Menu" subtitle={`Edit produk: ${editingProduct?.name}`}
                footer={<>
                    <button onClick={() => { setShowEditMenuModal(false); setImagePreview(null); }} className="px-5 py-2 rounded-xl bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-600 transition text-sm">Batal</button>
                    <button onClick={saveEditMenu} className="px-5 py-2 rounded-xl bg-white text-orange-500 font-semibold hover:bg-orange-50 transition text-sm">Simpan</button>
                </>}>
                <div>
                    <label className={labelCls}>Foto Produk</label>
                    <div className="relative w-full h-36 rounded-xl overflow-hidden border border-white/30 bg-white/10 flex items-center justify-center cursor-pointer hover:bg-white/20 transition"
                        onClick={() => document.getElementById('edit-image-input').click()}>
                        {imagePreview ? (
                            <><img src={imagePreview} alt="preview" className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition">
                                    <p className="text-gray-900 dark:text-white text-sm font-semibold">Ganti Foto</p>
                                </div></>
                        ) : (
                            <div className="text-center text-gray-400 dark:text-slate-500">
                                <CameraIcon className="w-8 h-8 mx-auto mb-1" />
                                <p className="text-xs">Klik untuk upload foto</p>
                            </div>
                        )}
                    </div>
                    <input id="edit-image-input" type="file" accept="image/*" className="hidden"
                        onChange={(e) => {
                            const file = e.target.files[0];
                            if (file) {
                                if (file.size > 5 * 1024 * 1024) { showNotif("error", "Ukuran foto maksimal 5MB!"); return; }
                                setData("image", file);
                                setImagePreview(URL.createObjectURL(file));
                            }
                        }} />
                </div>
                <div><label className={labelCls}>Nama Menu</label>
                    <input value={data.name} onChange={(e) => setData("name", e.target.value)} placeholder="Nama Menu" className={inputCls} /></div>
                <div>
                    <label className={labelCls}>Kategori</label>
                    <InlineCategorySelect
                        value={data.category_id}
                        onChange={(v) => setData("category_id", v)}
                        categories={categories}
                        onCategoryCreated={(newCat) => setData("category_id", newCat.id)}
                        showNotif={showNotif}
                    />
                </div>
                <div><label className={labelCls}>Harga Jual</label>
                    <input type="number" value={data.selling_price} onChange={(e) => setData("selling_price", e.target.value)} placeholder="0" className={inputCls} /></div>
            </Modal>

            {/* MODAL BAHAN */}
            <Modal show={showMaterialModal} onClose={() => setShowMaterialModal(false)}
                title={editingMaterial ? "Edit Bahan" : "Tambah Bahan"} subtitle="Kelola bahan baku inventory"
                footer={<>
                    <button onClick={() => setShowMaterialModal(false)} className="px-5 py-2 rounded-xl bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-600 transition text-sm">Batal</button>
                    <button onClick={saveMaterial} className="px-5 py-2 rounded-xl bg-white text-orange-500 font-semibold hover:bg-orange-50 transition text-sm">Simpan</button>
                </>}>
                <div>
                    <label className={labelCls}>Nama Bahan</label>
                    <input value={data.name} onChange={(e) => setData("name", e.target.value)} placeholder="Nama Bahan" className={inputCls} />
                    {errors.name && (
                        <p className="mt-1.5 text-xs text-red-300 bg-red-500/20 border border-red-400/30 rounded-lg px-3 py-2">
                            {errors.name}
                        </p>
                    )}
                </div>
                <div><label className={labelCls}>Satuan</label>
                    <CustomSelect value={data.unit} onChange={(v) => setData("unit", v)} options={unitOptions} /></div>
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className={labelCls}>{editingMaterial ? "Stok" : "Stok Awal"}</label>
                        <input type="number" value={data.stock} onChange={(e) => setData("stock", e.target.value)} placeholder="0" className={inputCls} />
                        {!editingMaterial && <p className="text-gray-400 dark:text-slate-500 text-xs mt-1">Otomatis jadi kuantitas awal</p>}
                    </div>
                    <div><label className={labelCls}>Min Stok</label>
                        <input type="number" value={data.min_stock} onChange={(e) => setData("min_stock", e.target.value)} placeholder="0" className={inputCls} /></div>
                </div>
                <div><label className={labelCls}>Harga Beli</label>
                    <input type="number" value={data.buy_price} onChange={(e) => setData("buy_price", e.target.value)} placeholder="0" className={inputCls} /></div>
            </Modal>

            {/* MODAL PENGGUNA */}
            <Modal show={showUserModal} onClose={() => setShowUserModal(false)}
                title={editingUser ? "Edit Pengguna" : "Tambah Pengguna"} subtitle="Kelola pengguna sistem"
                footer={<>
                    <button onClick={() => setShowUserModal(false)} className="px-5 py-2 rounded-xl bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-600 transition text-sm">Batal</button>
                    <button onClick={saveUser} className="px-5 py-2 rounded-xl bg-white text-orange-500 font-semibold hover:bg-orange-50 transition text-sm">Simpan</button>
                </>}>
                <div><label className={labelCls}>Nama Lengkap</label>
                    <input value={data.name} onChange={(e) => setData("name", e.target.value)} placeholder="Nama" disabled={!!editingUser}
                        className={`${inputCls} ${editingUser ? "opacity-50 cursor-not-allowed" : ""}`} /></div>
                <div><label className={labelCls}>Email</label>
                    <input type="email" value={data.email} onChange={(e) => setData("email", e.target.value)} placeholder="Email" disabled={!!editingUser}
                        className={`${inputCls} ${editingUser ? "opacity-50 cursor-not-allowed" : ""}`} /></div>
                {!editingUser && (
                    <div><label className={labelCls}>Password</label>
                        <input type="password" value={data.password} onChange={(e) => setData("password", e.target.value)} placeholder="Password" className={inputCls} /></div>
                )}
                <div><label className={labelCls}>Role</label>
                    <CustomSelect value={data.role} onChange={(v) => setData("role", v)} options={roleOptions} placeholder="Pilih Role" /></div>
            </Modal>

            {/* MODAL RESEP */}
            {showRecipeModal && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center px-4 pb-16 sm:pb-0">
                    <div className="w-full max-w-xl bg-white dark:bg-slate-800 rounded-3xl border border-gray-200 dark:border-slate-700 shadow-2xl overflow-visible">
                        <div className="px-6 py-4 border-b border-white/20 flex justify-between items-center">
                            <div><h2 className="text-lg font-bold">Atur Resep</h2>
                                <p className="text-xs text-gray-500 dark:text-slate-400">{selectedProduct?.name}</p></div>
                            <button onClick={() => setShowRecipeModal(false)} className="hover:bg-white/20 p-1.5 rounded-lg transition">
                                <XMarkIcon className="w-5 h-5" /></button>
                        </div>
                        <div className="p-6 space-y-3 max-h-[60vh] overflow-y-auto no-scrollbar">
                            {recipeItems.map((row, index) => {
                                const mat = materials.find((m) => String(m.id) === String(row.material_id));
                                const cost = mat && Number(mat.initial_qty) > 0 ? (Number(mat.buy_price) / Number(mat.initial_qty)) * Number(row.qty || 0) : 0;
                                return (
                                    <div key={index} className="grid grid-cols-12 gap-2 items-center">
                                        <div className="col-span-5">
                                            <CustomSelect value={row.material_id}
                                                onChange={(v) => { const u = [...recipeItems]; u[index].material_id = v; setRecipeItems(u); }}
                                                options={materialOptions} placeholder="Pilih Bahan" /></div>
                                        <div className="col-span-2">
                                            <input type="number" placeholder="Qty" value={row.qty === 0 ? "" : row.qty}
                                                onChange={(e) => { const u = [...recipeItems]; u[index].qty = e.target.value; setRecipeItems(u); }}
                                                className="w-full px-3 py-2.5 rounded-xl bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 text-gray-900 dark:text-white text-sm focus:outline-none placeholder-gray-400" /></div>
                                        <div className="col-span-1 text-xs text-gray-500 dark:text-slate-400 font-semibold">{mat?.unit || ""}</div>
                                        <div className="col-span-3">
                                            <div className="px-3 py-2.5 rounded-xl bg-white/10 border border-white/10 text-cyan-300 font-semibold text-xs">
                                                {formatRp(Math.round(cost))}</div></div>
                                        <div className="col-span-1 flex justify-center">
                                            <button type="button" onClick={() => setRecipeItems(recipeItems.filter((_, i) => i !== index))}
                                                className="text-red-300 hover:text-red-400 transition"><XMarkIcon className="w-4 h-4" /></button></div>
                                    </div>
                                );
                            })}
                            <button type="button" onClick={() => setRecipeItems([...recipeItems, { material_id: "", qty: "" }])}
                                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300 text-sm hover:bg-gray-200 dark:hover:bg-slate-600 transition">
                                <PlusIcon className="w-4 h-4" /> Tambah Bahan</button>
                            <div className="border-t border-white/20 pt-3 flex justify-between items-center">
                                <span className="text-gray-500 dark:text-slate-400 text-sm">Total HPP</span>
                                <span className="text-xl font-bold text-orange-300">{formatRp(Math.round(recipeTotalHPP))}</span></div>
                        </div>
                        <div className="px-6 py-4 border-t border-white/20 bg-black/10 flex justify-end gap-3 rounded-b-3xl">
                            <button onClick={() => setShowRecipeModal(false)} className="px-5 py-2 rounded-xl bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-600 transition text-sm">Batal</button>
                            <button onClick={saveRecipe} className="px-5 py-2 rounded-xl bg-white text-orange-500 font-semibold hover:bg-orange-50 transition text-sm">Simpan</button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── CATEGORY MODAL ──────────────────────────────────────── */}
            {showCategoryModal && (
                <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 pb-20 sm:pb-4">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4">
                        <div className="flex justify-between items-center">
                            <h3 className="font-bold text-gray-900 dark:text-white text-lg">
                                {editingCategory ? "Edit Kategori" : "Tambah Kategori"}
                            </h3>
                            <button onClick={() => setShowCategoryModal(false)}
                                className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition">
                                <XMarkIcon className="w-5 h-5 text-gray-400" />
                            </button>
                        </div>
                        <div>
                            <label className={labelCls}>Nama Kategori</label>
                            <input
                                autoFocus
                                value={categoryName}
                                onChange={(e) => setCategoryName(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && saveCategory()}
                                placeholder="Contoh: Minuman, Makanan, Snack..."
                                className={inputCls}
                            />
                        </div>
                        <div className="flex justify-end gap-2 pt-1">
                            <button onClick={() => setShowCategoryModal(false)}
                                className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300 text-sm hover:bg-gray-200 dark:hover:bg-slate-600 transition">
                                Batal
                            </button>
                            <button onClick={saveCategory} disabled={!categoryName.trim() || categoryLoading}
                                className="px-4 py-2 rounded-xl bg-orange-500 text-white font-semibold text-sm hover:bg-orange-600 transition disabled:opacity-50">
                                {categoryLoading ? "Menyimpan..." : "Simpan"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}