import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head } from "@inertiajs/react";

export default function Kasir() {
    return(
        <AuthenticatedLayout
         header={
                <h2 className="text-3xl font-semibold leading-tight text-white">
                    Kasir
                </h2>
            }>
       <Head title="Kasir" />
            <div className="py-12">
                
            </div>
        </AuthenticatedLayout>
    );
    
}