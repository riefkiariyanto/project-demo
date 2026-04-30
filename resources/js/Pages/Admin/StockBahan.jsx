import { useRef, useState, useEffect, useCallback } from "react";
import { PencilSquareIcon, TrashIcon, PlusIcon, ArrowPathIcon } from "@heroicons/react/24/solid";

// ─── Dummy Data ───────────────────────────────────────────────────────────────
const DUMMY_UNITS = [
    { id: 1, name: "Kilogram", symbol: "kg" },
    { id: 2, name: "Gram", symbol: "g" },
    { id: 3, name: "Liter", symbol: "L" },
    { id: 4, name: "Mililiter", symbol: "mL" },
    { id: 5, name: "Buah", symbol: "pcs" },
    { id: 6, name: "Sachet", symbol: "sct" },
    { id: 7, name: "Bungkus", symbol: "bks" },
];

const DUMMY_BAHAN = [
    { id: 1, name: "Tepung terigu", unit_id: 1, stock: 50, minimum_stock: 20 },
    { id: 2, name: "Gula pasir", unit_id: 1, stock: 8, minimum_stock: 10 }, // sedikit
    { id: 3, name: "Garam", unit_id: 2, stock: 500, minimum_stock: 200 },
    { id: 4, name: "Minyak goreng", unit_id: 3, stock: 0, minimum_stock: 5 }, // habis
    { id: 5, name: "Telur ayam", unit_id: 5, stock: 120, minimum_stock: 30 },
    { id: 6, name: "Susu UHT", unit_id: 4, stock: 800, minimum_stock: 500 },
    { id: 7, name: "Coklat bubuk", unit_id: 2, stock: 3, minimum_stock: 100 }, // sedikit
    { id: 8, name: "Baking powder", unit_id: 6, stock: 24, minimum_stock: 10 },
    { id: 9, name: "Vanili", unit_id: 6, stock: 0, minimum_stock: 5 }, // habis
    { id: 10, name: "Keju cheddar", unit_id: 2, stock: 400, minimum_stock: 100 },
    { id: 11, name: "Butter", unit_id: 2, stock: 250, minimum_stock: 200 },
    { id: 12, name: "Kopi robusta", unit_id: 7, stock: 60, minimum_stock: 20 },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const initials = (name = "") =>
    name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();

const fmtNumber = (n) =>
    Number(n).toLocaleString("id-ID");

const getStatus = (stock, minimum_stock) => {
    if (Number(stock) <= 0) return "habis";
    if (Number(stock) <= Number(minimum_stock)) return "sedikit";
    return "banyak";
};

const STATUS_MAP = {
    habis: { label: "Habis", cls: "bg-red-500/20 text-red-400 ring-1 ring-red-500/30" },
    sedikit: { label: "Sedikit", cls: "bg-yellow-400/20 text-yellow-400 ring-1 ring-yellow-400/30" },
    banyak: { label: "Banyak", cls: "bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/30" },
};

const EMPTY_FORM = {
    unit_id: "",
    name: "",
    stock: "",
    minimum_stock: "",
};

let nextId = DUMMY_BAHAN.length + 1;

// ─── Reusable Input ───────────────────────────────────────────────────────────
function Field({ label, children }) {
    return (
        <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-400">{label}</label>
            {children}
        </div>
    );
}

const inputCls =
    "w-full px-3 py-2 rounded-lg bg-gray-900 border border-gray-700 text-sm text-white " +
    "placeholder:text-gray-600 focus:outline-none focus:border-orange-500 transition";

// ─── Toast ────────────────────────────────────────────────────────────────────
function Toast({ msg, type }) {
    if (!msg) return null;
    const color = type === "error" ? "bg-red-500" : "bg-emerald-600";
    return (
        <div className={`fixed bottom-4 right-4 z-50 ${color} text-white text-sm px-4 py-2 rounded-xl shadow-lg`}>
            {msg}
        </div>
    );
}

// ─── Modal ────────────────────────────────────────────────────────────────────
function Modal({ open, onClose, title, children }) {
    if (!open) return null;
    return (
        <div
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-40 p-4"
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <div className="bg-gray-800 border border-gray-700 rounded-2xl w-full max-w-sm shadow-2xl">
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-700">
                    <h3 className="font-semibold text-white">{title}</h3>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-white transition text-lg leading-none"
                    >
                        ✕
                    </button>
                </div>
                <div className="px-5 py-4">{children}</div>
            </div>
        </div>
    );
}

// ─── Delete Confirm Modal ─────────────────────────────────────────────────────
function DeleteModal({ open, item, onClose, onConfirm, loading }) {
    return (
        <Modal open={open} onClose={onClose} title="Hapus bahan">
            <p className="text-sm text-gray-400 mb-5">
                Yakin ingin menghapus{" "}
                <span className="text-white font-medium">{item?.name}</span>?{" "}
                Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex justify-end gap-2">
                <button
                    onClick={onClose}
                    className="px-4 py-2 text-sm rounded-lg border border-gray-600 text-gray-300 hover:bg-gray-700 transition"
                >
                    Batal
                </button>
                <button
                    onClick={onConfirm}
                    disabled={loading}
                    className="px-4 py-2 text-sm rounded-lg bg-red-600 hover:bg-red-700 text-white transition disabled:opacity-50"
                >
                    {loading ? "Menghapus..." : "Hapus"}
                </button>
            </div>
        </Modal>
    );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ label, value, color = "text-white" }) {
    return (
        <div className="bg-gray-900 rounded-xl px-4 py-3">
            <p className="text-xs text-gray-500 mb-1">{label}</p>
            <p className={`text-xl font-semibold ${color}`}>{value}</p>
        </div>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function StockBahan() {
    const [data, setData] = useState([]);
    const [units, setUnits] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const [form, setForm] = useState(EMPTY_FORM);
    const [formModal, setFormModal] = useState(false);
    const [editId, setEditId] = useState(null);
    const [errors, setErrors] = useState({});

    const [deleteModal, setDeleteModal] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null);

    const [search, setSearch] = useState("");
    const [filterStatus, setFilterStatus] = useState("semua");

    const [toast, setToast] = useState({ msg: "", type: "success" });

    // ── drag-scroll ──────────────────────────────────────────────────────────
    const scrollRef = useRef(null);
    const drag = useRef({ active: false, startY: 0, scrollTop: 0 });

    const onMouseDown = (e) => {
        if (e.target.closest("button")) return;
        drag.current = { active: true, startY: e.pageY, scrollTop: scrollRef.current?.scrollTop ?? 0 };
    };
    const onMouseMove = (e) => {
        if (!drag.current.active || !scrollRef.current) return;
        e.preventDefault();
        scrollRef.current.scrollTop = drag.current.scrollTop - (e.pageY - drag.current.startY);
    };
    const onMouseUp = () => { drag.current.active = false; };

    // ── toast helper ─────────────────────────────────────────────────────────
    const showToast = (msg, type = "success") => {
        setToast({ msg, type });
        setTimeout(() => setToast({ msg: "", type: "success" }), 3000);
    };

    // ── load dummy data (simulates async fetch) ───────────────────────────────
    const fetchData = useCallback(() => {
        setLoading(true);
        setTimeout(() => {
            // Enrich each bahan with unit object & status
            const enriched = data.length === 0
                ? DUMMY_BAHAN.map((b) => ({
                    ...b,
                    unit: DUMMY_UNITS.find((u) => u.id === b.unit_id) ?? null,
                    status: getStatus(b.stock, b.minimum_stock),
                }))
                : data.map((b) => ({
                    ...b,
                    unit: DUMMY_UNITS.find((u) => u.id === b.unit_id) ?? null,
                    status: getStatus(b.stock, b.minimum_stock),
                }));
            setData(enriched);
            setUnits(DUMMY_UNITS);
            setLoading(false);
        }, 400);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        // Initial load — seed from DUMMY_BAHAN
        setLoading(true);
        setTimeout(() => {
            setData(
                DUMMY_BAHAN.map((b) => ({
                    ...b,
                    unit: DUMMY_UNITS.find((u) => u.id === b.unit_id) ?? null,
                    status: getStatus(b.stock, b.minimum_stock),
                }))
            );
            setUnits(DUMMY_UNITS);
            setLoading(false);
        }, 500);
    }, []);

    // ── form helpers ──────────────────────────────────────────────────────────
    const resetForm = () => {
        setForm(EMPTY_FORM);
        setEditId(null);
        setErrors({});
    };

    const openAdd = () => {
        resetForm();
        setFormModal(true);
    };

    const openEdit = (item) => {
        setForm({
            unit_id: item.unit?.id ?? item.unit_id ?? "",
            name: item.name ?? "",
            stock: item.stock ?? "",
            minimum_stock: item.minimum_stock ?? "",
        });
        setEditId(item.id);
        setErrors({});
        setFormModal(true);
    };

    const openDelete = (item) => {
        setDeleteTarget(item);
        setDeleteModal(true);
    };

    const handleChange = (e) => {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
        setErrors((prev) => ({ ...prev, [e.target.name]: "" }));
    };

    // ── validate ──────────────────────────────────────────────────────────────
    const validate = () => {
        const errs = {};
        if (!form.unit_id) errs.unit_id = "Pilih satuan";
        if (!form.name?.trim()) errs.name = "Nama wajib diisi";
        if (form.stock === "") errs.stock = "Stok wajib diisi";
        if (form.minimum_stock === "") errs.minimum_stock = "Minimum stok wajib diisi";
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    // ── submit (CRUD on local state) ──────────────────────────────────────────
    const handleSubmit = async () => {
        if (!validate()) return;
        setSaving(true);

        const unit = DUMMY_UNITS.find((u) => u.id === Number(form.unit_id)) ?? null;
        const payload = {
            unit_id: Number(form.unit_id),
            name: form.name.trim(),
            stock: Number(form.stock),
            minimum_stock: Number(form.minimum_stock),
            unit,
            status: getStatus(form.stock, form.minimum_stock),
        };

        // Simulate network delay
        await new Promise((r) => setTimeout(r, 400));

        if (editId) {
            setData((prev) =>
                prev.map((d) => (d.id === editId ? { ...d, ...payload } : d))
            );
            showToast("Bahan berhasil diperbarui");
        } else {
            const newItem = { id: nextId++, ...payload };
            setData((prev) => [...prev, newItem]);
            showToast("Bahan berhasil ditambahkan");
        }

        setSaving(false);
        setFormModal(false);
        resetForm();
    };

    // ── delete (CRUD on local state) ──────────────────────────────────────────
    const handleDelete = async () => {
        if (!deleteTarget) return;
        setDeleting(true);

        await new Promise((r) => setTimeout(r, 300));

        setData((prev) => prev.filter((d) => d.id !== deleteTarget.id));
        showToast("Bahan berhasil dihapus");
        setDeleting(false);
        setDeleteModal(false);
        setDeleteTarget(null);
    };

    // ── refresh (re-seed from dummy) ──────────────────────────────────────────
    const handleRefresh = () => {
        setLoading(true);
        setTimeout(() => {
            setData(
                DUMMY_BAHAN.map((b) => ({
                    ...b,
                    unit: DUMMY_UNITS.find((u) => u.id === b.unit_id) ?? null,
                    status: getStatus(b.stock, b.minimum_stock),
                }))
            );
            nextId = DUMMY_BAHAN.length + 1;
            setLoading(false);
        }, 400);
    };

    // ── filtered view ─────────────────────────────────────────────────────────
    const filtered = data.filter((d) => {
        const matchSearch = d.name?.toLowerCase().includes(search.toLowerCase());
        const matchStatus = filterStatus === "semua" || d.status === filterStatus;
        return matchSearch && matchStatus;
    });

    // ── stats ─────────────────────────────────────────────────────────────────
    const stats = {
        total: data.length,
        banyak: data.filter((d) => d.status === "banyak").length,
        sedikit: data.filter((d) => d.status === "sedikit").length,
        habis: data.filter((d) => d.status === "habis").length,
    };

    // ─────────────────────────────────────────────────────────────────────────
    return (
        <>
            <Toast msg={toast.msg} type={toast.type} />

            <div className="bg-gray-800 border border-gray-700 rounded-2xl overflow-hidden">

                {/* ── Header ── */}
                <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b border-gray-700">
                    <h2 className="text-base font-semibold text-white">Stok bahan</h2>

                    <div className="flex items-center gap-2 flex-wrap">
                        {/* Search */}
                        <div className="relative">
                            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500">
                                <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                                </svg>
                            </span>
                            <input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Cari bahan..."
                                className="bg-gray-900 border border-gray-700 text-sm text-white pl-7 pr-3 py-1.5 rounded-lg focus:outline-none focus:border-orange-500 w-44"
                            />
                        </div>

                        {/* Filter status */}
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="bg-gray-900 border border-gray-700 text-sm text-gray-300 px-3 py-1.5 rounded-lg focus:outline-none focus:border-orange-500"
                        >
                            <option value="semua">Semua status</option>
                            <option value="banyak">Banyak</option>
                            <option value="sedikit">Sedikit</option>
                            <option value="habis">Habis</option>
                        </select>

                        {/* Refresh */}
                        <button
                            onClick={handleRefresh}
                            className="p-1.5 rounded-lg border border-gray-600 text-gray-400 hover:bg-gray-700 hover:text-white transition"
                            title="Refresh (reset ke data awal)"
                        >
                            <ArrowPathIcon className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                        </button>

                        {/* Tambah */}
                        <button
                            onClick={openAdd}
                            className="flex items-center gap-1.5 text-sm bg-orange-500 hover:bg-orange-600 text-white px-3 py-1.5 rounded-lg transition"
                        >
                            <PlusIcon className="w-4 h-4" />
                            Tambah
                        </button>
                    </div>
                </div>

                {/* ── Stats ── */}
                <div className="grid grid-cols-4 gap-3 px-5 py-3 border-b border-gray-700">
                    <StatCard label="Total bahan" value={stats.total} />
                    <StatCard label="Stok banyak" value={stats.banyak} color="text-emerald-400" />
                    <StatCard label="Stok sedikit" value={stats.sedikit} color="text-yellow-400" />
                    <StatCard label="Habis" value={stats.habis} color="text-red-400" />
                </div>

                {/* ── Table header ── */}
                <div className="grid grid-cols-[40px_56px_1fr_90px_100px_110px_70px] px-5 py-2.5 text-[11px] font-medium tracking-wide text-gray-500 uppercase border-b border-gray-700">
                    <span />
                    <span>ID</span>
                    <span>Nama</span>
                    <span>Status</span>
                    <span>Stok</span>
                    <span>Min. stok</span>
                    <span className="text-right">Aksi</span>
                </div>

                {/* ── Rows ── */}
                <div
                    ref={scrollRef}
                    onMouseDown={onMouseDown}
                    onMouseMove={onMouseMove}
                    onMouseUp={onMouseUp}
                    onMouseLeave={onMouseUp}
                    className="max-h-[380px] overflow-y-auto divide-y divide-gray-700/50 cursor-grab active:cursor-grabbing select-none"
                >
                    {loading && (
                        <div className="flex items-center justify-center py-16 gap-2 text-sm text-gray-500">
                            <ArrowPathIcon className="w-4 h-4 animate-spin" />
                            Memuat data...
                        </div>
                    )}

                    {!loading && filtered.length === 0 && (
                        <div className="text-center py-16 text-sm text-gray-500">
                            Tidak ada data ditemukan
                        </div>
                    )}

                    {!loading && filtered.map((item) => {
                        const st = STATUS_MAP[item.status] ?? STATUS_MAP.banyak;
                        const stockColor =
                            item.status === "habis" ? "text-red-400" :
                                item.status === "sedikit" ? "text-yellow-400" :
                                    "text-white";

                        return (
                            <div
                                key={item.id}
                                className="grid grid-cols-[40px_56px_1fr_90px_100px_110px_70px] items-center px-5 py-3 hover:bg-gray-700/30 transition group"
                            >
                                {/* Avatar */}
                                <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center text-[11px] font-bold text-white shrink-0">
                                    {initials(item.name)}
                                </div>

                                {/* ID */}
                                <span className="text-xs text-gray-500 font-mono">
                                    #{item.id}
                                </span>

                                {/* Nama */}
                                <span className="text-sm font-medium text-white truncate pr-2">
                                    {item.name}
                                </span>

                                {/* Status badge — kolom sendiri */}
                                <span className={`w-fit text-[10px] px-2 py-0.5 rounded-full font-semibold ${st.cls}`}>
                                    {st.label}
                                </span>

                                {/* Stok + Satuan */}
                                <span className={`text-sm font-semibold ${stockColor}`}>
                                    {fmtNumber(item.stock)}
                                    <span className="text-xs font-normal text-gray-500 ml-0.5">
                                        {item.unit?.symbol ?? ""}
                                    </span>
                                </span>

                                {/* Min stok + Satuan */}
                                <span className="text-xs text-gray-500">
                                    {fmtNumber(item.minimum_stock)}
                                    <span className="ml-0.5">{item.unit?.symbol ?? ""}</span>
                                </span>

                                {/* Actions */}
                                <div className="flex justify-end items-center gap-1">
                                    <button
                                        onClick={() => openEdit(item)}
                                        className="p-1.5 rounded-lg hover:bg-gray-700 text-blue-400 transition"
                                        title="Edit"
                                    >
                                        <PencilSquareIcon className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => openDelete(item)}
                                        className="p-1.5 rounded-lg hover:bg-gray-700 text-red-400 transition"
                                        title="Hapus"
                                    >
                                        <TrashIcon className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* ── Footer ── */}
                <div className="px-5 py-3 border-t border-gray-700 flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                        Menampilkan {filtered.length} dari {data.length} bahan
                    </span>
                    {stats.habis > 0 && (
                        <span className="text-xs text-red-400">
                            ⚠ {stats.habis} bahan habis
                        </span>
                    )}
                    {stats.sedikit > 0 && stats.habis === 0 && (
                        <span className="text-xs text-yellow-400">
                            ⚠ {stats.sedikit} bahan perlu restock
                        </span>
                    )}
                </div>
            </div>

            {/* ── Form Modal (Add / Edit) ── */}
            <Modal
                open={formModal}
                onClose={() => { setFormModal(false); resetForm(); }}
                title={editId ? "Edit bahan" : "Tambah bahan"}
            >
                <div className="space-y-3">
                    {/* Satuan */}
                    <Field label="Satuan *">
                        <select
                            name="unit_id"
                            value={form.unit_id}
                            onChange={handleChange}
                            className={inputCls + (errors.unit_id ? " border-red-500" : "")}
                        >
                            <option value="">Pilih satuan</option>
                            {units.map((u) => (
                                <option key={u.id} value={u.id}>
                                    {u.name} ({u.symbol})
                                </option>
                            ))}
                        </select>
                        {errors.unit_id && <p className="text-xs text-red-400">{errors.unit_id}</p>}
                    </Field>

                    {/* Nama */}
                    <Field label="Nama bahan *">
                        <input
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                            placeholder="Tepung terigu"
                            className={inputCls + (errors.name ? " border-red-500" : "")}
                        />
                        {errors.name && <p className="text-xs text-red-400">{errors.name}</p>}
                    </Field>

                    {/* Stok & Min stok side by side */}
                    <div className="grid grid-cols-2 gap-3">
                        <Field label="Stok saat ini *">
                            <input
                                name="stock"
                                type="number"
                                min="0"
                                value={form.stock}
                                onChange={handleChange}
                                placeholder="0"
                                className={inputCls + (errors.stock ? " border-red-500" : "")}
                            />
                            {errors.stock && <p className="text-xs text-red-400">{errors.stock}</p>}
                        </Field>

                        <Field label="Minimum stok *">
                            <input
                                name="minimum_stock"
                                type="number"
                                min="0"
                                value={form.minimum_stock}
                                onChange={handleChange}
                                placeholder="10"
                                className={inputCls + (errors.minimum_stock ? " border-red-500" : "")}
                            />
                            {errors.minimum_stock && <p className="text-xs text-red-400">{errors.minimum_stock}</p>}
                        </Field>
                    </div>

                    {/* Preview status */}
                    {form.stock !== "" && form.minimum_stock !== "" && (
                        <div className="bg-gray-900 rounded-lg px-3 py-2 flex items-center gap-2">
                            <span className="text-xs text-gray-500">Status:</span>
                            {(() => {
                                const status = getStatus(form.stock, form.minimum_stock);
                                const st = STATUS_MAP[status];
                                return (
                                    <span className={`text-[11px] px-2 py-0.5 rounded-full font-semibold ${st.cls}`}>
                                        {st.label}
                                    </span>
                                );
                            })()}
                        </div>
                    )}

                    <div className="flex justify-end gap-2 pt-1">
                        <button
                            onClick={() => { setFormModal(false); resetForm(); }}
                            className="px-4 py-2 text-sm rounded-lg border border-gray-600 text-gray-300 hover:bg-gray-700 transition"
                        >
                            Batal
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={saving}
                            className="px-4 py-2 text-sm rounded-lg bg-orange-500 hover:bg-orange-600 text-white transition disabled:opacity-50 flex items-center gap-1.5"
                        >
                            {saving && <ArrowPathIcon className="w-3.5 h-3.5 animate-spin" />}
                            {saving ? "Menyimpan..." : "Simpan"}
                        </button>
                    </div>
                </div>
            </Modal>

            {/* ── Delete Modal ── */}
            <DeleteModal
                open={deleteModal}
                item={deleteTarget}
                onClose={() => { setDeleteModal(false); setDeleteTarget(null); }}
                onConfirm={handleDelete}
                loading={deleting}
            />
        </>
    );
}