"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Lightbulb, Paperclip } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileUploader } from "@/components/ui/file-uploader";

// ── Schema ────────────────────────────────────────────────
const formSchema = z.object({
    title: z.string().min(8, "Title should be at least 8 characters").max(120),
    description: z.string().min(40, "Please provide more detail").max(2000),
    expected_benefit: z.string().min(20, "Describe the benefit clearly").max(800),
    category: z.string().min(1, "Please select or enter a category"),
});

type FormValues = z.infer<typeof formSchema>;

export default function InnovationForm() {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [files, setFiles] = useState<File[]>([]);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: "",
            description: "",
            expected_benefit: "",
            category: "",
        },
    });

    async function onSubmit(values: FormValues) {
        startTransition(async () => {
            try {
                const formData = new FormData();
                formData.append("title", values.title);
                formData.append("description", values.description);
                formData.append("expected_benefit", values.expected_benefit || "");
                formData.append("category", values.category || "");

                files.forEach((file) => {
                    formData.append("files", file);
                });

                const res = await fetch("/api/innovations", {
                    method: "POST",
                    body: formData,
                });

                const data = await res.json();

                if (res.ok && data.success) {
                    form.reset();
                    setFiles([]);
                    toast.success("Innovation idea and attachments submitted successfully!");
                    router.push("/");
                    router.refresh();
                } else {
                    toast.error(data.error || "Failed to submit idea. Please try again.");
                }
            } catch (err) {
                console.error("Submission error:", err);
                toast.error("An unexpected error occurred during submission.");
            }
        });
    }

    return (
        <Card className="border-t-4 border-t-primary shadow-sm">
            <CardHeader className="pb-6">
                <div className="flex items-center gap-3">
                    <Lightbulb className="h-7 w-7 text-primary shrink-0" />
                    <div>
                        <CardTitle className="text-2xl">Share Your Innovation</CardTitle>
                        <CardDescription className="mt-1.5">
                            Help improve our processes — your idea could make a real difference.
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>

            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                        <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Idea Title</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g. Automated daily backup reminder" {...field} />
                                    </FormControl>
                                    <FormDescription>Keep it short & descriptive (8–120 characters)</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Detailed Description</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Explain the current problem, your proposed solution, and how it would work..."
                                            rows={6}
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        The more context you provide, the easier it is to evaluate.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="expected_benefit"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Expected Benefit / Impact</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Time saved per week? Cost reduction? Safety improvement? Quantify if possible..."
                                            rows={4}
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="category"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Category</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Energy Saving, Safety, Quality, Digitalisation, Maintenance..."
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        Tip: choose from common ones or type your own
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* File Upload Section */}
                        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
                            <div className="flex items-center gap-2">
                                <Paperclip className="h-4 w-4 text-primary" />
                                <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                                    Attachments & Supporting Documents
                                </span>
                            </div>
                            <FileUploader
                                files={files}
                                onFilesChange={setFiles}
                                disabled={isPending}
                            />
                        </div>

                        <div className="pt-4">
                            <Button
                                type="submit"
                                disabled={isPending}
                                size="lg"
                                className="w-full sm:w-auto min-w-45"
                            >
                                {isPending ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Submitting Idea & Files...
                                    </>
                                ) : (
                                    "Submit Idea"
                                )}
                            </Button>
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}