import { buildEscPos } from '@/helpers/escpos';
import { useState, useCallback } from "react";

// Cek apakah berjalan di dalam Capacitor (native Android)
const isNative = () => typeof window !== "undefined" && window.Capacitor?.isNative;

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
