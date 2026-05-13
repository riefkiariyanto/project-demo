const ESC = 0x1b;
const GS  = 0x1d;
const LF  = 0x0a;
const W   = 32; // lebar kertas 58mm = 32 karakter

const enc     = (s) => Array.from(new TextEncoder().encode(String(s).slice(0, W)));
const line    = (t = '') => [...enc(String(t).padEnd(W)), LF];
const center  = (t = '') => { const p = Math.max(0, Math.floor((W - t.length) / 2)); return line(' '.repeat(p) + t); };
const divider = () => line('-'.repeat(W));
const row     = (l, r) => { const sp = Math.max(1, W - l.length - r.length); return line(l + ' '.repeat(sp) + r); };

const fmt = (v) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(v || 0);

export function buildEscPos({ store, kasirName, invoiceNo, saleDate, items, total, payment, paid, change }) {
    const bytes = [
        ESC, 0x40,
        ESC, 0x45, 0x01, ...center(store?.name ?? 'TOKO'), ESC, 0x45, 0x00,
        ...center(store?.address ?? ''),
        ...(store?.phone ? center(store.phone) : []),
        ...divider(),
        ...line(`No : ${invoiceNo}`),
        ...line(`Tgl: ${saleDate}`),
        ...line(`Kas: ${kasirName}`),
        ...line(`Byr: ${payment}`),
        ...divider(),
    ];

    for (const item of items) {
        bytes.push(...line(item.name));
        bytes.push(...row(`  ${item.qty}x ${fmt(item.price)}`, fmt((item.price ?? 0) * (item.qty ?? 1))));
    }

    bytes.push(
        ...divider(),
        ESC, 0x45, 0x01, ...row('TOTAL', fmt(total)), ESC, 0x45, 0x00,
    );

    if (payment !== 'QRIS' && paid) {
        bytes.push(...row('Tunai', fmt(paid)), ...row('Kembali', fmt(change)));
    }

    bytes.push(
        ...divider(),
        ...center('Terima kasih!'),
        ...center('WERP'),
        LF, LF, LF,
        GS, 0x56, 0x00,
    );

    return new Uint8Array(bytes);
}
