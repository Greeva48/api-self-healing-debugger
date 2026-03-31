def check_missing_fields(data):
    required_fields = ["email", "password"]
    missing = [field for field in required_fields if field not in data]

    if missing:
        return {
            "error": f"Missing required fields: {', '.join(missing)}",
            "suggestion": f"Add fields: {', '.join(missing)}"
        }
    return None


def check_invalid_json(data):
    if not isinstance(data, dict):
        return {
            "error": "Invalid JSON format",
            "suggestion": "Ensure request body is a valid JSON object"
        }
    return None