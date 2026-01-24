// ===================================
// BLOG POST DATA
// ===================================
const posts = [
    // Your posts will go here
    // See instructions below on how to add posts
];

// ===================================
// PAGINATION SETTINGS
// ===================================
const POSTS_PER_PAGE = 5;
let currentPage = 1;
let currentFilteredPosts = posts;

// ===================================
// READING TIME CALCULATION
// ===================================

function calculateReadingTime(content) {
    const wordsPerMinute = 200;
    const wordCount = content.trim().split(/\s+/).length;
    const readingTime = Math.ceil(wordCount / wordsPerMinute);
    return readingTime;
}

// ===================================
// RELATED POSTS FUNCTION
// ===================================

function getRelatedPosts(currentPost, allPosts, maxResults = 3) {
    // Filter out current post
    const otherPosts = allPosts.filter(post => post.id !== currentPost.id);
    
    // Score posts based on matching tags and category
    const scoredPosts = otherPosts.map(post => {
        let score = 0;
        
        // Same category: +3 points
        if (post.category === currentPost.category) {
            score += 3;
        }
        
        // Matching tags: +1 point per tag
        const matchingTags = post.tags.filter(tag => 
            currentPost.tags.includes(tag)
        ).length;
        score += matchingTags;
        
        return { post, score };
    });
    
    // Sort by score and return top results
    return scoredPosts
        .sort((a, b) => b.score - a.score)
        .slice(0, maxResults)
        .map(item => item.post);
}

// ===================================
// SHARE FUNCTIONALITY
// ===================================

function sharePost() {
    const url = window.location.href;
    const title = document.querySelector('.post-header h1')?.textContent || 'Check out this post';
    
    // Check if Web Share API is supported (mobile & some modern browsers)
    if (navigator.share) {
        navigator.share({
            title: title,
            url: url
        }).catch(err => {
            // If user cancels, do nothing
            if (err.name !== 'AbortError') {
                console.log('Share failed:', err);
            }
        });
    } else {
        // Fallback: Copy link to clipboard
        navigator.clipboard.writeText(url).then(() => {
            // Show temporary notification
            const button = document.querySelector('.share-button');
            const originalText = button.innerHTML;
            button.innerHTML = '<i data-lucide="check" style="width: 16px; height: 16px;"></i> Link copied!';
            
            setTimeout(() => {
                button.innerHTML = originalText;
                initLucideIcons();
            }, 2000);
            
            initLucideIcons();
        });
    }
}

// ===================================
// LUCIDE ICONS INITIALIZATION
// ===================================

function initLucideIcons() {
    if (window.lucide && window.lucide.createIcons) {
        window.lucide.createIcons();
    }
}

// ===================================
// THEME MANAGEMENT
// ===================================

function initTheme() {
    const savedTheme = localStorage.getItem('theme');
    
    if (savedTheme) {
        applyTheme(savedTheme);
    } else {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const theme = prefersDark ? 'dark' : 'light';
        applyTheme(theme);
    }
    
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', (e) => {
        if (!localStorage.getItem('theme')) {
            const newTheme = e.matches ? 'dark' : 'light';
            applyTheme(newTheme);
        }
    });
}

function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    updateThemeIcons(theme === 'dark');
    updateXLogo(theme === 'dark');
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    applyTheme(newTheme);
    localStorage.setItem('theme', newTheme);
}

function updateThemeIcons(isDark) {
    const desktopToggle = document.getElementById('theme-toggle');
    if (desktopToggle) {
        const icon = desktopToggle.querySelector('i');
        if (icon) {
            icon.setAttribute('data-lucide', isDark ? 'sun' : 'moon');
        }
    }
    
    const mobileToggle = document.getElementById('mobile-theme-toggle');
    if (mobileToggle) {
        const icon = mobileToggle.querySelector('i');
        if (icon) {
            icon.setAttribute('data-lucide', isDark ? 'sun' : 'moon');
        }
    }
    
    initLucideIcons();
}

function updateXLogo(isDark) {
    const xLogos = document.querySelectorAll('.x-logo');
    xLogos.forEach(logo => {
        logo.src = isDark ? 'logo-white.png' : 'logo-black.png';
    });
}

// ===================================
// COPYRIGHT YEAR AUTO-UPDATE
// ===================================

function updateCopyrightYear() {
    const copyrightElement = document.getElementById('copyright-text');
    if (copyrightElement) {
        const currentYear = new Date().getFullYear();
        copyrightElement.textContent = `© ${currentYear} 'Gbemiga Akinde. All thoughts and words are my own.`;
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
        menuButton.addEventListener('click', () => {
            sidebar.classList.add('active');
        });
        
        const closeMenu = () => {
            sidebar.classList.remove('active');
        };
        
        if (closeButton) closeButton.addEventListener('click', closeMenu);
        if (overlay) overlay.addEventListener('click', closeMenu);
    }
}

// ===================================
// PAGINATION FUNCTIONS
// ===================================

function getTotalPages(postsArray) {
    return Math.ceil(postsArray.length / POSTS_PER_PAGE);
}

function getPaginatedPosts(postsArray, page) {
    const startIndex = (page - 1) * POSTS_PER_PAGE;
    const endIndex = startIndex + POSTS_PER_PAGE;
    return postsArray.slice(startIndex, endIndex);
}

function renderPagination(postsArray) {
    const paginationContainer = document.getElementById('pagination-container');
    
    if (!paginationContainer) return;
    
    const totalPages = getTotalPages(postsArray);
    
    // Don't show pagination if only one page or no posts
    if (totalPages <= 1) {
        paginationContainer.innerHTML = '';
        return;
    }
    
    const prevDisabled = currentPage === 1 ? 'disabled' : '';
    const nextDisabled = currentPage === totalPages ? 'disabled' : '';
    
    paginationContainer.innerHTML = `
        <div class="pagination">
            <button 
                class="pagination-button ${prevDisabled}" 
                onclick="changePage(${currentPage - 1})"
                ${prevDisabled ? 'disabled' : ''}
            >
                <i data-lucide="chevron-left" style="width: 18px; height: 18px;"></i>
                Previous
            </button>
            
            <span class="pagination-info">
                Page ${currentPage} of ${totalPages}
            </span>
            
            <button 
                class="pagination-button ${nextDisabled}" 
                onclick="changePage(${currentPage + 1})"
                ${nextDisabled ? 'disabled' : ''}
            >
                Next
                <i data-lucide="chevron-right" style="width: 18px; height: 18px;"></i>
            </button>
        </div>
    `;
    
    initLucideIcons();
}

function changePage(newPage) {
    const totalPages = getTotalPages(currentFilteredPosts);
    
    if (newPage < 1 || newPage > totalPages) return;
    
    currentPage = newPage;
    
    // Scroll to top of posts container smoothly
    const postsContainer = document.getElementById('posts-container');
    if (postsContainer) {
        postsContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    
    displayPosts(currentFilteredPosts);
}

// ===================================
// HOMEPAGE: DISPLAY POSTS
// ===================================

function displayPosts(postsToShow = posts) {
    const container = document.getElementById('posts-container');
    
    if (!container) return;
    
    // Update current filtered posts for pagination
    currentFilteredPosts = postsToShow;
    
    if (postsToShow.length === 0) {
        container.innerHTML = '<p style="color: var(--color-text-muted); text-align: center;">No posts found.</p>';
        renderPagination([]);
        return;
    }
    
    // Get posts for current page
    const paginatedPosts = getPaginatedPosts(postsToShow, currentPage);
    
    container.innerHTML = paginatedPosts.map(post => {
        const date = new Date(post.date);
        const formattedDate = date.toLocaleDateString('en-US', { 
            month: 'long', 
            day: 'numeric', 
            year: 'numeric' 
        });
        
        const readingTime = calculateReadingTime(post.content);
        
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
                    <span class="post-reading-time">
                        <i data-lucide="clock" style="width: 14px; height: 14px;"></i>
                        ${readingTime} min read
                    </span>
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
    
    // Render pagination controls
    renderPagination(postsToShow);
    
    initLucideIcons();
}

// ===================================
// SEARCH FUNCTIONALITY
// ===================================

function initSearch() {
    const searchInput = document.getElementById('search-input');
    
    if (!searchInput) return;
    
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();
        
        // Reset to page 1 when searching
        currentPage = 1;
        
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
            categoryButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            // Reset to page 1 when changing category
            currentPage = 1;
            
            const category = button.getAttribute('data-category');
            
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
    const relatedPostsContainer = document.getElementById('related-posts');
    
    if (!postHeader || !postContent) return;
    
    const urlParams = new URLSearchParams(window.location.search);
    const postId = parseInt(urlParams.get('id'));
    const post = posts.find(p => p.id === postId);
    
    if (!post) {
        postHeader.innerHTML = '<p style="color: var(--color-text-muted);">Post not found.</p>';
        return;
    }
    
    document.title = `${post.title} - 'Gbemiga Akinde`;
    
    const date = new Date(post.date);
    const formattedDate = date.toLocaleDateString('en-US', { 
        month: 'long', 
        day: 'numeric', 
        year: 'numeric' 
    });
    
    const readingTime = calculateReadingTime(post.content);
    
    const tagsHTML = post.tags.map(tag => 
        `<span class="post-tag">
            <i data-lucide="tag" style="width: 12px; height: 12px;"></i>
            ${tag}
        </span>`
    ).join('');
    
    postHeader.innerHTML = `
        ${post.image ? `<img src="${post.image}" alt="${post.title}" class="post-featured-image">` : ''}
        
        <div class="post-meta">
            <span class="post-date">
                <i data-lucide="calendar" style="width: 14px; height: 14px;"></i>
                ${formattedDate}
            </span>
            <span class="post-category">${post.category}</span>
            <span class="post-reading-time">
                <i data-lucide="clock" style="width: 14px; height: 14px;"></i>
                ${readingTime} min read
            </span>
        </div>
        
        <h1>${post.title}</h1>
        
        <div class="post-tags">
            ${tagsHTML}
        </div>
        
        <button onclick="sharePost()" class="share-button">
            <i data-lucide="share-2" style="width: 16px; height: 16px;"></i>
            Share this post
        </button>
    `;
    
    const paragraphs = post.content.split('\n\n').map(p => `<p>${p}</p>`).join('');
    postContent.innerHTML = paragraphs;
    
    // Display related posts
    if (relatedPostsContainer) {
        const relatedPosts = getRelatedPosts(post, posts);
        
        if (relatedPosts.length > 0) {
            const relatedPostsHTML = relatedPosts.map(relatedPost => {
                const relatedDate = new Date(relatedPost.date);
                const relatedFormattedDate = relatedDate.toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric', 
                    year: 'numeric' 
                });
                
                return `
                    <a href="post.html?id=${relatedPost.id}" class="related-post-card">
                        ${relatedPost.image ? `<img src="${relatedPost.image}" alt="${relatedPost.title}" class="related-post-image">` : ''}
                        <div class="related-post-content">
                            <span class="related-post-category">${relatedPost.category}</span>
                            <h3 class="related-post-title">${relatedPost.title}</h3>
                            <span class="related-post-date">${relatedFormattedDate}</span>
                        </div>
                    </a>
                `;
            }).join('');
            
            relatedPostsContainer.innerHTML = `
                <h2 class="related-posts-heading">Related Posts</h2>
                <div class="related-posts-grid">
                    ${relatedPostsHTML}
                </div>
            `;
        }
    }
    
    initLucideIcons();
}

// ===================================
// INITIALIZATION
// ===================================

window.addEventListener('load', () => {
    setTimeout(() => {
        initLucideIcons();
    }, 100);
});

document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    updateCopyrightYear();
    
    initLucideIcons();
    
    const desktopToggle = document.getElementById('theme-toggle');
    const mobileToggle = document.getElementById('mobile-theme-toggle');
    
    if (desktopToggle) {
        desktopToggle.addEventListener('click', toggleTheme);
    }
    
    if (mobileToggle) {
        mobileToggle.addEventListener('click', () => {
            toggleTheme();
            const sidebar = document.getElementById('mobile-sidebar');
            if (sidebar) sidebar.classList.remove('active');
        });
    }
    
    initMobileMenu();
    
    if (document.getElementById('posts-container')) {
        displayPosts();
        initSearch();
        initCategoryFilter();
    } else if (document.getElementById('post-header')) {
        displaySinglePost();
    }
});