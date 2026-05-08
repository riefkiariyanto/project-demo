import InputError from "@/Components/InputError";
import InputLabel from "@/Components/InputLabel";
import PrimaryButton from "@/Components/PrimaryButton";
import TextInput from "@/Components/TextInput";
import { Head, Link, useForm } from "@inertiajs/react";
import { UserIcon, EnvelopeIcon, LockClosedIcon, BuildingStorefrontIcon, KeyIcon } from "@heroicons/react/24/outline";
import { useState } from "react";

export default function Register() {
    // "store" = daftar toko baru, "user" = pakai kode toko
    const [mode, setMode] = useState("store");

    const { data, setData, post, processing, errors, reset } = useForm({
        name: "",
        email: "",
        password: "",
        password_confirmation: "",
        store_name: "",
        store_address: "",
        invite_code: "",
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const switchMode = (newMode) => {
        setMode(newMode);
        reset();
    };

    const submit = (e) => {
        e.preventDefault();

        const routeName = mode === "store" ? "register.store" : "register.user";

        post(route(routeName), {
            onFinish: () => reset("password", "password_confirmation"),
        });
    };

    return (
        <>
            <Head title="Register" />
            <div className="absolute inset-0 overflow-hidden">

    <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-orange-400/20 rounded-full blur-3xl animate-pulse"></div>

    <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-orange-500/20 rounded-full blur-3xl animate-pulse"></div>

    <div className="absolute inset-0 opacity-[0.05]"
        style={{
            backgroundImage:
                "linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)",
            backgroundSize: "60px 60px",
        }}
    ></div>

</div>

            <div className="
                min-h-screen flex items-center justify-center
                bg-black overflow-hidden relative
                px-4
            ">
                <div className="
                    relative z-10
                    w-full max-w-md
                    bg-white/10 backdrop-blur-xl
                    border border-orange-400/10
                    rounded-2xl p-6 sm:p-8 shadow-xl
                ">
                    {/* HEADER */}
                    <div className="mb-6 text-center">
                        <h1 className="text-2xl font-bold text-white">
                            {mode === "store" ? "Daftar Toko Baru 🏪" : "Gabung Toko 🔑"}
                        </h1>
                        <p className="text-sm text-gray-400 mt-1">
                            {mode === "store"
                                ? "Buat toko baru dan jadilah admin"
                                : "Masukkan kode toko untuk bergabung"}
                        </p>
                    </div>

                    {/* TOGGLE MODE */}
                    <div className="flex rounded-xl bg-white/10 border border-orange-400/10 p-1 mb-6">
                        <button
                            type="button"
                            onClick={() => switchMode("store")}
                            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-semibold transition-all
                                ${mode === "store"
                                    ? "bg-orange-600 text-white"
                                    : "text-gray-400 hover:text-white"}`}
                        >
                            <BuildingStorefrontIcon className="w-4 h-4" />
                            Daftar Toko
                        </button>
                        <button
                            type="button"
                            onClick={() => switchMode("user")}
                            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-semibold transition-all
                                ${mode === "user"
                                    ? "bg-orange-600 text-white"
                                    : "text-gray-400 hover:text-white"}`}
                        >
                            <KeyIcon className="w-4 h-4" />
                            Punya Kode
                        </button>
                    </div>

                    {/* FORM */}
                    <form onSubmit={submit} className="space-y-4">

                        {/* STORE FIELDS — hanya tampil di mode store */}
                        {mode === "store" && (
                            <>
                                <div>
                                    <InputLabel value="Nama Toko" />
                                    <div className="relative mt-1">
                                        <BuildingStorefrontIcon className="absolute left-3 top-3 h-5 w-5 text-gray-500" />
                                        <TextInput
                                            type="text"
                                            value={data.store_name}
                                            placeholder="Contoh: Warkop Bahagia"
                                            className="w-full pl-10 py-2.5 bg-white/10 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-orange-500"
                                            onChange={(e) => setData("store_name", e.target.value)}
                                            required
                                        />
                                    </div>
                                    <InputError message={errors.store_name} className="mt-1" />
                                </div>

                                <div>
                                    <InputLabel value="Alamat Toko (opsional)" />
                                    <div className="relative mt-1">
                                        <TextInput
                                            type="text"
                                            value={data.store_address}
                                            placeholder="Alamat toko"
                                            className="w-full px-4 py-2.5 bg-white/10 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-orange-500"
                                            onChange={(e) => setData("store_address", e.target.value)}
                                        />
                                    </div>
                                    <InputError message={errors.store_address} className="mt-1" />
                                </div>
                            </>
                        )}

                        {/* INVITE CODE — hanya tampil di mode user */}
                        {mode === "user" && (
                            <div>
                                <InputLabel value="Kode Toko" />
                                <div className="relative mt-1">
                                    <KeyIcon className="absolute left-3 top-3 h-5 w-5 text-gray-500" />
                                    <TextInput
                                        type="text"
                                        value={data.invite_code}
                                        placeholder="Masukkan kode toko (contoh: AB12CD34)"
                                        className="w-full pl-10 py-2.5 bg-white/10 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-orange-500 uppercase"
                                        onChange={(e) => setData("invite_code", e.target.value.toUpperCase())}
                                        required
                                    />
                                </div>
                                <InputError message={errors.invite_code} className="mt-1" />
                            </div>
                        )}

                        {/* NAME */}
                        <div>
                            <InputLabel value="Nama Lengkap" />
                            <div className="relative mt-1">
                                <UserIcon className="absolute left-3 top-3 h-5 w-5 text-gray-500" />
                                <TextInput
                                    type="text"
                                    value={data.name}
                                    placeholder="Nama kamu"
                                    className="w-full pl-10 py-2.5 bg-white/10 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-orange-500"
                                    onChange={(e) => setData("name", e.target.value)}
                                    required
                                />
                            </div>
                            <InputError message={errors.name} className="mt-1" />
                        </div>

                        {/* EMAIL */}
                        <div>
                            <InputLabel value="Email" />
                            <div className="relative mt-1">
                                <EnvelopeIcon className="absolute left-3 top-3 h-5 w-5 text-gray-500" />
                                <TextInput
                                    type="email"
                                    value={data.email}
                                    placeholder="email@kamu.com"
                                    className="w-full pl-10 py-2.5 bg-white/10 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-orange-500"
                                    onChange={(e) => setData("email", e.target.value)}
                                    required
                                />
                            </div>
                            <InputError message={errors.email} className="mt-1" />
                        </div>

                        {/* PASSWORD */}
                        <div>
                            <InputLabel value="Password" />
                            <div className="relative mt-1">
                                <LockClosedIcon className="absolute left-3 top-3 h-5 w-5 text-gray-500" />
                                <TextInput
                                    type={showPassword ? "text" : "password"}
                                    value={data.password}
                                    className="w-full pl-10 pr-10 py-2.5 bg-white/10 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-orange-500"
                                    onChange={(e) => setData("password", e.target.value)}
                                    required
                                />
                                <button type="button" onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-3 text-gray-400">
                                    {showPassword ? "🙈" : "👁"}
                                </button>
                            </div>
                            <InputError message={errors.password} className="mt-1" />
                        </div>

                        {/* CONFIRM PASSWORD */}
                        <div>
                            <InputLabel value="Konfirmasi Password" />
                            <div className="relative mt-1">
                                <LockClosedIcon className="absolute left-3 top-3 h-5 w-5 text-gray-500" />
                                <TextInput
                                    type={showConfirm ? "text" : "password"}
                                    value={data.password_confirmation}
                                    className="w-full pl-10 pr-10 py-2.5 bg-white/10 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-orange-500"
                                    onChange={(e) => setData("password_confirmation", e.target.value)}
                                    required
                                />
                                <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                                    className="absolute right-3 top-3 text-gray-400">
                                    {showConfirm ? "🙈" : "👁"}
                                </button>
                            </div>
                            <InputError message={errors.password_confirmation} className="mt-1" />
                        </div>

                        {/* BUTTON */}
                        <PrimaryButton
                            className="w-full justify-center bg-gradient-to-r from-orange-400 to-orange-500 hover:scale-[1.02] text-white font-semibold py-2.5 rounded-lg"
                            disabled={processing}
                        >
                            {processing
                                ? "Memproses..."
                                : mode === "store" ? "Buat Toko & Daftar" : "Gabung Toko"}
                        </PrimaryButton>

                        <div className="text-center mb-8">

    <h1 className="text-5xl font-black text-white tracking-widest">
        WERP
    </h1>

    <p className="mt-3 text-white/60">
        Mempermudah pencacatan dan laporan UMKM mu
    </p>

</div>
                    </form>

                    {/* LOGIN LINK */}
                    <div className="mt-6 text-center text-sm text-gray-400">
                        Sudah punya akun?{" "}
                        <Link href={route("login")} className="text-orange-400 font-semibold">
                            Login
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
}