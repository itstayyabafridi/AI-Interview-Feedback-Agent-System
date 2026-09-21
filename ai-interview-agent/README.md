# 🤖 AI Mock Interview & Feedback Agent

A **multi-agent CLI application** built with the **OpenAI Agents SDK** that conducts mock technical interviews and provides structured feedback.

## 📖 Project Purpose

This project demonstrates how to build a **multi-agent system** where specialized AI agents collaborate to:

1. **Conduct** a realistic mock technical interview
2. **Evaluate** the candidate's performance
3. **Provide** actionable feedback for improvement

It's designed as a **learning project** to showcase key concepts of the OpenAI Agents SDK:
- Dynamic Instructions
- Session Management
- Agent Handoffs
- Multi-turn Conversations

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                      MAIN.PY                            │
│              (CLI Entry Point & Orchestrator)            │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌──────────────────┐    HANDOFF    ┌────────────────┐  │
│  │  INTERVIEWER     │──────────────▶│   FEEDBACK     │  │
│  │  AGENT           │               │   AGENT        │  │
│  │                  │               │                │  │
│  │ • Dynamic instr. │               │ • Evaluation   │  │
│  │ • One Q at a time│               │ • Strengths    │  │
│  │ • Tracks history │               │ • Weaknesses   │  │
│  │ • No repeats     │               │ • Suggestions  │  │
│  └──────────────────┘               └────────────────┘  │
│                                                         │
│  ┌──────────────────────────────────────────────────┐   │
│  │           SESSION MANAGER (utils/)               │   │
│  │  • Create sessions  • Save/Load JSON             │   │
│  │  • Track Q&A pairs  • Generate transcripts       │   │
│  └──────────────────────────────────────────────────┘   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### How the Two Agents Work

#### 1. Interviewer Agent
- **Created dynamically** with instructions based on the candidate's role and experience level
- Asks **one question at a time** and waits for answers
- **Tracks** all questions asked to avoid repetition
- May ask **follow-up questions** when appropriate
- Signals completion with `INTERVIEW_COMPLETE`
- Has a **handoff** configured to the Feedback Agent

#### 2. Feedback Agent
- Receives the **complete interview transcript**
- Analyzes answers for **technical accuracy** and **communication quality**
- Provides **structured feedback** including:
  - Overall summary
  - Strong areas
  - Weak areas
  - Answers needing improvement
  - Suggested better approaches
  - Topics to study next
  - Overall hiring recommendation

---

## 🔄 How Handoff Works

The **handoff** is a core concept of the OpenAI Agents SDK. It allows one agent to delegate work to another agent.

In this project:

```python
# The Interviewer Agent is created with a handoff to the Feedback Agent
interviewer = Agent(
    name="Interviewer Agent",
    instructions=dynamic_instructions,
    handoffs=[
        handoff(
            agent=feedback_agent,
            tool_description_override="Transfer to Feedback Agent for evaluation"
        )
    ],
)
```

**The handoff flow:**
1. The Interviewer Agent conducts the full interview
2. When all questions are asked, the agent signals completion
3. The system then runs the Feedback Agent with the interview transcript
4. The Feedback Agent produces structured evaluation

> **Note:** In this CLI implementation, the handoff is managed programmatically in `main.py`. The Interviewer Agent has the Feedback Agent registered as a handoff target, and after the interview loop completes, the main orchestrator invokes the Feedback Agent with the full transcript.

---

## 🎯 How Dynamic Instructions Work

The Interviewer Agent's instructions are **generated at runtime** based on user input:

```python
def generate_interviewer_instructions(role, level, num_questions):
    # Different difficulty guidance per level
    level_guidance = {
        "Junior": "Ask beginner to intermediate questions...",
        "Mid-Level": "Ask intermediate questions...",
        "Senior": "Ask advanced architecture questions..."
    }
    
    # Different focus areas per role
    role_focus = {
        "MERN Stack Developer": "MongoDB, Express, React, Node...",
        "Python Developer": "Python fundamentals, OOP, Django...",
        "AI Engineer": "Machine learning, NLP, model deployment..."
    }
    
    # Combine into full instructions
    instructions = f"""You are interviewing for {role} at {level} level...
    Focus areas: {role_focus[role]}
    Difficulty: {level_guidance[level]}
    Ask {num_questions} questions..."""
    
    return instructions
```

This means:
- A **Junior MERN Developer** gets questions about basic React components and simple Express routes
- A **Senior AI Engineer** gets questions about model architecture, distributed training, and production ML systems

---

## 💾 How Sessions Are Stored

Each interview session is stored as a **JSON file** in the `sessions/` directory:

```json
{
  "session_id": "session_a1b2c3d4e5f6",
  "candidate_name": "John Doe",
  "role": "MERN Stack Developer",
  "level": "Mid-Level",
  "questions": [
    "What is the virtual DOM in React?",
    "Explain middleware in Express.js"
  ],
  "answers": [
    "The virtual DOM is a lightweight copy of the actual DOM...",
    "Middleware functions are functions that have access to the request..."
  ],
  "started_at": "2025-01-15T10:30:00",
  "completed_at": "2025-01-15T11:15:00",
  "feedback": "## 📋 Overall Interview Summary\n..."
}
```

**Session features:**
- Unique session ID (UUID-based)
- Complete Q&A history
- Timestamps for start and completion
- Stored feedback from the Feedback Agent
- Isolated per interview (no cross-contamination)

---

## 📁 Project Structure

```
ai-interview-agent/
├── main.py                 # CLI entry point & orchestrator
├── agents/
│   ├── __init__.py
│   ├── interviewer.py      # Interviewer Agent with dynamic instructions
│   └── feedback.py         # Feedback Agent for evaluation
├── sessions/               # JSON session storage (auto-created)
│   └── .gitkeep
├── utils/
│   ├── __init__.py
│   └── session_manager.py  # Session CRUD operations
├── config.py               # Configuration & environment variables
├── .env.example            # Environment variable template
├── requirements.txt        # Python dependencies
└── README.md               # This file
```

---

## 🚀 Installation

### Prerequisites
- Python 3.9 or higher
- An OpenAI API key

### Steps

1. **Clone or download the project:**
   ```bash
   cd ai-interview-agent
   ```

2. **Create a virtual environment:**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables:**
   ```bash
   cp .env.example .env
   ```
   
   Then edit `.env` and add your OpenAI API key:
   ```
   OPENAI_API_KEY=sk-your-actual-api-key-here
   ```

---

## 🎮 How to Run

```bash
python main.py
```

### Example Session

```
============================================================
   🤖 AI MOCK INTERVIEW & FEEDBACK AGENT
   Powered by OpenAI Agents SDK
============================================================

📝 Let's set up your mock interview!

👤 Your Name: Alice Johnson

🎯 Available Roles:
   1. MERN Stack Developer
   2. Python Developer
   3. AI Engineer
   ...

Select role (number or name): 1

📊 Experience Level:
   1. Junior
   2. Mid-Level
   3. Senior

Select level (number or name): 2

❓ Number of Questions (3-10):
Enter number: 5

🚀 Starting interview...

🤖 Interviewer: Hello Alice! Welcome to your MERN Stack Developer 
interview. Let's begin! 

Question 1: Can you explain what the Virtual DOM is in React 
and how it improves performance?

👤 Your Answer: The Virtual DOM is...
```

---

## 🔑 Key Concepts Demonstrated

| Concept | Where | Description |
|---------|-------|-------------|
| Dynamic Instructions | `agents/interviewer.py` | Instructions change based on role & level |
| Session Management | `utils/session_manager.py` | JSON-based session storage & retrieval |
| Agent Handoff | `agents/interviewer.py` | Interviewer hands off to Feedback Agent |
| Multi-turn Conversation | `main.py` | Using `result.to_input_list()` for history |
| Async/Await | Throughout | All agent runs use async patterns |
| Error Handling | `main.py` | Graceful handling of errors & interruptions |

---

## 📝 Notes

- This is a **learning/demo project** - keep it simple and understandable
- Each agent has a **single responsibility** (interview OR feedback)
- The code is **commented** for educational purposes
- Session files can be reviewed after interviews for debugging
- The project uses **async/await** as recommended by the SDK

---

## 📄 License

This project is for educational purposes. Feel free to use and modify it for learning.
