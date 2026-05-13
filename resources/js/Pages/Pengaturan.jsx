import { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import {
    PrinterIcon, SignalIcon, ArrowPathIcon, XMarkIcon,
    BuildingStorefrontIcon, CameraIcon,
    CheckCircleIcon, ExclamationCircleIcon,
} from '@heroicons/react/24/solid';

const STORAGE_KEY = 'werp_bt_printer';
const isNative = () => typeof window !== 'undefined' && window.Capacitor?.isNative;

const inputCls = 'w-full rounded-xl bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 px-4 py-2.5 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-300 dark:focus:ring-orange-500 transition';
const labelCls = 'block text-xs font-semibold text-gray-600 dark:text-slate-400 mb-1';

function GlassCard({ children, className = '' }) {
    return (
        <div className={`bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm ${className}`}>
            {children}
        </div>
    );
}

function Notification({ notif }) {
    if (!notif) return null;
    const isSuccess = notif.type === 'success';
    return (
        <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-[70] ${isSuccess ? 'bg-green-500' : 'bg-red-500'} text-white rounded-2xl shadow-2xl p-5 max-w-sm w-full`}>
            <div className="flex items-center gap-3">
                {isSuccess
                    ? <CheckCircleIcon className="w-7 h-7 shrink-0" />
                    : <ExclamationCircleIcon className="w-7 h-7 shrink-0" />}
                <div>
                    <p className="font-bold">{notif.title}</p>
                    {notif.message && <p className="text-sm opacity-90">{notif.message}</p>}
                </div>
            </div>
        </div>
    );
}

function PrinterTab() {
    const [devices, setDevices]       = useState([]);
    const [saved, setSaved]           = useState(() => {
        try { return JSON.parse(localStorage.getItem(STORAGE_KEY)); } catch { return null; }
    });
    const [connected, setConnected]   = useState(false);
    const [scanning, setScanning]     = useState(false);
    const [connecting, setConnecting] = useState(null);
    const [error, setError]           = useState(null);

    const bt = () => window.bluetoothSerial;

    useEffect(() => {
        if (saved && isNative()) {
            connectTo(saved);
        }
    }, []);

    const scan = () => {
        setScanning(true);
        setError(null);
        bt()?.list(
            (list) => { setDevices(list); setScanning(false); },
            (err)  => { setError('Gagal scan: ' + err); setScanning(false); }
        );
    };

    const connectTo = (device) => {
        setConnecting(device.address);
        setError(null);
        bt()?.connect(
            device.address,
            () => {
                setConnected(true);
                setConnecting(null);
                setSaved(device);
                localStorage.setItem(STORAGE_KEY, JSON.stringify(device));
            },
            (err) => {
                setConnecting(null);
                setError('Gagal connect: ' + err);
            }
        );
    };

    const disconnect = () => {
        bt()?.disconnect(() => {}, () => {});
        setConnected(false);
        setSaved(null);
        localStorage.removeItem(STORAGE_KEY);
    };

    if (!isNative()) {
        return (
            <GlassCard className="p-6 max-w-lg mx-auto">
                <div className="flex flex-col items-center gap-4 py-8 text-center">
                    <PrinterIcon className="w-14 h-14 text-gray-300 dark:text-slate-600" />
                    <div>
                        <h3 className="font-bold text-gray-700 dark:text-white text-lg">Fitur Printer Bluetooth</h3>
                        <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
                            Fitur ini hanya tersedia di aplikasi Android.<br />
                            Buka aplikasi dari perangkat Android untuk menghubungkan printer.
                        </p>
                    </div>
                </div>
            </GlassCard>
        );
    }

    return (
        <GlassCard className="p-6 max-w-lg mx-auto space-y-5">
            <div>
                <h2 className="font-bold text-gray-900 dark:text-white text-lg">Printer Bluetooth</h2>
                <p className="text-xs text-gray-500 dark:text-slate-400">Hubungkan printer satu kali, cetak kapan saja tanpa perlu setting ulang</p>
            </div>

            {saved && connected && (
                <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-xl">
                    <div className="w-10 h-10 rounded-xl bg-green-500 flex items-center justify-center shrink-0">
                        <PrinterIcon className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="font-semibold text-green-700 dark:text-green-300 text-sm">Printer Terhubung</p>
                        <p className="text-xs text-green-600 dark:text-green-400 truncate">{saved.name}</p>
                        <p className="text-xs text-green-500 dark:text-green-500">{saved.address}</p>
                    </div>
                    <button onClick={disconnect}
                        className="px-3 py-1.5 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs font-semibold hover:bg-red-200 dark:hover:bg-red-900/50 transition">
                        Putuskan
                    </button>
                </div>
            )}

            {saved && !connected && connecting === null && (
                <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl">
                    <div className="w-10 h-10 rounded-xl bg-gray-300 dark:bg-slate-600 flex items-center justify-center shrink-0">
                        <PrinterIcon className="w-5 h-5 text-gray-500 dark:text-slate-300" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-600 dark:text-slate-300 text-sm">Belum Terhubung</p>
                        <p className="text-xs text-gray-400 dark:text-slate-400 truncate">{saved.name}</p>
                    </div>
                    <button onClick={() => connectTo(saved)}
                        className="px-3 py-1.5 rounded-lg bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 text-xs font-semibold hover:bg-orange-200 transition">
                        Hubungkan
                    </button>
                </div>
            )}

            {error && (
                <div className="px-4 py-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 text-red-600 dark:text-red-400 rounded-xl text-sm">
                    {error}
                </div>
            )}

            <button onClick={scan} disabled={scanning}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-orange-300 dark:border-orange-600 text-orange-500 dark:text-orange-400 text-sm font-semibold hover:bg-orange-50 dark:hover:bg-orange-900/20 transition disabled:opacity-50">
                <ArrowPathIcon className={`w-4 h-4 ${scanning ? 'animate-spin' : ''}`} />
                {scanning ? 'Mencari perangkat...' : 'Scan & Ganti Printer'}
            </button>

            {devices.length > 0 && (
                <div className="space-y-2">
                    <p className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                        Perangkat Tersedia ({devices.length})
                    </p>
                    {devices.map((d) => {
                        const isConn = saved?.address === d.address && connected;
                        const isConnecting = connecting === d.address;
                        return (
                            <button key={d.address} onClick={() => connectTo(d)}
                                disabled={!!connecting}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition text-left
                                    ${isConn
                                        ? 'border-green-400 bg-green-50 dark:bg-green-900/20'
                                        : 'border-gray-200 dark:border-slate-600 hover:border-orange-300 dark:hover:border-orange-500 hover:bg-gray-50 dark:hover:bg-slate-700'
                                    } disabled:opacity-50`}>
                                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${isConn ? 'bg-green-500' : 'bg-gray-100 dark:bg-slate-700'}`}>
                                    <SignalIcon className={`w-5 h-5 ${isConn ? 'text-white' : 'text-gray-400'}`} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-sm text-gray-900 dark:text-white truncate">{d.name ?? 'Unknown'}</p>
                                    <p className="text-xs text-gray-400 dark:text-slate-500">{d.address}</p>
                                </div>
                                {isConn && <span className="text-xs text-green-600 dark:text-green-400 font-semibold shrink-0">Aktif</span>}
                                {isConnecting && <ArrowPathIcon className="w-4 h-4 text-orange-400 animate-spin shrink-0" />}
                            </button>
                        );
                    })}
                </div>
            )}

            <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-xl text-xs text-amber-700 dark:text-amber-300">
                💡 Pastikan printer sudah di-pair di Settings Bluetooth Android sebelum muncul di daftar ini.
                Setelah terhubung di sini, cetak nota dari Kasir akan langsung tanpa perlu pilih printer lagi.
            </div>
        </GlassCard>
    );
}

function ProfilTokoTab({ store, showNotif }) {
    const [logoPreview, setLogoPreview]   = useState(store?.logo ? `/storage/${store.logo}` : null);
    const [qrisPreview, setQrisPreview]   = useState(store?.qris_image ? `/storage/${store.qris_image}` : null);

    const storeForm = useForm({
        name:       store?.name ?? '',
        address:    store?.address ?? '',
        phone:      store?.phone ?? '',
        logo:       null,
        qris_image: null,
    });

    const saveStore = () => {
        storeForm.post('/store/update', {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => showNotif('success', 'Profil toko berhasil diupdate!'),
            onError:   () => showNotif('error', 'Gagal mengupdate profil toko.'),
        });
    };

    return (
        <GlassCard className="p-6 max-w-lg mx-auto space-y-6">
            <div>
                <h2 className="font-bold text-gray-900 dark:text-white text-lg">Profil Toko</h2>
                <p className="text-xs text-gray-500 dark:text-slate-400">Update nama, logo, dan info toko</p>
            </div>

            <div className="flex flex-col items-center gap-4">
                <div className="relative">
                    <div className="w-28 h-28 rounded-2xl overflow-hidden border-2 border-white/30 bg-white/20 flex items-center justify-center">
                        {logoPreview ? (
                            <img src={logoPreview} alt="Logo" className="w-full h-full object-cover" />
                        ) : (
                            <div className="flex flex-col items-center text-gray-400 dark:text-slate-500">
                                <BuildingStorefrontIcon className="w-10 h-10 mb-1" />
                                <p className="text-xs">No Logo</p>
                            </div>
                        )}
                    </div>
                    <button type="button"
                        onClick={() => document.getElementById('pg-logo-input').click()}
                        className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-white text-orange-500 flex items-center justify-center shadow-lg hover:bg-orange-50 transition">
                        <CameraIcon className="w-4 h-4" />
                    </button>
                </div>
                <input id="pg-logo-input" type="file" accept="image/*" className="hidden"
                    onChange={(e) => {
                        const file = e.target.files[0];
                        if (!file) return;
                        if (file.size > 2 * 1024 * 1024) { showNotif('error', 'Ukuran logo maksimal 2MB!'); return; }
                        storeForm.setData('logo', file);
                        setLogoPreview(URL.createObjectURL(file));
                    }} />
                <p className="text-xs text-gray-400 dark:text-slate-500">Klik ikon kamera untuk ganti logo (maks 2MB)</p>
            </div>

            <div className="space-y-4">
                <div>
                    <label className={labelCls}>Nama Toko</label>
                    <input value={storeForm.data.name}
                        onChange={(e) => storeForm.setData('name', e.target.value)}
                        placeholder="Nama toko" className={inputCls} />
                </div>
                <div>
                    <label className={labelCls}>Alamat</label>
                    <input value={storeForm.data.address}
                        onChange={(e) => storeForm.setData('address', e.target.value)}
                        placeholder="Alamat toko" className={inputCls} />
                </div>
                <div>
                    <label className={labelCls}>No. Telepon</label>
                    <input value={storeForm.data.phone}
                        onChange={(e) => storeForm.setData('phone', e.target.value)}
                        placeholder="08xxxxxxxxxx" className={inputCls} />
                </div>

                <div>
                    <label className={labelCls}>Gambar QRIS Toko</label>
                    <div className="relative w-full h-48 rounded-xl overflow-hidden border border-white/30 bg-white/10 flex items-center justify-center cursor-pointer hover:bg-white/20 transition"
                        onClick={() => document.getElementById('pg-qris-input').click()}>
                        {qrisPreview ? (
                            <>
                                <img src={qrisPreview} alt="QRIS" className="w-full h-full object-contain p-2" />
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition">
                                    <p className="text-gray-900 dark:text-white text-sm font-semibold">Ganti Gambar QRIS</p>
                                </div>
                            </>
                        ) : (
                            <div className="text-center text-gray-400 dark:text-slate-500">
                                <CameraIcon className="w-8 h-8 mx-auto mb-1" />
                                <p className="text-xs">Klik untuk upload gambar QRIS</p>
                            </div>
                        )}
                    </div>
                    <input id="pg-qris-input" type="file" accept="image/*" className="hidden"
                        onChange={(e) => {
                            const file = e.target.files[0];
                            if (!file) return;
                            if (file.size > 2 * 1024 * 1024) { showNotif('error', 'Ukuran gambar QRIS maksimal 2MB!'); return; }
                            storeForm.setData('qris_image', file);
                            setQrisPreview(URL.createObjectURL(file));
                        }} />
                    <p className="text-xs text-gray-400 dark:text-slate-500 mt-1">Screenshot QRIS dari bank/e-wallet toko (maks 2MB)</p>
                </div>

                {store?.invite_code && (
                    <div>
                        <label className={labelCls}>Kode Undangan Toko</label>
                        <div className="flex items-center gap-2">
                            <div className="flex-1 rounded-xl bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 px-4 py-2.5 text-gray-900 dark:text-white font-mono font-bold tracking-widest text-center">
                                {store.invite_code}
                            </div>
                            <button type="button"
                                onClick={() => { navigator.clipboard.writeText(store.invite_code); showNotif('success', 'Kode berhasil disalin!'); }}
                                className="px-4 py-2.5 rounded-xl bg-white text-orange-500 font-semibold text-sm hover:bg-orange-50 transition">
                                Salin
                            </button>
                        </div>
                        <p className="text-xs text-gray-400 dark:text-slate-500 mt-1">Bagikan kode ini kepada karyawan untuk bergabung</p>
                    </div>
                )}
            </div>

            <button type="button" onClick={saveStore} disabled={storeForm.processing}
                className="w-full py-3 rounded-xl bg-white text-orange-500 font-bold hover:bg-orange-50 transition shadow disabled:opacity-50">
                {storeForm.processing ? 'Menyimpan...' : 'Simpan Perubahan'}
            </button>
        </GlassCard>
    );
}

export default function Pengaturan({ auth, store = null }) {
    const roles   = auth?.roles || [];
    const isAdmin = roles.includes('admin') || roles.includes('superadmin');
    const [tab, setTab]     = useState('printer');
    const [notif, setNotif] = useState(null);

    const showNotif = (type, title, message) => {
        setNotif({ type, title, message });
        setTimeout(() => setNotif(null), 3500);
    };

    return (
        <AuthenticatedLayout hideSearch>
            <Head title="Pengaturan" />
            <Notification notif={notif} />

            <div className="flex flex-col gap-4 h-full">
                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm px-5 py-3 flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
                    <h1 className="text-xl font-bold text-gray-900 dark:text-white">Pengaturan</h1>
                    <div className="flex gap-2">
                        <button type="button" onClick={() => setTab('printer')}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200
                                ${tab === 'printer' ? 'bg-orange-500 text-white shadow-md' : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-600'}`}>
                            <PrinterIcon className="w-4 h-4" /> Printer
                        </button>
                        {isAdmin && (
                            <button type="button" onClick={() => setTab('toko')}
                                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200
                                    ${tab === 'toko' ? 'bg-orange-500 text-white shadow-md' : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-600'}`}>
                            <BuildingStorefrontIcon className="w-4 h-4" /> Profil Toko
                            </button>
                        )}
                    </div>
                </div>

                <div className="flex-1 overflow-auto no-scrollbar">
                    {tab === 'printer' && <PrinterTab />}
                    {tab === 'toko' && isAdmin && <ProfilTokoTab store={store} showNotif={showNotif} />}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
