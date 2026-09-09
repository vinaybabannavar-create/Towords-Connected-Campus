import React, { useState, useEffect } from 'react';
import {
  Workflow,
  Sparkles,
  Rocket,
  Download,
  Copy,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  Check,
  Bot,
  Send,
  HelpCircle,
  FileText,
  Cpu,
  Globe,
  Info
} from 'lucide-react';

const ARCH_LOADING_STEPS = [
  { title: 'Analyzing System Requirements...', desc: 'Parsing prompt, identifying actors, and mapping data flow boundaries.' },
  { title: 'Designing Component Nodes & Security Layers...', desc: 'Establishing API gateway, context stores, guardrails, and DB schemas.' },
  { title: 'Balancing Latency Budgets & Data Contracts...', desc: 'Verifying sub-second targets, streaming protocols, and failure modes.' },
  { title: 'Finalizing Engineering Architecture & Blueprint...', desc: 'Structuring node connectors, tech stack, and viva defense points.' }
];

export function ArchitectureWorkspace({
  student,
  callAI,
  parseAIJSON,
  onSaveProject,
  apiFetch
}) {
  // Main states
  const [archPrompt, setArchPrompt] = useState('');
  const [archLoading, setArchLoading] = useState(false);
  const [archError, setArchError] = useState('');
  const [archResult, setArchResult] = useState(null);
  const [loadingStepIdx, setLoadingStepIdx] = useState(0);

  // Iterative chat history
  const [chatHistory, setChatHistory] = useState([]);
  const [refinementInput, setRefinementInput] = useState('');

  // Canvas interaction
  const [zoomLevel, setZoomLevel] = useState(1);
  const [selectedNode, setSelectedNode] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // PRD States
  const [prdLoading, setPrdLoading] = useState(false);
  const [prdMarkdown, setPrdMarkdown] = useState('');
  const [showPrdModal, setShowPrdModal] = useState(false);
  const [prdTab, setPrdTab] = useState('preview'); // 'preview' | 'raw'
  const [copiedPrd, setCopiedPrd] = useState(false);

  // Prompt guide helper state
  const [showPromptGuide, setShowPromptGuide] = useState(false);

  // Step rotation animation during loading
  useEffect(() => {
    let interval;
    if (archLoading) {
      setLoadingStepIdx(0);
      interval = setInterval(() => {
        setLoadingStepIdx((prev) => (prev + 1) % ARCH_LOADING_STEPS.length);
      }, 2200);
    }
    return () => clearInterval(interval);
  }, [archLoading]);

  // Primary Architecture Generator
  const generateArchitecture = async (customPrompt, isRefinement = false) => {
    const promptToUse = (customPrompt || archPrompt).trim();
    if (!promptToUse) {
      setArchError('Please enter your project idea or prompt first.');
      return;
    }

    setArchLoading(true);
    setArchError('');

    try {
      const historyContext = isRefinement && chatHistory.length > 0
        ? `\nPrevious Architecture Iterations & Feedback:\n` +
          chatHistory.map((c) => `${c.role === 'user' ? 'Student' : 'AI'}: ${c.text}`).join('\n')
        : '';

      const systemPrompt = `You are a Principal Systems & Cloud Architect. Construct a production-grade, highly reliable system architecture JSON response based on the student's request.

${historyContext}

Student's Project Description / Refinement Request:
"${promptToUse}"

ENGINEERING RULES — follow strictly:
1. Match storage to data type. Never suggest object storage (S3, blob storage) for numeric data, vectors, or scores — those belong in DB columns or vector databases (Pinecone, ChromaDB). Object storage is strictly for raw files (images, audio, PDFs).
2. Ensure internal consistency across all components, latency budgets, and security parameters.
3. Group nodes into logical architectural subsystems:
   - "Security Perimeter & Ingestion" (API Gateway, Input Validators, Quarantine Stores)
   - "Reliable Retrieval & Caching" (Sub-10ms Context Caches, Vector Search, Provenance Tagging)
   - "Core Reasoning & Business Logic" (LLM/Model Nodes, Fallbacks, Orchestration)
   - "Trust Control Plane & Guardrails" (Real-time Guardrails, Halt Signals, Trust Score Engine)
   - "Persistence & Audit Data Tier" (SQL/NoSQL DB, Message Queues, Quarantine)

Construct an end-to-end architecture diagram & specification. Return ONLY raw valid JSON (no markdown, no code blocks):
{
  "projectName": "Title derived from prompt",
  "summary": "High-level 2-sentence architecture overview highlighting key reliability & security guarantees.",
  "promptQualityScore": 92,
  "promptFeedback": "Brief feedback for student on how well their prompt specified requirements and how to improve it.",
  "suggestedRefinements": [
    "Suggested follow-up refinement 1",
    "Suggested follow-up refinement 2",
    "Suggested follow-up refinement 3"
  ],
  "subsystems": [
    {
      "id": "subsystem_1",
      "title": "Security Perimeter & Ingestion",
      "badge": "Sub-50ms Guard",
      "color": "blue",
      "nodes": [
        {
          "id": "node_1",
          "title": "FastAPI Gateway & Ingest Validator",
          "tech": "FastAPI / Rebuff",
          "latency": "<50ms",
          "protocol": "HTTPS / REST",
          "purpose": "Screen incoming documents & requests for prompt injection & context poisoning.",
          "status": "Active"
        }
      ]
    },
    {
      "id": "subsystem_2",
      "title": "Reliable Retrieval & Caching",
      "badge": "Sub-10ms Cache",
      "color": "amber",
      "nodes": [
        {
          "id": "node_2",
          "title": "Moss High-Speed Context Store",
          "tech": "Moss Caching / ChromaDB",
          "latency": "<10ms",
          "protocol": "gRPC / In-Memory",
          "purpose": "Sub-10ms context retrieval with provenance signatures (Source, Latency, Confidence).",
          "status": "Primary"
        }
      ]
    },
    {
      "id": "subsystem_3",
      "title": "Core Reasoning & Business Logic",
      "badge": "Corrective Loop",
      "color": "purple",
      "nodes": [
        {
          "id": "node_3",
          "title": "LangGraph Reasoning Orchestrator",
          "tech": "LangGraph / DeepSeek-R1",
          "latency": "<300ms",
          "protocol": "Internal Agent State",
          "purpose": "Executes document grading & corrective web search fallback (Tavily API) if confidence < 0.5.",
          "status": "Stateful"
        }
      ]
    },
    {
      "id": "subsystem_4",
      "title": "Trust Control Plane",
      "badge": "Sub-50ms Intercept",
      "color": "emerald",
      "nodes": [
        {
          "id": "node_4",
          "title": "Moss Real-time Guardrails & Halt Signal",
          "tech": "Moss Tracing Engine",
          "latency": "<50ms",
          "protocol": "WebSocket / Halt Signal",
          "purpose": "Monitors chunk generation; emits sub-50ms Halt Signal on policy violation.",
          "status": "Guardrail"
        }
      ]
    }
  ],
  "flowSteps": [
    { "step": 1, "title": "Client Ingestion & Policy Screening", "actor": "Client UI / API", "target": "FastAPI Ingest Validator", "desc": "Validates payload, checks prompt injection signatures, and logs request context.", "type": "client" },
    { "step": 2, "title": "Sub-10ms Provenance Context Retrieval", "actor": "Ingest Validator", "target": "Moss Context Store", "desc": "Fetches grounded context with metadata signatures (Source, Latency, Confidence).", "type": "api" },
    { "step": 3, "title": "Stateful Reasoning & Corrective Loop", "actor": "Reasoning Engine", "target": "DeepSeek-R1 / Tavily", "desc": "Grades document relevance; triggers web search fallback if internal context fails.", "type": "service" },
    { "step": 4, "title": "Real-time Guardrail Interception & Halt Engine", "actor": "Moss Guardrails", "target": "Output Stream", "desc": "Monitors generation stream; issues emergency halt if policy or exfiltration risk is detected.", "type": "response" }
  ],
  "layers": [
    { "name": "Client & Gateway Layer", "subtitle": "Web Interfaces & Authentication", "color": "blue", "components": ["React Web Portal", "FastAPI Security Gateway", "OAuth2 / JWT Auth"] },
    { "name": "AI & Reasoning Layer", "subtitle": "Models & Workflow Orchestration", "color": "purple", "components": ["LangGraph State Machine", "DeepSeek-R1 Grading", "Tavily Search Fallback"] },
    { "name": "Control Plane & Guardrails", "subtitle": "Real-time Auditing & Halt Control", "color": "emerald", "components": ["Moss Guardrail Engine", "Trust Score Calculator", "Continuous Eval Loop"] },
    { "name": "Persistence & Storage Layer", "subtitle": "Database & Vector Stores", "color": "amber", "components": ["TiDB Relational DB", "ChromaDB / Pinecone", "Quarantine Store (S3/PostgreSQL)"] }
  ],
  "recommendedStack": [
    { "layer": "Frontend UI", "tech": "React 19 + Tailwind CSS + WebSockets", "reason": "Real-time trust score streaming & interactive architecture workspace" },
    { "layer": "API Backend", "tech": "FastAPI (Python) / Node.js Express", "reason": "High-throughput asynchronous API gateway & stream interceptor" },
    { "layer": "Orchestration", "tech": "LangGraph + DeepSeek-R1", "reason": "Stateful corrective loops with claim-by-claim groundedness grading" },
    { "layer": "Database & Cache", "tech": "TiDB Cloud + Moss / ChromaDB", "reason": "Scalable SQL entity persistence + sub-10ms vector/context caching" }
  ],
  "endpoints": [
    { "method": "POST", "path": "/v1/ingest", "purpose": "Validates, screens, and stores incoming documents" },
    { "method": "POST", "path": "/v1/query", "purpose": "Initiates stateful reasoning & corrective loop" },
    { "method": "GET", "path": "/v1/trust-stream", "purpose": "WebSocket endpoint for real-time trust score & token streaming" },
    { "method": "POST", "path": "/v1/escalate/resolve", "purpose": "Human-in-the-loop verification endpoint" }
  ],
  "vivaTalkingPoints": [
    "Demonstrate how prompt-injection & context-poisoning attacks are neutralized before entering the database.",
    "Explain the sub-10ms provenance retrieval mechanism and why confidence signatures matter.",
    "Detail how the Moss Trust Control Plane issues sub-50ms mid-flight Halt Signals to protect sensitive data."
  ]
}`;

      const aiResponse = await callAI(systemPrompt, { maxOutputTokens: 2500, temperature: 0.25 });
      const parsed = parseAIJSON(aiResponse);

      setArchResult(parsed);

      // Record chat history for iterative prompting
      setChatHistory((prev) => [
        ...prev,
        { role: 'user', text: promptToUse, timestamp: new Date().toLocaleTimeString() },
        {
          role: 'assistant',
          text: `Architected system for "${parsed.projectName || 'Project'}". Generated ${parsed.subsystems?.length || 4} subsystems and ${parsed.flowSteps?.length || 4} operational flow steps.`,
          timestamp: new Date().toLocaleTimeString(),
          resultSummary: parsed.summary
        }
      ]);

      if (isRefinement) {
        setRefinementInput('');
      }
    } catch (err) {
      setArchError('Failed to generate architecture: ' + err.message);
    } finally {
      setArchLoading(false);
    }
  };

  // Submit Iterative Refinement Prompt
  const handleRefineSubmit = (e) => {
    e.preventDefault();
    if (!refinementInput.trim()) return;
    generateArchitecture(refinementInput.trim(), true);
  };

  // PRD Generator Engine
  const generatePRD = async () => {
    if (!archResult) return;
    setPrdLoading(true);
    setShowPrdModal(true);

    try {
      const prdPrompt = `You are a Lead Enterprise Technical Writer and Chief Architect. Generate a complete, highly detailed, production-grade Product Requirements Document (PRD) written in clean GitHub-Flavored Markdown based on the architecture specification below.

Reference PRD Structure (FOLLOW EXACTLY WITH HIGH DETAIL):
# Product Requirements Document (PRD): ${archResult.projectName || 'System Architecture'}

## 1. Executive Summary
Provide a comprehensive 2-paragraph overview of the system, its core value proposition, enterprise reliability guarantees, and security features.

## 2. Problem Statement
Explain 3 critical enterprise gaps this system solves (e.g. Unreliability & Hallucinations, Security & Prompt Injection Risks, Lack of Real-Time Trust Observability).

## 3. Goals & Objectives
Bulletized list of quantitative performance targets (e.g. Sub-10ms context retrieval, Zero silent failures, <1s round-trip latency, sub-50ms guardrail halting).

## 4. Target Users / Stakeholders
Detailed descriptions for Enterprise AI Architects, Security Officers, and Product Managers.

## 5. Functional Requirements
Broken down into technical subsystems based on the architecture:
### 5.1 Security Perimeter & Ingestion
### 5.2 Reliable Retrieval Stack
### 5.3 Corrective Reasoning Stack
### 5.4 Trust Control Plane & Guardrails

## 6. Non-Functional Requirements
Include exact Latency Budgets table, Scalability targets (WebSockets, Concurrency), and Reliability loop constraints.

## 7. System Architecture Overview
Detailed narrative explaining data flow across Presentation, API Gateway, Reasoning, Control Plane, and Persistence layers.

## 8. Tech Stack
Formatted markdown table detailing Layer, Component, Technology Choice, and Engineering Rationale.

## 9. Data Requirements
Data contracts (JSON schemas with fields like content, source_url, retrieval_latency_ms, confidence_score) and Quarantine/Audit logging rules.

## 10. API Specifications
Formatted Markdown API endpoint reference table containing HTTP Method, Endpoint Path, Purpose, and Request/Response payload signatures.

## 11. Security Requirements
Prompt injection protection, real-time token stream interception, and provenance enforcement rules.

## 12. Deployment & Infrastructure
Containerization (Docker/K8s), Co-located low-latency nodes, and CI/CD automated golden dataset eval pipeline.

## 13. Success Metrics
Quantitative metrics table (Hallucination rate <1%, Retrieval latency 99th percentile <15ms, Halt accuracy 100%).

## 14. Timeline & Milestones
Phase 1 (MVP), Phase 2 (Security Perimeter), Phase 3 (Reliability & Caching), Phase 4 (Control Plane & Trust Score Engine).

## 15. Open Questions & Risks
Technical risks, human-in-the-loop latency trade-offs, policy drift, and cost management.

Architecture Data to use for PRD generation:
Project Name: ${archResult.projectName}
Summary: ${archResult.summary}
Recommended Stack: ${JSON.stringify(archResult.recommendedStack)}
Endpoints: ${JSON.stringify(archResult.endpoints)}
Subsystems: ${JSON.stringify(archResult.subsystems)}
Flow Steps: ${JSON.stringify(archResult.flowSteps)}

Generate the ENTIRE Markdown document in clear, professional markdown text. Do NOT summarize or omit sections!`;

      const markdownText = await callAI(prdPrompt, { maxOutputTokens: 3500, temperature: 0.2 });
      setPrdMarkdown(markdownText);
    } catch (err) {
      setPrdMarkdown(`> ❌ **Error generating PRD Document:** ${err.message}\n\nPlease verify your AI connection or click "Re-generate PRD".`);
    } finally {
      setPrdLoading(false);
    }
  };

  // Download PRD as .md file
  const handleDownloadPrd = () => {
    if (!prdMarkdown) return;
    const blob = new Blob([prdMarkdown], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const filename = `PRD_${(archResult?.projectName || 'Architecture').replace(/[^a-zA-Z0-9]/g, '_')}.md`;
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Copy PRD Markdown
  const handleCopyPrd = () => {
    if (!prdMarkdown) return;
    navigator.clipboard.writeText(prdMarkdown);
    setCopiedPrd(true);
    setTimeout(() => setCopiedPrd(false), 2500);
  };

  // Save architecture project to workspace
  const handleSaveToProjects = () => {
    if (!archResult) return;
    onSaveProject({
      projectName: archResult.projectName,
      summary: archResult.summary,
      archPrompt,
      recommendedStack: archResult.recommendedStack,
      flowSteps: archResult.flowSteps,
      layers: archResult.layers,
      endpoints: archResult.endpoints,
      vivaTalkingPoints: archResult.vivaTalkingPoints,
      prdMarkdown: prdMarkdown || null
    });
  };

  return (
    <div className="space-y-6">
      {/* Workspace Top Header & Mode Bar */}
      <div className="rounded-xl border border-stone-200 bg-white p-4 sm:p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3.5">
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-stone-950 to-emerald-950 text-white shrink-0 shadow-md">
              <Workflow className="h-6 w-6 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-black text-stone-900">AI Architecture & PRD Creator</h3>
                <span className="rounded-full bg-emerald-100 border border-emerald-300 px-2.5 py-0.5 text-[11px] font-black text-emerald-900">
                  Interactive Node Canvas + PRD Generator
                </span>
              </div>
              <p className="mt-0.5 text-xs text-stone-600">
                Type your system prompt, refine components iteratively, inspect live architecture nodes, and export a complete 15-section PRD.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowPromptGuide(!showPromptGuide)}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-amber-300 bg-amber-50 px-3.5 py-2 text-xs font-bold text-amber-900 hover:bg-amber-100 transition shrink-0"
          >
            <HelpCircle className="h-4 w-4 text-amber-700" />
            {showPromptGuide ? 'Hide Prompt Guide' : 'Prompt Engineering Guide'}
          </button>
        </div>

        {/* Prompt Engineering Guide Panel */}
        {showPromptGuide && (
          <div className="mt-4 rounded-xl border border-amber-200 bg-gradient-to-r from-amber-50/90 via-orange-50/70 to-amber-50/90 p-4 text-amber-950 text-xs leading-6 shadow-inner">
            <div className="mb-2 flex items-center gap-2 font-black text-amber-900 text-sm">
              <Sparkles className="h-4 w-4 text-amber-700" />
              How to Write Production-Grade Architecture Prompts
            </div>
            <p className="mb-3">
              To get the most accurate architecture diagram and detailed PRD, structure your project prompt using these 4 core pillars:
            </p>
            <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-lg border border-amber-200 bg-white/80 p-3">
                <span className="font-black text-amber-900 block mb-1">1. User & Goal</span>
                Describe who uses the app, what action they take, and what output they receive.
              </div>
              <div className="rounded-lg border border-amber-200 bg-white/80 p-3">
                <span className="font-black text-amber-900 block mb-1">2. Latency & Scale</span>
                Specify real-time constraints (e.g. sub-10ms retrieval, WebSocket streaming, concurrency).
              </div>
              <div className="rounded-lg border border-amber-200 bg-white/80 p-3">
                <span className="font-black text-amber-900 block mb-1">3. Security Boundary</span>
                State if prompt injection screening, quarantine stores, or authorization tokens are required.
              </div>
              <div className="rounded-lg border border-amber-200 bg-white/80 p-3">
                <span className="font-black text-amber-900 block mb-1">4. Fallback Logic</span>
                Define what happens when internal context scores drop or an API call fails.
              </div>
            </div>
          </div>
        )}

        {/* Initial Prompt Form */}
        <div className="mt-5 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <label className="text-xs font-bold text-stone-700">Project Prompt / System Requirements</label>
            <span className="text-[11px] font-semibold text-stone-500">Try sample prompts below to test instantly:</span>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => {
                const text = "Neural Nexus: Enterprise-grade AI agent reliability stack with sub-10ms Moss context caching, prompt injection validator, Tavily web search fallback, DeepSeek-R1 document grading, sub-50ms halt guardrails, and real-time trust score streaming.";
                setArchPrompt(text);
                generateArchitecture(text);
              }}
              className="rounded-full border border-purple-200 bg-purple-50 px-3 py-1 text-xs font-bold text-purple-900 transition hover:bg-purple-100"
            >
              🧠 Neural Nexus Agent Reliability (PRD Reference)
            </button>

            <button
              type="button"
              onClick={() => {
                const text = "Smart College Gate Pass & Attendance Portal with OpenCV Facial Recognition, HOD Digital Approvals, QR Code Gate Security Scanner, and TiDB Cloud Sync.";
                setArchPrompt(text);
                generateArchitecture(text);
              }}
              className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-900 transition hover:bg-emerald-100"
            >
              🚪 Smart Gate Pass & Face Recognition
            </button>

            <button
              type="button"
              onClick={() => {
                const text = "AI Telemedicine Healthcare Platform with Doctor Video Call Scheduling, Automated E-Prescription Engine, Patient Medical History Encryption, and Drug Interaction Checker.";
                setArchPrompt(text);
                generateArchitecture(text);
              }}
              className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-bold text-blue-900 transition hover:bg-blue-100"
            >
              🏥 AI Telemedicine & E-Prescription Portal
            </button>

            <button
              type="button"
              onClick={() => {
                const text = "Campus Placement Drive Ledger with Automated PDF Resume Parser, AI Skill Match Rating, Placement Officer Analytics, and Interview Room Scheduler.";
                setArchPrompt(text);
                generateArchitecture(text);
              }}
              className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-bold text-amber-900 transition hover:bg-amber-100"
            >
              💼 Campus Placement Ledger & AI Resume Parser
            </button>
          </div>

          <textarea
            className="input min-h-24 sm:min-h-28 text-sm"
            value={archPrompt}
            onChange={(e) => setArchPrompt(e.target.value)}
            placeholder="Describe your project idea in detail (e.g. An AI-driven autonomous agent system with security guardrails, sub-10ms vector caching, real-time WebSocket metrics, and database persistence...)"
          />

          {archError && (
            <p className="rounded-lg bg-rose-50 border border-rose-200 px-3.5 py-2.5 text-xs font-bold text-rose-800">
              {archError}
            </p>
          )}

          <button
            disabled={archLoading}
            onClick={() => generateArchitecture()}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-stone-950 px-4 py-3 text-sm font-black text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70 transition shadow-md"
          >
            <Workflow className="h-4 w-4 text-emerald-400" />
            {archLoading ? ARCH_LOADING_STEPS[loadingStepIdx].title : 'Generate Interactive Architecture Diagram & Blueprint'}
          </button>
        </div>
      </div>

      {/* Loading View */}
      {archLoading && (
        <div className="grid min-h-[380px] place-items-center rounded-xl border border-stone-800 bg-stone-950 p-8 text-center text-white shadow-xl">
          <div className="max-w-md space-y-4">
            <div className="mx-auto h-14 w-14 animate-spin rounded-full border-4 border-stone-800 border-t-emerald-400" />
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 text-xs font-bold text-emerald-300">
              <Sparkles className="h-4 w-4 text-emerald-400" />
              AI Architect Deep Reasoning Engine
            </div>
            <h4 className="text-xl font-black text-white transition-all duration-300">
              {ARCH_LOADING_STEPS[loadingStepIdx].title}
            </h4>
            <p className="text-sm leading-6 text-stone-400 transition-all duration-300">
              {ARCH_LOADING_STEPS[loadingStepIdx].desc}
            </p>
          </div>
        </div>
      )}

      {/* Main Architecture & Refinement Workspace */}
      {archResult && !archLoading && (
        <div className="grid gap-6 lg:grid-cols-[1fr_360px] xl:grid-cols-[1fr_420px]">
          {/* LEFT: Interactive High-Tech Canvas & Specifications */}
          <div className="space-y-6 min-w-0">
            {/* Top Project Banner */}
            <div className="rounded-xl border border-white/10 bg-gradient-to-r from-stone-950 via-stone-900 to-emerald-950 p-6 text-white shadow-xl">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <div className="mb-2.5 flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/30 bg-emerald-500/15 px-3 py-0.5 text-xs font-bold text-emerald-300">
                      <Workflow className="h-3.5 w-3.5 text-emerald-400" />
                      Production Architecture Blueprint
                    </span>
                    {archResult.promptQualityScore && (
                      <span className="rounded-full border border-amber-400/30 bg-amber-500/15 px-3 py-0.5 text-xs font-bold text-amber-300">
                        Prompt Score: {archResult.promptQualityScore}/100
                      </span>
                    )}
                  </div>
                  <h3 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
                    {archResult.projectName}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-stone-300 max-w-2xl">
                    {archResult.summary}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <button
                    onClick={generatePRD}
                    className="flex items-center justify-center gap-2 rounded-lg bg-emerald-500 px-4 py-2.5 font-black text-stone-950 shadow-md transition hover:bg-emerald-400 hover:scale-[1.02]"
                  >
                    <FileText className="h-4 w-4" /> Export PRD (.md)
                  </button>

                  <button
                    onClick={handleSaveToProjects}
                    className="flex items-center justify-center gap-2 rounded-lg border border-stone-700 bg-stone-900 px-4 py-2.5 font-bold text-white transition hover:bg-stone-800"
                  >
                    <Rocket className="h-4 w-4 text-emerald-400" /> Save Project
                  </button>
                </div>
              </div>
            </div>

            {/* HIGH-TECH NODE CANVAS (Dark Theme matching reference image) */}
            <div className={`rounded-xl border border-stone-800 bg-stone-950 p-5 shadow-2xl text-white relative overflow-hidden ${isFullscreen ? 'fixed inset-0 z-50 rounded-none p-8' : ''}`}>
              {/* Canvas Controls Header */}
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-stone-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className="grid h-9 w-9 place-items-center rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    <Workflow className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-base font-black text-white">System Architecture Node Canvas</h4>
                    <p className="text-xs text-stone-400">Interactive subsystem groups, component nodes & data contracts</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center rounded-lg border border-stone-800 bg-stone-900 p-1">
                    <button
                      onClick={() => setZoomLevel((z) => Math.max(0.75, z - 0.15))}
                      className="p-1.5 text-stone-400 hover:text-white rounded hover:bg-stone-800"
                      title="Zoom Out"
                    >
                      <ZoomOut className="h-4 w-4" />
                    </button>
                    <span className="px-2 text-xs font-mono font-bold text-stone-300">{Math.round(zoomLevel * 100)}%</span>
                    <button
                      onClick={() => setZoomLevel((z) => Math.min(1.4, z + 0.15))}
                      className="p-1.5 text-stone-400 hover:text-white rounded hover:bg-stone-800"
                      title="Zoom In"
                    >
                      <ZoomIn className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setZoomLevel(1)}
                      className="ml-1 px-2 py-1 text-[11px] font-bold text-stone-400 hover:text-white rounded hover:bg-stone-800"
                    >
                      Reset
                    </button>
                  </div>

                  <button
                    onClick={() => setIsFullscreen(!isFullscreen)}
                    className="p-2 text-stone-400 hover:text-white rounded-lg border border-stone-800 bg-stone-900 hover:bg-stone-800"
                    title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Canvas'}
                  >
                    {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Subsystems & Nodes Layout */}
              <div
                className="space-y-6 transition-transform duration-200 origin-top-left"
                style={{ transform: `scale(${zoomLevel})` }}
              >
                {(archResult.subsystems || []).map((subsystem, subIdx) => {
                  const getSubsystemStyle = (color) => {
                    switch (color) {
                      case 'blue':
                        return { border: 'border-blue-500/40', bg: 'bg-blue-950/20', badge: 'bg-blue-500/20 text-blue-300 border-blue-500/30' };
                      case 'amber':
                        return { border: 'border-amber-500/40', bg: 'bg-amber-950/20', badge: 'bg-amber-500/20 text-amber-300 border-amber-500/30' };
                      case 'purple':
                        return { border: 'border-purple-500/40', bg: 'bg-purple-950/20', badge: 'bg-purple-500/20 text-purple-300 border-purple-500/30' };
                      case 'emerald':
                        return { border: 'border-emerald-500/40', bg: 'bg-emerald-950/20', badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' };
                      default:
                        return { border: 'border-stone-700', bg: 'bg-stone-900/40', badge: 'bg-stone-800 text-stone-300 border-stone-700' };
                    }
                  };
                  const style = getSubsystemStyle(subsystem.color);

                  return (
                    <div key={subsystem.id || subIdx} className={`rounded-xl border ${style.border} ${style.bg} p-4 sm:p-5 backdrop-blur-md`}>
                      <div className="mb-3.5 flex items-center justify-between border-b border-stone-800/80 pb-3">
                        <div className="flex items-center gap-2.5">
                          <span className="grid h-6 w-6 place-items-center rounded-md bg-stone-900 text-xs font-black text-emerald-400 border border-stone-700">
                            {subIdx + 1}
                          </span>
                          <h5 className="text-base font-black text-white">{subsystem.title}</h5>
                        </div>
                        {subsystem.badge && (
                          <span className={`rounded-full border px-3 py-0.5 text-xs font-bold ${style.badge}`}>
                            {subsystem.badge}
                          </span>
                        )}
                      </div>

                      {/* Nodes Grid */}
                      <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
                        {(subsystem.nodes || []).map((node, nodeIdx) => (
                          <div
                            key={node.id || nodeIdx}
                            onClick={() => setSelectedNode(node)}
                            className="group relative cursor-pointer rounded-xl border border-stone-800 bg-stone-900/90 p-4 transition-all duration-200 hover:border-emerald-500/60 hover:bg-stone-900 hover:shadow-lg"
                          >
                            <div className="mb-2 flex items-center justify-between">
                              <span className="rounded bg-stone-950 border border-stone-800 px-2 py-0.5 text-[10px] font-mono font-bold text-stone-400">
                                {node.tech || 'Component'}
                              </span>
                              {node.latency && (
                                <span className="text-[11px] font-mono font-black text-emerald-400">
                                  {node.latency}
                                </span>
                              )}
                            </div>

                            <h6 className="font-black text-white text-sm group-hover:text-emerald-300 transition-colors">
                              {node.title}
                            </h6>
                            <p className="mt-1 text-xs text-stone-400 leading-5 line-clamp-2">
                              {node.purpose}
                            </p>

                            <div className="mt-3 flex items-center justify-between border-t border-stone-800/60 pt-2 text-[10px] text-stone-400">
                              <span>Protocol: <strong className="text-stone-300">{node.protocol || 'HTTP'}</strong></span>
                              <span className="text-emerald-400 font-bold">Inspect Details →</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Data Flow Sequence Cards */}
              <div className="mt-8 border-t border-stone-800 pt-6">
                <h5 className="mb-4 text-sm font-black text-stone-300 uppercase tracking-wider">
                  Sequential Workflow & Data Protocol Pipeline
                </h5>
                <div className="grid gap-3 sm:grid-cols-2">
                  {(archResult.flowSteps || []).map((step, idx) => (
                    <div key={idx} className="flex gap-3 rounded-lg border border-stone-800 bg-stone-900/60 p-3.5">
                      <div className="grid h-8 w-8 place-items-center rounded-lg bg-emerald-500/20 text-emerald-400 font-black text-xs shrink-0 border border-emerald-500/30">
                        {step.step || idx + 1}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h6 className="text-xs font-black text-white">{step.title}</h6>
                        </div>
                        <p className="text-[11px] text-stone-400 leading-4">{step.desc}</p>
                        <div className="mt-1.5 inline-block rounded bg-stone-950 border border-stone-800 px-2 py-0.5 text-[10px] font-mono text-emerald-400">
                          {step.actor} → {step.target}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Recommended Tech Stack & Endpoints Specs */}
            <div className="grid gap-4 sm:grid-cols-2">
              {/* Tech Stack */}
              <div className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm">
                <h4 className="mb-3 text-sm font-black text-stone-950 flex items-center gap-2">
                  <Cpu className="h-4 w-4 text-emerald-600" /> Recommended Technology Stack
                </h4>
                <div className="space-y-2.5">
                  {(archResult.recommendedStack || []).map((item, idx) => (
                    <div key={idx} className="rounded-lg border border-stone-100 bg-stone-50 p-2.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-stone-600">{item.layer}</span>
                        <span className="font-black text-stone-900">{item.tech}</span>
                      </div>
                      <p className="mt-1 text-[11px] text-stone-500">{item.reason}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Endpoints */}
              <div className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm">
                <h4 className="mb-3 text-sm font-black text-stone-950 flex items-center gap-2">
                  <Globe className="h-4 w-4 text-blue-600" /> Core REST / Async Endpoints
                </h4>
                <div className="space-y-2.5">
                  {(archResult.endpoints || []).map((ep, idx) => (
                    <div key={idx} className="rounded-lg border border-stone-100 bg-stone-50 p-2.5">
                      <div className="flex items-center gap-2">
                        <span className={`rounded px-1.5 py-0.5 text-[10px] font-black ${
                          ep.method === 'POST' ? 'bg-emerald-100 text-emerald-900' :
                          ep.method === 'GET' ? 'bg-blue-100 text-blue-900' : 'bg-purple-100 text-purple-900'
                        }`}>
                          {ep.method}
                        </span>
                        <span className="font-mono text-xs font-bold text-stone-900">{ep.path}</span>
                      </div>
                      <p className="mt-1 text-[11px] text-stone-600">{ep.purpose}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: Iterative Prompt Refinement Assistant (Matching reference screenshot) */}
          <div className="flex flex-col rounded-xl border border-stone-800 bg-stone-950 p-4 text-white shadow-xl min-h-[600px] h-full">
            <div className="mb-4 flex items-center justify-between border-b border-stone-800 pb-3">
              <div className="flex items-center gap-2.5">
                <Bot className="h-5 w-5 text-emerald-400" />
                <div>
                  <h4 className="text-sm font-black text-white">Architecture Refinement Chat</h4>
                  <p className="text-[11px] text-stone-400">Iteratively prompt to refine nodes & diagram</p>
                </div>
              </div>
              <span className="rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 text-[10px] font-bold text-emerald-300">
                {chatHistory.length} Iterations
              </span>
            </div>

            {/* Quick Refinement Chips */}
            <div className="mb-3">
              <p className="text-[11px] font-bold text-stone-400 mb-1.5 uppercase tracking-wider">Quick Architecture Enhancements:</p>
              <div className="flex flex-wrap gap-1.5">
                <button
                  onClick={() => generateArchitecture("Add sub-10ms Moss Context Caching layer with provenance metadata tagging", true)}
                  className="rounded-full border border-stone-800 bg-stone-900 px-2.5 py-1 text-[11px] font-bold text-stone-300 hover:border-emerald-500 hover:text-emerald-300 transition"
                >
                  ⚡ Add Sub-10ms Context Cache
                </button>

                <button
                  onClick={() => generateArchitecture("Add FastAPI Gateway with prompt injection screening and quarantine store", true)}
                  className="rounded-full border border-stone-800 bg-stone-900 px-2.5 py-1 text-[11px] font-bold text-stone-300 hover:border-blue-500 hover:text-blue-300 transition"
                >
                  🛡️ Add Ingest Guardrails
                </button>

                <button
                  onClick={() => generateArchitecture("Add DeepSeek-R1 document grading with Tavily web search fallback", true)}
                  className="rounded-full border border-stone-800 bg-stone-900 px-2.5 py-1 text-[11px] font-bold text-stone-300 hover:border-purple-500 hover:text-purple-300 transition"
                >
                  🧠 Add Corrective Reasoning
                </button>

                <button
                  onClick={() => generateArchitecture("Add real-time Moss Guardrails with sub-50ms mid-flight Halt Signals", true)}
                  className="rounded-full border border-stone-800 bg-stone-900 px-2.5 py-1 text-[11px] font-bold text-stone-300 hover:border-emerald-500 hover:text-emerald-300 transition"
                >
                  🚨 Add Halt Control Plane
                </button>
              </div>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1 my-2 max-h-[420px]">
              {chatHistory.map((item, idx) => (
                <div
                  key={idx}
                  className={`rounded-xl p-3 text-xs leading-5 ${
                    item.role === 'user'
                      ? 'bg-stone-900 border border-stone-800 text-stone-200 ml-4'
                      : 'bg-emerald-950/40 border border-emerald-500/30 text-emerald-100 mr-4'
                  }`}
                >
                  <div className="flex items-center justify-between font-bold mb-1 text-[10px] text-stone-400">
                    <span>{item.role === 'user' ? '👤 Student Prompt' : '🤖 AI Architect'}</span>
                    <span>{item.timestamp}</span>
                  </div>
                  <p>{item.text}</p>
                  {item.resultSummary && (
                    <div className="mt-2 rounded bg-stone-950/60 p-2 text-[11px] font-mono text-emerald-300 border border-emerald-500/20">
                      ✨ Updated diagram: {item.resultSummary}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Prompt Feedback Box */}
            {archResult.promptFeedback && (
              <div className="mb-3 rounded-lg border border-amber-500/30 bg-amber-950/30 p-2.5 text-xs text-amber-200">
                <span className="font-bold block mb-0.5 text-amber-300">💡 Prompt Engineering Tip:</span>
                {archResult.promptFeedback}
              </div>
            )}

            {/* Input Form */}
            <form onSubmit={handleRefineSubmit} className="mt-auto space-y-2 pt-2 border-t border-stone-800">
              <div className="relative">
                <input
                  type="text"
                  value={refinementInput}
                  onChange={(e) => setRefinementInput(e.target.value)}
                  placeholder="Ask AI to refine nodes, add guardrails, or change stack..."
                  className="w-full rounded-lg border border-stone-800 bg-stone-900 px-3.5 py-2.5 pr-10 text-xs text-white placeholder-stone-500 focus:border-emerald-500 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={!refinementInput.trim() || archLoading}
                  className="absolute right-1.5 top-1.5 grid h-7 w-7 place-items-center rounded-md bg-emerald-500 text-stone-950 disabled:opacity-40 hover:bg-emerald-400 transition"
                >
                  <Send className="h-3.5 w-3.5" />
                </button>
              </div>
              <p className="text-[10px] text-stone-500 text-center">
                Refining prompts automatically updates your interactive diagram & PRD.
              </p>
            </form>

            {/* Generate PRD Button in Chat Panel */}
            <div className="mt-3">
              <button
                onClick={generatePRD}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-2.5 text-xs font-black text-white hover:from-emerald-500 hover:to-teal-500 transition shadow-md"
              >
                <FileText className="h-4 w-4" /> Generate Full PRD File (.md)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* NODE INSPECTOR MODAL */}
      {selectedNode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl border border-stone-800 bg-stone-950 p-6 text-white shadow-2xl">
            <div className="mb-4 flex items-center justify-between border-b border-stone-800 pb-3">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400">
                  {selectedNode.tech || 'Component Inspector'}
                </span>
                <h4 className="text-xl font-black text-white">{selectedNode.title}</h4>
              </div>
              <button
                onClick={() => setSelectedNode(null)}
                className="rounded-lg border border-stone-800 bg-stone-900 px-3 py-1 text-xs font-bold hover:bg-stone-800"
              >
                Close ✕
              </button>
            </div>

            <div className="space-y-3 text-xs leading-6">
              <div className="rounded-lg border border-stone-800 bg-stone-900 p-3">
                <span className="font-bold text-stone-400 block mb-1">Purpose & Business Logic:</span>
                <p className="text-stone-200">{selectedNode.purpose}</p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-stone-300">
                <div className="rounded-lg border border-stone-800 bg-stone-900 p-2.5">
                  <span className="text-[10px] font-bold text-stone-400 block">Latency Budget:</span>
                  <span className="font-mono font-black text-emerald-400 text-sm">{selectedNode.latency || '<50ms'}</span>
                </div>
                <div className="rounded-lg border border-stone-800 bg-stone-900 p-2.5">
                  <span className="text-[10px] font-bold text-stone-400 block">Protocol & Interface:</span>
                  <span className="font-mono font-black text-blue-400 text-sm">{selectedNode.protocol || 'HTTP/gRPC'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FULL PRD DOCUMENT MODAL */}
      {showPrdModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/85 backdrop-blur-md p-4">
          <div className="flex h-[90vh] w-full max-w-5xl flex-col rounded-2xl border border-stone-800 bg-stone-950 text-white shadow-2xl overflow-hidden">
            {/* PRD Modal Header */}
            <div className="flex items-center justify-between border-b border-stone-800 bg-stone-900 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="grid h-9 w-9 place-items-center rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-lg font-black text-white">
                    PRD Document: {archResult?.projectName || 'System Architecture'}
                  </h4>
                  <p className="text-xs text-stone-400">Full 15-Section Enterprise Product Requirements Document</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex rounded-lg border border-stone-800 bg-stone-950 p-1">
                  <button
                    onClick={() => setPrdTab('preview')}
                    className={`px-3 py-1 text-xs font-bold rounded ${prdTab === 'preview' ? 'bg-emerald-500 text-stone-950' : 'text-stone-400 hover:text-white'}`}
                  >
                    Formatted View
                  </button>
                  <button
                    onClick={() => setPrdTab('raw')}
                    className={`px-3 py-1 text-xs font-bold rounded ${prdTab === 'raw' ? 'bg-emerald-500 text-stone-950' : 'text-stone-400 hover:text-white'}`}
                  >
                    Raw Markdown (.md)
                  </button>
                </div>

                <button
                  onClick={handleCopyPrd}
                  className="flex items-center gap-1.5 rounded-lg border border-stone-700 bg-stone-800 px-3 py-1.5 text-xs font-bold text-stone-200 hover:bg-stone-700"
                >
                  {copiedPrd ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                  {copiedPrd ? 'Copied!' : 'Copy PRD'}
                </button>

                <button
                  onClick={handleDownloadPrd}
                  className="flex items-center gap-1.5 rounded-lg bg-emerald-500 px-3.5 py-1.5 text-xs font-black text-stone-950 hover:bg-emerald-400 shadow-sm"
                >
                  <Download className="h-3.5 w-3.5" /> Download .md File
                </button>

                <button
                  onClick={() => setShowPrdModal(false)}
                  className="ml-2 rounded-lg border border-stone-800 bg-stone-900 px-3 py-1.5 text-xs font-bold hover:bg-stone-800"
                >
                  Close ✕
                </button>
              </div>
            </div>

            {/* PRD Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 bg-stone-950">
              {prdLoading ? (
                <div className="grid min-h-[400px] place-items-center text-center">
                  <div className="space-y-4">
                    <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-stone-800 border-t-emerald-400" />
                    <h5 className="text-lg font-black text-white">Generating Complete 15-Section PRD Document...</h5>
                    <p className="text-xs text-stone-400 max-w-sm">Writing Executive Summary, Problem Statement, Functional Subsystems, API Specifications, Data Contracts, Security Controls, and Success Metrics.</p>
                  </div>
                </div>
              ) : prdTab === 'raw' ? (
                <textarea
                  readOnly
                  value={prdMarkdown}
                  className="h-full w-full min-h-[500px] rounded-xl border border-stone-800 bg-stone-900 p-4 font-mono text-xs text-stone-200 focus:outline-none"
                />
              ) : (
                <div className="prose prose-invert max-w-none space-y-4 text-stone-300 text-sm leading-7">
                  <div className="rounded-xl border border-stone-800 bg-stone-900 p-6 whitespace-pre-wrap font-sans">
                    {prdMarkdown}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
