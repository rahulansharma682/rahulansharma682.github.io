document.addEventListener('DOMContentLoaded', () => {
    // ----------------------------------------------------
    // 1. Theme Switcher Engine (Dark/Light Mode)
    // ----------------------------------------------------
    const themeToggleBtn = document.querySelector('.theme-toggle-btn');
    
    // Read cached preference or fallback to system dark preference
    const currentTheme = localStorage.getItem('theme') || 
                         (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
    
    // Apply theme on load
    if (currentTheme === 'light') {
        document.documentElement.setAttribute('data-theme', 'light');
    } else {
        document.documentElement.removeAttribute('data-theme');
    }

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            const isLight = document.documentElement.getAttribute('data-theme') === 'light';
            if (isLight) {
                document.documentElement.removeAttribute('data-theme');
                localStorage.setItem('theme', 'dark');
            } else {
                document.documentElement.setAttribute('data-theme', 'light');
                localStorage.setItem('theme', 'light');
            }
        });
    }

    // ----------------------------------------------------
    // 2. Mobile Responsive Menu Navigation
    // ----------------------------------------------------
    const menuToggleBtn = document.querySelector('.menu-toggle');
    const navLinksWrapper = document.querySelector('.nav-links-wrapper');

    if (menuToggleBtn && navLinksWrapper) {
        menuToggleBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            navLinksWrapper.classList.toggle('open');
            // Toggle hamburger icon between bars and times (close)
            const icon = menuToggleBtn.querySelector('i');
            if (icon) {
                if (navLinksWrapper.classList.contains('open')) {
                    icon.className = 'fas fa-times';
                } else {
                    icon.className = 'fas fa-bars';
                }
            }
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!navLinksWrapper.contains(e.target) && !menuToggleBtn.contains(e.target)) {
                navLinksWrapper.classList.remove('open');
                const icon = menuToggleBtn.querySelector('i');
                if (icon) icon.className = 'fas fa-bars';
            }
        });

        // Close menu when clicking a nav link
        navLinksWrapper.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navLinksWrapper.classList.remove('open');
                const icon = menuToggleBtn.querySelector('i');
                if (icon) icon.className = 'fas fa-bars';
            });
        });
    }

    // ----------------------------------------------------
    // 3. Navbar Scroll Visibility Toggle
    // ----------------------------------------------------
    const navbar = document.querySelector('.navbar');
    let lastScrollY = window.scrollY;

    window.addEventListener('scroll', () => {
        if (!navbar) return;
        const currentScrollY = window.scrollY;

        // Don't trigger scroll hide on tiny scroll shifts
        if (Math.abs(currentScrollY - lastScrollY) < 10) return;

        if (currentScrollY <= 80) {
            // Near top, show navbar without shadows
            navbar.classList.remove('scroll-down');
            navbar.classList.remove('scroll-up');
        } else if (currentScrollY > lastScrollY) {
            // Scrolling down, hide navbar
            navbar.classList.remove('scroll-up');
            navbar.classList.add('scroll-down');
        } else {
            // Scrolling up, show navbar with shadows
            navbar.classList.remove('scroll-down');
            navbar.classList.add('scroll-up');
        }
        lastScrollY = currentScrollY;
    }, { passive: true });

    // ----------------------------------------------------
    // 4. Live Search & Tag Filtering (Projects Page)
    // ----------------------------------------------------
    const searchInput = document.getElementById('project-search');
    const filterButtons = document.querySelectorAll('.filter-btn');
    const projectCards = document.querySelectorAll('.project-card');

    if (projectCards.length > 0) {
        let activeCategory = 'all';
        let searchQuery = '';

        const filterProjects = () => {
            projectCards.forEach(card => {
                const title = card.querySelector('h3').textContent.toLowerCase();
                const desc = card.querySelector('.project-card-desc').textContent.toLowerCase();
                
                // Collect tech tag text
                const tags = Array.from(card.querySelectorAll('.tech-tag, .tag'))
                                  .map(t => t.textContent.toLowerCase());
                
                // Check if card matches search query
                const matchesSearch = title.includes(searchQuery) || 
                                      desc.includes(searchQuery) || 
                                      tags.some(tag => tag.includes(searchQuery));

                // Check if card matches category tag
                // Categories mapped by data-category attribute
                const cardCategory = card.getAttribute('data-category') || '';
                const matchesCategory = (activeCategory === 'all') || (cardCategory === activeCategory);

                if (matchesSearch && matchesCategory) {
                    card.style.display = 'flex';
                    // Trigger fade-in visual class
                    setTimeout(() => {
                        card.style.opacity = '1';
                        card.style.transform = 'translateY(0)';
                    }, 50);
                } else {
                    card.style.opacity = '0';
                    card.style.transform = 'translateY(10px)';
                    card.style.display = 'none';
                }
            });
        };

        // Text Search trigger
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                searchQuery = e.target.value.toLowerCase().trim();
                filterProjects();
            });
        }

        // Category Tag click trigger
        filterButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                filterButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                activeCategory = btn.getAttribute('data-filter');
                filterProjects();
            });
        });
    }

    // ----------------------------------------------------
    // 5. BibTeX Viewer & Citation Clipboard (Publications)
    // ----------------------------------------------------
    const pubCards = document.querySelectorAll('.pub-card');
    
    // Create Toast Container on the fly if needed
    const showToast = (message) => {
        let toast = document.querySelector('.toast-wrap');
        if (!toast) {
            toast = document.createElement('div');
            toast.className = 'toast-wrap';
            document.body.appendChild(toast);
        }
        toast.innerHTML = `<i class="fas fa-check-circle"></i> <span>${message}</span>`;
        toast.classList.add('show');
        
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    };

    if (pubCards.length > 0) {
        pubCards.forEach(card => {
            const bibtexBtn = card.querySelector('.copy-bibtex-btn');
            const toggleBtn = card.querySelector('.toggle-bibtex-btn');
            const drawer = card.querySelector('.bibtex-drawer');
            const codeBlock = card.querySelector('.bibtex-code');

            if (toggleBtn && drawer) {
                toggleBtn.addEventListener('click', () => {
                    const isVisible = drawer.style.display === 'block';
                    drawer.style.display = isVisible ? 'none' : 'block';
                    toggleBtn.innerHTML = isVisible ? 
                        '<i class="fas fa-code"></i> Show BibTeX' : 
                        '<i class="fas fa-chevron-up"></i> Hide BibTeX';
                });
            }

            if (bibtexBtn && codeBlock) {
                bibtexBtn.addEventListener('click', () => {
                    const textToCopy = codeBlock.textContent.trim();
                    navigator.clipboard.writeText(textToCopy)
                        .then(() => {
                            showToast('BibTeX copied to clipboard!');
                        })
                        .catch(err => {
                            console.error('Failed to copy BibTeX: ', err);
                            // Fallback copy logic
                            const textarea = document.createElement('textarea');
                            textarea.value = textToCopy;
                            document.body.appendChild(textarea);
                            textarea.select();
                            try {
                                document.execCommand('copy');
                                showToast('BibTeX copied to clipboard!');
                            } catch (e) {
                                showToast('Copy failed. Please copy manually.');
                            }
                            document.body.removeChild(textarea);
                        });
                });
            }
        });
    }

    // ----------------------------------------------------
    // 5.1 Contact Form Client-Side Submission
    // ----------------------------------------------------
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const nameInput = document.getElementById('name');
            const emailInput = document.getElementById('email');
            const messageInput = document.getElementById('message');
            const submitBtn = contactForm.querySelector('.submit-btn');

            if (!nameInput.value.trim() || !emailInput.value.trim() || !messageInput.value.trim()) {
                showToast('Please fill out all required fields.');
                return;
            }

            // Client-side mock sending with premium animations
            const originalBtnHTML = submitBtn.innerHTML;
            submitBtn.disabled = true;
            submitBtn.innerHTML = `Sending Message... <i class="fas fa-spinner fa-spin"></i>`;
            submitBtn.style.opacity = '0.8';

            // Simulate server network latency
            setTimeout(() => {
                showToast('Message sent! I will get back to you soon.');
                contactForm.reset();
                submitBtn.disabled = false;
                submitBtn.innerHTML = `Message Sent! <i class="fas fa-check"></i>`;
                submitBtn.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)'; // Emerald Green Success

                // Reset button back to normal after a short delay
                setTimeout(() => {
                    submitBtn.innerHTML = originalBtnHTML;
                    submitBtn.style.background = '';
                    submitBtn.style.opacity = '';
                }, 3000);
            }, 1200);
        });
    }

    // ----------------------------------------------------
    // 6. Interactive Intersection Fade-In Effects
    // ----------------------------------------------------
    const observerOptions = {
        root: null,
        rootMargin: '0px 0px -50px 0px',
        threshold: 0.05
    };

    const intersectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
                intersectionObserver.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe timeline items and grid cards
    document.querySelectorAll('.timeline-item, .project-card, .pub-card, .contact-meta-card, .glass-card').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(15px)';
        el.classList.add('fade-in-ready');
        intersectionObserver.observe(el);
    });

    // Custom CSS for observed elements initialization to avoid flashes
    const styleEl = document.createElement('style');
    styleEl.innerHTML = `
        .fade-in-ready {
            transition: opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1), transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .fade-in-ready.fade-in {
            opacity: 1 !important;
            transform: translateY(0) !important;
        }
    `;
    document.head.appendChild(styleEl);
});