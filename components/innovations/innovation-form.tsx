"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

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
import { Loader2, Lightbulb } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

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
            const res = await fetch("/api/innovations", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(values),
            });

            if (res.ok) {
                form.reset();
                // Option A: redirect to list
                router.push("/");
                router.refresh();

                // Option B: stay & show success toast (recommended UX)
                // toast.success("Idea submitted successfully!")
            } else {
                // toast.error("Submission failed. Please try again.")
                alert("Failed to submit idea. Please try again.");
            }
        });
    }

    return (
        <Card className="border-t-4 border-t-primary shadow-sm">
            <CardHeader className="pb-6">
                <div className="flex items-center gap-3">
                    <Lightbulb className="h-7 w-7 text-primary" />
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
                                        Submitting...
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