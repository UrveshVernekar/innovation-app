"use client";

import React, { useState } from "react";
import { Download, Printer, FileText, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ExportPdfButtonProps {
    ideaId: number;
    title: string;
}

export function ExportPdfButton({ ideaId, title }: ExportPdfButtonProps) {
    const [isExporting, setIsExporting] = useState(false);

    const handlePrint = () => {
        setIsExporting(true);
        setTimeout(() => {
            window.print();
            setIsExporting(false);
        }, 150);
    };

    return (
        <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handlePrint}
            disabled={isExporting}
            className="text-xs h-9 gap-2 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-colors shadow-xs"
        >
            {isExporting ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
                <Printer className="h-3.5 w-3.5 text-primary" />
            )}
            <span>Export Executive Summary PDF</span>
        </Button>
    );
}
