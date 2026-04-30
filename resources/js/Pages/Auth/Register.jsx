import InputError from "@/Components/InputError";
import InputLabel from "@/Components/InputLabel";
import PrimaryButton from "@/Components/PrimaryButton";
import TextInput from "@/Components/TextInput";
import { Head, Link, useForm } from "@inertiajs/react";
import { User, Mail, Lock, Store, KeyRound } from "lucide-react";
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

            <div className="
                min-h-screen flex items-center justify-center
                bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950
                px-4
            ">
                <div className="
                    w-full max-w-md
                    bg-white/5 backdrop-blur-xl
                    border border-white/10
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
                    <div className="flex rounded-xl bg-white/5 border border-white/10 p-1 mb-6">
                        <button
                            type="button"
                            onClick={() => switchMode("store")}
                            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-semibold transition-all
                                ${mode === "store"
                                    ? "bg-indigo-600 text-white"
                                    : "text-gray-400 hover:text-white"}`}
                        >
                            <Store className="w-4 h-4" />
                            Daftar Toko
                        </button>
                        <button
                            type="button"
                            onClick={() => switchMode("user")}
                            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-semibold transition-all
                                ${mode === "user"
                                    ? "bg-indigo-600 text-white"
                                    : "text-gray-400 hover:text-white"}`}
                        >
                            <KeyRound className="w-4 h-4" />
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
                                        <Store className="absolute left-3 top-3 h-5 w-5 text-gray-500" />
                                        <TextInput
                                            type="text"
                                            value={data.store_name}
                                            placeholder="Contoh: Warkop Bahagia"
                                            className="w-full pl-10 py-2.5 bg-white/5 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-indigo-500"
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
                                            className="w-full px-4 py-2.5 bg-white/5 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-indigo-500"
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
                                    <KeyRound className="absolute left-3 top-3 h-5 w-5 text-gray-500" />
                                    <TextInput
                                        type="text"
                                        value={data.invite_code}
                                        placeholder="Masukkan kode toko (contoh: AB12CD34)"
                                        className="w-full pl-10 py-2.5 bg-white/5 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-indigo-500 uppercase"
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
                                <User className="absolute left-3 top-3 h-5 w-5 text-gray-500" />
                                <TextInput
                                    type="text"
                                    value={data.name}
                                    placeholder="Nama kamu"
                                    className="w-full pl-10 py-2.5 bg-white/5 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-indigo-500"
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
                                <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-500" />
                                <TextInput
                                    type="email"
                                    value={data.email}
                                    placeholder="email@kamu.com"
                                    className="w-full pl-10 py-2.5 bg-white/5 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-indigo-500"
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
                                <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-500" />
                                <TextInput
                                    type={showPassword ? "text" : "password"}
                                    value={data.password}
                                    className="w-full pl-10 pr-10 py-2.5 bg-white/5 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-indigo-500"
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
                                <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-500" />
                                <TextInput
                                    type={showConfirm ? "text" : "password"}
                                    value={data.password_confirmation}
                                    className="w-full pl-10 pr-10 py-2.5 bg-white/5 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-indigo-500"
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
                            className="w-full justify-center bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 rounded-lg"
                            disabled={processing}
                        >
                            {processing
                                ? "Memproses..."
                                : mode === "store" ? "Buat Toko & Daftar" : "Gabung Toko"}
                        </PrimaryButton>
                    </form>

                    {/* LOGIN LINK */}
                    <div className="mt-6 text-center text-sm text-gray-400">
                        Sudah punya akun?{" "}
                        <Link href={route("login")} className="text-indigo-400 font-semibold">
                            Login
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
}