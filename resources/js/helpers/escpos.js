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

export async function buildLogoBytes(logoUrl) {
    return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
            const maxDim = 200;
            let w = img.naturalWidth, h = img.naturalHeight;
            const scale = Math.min(1, maxDim / Math.max(w, h));
            w = Math.round(w * scale); h = Math.round(h * scale);
            const printW = Math.ceil(w / 8) * 8;
            const widthBytes = printW / 8;
            const canvas = document.createElement('canvas');
            canvas.width = printW; canvas.height = h;
            const ctx = canvas.getContext('2d');
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, printW, h);
            ctx.drawImage(img, Math.floor((printW - w) / 2), 0, w, h);
            const { data } = ctx.getImageData(0, 0, printW, h);
            const paperBytes = 48; // 58mm @ 203dpi = 384 dots = 48 bytes
            const padL = Math.max(0, Math.floor((paperBytes - widthBytes) / 2));
            const bitmap = [];
            for (let y = 0; y < h; y++) {
                for (let p = 0; p < padL; p++) bitmap.push(0x00);
                for (let xB = 0; xB < widthBytes; xB++) {
                    let byte = 0;
                    for (let bit = 0; bit < 8; bit++) {
                        const x = xB * 8 + bit;
                        const i = (y * printW + x) * 4;
                        const lum = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
                        if (lum < 128) byte |= (0x80 >> bit);
                    }
                    bitmap.push(byte);
                }
                const rightPad = Math.max(0, paperBytes - padL - widthBytes);
                for (let p = 0; p < rightPad; p++) bitmap.push(0x00);
            }
            const xL = paperBytes & 0xFF, xH = (paperBytes >> 8) & 0xFF;
            const yL = h & 0xFF, yH = (h >> 8) & 0xFF;
            resolve([0x1D, 0x76, 0x30, 0x00, xL, xH, yL, yH, ...bitmap, 0x0A]);
        };
        img.onerror = () => resolve([]);
        img.src = logoUrl;
    });
}

export function buildEscPos({ store, kasirName, invoiceNo, saleDate, items, total, payment, paid, change, logoBitmap = [] }) {
    const bytes = [
        ESC, 0x40,
        ...logoBitmap,
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

export function buildReceiptText({ store, kasirName, invoiceNo, saleDate, items, total, payment, paid, change }) {
    const ctr = (s = '') => { const p = Math.max(0, Math.floor((W - s.length) / 2)); return ' '.repeat(p) + s; };
    const div = '-'.repeat(W);
    const rw  = (l, r) => { const sp = Math.max(1, W - l.length - r.length); return l + ' '.repeat(sp) + r; };

    const lines = [
        ctr(store?.name ?? 'TOKO'),
        ctr(store?.address ?? ''),
        ...(store?.phone ? [ctr(store.phone)] : []),
        div,
        `No : ${invoiceNo}`,
        `Tgl: ${saleDate}`,
        `Kas: ${kasirName}`,
        `Byr: ${payment}`,
        div,
    ];

    for (const item of items) {
        lines.push(item.name);
        lines.push(rw(`  ${item.qty}x ${fmt(item.price)}`, fmt((item.price ?? 0) * (item.qty ?? 1))));
    }

    lines.push(div);
    lines.push(rw('TOTAL', fmt(total)));

    if (payment !== 'QRIS' && paid) {
        lines.push(rw('Tunai', fmt(paid)));
        lines.push(rw('Kembali', fmt(change)));
    }

    lines.push(div, ctr('Terima kasih!'), ctr('WERP'));
    return lines.join('\n');
}

export function buildReceiptHTML({ store, kasirName, invoiceNo, saleDate, items, total, payment, paid, change }) {
    const ctr = (s = '') => { const p = Math.max(0, Math.floor((W - s.length) / 2)); return ' '.repeat(p) + s; };
    const div = '-'.repeat(W);
    const rw  = (l, r) => { const sp = Math.max(1, W - l.length - r.length); return l + ' '.repeat(sp) + r; };

    const lines = [
        `<b>${ctr(store?.name ?? 'TOKO')}</b>`,
        ctr(store?.address ?? ''),
        ...(store?.phone ? [ctr(store.phone)] : []),
        div,
        `No : ${invoiceNo}`,
        `Tgl: ${saleDate}`,
        `Kas: ${kasirName}`,
        `Byr: ${payment}`,
        div,
    ];

    for (const item of items) {
        lines.push(item.name);
        lines.push(rw(`  ${item.qty}x ${fmt(item.price)}`, fmt((item.price ?? 0) * (item.qty ?? 1))));
    }

    lines.push(div);
    lines.push(`<b>${rw('TOTAL', fmt(total))}</b>`);

    if (payment !== 'QRIS' && paid) {
        lines.push(rw('Tunai', fmt(paid)));
        lines.push(rw('Kembali', fmt(change)));
    }

    lines.push(div, ctr('Terima kasih!'), ctr('WERP'));

    const logoHtml = store?.logo
        ? `<div style="text-align:center;margin-bottom:8px"><img src="/storage/${store.logo}" style="width:72px;height:72px;border-radius:50%;object-fit:cover" /></div>`
        : '';

    return `<!DOCTYPE html>
<html lang="id"><head>
<meta charset="UTF-8"/>
<title>Nota ${invoiceNo}</title>
<style>
  body{margin:0;padding:12px;background:#fff}
  pre{font-family:'Courier New',Courier,monospace;font-size:13px;line-height:1.6;white-space:pre;margin:0}
  @media print{body{padding:0}}
</style>
</head>
<body>
${logoHtml}<pre>${lines.join('\n')}</pre>
<script>window.onload=()=>{window.print();window.onafterprint=()=>window.close();}<\/script>
</body>
</html>`;
}
