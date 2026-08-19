import { useState } from "react"
import "./App.css"
import QueryScreen from "./components/QueryScreen.jsx"
import ClarifyingScreen from "./components/ClarifyingScreen.jsx"
import LoadingScreen from "./components/LoadingScreen.jsx"
import ResultsScreen from "./components/ResultsScreen.jsx"

const STAGE = {
  QUERY: "query",
  CLARIFYING: "clarifying",
  LOADING: "loading",
  RESULTS: "results",
}

export default function App() {
  const [stage, setStage] = useState(STAGE.QUERY)
  const [query, setQuery] = useState("")

  function handleQuerySubmit(value) {
    setQuery(value)
    setStage(STAGE.CLARIFYING)
  }

  function handleClarifySubmit() {
    setStage(STAGE.LOADING)
  }

  function handleLoadingComplete() {
    setStage(STAGE.RESULTS)
  }

  function handleReset() {
    setQuery("")
    setStage(STAGE.QUERY)
  }

  return (
    <div className="app-shell">
      {stage === STAGE.QUERY && <QueryScreen onSubmit={handleQuerySubmit} />}
      {stage === STAGE.CLARIFYING && <ClarifyingScreen query={query} onSubmit={handleClarifySubmit} />}
      {stage === STAGE.LOADING && <LoadingScreen onComplete={handleLoadingComplete} />}
      {stage === STAGE.RESULTS && <ResultsScreen query={query} onReset={handleReset} />}
    </div>
  )
}
