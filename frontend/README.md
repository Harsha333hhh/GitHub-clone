# GitHub Clone - Frontend Client Interface (`/frontend`)

This is the Single Page Application (SPA) client interface for the full-stack GitHub Clone ecosystem. Built as a high-performance developer hub, it leverages modern React primitives compiled natively via Vite for near-instant Hot Module Replacement (HMR) and optimized build times.

##  Tech Stack & Ecosystem

- **Build Engine & Tooling:** [Vite](https://vite.dev/) (React configuration variant)
- **Core UI Layer:** React.js (Hooks, Context Providers, and Declarative SPA Layouts)
- **Global State Management:** [Zustand](https://github.com/pmndrs/zustand) (Atomic, high-performance, and reactive centralized stores)
- **Styling Framework:** Tailwind CSS (Utility-first compilation matching GitHub's distinct dark, light, and high-contrast developer aesthetic)
- **Networking/HTTP Engine:** Axios (Configured with custom configurations and token synchronization layers)

---

##  Workspace Directory Structure

frontend/
├── public/                  # Static standalone public assets (favicon, site vectors)
└── src/
    ├── api/                 # Network line baseline configurations
    │   └── axiosConfig.js   # Centralized Axios setup with authorization headers
    ├── store/               # Zustand atomic state-slice engines
    │   ├── authStore.js     # Global stateless authentication and token session tracking
    │   └── themeStore.js    # Persistent global skin configurations (Light / Dark orchestration)
    ├── components/          # Feature-driven presentation & layout modules
    │   ├── Landing.jsx      # Marketing gateway and entrance wireframe
    │   ├── Login.jsx / Signup.jsx # Authentication interaction forms
    │   ├── Dashboard.jsx    # Primary tracking view showing repositories and user streams
    │   ├── Profile.jsx      # Live developer portfolio grid and overview statistics
    │   ├── RepoExplorer.jsx # Tree navigation interface for code repositories
    │   ├── FileViewer.jsx   # Source code inspector viewport
    │   ├── Issues.jsx       # Tracking list for system updates and discussions
    │   ├── PullRequests.jsx # Viewport lists for branch integration events
    │   ├── PRDetail.jsx     # Detailed analytical layout for commit and review records
    │   └── Header.jsx / Footer.jsx # Global framework scaffolds
    ├── styles/              # Global variables, themes, and styling configurations
    ├── App.jsx              # Unified router orchestration engine
    └── main.jsx             # React DOM root orchestration entry point

Development Environment Setup
1. Supply Environment Ingress Tokens
Create a local tracking variable profile file inside your /frontend root directory named .env:

Code snippet
VITE_API_BASE_URL=http://localhost:5000/api
2. Initiate Package Bootstrap & Execution
Run the following shell routines to bring up the localized Vite orchestration server:

Bash
# Navigate safely to the client workspace scope
cd frontend

# Install the exact dependency matrices
npm install

# Run the local developer preview suite
npm run dev
The localized dev engine will initialize, mapping the active viewport directly to: http://localhost:5173/

 State Engineering Specifications
The system isolates shared browser side parameters across decentralized Zustand stores to bypass structural React prop-drilling:

authStore.js: Controls global user context arrays, coordinates continuous token storage mappings via localStorage, and handles user lifecycle switches seamlessly.

themeStore.js: Manages real-time UI theme switching. It directly toggles core Tailwind CSS elements (dark variations) across the application container, matching your exact preference setup for instantaneous design shifts.

 Bundling & Compiling Routines
To perform production asset optimization (including dead-code purging, mini-chunk maps, and asset shrinking layers), trigger the following script:

Bash
npm run build
This generates highly optimized static web assets inside a temporary distributional subpath structure (/frontend/dist).

 Cloud Deployment (Vercel)
The client application includes a pre-configured production rewrite manifest layout (/frontend/vercel.json) that manages SPA routing pipelines securely without encountering 404 Not Found loops during page reloads:

JSON
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
This layout can be deployed with zero additional configuration on Vercel simply by linking the repository.
