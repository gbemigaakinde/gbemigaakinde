// ===================================
// BLOG POST DATA
// ===================================
const posts = [
    {
        id: 1,
        title: "You Can Take Your Time and Still Make the Wrong Choice",
        excerpt: "We like to believe that waiting makes our choices better. That if we slow down enough, we cannot be wrong. But this is one of the lies we tell ourselves. People have ruined years, relationships, careers, and consciences without ever rushing. They took their time. They planned. They waited. And they still chose badly. Because time does not fix a wrong direction. It only helps you travel farther along it.",
        date: "2026-01-25",
        category: "Philosophy",
        tags: ["decision-making", "self-awareness", "hard truths"],
        image: "images/IMG_4748.jpeg",
        content: `People often praise slowness. We are told to take our time, to think things through, to wait for clarity. Speed is then linked to recklessness, while delay is framed as wisdom. But that belief deserves some suspicion. Time, by itself, does not clean up bad thinking. It only stretches it out.

There is a kind of comfort in delay. When you slow down, you feel responsible. You feel careful. You feel as though you are doing the work, even when nothing meaningful is happening. This is why people can spend weeks, months, even years preparing to make a decision that is already flawed at its core. The problem is not that they rushed, but that they are walking in the wrong direction without noticing it.

You must have heard stories of a person who intends to build a house on land he never properly checked. He hires a surveyor, not to verify ownership, but to measure how large his dream house will be. He sits with architects, chooses tiles, debates roofing sheets, and delays construction until every detail feels right. From the outside, he looks patient and thorough. He doesn't want to make a mistake. Then one morning, after the house is half built, the rightful owner shows up with documents. The time he took did not protect him. It only made the loss more painful.

The mistake happened early. Everything after that was polish on a bad foundation.

This is how many wrong choices are made. Not loudly. Not in a hurry. They are made slowly, with notebooks, with advice, with reflection. The danger is that once we invest time, we start confusing effort with correctness. We assume that because we waited, we must be right. That assumption is false.

Time does not judge motives. It does not correct bad values. It does not challenge false assumptions unless you make it do so.

Someone realizes early that a partnership or relationship is unhealthy. The signs are present. The conversations always feel heavy. Respect is uneven. But instead of acting on what is clear, they decide to wait. They give it time to improve. They excuse patterns that do not change. Years pass. When the ending finally comes, they tell themselves they did everything they could. In one sense, that is true. In another sense, they ignored what they knew because waiting felt safer than acting.

The delay was not wisdom. It was avoidance dressed up as patience.

Someone else sees wrongdoing at work or in their community. They notice it early. They feel uneasy. But instead of addressing it, they pause. They want more evidence. More confirmation. More certainty. Over time, the wrongdoing grows. Others are harmed. By the time the person speaks up, the deed is already done and the damage is deep. Their silence has already taken a side.

Taking time did not make the choice better. It only made the consequences wider.

This is where people misunderstand caution. Caution does not mean that you have to be slow. It doesn't mean you have to "wait a bit" maybe things will change. It otherwise means having direction. You can move slowly toward what is right, or slowly away from it. The pace does not redeem the path.

At some point, every serious decision demands an honest question. Am I delaying to understand better, or am I delaying to feel better? One gives you clarity. The other gives you regret.

There is a (often moral) pressure to admire long processes. We praise people who say, "I thought about this for years." We trust decisions that took time to cook. But time can also be a way of hiding from responsibility. It gives us cover. If things go wrong, we say we did not rush. We say we tried our best. But effort is not the same as judgment.

A bad idea does not become wise because it matured slowly.

The hardest part is admitting that the wrong turn happened early. That is painful. It means accepting that some waiting was wasted. It means letting go of the pride that comes from endurance. But that admission is also freeing. It allows course correction before the cost grows larger.

This is why reflection matters more than delay. Reflection challenges assumptions. It asks whether the goal itself is sound. Delay often just repeats the same thoughts in a slower loop.

Near the end of many stories of failure, you hear almost the same sentence: I took my time. It is usually said with disbelief, as if time betrayed them. But time never promised anything. It only followed instructions.

You can take your time and still do the wrong thing. The difference between patience and paralysis is not measured by the clock. It is measured by honesty, by courage, and by the willingness to change direction when the path itself is wrong.`
    }
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
                    
                    <a href="post-${post.id}.html" class="read-more">
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

function animateSearchPlaceholder() {
    const searchInput = document.getElementById('search-input');
    
    if (!searchInput) return;
    
    const baseText = 'Search articles';
    let dotCount = 0;
    
    setInterval(() => {
        dotCount = (dotCount + 1) % 4; // Cycles through 0, 1, 2, 3
        const dots = '.'.repeat(dotCount);
        searchInput.setAttribute('placeholder', baseText + dots);
    }, 500); // Changes every 500ms
}

function initSearch() {
    const searchInput = document.getElementById('search-input');
    
    if (!searchInput) return;
    
    animateSearchPlaceholder();
    
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
    
    // Extract post ID from filename (e.g., post-1.html -> 1)
    const filename = window.location.pathname.split('/').pop();
    const match = filename.match(/post-(\d+)\.html/);
    
    if (!match) {
        postHeader.innerHTML = '<p style="color: var(--color-text-muted);">Post not found.</p>';
        return;
    }
    
    const postId = parseInt(match[1]);
    const post = posts.find(p => p.id === postId);
    
    if (!post) {
        postHeader.innerHTML = '<p style="color: var(--color-text-muted);">Post not found.</p>';
        return;
    }
    
    // Update page title
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
    `;
    
    const paragraphs = post.content
        .split('\n\n')
        .map(p => `<p>${p}</p>`)
        .join('');
    
    postContent.innerHTML = `
        ${paragraphs}
        
        <button onclick="sharePost()" class="share-button">
            <i data-lucide="share-2" style="width: 16px; height: 16px;"></i>
            Share this post
        </button>
    `;
    
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
                    <a href="post-${relatedPost.id}.html" class="related-post-card">
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
    initNotepad(postId);
    initHighlighting(postId);
}

// ===================================
// NOTEPAD FUNCTIONALITY
// ===================================

function initNotepad(postId) {
    const notepadToggle = document.getElementById('notepad-toggle');
    const notepadPanel = document.getElementById('notepad-panel');
    const closeNotepad = document.getElementById('close-notepad');
    const notepadTextarea = document.getElementById('notepad-textarea');
    const copyNotesBtn = document.getElementById('copy-notes');
    
    if (!notepadToggle || !notepadPanel) return;
    
    // Load saved notes for this post
    const savedNotes = localStorage.getItem(`notes-post-${postId}`);
    if (savedNotes && notepadTextarea) {
        notepadTextarea.value = savedNotes;
    }
    
    // Toggle panel
    notepadToggle.addEventListener('click', () => {
        notepadPanel.classList.add('active');
    });
    
    if (closeNotepad) {
        closeNotepad.addEventListener('click', () => {
            notepadPanel.classList.remove('active');
        });
    }
    
    // Auto-save notes
    if (notepadTextarea) {
        notepadTextarea.addEventListener('input', () => {
            localStorage.setItem(`notes-post-${postId}`, notepadTextarea.value);
        });
    }
    
    // Copy all notes and highlights
if (copyNotesBtn) {
    copyNotesBtn.addEventListener('click', () => {
        const notes = notepadTextarea ? notepadTextarea.value : '';
        const highlights = getHighlightsForPost(postId);
        
        let textToCopy = '';
        
        if (notes.trim()) {
            textToCopy += `NOTES:\n${notes}\n\n`;
        }
        
        if (highlights.length > 0) {
            textToCopy += `HIGHLIGHTS:\n`;
            highlights.forEach((highlight, index) => {
                textToCopy += `${index + 1}. ${highlight.text}\n`;
            });
        }
        
        if (textToCopy.trim()) {
            navigator.clipboard.writeText(textToCopy).then(() => {
                const originalHTML = copyNotesBtn.innerHTML;
                copyNotesBtn.innerHTML = '<i data-lucide="check" style="width: 16px; height: 16px;"></i> Copied!';
                initLucideIcons();
                
                setTimeout(() => {
                    copyNotesBtn.innerHTML = originalHTML;
                    initLucideIcons();
                }, 2000);
            }).catch(err => {
                console.log('Copy failed:', err);
            });
        }
    });
}
}

// ===================================
// TEXT HIGHLIGHTING FUNCTIONALITY
// ===================================

let activeColorPicker = null;
let savedSelection = null;

function initHighlighting(postId) {
    const postContent = document.getElementById('post-content');
    const clearHighlightsBtn = document.getElementById('clear-highlights');
    
    if (!postContent) return;
    
    // First, restore any saved highlights from previous sessions
    restoreSavedHighlights(postId);
    
    // Update the highlights list
    updateHighlightsList(postId);
    
    // Handle text selection
    document.addEventListener('mouseup', function(e) {
        handleTextSelection(e, postId);
    });
    
    document.addEventListener('touchend', function(e) {
        handleTextSelection(e, postId);
    });
    
    // Clear all highlights button
    if (clearHighlightsBtn) {
        clearHighlightsBtn.addEventListener('click', () => {
            clearAllHighlights(postId);
        });
    }
}

function handleTextSelection(e, postId) {
    const postContent = document.getElementById('post-content');
    if (!postContent) return;
    
    // Close any existing color picker
    if (activeColorPicker) {
        activeColorPicker.remove();
        activeColorPicker = null;
    }
    
    setTimeout(() => {
        const selection = window.getSelection();
        const selectedText = selection.toString().trim();
        
        if (selectedText.length === 0 || selection.rangeCount === 0) {
            savedSelection = null;
            return;
        }
        
        const range = selection.getRangeAt(0);
        
        // Check if selection is within post content
        let container = range.commonAncestorContainer;
        let isInPostContent = false;
        
        // Walk up the DOM tree to check if we're inside post-content
        while (container) {
            if (container === postContent) {
                isInPostContent = true;
                break;
            }
            container = container.parentNode;
        }
        
        if (!isInPostContent) {
            savedSelection = null;
            return;
        }
        
        // Check if already highlighted
        let node = range.commonAncestorContainer;
        while (node && node !== postContent) {
            if (node.nodeType === 1 && node.classList && node.classList.contains('highlight')) {
                selection.removeAllRanges();
                savedSelection = null;
                return;
            }
            node = node.parentNode;
        }
        
        // Save selection and range for later use
        savedSelection = {
            text: selectedText,
            range: range.cloneRange()
        };
        
        // Show color picker
        showColorPicker(e, postId);
        
    }, 50);
}

function showColorPicker(event, postId) {
    if (!savedSelection) return;
    
    // Remove any existing picker
    if (activeColorPicker) {
        activeColorPicker.remove();
    }
    
    activeColorPicker = document.createElement('div');
    activeColorPicker.className = 'highlight-color-picker';
    
    const colors = [
        { name: 'Yellow', value: 'yellow', bg: 'rgba(255, 235, 59, 0.4)' },
        { name: 'Green', value: 'green', bg: 'rgba(76, 175, 80, 0.3)' },
        { name: 'Blue', value: 'blue', bg: 'rgba(33, 150, 243, 0.3)' },
        { name: 'Pink', value: 'pink', bg: 'rgba(233, 30, 99, 0.3)' }
    ];
    
    activeColorPicker.innerHTML = `
        <div class="color-picker-title">Choose highlight color:</div>
        <div class="color-picker-options">
            ${colors.map(color => `
                <button class="color-option" data-color="${color.value}" style="background: ${color.bg};" title="${color.name}">
                    <span class="color-option-check">✓</span>
                </button>
            `).join('')}
        </div>
    `;
    
    document.body.appendChild(activeColorPicker);
    
    // Position the picker
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
        const rect = selection.getRangeAt(0).getBoundingClientRect();
        
        // Wait for picker to render to get its dimensions
        setTimeout(() => {
            const pickerRect = activeColorPicker.getBoundingClientRect();
            
            let top = rect.bottom + window.scrollY + 10;
            let left = rect.left + window.scrollX + (rect.width / 2) - (pickerRect.width / 2);
            
            // Keep picker on screen
            if (left + pickerRect.width > window.innerWidth - 20) {
                left = window.innerWidth - pickerRect.width - 20;
            }
            if (left < 20) {
                left = 20;
            }
            
            // If picker would go below viewport, show above selection
            if (top + pickerRect.height > window.innerHeight + window.scrollY) {
                top = rect.top + window.scrollY - pickerRect.height - 10;
            }
            
            activeColorPicker.style.top = top + 'px';
            activeColorPicker.style.left = left + 'px';
        }, 0);
    }
    
    // Handle color selection
    const colorButtons = activeColorPicker.querySelectorAll('.color-option');
    colorButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const color = button.dataset.color;
            applyHighlightWithColor(color, postId);
        });
    });
    
    // Close picker when clicking outside
    setTimeout(() => {
        const closeHandler = (e) => {
            if (activeColorPicker && !activeColorPicker.contains(e.target)) {
                activeColorPicker.remove();
                activeColorPicker = null;
                savedSelection = null;
                document.removeEventListener('mousedown', closeHandler);
            }
        };
        document.addEventListener('mousedown', closeHandler);
    }, 100);
}

function applyHighlightWithColor(color, postId) {
    if (!savedSelection || !savedSelection.range) {
        console.log('No saved selection');
        return;
    }
    
    const range = savedSelection.range;
    const selectedText = savedSelection.text;
    const highlightId = 'highlight-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    
    try {
        // Create highlight span
        const span = document.createElement('span');
        span.className = 'highlight highlight-' + color;
        span.setAttribute('data-highlight-id', highlightId);
        span.setAttribute('data-color', color);
        
        // Wrap the selected content
        range.surroundContents(span);
        
        // Save to localStorage
        saveHighlight(postId, selectedText, highlightId, color);
        
        // Update highlights list
        updateHighlightsList(postId);
        
        // Clear selection
        window.getSelection().removeAllRanges();
        
        // Remove color picker
        if (activeColorPicker) {
            activeColorPicker.remove();
            activeColorPicker = null;
        }
        
        savedSelection = null;
        
        console.log('Highlight applied successfully');
        
    } catch (e) {
        console.log('surroundContents failed, trying manual wrapping');
        
        // Fallback method for complex selections
        try {
            const span = document.createElement('span');
            span.className = 'highlight highlight-' + color;
            span.setAttribute('data-highlight-id', highlightId);
            span.setAttribute('data-color', color);
            
            const contents = range.extractContents();
            span.appendChild(contents);
            range.insertNode(span);
            
            // Save to localStorage
            saveHighlight(postId, selectedText, highlightId, color);
            
            // Update highlights list
            updateHighlightsList(postId);
            
            // Clear selection
            window.getSelection().removeAllRanges();
            
            // Remove color picker
            if (activeColorPicker) {
                activeColorPicker.remove();
                activeColorPicker = null;
            }
            
            savedSelection = null;
            
            console.log('Highlight applied with fallback method');
            
        } catch (e2) {
            console.error('Both highlight methods failed:', e2);
            alert('Could not highlight this selection. Please try selecting a smaller portion of text.');
        }
    }
}

function saveHighlight(postId, text, highlightId, color) {
    const highlights = getHighlightsForPost(postId);
    
    highlights.push({
        text: text,
        id: highlightId,
        color: color || 'yellow',
        timestamp: Date.now()
    });
    
    localStorage.setItem(`highlights-post-${postId}`, JSON.stringify(highlights));
    console.log('Highlight saved:', { text, highlightId, color });
}

function getHighlightsForPost(postId) {
    const saved = localStorage.getItem(`highlights-post-${postId}`);
    return saved ? JSON.parse(saved) : [];
}

function restoreSavedHighlights(postId) {
    const highlights = getHighlightsForPost(postId);
    const postContent = document.getElementById('post-content');
    
    if (!postContent || highlights.length === 0) return;
    
    console.log('Restoring', highlights.length, 'highlights');
    
    highlights.forEach(highlight => {
        const highlightId = highlight.id;
        const color = highlight.color || 'yellow';
        
        // Skip if already exists in DOM
        if (document.querySelector(`[data-highlight-id="${highlightId}"]`)) {
            return;
        }
        
        // Try to find and highlight the text
        findAndHighlightText(postContent, highlight.text, highlightId, color);
    });
}

function findAndHighlightText(container, searchText, highlightId, color) {
    // Create a text node iterator
    const walker = document.createTreeWalker(
        container,
        NodeFilter.SHOW_TEXT,
        null,
        false
    );
    
    const textNodes = [];
    let node;
    
    while (node = walker.nextNode()) {
        // Skip if already inside a highlight
        let parent = node.parentNode;
        let isInHighlight = false;
        
        while (parent && parent !== container) {
            if (parent.classList && parent.classList.contains('highlight')) {
                isInHighlight = true;
                break;
            }
            parent = parent.parentNode;
        }
        
        if (!isInHighlight) {
            textNodes.push(node);
        }
    }
    
    // Search for the text in text nodes
    for (let i = 0; i < textNodes.length; i++) {
        const textNode = textNodes[i];
        const textContent = textNode.textContent;
        const index = textContent.indexOf(searchText);
        
        if (index !== -1) {
            try {
                const range = document.createRange();
                range.setStart(textNode, index);
                range.setEnd(textNode, index + searchText.length);
                
                const span = document.createElement('span');
                span.className = 'highlight highlight-' + color;
                span.setAttribute('data-highlight-id', highlightId);
                span.setAttribute('data-color', color);
                
                range.surroundContents(span);
                
                return true; // Successfully highlighted
                
            } catch (e) {
                // Try extractContents method
                try {
                    const range = document.createRange();
                    range.setStart(textNode, index);
                    range.setEnd(textNode, index + searchText.length);
                    
                    const span = document.createElement('span');
                    span.className = 'highlight highlight-' + color;
                    span.setAttribute('data-highlight-id', highlightId);
                    span.setAttribute('data-color', color);
                    
                    const contents = range.extractContents();
                    span.appendChild(contents);
                    range.insertNode(span);
                    
                    return true;
                    
                } catch (e2) {
                    console.log('Could not restore highlight:', e2);
                }
            }
        }
    }
    
    return false;
}

function updateHighlightsList(postId) {
    const highlightsList = document.getElementById('highlights-list');
    if (!highlightsList) return;
    
    const highlights = getHighlightsForPost(postId);
    
    if (highlights.length === 0) {
        highlightsList.innerHTML = '<p class="highlights-empty">Select text in the post to highlight it</p>';
        return;
    }
    
    highlights.sort((a, b) => b.timestamp - a.timestamp);
    
    const colorMap = {
        'yellow': 'rgba(255, 235, 59, 0.6)',
        'green': 'rgba(76, 175, 80, 0.5)',
        'blue': 'rgba(33, 150, 243, 0.5)',
        'pink': 'rgba(233, 30, 99, 0.5)'
    };
    
    highlightsList.innerHTML = highlights.map((highlight) => `
        <div class="highlight-item" onclick="scrollToHighlight('${highlight.id}')" style="cursor: pointer;">
            <div class="highlight-color-indicator" style="background: ${colorMap[highlight.color] || colorMap.yellow};"></div>
            <div class="highlight-item-text">"${escapeHtml(highlight.text)}"</div>
            <div class="highlight-item-actions">
                <button class="highlight-remove-btn" onclick="event.stopPropagation(); removeHighlight(${postId}, '${highlight.id}')">
                    Remove
                </button>
            </div>
        </div>
    `).join('');
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function scrollToHighlight(highlightId) {
    const element = document.querySelector(`[data-highlight-id="${highlightId}"]`);
    if (element) {
        element.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center' 
        });
        
        const originalBg = element.style.backgroundColor;
        element.style.backgroundColor = 'rgba(255, 193, 7, 0.8)';
        setTimeout(() => {
            element.style.backgroundColor = originalBg;
        }, 1200);
    }
}

function removeHighlight(postId, highlightId) {
    let highlights = getHighlightsForPost(postId);
    highlights = highlights.filter(h => h.id !== highlightId);
    localStorage.setItem(`highlights-post-${postId}`, JSON.stringify(highlights));
    
    const element = document.querySelector(`[data-highlight-id="${highlightId}"]`);
    if (element) {
        const parent = element.parentNode;
        while (element.firstChild) {
            parent.insertBefore(element.firstChild, element);
        }
        parent.removeChild(element);
        parent.normalize();
    }
    
    updateHighlightsList(postId);
}

function clearAllHighlights(postId) {
    if (!confirm('Are you sure you want to clear all highlights?')) {
        return;
    }
    
    localStorage.removeItem(`highlights-post-${postId}`);
    
    const postContent = document.getElementById('post-content');
    if (postContent) {
        const highlightedElements = postContent.querySelectorAll('.highlight');
        highlightedElements.forEach(el => {
            const parent = el.parentNode;
            while (el.firstChild) {
                parent.insertBefore(el.firstChild, el);
            }
            parent.removeChild(el);
            parent.normalize();
        });
    }
    
    updateHighlightsList(postId);
}

// Make functions available globally
window.removeHighlight = removeHighlight;
window.scrollToHighlight = scrollToHighlight;

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
