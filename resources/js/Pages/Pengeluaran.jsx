import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { BanknotesIcon, PlusIcon, XMarkIcon } from '@heroicons/react/24/solid';

const CATEGORIES = ['Belanja Bahan', 'Gaji', 'Listrik', 'Air', 'Sewa', 'Lain-lain'];

const fmt = (v) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(v || 0);

const CATEGORY_COLORS = {
    'Belanja Bahan': 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
    'Gaji':          'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    'Listrik':       'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
    'Air':           'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300',
    'Sewa':          'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
    'Lain-lain':     'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
};

function AddModal({ materials, onClose }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        category:     'Belanja Bahan',
        description:  '',
        material_id:  '',
        qty:          '',
        harga_unit:   '',
        amount:       '',
        expense_date: new Date().toISOString().slice(0, 10),
    });

    const isBahan    = data.category === 'Belanja Bahan';
    const isLainlain = data.category === 'Lain-lain';
    const selectedMaterial = materials.find((m) => String(m.id) === String(data.material_id));

    const handleCategoryChange = (cat) => {
        setData((prev) => ({ ...prev, category: cat, material_id: '', qty: '', harga_unit: '', amount: '', description: '' }));
    };

    const handleMaterialChange = (id) => {
        const mat = materials.find((m) => String(m.id) === id);
        setData((prev) => ({
            ...prev,
            material_id: id,
            harga_unit: mat ? String(mat.buy_price) : '',
            amount: prev.qty && mat ? String(parseFloat(prev.qty) * parseFloat(mat.buy_price)) : '',
        }));
    };

    const handleQtyChange = (qty) => {
        const harga = parseFloat(data.harga_unit) || 0;
        setData((prev) => ({ ...prev, qty, amount: qty && harga ? String(parseFloat(qty) * harga) : '' }));
    };

    const handleHargaChange = (harga) => {
        const qty = parseFloat(data.qty) || 0;
        setData((prev) => ({ ...prev, harga_unit: harga, amount: harga && qty ? String(parseFloat(harga) * qty) : '' }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post('/pengeluaran', { onSuccess: () => { reset(); onClose(); } });
    };

    const inputCls = 'w-full rounded-xl border border-gray-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500';
    const labelCls = 'block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1';

    return (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-y-auto max-h-[90vh]">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-slate-700">
                    <h3 className="font-bold text-lg dark:text-white">Tambah Pengeluaran</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-white transition">
                        <XMarkIcon className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {/* Kategori */}
                    <div>
                        <label className={labelCls}>Kategori</label>
                        <select value={data.category} onChange={(e) => handleCategoryChange(e.target.value)} className={inputCls}>
                            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>

                    {/* Belanja Bahan */}
                    {isBahan && (
                        <>
                            <div>
                                <label className={labelCls}>Pilih Bahan</label>
                                <select value={data.material_id} onChange={(e) => handleMaterialChange(e.target.value)} className={inputCls}>
                                    <option value="">-- Pilih Bahan --</option>
                                    {materials.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
                                </select>
                                {errors.material_id && <p className="text-red-500 text-xs mt-1">{errors.material_id}</p>}
                            </div>

                            {selectedMaterial && (
                                <div>
                                    <label className={labelCls}>Satuan</label>
                                    <input value={selectedMaterial.unit} readOnly
                                        className="w-full rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-600 dark:text-slate-400 px-3 py-2 text-sm cursor-not-allowed" />
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className={labelCls}>Qty</label>
                                    <input type="number" value={data.qty} onChange={(e) => handleQtyChange(e.target.value)}
                                        min="0.01" step="0.01" placeholder="0" className={inputCls} />
                                    {errors.qty && <p className="text-red-500 text-xs mt-1">{errors.qty}</p>}
                                </div>
                                <div>
                                    <label className={labelCls}>Harga/unit (Rp)</label>
                                    <input type="number" value={data.harga_unit} onChange={(e) => handleHargaChange(e.target.value)}
                                        min="0" placeholder="0" className={inputCls} />
                                </div>
                            </div>

                            <div>
                                <label className={labelCls}>Total</label>
                                <input value={fmt(parseFloat(data.amount) || 0)} readOnly
                                    className="w-full rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-600 dark:text-slate-300 px-3 py-2 text-sm cursor-not-allowed font-bold" />
                                {errors.amount && <p className="text-red-500 text-xs mt-1">{errors.amount}</p>}
                            </div>
                        </>
                    )}

                    {/* Non-bahan */}
                    {!isBahan && (
                        <>
                            <div>
                                <label className={labelCls}>
                                    Keterangan {isLainlain && <span className="text-red-500">*</span>}
                                </label>
                                <input type="text" value={data.description} onChange={(e) => setData('description', e.target.value)}
                                    placeholder={isLainlain ? 'Wajib diisi' : 'Opsional'} className={inputCls} />
                                {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
                            </div>
                            <div>
                                <label className={labelCls}>Jumlah (Rp)</label>
                                <input type="number" value={data.amount} onChange={(e) => setData('amount', e.target.value)}
                                    min="0.01" placeholder="0" className={inputCls} />
                                {errors.amount && <p className="text-red-500 text-xs mt-1">{errors.amount}</p>}
                            </div>
                        </>
                    )}

                    {/* Tanggal */}
                    <div>
                        <label className={labelCls}>Tanggal</label>
                        <input type="date" value={data.expense_date} onChange={(e) => setData('expense_date', e.target.value)}
                            className={inputCls + ' [color-scheme:dark]'} />
                        {errors.expense_date && <p className="text-red-500 text-xs mt-1">{errors.expense_date}</p>}
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={onClose}
                            className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-slate-600 text-gray-600 dark:text-slate-300 text-sm font-semibold hover:bg-gray-50 dark:hover:bg-slate-700 transition">
                            Batal
                        </button>
                        <button type="submit" disabled={processing}
                            className="flex-1 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold disabled:opacity-60 transition">
                            {processing ? 'Menyimpan...' : 'Simpan'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default function Pengeluaran({ expenses, summary, materials, filter }) {
    const [showModal, setShowModal] = useState(false);
    const [mode, setMode]       = useState(filter.mode);
    const [tanggal, setTanggal] = useState(filter.tanggal);

    const applyFilter = (newMode, newTanggal) => {
        router.get('/pengeluaran', { mode: newMode, tanggal: newTanggal }, { preserveScroll: true });
    };

    const handleModeChange = (m) => {
        setMode(m);
        const defaultDate = m === 'bulan'
            ? new Date().toISOString().slice(0, 7)
            : new Date().toISOString().slice(0, 10);
        setTanggal(defaultDate);
        applyFilter(m, defaultDate);
    };

    const handleDateChange = (val) => {
        setTanggal(val);
        applyFilter(mode, val);
    };

    return (
        <AuthenticatedLayout>
            <Head title="Pengeluaran" />
            <div className="p-4 sm:p-6 space-y-6 max-w-5xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-3">
                    <BanknotesIcon className="w-7 h-7 text-orange-500" />
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Pengeluaran</h1>
                </div>

                {/* Summary Card */}
                <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl p-5">
                    <div className="flex items-end justify-between mb-4">
                        <span className="text-sm font-medium text-gray-500 dark:text-slate-400">Total Pengeluaran</span>
                        <span className="text-2xl font-bold text-red-500">{fmt(summary.total)}</span>
                    </div>
                    {Object.keys(summary.byCategory || {}).length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {Object.entries(summary.byCategory).map(([cat, amt]) => (
                                <div key={cat} className={`px-3 py-1 rounded-full text-xs font-medium ${CATEGORY_COLORS[cat] ?? CATEGORY_COLORS['Lain-lain']}`}>
                                    {cat}: {fmt(amt)}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Toolbar */}
                <div className="flex flex-wrap items-center gap-3">
                    <div className="flex bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-1 gap-1">
                        {[['bulan', 'Per Bulan'], ['hari', 'Per Hari']].map(([v, l]) => (
                            <button key={v} onClick={() => handleModeChange(v)}
                                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition ${
                                    mode === v ? 'bg-orange-500 text-white shadow' : 'text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white'
                                }`}>
                                {l}
                            </button>
                        ))}
                    </div>

                    <input
                        type={mode === 'bulan' ? 'month' : 'date'}
                        value={tanggal}
                        onChange={(e) => handleDateChange(e.target.value)}
                        className="rounded-xl border border-gray-200 dark:border-slate-600 dark:bg-slate-800 dark:text-white px-3 py-1.5 text-sm [color-scheme:dark] focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />

                    <button onClick={() => setShowModal(true)}
                        className="ml-auto flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-sm font-semibold transition shadow">
                        <PlusIcon className="w-4 h-4" /> Tambah Pengeluaran
                    </button>
                </div>

                {/* Table */}
                <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl overflow-hidden">
                    {expenses.length === 0 ? (
                        <div className="text-center py-16 text-gray-400 dark:text-slate-500 text-sm">
                            Belum ada pengeluaran pada periode ini
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-gray-100 dark:border-slate-700 text-gray-400 dark:text-slate-500 text-xs uppercase tracking-wider">
                                        <th className="px-5 py-3 text-left">Tanggal</th>
                                        <th className="px-5 py-3 text-left">Kategori</th>
                                        <th className="px-5 py-3 text-left">Keterangan</th>
                                        <th className="px-5 py-3 text-right">Jumlah</th>
                                        <th className="px-5 py-3 text-left">Kasir</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {expenses.map((e, i) => (
                                        <tr key={e.id} className={`border-b border-gray-50 dark:border-slate-700/50 ${i % 2 !== 0 ? 'bg-gray-50/50 dark:bg-slate-800/50' : ''}`}>
                                            <td className="px-5 py-3 text-gray-600 dark:text-slate-300 whitespace-nowrap">{e.expense_date}</td>
                                            <td className="px-5 py-3">
                                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${CATEGORY_COLORS[e.category] ?? CATEGORY_COLORS['Lain-lain']}`}>
                                                    {e.category}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3 text-gray-600 dark:text-slate-300">{e.description || e.material_name || '-'}</td>
                                            <td className="px-5 py-3 text-right font-semibold text-red-500 whitespace-nowrap">{fmt(e.amount)}</td>
                                            <td className="px-5 py-3 text-gray-500 dark:text-slate-400">{e.kasir_name}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {showModal && <AddModal materials={materials} onClose={() => setShowModal(false)} />}
        </AuthenticatedLayout>
    );
}
