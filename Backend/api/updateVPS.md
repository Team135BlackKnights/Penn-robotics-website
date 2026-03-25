# VPS File Updater

Pulls the latest files from GitHub and replaces the ones on the VPS.

This is how you actually update the live production VPS, allowing your changes to actually affect the production https://api.pennrobotics.org.

By following these instructions (just runnning a script), everything will be updated for you.

---

## Location
Script is saved at: `/root/api/update.sh`
Files are updated in: `/root/api/`

---

## Files That Will Be Auto-Updated
| File | Purpose |
|------|---------|
| `api.py` | Main Flask API |
| `databaseMain.py` | Database logic |
| `image_keys.json` | Image key mappings |
| `installflask.py` | Flask install helper |

Source: `https://github.com/Team135BlackKnights/Penn-robotics-website/tree/main/Backend/api`

---

## Usage
```bash
cd api
./update.sh
```
That's it! The files are now updated.

---

## How It Works
1. Loops through each file
2. Fetches the raw file from GitHub (`main` branch)
3. Overwrites the existing file on the VPS

---

## Notes
- Pulls from the `main` branch only
- Repo must be public (no auth token needed)
- To add a file, add its name to the `FILES` array in `update.sh`
- You can edit the actual `update.sh` script by doing `nano update.sh`
