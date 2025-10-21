// Storage Manager - Handles localStorage operations (Unchanged)
const StorageManager = {
    USERS_KEY: 'ecoPointsUsers',
    CURRENT_USER_KEY: 'ecoPointsCurrentUser',
    getAllUsers() {
        const users = localStorage.getItem(this.USERS_KEY);
        return users ? JSON.parse(users) : {};
    },
    saveUsers(users) {
        localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
    },
    getCurrentUser() {
        const email = localStorage.getItem(this.CURRENT_USER_KEY);
        if (!email) return null;
        const users = this.getAllUsers();
        return users[email] || null;
    },
    setCurrentUser(email) {
        localStorage.setItem(this.CURRENT_USER_KEY, email);
    },
    clearCurrentUser() {
        localStorage.removeItem(this.CURRENT_USER_KEY);
    },
    saveUser(userData) {
        const users = this.getAllUsers();
        users[userData.email] = userData;
        this.saveUsers(users);
    },
    userExists(email) {
        const users = this.getAllUsers();
        return email in users;
    }
};

// Notification Manager - Handles toast notifications (Unchanged)
const NotificationManager = {
    element: null,
    timeout: null,
    init() {
        this.element = document.getElementById('notification');
    },
    show(message, type = 'success', duration = 3000) {
        if (!this.element) return;
        if (type === 'badge') {
            message = `🏆 Achievement Unlocked! ${message}`;
            type = 'success';
            duration = 5000;
        }
        this.element.textContent = message;
        // Use timeout to allow transition class to be added after potential removal
        setTimeout(() => {
            this.element.className = `notification ${type} show`;
        }, 10); // Small delay

        if (this.timeout) clearTimeout(this.timeout);
        this.timeout = setTimeout(() => {
            this.hide();
        }, duration);
    },
    hide() {
        if (!this.element) return;
        this.element.classList.remove('show');
        // Optional: Reset properties after hiding
        setTimeout(() => {
            if (!this.element.classList.contains('show')) {
                this.element.textContent = '';
                this.element.className = 'notification';
            }
        }, 500); // Match transition duration
    }
};


// Activity Manager - Handles user activities (Unchanged)
const ActivityManager = {
    ACTIVITIES_KEY: 'ecoPointsActivities',
    getActivities(userEmail) {
        const allActivities = localStorage.getItem(this.ACTIVITIES_KEY);
        const activities = allActivities ? JSON.parse(allActivities) : {};
        return activities[userEmail] || [];
    },
    saveActivity(userEmail, activity) {
        const allActivities = localStorage.getItem(this.ACTIVITIES_KEY);
        const activities = allActivities ? JSON.parse(allActivities) : {};
        if (!activities[userEmail]) {
            activities[userEmail] = [];
        }
        activities[userEmail].unshift(activity);
        if (activities[userEmail].length > 100) {
            activities[userEmail] = activities[userEmail].slice(0, 100);
        }
        localStorage.setItem(this.ACTIVITIES_KEY, JSON.stringify(activities));
    },
    overwriteActivities(userEmail, activitiesArray) {
        const allActivities = localStorage.getItem(this.ACTIVITIES_KEY);
        const activities = allActivities ? JSON.parse(allActivities) : {};
        activities[userEmail] = activitiesArray;
        localStorage.setItem(this.ACTIVITIES_KEY, JSON.stringify(activities));
    },
    getStats(userEmail) {
        const activities = this.getActivities(userEmail);
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const todayActivities = activities.filter(a => new Date(a.timestamp) >= today);
        const weeklyData = [];
        const dayLabels = [];
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        for (let i = 6; i >= 0; i--) {
            const d = new Date(today);
            d.setDate(d.getDate() - i);
            dayLabels.push(days[d.getDay()]);
            const startOfDay = new Date(d.getFullYear(), d.getMonth(), d.getDate());
            const endOfDay = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59);
            const dayActivities = activities.filter(a => {
                const actDate = new Date(a.timestamp);
                return actDate >= startOfDay && actDate <= endOfDay;
            });
            weeklyData.push(dayActivities.length);
        }
        const actionCounts = {};
        activities.forEach(a => {
            actionCounts[a.label] = (actionCounts[a.label] || 0) + 1;
        });
        let favoriteAction = '-';
        let maxCount = 0;
        for (const [action, count] of Object.entries(actionCounts)) {
            if (count > maxCount) {
                maxCount = count;
                favoriteAction = action;
            }
        }
        return {
            total: activities.length,
            today: todayActivities.length,
            favorite: favoriteAction,
            actionCounts: actionCounts,
            weeklyData: weeklyData,
            weeklyLabels: dayLabels
        };
    }
};

// Utility Functions (Unchanged)
const Utils = {
    validateEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    },
    formatTimestamp(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins} min ago`;
        const diffHours = Math.floor(diffMins / 60);
        if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
        const diffDays = Math.floor(diffHours / 24);
        if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
        return date.toLocaleDateString();
    },
    getPersonalizedGreeting() {
        const hour = new Date().getHours();
        if (hour < 12) return "Good morning";
        if (hour < 18) return "Good afternoon";
        return "Good evening";
    },
    redirectToDashboard() {
        window.location.href = 'dashboard.html';
    },
    redirectToLogin() {
        window.location.href = 'index.html';
    }
};

// --- Action Image Sources Map (Unchanged) ---
const ACTION_IMAGE_SRCS = {
    'public_transport': 'images/bus-icon.png',
    'recycle': 'images/recycle-icon.png',
    'plant_tree': 'images/plant-icon.png',
    'conserve_water': 'images/water-icon.png',
    'bike': 'images/bike-icon.png',
    'save_energy': 'images/energy-icon.png'
};

// ==================== SIGNUP PAGE ==================== (Unchanged)
if (window.location.pathname.includes('signup.html')) {
    const currentUser = StorageManager.getCurrentUser();
    if (currentUser) Utils.redirectToDashboard();
    const form = document.getElementById('signupForm');
    const nameInput = document.getElementById('signupName');
    const emailInput = document.getElementById('signupEmail');
    const passwordInput = document.getElementById('signupPassword');
    const messageEl = document.getElementById('signupMessage');
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = nameInput.value.trim();
        const email = emailInput.value.trim().toLowerCase();
        const password = passwordInput.value.trim();
        if (!name || !email || !password) {
            messageEl.textContent = 'Please fill in all fields.';
            messageEl.className = 'message error'; return;
        }
        if (!Utils.validateEmail(email)) {
            messageEl.textContent = 'Please enter a valid email address.';
            messageEl.className = 'message error'; return;
        }
        if (password.length < 6) {
            messageEl.textContent = 'Password must be at least 6 characters long.';
            messageEl.className = 'message error'; return;
        }
        if (StorageManager.userExists(email)) {
            messageEl.textContent = 'This email is already registered. Please log in.';
            messageEl.className = 'message error'; return;
        }
        const newUser = { name, email, password, ecoPoints: 0, createdAt: new Date().toISOString(), unlockedBadges: [] };
        StorageManager.saveUser(newUser);
        messageEl.textContent = 'Sign up successful! Redirecting to login...';
        messageEl.className = 'message success';
        setTimeout(Utils.redirectToLogin, 1500);
    });
}

// ==================== LOGIN PAGE ==================== (Unchanged)
if (window.location.pathname.includes('index.html') || window.location.pathname === '/' || window.location.pathname.endsWith('/')) {
    const currentUser = StorageManager.getCurrentUser();
    if (currentUser) Utils.redirectToDashboard();
    const form = document.getElementById('loginForm');
    const emailInput = document.getElementById('loginEmail');
    const passwordInput = document.getElementById('loginPassword');
    const messageEl = document.getElementById('loginMessage');
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = emailInput.value.trim().toLowerCase();
        const password = passwordInput.value.trim();
        if (!email || !password) {
            messageEl.textContent = 'Please enter both email and password.';
            messageEl.className = 'message error'; return;
        }
        const users = StorageManager.getAllUsers();
        const user = users[email];
        if (!user || user.password !== password) {
            messageEl.textContent = 'Invalid email or password. Please try again.';
            messageEl.className = 'message error'; return;
        }
        StorageManager.setCurrentUser(email);
        messageEl.textContent = 'Login successful! Redirecting...';
        messageEl.className = 'message success';
        setTimeout(Utils.redirectToDashboard, 1000);
    });
}

// ==================== DASHBOARD PAGE ====================
if (window.location.pathname.includes('dashboard.html')) {
    // Check if logged in
    let currentUser = StorageManager.getCurrentUser();
    if (!currentUser) Utils.redirectToLogin();

    // --- Configurations (Unchanged) ---
    const ECO_TIPS = [
        "Turn off lights when you leave a room.",
        "Use reusable shopping bags.",
        "Fix leaky faucets.",
        "Unplug electronics when not in use.",
        "Switch to LED bulbs.",
        "Try composting food scraps.",
        "Go paperless with bills.",
        "Wash clothes in cold water."
    ];
    const LEVEL_CONFIG = [
        { level: 1, name: "Eco-Sprout", pointsNeeded: 0 },
        { level: 2, name: "Eco-Seedling", pointsNeeded: 100 },
        { level: 3, name: "Eco-Guardian", pointsNeeded: 300 },
        { level: 4, name: "Eco-Hero", pointsNeeded: 700 },
        { level: 5, name: "Eco-Champion", pointsNeeded: 1500 }
    ];
    // --- MODIFIED: Badge Config Keys now match HTML IDs ---
    const BADGE_CONFIG = {
        'badge-first-step': { title: 'Log your first action!', check: (stats) => stats.total >= 1 },
        'badge-recycle': { title: 'Recycle 10 times', check: (stats) => (stats.actionCounts['Recycle Waste'] || 0) >= 10 },
        'badge-tree-hugger': { title: 'Plant 5 trees', check: (stats) => (stats.actionCounts['Plant a Tree'] || 0) >= 5 },
        'badge-eco-hero': { title: 'Earn 500 total points', check: (stats) => currentUser.ecoPoints >= 500 }
    };
    
    let weeklyChartInstance = null;
    let actionBreakdownChartInstance = null;

    NotificationManager.init();

    // --- MODIFIED: Get all relevant DOM elements ---
    const userNameEl = document.getElementById('dashboardUserName');
    const ecoPointsSpanEl = document.getElementById('ecoPointsDisplay'); // Get the SPAN for animation
    const actionButtons = document.querySelectorAll('.eco-action-btn');
    const logoutBtn = document.getElementById('logoutBtn');
    const activityHistoryEl = document.getElementById('activityHistory');
    const ecoTipEl = document.getElementById('ecoTipText');
    const levelNameEl = document.querySelector('.level-name');
    const pointsToNextLevelEl = document.getElementById('pointsToNextLevel');
    const progressBarEl = document.getElementById('levelProgressBar');
    const totalActionsEl = document.getElementById('totalActions');
    const todayActionsEl = document.getElementById('todayActions');
    const weeklyChartCtx = document.getElementById('weeklyActivityChart')?.getContext('2d');
    const actionBreakdownChartCtx = document.getElementById('actionBreakdownChart')?.getContext('2d');
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    // --- Display Eco Tip (Unchanged) ---
    function displayEcoTip() {
        const randomIndex = Math.floor(Math.random() * ECO_TIPS.length);
        ecoTipEl.textContent = ECO_TIPS[randomIndex];
    }

    // --- MODIFIED: Update Level Progress with adjusted text ---
    function updateLevelProgress(points) {
        let currentLevel = LEVEL_CONFIG[0];
        let nextLevel = LEVEL_CONFIG[1];
        for (let i = LEVEL_CONFIG.length - 1; i >= 0; i--) {
            if (points >= LEVEL_CONFIG[i].pointsNeeded) {
                currentLevel = LEVEL_CONFIG[i];
                nextLevel = LEVEL_CONFIG[i + 1] || null;
                break;
            }
        }
        levelNameEl.textContent = `Level ${currentLevel.level}: ${currentLevel.name}`;
        if (nextLevel) {
            const pointsInCurrentLevel = Math.max(0, points - currentLevel.pointsNeeded);
            const pointsForThisLevel = nextLevel.pointsNeeded - currentLevel.pointsNeeded;
            const progressPercent = Math.min(100, (pointsInCurrentLevel / pointsForThisLevel) * 100);

            // --- Using format from reference image ---
            pointsToNextLevelEl.textContent = `${points} / ${nextLevel.pointsNeeded} points to ${nextLevel.name}`;
            
            progressBarEl.style.width = `${progressPercent}%`;
        } else {
            pointsToNextLevelEl.textContent = "Max Level Reached! 🎉";
            progressBarEl.style.width = "100%";
        }
    }

    // --- MODIFIED: checkAndUnlockBadges targets tree nodes ---
    function checkAndUnlockBadges(stats) {
        if (!currentUser.unlockedBadges) currentUser.unlockedBadges = [];
        let newBadgeUnlocked = false;

        for (const [badgeId, config] of Object.entries(BADGE_CONFIG)) {
            const badgeEl = document.getElementById(badgeId);
            if (!badgeEl) continue;

            const isAlreadyUnlocked = currentUser.unlockedBadges.includes(config.title);
            
            if (isAlreadyUnlocked) {
                 badgeEl.classList.remove('locked');
                 badgeEl.classList.add('unlocked'); 
                 continue; 
            }

            if (config.check(stats)) {
                currentUser.unlockedBadges.push(config.title); 
                badgeEl.classList.remove('locked');
                badgeEl.classList.add('unlocked');
                NotificationManager.show(config.title, 'badge');
                newBadgeUnlocked = true;
            } else {
                badgeEl.classList.add('locked');
                badgeEl.classList.remove('unlocked');
            }
        }
        if (newBadgeUnlocked) StorageManager.saveUser(currentUser);
    }

    // --- Render Charts (Adjusted colors slightly) ---
    function renderCharts(stats) {
        // Use consistent chart colors matching the general theme
        const chartColors = ['#65a30d', '#a3e635', '#f59e0b', '#0891b2', '#fde047', '#fb923c']; // Greens, Yellow, Blue, Orange

        if (weeklyChartInstance) weeklyChartInstance.destroy();
        if (actionBreakdownChartInstance) actionBreakdownChartInstance.destroy();

        if (weeklyChartCtx) {
            weeklyChartInstance = new Chart(weeklyChartCtx, {
                type: 'bar',
                data: { 
                    labels: stats.weeklyLabels, 
                    datasets: [{ 
                        label: 'Activities', 
                        data: stats.weeklyData, 
                        backgroundColor: chartColors[0] + '99', // Primary green with opacity
                        borderColor: chartColors[0], 
                        borderWidth: 1, 
                        borderRadius: 4 
                    }] 
                },
                options: { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true, ticks: { stepSize: 1, color: '#6b7280' } }, x: { ticks: { color: '#6b7280' } } }, plugins: { legend: { display: false } } }
            });
        }
        if (actionBreakdownChartCtx && stats.total > 0) {
            const labels = Object.keys(stats.actionCounts);
            const data = Object.values(stats.actionCounts);
            // Cycle through colors for slices
            const backgroundColors = labels.map((_, i) => chartColors[i % chartColors.length]);

            actionBreakdownChartInstance = new Chart(actionBreakdownChartCtx, {
                type: 'doughnut',
                data: { 
                    labels, 
                    datasets: [{ 
                        label: 'Action Breakdown', 
                        data, 
                        backgroundColor: backgroundColors, 
                        borderColor: '#ffffff', // Add white border between slices
                        borderWidth: 2,
                        hoverOffset: 4 
                    }] 
                },
                options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { color: '#6b7280' } } } }
            });
        }
    }


    // --- Main stats update function (Unchanged) ---
    function updateStats() {
        currentUser = StorageManager.getCurrentUser(); 
        const stats = ActivityManager.getStats(currentUser.email);
        totalActionsEl.textContent = stats.total;
        todayActionsEl.textContent = stats.today;
        renderCharts(stats);
        checkAndUnlockBadges(stats);
    }

    // --- MODIFIED: Render activity history for the TIMELINE ---
    function renderActivityHistory() {
        const activities = ActivityManager.getActivities(currentUser.email);
        if (activities.length === 0) {
            activityHistoryEl.innerHTML = '<p class="empty-state">No activities logged yet.</p>';
            return;
        }

        // Limit to about 10-15 items for timeline view
        const html = activities.slice(0, 15).map(activity => `
            <div class="timeline-item">
                <div class="timeline-item-info">
                     <img src="${activity.iconSrc || 'images/favicon.png'}" alt="" /> 
                     <div class="details">
                        <span class="label">${activity.label}</span>
                        <span class="time">${Utils.formatTimestamp(activity.timestamp)}</span>
                     </div>
                </div>
                 <div class="activity-points-delete">
                    <span class="points">+${activity.points} pts</span>
                    <button class="delete-activity-btn" data-timestamp="${activity.timestamp}" title="Delete activity">&times;</button>
                 </div>
            </div>
        `).join('');
        activityHistoryEl.innerHTML = html;
    }

    // --- MODIFIED: Update points with pop animation on SPAN ---
    function updateUserPoints(points) {
        const pointsToAdd = Number(points);
        if (isNaN(pointsToAdd)) return;
        currentUser.ecoPoints += pointsToAdd;
        if (currentUser.ecoPoints < 0) currentUser.ecoPoints = 0; 
        StorageManager.saveUser(currentUser);
        
        // Target the SPAN for text update and animation
        ecoPointsSpanEl.textContent = currentUser.ecoPoints; 
        ecoPointsSpanEl.classList.add('pop'); 
        setTimeout(() => ecoPointsSpanEl.classList.remove('pop'), 400);
        
        updateLevelProgress(currentUser.ecoPoints);
    }

    // --- MODIFIED: Handle eco-action button clicks with image source ---
    actionButtons.forEach(button => {
        button.addEventListener('click', () => {
            const points = parseInt(button.dataset.points);
            const actionType = button.dataset.action;
            const labelEl = button.querySelector('.label'); // Get label element
            if (!labelEl) return; // Safety check
            const label = labelEl.textContent;
            const iconSrc = button.querySelector('img')?.getAttribute('src');

            const activity = {
                action: actionType,
                label: label,
                iconSrc: iconSrc || 'images/favicon.png', 
                points: points,
                timestamp: new Date().toISOString()
            };
            ActivityManager.saveActivity(currentUser.email, activity);
            updateUserPoints(points);
            updateStats();
            renderActivityHistory();
            NotificationManager.show(`+${points} points for ${label}!`, 'success');
            
            // Feedback on button
            button.disabled = true;
            const originalLabel = labelEl.textContent; // Store original text
            labelEl.textContent = 'Added!'; // Change text content
            setTimeout(() => {
                button.disabled = false;
                 labelEl.textContent = originalLabel; // Restore original text
            }, 1500);
        });
    });

    // --- Logout functionality (Unchanged) ---
    logoutBtn.addEventListener('click', () => {
        StorageManager.clearCurrentUser();
        Utils.redirectToLogin();
    });

    // --- Delete Activity Listener (Unchanged logic) ---
    activityHistoryEl.addEventListener('click', (e) => {
        if (e.target.classList.contains('delete-activity-btn')) {
            if (!confirm('Delete this activity? Points will be subtracted.')) return;
            const timestamp = e.target.dataset.timestamp;
            const activities = ActivityManager.getActivities(currentUser.email);
            const activityToDelete = activities.find(a => a.timestamp === timestamp);
            if (!activityToDelete) return;
            const newActivities = activities.filter(a => a.timestamp !== timestamp);
            ActivityManager.overwriteActivities(currentUser.email, newActivities);
            updateUserPoints(-activityToDelete.points); 
            updateStats();
            renderActivityHistory();
            NotificationManager.show(`Activity "${activityToDelete.label}" removed.`, 'warning');
        }
    });

    // --- NEW: Tab Switching Logic ---
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetTab = button.dataset.tab; 
            tabButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            tabContents.forEach(content => {
                content.classList.toggle('active', content.id === `${targetTab}-content`);
            });
        });
    });

    // --- Initial Render function (Unchanged logic) ---
    function initializeDashboard() {
        currentUser = StorageManager.getCurrentUser();
        const greeting = Utils.getPersonalizedGreeting();
        // Update the span inside the welcome message
        const welcomeUserSpan = document.querySelector('.welcome-msg span');
        if (welcomeUserSpan) welcomeUserSpan.textContent = currentUser.name;
         // Set the greeting part
        const welcomeMsgEl = document.querySelector('.welcome-msg');
        if(welcomeMsgEl) welcomeMsgEl.firstChild.textContent = `${greeting}, `; // Set text before the span
       
        ecoPointsSpanEl.textContent = currentUser.ecoPoints; // Target the span
        displayEcoTip();
        updateLevelProgress(currentUser.ecoPoints);
        updateStats(); 
        renderActivityHistory();
        checkAndUnlockBadges(ActivityManager.getStats(currentUser.email)); 
    }

    initializeDashboard();
}

// ==================== LEADERBOARD PAGE ==================== 
if (window.location.pathname.includes('leaderboard.html')) {
    const currentUser = StorageManager.getCurrentUser();
    if (!currentUser) Utils.redirectToLogin();
    const userNameEl = document.getElementById('dashboardUserName'); // Target span in header
    const logoutBtn = document.getElementById('logoutBtn');
    const leaderboardListEl = document.getElementById('leaderboard-list');
    
    // --- MODIFIED: Update personalized greeting in header ---
    const greeting = Utils.getPersonalizedGreeting();
    if (userNameEl) userNameEl.textContent = currentUser.name; // Set name in span
    const welcomeMsgEl = document.querySelector('.welcome-msg');
    if(welcomeMsgEl) welcomeMsgEl.firstChild.textContent = `${greeting}, `; // Set text before span

    logoutBtn.addEventListener('click', () => {
        StorageManager.clearCurrentUser();
        Utils.redirectToLogin();
    });
    function renderLeaderboard() {
        const allUsers = StorageManager.getAllUsers();
        const sortedUsers = Object.values(allUsers).sort((a, b) => (b.ecoPoints || 0) - (a.ecoPoints || 0));
        if (sortedUsers.length === 0) {
            leaderboardListEl.innerHTML = '<p class="empty-state">No users yet.</p>'; return;
        }
        const html = sortedUsers.map((user, index) => {
            const rank = index + 1;
            const points = user.ecoPoints || 0;
            const isCurrentUser = user.email === currentUser.email ? 'style="background-color: var(--color-background); border-color: var(--color-primary);"' : '';
            return `<li class="leaderboard-item" ${isCurrentUser}><span class="rank">${rank}</span><span class="name">${user.name}</span><span class="points">${points} Points</span></li>`;
        }).join('');
        leaderboardListEl.innerHTML = html;
    }
    renderLeaderboard();
}