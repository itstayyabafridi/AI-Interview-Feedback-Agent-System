"""
AI Mock Interview & Feedback Agent
===================================
A multi-agent CLI application using the OpenAI Agents SDK.

This application simulates a technical mock interview where:
1. An Interviewer Agent conducts the interview (with dynamic instructions)
2. After completion, the interview is handed off to a Feedback Agent
3. The Feedback Agent provides structured evaluation and improvement suggestions

Key Concepts Demonstrated:
- Dynamic Instructions (based on role & level)
- Session Management (JSON-based storage)
- Agent Handoff (Interviewer → Feedback)
- Multi-turn conversation management
"""

import asyncio
import sys
from agents import Agent, Runner

from config import (
    OPENAI_API_KEY,
    MODEL_NAME,
    VALID_LEVELS,
    VALID_ROLES,
    MIN_QUESTIONS,
    MAX_QUESTIONS,
)
from agents.interviewer import create_interviewer_agent
from agents.feedback import create_feedback_agent
from utils.session_manager import (
    create_session,
    save_session,
    add_question_answer,
    mark_session_complete,
    add_feedback,
    get_session_summary,
)


def print_header():
    """Print the application header."""
    print("\n" + "=" * 60)
    print("   🤖 AI MOCK INTERVIEW & FEEDBACK AGENT")
    print("   Powered by OpenAI Agents SDK")
    print("=" * 60 + "\n")


def get_user_input():
    """
    Collect user setup information.
    
    Returns:
        tuple: (candidate_name, role, level, num_questions)
    """
    print("📝 Let's set up your mock interview!\n")
    
    # Get candidate name
    name = input("👤 Your Name: ").strip()
    while not name:
        print("  ⚠️  Please enter your name.")
        name = input("👤 Your Name: ").strip()
    
    # Get target role
    print("\n🎯 Available Roles:")
    for i, role in enumerate(VALID_ROLES, 1):
        print(f"   {i}. {role}")
    print(f"   Or type a custom role.")
    
    role_input = input("\nSelect role (number or name): ").strip()
    
    if role_input.isdigit() and 1 <= int(role_input) <= len(VALID_ROLES):
        role = VALID_ROLES[int(role_input) - 1]
    else:
        role = role_input if role_input else "Software Developer"
    
    # Get experience level
    print(f"\n📊 Experience Level:")
    for i, level in enumerate(VALID_LEVELS, 1):
        print(f"   {i}. {level}")
    
    level_input = input("\nSelect level (number or name): ").strip()
    
    if level_input.isdigit() and 1 <= int(level_input) <= len(VALID_LEVELS):
        level = VALID_LEVELS[int(level_input) - 1]
    elif level_input in VALID_LEVELS:
        level = level_input
    else:
        level = "Mid-Level"
        print(f"  ⚠️  Invalid level. Defaulting to {level}.")
    
    # Get number of questions
    print(f"\n❓ Number of Questions ({MIN_QUESTIONS}-{MAX_QUESTIONS}):")
    num_input = input("Enter number: ").strip()
    
    try:
        num_questions = int(num_input)
        num_questions = max(MIN_QUESTIONS, min(MAX_QUESTIONS, num_questions))
    except ValueError:
        num_questions = 5
        print(f"  ⚠️  Invalid number. Defaulting to {num_questions}.")
    
    return name, role, level, num_questions


def display_setup_summary(name: str, role: str, level: str, num_questions: int):
    """Display a summary of the interview setup."""
    print("\n" + "-" * 40)
    print("📋 Interview Setup Summary:")
    print(f"   Candidate: {name}")
    print(f"   Role: {role}")
    print(f"   Level: {level}")
    print(f"   Questions: {num_questions}")
    print("-" * 40)
    print("\n🚀 Starting interview...\n")


async def run_interview(session: dict, interviewer: Agent, feedback_agent: Agent):
    """
    Run the multi-turn interview conversation.
    
    This function manages the conversation loop:
    1. Sends user input to the Interviewer Agent
    2. Displays the agent's response
    3. Records questions and answers in the session
    4. Continues until the interview is complete
    5. Hands off to the Feedback Agent
    
    Args:
        session: Session data dictionary
        interviewer: The Interviewer Agent
        feedback_agent: The Feedback Agent
    """
    print("🎤 INTERVIEW STARTED")
    print("=" * 40)
    
    # Track conversation history
    conversation_history = []
    question_count = 0
    current_question = None
    interview_complete = False
    
    # Get the initial greeting/first question from the interviewer
    result = await Runner.run(
        interviewer,
        input=f"Begin the interview with {session['candidate_name']}. "
              f"They are applying for a {session['level']} {session['role']} position. "
              f"Ask {len(range(session.get('_num_questions', 5)))} questions.",
        model_settings={"model": MODEL_NAME},
    )
    
    response = result.final_output
    print(f"\n🤖 Interviewer: {response}\n")
    
    # Check if interview is already complete (unlikely on first turn)
    if "INTERVIEW_COMPLETE" in response:
        interview_complete = True
    else:
        # Extract the first question
        current_question = response
    
    # Main conversation loop
    while not interview_complete:
        # Get user's answer
        user_answer = input("👤 Your Answer: ").strip()
        
        if not user_answer:
            print("  ⚠️  Please provide an answer.")
            continue
        
        # Check for quit command
        if user_answer.lower() in ["quit", "exit", "stop"]:
            print("\n🛑 Interview stopped by user.")
            interview_complete = True
            break
        
        # Record the Q&A pair
        if current_question:
            add_question_answer(session, current_question, user_answer)
            question_count += 1
        
        # Build conversation history for next turn
        conversation_history = result.to_input_list()
        conversation_history.append({"role": "user", "content": user_answer})
        
        # Send to interviewer for next question
        result = await Runner.run(
            interviewer,
            input=conversation_history,
            model_settings={"model": MODEL_NAME},
        )
        
        response = result.final_output
        print(f"\n🤖 Interviewer: {response}\n")
        
        # Check if interview is complete
        if "INTERVIEW_COMPLETE" in response:
            interview_complete = True
            # Clean up the response for display
            clean_response = response.replace("INTERVIEW_COMPLETE", "").strip()
            if clean_response:
                print(f"🤖 Interviewer: {clean_response}\n")
        else:
            current_question = response
    
    print("\n" + "=" * 40)
    print(f"✅ Interview Complete! ({question_count} questions answered)")
    print("=" * 40 + "\n")
    
    return session


async def get_feedback(session: dict, feedback_agent: Agent) -> str:
    """
    Get feedback from the Feedback Agent.
    
    Args:
        session: Completed session data
        feedback_agent: The Feedback Agent
    
    Returns:
        str: Feedback text
    """
    print("🔄 Handing off interview to Feedback Agent...\n")
    print("⏳ Analyzing your performance (this may take a moment)...\n")
    
    # Create the interview transcript
    transcript = get_session_summary(session)
    
    # Run the Feedback Agent
    result = await Runner.run(
        feedback_agent,
        input=f"Please evaluate this interview transcript and provide detailed feedback:\n\n{transcript}",
        model_settings={"model": MODEL_NAME},
    )
    
    feedback = result.final_output
    return feedback


async def main():
    """Main application entry point."""
    # Check for API key
    if not OPENAI_API_KEY:
        print("\n❌ ERROR: OPENAI_API_KEY not found!")
        print("   Please create a .env file with your API key.")
        print("   See .env.example for the format.\n")
        sys.exit(1)
    
    print_header()
    
    # Step 1: Get user setup
    name, role, level, num_questions = get_user_input()
    display_setup_summary(name, role, level, num_questions)
    
    # Step 2: Create session
    session = create_session(name, role, level)
    session["_num_questions"] = num_questions  # Internal tracking
    print(f"📁 Session ID: {session['session_id']}\n")
    
    # Step 3: Create agents
    # First create the Feedback Agent (it needs to exist before the Interviewer references it)
    feedback_agent = create_feedback_agent()
    
    # Then create the Interviewer Agent with dynamic instructions and handoff
    interviewer = create_interviewer_agent(role, level, num_questions, feedback_agent)
    
    print("🧠 Agents initialized:")
    print(f"   • Interviewer Agent (dynamic instructions for {level} {role})")
    print(f"   • Feedback Agent (ready for evaluation)")
    print()
    
    try:
        # Step 4: Run the interview
        session = await run_interview(session, interviewer, feedback_agent)
        
        # Step 5: Mark session complete and save
        mark_session_complete(session)
        save_session(session)
        
        # Step 6: Get feedback (Agent Handoff result)
        feedback = await get_feedback(session, feedback_agent)
        
        # Step 7: Store feedback and save final session
        add_feedback(session, feedback)
        save_session(session)
        
        # Step 8: Display feedback
        print("\n" + "=" * 60)
        print("   📊 INTERVIEW FEEDBACK")
        print("=" * 60 + "\n")
        print(feedback)
        print("\n" + "=" * 60)
        print(f"   Session saved: {session['session_id']}")
        print("=" * 60 + "\n")
        
    except KeyboardInterrupt:
        print("\n\n🛑 Interview interrupted by user.")
        save_session(session)
        print("   Session progress saved.")
    except Exception as e:
        print(f"\n❌ Error: {e}")
        save_session(session)
        print("   Session saved before exit.")
        raise


if __name__ == "__main__":
    asyncio.run(main())
