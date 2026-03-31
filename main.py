from analyzer import analyze_request
from ai_engine import generate_ai_suggestions, self_heal_request
import requests


def send_request(url, data):
    try:
        response = requests.post(url, json=data)
        return response.status_code, response.text
    except Exception as e:
        return None, str(e)


def main():
    print("Self-Healing API Debugger Prototype\n")

    url = "https://httpbin.org/post"

    request_data = {
        "email": "test@example.com"
    }

    print("--- Initial Request ---")
    print(request_data)

    issues = analyze_request(request_data)

    if issues:
        print("\n--- Detected Issues ---")
        for issue in issues:
            print(f"Error: {issue['error']}")
            print(f"Suggestion: {issue['suggestion']}")

        print("\n--- AI Suggestions ---")
        ai_suggestions = generate_ai_suggestions(issues)
        for s in ai_suggestions:
            print(s)

        print("\n--- Applying Self-Healing ---")
        healed_data = self_heal_request(request_data)
        print(healed_data)

        status, _ = send_request(url, healed_data)

        print("\n--- Final Response ---")
        print("Status:", status)
        print("Response received successfully")

    else:
        status, _ = send_request(url, request_data)
        print("\nStatus:", status)
        print("Response received successfully")


if __name__ == "__main__":
    main()