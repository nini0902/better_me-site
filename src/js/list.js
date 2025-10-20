document.addEventListener('DOMContentLoaded', function() {
    const grid = document.getElementById('grid');
    const empty = document.getElementById('empty');
    const searchInput = document.getElementById('q');
    const exportBtn = document.getElementById('exportAll');
    const clearBtn = document.getElementById('clearAll');

    // 載入並顯示目標
    function loadGoals(query = '') {
        const goals = JSON.parse(localStorage.getItem('goals') || '[]');
        grid.innerHTML = '';

        const filteredGoals = goals.filter(goal => {
            const searchString = (goal.title + goal.category + goal.description).toLowerCase();
            return searchString.includes(query.toLowerCase());
        });

        if (filteredGoals.length === 0) {
            empty.style.display = 'block';
            grid.style.display = 'none';
            return;
        }

        empty.style.display = 'none';
        grid.style.display = 'grid';

        filteredGoals.forEach(goal => {
            const startDate = new Date(goal.startDate);
            const targetDate = new Date(goal.targetDate);
            const today = new Date();
            
            // 計算進度百分比
            const totalDays = (targetDate - startDate) / (1000 * 60 * 60 * 24);
            const passedDays = (today - startDate) / (1000 * 60 * 60 * 24);
            const progress = Math.min(Math.max(Math.round((passedDays / totalDays) * 100), 0), 100);

            const card = document.createElement('div');
            card.className = 'card';
            card.innerHTML = `
                <div class="row">
                    <h3>${goal.title}</h3>
                    <span class="badge">${goal.category}</span>
                </div>
                <p class="muted">${goal.description}</p>
                <div class="progress">
                    <div class="bar" style="width: ${progress}%"></div>
                </div>
                <div class="row">
                    <small class="muted">目標日期: ${goal.targetDate}</small>
                    <button class="btn" onclick="deleteGoal('${goal.id}')">刪除</button>
                </div>
            `;
            grid.appendChild(card);
        });
    }

    // 刪除目標
    window.deleteGoal = function(goalId) {
        if (!confirm('確定要刪除這個目標嗎？')) return;

        const goals = JSON.parse(localStorage.getItem('goals') || '[]');
        const updatedGoals = goals.filter(goal => goal.id !== goalId);
        localStorage.setItem('goals', JSON.stringify(updatedGoals));
        loadGoals(searchInput.value);
    };

    // 搜尋功能
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            loadGoals(e.target.value);
        });
    }

    // 匯出功能
    if (exportBtn) {
        exportBtn.addEventListener('click', () => {
            const goals = localStorage.getItem('goals') || '[]';
            const blob = new Blob([goals], {type: 'application/json'});
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'better-me-goals.json';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        });
    }

    // 清除所有目標
    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            if (confirm('確定要清除所有目標嗎？此操作無法復原！')) {
                localStorage.removeItem('goals');
                loadGoals();
            }
        });
    }

    // 初始載入
    loadGoals();
});