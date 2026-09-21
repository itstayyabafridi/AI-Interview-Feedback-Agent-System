"""
Interviewer Agent - Conducts the mock interview.

This agent's instructions are dynamically generated based on:
- The candidate's target job role
- The candidate's experience level

The agent asks one question at a time, waits for answers,
and tracks the conversation to avoid repeats.
"""

from agents import Agent, handoff


def generate_interviewer_instructions(role: str, level: str, num_questions: int) -> str:
    """
    Dynamically generate instructions for the Interviewer Agent
    based on the candidate's role and experience level.
    
    Args:
        role: Target job role (e.g., "MERN Stack Developer")
        level: Experience level ("Junior", "Mid-Level", "Senior")
        num_questions: Total number of questions to ask
    
    Returns:
        str: Complete instructions string for the Agent
    """
    
    # Define question difficulty based on experience level
    level_guidance = {
        "Junior": (
            "Ask beginner to intermediate level questions. Focus on:\n"
            "- Fundamental concepts and basic syntax\n"
            "- Simple problem-solving scenarios\n"
            "- Basic understanding of frameworks and tools\n"
            "- Entry-level coding patterns\n"
            "- Basic debugging skills\n"
            "Avoid complex architecture or system design questions."
        ),
        "Mid-Level": (
            "Ask intermediate level questions. Focus on:\n"
            "- Practical application of concepts\n"
            "- Code optimization and best practices\n"
            "- Design patterns and their use cases\n"
            "- Database design and API architecture\n"
            "- Testing strategies and debugging complex issues\n"
            "- Some system design basics\n"
            "Balance between theoretical knowledge and practical experience."
        ),
        "Senior": (
            "Ask advanced level questions. Focus on:\n"
            "- System architecture and design decisions\n"
            "- Scalability, performance optimization\n"
            "- Complex debugging and troubleshooting scenarios\n"
            "- Leadership and mentoring approaches\n"
            "- Trade-offs in technical decisions\n"
            "- Production-level problem solving\n"
            "- Security considerations\n"
            "- Microservices, distributed systems, and DevOps practices\n"
            "Expect deep technical knowledge and real-world experience."
        )
    }
    
    # Define role-specific focus areas
    role_focus = {
        "MERN Stack Developer": "MongoDB, Express.js, React, Node.js, REST APIs, state management, component architecture",
        "Python Developer": "Python fundamentals, OOP, data structures, Flask/Django, testing, async programming, package management",
        "AI Engineer": "Machine learning, deep learning, NLP, model deployment, Python, TensorFlow/PyTorch, data preprocessing",
        "Frontend Developer": "HTML/CSS/JavaScript, React/Vue/Angular, responsive design, accessibility, performance optimization, state management",
        "Backend Developer": "API design, databases, server architecture, authentication, caching, microservices, message queues",
        "Full Stack Developer": "Both frontend and backend technologies, database design, API integration, deployment, CI/CD",
        "DevOps Engineer": "CI/CD pipelines, Docker, Kubernetes, cloud platforms (AWS/GCP/Azure), monitoring, infrastructure as code",
        "Data Scientist": "Statistics, Python/R, data visualization, ML algorithms, feature engineering, model evaluation, big data tools"
    }
    
    focus_area = role_focus.get(role, "general software development concepts")
    difficulty = level_guidance.get(level, level_guidance["Mid-Level"])
    
    instructions = f"""You are a professional technical interviewer conducting a mock interview.

INTERVIEW DETAILS:
- Candidate Role: {role}
- Experience Level: {level}
- Total Questions to Ask: {num_questions}

TECHNICAL FOCUS AREAS:
{focus_area}

QUESTION DIFFICULTY GUIDANCE:
{difficulty}

INTERVIEW RULES:
1. Ask ONLY ONE question at a time.
2. Wait for the candidate's answer before asking the next question.
3. You must ask exactly {num_questions} main questions total.
4. Do NOT repeat questions you have already asked.
5. You may ask brief follow-up questions if the answer needs clarification, but these count toward your {num_questions} total.
6. Keep your questions clear, specific, and relevant to the {role} role at the {level} level.
7. Be professional but encouraging.
8. Start by greeting the candidate and asking your first question.

TRACKING:
- Keep track of which questions you have asked.
- After each answer, briefly acknowledge it (1 sentence max) then ask the next question.
- After you have asked all {num_questions} questions, say: "INTERVIEW_COMPLETE" on its own line, then provide a brief thank-you message.

IMPORTANT: When you have finished asking all {num_questions} questions, you MUST include "INTERVIEW_COMPLETE" in your response so the system knows to hand off to the Feedback Agent.

Begin the interview now. Greet the candidate by name and ask your first question."""

    return instructions


def create_interviewer_agent(role: str, level: str, num_questions: int, feedback_agent: Agent) -> Agent:
    """
    Create the Interviewer Agent with dynamic instructions.
    
    The agent is configured with a handoff to the Feedback Agent,
    which will be triggered after the interview is complete.
    
    Args:
        role: Target job role
        level: Experience level
        num_questions: Number of questions to ask
        feedback_agent: The Feedback Agent to hand off to
    
    Returns:
        Agent: Configured Interviewer Agent
    """
    instructions = generate_interviewer_instructions(role, level, num_questions)
    
    interviewer = Agent(
        name="Interviewer Agent",
        instructions=instructions,
        handoffs=[
            handoff(
                agent=feedback_agent,
                tool_description_override=(
                    "Transfer the interview to the Feedback Agent for evaluation. "
                    "Use this ONLY after the interview is complete (all questions asked)."
                )
            )
        ],
    )
    
    return interviewer
