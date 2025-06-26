import Header from "@/components/layout/header"
import OptimizationTool from "@/components/optimize/optimization-tool"

export default function OptimizePage() {
  return (
    <div className="flex flex-col h-full bg-background">
      <Header title="AI Fleet Optimization" />
      <main className="flex-1 p-4 md:p-6">
        <OptimizationTool />
      </main>
    </div>
  )
}
