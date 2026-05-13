import { buildEscPos } from '@/helpers/escpos';
import { useState, useEffect } from "react";
import { XMarkIcon, SignalIcon, PrinterIcon, ArrowPathIcon } from "@heroicons/react/24/solid";

const STORAGE_KEY = "werp_bt_printer";

export default function BluetoothPrinterModal({ onClose, onPrint, receiptData, formatCurrency }) {
    const [devices, setDevices]         = useState([]);
    const [selected, setSelected]       = useState(() => {
        try { return JSON.parse(localStorage.getItem(STORAGE_KEY)); } catch { return null; }
    });
    const [connected, setConnected]     = useState(false);
    const [scanning, setScanning]       = useState(false);
    const [connecting, setConnecting]   = useState(false);
    const [printing, setPrinting]       = useState(false);
    const [error, setError]             = useState(null);
    const [status, setStatus]           = useState(null);

    const bt = () => window.bluetoothSerial;

    useEffect(() => {
        // Auto scan saat modal buka
        scan();
        // Auto connect ke printer terakhir
        if (selected) connectTo(selected);
    }, []);

    const scan = () => {
        setScanning(true);
        setError(null);
        bt()?.list(
            (list) => { setDevices(list); setScanning(false); },
            (err)  => { setError("Gagal scan: " + err); setScanning(false); }
        );
    };

    const connectTo = (device) => {
        setConnecting(true);
        setError(null);
        setStatus(null);
        bt()?.connect(
            device.address,
            () => {
                setConnected(true);
                setConnecting(false);
                setSelected(device);
                localStorage.setItem(STORAGE_KEY, JSON.stringify(device));
                setStatus(`Terhubung ke ${device.name}`);
            },
            (err) => {
                setConnecting(false);
                setError(`Gagal connect: ${err}`);
            }
        );
    };

    const handlePrint = async () => {
        if (!connected) { setError("Hubungkan printer dulu"); return; }
        setPrinting(true);
        setError(null);

        const bytes = buildEscPos(receiptData);
        bt()?.write(
            bytes,
            () => { setPrinting(false); setStatus("Berhasil dicetak!"); setTimeout(onClose, 1000); },
            (err) => { setPrinting(false); setError("Gagal cetak: " + err); }
        );
    };

    return (
        <div className="fixed inset-0 z-[90] bg-black/70 flex items-end sm:items-center justify-center pb-0 sm:p-4">
            <div className="w-full sm:max-w-md bg-white dark:bg-slate-800 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="flex justify-between items-center px-5 py-4 bg-orange-500 text-white">
                    <div className="flex items-center gap-2">
                        <PrinterIcon className="w-5 h-5" />
                        <span className="font-bold">Pilih Printer Bluetooth</span>
                    </div>
                    <button onClick={onClose} className="hover:bg-white/20 p-1.5 rounded-lg transition">
                        <XMarkIcon className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
                    {/* Status */}
                    {status && (
                        <div className="px-4 py-2 bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700 text-green-700 dark:text-green-300 rounded-xl text-sm">
                            ✓ {status}
                        </div>
                    )}
                    {error && (
                        <div className="px-4 py-2 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 text-red-700 dark:text-red-300 rounded-xl text-sm">
                            {error}
                        </div>
                    )}

                    {/* Scan button */}
                    <button onClick={scan} disabled={scanning}
                        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 border-dashed border-orange-300 dark:border-orange-600 text-orange-500 dark:text-orange-400 text-sm font-semibold hover:bg-orange-50 dark:hover:bg-orange-900/20 transition disabled:opacity-50">
                        <ArrowPathIcon className={`w-4 h-4 ${scanning ? "animate-spin" : ""}`} />
                        {scanning ? "Mencari perangkat..." : "Scan Ulang"}
                    </button>

                    {/* Device list */}
                    <div className="space-y-2">
                        <p className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                            Perangkat Terpasang ({devices.length})
                        </p>
                        {devices.length === 0 && !scanning && (
                            <p className="text-sm text-gray-400 dark:text-slate-500 text-center py-4">
                                Tidak ada perangkat. Pasangkan printer di Settings Bluetooth Android dulu.
                            </p>
                        )}
                        {devices.map((d) => {
                            const isSelected = selected?.address === d.address;
                            const isConn = isSelected && connected;
                            return (
                                <button key={d.address} onClick={() => connectTo(d)} disabled={connecting || printing}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition text-left
                                        ${isConn
                                            ? "border-green-400 bg-green-50 dark:bg-green-900/20"
                                            : "border-gray-200 dark:border-slate-600 hover:border-orange-300 dark:hover:border-orange-500 hover:bg-gray-50 dark:hover:bg-slate-700"
                                        }`}>
                                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0
                                        ${isConn ? "bg-green-500" : "bg-gray-100 dark:bg-slate-700"}`}>
                                        <SignalIcon className={`w-5 h-5 ${isConn ? "text-white" : "text-gray-400"}`} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-sm text-gray-900 dark:text-white truncate">{d.name ?? "Unknown"}</p>
                                        <p className="text-xs text-gray-400 dark:text-slate-500">{d.address}</p>
                                    </div>
                                    {isConn && <span className="text-xs text-green-600 dark:text-green-400 font-semibold">Terhubung</span>}
                                    {isSelected && connecting && <ArrowPathIcon className="w-4 h-4 text-orange-400 animate-spin" />}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Footer */}
                <div className="px-5 py-4 border-t border-gray-100 dark:border-slate-700 flex gap-3">
                    <button onClick={onClose}
                        className="flex-1 py-3 rounded-xl border border-gray-200 dark:border-slate-600 text-gray-600 dark:text-slate-300 font-semibold text-sm hover:bg-gray-50 dark:hover:bg-slate-700 transition">
                        Batal
                    </button>
                    <button onClick={handlePrint} disabled={!connected || printing}
                        className="flex-1 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm transition disabled:opacity-40 flex items-center justify-center gap-2">
                        {printing
                            ? <><ArrowPathIcon className="w-4 h-4 animate-spin" /> Mencetak...</>
                            : <><PrinterIcon className="w-4 h-4" /> Cetak Nota</>
                        }
                    </button>
                </div>
            </div>
        </div>
    );
}
