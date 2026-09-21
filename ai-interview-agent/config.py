"""
Configuration file for the AI Mock Interview Agent.
Loads environment variables and defines application settings.
"""

import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# OpenAI API Key - MUST be set in .env file or environment
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

# Model to use for agents
MODEL_NAME = os.getenv("MODEL_NAME", "gpt-4o-mini")

# Session storage directory
SESSIONS_DIR = os.path.join(os.path.dirname(__file__), "sessions")

# Interview settings
VALID_LEVELS = ["Junior", "Mid-Level", "Senior"]
VALID_ROLES = [
    "MERN Stack Developer",
    "Python Developer",
    "AI Engineer",
    "Frontend Developer",
    "Backend Developer",
    "Full Stack Developer",
    "DevOps Engineer",
    "Data Scientist",
]
MIN_QUESTIONS = 3
MAX_QUESTIONS = 10
