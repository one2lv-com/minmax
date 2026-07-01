from google import genai
from google.genai import types
import requests
import sys

API_URL = "http://127.0.0.1:3000/api/reactor"

client = genai.Client()

def send(event, data):
    try:
        requests.post(API_URL, json={
            "event": event,
            "data": data
        })
    except Exception as e:
        print("Send error:", e)

def run(prompt):

    response = client.models.generate_content(
        model="gemini-3-flash-preview",
        contents=prompt,
        config=types.GenerateContentConfig(
            tools=[types.Tool(code_execution=types.ToolCodeExecution)]
        ),
    )

    text_out = ""
    code_out = ""
    result_out = ""

    for part in response.candidates[0].content.parts:
        if part.text:
            text_out += part.text + "\n"
        if part.executable_code:
            code_out += part.executable_code.code + "\n"
        if part.code_execution_result:
            result_out += part.code_execution_result.output + "\n"

    print("🧠 TEXT:\n", text_out)
    print("⚙️ CODE:\n", code_out)
    print("📊 RESULT:\n", result_out)

    send("gemini_code", {
        "prompt": prompt,
        "text": text_out,
        "code": code_out,
        "result": result_out
    })

if __name__ == "__main__":
    prompt = sys.argv[1] if len(sys.argv) > 1 else "Calculate something"
    run(prompt)
