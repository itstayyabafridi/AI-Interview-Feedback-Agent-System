import { useState } from 'react';

// Code snippets for display
const codeSnippets = {
  mainEntry: `"""
AI Mock Interview & Feedback Agent
Main entry point - orchestrates the interview flow.
"""

import asyncio
from agents import Agent, Runner

from agents.interviewer import create_interviewer_agent
from agents.feedback import create_feedback_agent
from utils.session_manager import (
    create_session, save_session, 
    add_question_answer, mark_session_complete
)

async def main():
    # 1. Create session
    session = create_session(name, role, level)
    
    # 2. Create agents
    feedback_agent = create_feedback_agent()
    interviewer = create_interviewer_agent(
        role, level, num_questions, feedback_agent
    )
    
    # 3. Run interview (multi-turn)
    session = await run_interview(session, interviewer)
    
    # 4. Get feedback (handoff)
    feedback = await get_feedback(session, feedback_agent)
    
    # 5. Save and display results
    save_session(session)

asyncio.run(main())`,

  interviewer: `"""
Interviewer Agent - Dynamic Instructions
Instructions change based on role & experience level.
"""

from agents import Agent, handoff

def generate_interviewer_instructions(role, level, num_questions):
    """Dynamically generate instructions based on user input."""
    
    level_guidance = {
        "Junior": "Ask beginner to intermediate questions...",
        "Mid-Level": "Ask intermediate questions...",
        "Senior": "Ask advanced architecture questions..."
    }
    
    role_focus = {
        "MERN Stack Developer": "MongoDB, Express, React, Node...",
        "Python Developer": "Python fundamentals, OOP, Django...",
        "AI Engineer": "Machine learning, NLP, model deployment..."
    }
    
    instructions = f"""You are a professional interviewer.
    Role: {role} | Level: {level}
    Focus: {role_focus.get(role, 'general development')}
    Difficulty: {level_guidance.get(level, level_guidance['Mid-Level'])}
    Ask {num_questions} questions, one at a time.
    After all questions, say: INTERVIEW_COMPLETE"""
    
    return instructions

def create_interviewer_agent(role, level, num_questions, feedback_agent):
    instructions = generate_interviewer_instructions(
        role, level, num_questions
    )
    
    return Agent(
        name="Interviewer Agent",
        instructions=instructions,
        handoffs=[handoff(agent=feedback_agent)],
    )`,

  feedback: `"""
Feedback Agent - Evaluates interview performance.
Provides structured, actionable feedback.
"""

from agents import Agent

def create_feedback_agent():
    instructions = """You are an expert interview evaluator.
    
    WHEN YOU RECEIVE A TRANSCRIPT, provide:
    1. Overall Interview Summary
    2. Strong Areas (3-5 items)
    3. Areas for Improvement (3-5 items)
    4. Answers That Need Improvement
    5. Suggested Better Approaches
    6. Topics to Study Next (5-8 items)
    7. Overall Rating (Strong Hire / Hire / Weak Hire / No Hire)
    
    Be constructive and specific. Reference actual answers."""
    
    return Agent(
        name="Feedback Agent",
        instructions=instructions,
    )`,

  sessionManager: `"""
Session Manager - JSON-based session storage.
Each interview gets a unique session_id.
"""

import json, os, uuid
from datetime import datetime

def create_session(candidate_name, role, level):
    return {
        "session_id": f"session_{uuid.uuid4().hex[:12]}",
        "candidate_name": candidate_name,
        "role": role,
        "level": level,
        "questions": [],
        "answers": [],
        "started_at": datetime.now().isoformat(),
        "completed_at": None,
        "feedback": None
    }

def save_session(session):
    filepath = f"sessions/{session['session_id']}.json"
    with open(filepath, "w") as f:
        json.dump(session, f, indent=2)

def add_question_answer(session, question, answer):
    session["questions"].append(question)
    session["answers"].append(answer)

def get_session_summary(session):
    """Generate transcript for Feedback Agent."""
    lines = [f"Candidate: {session['candidate_name']}"]
    for i, (q, a) in enumerate(
        zip(session["questions"], session["answers"]), 1
    ):
        lines.append(f"Q{i}: {q}\\nA{i}: {a}")
    return "\\n".join(lines)`,

  handoff: `# How Agent Handoff Works in the OpenAI Agents SDK

from agents import Agent, handoff, Runner

# 1. Create the Feedback Agent first
feedback_agent = Agent(
    name="Feedback Agent",
    instructions="Evaluate the interview..."
)

# 2. Create Interviewer with handoff to Feedback Agent
interviewer = Agent(
    name="Interviewer Agent",
    instructions="Conduct the interview...",
    handoffs=[
        handoff(
            agent=feedback_agent,
            tool_description_override=(
                "Transfer to Feedback Agent after interview"
            )
        )
    ],
)

# 3. Run the interviewer (it can hand off when ready)
result = await Runner.run(interviewer, input_messages)

# The handoff is represented as a tool to the LLM:
# "transfer_to_feedback_agent"
# When the LLM calls it, control passes to the Feedback Agent`
};

const fileTree = [
  { name: 'ai-interview-agent/', type: 'dir', indent: 0 },
  { name: 'main.py', type: 'file', indent: 1, desc: 'CLI entry point & orchestrator' },
  { name: 'agents/', type: 'dir', indent: 1 },
  { name: '__init__.py', type: 'file', indent: 2 },
  { name: 'interviewer.py', type: 'file', indent: 2, desc: 'Dynamic instructions + handoff' },
  { name: 'feedback.py', type: 'file', indent: 2, desc: 'Evaluation & structured feedback' },
  { name: 'sessions/', type: 'dir', indent: 1, desc: 'JSON session storage' },
  { name: 'utils/', type: 'dir', indent: 1 },
  { name: '__init__.py', type: 'file', indent: 2 },
  { name: 'session_manager.py', type: 'file', indent: 2, desc: 'Session CRUD operations' },
  { name: 'config.py', type: 'file', indent: 1, desc: 'Environment variables & settings' },
  { name: '.env.example', type: 'file', indent: 1, desc: 'API key template' },
  { name: 'requirements.txt', type: 'file', indent: 1, desc: 'Python dependencies' },
  { name: 'README.md', type: 'file', indent: 1, desc: 'Documentation' },
];

type TabId = 'overview' | 'architecture' | 'code' | 'handoff' | 'sessions' | 'setup';

function App() {
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [activeCodeTab, setActiveCodeTab] = useState<string>('main');

  const tabs: { id: TabId; label: string; icon: string }[] = [
    { id: 'overview', label: 'Overview', icon: '🏠' },
    { id: 'architecture', label: 'Architecture', icon: '🏗️' },
    { id: 'code', label: 'Code', icon: '💻' },
    { id: 'handoff', label: 'Handoff', icon: '🔄' },
    { id: 'sessions', label: 'Sessions', icon: '💾' },
    { id: 'setup', label: 'Setup', icon: '🚀' },
  ];

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      {/* Hero Section */}
      <header className="relative overflow-hidden border-b border-gray-800">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/20 via-purple-900/10 to-gray-950"></div>
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-sm mb-6">
              <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse"></span>
              OpenAI Agents SDK • Python CLI Project
            </div>
            <h1 className="text-4xl sm:text-6xl font-bold bg-gradient-to-r from-white via-indigo-200 to-purple-200 bg-clip-text text-transparent mb-4">
              AI Mock Interview &<br />Feedback Agent
            </h1>
            <p className="text-lg sm:text-xl text-gray-400 max-w-3xl mx-auto mb-8">
              A multi-agent system where an <span className="text-indigo-300 font-medium">Interviewer Agent</span> conducts 
              technical interviews and hands off to a <span className="text-purple-300 font-medium">Feedback Agent</span> for evaluation.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <span className="px-3 py-1.5 rounded-lg bg-gray-800 border border-gray-700 text-sm text-gray-300">Python</span>
              <span className="px-3 py-1.5 rounded-lg bg-gray-800 border border-gray-700 text-sm text-gray-300">OpenAI Agents SDK</span>
              <span className="px-3 py-1.5 rounded-lg bg-gray-800 border border-gray-700 text-sm text-gray-300">Async/Await</span>
              <span className="px-3 py-1.5 rounded-lg bg-gray-800 border border-gray-700 text-sm text-gray-300">Agent Handoffs</span>
              <span className="px-3 py-1.5 rounded-lg bg-gray-800 border border-gray-700 text-sm text-gray-300">JSON Sessions</span>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="sticky top-0 z-50 bg-gray-950/80 backdrop-blur-xl border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex overflow-x-auto gap-1 py-2 scrollbar-hide">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'
                }`}
              >
                <span>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {activeTab === 'overview' && <OverviewSection />}
        {activeTab === 'architecture' && <ArchitectureSection />}
        {activeTab === 'code' && <CodeSection activeTab={activeCodeTab} setActiveTab={setActiveCodeTab} />}
        {activeTab === 'handoff' && <HandoffSection />}
        {activeTab === 'sessions' && <SessionsSection />}
        {activeTab === 'setup' && <SetupSection />}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-500 text-sm">
          <p>AI Mock Interview & Feedback Agent • Built with OpenAI Agents SDK</p>
          <p className="mt-1">A learning project demonstrating multi-agent systems, dynamic instructions, and agent handoffs.</p>
        </div>
      </footer>
    </div>
  );
}

function OverviewSection() {
  return (
    <div className="space-y-12">
      {/* Project Purpose */}
      <section>
        <h2 className="text-3xl font-bold text-white mb-6">📖 Project Purpose</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="p-6 rounded-xl bg-gray-900 border border-gray-800">
            <h3 className="text-lg font-semibold text-indigo-300 mb-3">What It Does</h3>
            <p className="text-gray-400 leading-relaxed">
              This CLI application simulates a real technical interview. An AI interviewer asks questions 
              tailored to the candidate's role and experience level, then a separate AI evaluator provides 
              detailed feedback on performance.
            </p>
          </div>
          <div className="p-6 rounded-xl bg-gray-900 border border-gray-800">
            <h3 className="text-lg font-semibold text-purple-300 mb-3">Why It Matters</h3>
            <p className="text-gray-400 leading-relaxed">
              It demonstrates key <strong className="text-gray-200">OpenAI Agents SDK</strong> concepts: 
              dynamic instructions, session management, agent handoffs, and multi-turn conversations — 
              all in a clean, beginner-friendly codebase.
            </p>
          </div>
        </div>
      </section>

      {/* Key Features */}
      <section>
        <h2 className="text-3xl font-bold text-white mb-6">✨ Key Concepts Demonstrated</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { icon: '🎯', title: 'Dynamic Instructions', desc: 'Agent instructions change based on role & level' },
            { icon: '💾', title: 'Session Management', desc: 'JSON-based storage with unique session IDs' },
            { icon: '🔄', title: 'Agent Handoff', desc: 'Interviewer delegates to Feedback Agent' },
            { icon: '💬', title: 'Multi-turn Conversation', desc: 'Using to_input_list() for history' },
            { icon: '⚡', title: 'Async/Await', desc: 'All agent runs use async patterns' },
            { icon: '🛡️', title: 'Error Handling', desc: 'Graceful handling of errors & interruptions' },
          ].map((feature, i) => (
            <div key={i} className="p-5 rounded-xl bg-gray-900 border border-gray-800 hover:border-indigo-500/30 transition-colors">
              <span className="text-2xl mb-3 block">{feature.icon}</span>
              <h3 className="font-semibold text-white mb-1">{feature.title}</h3>
              <p className="text-sm text-gray-400">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* File Structure */}
      <section>
        <h2 className="text-3xl font-bold text-white mb-6">📁 Project Structure</h2>
        <div className="p-6 rounded-xl bg-gray-900 border border-gray-800 font-mono text-sm">
          {fileTree.map((item, i) => (
            <div key={i} className="flex items-center gap-2 py-0.5" style={{ paddingLeft: `${item.indent * 24}px` }}>
              <span className={item.type === 'dir' ? 'text-yellow-400' : 'text-blue-400'}>
                {item.type === 'dir' ? '📂' : '📄'}
              </span>
              <span className={item.type === 'dir' ? 'text-yellow-300 font-semibold' : 'text-gray-300'}>
                {item.name}
              </span>
              {item.desc && <span className="text-gray-500 text-xs ml-2">← {item.desc}</span>}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function ArchitectureSection() {
  return (
    <div className="space-y-12">
      <section>
        <h2 className="text-3xl font-bold text-white mb-6">🏗️ System Architecture</h2>
        
        {/* Architecture Diagram */}
        <div className="p-8 rounded-xl bg-gray-900 border border-gray-800 mb-8">
          <div className="flex flex-col items-center gap-6">
            {/* Main Orchestrator */}
            <div className="w-full max-w-2xl p-4 rounded-xl bg-gradient-to-r from-gray-800 to-gray-800/50 border border-gray-700 text-center">
              <span className="text-lg font-semibold text-white">🎮 main.py (Orchestrator)</span>
              <p className="text-sm text-gray-400 mt-1">CLI Entry Point • User Input • Session Management</p>
            </div>
            
            {/* Arrow */}
            <div className="flex flex-col items-center">
              <div className="w-0.5 h-8 bg-indigo-500"></div>
              <span className="text-xs text-indigo-400">creates & runs</span>
              <div className="w-0.5 h-4 bg-indigo-500"></div>
            </div>
            
            {/* Agents Row */}
            <div className="w-full max-w-3xl grid md:grid-cols-2 gap-6">
              {/* Interviewer */}
              <div className="p-5 rounded-xl bg-indigo-950/50 border border-indigo-500/30">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-2xl">🎤</span>
                  <h3 className="font-bold text-indigo-300">Interviewer Agent</h3>
                </div>
                <ul className="text-sm text-gray-400 space-y-1.5">
                  <li>• Dynamic instructions (role + level)</li>
                  <li>• One question at a time</li>
                  <li>• Tracks conversation history</li>
                  <li>• Avoids repeating questions</li>
                  <li>• Signals completion</li>
                </ul>
              </div>
              
              {/* Feedback */}
              <div className="p-5 rounded-xl bg-purple-950/50 border border-purple-500/30">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-2xl">📊</span>
                  <h3 className="font-bold text-purple-300">Feedback Agent</h3>
                </div>
                <ul className="text-sm text-gray-400 space-y-1.5">
                  <li>• Receives full transcript</li>
                  <li>• Evaluates technical accuracy</li>
                  <li>• Identifies strengths & weaknesses</li>
                  <li>• Suggests improvements</li>
                  <li>• Provides study recommendations</li>
                </ul>
              </div>
            </div>
            
            {/* Handoff Arrow */}
            <div className="flex items-center gap-3">
              <div className="w-16 h-0.5 bg-gradient-to-r from-indigo-500 to-purple-500"></div>
              <span className="px-3 py-1 rounded-full bg-gray-800 border border-gray-700 text-xs text-gray-300">
                🔄 HANDOFF
              </span>
              <div className="w-16 h-0.5 bg-gradient-to-r from-purple-500 to-indigo-500"></div>
            </div>
            
            {/* Session Storage */}
            <div className="w-full max-w-2xl p-4 rounded-xl bg-gray-800/50 border border-gray-700 text-center">
              <span className="text-lg font-semibold text-green-300">💾 Session Manager</span>
              <p className="text-sm text-gray-400 mt-1">JSON Storage • Unique IDs • Q&A Tracking • Transcripts</p>
            </div>
          </div>
        </div>
      </section>

      {/* How the Agents Work */}
      <section>
        <h2 className="text-2xl font-bold text-white mb-6">How the Two Agents Work</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="p-6 rounded-xl bg-gray-900 border border-indigo-500/20">
            <h3 className="text-lg font-bold text-indigo-300 mb-4">🎤 Interviewer Agent</h3>
            <div className="space-y-3 text-sm text-gray-400">
              <p><strong className="text-gray-200">1. Dynamic Creation:</strong> Instructions are generated at runtime based on the candidate's selected role and experience level.</p>
              <p><strong className="text-gray-200">2. Question Flow:</strong> Asks one question at a time, waits for the answer, acknowledges it, then moves to the next question.</p>
              <p><strong className="text-gray-200">3. Tracking:</strong> Uses conversation history via <code className="text-indigo-300 bg-indigo-950/50 px-1.5 py-0.5 rounded">result.to_input_list()</code> to remember context.</p>
              <p><strong className="text-gray-200">4. Completion:</strong> After all questions, includes <code className="text-indigo-300 bg-indigo-950/50 px-1.5 py-0.5 rounded">INTERVIEW_COMPLETE</code> in its response.</p>
            </div>
          </div>
          
          <div className="p-6 rounded-xl bg-gray-900 border border-purple-500/20">
            <h3 className="text-lg font-bold text-purple-300 mb-4">📊 Feedback Agent</h3>
            <div className="space-y-3 text-sm text-gray-400">
              <p><strong className="text-gray-200">1. Single Responsibility:</strong> Only evaluates — never conducts interviews.</p>
              <p><strong className="text-gray-200">2. Receives Transcript:</strong> Gets the full Q&A history formatted as a readable transcript.</p>
              <p><strong className="text-gray-200">3. Structured Output:</strong> Returns feedback in a consistent format with sections for strengths, weaknesses, and recommendations.</p>
              <p><strong className="text-gray-200">4. Level-Aware:</strong> Adjusts expectations based on the candidate's experience level.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Flow Diagram */}
      <section>
        <h2 className="text-2xl font-bold text-white mb-6">Complete Flow</h2>
        <div className="p-6 rounded-xl bg-gray-900 border border-gray-800">
          <div className="space-y-4">
            {[
              { step: '1', title: 'User Setup', desc: 'Collect name, role, level, and number of questions', color: 'bg-blue-500' },
              { step: '2', title: 'Session Creation', desc: 'Generate unique session_id, create JSON structure', color: 'bg-green-500' },
              { step: '3', title: 'Agent Initialization', desc: 'Create Feedback Agent, then Interviewer with dynamic instructions', color: 'bg-indigo-500' },
              { step: '4', title: 'Interview Loop', desc: 'Multi-turn conversation: ask question → get answer → next question', color: 'bg-purple-500' },
              { step: '5', title: 'Interview Complete', desc: 'All questions asked, save session data', color: 'bg-pink-500' },
              { step: '6', title: 'Feedback Generation', desc: 'Handoff transcript to Feedback Agent for evaluation', color: 'bg-orange-500' },
              { step: '7', title: 'Results Display', desc: 'Show structured feedback to user, save final session', color: 'bg-emerald-500' },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-4">
                <div className={`flex-shrink-0 w-8 h-8 rounded-full ${item.color} flex items-center justify-center text-white font-bold text-sm`}>
                  {item.step}
                </div>
                <div>
                  <h4 className="font-semibold text-white">{item.title}</h4>
                  <p className="text-sm text-gray-400">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function CodeSection({ activeTab, setActiveTab }: { activeTab: string; setActiveTab: (tab: string) => void }) {
  const codeTabs = [
    { id: 'main', label: 'main.py' },
    { id: 'interviewer', label: 'interviewer.py' },
    { id: 'feedback', label: 'feedback.py' },
    { id: 'session', label: 'session_manager.py' },
    { id: 'handoff', label: 'handoff.py' },
  ];

  const codeMap: Record<string, string> = {
    main: codeSnippets.mainEntry,
    interviewer: codeSnippets.interviewer,
    feedback: codeSnippets.feedback,
    session: codeSnippets.sessionManager,
    handoff: codeSnippets.handoff,
  };

  return (
    <div className="space-y-6">
      <section>
        <h2 className="text-3xl font-bold text-white mb-6">💻 Source Code</h2>
        <p className="text-gray-400 mb-6">
          Explore the key source files. Each file demonstrates a specific concept of the OpenAI Agents SDK.
        </p>
        
        {/* Code Tabs */}
        <div className="flex flex-wrap gap-2 mb-4">
          {codeTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg text-sm font-mono transition-all ${
                activeTab === tab.id
                  ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                  : 'bg-gray-800 text-gray-400 border border-gray-700 hover:text-gray-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        
        {/* Code Display */}
        <div className="rounded-xl bg-gray-900 border border-gray-800 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2 bg-gray-800/50 border-b border-gray-700">
            <span className="text-sm font-mono text-gray-400">
              {codeTabs.find(t => t.id === activeTab)?.label}
            </span>
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500/60"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500/60"></div>
              <div className="w-3 h-3 rounded-full bg-green-500/60"></div>
            </div>
          </div>
          <pre className="p-6 overflow-x-auto text-sm leading-relaxed">
            <code className="text-gray-300 font-mono whitespace-pre">
              {codeMap[activeTab]}
            </code>
          </pre>
        </div>
      </section>
    </div>
  );
}

function HandoffSection() {
  return (
    <div className="space-y-12">
      <section>
        <h2 className="text-3xl font-bold text-white mb-6">🔄 Agent Handoff Explained</h2>
        
        <div className="p-6 rounded-xl bg-gray-900 border border-gray-800 mb-8">
          <p className="text-gray-400 leading-relaxed mb-4">
            <strong className="text-white">Handoffs</strong> are a core concept of the OpenAI Agents SDK. 
            They allow one agent to delegate tasks to another agent. In the SDK, handoffs are represented 
            as <strong className="text-indigo-300">tools</strong> to the LLM — when the model decides to call 
            a handoff tool, control passes to the target agent.
          </p>
          <p className="text-gray-400 leading-relaxed">
            In this project, the Interviewer Agent has a handoff to the Feedback Agent. After the interview 
            is complete, the system invokes the Feedback Agent with the full interview transcript.
          </p>
        </div>
      </section>

      {/* How It Works Step by Step */}
      <section>
        <h2 className="text-2xl font-bold text-white mb-6">How Handoff Works Step-by-Step</h2>
        <div className="space-y-6">
          {[
            {
              step: '1. Register Handoff',
              code: `interviewer = Agent(
    name="Interviewer Agent",
    instructions=dynamic_instructions,
    handoffs=[handoff(agent=feedback_agent)]
)`,
              desc: 'The Interviewer Agent is created with the Feedback Agent registered as a handoff target.'
            },
            {
              step: '2. Handoff as Tool',
              code: `# The SDK automatically creates a tool called:
# "transfer_to_feedback_agent"
# The LLM can call this tool to delegate work`,
              desc: 'The SDK converts the handoff into a tool the LLM can call. The tool name follows the pattern: transfer_to_{agent_name}.'
            },
            {
              step: '3. Interview Completes',
              code: `# Interviewer signals completion:
# "INTERVIEW_COMPLETE"
# All questions have been asked and answered.`,
              desc: 'After all questions are asked, the Interviewer signals that the interview is done.'
            },
            {
              step: '4. Transcript Generation',
              code: `transcript = get_session_summary(session)
# Formats all Q&A pairs into a readable transcript`,
              desc: 'The session manager creates a formatted transcript of the entire interview.'
            },
            {
              step: '5. Feedback Agent Runs',
              code: `result = await Runner.run(
    feedback_agent,
    input=f"Evaluate this interview:\\n\\n{transcript}"
)`,
              desc: 'The Feedback Agent receives the transcript and produces structured evaluation.'
            },
          ].map((item, i) => (
            <div key={i} className="p-5 rounded-xl bg-gray-900 border border-gray-800">
              <h3 className="font-bold text-indigo-300 mb-2">{item.step}</h3>
              <p className="text-sm text-gray-400 mb-3">{item.desc}</p>
              <pre className="p-4 rounded-lg bg-gray-950 border border-gray-800 text-sm overflow-x-auto">
                <code className="text-gray-300 font-mono">{item.code}</code>
              </pre>
            </div>
          ))}
        </div>
      </section>

      {/* Dynamic Instructions */}
      <section>
        <h2 className="text-2xl font-bold text-white mb-6">🎯 Dynamic Instructions</h2>
        <div className="p-6 rounded-xl bg-gray-900 border border-gray-800">
          <p className="text-gray-400 mb-4">
            The Interviewer Agent's instructions are <strong className="text-white">generated at runtime</strong> based 
            on the user's selections. This means the same agent code can produce completely different interview 
            experiences:
          </p>
          <div className="grid md:grid-cols-3 gap-4 mt-6">
            <div className="p-4 rounded-lg bg-green-950/30 border border-green-500/20">
              <h4 className="font-semibold text-green-300 mb-2">Junior Developer</h4>
              <p className="text-xs text-gray-400">
                "What is a variable?"<br />
                "Explain a for loop"<br />
                "What is HTML?"
              </p>
            </div>
            <div className="p-4 rounded-lg bg-yellow-950/30 border border-yellow-500/20">
              <h4 className="font-semibold text-yellow-300 mb-2">Mid-Level Developer</h4>
              <p className="text-xs text-gray-400">
                "Explain closures in JS"<br />
                "Design a REST API"<br />
                "How does React re-render?"
              </p>
            </div>
            <div className="p-4 rounded-lg bg-red-950/30 border border-red-500/20">
              <h4 className="font-semibold text-red-300 mb-2">Senior Developer</h4>
              <p className="text-xs text-gray-400">
                "Design a scalable system"<br />
                "Trade-offs in microservices"<br />
                "Debug a production outage"
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function SessionsSection() {
  const exampleSession = {
    session_id: "session_a1b2c3d4e5f6",
    candidate_name: "Alice Johnson",
    role: "MERN Stack Developer",
    level: "Mid-Level",
    questions: [
      "What is the Virtual DOM in React?",
      "Explain middleware in Express.js",
      "How do you handle state in a large React app?"
    ],
    answers: [
      "The Virtual DOM is a lightweight JavaScript representation of the actual DOM...",
      "Middleware functions have access to the request and response objects...",
      "I use Redux for global state and React Context for theme/auth..."
    ],
    started_at: "2025-01-15T10:30:00",
    completed_at: "2025-01-15T11:15:00",
    feedback: "## 📋 Overall Summary\nStrong understanding of React concepts..."
  };

  return (
    <div className="space-y-12">
      <section>
        <h2 className="text-3xl font-bold text-white mb-6">💾 Session Management</h2>
        <p className="text-gray-400 mb-8 max-w-3xl">
          Each interview session is stored as a <strong className="text-white">JSON file</strong> in the 
          <code className="text-indigo-300 bg-indigo-950/50 px-1.5 py-0.5 rounded mx-1">sessions/</code> directory. 
          Sessions are isolated — each interview gets a unique ID and its own data file.
        </p>
      </section>

      {/* Session Structure */}
      <section>
        <h2 className="text-2xl font-bold text-white mb-6">Session Data Structure</h2>
        <div className="rounded-xl bg-gray-900 border border-gray-800 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2 bg-gray-800/50 border-b border-gray-700">
            <span className="text-sm font-mono text-gray-400">sessions/session_a1b2c3d4e5f6.json</span>
          </div>
          <pre className="p-6 overflow-x-auto text-sm leading-relaxed">
            <code className="text-gray-300 font-mono whitespace-pre">
              {JSON.stringify(exampleSession, null, 2)}
            </code>
          </pre>
        </div>
      </section>

      {/* Session Features */}
      <section>
        <h2 className="text-2xl font-bold text-white mb-6">Session Features</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            { icon: '🆔', title: 'Unique Session IDs', desc: 'UUID-based IDs ensure no collisions between sessions' },
            { icon: '📝', title: 'Complete Q&A History', desc: 'Every question and answer is recorded in order' },
            { icon: '🕐', title: 'Timestamps', desc: 'Track when the interview started and completed' },
            { icon: '📊', title: 'Stored Feedback', desc: 'Feedback Agent output is saved with the session' },
            { icon: '🔒', title: 'Isolated Sessions', desc: 'Each interview is independent — no cross-contamination' },
            { icon: '🔄', title: 'Resumable', desc: 'Sessions can be loaded and reviewed after completion' },
          ].map((feature, i) => (
            <div key={i} className="p-4 rounded-xl bg-gray-900 border border-gray-800">
              <div className="flex items-center gap-3">
                <span className="text-xl">{feature.icon}</span>
                <div>
                  <h4 className="font-semibold text-white text-sm">{feature.title}</h4>
                  <p className="text-xs text-gray-400">{feature.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* How Sessions Work */}
      <section>
        <h2 className="text-2xl font-bold text-white mb-6">How Session Management Works</h2>
        <div className="p-6 rounded-xl bg-gray-900 border border-gray-800">
          <div className="space-y-4 text-sm text-gray-400">
            <p>
              <strong className="text-indigo-300">1. Creation:</strong> When the interview starts, <code className="text-gray-300 bg-gray-800 px-1 rounded">create_session()</code> generates a new session with a unique ID and empty Q&A arrays.
            </p>
            <p>
              <strong className="text-indigo-300">2. During Interview:</strong> Each Q&A pair is appended via <code className="text-gray-300 bg-gray-800 px-1 rounded">add_question_answer()</code>. The session is saved after each answer.
            </p>
            <p>
              <strong className="text-indigo-300">3. Completion:</strong> <code className="text-gray-300 bg-gray-800 px-1 rounded">mark_session_complete()</code> adds a timestamp, then <code className="text-gray-300 bg-gray-800 px-1 rounded">get_session_summary()</code> creates a formatted transcript.
            </p>
            <p>
              <strong className="text-indigo-300">4. Feedback:</strong> The transcript is sent to the Feedback Agent. The response is stored via <code className="text-gray-300 bg-gray-800 px-1 rounded">add_feedback()</code>.
            </p>
            <p>
              <strong className="text-indigo-300">5. Final Save:</strong> The complete session (with feedback) is saved as JSON for future reference.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

function SetupSection() {
  return (
    <div className="space-y-12">
      <section>
        <h2 className="text-3xl font-bold text-white mb-6">🚀 Installation & Setup</h2>
        
        <div className="space-y-6">
          {/* Prerequisites */}
          <div className="p-6 rounded-xl bg-gray-900 border border-gray-800">
            <h3 className="text-lg font-semibold text-white mb-3">📋 Prerequisites</h3>
            <ul className="text-gray-400 space-y-2">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400"></span>
                Python 3.9 or higher
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400"></span>
                An OpenAI API key
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400"></span>
                pip (Python package manager)
              </li>
            </ul>
          </div>

          {/* Step 1 */}
          <div className="p-6 rounded-xl bg-gray-900 border border-gray-800">
            <h3 className="text-lg font-semibold text-white mb-3">Step 1: Navigate to Project</h3>
            <pre className="p-4 rounded-lg bg-gray-950 border border-gray-800 text-sm">
              <code className="text-green-300 font-mono">cd ai-interview-agent</code>
            </pre>
          </div>

          {/* Step 2 */}
          <div className="p-6 rounded-xl bg-gray-900 border border-gray-800">
            <h3 className="text-lg font-semibold text-white mb-3">Step 2: Create Virtual Environment</h3>
            <pre className="p-4 rounded-lg bg-gray-950 border border-gray-800 text-sm overflow-x-auto">
              <code className="text-green-300 font-mono whitespace-pre">{`# macOS/Linux
python -m venv venv
source venv/bin/activate

# Windows
python -m venv venv
venv\\Scripts\\activate`}</code>
            </pre>
          </div>

          {/* Step 3 */}
          <div className="p-6 rounded-xl bg-gray-900 border border-gray-800">
            <h3 className="text-lg font-semibold text-white mb-3">Step 3: Install Dependencies</h3>
            <pre className="p-4 rounded-lg bg-gray-950 border border-gray-800 text-sm">
              <code className="text-green-300 font-mono">pip install -r requirements.txt</code>
            </pre>
            <p className="text-sm text-gray-500 mt-2">
              This installs: <code className="text-gray-400">openai-agents</code> and <code className="text-gray-400">python-dotenv</code>
            </p>
          </div>

          {/* Step 4 */}
          <div className="p-6 rounded-xl bg-gray-900 border border-gray-800">
            <h3 className="text-lg font-semibold text-white mb-3">Step 4: Configure API Key</h3>
            <pre className="p-4 rounded-lg bg-gray-950 border border-gray-800 text-sm overflow-x-auto">
              <code className="text-green-300 font-mono whitespace-pre">{`# Copy the example env file
cp .env.example .env

# Edit .env and add your API key:
OPENAI_API_KEY=sk-your-actual-api-key-here`}</code>
            </pre>
            <div className="mt-3 p-3 rounded-lg bg-yellow-950/30 border border-yellow-500/20">
              <p className="text-sm text-yellow-300">
                ⚠️ Never commit your .env file or hardcode API keys in source code!
              </p>
            </div>
          </div>

          {/* Step 5 */}
          <div className="p-6 rounded-xl bg-gray-900 border border-gray-800">
            <h3 className="text-lg font-semibold text-white mb-3">Step 5: Run the Application</h3>
            <pre className="p-4 rounded-lg bg-gray-950 border border-gray-800 text-sm">
              <code className="text-green-300 font-mono">python main.py</code>
            </pre>
          </div>
        </div>
      </section>

      {/* Requirements */}
      <section>
        <h2 className="text-2xl font-bold text-white mb-6">📦 Dependencies</h2>
        <div className="rounded-xl bg-gray-900 border border-gray-800 overflow-hidden">
          <div className="px-4 py-2 bg-gray-800/50 border-b border-gray-700">
            <span className="text-sm font-mono text-gray-400">requirements.txt</span>
          </div>
          <pre className="p-6 text-sm">
            <code className="text-gray-300 font-mono">
              {`openai-agents>=0.0.1\npython-dotenv>=1.0.0`}
            </code>
          </pre>
        </div>
      </section>

      {/* Environment Variables */}
      <section>
        <h2 className="text-2xl font-bold text-white mb-6">⚙️ Environment Variables</h2>
        <div className="rounded-xl bg-gray-900 border border-gray-800 overflow-hidden">
          <div className="px-4 py-2 bg-gray-800/50 border-b border-gray-700">
            <span className="text-sm font-mono text-gray-400">.env.example</span>
          </div>
          <pre className="p-6 text-sm">
            <code className="text-gray-300 font-mono">
              {`# OpenAI API Key (required)\nOPENAI_API_KEY=sk-your-api-key-here\n\n# Model to use (optional, defaults to gpt-4o-mini)\nMODEL_NAME=gpt-4o-mini`}
            </code>
          </pre>
        </div>
      </section>
    </div>
  );
}

export default App;
