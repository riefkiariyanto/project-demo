import { Head, Link } from "@inertiajs/react";

export default function PrivacyPolicy() {
    const updated = "13 Mei 2026";

    return (
        <>
            <Head title="Kebijakan Privasi — WERP" />
            <div className="min-h-screen bg-gray-50 text-gray-800">
                {/* Header */}
                <div className="bg-orange-500 text-white py-10 px-4 text-center">
                    <h1 className="text-3xl font-bold tracking-tight">WERP</h1>
                    <p className="mt-1 text-orange-100 text-sm">Warung & Resto Point of Sale</p>
                </div>

                <div className="max-w-3xl mx-auto px-4 py-10 space-y-8">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Kebijakan Privasi</h2>
                        <p className="text-sm text-gray-400 mt-1">Terakhir diperbarui: {updated}</p>
                    </div>

                    <p className="text-gray-600 leading-relaxed">
                        WERP ("kami", "layanan kami") berkomitmen untuk melindungi privasi pengguna. Kebijakan ini menjelaskan
                        bagaimana kami mengumpulkan, menggunakan, dan melindungi data Anda saat menggunakan aplikasi WERP.
                    </p>

                    <Section title="1. Data yang Kami Kumpulkan">
                        <ul className="list-disc pl-5 space-y-1 text-gray-600">
                            <li><strong>Data akun:</strong> nama, alamat email, kata sandi terenkripsi, peran pengguna.</li>
                            <li><strong>Data toko:</strong> nama toko, alamat, nomor telepon, logo, gambar QRIS.</li>
                            <li><strong>Data transaksi:</strong> produk, harga, jumlah, metode pembayaran, tanggal transaksi.</li>
                            <li><strong>Data produk & bahan:</strong> nama produk, kategori, resep, stok bahan baku.</li>
                            <li><strong>Data teknis:</strong> alamat IP, jenis perangkat, browser, waktu akses (log sistem).</li>
                        </ul>
                    </Section>

                    <Section title="2. Tujuan Penggunaan Data">
                        <ul className="list-disc pl-5 space-y-1 text-gray-600">
                            <li>Menjalankan fitur kasir, manajemen produk, dan laporan penjualan.</li>
                            <li>Mengautentikasi pengguna dan menjaga keamanan akun.</li>
                            <li>Meningkatkan performa dan stabilitas layanan.</li>
                            <li>Memenuhi kewajiban hukum yang berlaku di Indonesia.</li>
                        </ul>
                    </Section>

                    <Section title="3. Berbagi Data dengan Pihak Ketiga">
                        <p className="text-gray-600 leading-relaxed">
                            Kami <strong>tidak menjual</strong> data pengguna kepada pihak ketiga. Data hanya dapat dibagikan kepada:
                        </p>
                        <ul className="list-disc pl-5 mt-2 space-y-1 text-gray-600">
                            <li>Penyedia infrastruktur cloud untuk keperluan hosting sistem.</li>
                            <li>Otoritas berwenang jika diwajibkan oleh hukum yang berlaku.</li>
                        </ul>
                    </Section>

                    <Section title="4. Keamanan Data">
                        <p className="text-gray-600 leading-relaxed">
                            Kami menerapkan langkah-langkah keamanan teknis, termasuk enkripsi kata sandi (bcrypt),
                            koneksi HTTPS, dan pembatasan akses berbasis peran (role-based access control).
                            Namun, tidak ada sistem yang sepenuhnya bebas risiko.
                        </p>
                    </Section>

                    <Section title="5. Hak Pengguna">
                        <p className="text-gray-600 leading-relaxed">Sesuai UU PDP No. 27 Tahun 2022, Anda berhak untuk:</p>
                        <ul className="list-disc pl-5 mt-2 space-y-1 text-gray-600">
                            <li>Mengakses dan memperbarui data pribadi Anda.</li>
                            <li>Meminta penghapusan akun dan data terkait.</li>
                            <li>Mengajukan keberatan atas pemrosesan data tertentu.</li>
                        </ul>
                    </Section>

                    <Section title="6. Retensi Data">
                        <p className="text-gray-600 leading-relaxed">
                            Data transaksi disimpan selama akun aktif dan hingga 5 tahun setelah penutupan akun
                            untuk keperluan audit dan perpajakan. Data akun dihapus dalam 30 hari setelah permintaan penghapusan.
                        </p>
                    </Section>

                    <Section title="7. Perubahan Kebijakan">
                        <p className="text-gray-600 leading-relaxed">
                            Kami dapat memperbarui kebijakan ini sewaktu-waktu. Perubahan signifikan akan diberitahukan
                            melalui email atau notifikasi di dalam aplikasi. Penggunaan layanan setelah perubahan
                            dianggap sebagai persetujuan terhadap kebijakan yang diperbarui.
                        </p>
                    </Section>

                    <Section title="8. Kontak">
                        <p className="text-gray-600 leading-relaxed">
                            Pertanyaan terkait privasi dapat disampaikan melalui email:{" "}
                            <a href="mailto:support@werp.id" className="text-orange-500 hover:underline">support@werp.id</a>
                        </p>
                    </Section>

                    <div className="border-t border-gray-200 pt-6 flex gap-4 text-sm">
                        <Link href="/" className="text-orange-500 hover:underline">← Kembali ke Beranda</Link>
                        <Link href="/tos" className="text-orange-500 hover:underline">Syarat & Ketentuan →</Link>
                    </div>
                </div>
            </div>
        </>
    );
}

function Section({ title, children }) {
    return (
        <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
            {children}
        </div>
    );
}
