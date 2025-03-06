const progressSection = document.createElement('div');
    progressSection.id = 'progress';
    progressSection.className = 'full-page';
    
    const overlay = document.createElement('div');
    overlay.className = 'overlay';
    progressSection.appendChild(overlay);
    
    const progressContent = document.createElement('div');
    progressContent.className = 'progress-section';
    
    // Add content to the progress section
    progressContent.innerHTML = `
        <h1>Study Progress</h1>
        <div class="progress-stats">
            <div class="stat-box">
                <h3>Total Study Time</h3>
                <p id="totalStudyTime">${formatTime(studyData.totalStudyTime)}</p>
            </div>
            <div class="stat-box">
                <h3>Current Streak</h3>
                <p id="currentStreak">${studyData.streak} days</p>
            </div>
        </div>
        <div class="achievements-container">
            <h3>Achievements</h3>
            <div id="achievements-list" class="achievements-grid"></div>
        </div>
        <div class="study-calendar">
            <h3>This Month's Activity</h3>
            <div id="calendar-grid" class="calendar-grid"></div>
        </div>
    `;
    
    progressSection.appendChild(progressContent);
    document.body.appendChild(progressSection);
    
    // Add link to navbar
    const navbar = document.querySelector('.navbar');
    const progressLink = document.createElement('a');
    progressLink.href = '#progress';
    progressLink.className = 'nav-link';
    progressLink.textContent = 'Progress';
    navbar.appendChild(progressLink);
    
    // Render achievements
    renderAchievements(studyData.achievements);
    
    // Render calendar
    renderCalendar(studyData.dailyStudy);
    
    // Update progress when timer completes
    const startTimerBtn = document.getElementById('startTimer');
    const originalClickHandler = startTimerBtn.onclick;
    
    startTimerBtn.onclick = function() {
        // Get original timer values
        const hours = parseInt(document.getElementById('hours').value) || 0;
        const minutes = parseInt(document.getElementById('minutes').value) || 0;
        const seconds = parseInt(document.getElementById('seconds').value) || 0;
        
        // Calculate total time in seconds
        const timerTimeInSeconds = hours * 3600 + minutes * 60 + seconds;
        
        // Call original click handler
        if (originalClickHandler) {
            originalClickHandler.call(this);
        }
        
        // Set up completion tracker
        const timerInterval = setInterval(function() {
            const timerDisplay = document.getElementById('timerDisplay').textContent;
            if (timerDisplay === '00:00:00') {
                clearInterval(timerInterval);
                updateStudyProgress(timerTimeInSeconds);
            }
        }, 1000);
    };
}

// Update study progress when timer completes
function updateStudyProgress(timeInSeconds) {
    let studyData = JSON.parse(localStorage.getItem('studyData')) || {
        totalStudyTime: 0,
        dailyStudy: {},
        streak: 0,
        lastStudyDate: null,
        achievements: {
            'Study Novice': false,
            'Study Enthusiast': false,
            'Study Master': false,
            '3-Day Streak': false,
            '7-Day Streak': false,
            '30-Day Streak': false
        }
    };
    
    // Add study time
    studyData.totalStudyTime += timeInSeconds;
    
    // Update today's study time
    const today = new Date().toLocaleDateString();
    studyData.dailyStudy[today] = (studyData.dailyStudy[today] || 0) + timeInSeconds;
    
    // Update streak
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toLocaleDateString();
    
    if (studyData.lastStudyDate === yesterday.toLocaleDateString() || !studyData.lastStudyDate) {
        studyData.streak += 1;
    } else if (studyData.lastStudyDate !== today) {
        studyData.streak = 1;
    }
    
    studyData.lastStudyDate = today;
    
    // Check for achievements
    const totalHours = studyData.totalStudyTime / 3600;
    
    if (totalHours >= 1) studyData.achievements['Study Novice'] = true;
    if (totalHours >= 5) studyData.achievements['Study Enthusiast'] = true;
    if (totalHours >= 20) studyData.achievements['Study Master'] = true;
    
    if (studyData.streak >= 3) studyData.achievements['3-Day Streak'] = true;
    if (studyData.streak >= 7) studyData.achievements['7-Day Streak'] = true;
    if (studyData.streak >= 30) studyData.achievements['30-Day Streak'] = true;
    
    // Save updated data
    localStorage.setItem('studyData', JSON.stringify(studyData));
    
    // Update display
    document.getElementById('totalStudyTime').textContent = formatTime(studyData.totalStudyTime);
    document.getElementById('currentStreak').textContent = `${studyData.streak} days`;
    
    renderAchievements(studyData.achievements);
    renderCalendar(studyData.dailyStudy);
    
    // Show achievement notification if any new ones
    showAchievementNotification(studyData.achievements);
}

// Format seconds into hours, minutes, seconds
function formatTime(totalSeconds) {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    return `${hours}h ${minutes}m ${seconds}s`;
}

// Render achievements
function renderAchievements(achievements) {
    const achievementsList = document.getElementById('achievements-list');
    achievementsList.innerHTML = '';
    
    const achievementIcons = {
        'Study Novice': '🥉',
        'Study Enthusiast': '🥈',
        'Study Master': '🥇',
        '3-Day Streak': '🔥',
        '7-Day Streak': '🔥🔥',
        '30-Day Streak': '🔥🔥🔥'
    };
    
    for (const [achievement, unlocked] of Object.entries(achievements)) {
        const achievementEl = document.createElement('div');
        achievementEl.className = `achievement ${unlocked ? 'unlocked' : 'locked'}`;
        
        achievementEl.innerHTML = `
            <div class="achievement-icon">${unlocked ? achievementIcons[achievement] : '🔒'}</div>
            <div class="achievement-name">${achievement}</div>
        `;
        
        achievementsList.appendChild(achievementEl);
    }
}

// Render calendar
function renderCalendar(dailyStudy) {
    const calendarGrid = document.getElementById('calendar-grid');
    calendarGrid.innerHTML = '';
    
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    
    // Get days in current month
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    
    // Create day labels
    const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    dayLabels.forEach(day => {
        const dayLabel = document.createElement('div');
        dayLabel.className = 'calendar-day-label';
        dayLabel.textContent = day;
        calendarGrid.appendChild(dayLabel);
    });
    
    // Get the day of the week for the first day of the month
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
    
    // Add empty cells for days before first day of month
    for (let i = 0; i < firstDayOfMonth; i++) {
        const emptyDay = document.createElement('div');
        emptyDay.className = 'calendar-day empty';
        calendarGrid.appendChild(emptyDay);
    }
    
    // Create days of month
    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(currentYear, currentMonth, day);
        const dateStr = date.toLocaleDateString();
        
        const dayEl = document.createElement('div');
        dayEl.className = 'calendar-day';
        
        // Check if studied on this day
        if (dailyStudy[dateStr]) {
            const studyTimeInHours = dailyStudy[dateStr] / 3600;
            
            // Determine intensity based on study time
            let intensity = 'low';
            if (studyTimeInHours >= 1) intensity = 'medium';
            if (studyTimeInHours >= 2) intensity = 'high';
            
            dayEl.classList.add('studied', intensity);
            
            // Add tooltip with study time
            dayEl.setAttribute('title', `Studied ${formatTime(dailyStudy[dateStr])}`);
        }
        
        // Highlight today
        if (day === today.getDate()) {
            dayEl.classList.add('today');
        }
        
        dayEl.textContent = day;
        calendarGrid.appendChild(dayEl);
    }
}

// Show achievement notification
function showAchievementNotification(achievements) {
    const recentlyUnlocked = localStorage.getItem('recentAchievements');
    const recentlyUnlockedAchievements = recentlyUnlocked ? JSON.parse(recentlyUnlocked) : {};
    
    // Check for newly unlocked achievements
    const newlyUnlocked = [];
    
    for (const [achievement, unlocked] of Object.entries(achievements)) {
        if (unlocked && !recentlyUnlockedAchievements[achievement]) {
            newlyUnlocked.push(achievement);
            recentlyUnlockedAchievements[achievement] = true;
        }
    }
    
    // Save recently unlocked achievements
    localStorage.setItem('recentAchievements', JSON.stringify(recentlyUnlockedAchievements));
    
    // Show notification for new achievements
    if (newlyUnlocked.length > 0) {
        const notification = document.createElement('div');
        notification.className = 'achievement-notification';
        
        notification.innerHTML = `
            <div class="notification-header">
                <span>🏆 Achievement Unlocked!</span>
                <span class="close-notification">×</span>
            </div>
            <div class="notification-content">
                <p>Congratulations! You've unlocked:</p>
                <ul>
                    ${newlyUnlocked.map(achievement => `<li>${achievement}</li>`).join('')}
                </ul>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Automatically remove notification after 5 seconds
        setTimeout(() => {
            notification.classList.add('hide');
            setTimeout(() => notification.remove(), 500);
        }, 5000);
        
        // Close button functionality
        notification.querySelector('.close-notification').addEventListener('click', () => {
            notification.classList.add('hide');
            setTimeout(() => notification.remove(), 500);
        });
    }
}

document.addEventListener('DOMContentLoaded', function() {
  const hero = document.querySelector('.hero');
  const sections = document.querySelectorAll('.content-section');
  const navLinks = document.querySelectorAll('nav ul li a');
  
  // Initialize the page with proper visibility
  hero.style.display = 'flex';
  hero.style.opacity = '1';
  
  // Make sure all sections are properly initialized (hidden initially)
  sections.forEach(section => {
    section.style.opacity = '0';
    section.style.display = 'none';
  });
  
  // Smooth scrolling and section visibility
  navLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      
      const targetId = this.getAttribute('href');
      
      // Handle the home link (rocket icon)
      if (targetId === 'index.html') {
        // Hide all sections with fade-out effect
        sections.forEach(section => {
          fadeOut(section);
        });
        
        // Show hero section with fade-in effect
        setTimeout(() => {
          hero.style.display = 'flex';
          fadeIn(hero);
        }, 500);
        
        return;
      }
      
      // Fade out hero
      fadeOut(hero);
      
      // Hide all sections
      sections.forEach(section => {
        if (section.id && `#${section.id}` !== targetId) {
          fadeOut(section);
        }
      });
      
      // Show target section with fade-in effect
      const targetSection = document.querySelector(targetId);
      if (targetSection) {
        setTimeout(() => {
          targetSection.style.display = 'flex';
          fadeIn(targetSection);
          
          // Smooth scroll to the section
          targetSection.scrollIntoView({ behavior: 'smooth' });
        }, 500);
      }
    });
  });
  
  // Fix download buttons with proper GitHub links
  const macDownloadBtn = document.getElementById('mac-download-link');
  const windowsDownloadBtn = document.getElementById('windows-download-link');

  if (macDownloadBtn) {
    macDownloadBtn.addEventListener('click', function(e) {
      e.preventDefault(); // Prevent default behavior
      // Replace with your actual GitHub download link for Mac
      window.location.href = 'https://github.com/Rxddy/Asteroid-Destroyer-Game/releases/download/v1.2.5/AsteroidDestroyer_Mac_1.2.5.zip';
    });
  }
  
  if (windowsDownloadBtn) {
    windowsDownloadBtn.addEventListener('click', function(e) {
      e.preventDefault(); // Prevent default behavior
      // Replace with your actual GitHub download link for Windows
      window.location.href = 'https://github.com/Rxddy/Asteroid-Destroyer-Game/releases/download/v1.2.5/AsteroidDestroyer_Win_1.2.5.zip';
    });
  }
  
  // Add pulse animation for download buttons
  const downloadBtns = document.querySelectorAll('.download-btn');
  if (downloadBtns.length) {
    setInterval(() => {
      downloadBtns.forEach(btn => {
        btn.classList.add('pulse');
        setTimeout(() => {
          btn.classList.remove('pulse');
        }, 1000);
      });
    }, 3000);
  }
  
  // Fix: Don't automatically show the download section
  const downloadSection = document.getElementById('download');
  if (downloadSection) {
    downloadSection.style.display = 'none'; // Initially hide
    downloadSection.style.opacity = '0';    // Initially transparent
  }
  
  // Enable contact form
  const contactForm = document.querySelector('.contact-form');
  if (contactForm) {
    const formInputs = contactForm.querySelectorAll('input, textarea');
    formInputs.forEach(input => {
      input.style.pointerEvents = 'auto';
    });
  }

  // Add parallax effect to background
  window.addEventListener('scroll', function() {
    const scrollPosition = window.pageYOffset;
    document.body.style.backgroundPositionY = scrollPosition * 0.5 + 'px';
  });
  
  // Add particle background effect
  createParticles();
  
  // Add interactive hover effects to buttons and links
  addInteractiveEffects();
  
  // Fix: Handle "Play Now" button to redirect to download section
  const heroBtn = document.querySelector('.hero-btn');
  if (heroBtn) {
    heroBtn.addEventListener('click', function(e) {
      e.preventDefault();
      
      // Fade out hero
      fadeOut(hero);
      
      // Hide all other sections
      sections.forEach(section => {
        if (section.id !== 'download') {
          fadeOut(section);
        }
      });
      
      // Show download section
      setTimeout(() => {
        downloadSection.style.display = 'flex';
        fadeIn(downloadSection);
        downloadSection.scrollIntoView({ behavior: 'smooth' });
      }, 500);
    });
  }
  
  // Fix: Handle "Contact Me" button in About section
  const contactBtn = document.querySelector('.contact-btn');
  if (contactBtn) {
    contactBtn.addEventListener('click', function(e) {
      e.preventDefault();
      
      // Get the contact section
      const contactSection = document.getElementById('contact');
      
      // Hide all sections except contact
      sections.forEach(section => {
        if (section.id !== 'contact') {
          fadeOut(section);
        }
      });
      
      // Hide hero
      fadeOut(hero);
      
      // Show contact section
      setTimeout(() => {
        contactSection.style.display = 'flex';
        fadeIn(contactSection);
        contactSection.scrollIntoView({ behavior: 'smooth' });
      }, 500);
    });
  }
});
  
// Utility functions for fade effects
function fadeIn(element) {
  let opacity = 0;
  element.style.opacity = opacity;
  element.style.display = 'flex';  // Ensure the element is visible

  function increaseOpacity() {
    opacity += 0.05;
    if (opacity >= 1) {
      element.style.opacity = 1;
      return;
    }
    element.style.opacity = opacity;
    requestAnimationFrame(increaseOpacity);
  }
  increaseOpacity();
}

function fadeOut(element) {
  let opacity = 1;

  function decreaseOpacity() {
    opacity -= 0.05;
    if (opacity <= 0) {
      element.style.opacity = 0;
      element.style.display = 'none';
      return;
    }
    element.style.opacity = opacity;
    requestAnimationFrame(decreaseOpacity);
  }
  decreaseOpacity();
}

// Create space particles background effect
function createParticles() {
  const existingParticles = document.querySelector('.particles');
  if (existingParticles) {
    existingParticles.remove(); // Clean up previous particles before creating new ones
  }

  const particleContainer = document.createElement('div');
  particleContainer.className = 'particles';
  document.body.appendChild(particleContainer);

  for (let i = 0; i < 50; i++) {
    const particle = document.createElement('div');
    particle.className = 'particle';
    particle.style.left = Math.random() * 100 + 'vw';
    particle.style.top = Math.random() * 100 + 'vh';
    particle.style.width = Math.random() * 3 + 1 + 'px';
    particle.style.height = particle.style.width;
    particle.style.animationDuration = Math.random() * 30 + 10 + 's';
    particle.style.animationDelay = Math.random() * 5 + 's';
    particleContainer.appendChild(particle);
  }
}

// Add interactive effects to various elements
function addInteractiveEffects() {
  // Animate the download buttons with a pulse effect
  const downloadBtns = document.querySelectorAll('.download-btn');
  if (downloadBtns.length) {
    setInterval(() => {
      downloadBtns.forEach(btn => {
        btn.classList.add('pulse');
        setTimeout(() => {
          btn.classList.remove('pulse');
        }, 1000);
      });
    }, 3000);
  }

  // Add tilt effect to game image
  const gameImg = document.querySelector('.game-img');
  if (gameImg) {
    gameImg.addEventListener('mousemove', function(e) {
      const xAxis = (window.innerWidth / 2 - e.pageX) / 25;
      const yAxis = (window.innerHeight / 2 - e.pageY) / 25;
      this.style.transform = `rotateY(${xAxis}deg) rotateX(${yAxis}deg)`;
    });
    
    gameImg.addEventListener('mouseleave', function() {
      this.style.transform = 'rotateY(0deg) rotateX(0deg)';
    });
  }

  // Add hover effects to navigation links
  const navLinks = document.querySelectorAll('nav ul li a');
  navLinks.forEach(link => {
    link.addEventListener('mouseenter', function() {
      this.style.transform = 'scale(1.1)';
      this.style.textShadow = '0 0 10px rgba(255, 255, 255, 0.8)';
    });
    
    link.addEventListener('mouseleave', function() {
      this.style.transform = 'scale(1)';
      this.style.textShadow = 'none';
    });
  });
}

// Game demo animation
function createGameDemo() {
  const gameDemo = document.createElement('div');
  gameDemo.className = 'game-demo';

  const spaceship = document.createElement('div');
  spaceship.className = 'spaceship';

  const asteroid1 = document.createElement('div');
  asteroid1.className = 'asteroid asteroid-1';

  const asteroid2 = document.createElement('div');
  asteroid2.className = 'asteroid asteroid-2';

  const asteroid3 = document.createElement('div');
  asteroid3.className = 'asteroid asteroid-3';

  gameDemo.appendChild(spaceship);
  gameDemo.appendChild(asteroid1);
  gameDemo.appendChild(asteroid2);
  gameDemo.appendChild(asteroid3);

  const gameSection = document.getElementById('game');
  if (gameSection) {
    gameSection.appendChild(gameDemo);
  }
}