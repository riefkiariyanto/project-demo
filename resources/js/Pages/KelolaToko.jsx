import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head } from "@inertiajs/react";

export default function KelolaToko() {
    return(
        <AuthenticatedLayout
         header={
                <h2 className="text-3xl font-semibold leading-tight text-white">
                    KelolaToko
                </h2>
            }>
       <Head title="KelolaToko" />
            <div className="py-12">
                
            </div>
        </AuthenticatedLayout>
    );
    
}