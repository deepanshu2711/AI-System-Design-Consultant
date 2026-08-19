import { useState } from "react"
import "./App.css"
import QueryScreen from "./components/QueryScreen.jsx"
import ClarifyingScreen from "./components/ClarifyingScreen.jsx"
import LoadingScreen from "./components/LoadingScreen.jsx"
import ResultsScreen from "./components/ResultsScreen.jsx"
import { startDesign, resumeDesign } from "./api/designApi.js"

const STAGE = {
  QUERY: "query",
  CLARIFYING: "clarifying",
  LOADING: "loading",
  RESULTS: "results",
}

export default function App() {
  const [stage, setStage] = useState(STAGE.QUERY)
  const [query, setQuery] = useState("")
  const [threadId, setThreadId] = useState(null)
  const [clarify, setClarify] = useState(null) // { message, questions }
  const [designState, setDesignState] = useState(null)
  const [error, setError] = useState(null)

  const [loadingVariant, setLoadingVariant] = useState("clarify")
  const [loadingSettle, setLoadingSettle] = useState(false)
  const [pendingStage, setPendingStage] = useState(STAGE.RESULTS)

  function applyDesignResponse(res) {
    setThreadId(res.thread_id)
    if (res.status === "waiting_for_input") {
      setClarify({ message: res.message, questions: res.questions })
      setPendingStage(STAGE.CLARIFYING)
    } else {
      setDesignState(res.state)
      setPendingStage(STAGE.RESULTS)
    }
    setLoadingSettle(true)
  }

  async function handleQuerySubmit(value) {
    setQuery(value)
    setError(null)
    setLoadingVariant("clarify")
    setLoadingSettle(false)
    setStage(STAGE.LOADING)
    try {
      const res = await startDesign(value)
      applyDesignResponse(res)
    } catch (err) {
      setError(err.message)
      setStage(STAGE.QUERY)
    }
  }

  async function handleClarifySubmit(answers) {
    setError(null)
    setLoadingVariant("pipeline")
    setLoadingSettle(false)
    setStage(STAGE.LOADING)
    try {
      const res = await resumeDesign(threadId, answers)
      applyDesignResponse(res)
    } catch (err) {
      setError(err.message)
      setStage(STAGE.CLARIFYING)
    }
  }

  function handleLoadingComplete() {
    setStage(pendingStage)
  }

  function handleReset() {
    setQuery("")
    setThreadId(null)
    setClarify(null)
    setDesignState(null)
    setError(null)
    setStage(STAGE.QUERY)
  }

  return (
    <div className="app-shell">
      {stage === STAGE.QUERY && <QueryScreen onSubmit={handleQuerySubmit} initialValue={query} error={error} />}
      {stage === STAGE.CLARIFYING && (
        <ClarifyingScreen
          query={query}
          message={clarify?.message}
          questions={clarify?.questions || []}
          onSubmit={handleClarifySubmit}
          error={error}
        />
      )}
      {stage === STAGE.LOADING && (
        <LoadingScreen variant={loadingVariant} settle={loadingSettle} onComplete={handleLoadingComplete} />
      )}
      {stage === STAGE.RESULTS && <ResultsScreen query={query} designState={designState} onReset={handleReset} />}
    </div>
  )
}
