/*
 * main.js
 * Vanilla JS behaviour for the Nmap Enumeration Lab documentation site.
 * No build step, no dependencies. Everything below is scoped so this file
 * can be dropped into any page in the project.
 */
(function () {
  "use strict";

  /* -----------------------------------------------------------------
   * 1. Reading progress bar
   * --------------------------------------------------------------- */
  function initProgressBar() {
    var bar = document.getElementById("progress-bar");
    if (!bar) return;
    function update() {
      var doc = document.documentElement;
      var scrollTop = doc.scrollTop || document.body.scrollTop;
      var height = doc.scrollHeight - doc.clientHeight;
      var pct = height > 0 ? (scrollTop / height) * 100 : 0;
      bar.style.width = pct + "%";
    }
    document.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    update();
  }

  /* -----------------------------------------------------------------
   * 2. Mobile sidebar toggle
   * --------------------------------------------------------------- */
  function initMobileNav() {
    var toggle = document.querySelector(".menu-toggle");
    var sidebar = document.querySelector(".sidebar");
    if (!toggle || !sidebar) return;
    toggle.addEventListener("click", function () {
      var open = sidebar.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    sidebar.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        sidebar.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
    document.addEventListener("click", function (e) {
      if (sidebar.classList.contains("open") &&
          !sidebar.contains(e.target) && e.target !== toggle) {
        sidebar.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  /* -----------------------------------------------------------------
   * 3. Highlight current sidebar entry based on file name
   * --------------------------------------------------------------- */
  function initCurrentNav() {
    var here = location.pathname.split("/").pop() || "index.html";
    document.querySelectorAll(".sidebar nav a").forEach(function (a) {
      var target = a.getAttribute("href").split("#")[0] || "index.html";
      if (target === here) a.classList.add("current");
    });
  }

  /* -----------------------------------------------------------------
   * 4. Table of contents — scrollspy
   * --------------------------------------------------------------- */
  function initToc() {
    var tocLinks = Array.prototype.slice.call(document.querySelectorAll(".toc a"));
    if (!tocLinks.length) return;
    var targets = tocLinks
      .map(function (a) {
        var id = a.getAttribute("href").replace("#", "");
        return { link: a, el: document.getElementById(id) };
      })
      .filter(function (t) { return t.el; });

    function setActive() {
      var fromTop = window.scrollY + 120;
      var current = targets[0];
      targets.forEach(function (t) {
        if (t.el.offsetTop <= fromTop) current = t;
      });
      tocLinks.forEach(function (a) { a.classList.remove("active"); });
      if (current) current.link.classList.add("active");
    }
    document.addEventListener("scroll", setActive, { passive: true });
    setActive();
  }

  /* -----------------------------------------------------------------
   * 5. Back-to-top button
   * --------------------------------------------------------------- */
  function initBackToTop() {
    var btn = document.getElementById("back-to-top");
    if (!btn) return;
    function toggle() {
      if (window.scrollY > 600) btn.classList.add("visible");
      else btn.classList.remove("visible");
    }
    document.addEventListener("scroll", toggle, { passive: true });
    btn.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
    toggle();
  }

  /* -----------------------------------------------------------------
   * 6. Terminal blocks — copy / expand / collapse / typing toggle
   * --------------------------------------------------------------- */
  function initTerminals() {
    document.querySelectorAll(".terminal").forEach(function (term) {
      var copyBtn = term.querySelector(".js-copy");
      var expandBtn = term.querySelector(".js-expand");
      var collapseBtn = term.querySelector(".js-collapse");
      var pre = term.querySelector("pre");

      if (copyBtn && pre) {
        copyBtn.addEventListener("click", function () {
          var text = pre.innerText;
          navigator.clipboard.writeText(text).then(function () {
            var original = copyBtn.textContent;
            copyBtn.textContent = "Copied";
            copyBtn.classList.add("copied");
            setTimeout(function () {
              copyBtn.textContent = original;
              copyBtn.classList.remove("copied");
            }, 1600);
          }).catch(function () {
            copyBtn.textContent = "Press Ctrl+C";
          });
        });
      }

      if (expandBtn) {
        expandBtn.addEventListener("click", function () {
          term.classList.remove("collapsed");
          term.classList.add("expanded");
        });
      }
      if (collapseBtn) {
        collapseBtn.addEventListener("click", function () {
          term.classList.add("collapsed");
          term.classList.remove("expanded");
        });
      }
    });
  }

  /* -----------------------------------------------------------------
   * 7. Typing animation for the first command line of each terminal
   *    Respects a global "animations off" preference and
   *    prefers-reduced-motion.
   * --------------------------------------------------------------- */
  function initTypingAnimation() {
    var toggle = document.getElementById("animation-toggle");
    var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    function getStoredPreference() {
      try { return window.localStorage.getItem("nmaplab-animate"); }
      catch (e) { return null; }
    }
    function storePreference(value) {
      try { window.localStorage.setItem("nmaplab-animate", value); }
      catch (e) { /* storage unavailable — animation preference just won't persist */ }
    }

    var enabled = !reduceMotion && getStoredPreference() !== "off";

    function applyState() {
      document.querySelectorAll(".terminal[data-animate-line]").forEach(function (term) {
        var line = term.querySelector("[data-animate-line]");
        if (!line) return;
        if (!enabled) {
          line.classList.add("done");
          return;
        }
        if (line.classList.contains("done") || line.classList.contains("running")) return;
        var full = line.getAttribute("data-full-text") || line.textContent;
        line.textContent = "";
        line.classList.add("running");
        var cursor = document.createElement("span");
        cursor.className = "typing-cursor";
        line.appendChild(cursor);
        var i = 0;
        var speed = 16;
        (function tick() {
          if (i <= full.length) {
            line.textContent = full.slice(0, i);
            line.appendChild(cursor);
            i++;
            setTimeout(tick, speed);
          } else {
            line.classList.add("done");
          }
        })();
      });
    }

    if (toggle) {
      toggle.checked = enabled;
      toggle.addEventListener("change", function () {
        enabled = toggle.checked;
        storePreference(enabled ? "on" : "off");
      });
    }

    // Only animate the very first terminal on the page, once, on load —
    // subsequent terminals render immediately so long labs stay readable.
    var first = document.querySelector(".terminal[data-animate-line]");
    if (first && enabled) {
      var line = first.querySelector("[data-animate-line]");
      var full = line.textContent;
      line.setAttribute("data-full-text", full);
      applyState();
    } else if (first) {
      first.querySelector("[data-animate-line]").classList.add("done");
    }
  }

  /* -----------------------------------------------------------------
   * 8. Site search
   *    Builds an in-memory index from elements marked
   *    data-search-title / data-search-section on first use.
   * --------------------------------------------------------------- */
  function initSearch() {
    var input = document.getElementById("site-search");
    var results = document.getElementById("search-results");
    if (!input || !results) return;

    var index = Array.prototype.slice.call(document.querySelectorAll("[data-search-entry]")).map(function (el) {
      return {
        title: el.getAttribute("data-search-title") || el.textContent.trim(),
        section: el.getAttribute("data-search-section") || "",
        href: el.getAttribute("data-search-href") || "#",
        text: (el.getAttribute("data-search-text") || "").toLowerCase()
      };
    });

    function render(query) {
      var q = query.trim().toLowerCase();
      if (!q) { results.classList.remove("open"); results.innerHTML = ""; return; }
      var matches = index.filter(function (item) {
        return item.title.toLowerCase().indexOf(q) !== -1 || item.text.indexOf(q) !== -1;
      }).slice(0, 8);

      results.innerHTML = "";
      if (!matches.length) {
        var empty = document.createElement("div");
        empty.className = "search-empty";
        empty.textContent = 'No results for "' + query + '"';
        results.appendChild(empty);
      } else {
        matches.forEach(function (m) {
          var a = document.createElement("a");
          a.href = m.href;
          a.innerHTML = "<strong>" + escapeHtml(m.title) + "</strong>" +
            (m.section ? '<br><span style="color:var(--text-faint);font-size:0.78rem;">' + escapeHtml(m.section) + "</span>" : "");
          results.appendChild(a);
        });
      }
      results.classList.add("open");
    }

    function escapeHtml(str) {
      var d = document.createElement("div");
      d.textContent = str;
      return d.innerHTML;
    }

    input.addEventListener("input", function () { render(input.value); });
    input.addEventListener("focus", function () { if (input.value) render(input.value); });
    document.addEventListener("click", function (e) {
      if (!results.contains(e.target) && e.target !== input) {
        results.classList.remove("open");
      }
    });
    input.addEventListener("keydown", function (e) {
      if (e.key === "Escape") { results.classList.remove("open"); input.blur(); }
    });
  }

  /* -----------------------------------------------------------------
   * 9. Figure zoom (click-to-expand placeholders / images)
   * --------------------------------------------------------------- */
  function initFigureZoom() {
    document.querySelectorAll("figure[data-zoomable]").forEach(function (fig) {
      fig.addEventListener("click", function () {
        fig.classList.toggle("zoomed");
      });
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initProgressBar();
    initMobileNav();
    initCurrentNav();
    initToc();
    initBackToTop();
    initTerminals();
    initTypingAnimation();
    initSearch();
    initFigureZoom();
  });
})();
