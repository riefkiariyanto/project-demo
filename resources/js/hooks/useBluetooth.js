import { useState, useCallback } from "react";

// Cek apakah berjalan di dalam Capacitor (native Android)
const isNative = () => typeof window !== "undefined" && window.Capacitor?.isNative;

// ESC/POS commands
const ESC = 0x1b;
const GS  = 0x1d;
const LF  = 0x0a;

function textToBytes(str) {
    return Array.from(new TextEncoder().encode(str));
}

function buildEscPos({ store, kasirName, invoiceNo, saleDate, items, total, payment, paid, change }) {
    const fmt = (v) => new Intl.NumberFormat("id-ID", {
        style: "currency", currency: "IDR", minimumFractionDigits: 0
    }).format(v || 0);

    const W = 32; // lebar kertas 58mm = 32 karakter
    const line  = (t = "")  => [...textToBytes(t.slice(0, W).padEnd(W)), LF];
    const center = (t = "") => {
        const pad = Math.max(0, Math.floor((W - t.length) / 2));
        return line(" ".repeat(pad) + t);
    };
    const divider = () => line("-".repeat(W));
    const row = (l, r) => {
        const space = Math.max(1, W - l.length - r.length);
        return line(l + " ".repeat(space) + r);
    };

    const bytes = [
        // Init
        ESC, 0x40,
        // Bold ON
        ESC, 0x45, 0x01,
        ...center(store?.name ?? "TOKO"),
        ESC, 0x45, 0x00,
        ...center(store?.address ?? ""),
        ...(store?.phone ? center(store.phone) : []),
        ...divider(),
        ...line(`No : ${invoiceNo}`),
        ...line(`Tgl: ${saleDate}`),
        ...line(`Kas: ${kasirName}`),
        ...line(`Byr: ${payment}`),
        ...divider(),
    ];

    // Items
    for (const item of items) {
        bytes.push(...line(item.name));
        bytes.push(...row(`  ${item.qty}x ${fmt(item.price)}`, fmt(item.price * item.qty)));
    }

    bytes.push(
        ...divider(),
        ESC, 0x45, 0x01,
        ...row("TOTAL", fmt(total)),
        ESC, 0x45, 0x00,
    );

    if (payment !== "QRIS" && paid) {
        bytes.push(
            ...row("Tunai", fmt(paid)),
            ...row("Kembali", fmt(change)),
        );
    }

    bytes.push(
        ...divider(),
        ...center("Terima kasih!"),
        ...center("WERP"),
        LF, LF, LF,
        // Cut paper
        GS, 0x56, 0x00,
    );

    return new Uint8Array(bytes);
}

export function useBluetooth() {
    const [devices, setDevices]     = useState([]);
    const [connected, setConnected] = useState(false);
    const [deviceName, setDeviceName] = useState(null);
    const [loading, setLoading]     = useState(false);
    const [error, setError]         = useState(null);

    const getPlugin = () => window.bluetoothSerial;

    // Scan paired devices
    const scanDevices = useCallback(() => new Promise((resolve, reject) => {
        if (!isNative()) return reject("Bukan environment native");
        const bt = getPlugin();
        if (!bt) return reject("Plugin Bluetooth tidak tersedia");

        bt.list(
            (list) => { setDevices(list); resolve(list); },
            (err)  => reject(err)
        );
    }), []);

    // Connect ke printer
    const connect = useCallback((address) => new Promise((resolve, reject) => {
        const bt = getPlugin();
        if (!bt) return reject("Plugin tidak tersedia");

        setLoading(true);
        setError(null);
        bt.connect(
            address,
            () => {
                setConnected(true);
                setLoading(false);
                const dev = devices.find(d => d.address === address);
                setDeviceName(dev?.name ?? address);
                resolve({ ok: true });
            },
            (err) => {
                setLoading(false);
                setError(err);
                reject(err);
            }
        );
    }), [devices]);

    // Disconnect
    const disconnect = useCallback(() => {
        const bt = getPlugin();
        if (bt) bt.disconnect(() => {}, () => {});
        setConnected(false);
        setDeviceName(null);
    }, []);

    // Print nota
    const printReceipt = useCallback((data) => new Promise((resolve, reject) => {
        if (!isNative()) {
            // Fallback ke window.print() di browser
            return resolve({ ok: false, fallback: true });
        }

        const bt = getPlugin();
        if (!bt) return reject("Plugin tidak tersedia");
        if (!connected) return reject("Printer belum terhubung");

        const bytes = buildEscPos(data);

        bt.write(
            bytes,
            () => resolve({ ok: true }),
            (err) => reject(err)
        );
    }), [connected]);

    return {
        isNative: isNative(),
        devices,
        connected,
        deviceName,
        loading,
        error,
        scanDevices,
        connect,
        disconnect,
        printReceipt,
    };
}
