
# UBC-Newcomers
I came to UBC as a transfer student and had a tough time fitting in. Feeling overwhelmed of being in a place I had never been, knew no one and had no idea what to do. To solve this we are building the first spontaneous connection app at UBC. Created to help the transfer, international and first year students all meet each other and build connections to this beautiful community.

UBC - Newcomers is an app for new UBC students who are coming on campus for the first time and do not know anyone, but want to meet new people and explore the campus. The users are transfer, international and first year students who may not know anyone. The impact is to help new students have an easier time meeting new people and feel part of the UBC community.
## App Demo

### Exploration & Mapping
The core experience centers around an interactive map. Users can discover real-time events, landmarks, and connected peers across the campus.

<p align="center">
  <img src="https://github.com/user-attachments/assets/f5a7960c-d761-4cd1-b698-a73ed45ace5e" width="30%" alt="Login and Map View" />
  <img src="https://github.com/user-attachments/assets/9b24fece-f452-4cb4-ace9-f152b7a81df7" width="30%" alt="Unlock Zone" />
  <img src="https://github.com/user-attachments/assets/7f04d437-3586-4d62-8bea-70495e7813d8" width="30%" alt="Exploration Stats" />
</p>

*   **Dynamic Zones:** Each landmark is surrounded by a geofence. Entering a zone triggers an "Unlock" prompt.
*   **Gamified Progress:** Unlocking new areas updates your personal exploration stats, encouraging you to discover every corner of the campus.

---

### Event Discovery & Relevancy
Stay updated without checking multiple platforms. We aggregate data directly from the sources students actually use.

<p align="center">
  <img src="https://github.com/user-attachments/assets/e5a6c74c-c34a-4a7c-82bb-66e8eecdd784" width="35%" alt="Events Feed" />
</p>

*   **Smart Scraping:** Automated pulling of upcoming events from club Instagram pages and faculty newsletters.
*   **Personalized Feed:** Events are ranked with a **Relevancy Rating** based on your unique profile interests.

---

### Smart Connections
Finding your community on a large campus is simplified through AI-driven matching.

<p align="center">
  <img src="https://github.com/user-attachments/assets/945ba3d2-debf-40cb-ad0b-a83d2fdb1110" width="35%" alt="Connections" />
</p>

*   **Real-time Interaction:** Once a connection request is accepted, users can share locations to facilitate quick meet-ups.
*   **AI Matchmaking:** We utilize **Claude Sonnet 4.6** to analyze profile metrics—including interests, hobbies, faculty, and year level—to determine similarity scores and suggest potential connections.

### AWS Services

ECS - Backend
Cognito - login/registration
Bedrock - Person compatibility matching
S3 - Image Storage

### Architecture
<img width="841" height="531" alt="UBC-Newcomer drawio" src="https://github.com/user-attachments/assets/99e0e431-ff41-43e2-90ca-d6468ebc8a3b" />
