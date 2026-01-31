// ===================================
// FLIP BOOK READING SYSTEM
// ===================================
// This module runs AFTER script.js has called displaySinglePost().
// It reads the rendered paragraphs from #post-content,
// splits them into viewport-fitted pages, and drives
// the flip animation + navigation.
//
// It does NOT modify: theme, notepad, highlighting, SEO,
// or any homepage logic. It only activates on post pages
// (detected by the presence of #book-container).
// ===================================

(function () {
    'use strict';

    // ─── STATE ────────────────────────────────────────
    let pages = [];          // Array of arrays: pages[i] = [<p>, <p>, ...]
    let currentPage = 0;     // Index into pages[] (0-based)
    let isAnimating = false; // Lock during flip animation
    let isMobile = false;    // Single-page mode flag
    let resizeTimer = null;  // Debounce handle

    // ─── DOM REFS (populated in init) ─────────────────
    let bookContainer, pageLeft, pageRight, pageFlip;
    let pageLeftContent, pageRightContent;
    let pageFlipFront, pageFlipBack;
    let navPrev, navNext, pageCounter, announcer;
    let postContentEl, postHeaderEl, relatedPostsEl;
    let relatedPostsTarget, shareWrap;

    // ─── REDUCED MOTION CHECK ────────────────────────
    const prefersReducedMotion = window.matchMedia(
        '(prefers-reduced-motion: reduce)'
    ).matches;

    // ─── UTILITY: debounce ────────────────────────────
    function debounce(fn, delay) {
        let timer;
        return function (...args) {
            clearTimeout(timer);
            timer = setTimeout(() => fn.apply(this, args), delay);
        };
    }

    // ===================================================
    // INITIALIZATION
    // ===================================================
    // We wait for script.js's DOMContentLoaded handler to finish
    // (which calls displaySinglePost()), then run our setup.
    // Using a small setTimeout after DOMContentLoaded ensures
    // the existing script has already rendered the content.
    // ===================================================

    document.addEventListener('DOMContentLoaded', () => {
        // Give script.js time to render content
        setTimeout(init, 150);
    });

    function init() {
        bookContainer = document.getElementById('book-container');

        // Only activate on post pages that have the book container
        if (!bookContainer) return;

        // Grab DOM refs
        pageLeft = document.getElementById('book-page-left');
        pageRight = document.getElementById('book-page-right');
        pageFlip = document.getElementById('book-page-flip');
        pageLeftContent = document.getElementById('page-left-content');
        pageRightContent = document.getElementById('page-right-content');
        pageFlipFront = document.getElementById('page-flip-front');
        pageFlipBack = document.getElementById('page-flip-back');
        navPrev = document.getElementById('book-nav-prev');
        navNext = document.getElementById('book-nav-next');
        pageCounter = document.getElementById('book-page-counter');
        announcer = document.getElementById('book-announcer');
        postContentEl = document.getElementById('post-content');
        postHeaderEl = document.getElementById('post-header');
        relatedPostsEl = document.getElementById('related-posts');
        relatedPostsTarget = document.getElementById('related-posts-target');
        shareWrap = document.getElementById('book-share-wrap');

        if (!postContentEl) return; // Safety: content not rendered yet

        // Detect mobile
        isMobile = window.innerWidth <= 768;

        // Move the post header (image, title, meta) into the first page as a cover block
        renderPostHeader();

        // Move related posts out of the hidden zone into their target below the book
        if (relatedPostsEl && relatedPostsTarget) {
            relatedPostsTarget.innerHTML = relatedPostsEl.innerHTML;
        }

        // Extract share button if present and move it
        const shareBtn = postContentEl.querySelector('.share-button');
        if (shareBtn && shareWrap) {
            shareWrap.appendChild(shareBtn);
        }

        // Paginate
        paginate();

        // Render first page(s)
        renderCurrentPages();

        // Bind navigation
        bindNavigation();

        // Bind resize
        window.addEventListener('resize', debounce(onResize, 250));

        // Init highlighting on the live page content
        // (highlighting works by finding text in #post-content;
        //  we keep #post-content in the DOM but hidden — the visible
        //  pages are clones. We patch highlighting to work on visible pages.)
        patchHighlightingForBook();
    }

    // ===================================================
    // RENDER POST HEADER INTO FIRST PAGE
    // ===================================================
    // displaySinglePost() put the featured image, date, category,
    // title, and tags into #post-header. We pull that HTML and
    // prepend it as a "cover block" inside the first page of content.
    // ===================================================

    function renderPostHeader() {
        if (!postHeaderEl) return;

        const headerHTML = postHeaderEl.innerHTML;
        if (!headerHTML.trim()) return;

        // Wrap in a semantic cover block
        const coverDiv = document.createElement('div');
        coverDiv.className = 'book-cover-block';
        coverDiv.innerHTML = headerHTML;

        // Prepend before the first <p> in post-content
        const firstChild = postContentEl.firstChild;
        postContentEl.insertBefore(coverDiv, firstChild);
    }

    // ===================================================
    // PAGINATION: split content into pages
    // ===================================================
    // We measure the available page height, then greedily
    // assign child elements (cover block, <p> tags) to pages
    // until the next element would overflow.
    // ===================================================

    function paginate() {
        pages = [];

        if (!postContentEl) return;

        // Measure available page height
        // We use the book container's height minus padding
        const bookWrapper = document.getElementById('book-wrapper');
        const containerHeight = getPageContentHeight();

        // Collect all direct children of #post-content
        // (the cover block + all <p> tags)
        const children = Array.from(postContentEl.children);

        if (children.length === 0) {
            pages = [[]];
            return;
        }

        // Temporarily make post-content visible for measurement
        postContentEl.style.position = 'absolute';
        postContentEl.style.visibility = 'hidden';
        postContentEl.style.width = getPageContentWidth() + 'px';
        postContentEl.style.height = 'auto';
        postContentEl.style.overflow = 'visible';

        let currentPageElements = [];
        let currentHeight = 0;

        children.forEach((child, i) => {
            // Measure this element
            const h = child.offsetHeight + getMarginBottom(child);

            if (currentHeight + h > containerHeight && currentPageElements.length > 0) {
                // This element doesn't fit — start a new page
                pages.push(currentPageElements);
                currentPageElements = [child];
                currentHeight = h;
            } else {
                // It fits (or it's the first element on a page — never skip)
                currentPageElements.push(child);
                currentHeight += h;
            }
        });

        // Push the last page
        if (currentPageElements.length > 0) {
            pages.push(currentPageElements);
        }

        // Restore post-content to offscreen (hidden source)
        postContentEl.style.position = '';
        postContentEl.style.visibility = '';
        postContentEl.style.width = '';
        postContentEl.style.height = '';
        postContentEl.style.overflow = '';
    }

    function getPageContentHeight() {
        // Target: the inner content area of a book page
        // We calculate from viewport minus chrome (header, footer, back-link, page-counter, padding)
        const vh = window.innerHeight;
        // Reserve space: header ~73px, back-link ~44px, page-counter ~48px, book padding ~48px top+bottom
        const reserved = 73 + 44 + 48 + 48 + 24; // 24 = extra breathing room
        return Math.max(vh - reserved, 300); // minimum 300px to avoid infinite loops
    }

    function getPageContentWidth() {
        // Match the CSS width of .book-page-content
        // On desktop, each page is roughly half the container minus spine and padding
        if (isMobile) {
            return window.innerWidth - 48; // 24px padding each side
        }
        // Desktop: container max is 900px, each page is half minus spine (2px) minus padding (48px each)
        const containerWidth = Math.min(900, window.innerWidth - 48);
        return (containerWidth / 2) - 2 - 48; // spine 2px, padding 24px each side per page
    }

    function getMarginBottom(el) {
        const style = window.getComputedStyle(el);
        return parseFloat(style.marginBottom) || 0;
    }

    // ===================================================
    // RENDER CURRENT PAGES
    // ===================================================
    // Desktop (two-page spread):
    //   Left page = pages[currentPage - 1]  (or empty if page 0)
    //   Right page = pages[currentPage]
    // Mobile (single page):
    //   Shows pages[currentPage] only
    // ===================================================

    function renderCurrentPages() {
        if (pages.length === 0) return;

        if (isMobile) {
            // Single page mode
            pageLeft.style.display = 'none';
            pageRight.style.display = 'block';
            pageRightContent.innerHTML = getPageHTML(currentPage);
        } else {
            // Two-page spread
            pageLeft.style.display = 'block';
            pageRight.style.display = 'block';

            // Left page: previous page content (empty on first page)
            if (currentPage === 0) {
                pageLeftContent.innerHTML = '';
                pageLeft.classList.add('book-page-empty');
            } else {
                pageLeftContent.innerHTML = getPageHTML(currentPage - 1);
                pageLeft.classList.remove('book-page-empty');
            }

            // Right page: current content
            pageRightContent.innerHTML = getPageHTML(currentPage);
        }

        // Update counter and announcer
        updateCounter();

        // Re-init lucide icons for any icons in the rendered content
        initLucideIcons();
    }

    function getPageHTML(pageIndex) {
        if (pageIndex < 0 || pageIndex >= pages.length) return '';

        const elements = pages[pageIndex];
        // Clone each element to avoid moving it out of the source DOM
        return elements.map(el => el.outerHTML).join('');
    }

    // ===================================================
    // PAGE NAVIGATION
    // ===================================================

    function goToNextPage() {
        if (isAnimating) return;
        if (currentPage >= pages.length - 1) return; // Already at last page

        if (isMobile || prefersReducedMotion) {
            // No flip animation — instant change
            currentPage++;
            renderCurrentPages();
            return;
        }

        // Animate flip: right page flips to become left page
        animateFlipForward();
    }

    function goToPrevPage() {
        if (isAnimating) return;
        if (currentPage <= 0) return; // Already at first page

        if (isMobile || prefersReducedMotion) {
            currentPage--;
            renderCurrentPages();
            return;
        }

        // Animate flip: left page flips back to become right page
        animateFlipBackward();
    }

    // ===================================================
    // FLIP ANIMATION: FORWARD (right → left)
    // ===================================================
    // 1. Clone the right page content onto the flip page's FRONT
    // 2. Set the flip page's BACK to the NEXT page's content
    // 3. Animate: rotateY(0) → rotateY(-180deg)
    // 4. On animation end: update state, snap pages, hide flip
    // ===================================================

    function animateFlipForward() {
        isAnimating = true;

        const nextPageIndex = currentPage + 1;
        if (nextPageIndex >= pages.length) {
            isAnimating = false;
            return;
        }

        // Prepare flip page
        pageFlipFront.innerHTML = getPageHTML(currentPage);  // Current right page
        pageFlipBack.innerHTML = getPageHTML(nextPageIndex);  // Next page (will show after flip)

        // Position flip page over the right page
        pageFlip.classList.remove('book-page-flip-animating');
        pageFlip.style.transform = 'rotateY(0deg)';

        // Force reflow so the initial state is painted
        void pageFlip.offsetHeight;

        // Show flip page
        pageFlip.classList.add('book-page-flip-visible');

        // Hide the right page underneath (flip covers it)
        pageRight.style.visibility = 'hidden';

        // Trigger animation
        requestAnimationFrame(() => {
            pageFlip.classList.add('book-page-flip-animating');
            pageFlip.style.transform = 'rotateY(-180deg)';
        });

        // Listen for animation end
        pageFlip.addEventListener('transitionend', onFlipForwardEnd, { once: true });
    }

    function onFlipForwardEnd() {
        // Update state
        currentPage++;

        // Snap: left page = old right (now flipped), right page = next
        // We just re-render both pages with new state
        pageFlip.classList.remove('book-page-flip-visible');
        pageFlip.classList.remove('book-page-flip-animating');
        pageFlip.style.transform = '';
        pageRight.style.visibility = '';

        renderCurrentPages();

        isAnimating = false;
    }

    // ===================================================
    // FLIP ANIMATION: BACKWARD (left → right)
    // ===================================================
    // Mirror of forward: left page flips back (rotateY(180) → 0)
    // ===================================================

    function animateFlipBackward() {
        isAnimating = true;

        const prevPageIndex = currentPage - 1;
        if (prevPageIndex < 0) {
            isAnimating = false;
            return;
        }

        // Prepare flip page — positioned over the LEFT page
        // Front shows prev page, back shows current page
        pageFlipFront.innerHTML = getPageHTML(prevPageIndex);
        pageFlipBack.innerHTML = getPageHTML(currentPage);

        // For backward flip, we start rotated and animate to flat
        pageFlip.classList.remove('book-page-flip-animating');
        pageFlip.classList.add('book-page-flip-backward'); // CSS positions it on left
        pageFlip.style.transform = 'rotateY(180deg)';

        void pageFlip.offsetHeight; // reflow

        pageFlip.classList.add('book-page-flip-visible');
        pageLeft.style.visibility = 'hidden';

        requestAnimationFrame(() => {
            pageFlip.classList.add('book-page-flip-animating');
            pageFlip.style.transform = 'rotateY(0deg)';
        });

        pageFlip.addEventListener('transitionend', onFlipBackwardEnd, { once: true });
    }

    function onFlipBackwardEnd() {
        currentPage--;

        pageFlip.classList.remove('book-page-flip-visible');
        pageFlip.classList.remove('book-page-flip-animating');
        pageFlip.classList.remove('book-page-flip-backward');
        pageFlip.style.transform = '';
        pageLeft.style.visibility = '';

        renderCurrentPages();

        isAnimating = false;
    }

    // ===================================================
    // NAVIGATION BINDINGS
    // ===================================================

    function bindNavigation() {
        // Button clicks
        if (navPrev) navPrev.addEventListener('click', goToPrevPage);
        if (navNext) navNext.addEventListener('click', goToNextPage);

        // Keyboard
        document.addEventListener('keydown', onKeyDown);

        // Touch / swipe
        bindSwipe();

        // Click on left/right half of book container (desktop)
        if (bookContainer) {
            bookContainer.addEventListener('click', onBookClick);
        }
    }

    function onKeyDown(e) {
        // Don't intercept if user is typing in notepad or search
        if (e.target.tagName === 'TEXTAREA' || e.target.tagName === 'INPUT') return;
        // Don't intercept if notepad is open and focused
        const notepad = document.getElementById('notepad-panel');
        if (notepad && notepad.classList.contains('active') && notepad.contains(e.target)) return;

        switch (e.key) {
            case 'ArrowRight':
            case 'ArrowDown':
            case 'PageDown':
                e.preventDefault();
                goToNextPage();
                break;
            case 'ArrowLeft':
            case 'ArrowUp':
            case 'PageUp':
                e.preventDefault();
                goToPrevPage();
                break;
            case ' ': // Space
                e.preventDefault();
                goToNextPage();
                break;
        }
    }

    function onBookClick(e) {
        if (isMobile) return; // On mobile, use nav buttons only

        // Determine if click was on left or right half
        const rect = bookContainer.getBoundingClientRect();
        const midX = rect.left + rect.width / 2;

        if (e.clientX < midX) {
            goToPrevPage();
        } else {
            goToNextPage();
        }
    }

    // ─── SWIPE (touch) ────────────────────────────────
    let touchStartX = 0;
    let touchStartY = 0;
    const SWIPE_THRESHOLD = 50; // px

    function bindSwipe() {
        document.addEventListener('touchstart', onTouchStart, { passive: true });
        document.addEventListener('touchend', onTouchEnd, { passive: true });
    }

    function onTouchStart(e) {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
    }

    function onTouchEnd(e) {
        // Ignore if notepad is open
        const notepad = document.getElementById('notepad-panel');
        if (notepad && notepad.classList.contains('active')) return;

        const touchEndX = e.changedTouches[0].clientX;
        const touchEndY = e.changedTouches[0].clientY;

        const dx = touchEndX - touchStartX;
        const dy = touchEndY - touchStartY;

        // Only treat as horizontal swipe if horizontal movement dominates
        if (Math.abs(dx) < SWIPE_THRESHOLD) return;
        if (Math.abs(dy) > Math.abs(dx)) return; // More vertical than horizontal — scroll, not swipe

        if (dx < -SWIPE_THRESHOLD) {
            goToNextPage(); // Swipe left = next
        } else if (dx > SWIPE_THRESHOLD) {
            goToPrevPage(); // Swipe right = prev
        }
    }

    // ===================================================
    // UPDATE COUNTER & ANNOUNCER
    // ===================================================

    function updateCounter() {
        const total = pages.length;
        const display = currentPage + 1; // 1-based for humans

        if (pageCounter) {
            pageCounter.textContent = 'Page ' + display + ' of ' + total;
        }

        if (announcer) {
            announcer.textContent = 'Page ' + display + ' of ' + total;
        }
    }

    // ===================================================
    // RESIZE HANDLER
    // ===================================================

    function onResize() {
        const wasMobile = isMobile;
        isMobile = window.innerWidth <= 768;

        // Re-paginate (content heights may have changed)
        paginate();

        // Clamp currentPage if we now have fewer pages
        if (currentPage >= pages.length) {
            currentPage = Math.max(0, pages.length - 1);
        }

        renderCurrentPages();
    }

    // ===================================================
    // PATCH HIGHLIGHTING FOR BOOK PAGES
    // ===================================================
    // The existing highlighting system works on #post-content.
    // Our visible pages are rendered HTML clones, not live DOM references.
    // To make highlighting work on the visible pages, we:
    // 1. Let the existing system highlight text in #post-content (offscreen)
    // 2. After any highlight action, re-render the current page(s)
    //    so the highlight spans appear in the visible pages too.
    //
    // We do this by observing #post-content for mutations.
    // ===================================================

    function patchHighlightingForBook() {
        if (!postContentEl) return;

        const observer = new MutationObserver(() => {
            // Re-render current pages to pick up any highlight spans
            renderCurrentPages();
        });

        observer.observe(postContentEl, {
            childList: true,
            subtree: true,
            characterData: true
        });
    }

    // ===================================================
    // LUCIDE ICONS HELPER
    // ===================================================

    function initLucideIcons() {
        if (window.lucide && window.lucide.createIcons) {
            window.lucide.createIcons();
        }
    }

})();
