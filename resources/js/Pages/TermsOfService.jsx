import { Head, Link } from "@inertiajs/react";

export default function TermsOfService() {
    const updated = "13 Mei 2026";

    return (
        <>
            <Head title="Syarat & Ketentuan — WERP" />
            <div className="min-h-screen bg-gray-50 text-gray-800">
                {/* Header */}
                <div className="bg-orange-500 text-white py-10 px-4 text-center">
                    <h1 className="text-3xl font-bold tracking-tight">WERP</h1>
                    <p className="mt-1 text-orange-100 text-sm">Warung & Resto Point of Sale</p>
                </div>

                <div className="max-w-3xl mx-auto px-4 py-10 space-y-8">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Syarat & Ketentuan Penggunaan</h2>
                        <p className="text-sm text-gray-400 mt-1">Terakhir diperbarui: {updated}</p>
                    </div>

                    <p className="text-gray-600 leading-relaxed">
                        Dengan menggunakan layanan WERP, Anda menyatakan telah membaca, memahami, dan menyetujui
                        syarat dan ketentuan berikut. Jika Anda tidak menyetujui, harap hentikan penggunaan layanan.
                    </p>

                    <Section title="1. Deskripsi Layanan">
                        <p className="text-gray-600 leading-relaxed">
                            WERP adalah aplikasi Point of Sale (POS) berbasis web yang ditujukan untuk usaha warung,
                            restoran, dan bisnis sejenis. Layanan mencakup manajemen produk, kasir, laporan penjualan,
                            manajemen bahan baku, dan manajemen pengguna.
                        </p>
                    </Section>

                    <Section title="2. Eligibilitas Pengguna">
                        <ul className="list-disc pl-5 space-y-1 text-gray-600">
                            <li>Pengguna harus berusia minimal 17 tahun atau memiliki izin dari wali.</li>
                            <li>Akun dibuat atas undangan pemilik toko atau administrator.</li>
                            <li>Pengguna bertanggung jawab atas kerahasiaan kredensial akun masing-masing.</li>
                        </ul>
                    </Section>

                    <Section title="3. Penggunaan yang Diizinkan">
                        <p className="text-gray-600 leading-relaxed">Anda diizinkan menggunakan WERP untuk:</p>
                        <ul className="list-disc pl-5 mt-2 space-y-1 text-gray-600">
                            <li>Mengelola operasional usaha secara sah sesuai hukum Indonesia.</li>
                            <li>Mencatat transaksi penjualan dan stok produk.</li>
                            <li>Mengakses laporan keuangan toko Anda.</li>
                        </ul>
                    </Section>

                    <Section title="4. Penggunaan yang Dilarang">
                        <ul className="list-disc pl-5 space-y-1 text-gray-600">
                            <li>Menggunakan layanan untuk kegiatan ilegal atau melanggar hukum Indonesia.</li>
                            <li>Mencoba mengakses data toko atau akun pengguna lain tanpa izin.</li>
                            <li>Melakukan rekayasa balik, decompiling, atau modifikasi sistem tanpa izin tertulis.</li>
                            <li>Menggunakan bot atau skrip otomatis untuk mengakses layanan secara tidak wajar.</li>
                            <li>Menyebarkan konten yang melanggar hak kekayaan intelektual pihak lain.</li>
                        </ul>
                    </Section>

                    <Section title="5. Kepemilikan Data">
                        <p className="text-gray-600 leading-relaxed">
                            Data transaksi, produk, dan toko yang Anda masukkan ke dalam sistem tetap menjadi
                            milik Anda. Kami tidak mengklaim kepemilikan atas konten yang Anda buat.
                            Dengan menggunakan layanan, Anda memberikan kami lisensi terbatas untuk memproses
                            data tersebut guna menjalankan layanan.
                        </p>
                    </Section>

                    <Section title="6. Ketersediaan Layanan">
                        <p className="text-gray-600 leading-relaxed">
                            Kami berupaya menjaga ketersediaan layanan secara optimal. Namun, kami tidak menjamin
                            layanan bebas dari gangguan. Pemeliharaan berkala dapat menyebabkan downtime sementara
                            dan akan diberitahukan sebelumnya jika memungkinkan.
                        </p>
                    </Section>

                    <Section title="7. Batasan Tanggung Jawab">
                        <p className="text-gray-600 leading-relaxed">
                            Kami tidak bertanggung jawab atas kerugian yang timbul akibat:
                        </p>
                        <ul className="list-disc pl-5 mt-2 space-y-1 text-gray-600">
                            <li>Gangguan layanan di luar kendali kami (force majeure).</li>
                            <li>Kesalahan input data oleh pengguna.</li>
                            <li>Akses tidak sah akibat kelalaian pengguna dalam menjaga kredensial.</li>
                            <li>Kerugian tidak langsung, kehilangan keuntungan, atau kerugian bisnis.</li>
                        </ul>
                    </Section>

                    <Section title="8. Penangguhan & Penghentian Akun">
                        <p className="text-gray-600 leading-relaxed">
                            Kami berhak menangguhkan atau menghentikan akun yang melanggar syarat ini tanpa
                            pemberitahuan sebelumnya. Pengguna dapat mengajukan permohonan penutupan akun
                            kapan saja melalui kontak resmi kami.
                        </p>
                    </Section>

                    <Section title="9. Hukum yang Berlaku">
                        <p className="text-gray-600 leading-relaxed">
                            Syarat dan ketentuan ini diatur oleh hukum Republik Indonesia. Setiap perselisihan
                            akan diselesaikan melalui musyawarah, dan jika tidak tercapai kesepakatan,
                            melalui Pengadilan Negeri yang berwenang di Indonesia.
                        </p>
                    </Section>

                    <Section title="10. Perubahan Syarat">
                        <p className="text-gray-600 leading-relaxed">
                            Kami berhak mengubah syarat ini sewaktu-waktu. Perubahan akan diberitahukan
                            minimal 7 hari sebelum berlaku melalui email terdaftar atau notifikasi aplikasi.
                        </p>
                    </Section>

                    <Section title="11. Kontak & Pengaduan">
                        <p className="text-gray-600 leading-relaxed">
                            Pengaduan dan pertanyaan dapat disampaikan melalui:
                        </p>
                        <ul className="list-disc pl-5 mt-2 space-y-1 text-gray-600">
                            <li>Email: <a href="mailto:support@werp.id" className="text-orange-500 hover:underline">support@werp.id</a></li>
                            <li>Waktu respons: 1–3 hari kerja.</li>
                        </ul>
                    </Section>

                    <div className="border-t border-gray-200 pt-6 flex gap-4 text-sm">
                        <Link href="/" className="text-orange-500 hover:underline">← Kembali ke Beranda</Link>
                        <Link href="/privacy" className="text-orange-500 hover:underline">Kebijakan Privasi →</Link>
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
