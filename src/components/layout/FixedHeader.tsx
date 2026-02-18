import { Building2 } from "lucide-react";
import { cn } from "@/lib/utils";

export const FixedHeader = () => {
    return (
        <header className="fixed top-0 left-0 w-full z-50 h-20 bg-white border-b-8 border-[#044D8B] shadow-sm flex items-center justify-between px-8">
            <div className="flex items-center gap-4">
                <div className="flex flex-col">
                    <span className="text-3xl font-bold text-[#044D8B] tracking-tighter">PNAB+</span>
                </div>
                <div className="h-8 w-px bg-gray-300 mx-2"></div>
                <span className="text-sm font-medium text-gray-600">
                    Sistema de gerenciamento de editais PNAB
                </span>
            </div>

            <div className="flex items-center gap-4">
                <span className="font-bold text-gray-800">JAHU-SP</span>
                <div className="flex items-center justify-center w-10 h-10">
                   <img 
                     src="/icon.svg" 
                     alt="Brasão Jau" 
                     className="max-h-full max-w-full object-contain"
                     onError={(e) => {
                       e.currentTarget.style.display = 'none';
                       e.currentTarget.parentElement?.classList.add('bg-gray-100', 'rounded-full');
                     }}
                   />
                   <Building2 className="w-8 h-8 text-blue-900 hidden" />
                </div>
            </div>
        </header>
    );
};
