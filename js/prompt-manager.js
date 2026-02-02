class PromptManager {
    constructor() {
        this.init();
    }

    init() {
        this.bindEvents();
        this.populateCategories();
        this.loadCurrentProject();
    }

    bindEvents() {
        document.getElementById('btn-new-prompt').addEventListener('click', () => this.createNewProject());
        document.getElementById('btn-save-prompt').addEventListener('click', () => this.saveProject());
        document.getElementById('btn-load-prompt').addEventListener('click', () => this.showProjectPicker());
        document.getElementById('prompt-category').addEventListener('change', (e) => this.onCategoryChange(e.target.value));

        // Modal close
        document.querySelector('.close-modal').addEventListener('click', () => {
            document.getElementById('modal-project-picker').style.display = 'none';
        });

        // Close modal on outside click
        window.addEventListener('click', (e) => {
            const modal = document.getElementById('modal-project-picker');
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });

        // Tab switching
        document.querySelectorAll('#page-prompt .tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('#page-prompt .tab-btn').forEach(b => b.classList.remove('active'));
                document.querySelectorAll('#page-prompt .tab-content').forEach(c => c.classList.remove('active'));

                e.target.classList.add('active');
                const tabId = e.target.getAttribute('data-tab');
                document.getElementById(tabId).classList.add('active');
            });
        });
    }

    populateCategories() {
        const select = document.getElementById('prompt-category');
        select.innerHTML = '';

        // Add categories from templates
        if (typeof APP_TEMPLATES !== 'undefined' && APP_TEMPLATES.categories) {
            for (const key in APP_TEMPLATES.categories) {
                const cat = APP_TEMPLATES.categories[key];
                const option = document.createElement('option');
                option.value = cat.id;
                option.textContent = cat.name;
                select.appendChild(option);
            }
        }

        // Add custom option
        const customOpt = document.createElement('option');
        customOpt.value = 'custom';
        customOpt.textContent = '自定义';
        select.appendChild(customOpt);
    }

    onCategoryChange(categoryId) {
        if (categoryId === 'custom') return;

        if (typeof APP_TEMPLATES !== 'undefined' && APP_TEMPLATES.categories) {
            const cat = APP_TEMPLATES.categories[categoryId];
            if (cat) {
                // Auto-fill defaults if empty or user wants to reset (simple logic: just fill)
                // For better UX, we might check if empty, but here we'll just fill placeholder mainly
                // or update only if it seems default.

                // Let's just update the role and rules input fields with the template defaults
                document.getElementById('prompt-author-role').value = cat.author_role || '';

                let rules = cat.creation_rules || '';
                if (cat.type_hints) rules += '\n【写作要点】' + cat.type_hints;
                if (cat.state_update_guide) rules += '\n【状态追踪】' + cat.state_update_guide;

                document.getElementById('prompt-rules').value = rules;

                // SPECIAL: If professional mode, add a badge or visual indicator (simple console log for now)
                if (categoryId === 'professional') {
                    console.log('专业架构模式已启动');
                }
            }
        }
    }

    async loadCurrentProject() {
        const project = storage.loadProject();
        if (!project) return;

        document.getElementById('prompt-category').value = project.category || 'xuanhuan';
        document.getElementById('prompt-project-name').value = project.name || '';
        document.getElementById('prompt-total-chapters').value = project.totalChapters || 100;
        document.getElementById('prompt-min-words').value = project.minWords || 2000;
        document.getElementById('prompt-max-words').value = project.maxWords || 4000;
        document.getElementById('prompt-author-role').value = project.authorRole || '';
        document.getElementById('prompt-rules').value = project.rules || '';
        document.getElementById('outline-summary').value = project.sellingPoint || '';

        console.log('Project loaded:', project);
    }

    showProjectPicker() {
        const projects = storage.listProjects();
        const container = document.getElementById('project-list-container');
        container.innerHTML = '';

        if (projects.length === 0) {
            container.innerHTML = '<div style="text-align:center; padding:10px; color:#666;">暂无已保存的题材</div>';
        } else {
            projects.forEach(projectName => {
                const item = document.createElement('div');
                item.className = 'project-picker-item';
                item.innerHTML = `
                    <i class="fas fa-book"></i>
                    <span>${projectName}</span>
                `;
                item.onclick = () => this.selectProject(projectName);
                container.appendChild(item);
            });
        }

        document.getElementById('modal-project-picker').style.display = 'block';
    }

    async selectProject(projectName) {
        if (storage.switchProject(projectName)) {
            document.getElementById('modal-project-picker').style.display = 'none';
            await this.refreshAllComponents();
            alert(`已成功加载题材：${projectName}`);
        }
    }

    async refreshAllComponents() {
        await this.loadCurrentProject();

        // Reload settings and list in other pages
        if (typeof settingsManager !== 'undefined') settingsManager.loadSettings();
        if (typeof outlineGenerator !== 'undefined') outlineGenerator.renderOutlineList();
        if (typeof novelGenerator !== 'undefined') {
            document.getElementById('chapter-search').value = '';
            novelGenerator.renderChapterList();
            novelGenerator.resetEditor();
        }
    }

    createNewProject() {
        if (!confirm('确定要新建题材吗？当前未保存的修改可能会丢失。')) return;

        // Reset UI fields
        document.getElementById('prompt-category').value = 'xuanhuan';
        document.getElementById('prompt-project-name').value = '';
        document.getElementById('prompt-project-name').focus();
        document.getElementById('prompt-project-name').select();
        document.getElementById('prompt-total-chapters').value = 100;
        document.getElementById('prompt-min-words').value = 2000;
        document.getElementById('prompt-max-words').value = 4000;
        document.getElementById('prompt-author-role').value = '';
        document.getElementById('prompt-rules').value = '';

        alert('已重置界面，请输入新题材名称并点击“保存题材”以初始化。');
    }

    async saveProject() {
        const projectData = {
            category: document.getElementById('prompt-category').value,
            name: document.getElementById('prompt-project-name').value,
            totalChapters: parseInt(document.getElementById('prompt-total-chapters').value),
            minWords: parseInt(document.getElementById('prompt-min-words').value),
            maxWords: parseInt(document.getElementById('prompt-max-words').value),
            authorRole: document.getElementById('prompt-author-role').value,
            rules: document.getElementById('prompt-rules').value,
            sellingPoint: document.getElementById('outline-summary').value
        };

        if (storage.saveProject(projectData)) {
            this.refreshAllComponents();
            alert('题材保存成功！所有模块已切换至此项目。');
        } else {
            alert('保存失败，请检查存储空间');
        }
    }

    getSystemPrompt() {
        const project = storage.loadProject();
        return `你是一个专业的网文作家。
当前小说设定：
分类：${project.category}
书名：${project.name}

人设要求：
${project.authorRole}

创作规则：
${project.rules}
`;
    }

    // 从分析结果填充创作题材信息
    fillFromAnalysis(analysisResult) {
        if (!analysisResult || !analysisResult.creativeTheme) {
            return false;
        }

        const { creativeTheme, coreSellingPoint } = analysisResult;

        // 设置小说分类
        const categorySelect = document.getElementById('prompt-category');
        if (categorySelect) {
            // 根据分析结果选择合适的分类
            const type = creativeTheme.type || '';
            if (type.includes('玄幻') || type.includes('修真')) {
                categorySelect.value = 'xuanhuan';
            } else if (type.includes('都市') || type.includes('现代')) {
                categorySelect.value = 'dushi';
            } else if (type.includes('科幻') || type.includes('未来')) {
                categorySelect.value = 'kehuan';
            } else if (type.includes('历史') || type.includes('古代')) {
                categorySelect.value = 'lishi';
            } else if (type.includes('言情') || type.includes('爱情')) {
                categorySelect.value = 'yanqing';
            } else if (type.includes('武侠') || type.includes('仙侠')) {
                categorySelect.value = 'wuxia';
            } else {
                categorySelect.value = 'custom';
            }
        }

        // 设置项目名称（如果为空）
        const projectNameInput = document.getElementById('prompt-project-name');
        if (projectNameInput && !projectNameInput.value) {
            // 尝试从分析结果中提取书名
            if (analysisResult.novelSetting && analysisResult.novelSetting.title) {
                projectNameInput.value = analysisResult.novelSetting.title;
            } else {
                projectNameInput.value = '新建小说_' + Math.floor(Math.random() * 10000);
            }
        }

        // 设置作者角色
        const authorRoleTextarea = document.getElementById('prompt-author-role');
        if (authorRoleTextarea) {
            if (creativeTheme.style) {
                authorRoleTextarea.value = `你是一个专业的网文作家，擅长${creativeTheme.style}风格的写作。`;
            }
        }

        // 设置创作规则
        const rulesTextarea = document.getElementById('prompt-rules');
        if (rulesTextarea) {
            let rules = '';
            if (creativeTheme.style) {
                rules += `1. 保持${creativeTheme.style}风格\n`;
            }
            if (creativeTheme.theme) {
                rules += `2. 围绕${creativeTheme.theme}主题展开\n`;
            }
            if (coreSellingPoint) {
                rules += `3. 突出小说的核心卖点：${coreSellingPoint}\n`;
            }
            rulesTextarea.value = rules;
        }

        // 设置核心卖点
        const sellingPointTextarea = document.getElementById('outline-summary');
        if (sellingPointTextarea && coreSellingPoint) {
            sellingPointTextarea.value = coreSellingPoint;
        }

        // 保存到项目数据
        const project = storage.loadProject();
        if (project) {
            project.category = document.getElementById('prompt-category').value;
            project.name = document.getElementById('prompt-project-name').value;
            project.authorRole = document.getElementById('prompt-author-role').value;
            project.rules = document.getElementById('prompt-rules').value;
            project.sellingPoint = document.getElementById('outline-summary').value;
            storage.saveProject(project);
        }

        return true;
    }
}

const promptManager = new PromptManager();
