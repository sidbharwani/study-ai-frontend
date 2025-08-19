# Study AI - Frontend
This is the **frontend** for my summer project **Study AI**, a web app that is built to make studying faster, responsive, and more effective. 
This frontend is built with **HTML, CSS, and JavaScript**, and connects to a **Cloudfare Worker backend** that calls the **OpenAI Api**.

This app allows you to: 
* Generate **flashcards**
* Create **practice tessts**
* Build **study guides**
* Get **step-by-step solutions**


<img width="1315" height="880" alt="Screenshot 2025-08-18 at 12 38 23 PM" src="https://github.com/user-attachments/assets/7b0cb0c8-8138-43a6-aceb-fd908b33e192" />

---
## Tech Stack 
* **HTML, CSS, JavaScript**
* **Cloudfare Workers** (backend API, in separate repo)

---
## Setup
1. Clone the repository: 
```bash
git clone https://github.com/sidbharwani/study-ai-frontend.git
cd study-ai-frontend
```
2. Open index.html in a browser
3. To link with the backend, update script.js:
```bash
const BACKEND_URL = "https://study-ai-backend.<your-cloudflare-subdomain>.workers.dev";
```
---
## Why I Built This? 
Most study platforms (Quizlet, Kahoot, Chegg), even though use AI to make  preparation of guides, flashcards, and tests easier and faster, I wanted to make an AI chat-centric interface so that without learning the platform, one can automatically shoot a text to AI and instruct it to do the following features mentioned above. 

With **Study AI**, you can type your topic, and AI instantly creates ready-to-use study content. 

This backend powers that experience - securely, reliably, and at scale. 

---
## Related Repositories
Frontend: [study-ai-frontend](https://github.com/sidbharwani/study-ai-frontend)
