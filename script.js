// ===================================
// BLOG POST DATA
// ===================================
const posts = [
    {
        id: 1,
        title: "On the Nature of Change",
        excerpt: "Reflecting on how transformation happens slowly, then all at once. Sometimes we don't notice the shifts until we look back and see how far we've traveled.",
        date: "2025-01-15",
        category: "Philosophy",
        tags: ["reflection", "growth", "time"],
        content: `Change is a curious thing. We often imagine it as dramatic—a sudden shift, a moment of clarity, a decision that changes everything. But more often than not, change is quiet. It's the accumulation of small choices, tiny adjustments in perspective, moments of awareness that we barely notice as they happen.

I've been thinking about this lately, watching how habits form and dissolve, how relationships evolve, how our understanding of ourselves deepens over time. There's something profound in recognizing that the person we were a year ago, five years ago, is both intimately familiar and almost unrecognizable.

The challenge isn't in making change happen—it's in paying attention while it does. Being present enough to notice the shifts, gentle enough with ourselves to allow them, and patient enough to trust the process even when progress feels invisible.

What changes are quietly happening in your life right now?`
    },
    {
        id: 2,
        title: "The Art of Doing Nothing",
        excerpt: "In a world obsessed with productivity, there's something radical about choosing stillness. A meditation on boredom, rest, and the spaces between.",
        date: "2025-01-10",
        category: "Lifestyle",
        tags: ["rest", "mindfulness", "culture"],
        content: `We've forgotten how to do nothing. Not "nothing productive"—I mean actual nothing. No phone, no book, no music, no task. Just... existing.

This realization hit me last Sunday when I caught myself reaching for my phone within seconds of sitting down. The discomfort was immediate. The silence felt wrong. My mind scrambled for something, anything, to occupy itself with.

But here's what I'm learning: boredom is not the enemy. It's the soil from which creativity grows. It's in those empty moments that our minds actually process, integrate, dream. We need white space in our lives the way a good design needs margins—not as wasted space, but as essential structure.

Try it sometime. Sit and do absolutely nothing for ten minutes. Notice the resistance. Notice what emerges. You might be surprised.`
    },
    {
        id: 3,
        title: "Letters I'll Never Send",
        excerpt: "Some things need to be written but never mailed. On the therapeutic power of unsent correspondence and words meant only for ourselves.",
        date: "2025-01-05",
        category: "Writing",
        tags: ["writing", "healing", "introspection"],
        content: `Dear younger self, dear old friend, dear person I used to be...

I've been writing letters I'll never send. Not because they're angry or cruel, but because they're not really for anyone else. They're for me. A way of processing, understanding, releasing.

There's something powerful about writing to someone—real or imagined—with complete honesty, knowing they'll never read it. No performance, no second-guessing, no worrying about their reaction. Just truth on the page.

Sometimes I write to apologize. Sometimes to forgive. Sometimes just to say things I wish I'd said when I had the chance. The words sit in a folder on my computer, unread by anyone but me, and somehow that's exactly what they need to be.

If you wrote a letter you'd never send, who would it be to? What would you say?`
    }
];

// ===================================
// THEME MANAGEMENT - FULLY FIXED
// ===================================

function initTheme() {
    // Check if user has manually set a preference
    const savedTheme = localStorage.getItem('theme');
    
    if (savedTheme) {
        // User has manually chosen a theme - use it
        applyTheme(savedTheme);
    } else {
        // No manual preference - use system preference
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const theme = prefersDark ? 'dark' : 'light';
        applyTheme(theme);
    }
    
    // Listen for system theme changes (when user changes phone/computer theme)
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', (e) => {
        // Only auto-switch if user hasn't manually set a preference
        if (!localStorage.getItem('theme')) {
            const newTheme = e.matches ? 'dark' : 'light';
            applyTheme(newTheme);
        }
    });
}

function applyTheme(theme) {
    // Apply theme to document immediately (no reload needed)
    document.documentElement.setAttribute('data-theme', theme);
    
    // Update toggle button icons
    updateThemeIcons(theme === 'dark');
}

function toggleTheme() {
    // Get current theme
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    // Apply new theme immediately
    applyTheme(newTheme);
    
    // Save user's manual preference
    localStorage.setItem('theme', newTheme);
}

function updateThemeIcons(isDark) {
    // Update desktop toggle button
    const desktopToggle = document.getElementById('theme-toggle');
    if (desktopToggle) {
        const icon = desktopToggle.querySelector('i');
        if (icon) {
            icon.setAttribute('data-lucide', isDark ? 'sun' : 'moon');
        }
    }
    
    // Update mobile toggle button
    const mobileToggle = document.getElementById('mobile-theme-toggle');
    if (mobileToggle) {
        const icon = mobileToggle.querySelector('i');
        if (icon) {
            icon.setAttribute('data-lucide', isDark ? 'sun' : 'moon');
        }
    }
    
    // Reinitialize Lucide icons to show changes
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

// ===================================
// COPYRIGHT YEAR AUTO-UPDATE
// ===================================

function updateCopyrightYear() {
    const copyrightElement = document.getElementById('copyright-text');
    if (copyrightElement) {
        const currentYear = new Date().getFullYear();
        copyrightElement.textContent = `© ${currentYear} Your Name. All thoughts and words are my own.`;
    }
}

// ===================================
// MOBILE MENU
// ===================================

function initMobileMenu() {
    const menuButton = document.getElementById('mobile-menu-button');
    const closeButton = document.getElementById('close-sidebar');
    const sidebar = document.getElementById('mobile-sidebar');
    const overlay = sidebar ? sidebar.querySelector('.mobile-sidebar-overlay') : null;
    
    if (menuButton && sidebar) {
        // Open menu
        menuButton.addEventListener('click', () => {
            sidebar.classList.add('active');
        });
        
        // Close menu
        const closeMenu = () => {
            sidebar.classList.remove('active');
        };
        
        if (closeButton) closeButton.addEventListener('click', closeMenu);
        if (overlay) overlay.addEventListener('click', closeMenu);
    }
}

// ===================================
// HOMEPAGE: DISPLAY POSTS
// ===================================

function displayPosts(postsToShow = posts) {
    const container = document.getElementById('posts-container');
    
    if (!container) return;
    
    if (postsToShow.length === 0) {
        container.innerHTML = '<p style="color: var(--color-text-muted); text-align: center;">No posts found.</p>';
        return;
    }
    
    container.innerHTML = postsToShow.map(post => {
        const date = new Date(post.date);
        const formattedDate = date.toLocaleDateString('en-US', { 
            month: 'long', 
            day: 'numeric', 
            year: 'numeric' 
        });
        
        const tagsHTML = post.tags.map(tag => 
            `<span class="post-tag">
                <i data-lucide="tag" style="width: 12px; height: 12px;"></i>
                ${tag}
            </span>`
        ).join('');
        
        return `
            <article class="post-card">
                <div class="post-meta">
                    <span class="post-date">
                        <i data-lucide="calendar" style="width: 14px; height: 14px;"></i>
                        ${formattedDate}
                    </span>
                    <span class="post-category">${post.category}</span>
                </div>
                
                <h2 class="post-title">${post.title}</h2>
                
                <p class="post-excerpt">${post.excerpt}</p>
                
                <div class="post-footer">
                    <div class="post-tags">
                        ${tagsHTML}
                    </div>
                    
                    <a href="post.html?id=${post.id}" class="read-more">
                        Read more
                        <i data-lucide="arrow-right" style="width: 16px; height: 16px;"></i>
                    </a>
                </div>
            </article>
        `;
    }).join('');
    
    // Initialize Lucide icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

// ===================================
// SEARCH FUNCTIONALITY
// ===================================

function initSearch() {
    const searchInput = document.getElementById('search-input');
    
    if (!searchInput) return;
    
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();
        
        if (query === '') {
            displayPosts(posts);
        } else {
            const filtered = posts.filter(post => 
                post.title.toLowerCase().includes(query) ||
                post.excerpt.toLowerCase().includes(query) ||
                post.content.toLowerCase().includes(query)
            );
            
            displayPosts(filtered);
        }
    });
}

// ===================================
// CATEGORY FILTER
// ===================================

function initCategoryFilter() {
    const categoryButtons = document.querySelectorAll('.category-button');
    
    if (categoryButtons.length === 0) return;
    
    categoryButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons
            categoryButtons.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to clicked button
            button.classList.add('active');
            
            // Get selected category
            const category = button.getAttribute('data-category');
            
            // Filter posts
            if (category === 'all') {
                displayPosts(posts);
            } else {
                const filtered = posts.filter(post => 
                    post.category.toLowerCase() === category.toLowerCase()
                );
                displayPosts(filtered);
            }
        });
    });
}

// ===================================
// INDIVIDUAL POST PAGE
// ===================================

function displaySinglePost() {
    const postHeader = document.getElementById('post-header');
    const postContent = document.getElementById('post-content');
    
    if (!postHeader || !postContent) return;
    
    // Get post ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const postId = parseInt(urlParams.get('id'));
    
    // Find the post
    const post = posts.find(p => p.id === postId);
    
    if (!post) {
        postHeader.innerHTML = '<p style="color: var(--color-text-muted);">Post not found.</p>';
        return;
    }
    
    // Update page title
    document.title = `${post.title} - Your Name`;
    
    // Format date
    const date = new Date(post.date);
    const formattedDate = date.toLocaleDateString('en-US', { 
        month: 'long', 
        day: 'numeric', 
        year: 'numeric' 
    });
    
    // Create tags HTML
    const tagsHTML = post.tags.map(tag => 
        `<span class="post-tag">
            <i data-lucide="tag" style="width: 12px; height: 12px;"></i>
            ${tag}
        </span>`
    ).join('');
    
    // Display header
    postHeader.innerHTML = `
        <div class="post-meta">
            <span class="post-date">
                <i data-lucide="calendar" style="width: 14px; height: 14px;"></i>
                ${formattedDate}
            </span>
            <span class="post-category">${post.category}</span>
        </div>
        
        <h1>${post.title}</h1>
        
        <div class="post-tags">
            ${tagsHTML}
        </div>
    `;
    
    // Display content (convert \n\n to paragraphs)
    const paragraphs = post.content.split('\n\n').map(p => `<p>${p}</p>`).join('');
    postContent.innerHTML = paragraphs;
    
    // Initialize Lucide icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

// ===================================
// INITIALIZATION
// ===================================

document.addEventListener('DOMContentLoaded', () => {
    // Initialize theme system
    initTheme();
    
    // Update copyright year automatically
    updateCopyrightYear();
    
    // Initialize Lucide icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
    
    // Set up theme toggle buttons
    const desktopToggle = document.getElementById('theme-toggle');
    const mobileToggle = document.getElementById('mobile-theme-toggle');
    
    if (desktopToggle) {
        desktopToggle.addEventListener('click', toggleTheme);
    }
    
    if (mobileToggle) {
        mobileToggle.addEventListener('click', () => {
            toggleTheme();
            // Close mobile menu after toggling
            const sidebar = document.getElementById('mobile-sidebar');
            if (sidebar) sidebar.classList.remove('active');
        });
    }
    
    // Initialize mobile menu
    initMobileMenu();
    
    // Initialize page-specific features
    if (document.getElementById('posts-container')) {
        // Homepage
        displayPosts();
        initSearch();
        initCategoryFilter();
    } else if (document.getElementById('post-header')) {
        // Single post page
        displaySinglePost();
    }
});