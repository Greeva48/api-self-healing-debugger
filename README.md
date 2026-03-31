# ⚡ Self-Healing API Debugger (Prototype)

🚀 Built as part of my Google Summer of Code 2026 proposal for API Dash.

## Overview

This project demonstrates an intelligent API debugging system that can:
- Detect issues in API requests
- Suggest fixes
- Automatically apply self-healing
- Retry requests to achieve success

## Features

- Rule-based API debugging
- AI-like suggestion generation
- Self-healing request modification
- Automatic retry mechanism
- Simple UI using Streamlit

## Demo

### CLI Output
- Detects missing fields
- Suggests fixes
- Applies correction
- Retries request successfully

### UI
- Input API URL and data
- View issues, suggestions, and final response

## Example

Input:
{
  "email": "test@example.com"
}

Output:
- Detects missing password
- Suggests fix
- Auto-adds password
- Retries successfully

## Goal

To demonstrate feasibility of an intelligent, agentic API debugging and optimization system.