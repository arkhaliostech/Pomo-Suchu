console.log('Hello');

let timerInterval;
let isRunning = false;
let timeLeft = 0;
let timerMode = 'focus';
let currentSession = 1;
let totalSessions = 4;
let activeTasks = [];
let completedTasks = [];
let currentPriority = 'medium';
let currentTask = null;
let isExpanded = false;
let editingTaskId = null;

function toggleTheme() {
    document.body.classList.toggle('dark');
    document.body.classList.toggle('light');
    const circle = document.querySelector('.theme-toggle-circle');
    if (document.body.classList.contains('dark')) {
        circle.textContent = '🌙';
    } else {
        circle.textContent = '☀';
    }
}

function toggleExpand() {
    const container = document.getElementById('mainContainer');
    const avatar = document.getElementById('avatar');
    const themeToggle = document.getElementById('themeToggle');
    const controls = document.getElementById('controls');
    
    isExpanded = !isExpanded;
    container.classList.toggle('expanded');
    
    if (isExpanded) {
        avatar.style.opacity = '0';
        avatar.style.visibility = 'hidden';
        themeToggle.style.opacity = '0';
        themeToggle.style.visibility = 'hidden';
        document.addEventListener('mousemove', handleMouseMove);
    } else {
        avatar.style.opacity = '1';
        avatar.style.visibility = 'visible';
        themeToggle.style.opacity = '1';
        themeToggle.style.visibility = 'visible';
        document.removeEventListener('mousemove', handleMouseMove);
        controls.classList.remove('show');
    }
}

function handleMouseMove(e) {
    const controls = document.getElementById('controls');
    const windowHeight = window.innerHeight;
    const mouseY = e.clientY;
    
    if (mouseY > windowHeight - 150) {
        controls.classList.add('show');
    } else {
        controls.classList.remove('show');
    }
}

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

function updateTimer() {
    document.getElementById('timer').textContent = formatTime(timeLeft);
}

function toggleTimer() {
    const startBtn = document.getElementById('startBtn');
    const stopBtn = document.getElementById('stopBtn');
    const resetBtn = document.getElementById('resetBtn');
    
    if (!isRunning) {
        if (timeLeft === 0) {
            const mins = parseInt(document.getElementById('durationMin').value) || 25;
            const secs = parseInt(document.getElementById('durationSec').value) || 0;
            timeLeft = mins * 60 + secs;
        }
        
        isRunning = true;
        startBtn.innerHTML = '⏸ PAUSE';
        stopBtn.classList.add('active');
        resetBtn.classList.add('active');
        
        timerInterval = setInterval(() => {
            if (timeLeft > 0) {
                timeLeft--;
                updateTimer();
            } else {
                stopTimer();
                alert('Session complete!');
                nextSession();
            }
        }, 1000);
    } else {
        isRunning = false;
        startBtn.innerHTML = '▶ START';
        clearInterval(timerInterval);
    }
}

function stopTimer() {
    isRunning = false;
    clearInterval(timerInterval);
    document.getElementById('startBtn').innerHTML = '▶ START';
    document.getElementById('stopBtn').classList.remove('active');
}

function resetTimer() {
    stopTimer();
    const mins = parseInt(document.getElementById('durationMin').value) || 25;
    const secs = parseInt(document.getElementById('durationSec').value) || 0;
    timeLeft = mins * 60 + secs;
    updateTimer();
    document.getElementById('resetBtn').classList.remove('active');
}

function nextSession() {
    currentSession++;
    if (currentSession > totalSessions) {
        currentSession = 1;
    }
    updateSessionTitle();
    resetTimer();
}

function updateSessionTitle() {
    const title = currentTask ? currentTask.title : `Session ${currentSession}`;
    document.getElementById('sessionTitle').textContent = title;
}

function openTaskPopup() {
    document.getElementById('taskPopup').classList.add('active');
    renderTasks();
}

function openMusicPopup() {
    document.getElementById('musicPopup').classList.add('active');
}

function openSettingsPopup() {
    document.getElementById('settingsPopup').classList.add('active');
}

function closePopup(popupId) {
    document.getElementById(popupId).classList.remove('active');
}

function switchTaskTab(tab) {
    document.querySelectorAll('.task-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.task-section').forEach(s => s.classList.remove('active'));
    
    event.target.classList.add('active');
    document.getElementById(tab + 'Section').classList.add('active');
}

function selectPriority(priority) {
    currentPriority = priority;
    document.querySelectorAll('.priority-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
}

function saveTask() {
    const title = document.getElementById('taskTitle').value.trim();
    if (!title) {
        alert('Please enter a task title');
        return;
    }

    if (editingTaskId !== null) {
        // Edit existing task
        const taskIndex = activeTasks.findIndex(t => t.id === editingTaskId);
        if (taskIndex > -1) {
            activeTasks[taskIndex] = {
                ...activeTasks[taskIndex],
                title: title,
                note: document.getElementById('taskNote').value,
                date: document.getElementById('taskDate').value,
                priority: currentPriority
            };
        }
        editingTaskId = null;
    } else {
        // Add new task
        const task = {
            id: Date.now(),
            title: title,
            note: document.getElementById('taskNote').value,
            date: document.getElementById('taskDate').value,
            priority: currentPriority,
            completed: false
        };
        activeTasks.push(task);
    }
    
    clearTaskForm();
    switchTaskTab('active');
    renderTasks();
}

function clearTaskForm() {
    document.getElementById('taskTitle').value = '';
    document.getElementById('taskNote').value = '';
    document.getElementById('taskDate').value = '';
    document.querySelectorAll('.priority-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelector('[data-priority="medium"]').classList.add('active');
    currentPriority = 'medium';
    
    document.getElementById('saveTaskBtn').innerHTML = '➕ ADD TASK';
    document.getElementById('cancelEditBtn').style.display = 'none';
}

function cancelEdit() {
    editingTaskId = null;
    clearTaskForm();
    switchTaskTab('active');
}

function editTask(taskId) {
    const task = activeTasks.find(t => t.id === taskId) || completedTasks.find(t => t.id === taskId);
    if (!task) return;
    
    editingTaskId = taskId;
    document.getElementById('taskTitle').value = task.title;
    document.getElementById('taskNote').value = task.note;
    document.getElementById('taskDate').value = task.date;
    
    document.querySelectorAll('.priority-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelector(`[data-priority="${task.priority}"]`).classList.add('active');
    currentPriority = task.priority;
    
    document.getElementById('saveTaskBtn').innerHTML = '💾 UPDATE TASK';
    document.getElementById('cancelEditBtn').style.display = 'flex';
    
    switchTaskTab('add');
}

function deleteTask(taskId) {
    if (!confirm('Are you sure you want to delete this task?')) return;
    
    activeTasks = activeTasks.filter(t => t.id !== taskId);
    completedTasks = completedTasks.filter(t => t.id !== taskId);
    
    if (currentTask && currentTask.id === taskId) {
        currentTask = null;
        updateSessionTitle();
    }
    
    renderTasks();
}

function markAsDone(taskId) {
    const taskIndex = activeTasks.findIndex(t => t.id === taskId);
    if (taskIndex > -1) {
        const task = activeTasks.splice(taskIndex, 1)[0];
        task.completed = true;
        completedTasks.push(task);
        renderTasks();
    }
}

function markAsActive(taskId) {
    const taskIndex = completedTasks.findIndex(t => t.id === taskId);
    if (taskIndex > -1) {
        const task = completedTasks.splice(taskIndex, 1)[0];
        task.completed = false;
        activeTasks.push(task);
        renderTasks();
    }
}

function renderTasks() {
    renderActiveList();
    renderDoneList();
}

function renderActiveList() {
    const activeList = document.getElementById('activeList');
    const activeEmpty = document.getElementById('activeEmpty');

    activeList.innerHTML = '';

    if (activeTasks.length === 0) {
        activeEmpty.style.display = 'block';
    } else {
        activeEmpty.style.display = 'none';
        activeTasks.forEach(task => {
            const taskEl = createTaskElement(task, false);
            activeList.appendChild(taskEl);
        });
    }
}

function renderDoneList() {
    const doneList = document.getElementById('doneList');
    const doneEmpty = document.getElementById('doneEmpty');

    doneList.innerHTML = '';

    if (completedTasks.length === 0) {
        doneEmpty.style.display = 'block';
    } else {
        doneEmpty.style.display = 'none';
        completedTasks.forEach(task => {
            const taskEl = createTaskElement(task, true);
            doneList.appendChild(taskEl);
        });
    }
}

function createTaskElement(task, isDone) {
    const div = document.createElement('div');
    div.className = 'task-item';
    div.dataset.id = task.id;
    
    // Add selected class if this is the current task
    if (currentTask && currentTask.id === task.id) {
        div.classList.add('selected');
    }
    
    const priorityColor = task.priority === 'high' ? '#d32f2f' : 
                         task.priority === 'low' ? '#388e3c' : '#f57c00';
    
    div.innerHTML = `
        <div class="task-header">
            <div class="task-title-clickable" onclick="selectTaskForSession(${task.id})">
                ${task.title}
            </div>
            <div class="task-actions">
                ${!isDone ? `<button class="task-action-btn" onclick="event.stopPropagation(); markAsDone(${task.id})" title="Mark as done">✓</button>` : 
                           `<button class="task-action-btn" onclick="event.stopPropagation(); markAsActive(${task.id})" title="Mark as active">↺</button>`}
                <button class="task-action-btn" onclick="event.stopPropagation(); editTask(${task.id})" title="Edit">✎</button>
                <button class="task-action-btn delete" onclick="event.stopPropagation(); deleteTask(${task.id})" title="Delete">✕</button>
            </div>
        </div>
        <div class="task-meta">
            <span style="color: ${priorityColor}; font-weight: bold;">● ${task.priority.toUpperCase()}</span> | 
            Date: ${task.date || 'No date'}
        </div>
        ${task.note ? `<div class="task-note">${task.note}</div>` : ''}
    `;

    return div;
}

function selectTaskForSession(taskId) {
    const task = activeTasks.find(t => t.id === taskId) || completedTasks.find(t => t.id === taskId);
    if (task) {
        currentTask = task;
        updateSessionTitle();
        renderTasks(); // Re-render to show selection
        closePopup('taskPopup');
    }
}

function openSpotify(playlist) {
    const playlists = {
        'lofi': 'https://open.spotify.com/playlist/37i9dQZF1DWWQRwui0ExPn',
        'focus': 'https://open.spotify.com/playlist/37i9dQZF1DWZeKCadgRdKQ',
        'study': 'https://open.spotify.com/playlist/37i9dQZF1DX8NTLI2TtZa6',
        'ambient': 'https://open.spotify.com/playlist/37i9dQZF1DWZd79rJ6a7lp',
        'piano': 'https://open.spotify.com/playlist/37i9dQZF1DX4sWSpwq3LiO'
    };
    window.open(playlists[playlist], '_blank');
}

function setTimerMode(mode) {
    timerMode = mode;
    const focusBtn = document.getElementById('focusModeBtn');
    const pomodoroBtn = document.getElementById('pomodoroModeBtn');
    
    if (mode === 'focus') {
        focusBtn.classList.add('active');
        pomodoroBtn.classList.remove('active');
        document.getElementById('durationMin').value = '50';
        document.getElementById('durationSec').value = '0';
    } else {
        focusBtn.classList.remove('active');
        pomodoroBtn.classList.add('active');
        document.getElementById('durationMin').value = '25';
        document.getElementById('durationSec').value = '0';
    }
}

function saveSettings() {
    totalSessions = parseInt(document.getElementById('sessionCount').value);
    const mins = parseInt(document.getElementById('durationMin').value) || 25;
    const secs = parseInt(document.getElementById('durationSec').value) || 0;
    timeLeft = mins * 60 + secs;
    updateTimer();
    closePopup('settingsPopup');
    alert('Settings saved!');
}

window.onload = function() {
    const mins = parseInt(document.getElementById('durationMin').value) || 25;
    const secs = parseInt(document.getElementById('durationSec').value) || 0;
    timeLeft = mins * 60 + secs;
    updateTimer();
    updateSessionTitle();
};
