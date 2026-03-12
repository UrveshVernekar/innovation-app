import InnovationForm from "@/components/innovations/innovation-form"

export default function NewInnovationPage() {
    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Submit New Idea</h1>
                <p className="text-muted-foreground text-sm">
                    Share your innovative idea to improve processes or efficiency.
                </p>
            </div>

            <InnovationForm />
        </div>
    )
}