Nmap Enumeration Lab — Documentation Site
A static, dependency-free documentation site walking through a real network
enumeration exercise performed with Nmap 7.94 against a small, intentionally
vulnerable lab network. Built for cybersecurity and CS students, beginners
learning ethical hacking, and IT professionals picking up Nmap for the first
time.
Live walkthrough: deploy to GitHub Pages and open `index.html`, or view
`lab.html` directly for the full command-by-command breakdown.
What's in here
The lab covers, in order:
Environment verification (`ifconfig`, `nmap -V`, `nmap -h`)
Host discovery across a `/24` with `nmap -sn`
A default port scan vs. an explicit `-sT` connect scan
OS fingerprinting with `-O`
Service/version detection and a look at timing templates (`-T4` vs `-T5`)
Aggressive scanning (`-A`) turning up an anonymous FTP login
SMB enumeration on ports 139/445, including a real typo and its fix
Targeted NSE scripts (`smb-enum-users`, `smb-enum-groups`, `smb-enum-shares`)
that surface a writable SMB share
Every terminal block reproduces the actual command output from the session,
including the mistakes — a mistyped `locate*.nse`, a stray space in a port
list, and a scan that had to be re-run. Nothing has been cleaned up to look
more polished than it actually was.
Project structure
```
.
├── index.html          # Landing page / project overview
├── lab.html            # Full walkthrough (the actual documentation)
├── styles/
│   └── main.css        # All styling — no framework, one stylesheet
├── scripts/
│   └── main.js         # Terminal controls, search, TOC scrollspy, progress bar
├── images/              # Screenshot placeholders live here (see images/README.md)
├── assets/              # Reserved for any additional static assets
├── fonts/               # Reserved if you want to self-host fonts instead of the Google Fonts CDN
├── README.md
└── LICENSE
```
Running it locally
This is a fully static site — no build step, no package manager, no bundler.
Clone the repo and open `index.html` in a browser, or serve it locally:
```bash
python3 -m http.server 8000
# then open http://localhost:8000
```
Deploying to GitHub Pages
Push this repository to GitHub.
In the repo settings, under Pages, set the source to the `main`
branch (root).
GitHub will publish the site at `https://<username>.github.io/<repo>/`.
No build configuration is required since there's nothing to compile.
Design notes
Dark mode only, styled after documentation sites like GitHub Docs and
Cloudflare Docs rather than a marketing landing page.
The recurring small monospace badges (`-sV`, `-A`, `-O`, …) are the site's
one deliberate visual signature — they're literally the Nmap flags being
documented, used as section markers instead of generic icons.
Terminal blocks use Kali's real prompt colors (green username, purple
hostname, red decorative characters) and support copy, expand/collapse,
and an optional typing animation that respects `prefers-reduced-motion`.
Typefaces are IBM Plex Sans (body/UI) and IBM Plex Mono (code/terminal),
loaded from Google Fonts — swap the `<link>` tags for self-hosted files in
`fonts/` if you'd rather not depend on the CDN.
Contributing
This documents one specific lab run, but corrections, clearer explanations,
and additional screenshots are welcome. Open a pull request or an issue.
License
Released under the MIT License — see LICENSE.
