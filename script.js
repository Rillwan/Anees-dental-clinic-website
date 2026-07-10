// Run the code only after the HTML page is fully loaded
document.addEventListener("DOMContentLoaded", () => {

    gsap.config({ nullTargetWarn: false });

    // Register GSAP plugins so we can use ScrollTrigger + SplitText
    gsap.registerPlugin(ScrollTrigger);

    // -----------------------------
    // Smooth scrolling setup (Lenis)
    // -----------------------------

    const lenis = new Lenis();

    // Sync Lenis scroll with GSAP ScrollTrigger
    lenis.on("scroll", ScrollTrigger.update);

    // Make GSAP update Lenis on every animation frame
    gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
    });

    // Disable lag smoothing for more accurate scroll animation
    gsap.ticker.lagSmoothing(0);


    /* ============================================================
       1. PRELOADER TIMELINE
       Trigger: fires immediately on window load.
       Draws the tooth icon stroke, fills the progress bar to 100%,
       then fades the preloader out and hands off to the hero timeline.
       ============================================================ */
    window.addEventListener('load', () => {
        const tooth = document.querySelector('#pl-tooth');
        const len = tooth.getTotalLength();
        gsap.set(tooth, { strokeDasharray: len, strokeDashoffset: len });

        const preTL = gsap.timeline({
            onComplete: () => {
                document.body.classList.remove('loading');
                gsap.to('#preloader', {
                    yPercent: -100, duration: 0.9, ease: 'power4.inOut',
                    onComplete: () => document.getElementById('preloader').remove()
                });
                heroTL.play(); // hand off to hero entrance
            }
        });

        preTL
            .to(tooth, { strokeDashoffset: 0, duration: 1.1, ease: 'power2.inOut' })
            .to('#pl-fill', { width: '100%', duration: 1.1, ease: 'power2.inOut' }, '<')
            .to('#preloader svg, #preloader .pl-label', { opacity: 0, duration: 0.3 }, '+=0.2');
    });

    /* ============================================================
       2. HERO ENTRANCE TIMELINE
       Trigger: paused on load, played once preloader completes.
       Staggers hero text/CTA elements upward with a fade,
       then reveals the trust strip.
       ============================================================ */
    const heroTL = gsap.timeline({ paused: true });
    heroTL
        .from('.hero-el', { y: 28, opacity: 0, duration: 0.8, ease: 'power3.out', stagger: 0.12 })
        .from('.trust-strip', { y: 30, opacity: 0, duration: 0.7, ease: 'power3.out' }, '-=0.3');

    /* ============================================================
       3. SCROLL-TRIGGERED SECTION REVEALS
       Trigger: each .reveal-up element animates once it is 85%
       into the viewport (standard editorial fade+rise pattern).
       ============================================================ */
    gsap.utils.toArray('.reveal-up').forEach((el) => {
        gsap.from(el, {
            y: 40, opacity: 0, duration: 0.9, ease: 'power3.out',
            scrollTrigger: { trigger: el, start: 'top 85%' }
        });
    });

    /* ============================================================
       4. SERVICES BENTO GRID — staggered card entrance
       Trigger: the services grid container crossing 80% viewport.
       ============================================================ */
    ScrollTrigger.batch('.service-card', {
        start: 'top 88%',
        onEnter: (batch) => gsap.from(batch, {
            y: 36, opacity: 0, duration: 0.7, ease: 'power3.out', stagger: 0.12
        })
    });

    /* ============================================================
       5. DOCTOR SECTION — portrait slides in from left,
       credential rows stagger in from the right independently.
       ============================================================ */
    gsap.from('.doctor-portrait', {
        x: -40, opacity: 0, duration: 1, ease: 'power3.out',
        scrollTrigger: { trigger: '.doctor-portrait', start: 'top 80%' }
    });
    gsap.from('.doctor-cred', {
        x: 30, opacity: 0, duration: 0.6, ease: 'power3.out', stagger: 0.1,
        scrollTrigger: { trigger: '#doctor', start: 'top 65%' }
    });

    /* ============================================================
       6. TESTIMONIAL CAROUSEL
       Trigger: prev/next button clicks slide the flex track;
       dot indicators sync to the active slide index.
       ============================================================ */
    (() => {
        const track = document.getElementById('testimonialTrack');
        const cards = track.querySelectorAll('.testi-card');
        const dots = document.querySelectorAll('.dot');
        let index = 0;

        function getStep() {
            // one card width + gap, matches current breakpoint
            return cards[0].getBoundingClientRect().width + 24;
        }

        function goTo(i) {
            const max = window.innerWidth >= 1024 ? cards.length - 3 : window.innerWidth >= 640 ? cards.length - 2 : cards.length - 1;
            index = Math.max(0, Math.min(i, Math.max(max, 0)));
            gsap.to(track, { x: -index * getStep(), duration: 0.6, ease: 'power3.out' });
            dots.forEach((d, di) => d.classList.toggle('bg-gold', di === index));
            dots.forEach((d, di) => d.classList.toggle('bg-white/25', di !== index));
        }

        document.getElementById('nextBtn').addEventListener('click', () => goTo(index + 1));
        document.getElementById('prevBtn').addEventListener('click', () => goTo(index - 1));
        dots.forEach((d) => d.addEventListener('click', () => goTo(parseInt(d.dataset.i))));
    })();

    /* ============================================================
       7. MOBILE NAV TOGGLE
       ============================================================ */
    const menuBtn = document.getElementById('menuBtn');
    const mobileNav = document.getElementById('mobileNav');
    menuBtn.addEventListener('click', () => {
        const isOpen = mobileNav.classList.toggle('flex');
        mobileNav.classList.toggle('hidden');
        menuBtn.setAttribute('aria-expanded', isOpen);
    });
    document.querySelectorAll('.mobile-link').forEach((l) => {
        l.addEventListener('click', () => { mobileNav.classList.add('hidden'); mobileNav.classList.remove('flex'); });
    });

    /* ============================================================
       8. SMOOTH-SCROLL NAV LINKS via GSAP ScrollToPlugin
       ============================================================ */
    document.querySelectorAll('a[href^="#"]').forEach((link) => {
        link.addEventListener('click', (e) => {
            const target = document.querySelector(link.getAttribute('href'));
            if (!target) return;
            e.preventDefault();
            gsap.to(window, { duration: 1, ease: 'power3.inOut', scrollTo: { y: target, offsetY: 76 } });
        });
    });

    /* ============================================================
       9. WHATSAPP FLOAT — subtle pulse to draw attention
       ============================================================ */
    gsap.to('#waBtn', { scale: 1.08, duration: 1, repeat: -1, yoyo: true, ease: 'sine.inOut' });

    /* ============================================================
       TOUCH SWIPE TESTIMONIAL CAROUSEL
       ============================================================ */
    (() => {
        const track = document.getElementById('testimonialTrack');
        const cards = track.querySelectorAll('.testi-card');
        const dots = document.querySelectorAll('.dot');
        let index = 0;
        let touchStartX = 0;
        let touchEndX = 0;

        function getStep() {
            return cards[0].getBoundingClientRect().width + 24;
        }

        function goTo(i) {
            const max = window.innerWidth >= 1024 ? cards.length - 3 : window.innerWidth >= 640 ? cards.length - 2 : cards.length - 1;
            index = Math.max(0, Math.min(i, Math.max(max, 0)));
            gsap.to(track, { x: -index * getStep(), duration: 0.6, ease: 'power3.out' });
            dots.forEach((d, di) => d.classList.toggle('bg-gold', di === index));
            dots.forEach((d, di) => d.classList.toggle('bg-white/25', di !== index));
        }

        document.getElementById('nextBtn').addEventListener('click', () => goTo(index + 1));
        document.getElementById('prevBtn').addEventListener('click', () => goTo(index - 1));
        dots.forEach((d) => d.addEventListener('click', () => goTo(parseInt(d.dataset.i))));

        track.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });

        track.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
        }, { passive: true });

        function handleSwipe() {
            const swipeThreshold = 50;
            if (touchStartX - touchEndX > swipeThreshold) {
                goTo(index + 1);
            } else if (touchEndX - touchStartX > swipeThreshold) {
                goTo(index - 1);
            }
        }
    })();
});