Render-ready Live Location App
==============================

Files:
- server.js           -- Express server + WebSocket relay
- package.json        -- dependencies and start script
- public/tracker.html -- tracker page (request location and send to server)
- public/viewer.html  -- viewer page (Leaflet map + table)

How to deploy to Render:
1. Create a GitHub repository and push this project (all files).
2. On Render.com, click "New" → "Web Service".
3. Connect your GitHub repo, select the repo.
4. For "Environment", choose Free.
5. For "Build Command" leave empty (Node project).
6. For "Start Command" use:
   node server.js
7. Render will detect the port from process.env.PORT automatically.
8. After deploying, open the provided HTTPS URL and visit:
   /tracker.html and /viewer.html

Notes:
- This demo is minimal and does not include authentication or persistence.
- For production: add HTTPS, auth, input validation, and a database.
- If the app is idle, free Render instances may sleep; open the URL to wake.
