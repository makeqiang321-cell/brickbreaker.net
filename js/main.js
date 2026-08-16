/**
 * BRICKBREAKER.NET — Retro Arcade Theme
 * Floating nav hover/scroll logic, game controls, mobile nav
 */
(function() {
    'use strict';

    var nav = document.getElementById('nav');
    var navLinks = document.getElementById('navLinks');
    var navToggle = document.getElementById('navToggle');
    var gameFrame = document.getElementById('gameFrame');
    var body = document.body;

    // ── Floating Nav: show on hover at top edge ─────
    var navShowTimeout;
    var HOVER_ZONE = 60; // px from top

    function showNav() {
        nav.classList.add('visible');
        clearTimeout(navShowTimeout);
    }

    function hideNav() {
        navShowTimeout = setTimeout(function() {
            // Don't hide if nav is being hovered directly or menu is open
            if (!nav.matches(':hover') && !navLinks.classList.contains('open')) {
                nav.classList.remove('visible');
            }
        }, 400);
    }

    document.addEventListener('mousemove', function(e) {
        if (e.clientY <= HOVER_ZONE) {
            showNav();
        } else if (e.clientY > 80 && !nav.matches(':hover')) {
            hideNav();
        }
    });

    // Keep nav visible when hovering it directly
    nav.addEventListener('mouseenter', showNav);
    nav.addEventListener('mouseleave', function() {
        hideNav();
    });

    // Show nav when scrolling up
    var lastScrollY = 0;
    var scrollThreshold = 100;
    window.addEventListener('scroll', function() {
        var sy = window.scrollY;
        if (sy < lastScrollY && sy > scrollThreshold) {
            showNav();
        } else if (sy > lastScrollY && sy > 200 && !nav.matches(':hover')) {
            hideNav();
        }
        lastScrollY = sy;
    }, { passive: true });

    // ── Mobile Nav Toggle ───────────────────────────
    if (navToggle && navLinks) {
        navToggle.addEventListener('click', function(e) {
            e.stopPropagation();
            navLinks.classList.toggle('open');
            nav.classList.toggle('nav-open');
        });

        // Dropdown toggle for mobile (click instead of hover)
        var dropdownTrigger = document.querySelector('.nav-trigger');
        if (dropdownTrigger) {
            dropdownTrigger.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                this.parentElement.classList.toggle('dropdown-open');
            });
        }

        // Close when clicking a link
        navLinks.querySelectorAll('a').forEach(function(link) {
            link.addEventListener('click', function() {
                navLinks.classList.remove('open');
                nav.classList.remove('nav-open');
            });
        });

        // Close when clicking outside
        document.addEventListener('click', function(e) {
            if (!nav.contains(e.target)) {
                navLinks.classList.remove('open');
                nav.classList.remove('nav-open');
            }
        });
    }

    // ── Game iframe communication ───────────────────
    function postToGame(msg) {
        if (gameFrame && gameFrame.contentWindow) {
            gameFrame.contentWindow.postMessage(msg, '*');
        }
    }

    // ── Enlarge (fullscreen) buttons ────────────────
    function toggleFullscreen(el) {
        if (!el) return;
        if (document.fullscreenElement) {
            document.exitFullscreen();
        } else if (el.requestFullscreen) {
            el.requestFullscreen();
        } else if (el.webkitRequestFullscreen) {
            el.webkitRequestFullscreen();
        }
    }

    document.addEventListener('click', function(e) {
        var btn = e.target.closest('[data-enlarge]');
        if (!btn) return;
        toggleFullscreen(document.getElementById(btn.getAttribute('data-enlarge')));
    });

    // Keyboard shortcuts (F=fullscreen, R=restart, S=sound)
    document.addEventListener('keydown', function(e) {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

        switch(e.key.toLowerCase()) {
            case 'f':
                if (!e.ctrlKey && !e.metaKey) {
                    postToGame('fullscreen');
                    // Also toggle parent fullscreen if possible
                    if (document.fullscreenElement) {
                        document.exitFullscreen();
                    } else {
                        var el = gameFrame || document.documentElement;
                        if (el.requestFullscreen) el.requestFullscreen();
                        else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
                    }
                }
                break;
            case 'r':
                if (!e.ctrlKey && !e.metaKey) {
                    e.preventDefault();
                    postToGame('restart');
                }
                break;
            case 's':
                if (!e.ctrlKey && !e.metaKey) {
                    e.preventDefault();
                    postToGame('toggleSound');
                }
                break;
        }
    });

    // ── Visitor count (stored in localStorage) ──────
    var playCountEl = document.getElementById('playCount');
    if (playCountEl) {
        var stored = parseInt(localStorage.getItem('bbVisitors'), 10);
        var base = stored || 12340;
        var sessionVisits = parseInt(sessionStorage.getItem('bbSessionVisits'), 10) || 0;
        sessionVisits++;
        sessionStorage.setItem('bbSessionVisits', sessionVisits);
        var display = base + sessionVisits;
        playCountEl.textContent = display.toLocaleString();

        if (sessionVisits % 5 === 0) {
            localStorage.setItem('bbVisitors', display);
        }
    }

    // ── Scroll hint fade ────────────────────────────
    var scrollHint = document.querySelector('.hero-scroll-hint');
    if (scrollHint) {
        window.addEventListener('scroll', function() {
            if (window.scrollY > 60) {
                scrollHint.style.opacity = '0';
                scrollHint.style.transition = 'opacity 0.5s';
            } else {
                scrollHint.style.opacity = '';
            }
        }, { passive: true });
    }

    // ── CTA smooth scroll ───────────────────────────
    var ctaBtn = document.querySelector('.cta-btn');
    if (ctaBtn) {
        ctaBtn.addEventListener('click', function(e) {
            var target = document.querySelector(this.getAttribute('href'));
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    }

    console.log('🧱 BRICKBREAKER.NET — RETRO ARCADE READY');
})();
