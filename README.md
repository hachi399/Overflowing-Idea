<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/9d2543f3-9893-4e0f-a113-ede0fce3482f

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Deploy to GitHub Pages

1. Ensure the repo is pushed to GitHub on the `main` branch.
2. The workflow in `.github/workflows/gh-pages.yml` builds and deploys on every push to `main`.
3. You can also deploy locally with:
   `npm run deploy`
