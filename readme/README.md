# Penn Robotics Website Docs

This folder explains how the system works for someone who has never seen the codebase.

## Start here
- Architecture: [readme/architecture.md](readme/architecture.md)
- Backend deep dive: [readme/backend.md](readme/backend.md)
- Frontend deep dive: [readme/frontend.md](readme/frontend.md)
- Backend routes catalog: [readme/backend-routes.md](readme/backend-routes.md)
- Ops and deployment: [readme/ops.md](readme/ops.md)
- Analysis and troubleshooting: [readme/analysis-guide.md](readme/analysis-guide.md)
- File catalog: [readme/file-catalog.md](readme/file-catalog.md)

## Safety note
- Backend code must never be deployed to Cloudflare. See [Backend/api/README.md](Backend/api/README.md).

## Quick orientation
- Frontend is a static HTML/SCSS/JS site hosted on Cloudflare Pages at https://pennrobotics.org. //not static for long hehe
- Backend is a Flask API hosted on the Hostinger VM at https://api.pennrobotics.org.
- The admin UI uses session cookies; the public site only reads posts and image slots from the API.

## Local setup
- Run [install-vscode-extensions.ps1](install-vscode-extensions.ps1) from PowerShell to install the documented VS Code extensions and the `animejs` frontend package:
	`& .\readme\install-vscode-extensions.ps1`
