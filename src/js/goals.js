// ==========================
// Better Me - goals.js
// ==========================
(function () {
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => document.querySelectorAll(sel);

  // Elements
  const form = $('#goalForm');
  const goalType = $('#goalType');
  const goalCategory = $('#goalCategory');
  const goalTitle = $('#goalTitle');
  const goalDescription = $('#goalDescription');
  const quantValue = $('#quantValue');
  const quantUnit = $('#quantUnit');
  const smartHint = $('#smartHint');
  const startDate = $('#startDate');
  const targetDate = $('#targetDate');
  const daysLeftText = $('#daysLeftText');

  const habitBlock = $('#habitBlock');
  const freqType = $('#freqType');
  const freqValueWrap = $('#freqValueWrap');
  const freqValue = $('#freqValue');
  const daytime = $('#daytime');
  const restPerWeek = $('#restPerWeek');

  const milestoneContainer = $('#milestoneContainer');
  const applyTemplateBtn = $('#applyTemplate');
  const resetBtn = $('#resetBtn');

  // --------------------------
  // Helpers
  // --------------------------
  const todayISO = () => new Date().toISOString().slice(0, 10);
  startDate.value = todayISO();
  targetDate.value = todayISO();

  function parseDateISO(str) {
    const d = new Date(str);
    return isNaN(d.getTime()) ? null : d;
  }

  function diffDays(a, b) {
    const ms = b - a;
    return Math.ceil(ms / (1000 * 60 * 60 * 24));
  }

  function uid() {
    return 'g_' + Math.random().toString(36).slice(2, 10);
  }

  function readGoals() {
    try {
      return JSON.parse(localStorage.getItem('betterme:goals') || '[]');
    } catch {
      return [];
    }
  }
  function writeGoals(list) {
    localStorage.setItem('betterme:goals', JSON.stringify(list));
  }

  // --------------------------
  // UI behavior
  // --------------------------
  function toggleHabitBlock() {
    const isHabit = goalType.value === 'habit';
    habitBlock.style.display = isHabit ? '' : 'none';
  }
  goalType.addEventListener('change', toggleHabitBlock);
  toggleHabitBlock();

  function toggleFreqValueLabel() {
    const type = freqType.value;
    const label = freqValueWrap.querySelector('label');
    if (type === 'perday') {
      label.textContent = '每日量（例如：20 分鐘 / 2000 ml）';
      freqValue.placeholder = '例如 20（搭配上方單位）';
    } else {
      label.textContent = '每週次數（1~7）';
      freqValue.placeholder = '例如 3（代表每週 3 天）';
      if (Number(freqValue.value) < 1) freqValue.value = 3;
    }
  }
  freqType.addEventListener('change', toggleFreqValueLabel);
  toggleFreqValueLabel();

  // 日期驗證 + 剩餘天數
  function updateDaysLeft() {
    const s = parseDateISO(startDate.value);
    const t = parseDateISO(targetDate.value);
    if (!s || !t) {
      daysLeftText.textContent = '';
      return;
    }
    if (t < s) {
      targetDate.setCustomValidity('目標日期不可早於開始日期');
      daysLeftText.textContent = '⚠ 目標日期不可早於開始日期';
    } else {
      targetDate.setCustomValidity('');
      const d = diffDays(s, t) + 1;
      daysLeftText.textContent = `共 ${d} 天（含開始與目標日）`;
    }
  }
  startDate.addEventListener('change', updateDaysLeft);
  targetDate.addEventListener('change', updateDaysLeft);
  updateDaysLeft();

  // SMART 提示：即時檢查是否有數值 + 單位
  function updateSmartHint() {
    const v = Number(quantValue.value);
    const u = (quantUnit.value || '').trim();
    if (goalType.value === 'habit') {
      if (v > 0 && u) {
        smartHint.textContent = `👍 已可量化：每天/每週的執行量可依「${v} ${u}」規劃與追蹤。`;
      } else {
        smartHint.textContent = '💡 建議提供數值與單位，例如「20 分鐘」「2000 ml」，以利追蹤。';
      }
    } else {
      smartHint.textContent = '';
    }
  }
  [goalType, quantValue, quantUnit].forEach((el) => el.addEventListener('input', updateSmartHint));
  updateSmartHint();

  // 里程碑增刪
  milestoneContainer.addEventListener('click', (e) => {
    if (e.target.classList.contains('add-milestone')) {
      const block = document.createElement('div');
      block.className = 'milestone-item';
      block.innerHTML = `
        <input type="text" name="milestones[]" placeholder="新增一個里程碑…">
        <input type="number" name="weights[]" min="0" max="100" placeholder="權重（選填 %）" class="milestone-weight">
        <button type="button" class="button-secondary remove-milestone">−</button>
      `;
      milestoneContainer.appendChild(block);
    }
    if (e.target.classList.contains('remove-milestone')) {
      const item = e.target.closest('.milestone-item');
      if (item) item.remove();
    }
  });

  // 一鍵範本（依類別帶入）
  const CATEGORY_TEMPLATES = {
    health: {
      title: '每天喝水 2000 ml',
      desc: '從起床開始分段飲水，午前 1000 ml、午后 1000 ml；運動日適度增加。',
      quantValue: 2000,
      quantUnit: 'ml',
      type: 'habit',
      freqType: 'perday',
      freqValue: 2000, // 對 perday，這裡代表量；若只要「次數」可改為 1
    },
    learning: {
      title: '每天閱讀 20 分鐘',
      desc: '以非連續注意力分段（每次 10 分鐘），搭配重點摘要筆記。',
      quantValue: 20,
      quantUnit: '分鐘',
      type: 'habit',
      freqType: 'perday',
      freqValue: 20,
    },
    finance: {
      title: '每日記帳',
      desc: '餐飲、交通、生活費分帳本，日結 + 週回顧。',
      quantValue: 1,
      quantUnit: '次',
      type: 'habit',
      freqType: 'perday',
      freqValue: 1,
    },
  };

  applyTemplateBtn.addEventListener('click', () => {
    const c = goalCategory.value;
    const t = CATEGORY_TEMPLATES[c];
    if (!t) {
      alert('此類別目前沒有範本，可先選「健康/學習/理財」試試。');
      return;
    }
    goalType.value = t.type || 'habit';
    toggleHabitBlock();
    goalTitle.value = t.title || '';
    goalDescription.value = t.desc || '';
    quantValue.value = t.quantValue || '';
    quantUnit.value = t.quantUnit || '';
    freqType.value = t.freqType || 'perday';
    toggleFreqValueLabel();
    freqValue.value = t.freqValue || 1;
    updateSmartHint();
  });

  // --------------------------
  // 排程產生器（Habit 專用）
  // --------------------------
  function generateHabitSchedule(meta) {
    // meta: { startDate, targetDate, quantValue, quantUnit, freqType, freqValue, daytime, restPerWeek }
    const s = parseDateISO(meta.startDate);
    const t = parseDateISO(meta.targetDate);
    const days = diffDays(s, t) + 1;

    const tasks = [];
    for (let i = 0; i < days; i++) {
      const d = new Date(s.getTime());
      d.setDate(s.getDate() + i);
      const dayIndex = i % 7; // 0..6
      const isRest =
        meta.restPerWeek === 2 ? dayIndex >= 5 :
        meta.restPerWeek === 1 ? dayIndex === 6 :
        false;

      let amount = 0;
      if (!isRest) {
        if (meta.freqType === 'perday') {
          amount = Number(meta.freqValue) || 1;
        } else {
          // perweek: 均勻分佈在週一~週五
          const activeDays = 7 - meta.restPerWeek;
          const perWeekTimes = Number(meta.freqValue) || 3;
          const shouldDo =
            activeDays <= 0 ? false :
            // 將 perWeekTimes 大致丟在前幾天
            (dayIndex < perWeekTimes);
          amount = shouldDo ? 1 : 0;
        }
      }

      tasks.push({
        date: d.toISOString().slice(0, 10),
        text: isRest
          ? '休息日：回顧與準備'
          : (meta.daytime === 'morning' ? '早上' : '晚上') +
            `執行 ${amount > 0 ? `${amount}${meta.quantUnit || ''}` : '任務'}`,
        amount,
        unit: meta.quantUnit || '',
        done: false,
        rest: isRest,
      });
    }
    return tasks;
  }

  // --------------------------
  // Submit
  // --------------------------
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    // Validate dates
    const s = parseDateISO(startDate.value);
    const t = parseDateISO(targetDate.value);
    if (!s || !t || t < s) {
      alert('請確認開始與目標日期（目標日期不可早於開始日期）');
      return;
    }

    const id = uid();
    const tags = ($('#tags').value || '')
      .split(',')
      .map((x) => x.trim())
      .filter(Boolean);

    // milestones
    const milestoneInputs = Array.from($$('[name="milestones[]"]'));
    const weightInputs = Array.from($$('[name="weights[]"]'));
    const milestones = milestoneInputs.map((m, idx) => ({
      text: m.value.trim(),
      weight: Number(weightInputs[idx]?.value || 0),
    })).filter(m => m.text.length > 0);

    const base = {
      id,
      type: goalType.value,        // 'habit' | 'project'
      category: goalCategory.value || 'other',
      title: goalTitle.value.trim(),
      description: goalDescription.value.trim(),
      quantValue: Number(quantValue.value || 0),
      quantUnit: (quantUnit.value || '').trim(),
      startDate: startDate.value,
      targetDate: targetDate.value,
      tags,
      milestones,
      visibility: $('#visibility').value || 'private',
      createdAt: new Date().toISOString(),
    };

    let schedule = [];
    if (goalType.value === 'habit') {
      const meta = {
        startDate: base.startDate,
        targetDate: base.targetDate,
        quantValue: base.quantValue,
        quantUnit: base.quantUnit,
        freqType: freqType.value,       // 'perday' | 'perweek'
        freqValue: Number(freqValue.value || 1),
        daytime: daytime.value,         // 'morning' | 'evening'
        restPerWeek: Number(restPerWeek.value || 1),
      };
      schedule = generateHabitSchedule(meta);
    }

    const payload = { ...base, schedule };

    // Save to localStorage
    const list = readGoals();
    list.push(payload);
    writeGoals(list);

    // Optional: GUN sync (if Gun loaded)
    if (window.Gun) {
      try {
        const gun = Gun(['https://gun-manhattan.herokuapp.com/gun']); // 可改你的中繼伺服器
        gun.get('betterme').get('goals').get(id).put(payload);
      } catch {
        // ignore
      }
    }

    alert('已建立目標！');
    // 導向到目標列表（若你有）
    window.location.href = 'list.html';
  });

  // Reset
  resetBtn.addEventListener('click', () => {
    smartHint.textContent = '';
    daysLeftText.textContent = '';
    // 保持頁面不跳轉
  });
})();
