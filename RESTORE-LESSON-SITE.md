# Restore lesson site (before timers + copy updates)

If you want the site **exactly as before**, run in PowerShell from this folder:

```powershell
Copy-Item ".\Computing lesson 6.html.backup-before-lesson-updates" ".\Computing lesson 6.html" -Force
Copy-Item ".\Computing lesson 6_files\lesson-dial-nav.js.backup-before-lesson-updates" ".\Computing lesson 6_files\lesson-dial-nav.js" -Force
```

Then delete (optional):

- `Computing lesson 6_files/lesson-site-extras.js`
- `Computing lesson 6_files/lesson-site-extras.css`
- this file

Hard refresh the browser (Ctrl+F5).
