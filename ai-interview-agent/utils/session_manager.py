"""
Session Manager - Handles creation, storage, and retrieval of interview sessions.
Each session is stored as a JSON file in the sessions/ directory.
"""

import json
import os
import uuid
from datetime import datetime
from config import SESSIONS_DIR


def ensure_sessions_dir():
    """Create the sessions directory if it doesn't exist."""
    os.makedirs(SESSIONS_DIR, exist_ok=True)


def generate_session_id():
    """Generate a unique session ID using UUID."""
    return f"session_{uuid.uuid4().hex[:12]}"


def create_session(candidate_name: str, role: str, level: str) -> dict:
    """
    Create a new interview session.
    
    Args:
        candidate_name: Name of the candidate
        role: Target job role
        level: Experience level (Junior, Mid-Level, Senior)
    
    Returns:
        dict: New session data structure
    """
    ensure_sessions_dir()
    
    session = {
        "session_id": generate_session_id(),
        "candidate_name": candidate_name,
        "role": role,
        "level": level,
        "questions": [],
        "answers": [],
        "started_at": datetime.now().isoformat(),
        "completed_at": None,
        "feedback": None
    }
    
    return session


def save_session(session: dict):
    """
    Save session data to a JSON file.
    
    Args:
        session: Session dictionary to save
    """
    ensure_sessions_dir()
    filepath = os.path.join(SESSIONS_DIR, f"{session['session_id']}.json")
    
    with open(filepath, "w", encoding="utf-8") as f:
        json.dump(session, f, indent=2, ensure_ascii=False)
    
    print(f"  [Session saved: {filepath}]")


def load_session(session_id: str) -> dict:
    """
    Load a session from a JSON file.
    
    Args:
        session_id: The session ID to load
    
    Returns:
        dict: Session data
    
    Raises:
        FileNotFoundError: If session file doesn't exist
    """
    filepath = os.path.join(SESSIONS_DIR, f"{session_id}.json")
    
    if not os.path.exists(filepath):
        raise FileNotFoundError(f"Session '{session_id}' not found.")
    
    with open(filepath, "r", encoding="utf-8") as f:
        return json.load(f)


def add_question_answer(session: dict, question: str, answer: str):
    """
    Add a question and answer pair to the session.
    
    Args:
        session: Session dictionary to update
        question: The interview question
        answer: The candidate's answer
    """
    session["questions"].append(question)
    session["answers"].append(answer)


def mark_session_complete(session: dict):
    """Mark the session as completed with a timestamp."""
    session["completed_at"] = datetime.now().isoformat()


def add_feedback(session: dict, feedback: str):
    """
    Add feedback to the session.
    
    Args:
        session: Session dictionary to update
        feedback: Feedback text from the Feedback Agent
    """
    session["feedback"] = feedback


def get_session_summary(session: dict) -> str:
    """
    Get a formatted summary of the session for the Feedback Agent.
    
    Args:
        session: Session dictionary
    
    Returns:
        str: Formatted interview transcript
    """
    summary_lines = [
        f"=== INTERVIEW TRANSCRIPT ===",
        f"Candidate: {session['candidate_name']}",
        f"Role: {session['role']}",
        f"Level: {session['level']}",
        f"Session ID: {session['session_id']}",
        f"Date: {session['started_at']}",
        f"Total Questions: {len(session['questions'])}",
        f"",
        f"--- Q&A ---"
    ]
    
    for i, (q, a) in enumerate(zip(session["questions"], session["answers"]), 1):
        summary_lines.append(f"\nQ{i}: {q}")
        summary_lines.append(f"A{i}: {a}")
    
    summary_lines.append(f"\n=== END TRANSCRIPT ===")
    
    return "\n".join(summary_lines)
