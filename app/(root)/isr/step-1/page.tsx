import StepIndicator from "@/components/shared/StepIndicator";
import Step1FormISR from "@/components/isr/Step1FormISR";


export const revalidate = 3600;

export default async function Step1PageISR() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <StepIndicator active={1} />
      </div>

      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Create A Quote (ISR Page)
        </h1>
        <p className="text-base text-gray-600">
          Choose how you&apos;d like to create your printing quote
        </p>
      </header>

      {/* Komponen Client yang interaktif di-render di sini */}
      <Step1FormISR />
    </main>
  );
}
