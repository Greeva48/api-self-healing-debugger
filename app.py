import streamlit as st
from analyzer import analyze_request
from ai_engine import generate_ai_suggestions, self_heal_request
import requests

st.set_page_config(
    page_title="Self-Healing API Debugger",
    page_icon="⚡"
)

st.title("⚡ Self-Healing API Debugger")
st.markdown("Automatically detect API issues, suggest fixes, and apply self-healing.")

url = st.text_input("API URL", "https://httpbin.org/post")
email = st.text_input("Email", "test@example.com")

if st.button("Run Debugger"):
    request_data = {"email": email}

    st.subheader("Initial Request")
    st.write(request_data)

    issues = analyze_request(request_data)

    if issues:
        st.subheader("Detected Issues")
        for issue in issues:
            st.error(issue["error"])
            st.info(issue["suggestion"])

        st.subheader("AI Suggestions")
        suggestions = generate_ai_suggestions(issues)
        for s in suggestions:
            st.write(s)

        healed_data = self_heal_request(request_data)

        st.subheader("Healed Request")
        st.write(healed_data)

        response = requests.post(url, json=healed_data)

        st.subheader("Final Response")
        st.success(f"Status: {response.status_code}")
        st.json(response.json())

    else:
        st.success("No issues detected!")