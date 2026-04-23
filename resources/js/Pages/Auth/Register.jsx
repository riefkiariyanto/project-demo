import InputError from "@/Components/InputError";
import InputLabel from "@/Components/InputLabel";
import PrimaryButton from "@/Components/PrimaryButton";
import TextInput from "@/Components/TextInput";
import { Head, Link, useForm } from "@inertiajs/react";
import { User, Mail, Lock } from "lucide-react";
import { useState } from "react";

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: "",
        email: "",
        password: "",
        password_confirmation: "",
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const submit = (e) => {
        e.preventDefault();

        post(route("register"), {
            onFinish: () => reset("password", "password_confirmation"),
        });
    };

    return (
        <>
            <Head title="Register" />

            <div className="
                min-h-screen
                flex items-center justify-center
                bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950
                px-4
            ">

                <div className="
                    w-full max-w-md
                    bg-white/5 backdrop-blur-xl
                    border border-white/10
                    rounded-2xl
                    p-6 sm:p-8
                    shadow-xl
                ">

                    {/* HEADER */}
                    <div className="mb-6 text-center">
                        <h1 className="text-2xl font-bold text-white">
                            Create Account 🚀
                        </h1>
                        <p className="text-sm text-gray-400 mt-1">
                            Daftar untuk mulai menggunakan aplikasi
                        </p>
                    </div>

                    {/* FORM */}
                    <form onSubmit={submit} className="space-y-4">

                        {/* NAME */}
                        <div>
                            <InputLabel value="Name" />
                            <div className="relative mt-1">
                                <User className="absolute left-3 top-3 h-5 w-5 text-gray-500" />
                                <TextInput
                                    type="text"
                                    value={data.name}
                                    className="w-full pl-10 py-2.5 bg-white/5 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-indigo-500"
                                    onChange={(e) =>
                                        setData("name", e.target.value)
                                    }
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
                                    className="w-full pl-10 py-2.5 bg-white/5 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-indigo-500"
                                    onChange={(e) =>
                                        setData("email", e.target.value)
                                    }
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
                                    onChange={(e) =>
                                        setData("password", e.target.value)
                                    }
                                    required
                                />

                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-3 text-gray-400"
                                >
                                    {showPassword ? "🙈" : "👁"}
                                </button>
                            </div>
                            <InputError message={errors.password} className="mt-1" />
                        </div>

                        {/* CONFIRM PASSWORD */}
                        <div>
                            <InputLabel value="Confirm Password" />
                            <div className="relative mt-1">
                                <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-500" />
                                <TextInput
                                    type={showConfirm ? "text" : "password"}
                                    value={data.password_confirmation}
                                    className="w-full pl-10 pr-10 py-2.5 bg-white/5 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-indigo-500"
                                    onChange={(e) =>
                                        setData("password_confirmation", e.target.value)
                                    }
                                    required
                                />

                                <button
                                    type="button"
                                    onClick={() => setShowConfirm(!showConfirm)}
                                    className="absolute right-3 top-3 text-gray-400"
                                >
                                    {showConfirm ? "🙈" : "👁"}
                                </button>
                            </div>
                            <InputError
                                message={errors.password_confirmation}
                                className="mt-1"
                            />
                        </div>

                        {/* BUTTON */}
                        <PrimaryButton
                            className="
                                w-full justify-center
                                bg-indigo-600 hover:bg-indigo-700
                                text-white font-semibold
                                py-2.5 rounded-lg
                            "
                            disabled={processing}
                        >
                            Register
                        </PrimaryButton>
                    </form>

                    {/* LOGIN LINK */}
                    <div className="mt-6 text-center text-sm text-gray-400">
                        Sudah punya akun?{" "}
                        <Link
                            href={route("login")}
                            className="text-indigo-400 font-semibold"
                        >
                            Login
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
}