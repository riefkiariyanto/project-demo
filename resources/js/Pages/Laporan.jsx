import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head } from "@inertiajs/react";

export default function Laporan() {
    return(
        <AuthenticatedLayout
         header={
                <h2 className="text-3xl font-semibold leading-tight text-white">
                    laporan
                </h2>
            }>
       <Head title="Laporan" />
            <div className="py-12">
                
            </div>
        </AuthenticatedLayout>
    );
    
}