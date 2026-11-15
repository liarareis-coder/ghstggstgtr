<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/24e959cd-12cd-4d04-9d75-e5d52b7812f8

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`


## Deploy on Render

This app uses a Node.js/Express server and WebSockets. Deploy it as a **Web Service** (not a static site).

- Build command: `npm install && npm run build`
- Start command: `npm start`
- Add the environment variable `DEV_MODE_PASSWORD` in Render's Environment settings. Set its value to the same developer password you already use. Do not put the real value in this repository or in frontend files.
- The developer password is checked by `POST /api/dev-auth`; the server issues a temporary token for the current browser session.
- The app also uses Firebase. Configure the existing Firebase environment/settings and authorize the new Render domain in Firebase Authentication if Google sign-in is used.

The `.env.example` file contains only a placeholder. Never commit a real `.env` file or share the password in chat.
