import os
import sys

try:
	import google.generativeai as genai
except ImportError:
	print("google-generativeai not installed. Run: pip install google-generativeai", file=sys.stderr)
	sys.exit(1)


def main() -> int:
	api_key = os.getenv("GEMINI_API_KEY")
	if not api_key:
		print("GEMINI_API_KEY not set. Set it and re-run.", file=sys.stderr)
		return 1

	# Configure SDK
	genai.configure(api_key=api_key)

	model_name = os.getenv("GEMINI_MODEL", "gemini-1.5-flash")
	model = genai.GenerativeModel(model_name)

	prompt = "Reply with a short greeting mentioning 'Gemini API'."
	try:
		response = model.generate_content(prompt)
		text = getattr(response, "text", None)
		if not text:
			print("No text returned from model.", file=sys.stderr)
			return 2
		print(text.strip())
		return 0
	except Exception as exc:
		print(f"Error calling {model_name}: {exc}", file=sys.stderr)
		return 3


if __name__ == "__main__":
	sys.exit(main())


