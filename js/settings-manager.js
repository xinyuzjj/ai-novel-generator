class SettingsManager {
    constructor() {
        this.currentMode = 'short-story';
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadSettings();

        // Listen for automatic updates from AI
        window.addEventListener('settingsUpdated', () => {
            this.loadSettings();
        });
    }

    bindEvents() {
        // Tab switching
        document.querySelectorAll('#page-settings .tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('#page-settings .tab-btn').forEach(b => b.classList.remove('active'));
                document.querySelectorAll('#page-settings .tab-content').forEach(c => c.classList.remove('active'));

                e.target.classList.add('active');
                const tabId = e.target.getAttribute('data-tab');
                document.getElementById(tabId).classList.add('active');
            });
        });

        // Add State Button
        document.getElementById('btn-add-state').addEventListener('click', () => {
            this.addStateRow();
        });

        // Add World Button
        document.getElementById('btn-add-world').addEventListener('click', () => {
            this.addWorldRow();
        });

        // Add Forbidden Button
        document.getElementById('btn-add-forbidden').addEventListener('click', () => {
            this.addForbiddenRow();
        });

        // Add Character Info Button
        document.getElementById('btn-add-character').addEventListener('click', () => {
            this.addCharacterCard();
        });

        // Import Presets
        document.getElementById('btn-import-character-preset').addEventListener('click', () => this.importPresets('character'));
        document.getElementById('btn-import-world-preset').addEventListener('click', () => this.importPresets('world'));
        document.getElementById('btn-import-forbidden-preset').addEventListener('click', () => this.importPresets('forbidden'));
        document.getElementById('btn-import-character-info-preset').addEventListener('click', () => this.importPresets('character-info'));

        // Delete State Button (Delegate)
        document.getElementById('character-state-list').addEventListener('click', (e) => {
            if (e.target.closest('.btn-delete-state')) {
                e.target.closest('.state-row').remove();
            }
        });

        // Delete World Button (Delegate)
        document.getElementById('world-settings-list').addEventListener('click', (e) => {
            if (e.target.closest('.btn-delete-world')) {
                e.target.closest('.world-row').remove();
            }
        });

        // Delete Forbidden Button (Delegate)
        document.getElementById('forbidden-list').addEventListener('click', (e) => {
            if (e.target.closest('.btn-delete-forbidden')) {
                e.target.closest('.forbidden-row').remove();
            }
        });

        // Delete Character Info Button (Delegate)
        document.getElementById('character-info-list').addEventListener('click', (e) => {
            if (e.target.closest('.btn-delete-character')) {
                e.target.closest('.character-card').remove();
            }
        });
    }

    importPresets(type) {
        if (!confirm('导入将覆盖当前未保存的配置，确定要继续吗？')) {
            return;
        }

        const project = storage.loadProject();
        const category = project.category || 'xuanhuan'; // Default

        if (typeof APP_TEMPLATES === 'undefined' || !APP_TEMPLATES.preset_settings) {
            alert('未找到预设模版');
            return;
        }

        const preset = APP_TEMPLATES.preset_settings[category];
        if (!preset && type !== 'forbidden' && type !== 'character-info') {
            alert('当前分类暂无推荐设定');
            return;
        }

        if (type === 'character') {
            if (preset.characterState) {
                this.renderCharacterStates(preset.characterState);
                alert(`已导入【${APP_TEMPLATES.categories[category]?.name || category}】角色状态模版`);
            }
        } else if (type === 'world') {
            if (preset.worldSettings) {
                // Convert object to array of {key, value}
                const worldArray = Object.entries(preset.worldSettings).map(([key, value]) => ({ key, value }));
                this.renderWorldSettings(worldArray);
                alert(`已导入【${APP_TEMPLATES.categories[category]?.name || category}】世界观模版`);
            }
        } else if (type === 'forbidden') {
            // Generic forbidden zones for web novels
            const defaultForbidden = [
                '主角不能死亡',
                '主角不能被NTR',
                '不能出现强制剧情（主角被迫做不愿意的事）',
                '不能出现圣母情节（无脑帮助敌人）',
                '配角智商不能突然下线',
                '不能出现毒点（读者普遍反感的情节）',
                '战力体系要保持一致，不能崩坏',
                '已确立的人设不能OOC（性格崩坏）'
            ];
            this.renderForbidden(defaultForbidden);
            alert('已导入通用网文禁区设定');
        } else if (type === 'character-info') {
            if (preset && preset.characterInfo) {
                this.renderCharacterInfo(preset.characterInfo);
                alert(`已导入【${APP_TEMPLATES.categories[category]?.name || category}】角色模版`);
            } else {
                // Fallback to generic template
                const defaultCharacters = [
                    {
                        name: '主角姓名',
                        gender: '男',
                        age: '18',
                        role: '主角',
                        personality: '冷静、果断、有正义感',
                        appearance: '剑眉星目，身材修长',
                        background: '出身平凡，因机缘踏上修炼之路'
                    },
                    {
                        name: '女主姓名',
                        gender: '女',
                        age: '17',
                        role: '女主',
                        personality: '温柔、善良、坚强',
                        appearance: '倾国倾城，气质出尘',
                        background: '某大势力千金，与主角相遇相知'
                    }
                ];
                this.renderCharacterInfo(defaultCharacters);
                alert('已导入默认角色模版');
            }
        }
    }

    loadSettings() {
        const settings = storage.loadSettingsForMode(this.currentMode);

        // Character State - Dynamic List
        const charState = settings.characterState || [];
        this.renderCharacterStates(charState);

        // World Settings - Dynamic List
        // Convert from object to array if needed
        let worldSettings = settings.worldSettings || [];
        if (!Array.isArray(worldSettings)) {
            // If it's an object, convert to array
            worldSettings = Object.entries(worldSettings).map(([key, value]) => ({ key, value }));
        }
        this.renderWorldSettings(worldSettings);

        // Forbidden - Dynamic List
        const forbidden = settings.forbidden || [];
        this.renderForbidden(forbidden);

        // Character Info
        const characterInfo = settings.characterInfo || [];
        this.renderCharacterInfo(characterInfo);
    }

    saveSettings() {
        try {
            const charState = this.getCharacterStates();
            const worldSettings = this.getWorldSettings();
            const forbidden = this.getForbidden();
            const characterInfo = this.getCharacterInfo();

            const settings = {
                characterState: charState,
                worldSettings: worldSettings,
                forbidden: forbidden,
                characterInfo: characterInfo
            };

            if (storage.saveSettingsForMode(this.currentMode, settings)) {
                alert('设定保存成功！');
            }
        } catch (e) {
            console.error(e);
            alert('保存时发生意外错误');
        }
    }

    renderCharacterStates(states) {
        const container = document.getElementById('character-state-list');
        container.innerHTML = '';

        if (Array.isArray(states)) {
            states.forEach(item => {
                this.addStateRow(item.key, item.value);
            });
        }

        // Add one empty row if empty
        if (container.children.length === 0) {
            this.addStateRow();
        }
    }

    addStateRow(key = '', value = '') {
        const container = document.getElementById('character-state-list');
        const row = document.createElement('div');
        row.className = 'state-row form-row mb-2'; // mb-2 for spacing
        row.style.marginBottom = '10px';
        row.style.alignItems = 'center';

        row.innerHTML = `
            <div class="col" style="flex: 1;">
                <input type="text" class="form-control state-key" placeholder="状态名称 (如: 等级)" value="${key}">
            </div>
            <div class="col" style="flex: 2;">
                <input type="text" class="form-control state-value" placeholder="当前值 (如: 练气三层)" value="${value}">
            </div>
            <div class="col-auto">
                <button class="btn btn-sm btn-danger btn-delete-state">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        container.appendChild(row);
    }

    getCharacterStates() {
        const states = [];
        document.querySelectorAll('#character-state-list .state-row').forEach(row => {
            const key = row.querySelector('.state-key').value.trim();
            const value = row.querySelector('.state-value').value.trim();
            if (key) {
                states.push({ key, value });
            }
        });
        return states;
    }

    renderWorldSettings(settings) {
        const container = document.getElementById('world-settings-list');
        container.innerHTML = '';

        if (Array.isArray(settings)) {
            settings.forEach(item => {
                this.addWorldRow(item.key, item.value);
            });
        }

        // Add one empty row if empty
        if (container.children.length === 0) {
            this.addWorldRow();
        }
    }

    addWorldRow(key = '', value = '') {
        const container = document.getElementById('world-settings-list');
        const row = document.createElement('div');
        row.className = 'world-row form-row mb-2';
        row.style.marginBottom = '10px';
        row.style.alignItems = 'center';

        row.innerHTML = `
            <div class="col" style="flex: 1;">
                <input type="text" class="form-control world-key" placeholder="设定名称 (如: 修炼体系)" value="${key}">
            </div>
            <div class="col" style="flex: 2;">
                <input type="text" class="form-control world-value" placeholder="内容 (如: 练气-筑基-金丹...)" value="${value}">
            </div>
            <div class="col-auto">
                <button class="btn btn-sm btn-danger btn-delete-world">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        container.appendChild(row);
    }

    getWorldSettings() {
        const settings = [];
        document.querySelectorAll('#world-settings-list .world-row').forEach(row => {
            const key = row.querySelector('.world-key').value.trim();
            const value = row.querySelector('.world-value').value.trim();
            if (key) {
                settings.push({ key, value });
            }
        });
        return settings;
    }

    renderForbidden(items) {
        const container = document.getElementById('forbidden-list');
        container.innerHTML = '';

        if (Array.isArray(items)) {
            items.forEach(item => {
                this.addForbiddenRow(item);
            });
        }

        // Add one empty row if empty
        if (container.children.length === 0) {
            this.addForbiddenRow();
        }
    }

    addForbiddenRow(text = '') {
        const container = document.getElementById('forbidden-list');
        const row = document.createElement('div');
        row.className = 'forbidden-row form-row mb-2';
        row.style.marginBottom = '10px';
        row.style.alignItems = 'center';

        row.innerHTML = `
            <div class="col">
                <input type="text" class="form-control forbidden-text" placeholder="禁区规则 (如: 主角不能死亡)" value="${text}">
            </div>
            <div class="col-auto">
                <button class="btn btn-sm btn-danger btn-delete-forbidden">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        container.appendChild(row);
    }

    getForbidden() {
        const items = [];
        document.querySelectorAll('#forbidden-list .forbidden-row').forEach(row => {
            const text = row.querySelector('.forbidden-text').value.trim();
            if (text) {
                items.push(text);
            }
        });
        return items;
    }

    renderCharacterInfo(characters) {
        const container = document.getElementById('character-info-list');
        container.innerHTML = '';

        if (Array.isArray(characters) && characters.length > 0) {
            characters.forEach(char => {
                this.addCharacterCard(char);
            });
        } else {
            // Add one empty card if empty
            this.addCharacterCard();
        }
    }

    addCharacterCard(char = {}) {
        const container = document.getElementById('character-info-list');
        const card = document.createElement('div');
        card.className = 'character-card';

        const name = char.name || '';
        const gender = char.gender || '';
        const age = char.age || '';
        const role = char.role || '';
        const personality = char.personality || '';
        const appearance = char.appearance || '';
        const background = char.background || '';

        card.innerHTML = `
            <div class="character-card-header">
                <h4>${name || '新角色'}</h4>
                <button class="btn btn-sm btn-danger btn-delete-character">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
            <div class="character-card-body">
                <div class="character-field">
                    <label>姓名:</label>
                    <input type="text" class="char-name" value="${name}" placeholder="角色姓名">
                </div>
                <div class="character-field">
                    <label>性别:</label>
                    <input type="text" class="char-gender" value="${gender}" placeholder="男/女">
                </div>
                <div class="character-field">
                    <label>年龄:</label>
                    <input type="text" class="char-age" value="${age}" placeholder="18">
                </div>
                <div class="character-field">
                    <label>角色:</label>
                    <input type="text" class="char-role" value="${role}" placeholder="主角/女主/配角">
                </div>
                <div class="character-field">
                    <label>性格:</label>
                    <textarea class="char-personality" placeholder="性格特点">${personality}</textarea>
                </div>
                <div class="character-field">
                    <label>外貌:</label>
                    <textarea class="char-appearance" placeholder="外貌描述">${appearance}</textarea>
                </div>
                <div class="character-field">
                    <label>背景:</label>
                    <textarea class="char-background" placeholder="角色背景">${background}</textarea>
                </div>
            </div>
        `;

        // Update header when name changes
        const nameInput = card.querySelector('.char-name');
        nameInput.addEventListener('input', (e) => {
            const header = card.querySelector('.character-card-header h4');
            header.textContent = e.target.value || '新角色';
        });

        container.appendChild(card);
    }

    getCharacterInfo() {
        const characters = [];
        document.querySelectorAll('#character-info-list .character-card').forEach(card => {
            const char = {
                name: card.querySelector('.char-name').value.trim(),
                gender: card.querySelector('.char-gender').value.trim(),
                age: card.querySelector('.char-age').value.trim(),
                role: card.querySelector('.char-role').value.trim(),
                personality: card.querySelector('.char-personality').value.trim(),
                appearance: card.querySelector('.char-appearance').value.trim(),
                background: card.querySelector('.char-background').value.trim()
            };
            if (char.name) {
                characters.push(char);
            }
        });
        return characters;
    }

    // 从分析结果填充小说设定信息
    fillFromAnalysis(analysisResult) {
        if (!analysisResult || !analysisResult.novelSetting) {
            return false;
        }

        const { novelSetting } = analysisResult;

        // 填充金手指/关键信息
        const characterState = [];
        if (novelSetting.worldview) {
            characterState.push({ key: '世界观', value: novelSetting.worldview });
        }
        if (novelSetting.background) {
            characterState.push({ key: '时代背景', value: novelSetting.background });
        }

        // 渲染金手指/关键信息
        this.renderCharacterStates(characterState);

        // 填充世界观设定
        const worldSettings = [];
        if (novelSetting.worldview) {
            worldSettings.push({ key: '世界观', value: novelSetting.worldview });
        }
        if (novelSetting.background) {
            worldSettings.push({ key: '时代背景', value: novelSetting.background });
        }

        // 渲染世界观设定
        this.renderWorldSettings(worldSettings);

        // 填充角色信息
        if (novelSetting.mainCharacters && Array.isArray(novelSetting.mainCharacters)) {
            const characters = novelSetting.mainCharacters.map(char => ({
                name: char.name || '未知',
                gender: char.gender || '',
                age: char.age || '',
                role: char.role || '',
                personality: char.personality || '',
                appearance: char.appearance || '',
                background: char.background || ''
            }));

            // 渲染角色信息
            this.renderCharacterInfo(characters);
        }

        // 保存到存储
        const settings = storage.loadSettingsForMode(this.currentMode);
        settings.characterState = this.getCharacterStates();
        settings.worldSettings = this.getWorldSettings();
        settings.characterInfo = this.getCharacterInfo();
        storage.saveSettingsForMode(this.currentMode, settings);

        // 触发UI刷新
        window.dispatchEvent(new CustomEvent('settingsUpdated'));

        return true;
    }
}

const settingsManager = new SettingsManager();
