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
- Interactive UI using Streamlit

## Demo

### CLI Output
- Detects missing fields
- Suggests fixes
- Applies correction
- Retries request successfully

## Example

### Input

```json
{
  "email": "test@example.com"
}

### Output
Detects missing required field: password
Suggests fix: add "password" to request body
Automatically adds missing field (self-healing)
Retries request successfully with corrected data

### Tech Stack
Python
Streamlit
Requests
Modular Architecture (Rules Engine + Analyzer + AI Engine)

### UI Demo
Run:

```bash
streamlit run app.py
