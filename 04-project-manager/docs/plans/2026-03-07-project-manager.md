# Project Manager App Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 단일 index.html 파일로 동작하는 프로젝트/태스크 관리 앱 구현.

**Architecture:** 2-패널 레이아웃(좌: 프로젝트, 우: 태스크), localStorage에 JSON 저장, 순수 Vanilla JS로 상태 관리 및 DOM 렌더링.

**Tech Stack:** HTML5, CSS3 (Grid/Flexbox), Vanilla JS (ES6+), localStorage

---

### Task 1: HTML 뼈대 + CSS 레이아웃

**Files:**
- Create: `index.html`

**Step 1: index.html 파일 생성 — HTML 구조 + CSS**

```html
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>프로젝트 관리</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f0f2f5; height: 100vh; display: flex; flex-direction: column; }

    header { background: #1a1a2e; color: white; padding: 16px 24px; font-size: 18px; font-weight: 600; }

    .app { display: grid; grid-template-columns: 280px 1fr; height: calc(100vh - 53px); }

    /* 프로젝트 패널 */
    .project-panel { background: #16213e; color: #e0e0e0; display: flex; flex-direction: column; border-right: 1px solid #0f3460; }
    .panel-header { padding: 16px; border-bottom: 1px solid #0f3460; }
    .panel-header h2 { font-size: 13px; text-transform: uppercase; letter-spacing: 1px; color: #888; margin-bottom: 12px; }
    .add-form { display: flex; gap: 8px; }
    .add-form input { flex: 1; padding: 8px 10px; background: #0f3460; border: 1px solid #1a4a8a; border-radius: 6px; color: white; font-size: 13px; outline: none; }
    .add-form input:focus { border-color: #4a9eff; }
    .add-form input::placeholder { color: #666; }
    .btn-add { padding: 8px 12px; background: #4a9eff; border: none; border-radius: 6px; color: white; cursor: pointer; font-size: 13px; white-space: nowrap; }
    .btn-add:hover { background: #3a8eef; }

    .project-list { flex: 1; overflow-y: auto; padding: 8px; }
    .project-item { display: flex; align-items: center; gap: 8px; padding: 10px 12px; border-radius: 8px; cursor: pointer; margin-bottom: 4px; transition: background 0.15s; }
    .project-item:hover { background: #1a4a8a22; }
    .project-item.active { background: #4a9eff22; border-left: 3px solid #4a9eff; }
    .project-item .project-name { flex: 1; font-size: 14px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .project-item .task-count { font-size: 11px; color: #666; background: #0f3460; padding: 2px 7px; border-radius: 10px; }
    .project-item .btn-icon { background: none; border: none; color: #666; cursor: pointer; padding: 2px 5px; border-radius: 4px; font-size: 12px; opacity: 0; }
    .project-item:hover .btn-icon { opacity: 1; }
    .project-item .btn-icon:hover { background: #ffffff22; color: #ff6b6b; }
    .project-name-input { flex: 1; background: #0f3460; border: 1px solid #4a9eff; border-radius: 4px; color: white; font-size: 14px; padding: 2px 6px; outline: none; }

    /* 태스크 패널 */
    .task-panel { background: #f0f2f5; display: flex; flex-direction: column; overflow: hidden; }
    .task-panel-header { padding: 20px 24px 16px; background: white; border-bottom: 1px solid #e0e0e0; }
    .task-panel-header h2 { font-size: 18px; font-weight: 600; color: #1a1a2e; margin-bottom: 12px; }
    .task-add-form { display: flex; gap: 8px; }
    .task-add-form input { flex: 1; padding: 10px 14px; border: 1px solid #ddd; border-radius: 8px; font-size: 14px; outline: none; }
    .task-add-form input:focus { border-color: #4a9eff; }
    .task-add-form .btn-add { padding: 10px 16px; }

    .task-list { flex: 1; overflow-y: auto; padding: 16px 24px; }
    .task-item { background: white; border-radius: 10px; padding: 14px 16px; margin-bottom: 10px; display: flex; align-items: center; gap: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.08); transition: box-shadow 0.15s; }
    .task-item:hover { box-shadow: 0 2px 8px rgba(0,0,0,0.12); }
    .task-title { flex: 1; font-size: 14px; color: #333; }
    .task-title-input { flex: 1; border: 1px solid #4a9eff; border-radius: 4px; padding: 3px 8px; font-size: 14px; outline: none; }
    .status-badge { padding: 4px 10px; border-radius: 20px; font-size: 12px; font-weight: 500; cursor: pointer; border: none; }
    .status-select { padding: 4px 8px; border-radius: 20px; font-size: 12px; font-weight: 500; cursor: pointer; border: 1px solid #ddd; background: white; outline: none; }
    .status-todo { background: #fff3cd; color: #856404; }
    .status-inprogress { background: #cce5ff; color: #004085; }
    .status-done { background: #d4edda; color: #155724; }
    .btn-delete { background: none; border: none; color: #ccc; cursor: pointer; font-size: 16px; padding: 2px 6px; border-radius: 4px; }
    .btn-delete:hover { color: #ff6b6b; background: #fff0f0; }

    .empty-state { text-align: center; color: #999; margin-top: 80px; }
    .empty-state .icon { font-size: 48px; margin-bottom: 12px; }
    .empty-state p { font-size: 14px; }

    /* 스크롤바 */
    ::-webkit-scrollbar { width: 6px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: #ccc; border-radius: 3px; }
  </style>
</head>
<body>
  <header>프로젝트 관리</header>
  <div class="app">
    <aside class="project-panel">
      <div class="panel-header">
        <h2>프로젝트</h2>
        <div class="add-form">
          <input type="text" id="projectInput" placeholder="새 프로젝트 이름" />
          <button class="btn-add" onclick="addProject()">추가</button>
        </div>
      </div>
      <div class="project-list" id="projectList"></div>
    </aside>
    <main class="task-panel">
      <div class="task-panel-header">
        <h2 id="taskPanelTitle">프로젝트를 선택하세요</h2>
        <div class="task-add-form" id="taskAddForm" style="display:none">
          <input type="text" id="taskInput" placeholder="새 태스크 입력" />
          <button class="btn-add" onclick="addTask()">추가</button>
        </div>
      </div>
      <div class="task-list" id="taskList">
        <div class="empty-state">
          <div class="icon">📋</div>
          <p>왼쪽에서 프로젝트를 선택하거나<br>새 프로젝트를 추가하세요.</p>
        </div>
      </div>
    </main>
  </div>
</body>
</html>
```

**Step 2: 브라우저에서 열어 레이아웃 확인**

`index.html`을 브라우저에서 열어 2-패널 레이아웃이 올바르게 렌더링되는지 확인.

---

### Task 2: localStorage 데이터 레이어 + 프로젝트 CRUD JS

**Files:**
- Modify: `index.html` — `<script>` 태그 추가 (</body> 직전)

**Step 1: 상태 관리 + localStorage 헬퍼 추가**

```javascript
// --- State ---
let state = {
  projects: [],
  selectedProjectId: null
};

// --- Storage ---
function saveToStorage() {
  localStorage.setItem('pm_projects', JSON.stringify(state.projects));
}

function loadFromStorage() {
  const data = localStorage.getItem('pm_projects');
  state.projects = data ? JSON.parse(data) : [];
}

function genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}
```

**Step 2: 프로젝트 CRUD 함수 추가**

```javascript
// --- Project CRUD ---
function addProject() {
  const input = document.getElementById('projectInput');
  const name = input.value.trim();
  if (!name) return;
  const project = { id: genId(), name, createdAt: new Date().toISOString(), tasks: [] };
  state.projects.push(project);
  saveToStorage();
  input.value = '';
  renderProjects();
  selectProject(project.id);
}

function deleteProject(id) {
  state.projects = state.projects.filter(p => p.id !== id);
  if (state.selectedProjectId === id) state.selectedProjectId = null;
  saveToStorage();
  renderProjects();
  renderTasks();
}

function startEditProject(id) {
  const item = document.querySelector(`[data-project-id="${id}"]`);
  const nameEl = item.querySelector('.project-name');
  const currentName = nameEl.textContent;
  const input = document.createElement('input');
  input.className = 'project-name-input';
  input.value = currentName;
  nameEl.replaceWith(input);
  input.focus();
  input.select();
  const save = () => {
    const newName = input.value.trim() || currentName;
    const project = state.projects.find(p => p.id === id);
    if (project) { project.name = newName; saveToStorage(); }
    renderProjects();
  };
  input.addEventListener('blur', save);
  input.addEventListener('keydown', e => { if (e.key === 'Enter') input.blur(); if (e.key === 'Escape') { input.value = currentName; input.blur(); } });
}

function selectProject(id) {
  state.selectedProjectId = id;
  renderProjects();
  renderTasks();
}
```

**Step 3: 프로젝트 렌더 함수**

```javascript
// --- Render Projects ---
function renderProjects() {
  const list = document.getElementById('projectList');
  if (state.projects.length === 0) {
    list.innerHTML = '<p style="text-align:center;color:#666;padding:20px;font-size:13px;">프로젝트가 없습니다.</p>';
    return;
  }
  list.innerHTML = state.projects.map(p => `
    <div class="project-item ${p.id === state.selectedProjectId ? 'active' : ''}"
         data-project-id="${p.id}"
         onclick="selectProject('${p.id}')">
      <span class="project-name">${escHtml(p.name)}</span>
      <span class="task-count">${p.tasks.length}</span>
      <button class="btn-icon" onclick="event.stopPropagation();startEditProject('${p.id}')" title="수정">✏️</button>
      <button class="btn-icon" onclick="event.stopPropagation();deleteProject('${p.id}')" title="삭제">🗑️</button>
    </div>
  `).join('');
}

function escHtml(str) {
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
```

**Step 4: Enter 키 지원**

```javascript
document.getElementById('projectInput').addEventListener('keydown', e => {
  if (e.key === 'Enter') addProject();
});
```

---

### Task 3: 태스크 CRUD JS

**Files:**
- Modify: `index.html` — script 영역에 추가

**Step 1: 태스크 CRUD 함수**

```javascript
// --- Task CRUD ---
function addTask() {
  const input = document.getElementById('taskInput');
  const title = input.value.trim();
  if (!title || !state.selectedProjectId) return;
  const project = state.projects.find(p => p.id === state.selectedProjectId);
  if (!project) return;
  project.tasks.push({ id: genId(), title, status: 'todo', createdAt: new Date().toISOString() });
  saveToStorage();
  input.value = '';
  renderTasks();
}

function deleteTask(taskId) {
  const project = state.projects.find(p => p.id === state.selectedProjectId);
  if (!project) return;
  project.tasks = project.tasks.filter(t => t.id !== taskId);
  saveToStorage();
  renderProjects(); // task count 업데이트
  renderTasks();
}

function updateTaskStatus(taskId, status) {
  const project = state.projects.find(p => p.id === state.selectedProjectId);
  if (!project) return;
  const task = project.tasks.find(t => t.id === taskId);
  if (task) { task.status = status; saveToStorage(); renderTasks(); }
}

function startEditTask(taskId) {
  const item = document.querySelector(`[data-task-id="${taskId}"]`);
  const titleEl = item.querySelector('.task-title');
  const currentTitle = titleEl.textContent;
  const input = document.createElement('input');
  input.className = 'task-title-input';
  input.value = currentTitle;
  titleEl.replaceWith(input);
  input.focus();
  input.select();
  const save = () => {
    const newTitle = input.value.trim() || currentTitle;
    const project = state.projects.find(p => p.id === state.selectedProjectId);
    const task = project?.tasks.find(t => t.id === taskId);
    if (task) { task.title = newTitle; saveToStorage(); }
    renderTasks();
  };
  input.addEventListener('blur', save);
  input.addEventListener('keydown', e => { if (e.key === 'Enter') input.blur(); if (e.key === 'Escape') { input.value = currentTitle; input.blur(); } });
}
```

**Step 2: 태스크 렌더 함수**

```javascript
const STATUS_MAP = {
  todo: { label: '할일', cls: 'status-todo' },
  inprogress: { label: '진행중', cls: 'status-inprogress' },
  done: { label: '완료', cls: 'status-done' }
};

function renderTasks() {
  const project = state.projects.find(p => p.id === state.selectedProjectId);
  const title = document.getElementById('taskPanelTitle');
  const addForm = document.getElementById('taskAddForm');
  const list = document.getElementById('taskList');

  if (!project) {
    title.textContent = '프로젝트를 선택하세요';
    addForm.style.display = 'none';
    list.innerHTML = '<div class="empty-state"><div class="icon">📋</div><p>왼쪽에서 프로젝트를 선택하거나<br>새 프로젝트를 추가하세요.</p></div>';
    return;
  }

  title.textContent = project.name;
  addForm.style.display = 'flex';

  if (project.tasks.length === 0) {
    list.innerHTML = '<div class="empty-state"><div class="icon">✅</div><p>태스크가 없습니다.<br>위에서 새 태스크를 추가하세요.</p></div>';
    return;
  }

  list.innerHTML = project.tasks.map(t => {
    const s = STATUS_MAP[t.status] || STATUS_MAP.todo;
    return `
      <div class="task-item" data-task-id="${t.id}">
        <span class="task-title" ondblclick="startEditTask('${t.id}')">${escHtml(t.title)}</span>
        <select class="status-select ${s.cls}" onchange="updateTaskStatus('${t.id}', this.value)">
          <option value="todo" ${t.status==='todo'?'selected':''}>할일</option>
          <option value="inprogress" ${t.status==='inprogress'?'selected':''}>진행중</option>
          <option value="done" ${t.status==='done'?'selected':''}>완료</option>
        </select>
        <button class="btn-delete" onclick="deleteTask('${t.id}')" title="삭제">✕</button>
      </div>
    `;
  }).join('');

  // status select 색상 동기화
  list.querySelectorAll('.status-select').forEach(sel => {
    sel.addEventListener('change', function() {
      this.className = 'status-select ' + (STATUS_MAP[this.value]?.cls || '');
    });
  });
}
```

**Step 3: Enter 키 지원 + 초기화**

```javascript
document.getElementById('taskInput').addEventListener('keydown', e => {
  if (e.key === 'Enter') addTask();
});

// 앱 초기화
loadFromStorage();
renderProjects();
renderTasks();
```

---

### Task 4: 전체 통합 및 검증

**Files:**
- Modify: `index.html` — 모든 코드를 올바른 순서로 통합

**Step 1: index.html 최종 통합**

위 Task 1~3의 HTML, CSS, JS를 하나의 `index.html`로 통합. JS 전체를 `</body>` 직전 `<script>` 태그 안에 배치.

**Step 2: 기능 검증 체크리스트**

브라우저에서 열고 순서대로 확인:

- [ ] 프로젝트 추가 (이름 입력 후 추가 버튼 / Enter)
- [ ] 프로젝트 클릭 시 오른쪽 태스크 패널 전환
- [ ] 프로젝트 이름 수정 (✏️ 클릭 → 편집 → Enter/blur)
- [ ] 프로젝트 삭제 (🗑️ 클릭)
- [ ] 태스크 추가 (이름 입력 후 추가 / Enter)
- [ ] 태스크 상태 변경 드롭다운
- [ ] 태스크 제목 수정 (더블클릭 → 편집 → Enter/blur)
- [ ] 태스크 삭제 (✕ 버튼)
- [ ] 페이지 새로고침 후 데이터 유지 (localStorage)
- [ ] 태스크 수 카운트 업데이트
