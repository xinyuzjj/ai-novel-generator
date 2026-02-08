class VolumeGenerator {
    constructor() {
        this.eventsBound = false;
        this.isGenerating = false;
        this.abortController = null;
        this.init();
    }

    init() {
        if (!this.eventsBound) {
            this.bindEvents();
            this.eventsBound = true;
        }
        this.updateNovelSelect();
        this.renderVolumeList();
        this.updateVolumeSelect();
        this.updateVolumeSelectGenerate();
        this.updateVolumeSettingsSelect();
        this.updateVolumeStats();
        this.bindSettingsCardEvents();
        this.renderVolumeChapterList();
        this.renderVolumeContentList();
        this.updateVolumeCharacterSelect();
        this.initCharacterRelationStyles();
    }

    bindEvents() {
        const createVolumeBtn = document.getElementById('btn-create-volume');
        if (createVolumeBtn) {
            createVolumeBtn.addEventListener('click', () => {
                if (typeof app !== 'undefined') {
                    app.navigateTo('volume-create');
                }
            });
        }

        const saveVolumeBtn = document.getElementById('btn-save-volume');
        if (saveVolumeBtn) {
            saveVolumeBtn.addEventListener('click', () => this.saveVolume());
        }

        const cancelVolumeBtn = document.getElementById('btn-cancel-volume');
        if (cancelVolumeBtn) {
            cancelVolumeBtn.addEventListener('click', () => {
                this.cancelVolume();
                if (typeof app !== 'undefined') {
                    app.navigateTo('volume-home');
                }
            });
        }

        const saveNovelNameBtn = document.getElementById('btn-save-novel-name');
        if (saveNovelNameBtn) {
            saveNovelNameBtn.addEventListener('click', () => this.saveNovelName());
        }

        const createNovelBtn = document.getElementById('btn-create-novel');
        if (createNovelBtn) {
            createNovelBtn.addEventListener('click', () => this.createNovel());
        }

        const refreshVolumeContentBtn = document.getElementById('btn-refresh-volume-content');
        if (refreshVolumeContentBtn) {
            refreshVolumeContentBtn.addEventListener('click', () => this.renderVolumeContentList());
        }

        const volumeContentSearch = document.getElementById('volume-content-search');
        if (volumeContentSearch) {
            volumeContentSearch.addEventListener('input', (e) => {
                this.renderVolumeContentList(e.target.value);
            });
        }

        const exportVolumeContentBtn = document.getElementById('btn-export-volume-content');
        if (exportVolumeContentBtn) {
            exportVolumeContentBtn.addEventListener('click', () => this.exportVolumeContent());
        }

        const volumeCharacterSelect = document.getElementById('volume-character-select');
        if (volumeCharacterSelect) {
            volumeCharacterSelect.addEventListener('change', (e) => {
                const volumeId = parseInt(e.target.value);
                if (volumeId) {
                    this.loadVolumeCharacterRelations(volumeId);
                }
            });
        }

        const addCharacterRelationBtn = document.getElementById('btn-add-character-relation');
        if (addCharacterRelationBtn) {
            addCharacterRelationBtn.addEventListener('click', () => this.addCharacterRelation());
        }

        const exportCharacterRelationsBtn = document.getElementById('btn-export-character-relations');
        if (exportCharacterRelationsBtn) {
            exportCharacterRelationsBtn.addEventListener('click', () => this.exportCharacterRelations());
        }

        const aiGenerateRelationsBtn = document.getElementById('btn-ai-generate-relations');
        if (aiGenerateRelationsBtn) {
            aiGenerateRelationsBtn.addEventListener('click', () => this.generateCharacterRelationsByAI());
        }

        const volumeNovelSelect = document.getElementById('volume-novel-select');
        if (volumeNovelSelect) {
            volumeNovelSelect.addEventListener('change', (e) => {
                const novelName = e.target.value;
                if (novelName) {
                    this.switchNovel(novelName);
                }
            });
        }

        const volumeSearch = document.getElementById('volume-search');
        if (volumeSearch) {
            volumeSearch.addEventListener('input', (e) => {
                this.renderVolumeList(e.target.value);
            });
        }

        const generateOutlineBtn = document.getElementById('btn-generate-volume-outline');
        if (generateOutlineBtn) {
            generateOutlineBtn.addEventListener('click', () => this.generateVolumeOutline());
        }

        const generateContentBtn = document.getElementById('btn-generate-volume-content');
        if (generateContentBtn) {
            generateContentBtn.addEventListener('click', () => this.generateVolumeChapters());
        }

        const volumeSelect = document.getElementById('volume-select');
        if (volumeSelect) {
            volumeSelect.addEventListener('change', (e) => {
                const volumeId = parseInt(e.target.value);
                if (volumeId) {
                    this.loadVolumeForOutline(volumeId);
                }
            });
        }

        const volumeSelectGenerate = document.getElementById('volume-select-generate');
        if (volumeSelectGenerate) {
            volumeSelectGenerate.addEventListener('change', (e) => {
                const volumeId = parseInt(e.target.value);
                if (volumeId) {
                    this.loadVolumeForGenerate(volumeId);
                }
            });
        }

        const volumeListContainer = document.getElementById('volume-list-container');
        if (volumeListContainer) {
            volumeListContainer.addEventListener('click', (e) => {
                if (e.target.closest('.btn-delete-volume')) {
                    const volumeItem = e.target.closest('.volume-item');
                    const volumeId = parseInt(volumeItem.getAttribute('data-id'));
                    this.deleteVolume(volumeId);
                    e.stopPropagation();
                }
            });
        }

        const volumeSettingsSelect = document.getElementById('volume-settings-select');
        if (volumeSettingsSelect) {
            volumeSettingsSelect.addEventListener('change', (e) => {
                const volumeId = parseInt(e.target.value);
                if (volumeId) {
                    this.loadVolumeSettings(volumeId);
                }
            });
        }

        const saveVolumeSettingsBtn = document.getElementById('btn-save-volume-settings');
        if (saveVolumeSettingsBtn) {
            saveVolumeSettingsBtn.addEventListener('click', () => this.saveVolumeSettings());
        }

        const cancelVolumeSettingsBtn = document.getElementById('btn-cancel-volume-settings');
        if (cancelVolumeSettingsBtn) {
            cancelVolumeSettingsBtn.addEventListener('click', () => {
                this.cancelVolumeSettings();
                if (typeof app !== 'undefined') {
                    app.navigateTo('volume-home');
                }
            });
        }

        const backToVolumeListBtn = document.getElementById('btn-back-to-volume-list');
        if (backToVolumeListBtn) {
            backToVolumeListBtn.addEventListener('click', () => {
                if (typeof app !== 'undefined') {
                    app.navigateTo('volume-home');
                }
            });
        }

        const useTemplateBtn = document.getElementById('btn-use-template');
        if (useTemplateBtn) {
            useTemplateBtn.addEventListener('click', () => this.useBuiltInTemplate());
        }

        const viewExistingOutlineBtn = document.getElementById('btn-view-existing-outline');
        if (viewExistingOutlineBtn) {
            viewExistingOutlineBtn.addEventListener('click', () => this.viewExistingOutline());
        }

        const editOutlineBtn = document.getElementById('btn-edit-outline');
        if (editOutlineBtn) {
            editOutlineBtn.addEventListener('click', () => this.editOutline());
        }

        const exportOutlineBtn = document.getElementById('btn-export-outline');
        if (exportOutlineBtn) {
            exportOutlineBtn.addEventListener('click', () => this.exportOutline());
        }

        const deleteOutlineBtn = document.getElementById('btn-delete-outline');
        if (deleteOutlineBtn) {
            deleteOutlineBtn.addEventListener('click', () => this.deleteOutline());
        }

        const saveOutlineEditBtn = document.getElementById('btn-save-outline-edit');
        if (saveOutlineEditBtn) {
            saveOutlineEditBtn.addEventListener('click', () => this.saveOutlineEdit());
        }

        const cancelOutlineEditBtn = document.getElementById('btn-cancel-outline-edit');
        if (cancelOutlineEditBtn) {
            cancelOutlineEditBtn.addEventListener('click', () => this.cancelOutlineEdit());
        }

        const selectAllChaptersCheckbox = document.getElementById('select-all-chapters');
        if (selectAllChaptersCheckbox) {
            selectAllChaptersCheckbox.addEventListener('change', (e) => this.toggleAllChapters(e.target.checked));
        }

        const chapterSearchInput = document.getElementById('chapter-search-input');
        if (chapterSearchInput) {
            chapterSearchInput.addEventListener('input', (e) => this.filterChapters(e.target.value));
        }

        const filterButtons = document.querySelectorAll('.filter-btn');
        filterButtons.forEach(btn => {
            btn.addEventListener('click', (e) => this.filterChaptersByStatus(e.target));
        });

        const regenerateVolumeContentBtn = document.getElementById('btn-regenerate-volume-content');
        if (regenerateVolumeContentBtn) {
            regenerateVolumeContentBtn.addEventListener('click', () => this.regenerateVolumeContent());
        }

        const viewChaptersBtn = document.getElementById('btn-view-chapters');
        if (viewChaptersBtn) {
            viewChaptersBtn.addEventListener('click', () => {
                if (typeof app !== 'undefined') {
                    app.navigateTo('volume-content');
                }
            });
        }

        const exportChaptersBtn = document.getElementById('btn-export-chapters');
        if (exportChaptersBtn) {
            exportChaptersBtn.addEventListener('click', () => this.exportChapters());
        }

        const refreshVolumeChaptersBtn = document.getElementById('btn-refresh-volume-chapters');
        if (refreshVolumeChaptersBtn) {
            refreshVolumeChaptersBtn.addEventListener('click', () => {
                document.getElementById('volume-chapter-search').value = '';
                this.renderVolumeChapterList();
            });
        }

        const volumeChapterSearch = document.getElementById('volume-chapter-search');
        if (volumeChapterSearch) {
            volumeChapterSearch.addEventListener('input', (e) => {
                this.renderVolumeChapterList(e.target.value);
            });
        }

        const volumeChapterList = document.getElementById('volume-chapter-list');
        if (volumeChapterList) {
            volumeChapterList.addEventListener('click', (e) => {
                const item = e.target.closest('.chapter-item');
                if (item) {
                    if (e.target.closest('.btn-locate')) {
                        const index = parseInt(item.getAttribute('data-index'));
                        this.locateVolumeChapter(index);
                        e.stopPropagation();
                        return;
                    }
                    const index = parseInt(item.getAttribute('data-index'));
                    this.loadVolumeChapter(index);
                }
            });
        }

        const startVolumeGenBtn = document.getElementById('btn-start-volume-gen');
        if (startVolumeGenBtn) {
            startVolumeGenBtn.addEventListener('click', () => this.startVolumeGeneration());
        }

        const stopVolumeGenBtn = document.getElementById('btn-stop-volume-gen');
        if (stopVolumeGenBtn) {
            stopVolumeGenBtn.addEventListener('click', () => this.stopVolumeGeneration());
        }

        const volumeGenContentDisplay = document.getElementById('volume-gen-content-display');
        if (volumeGenContentDisplay) {
            volumeGenContentDisplay.addEventListener('input', (e) => {
                this.updateVolumeWordCount(e.target.innerText);
            });
        }
    }

    renderVolumeList(query) {
        const container = document.getElementById('volume-list-container');
        let volumes = storage.loadVolumes();

        if (!container) return;

        if (volumes.length === 0) {
            container.innerHTML = '<div class="empty-state">暂无卷，请点击创建新卷</div>';
            return;
        }

        volumes.sort(function(a, b) {
            return a.id - b.id;
        });

        let html = '';
        volumes.forEach((volume) => {
            const volumeId = volume.id;
            const title = volume.title || '第' + volumeId + '卷';
            const summary = volume.summary || '';
            const chapterCount = volume.chapters ? volume.chapters.length : 0;
            const status = volume.status || 'planning';
            const statusText = this.getStatusText(status);
            const statusClass = this.getStatusClass(status);
            const wordCount = volume.wordCount || chapterCount * 3300;
            const wordCountK = (wordCount / 1000).toFixed(1);
            const completedChapters = this.calculateCompletedChapters(volume);
            const progressPercentage = chapterCount > 0 ? Math.round((completedChapters / chapterCount) * 100) : 0;

            if (query && !title.toLowerCase().includes(query.toLowerCase()) && !summary.toLowerCase().includes(query.toLowerCase())) {
                return;
            }

            html += '<div class="volume-item" data-id="' + volumeId + '">';
            html += '<div class="volume-info">';
            html += '<div class="volume-header">';
            html += '<h4>第' + volumeId + '卷：' + title + '</h4>';
            html += '<span class="volume-status ' + statusClass + '">' + statusText + '</span>';
            html += '</div>';
            html += '<div class="volume-summary">' + summary + '</div>';
            html += '<div class="volume-stats">';
            html += '<span>章节数：' + chapterCount + '</span>';
            html += '<span>已完成：' + completedChapters + '章</span>';
            html += '<span>预估字数：' + wordCountK + ' 万字</span>';
            html += '</div>';
            html += '<div class="volume-progress" style="margin-top: 10px;">';
            html += '<div class="progress-bar small">';
            html += '<div class="progress-fill" style="width: ' + progressPercentage + '%"></div>';
            html += '</div>';
            html += '<span class="progress-text small">' + progressPercentage + '% 完成</span>';
            html += '</div>';
            html += '</div>';
            html += '<div class="volume-actions">';
            html += '<button class="btn-icon-small btn-delete-volume" title="删除卷">';
            html += '<i class="fas fa-trash-alt"></i>';
            html += '</button>';
            html += '</div>';
            html += '</div>';
        });

        if (html === '' && query) {
            html = '<div style="padding:10px; color:#666; text-align:center;">未找到匹配的卷</div>';
        }

        container.innerHTML = html;
        this.updateVolumeSelect();
    }

    updateVolumeSelect() {
        const select = document.getElementById('volume-select');
        if (!select) return;

        const volumes = storage.loadVolumes();
        let options = '<option value="">请选择一个卷</option>';
        
        volumes.forEach(volume => {
            options += '<option value="' + volume.id + '">第' + volume.id + '卷：' + volume.title + '</option>';
        });
        
        select.innerHTML = options;
    }

    updateVolumeSelectGenerate() {
        const select = document.getElementById('volume-select-generate');
        if (!select) return;

        const volumes = storage.loadVolumes();
        let options = '<option value="">请选择一个卷</option>';
        
        volumes.forEach(volume => {
            options += '<option value="' + volume.id + '">第' + volume.id + '卷：' + volume.title + '</option>';
        });
        
        select.innerHTML = options;
    }

    updateVolumeSettingsSelect() {
        const select = document.getElementById('volume-settings-select');
        if (!select) return;

        const volumes = storage.loadVolumes();
        let options = '<option value="">请选择一个卷</option>';
        
        volumes.forEach(volume => {
            options += '<option value="' + volume.id + '">第' + volume.id + '卷：' + volume.title + '</option>';
        });
        
        select.innerHTML = options;
    }

    loadVolumeSettings(volumeId) {
        const settings = storage.loadVolumeSettings(volumeId);
        
        const worldSettingInput = document.getElementById('volume-world-setting');
        const specialRulesInput = document.getElementById('volume-special-rules');
        const mainCharactersInput = document.getElementById('volume-main-characters');
        const characterRelationsInput = document.getElementById('volume-character-relations');
        const mainPlotInput = document.getElementById('volume-main-plot');
        const subPlotsInput = document.getElementById('volume-sub-plots');
        const coreConflictInput = document.getElementById('volume-core-conflict');
        const characterStateInput = document.getElementById('volume-character-state');
        
        if (worldSettingInput) {
            worldSettingInput.value = settings?.worldSetting || '';
            this.updateCharCount(worldSettingInput, 500);
        }
        if (specialRulesInput) {
            specialRulesInput.value = settings?.specialRules || '';
            this.updateCharCount(specialRulesInput, 300);
        }
        if (mainCharactersInput) {
            mainCharactersInput.value = settings?.mainCharacters || '';
            this.updateCharCount(mainCharactersInput, 800);
        }
        if (characterRelationsInput) {
            characterRelationsInput.value = settings?.characterRelations || '';
            this.updateCharCount(characterRelationsInput, 500);
        }
        if (mainPlotInput) {
            mainPlotInput.value = settings?.mainPlot || '';
            this.updateCharCount(mainPlotInput, 500);
        }
        if (subPlotsInput) {
            subPlotsInput.value = settings?.subPlots || '';
            this.updateCharCount(subPlotsInput, 500);
        }
        if (coreConflictInput) {
            coreConflictInput.value = settings?.coreConflict || '';
            this.updateCharCount(coreConflictInput, 300);
        }
        if (characterStateInput) {
            characterStateInput.value = settings?.characterState || '';
            this.updateCharCount(characterStateInput, 500);
        }

        this.updateProgressIndicator();
        this.bindSettingsCardEvents();
    }

    saveVolumeSettings() {
        const volumeSelect = document.getElementById('volume-settings-select');
        const volumeId = volumeSelect ? parseInt(volumeSelect.value) : null;
        
        if (!volumeId) {
            this.showMessage('请先选择一个卷', 'error');
            return;
        }

        const worldSettingInput = document.getElementById('volume-world-setting');
        const specialRulesInput = document.getElementById('volume-special-rules');
        const mainCharactersInput = document.getElementById('volume-main-characters');
        const characterRelationsInput = document.getElementById('volume-character-relations');
        const mainPlotInput = document.getElementById('volume-main-plot');
        const subPlotsInput = document.getElementById('volume-sub-plots');
        const coreConflictInput = document.getElementById('volume-core-conflict');
        const characterStateInput = document.getElementById('volume-character-state');
        
        const settingsData = {
            worldSetting: worldSettingInput ? worldSettingInput.value : '',
            specialRules: specialRulesInput ? specialRulesInput.value : '',
            mainCharacters: mainCharactersInput ? mainCharactersInput.value : '',
            characterRelations: characterRelationsInput ? characterRelationsInput.value : '',
            mainPlot: mainPlotInput ? mainPlotInput.value : '',
            subPlots: subPlotsInput ? subPlotsInput.value : '',
            coreConflict: coreConflictInput ? coreConflictInput.value : '',
            characterState: characterStateInput ? characterStateInput.value : ''
        };
        
        storage.saveVolumeSettings(volumeId, settingsData);
        this.showMessage('卷级别设定保存成功！', 'success');
    }

    cancelVolumeSettings() {
        const worldSettingInput = document.getElementById('volume-world-setting');
        const specialRulesInput = document.getElementById('volume-special-rules');
        const mainCharactersInput = document.getElementById('volume-main-characters');
        const characterRelationsInput = document.getElementById('volume-character-relations');
        const mainPlotInput = document.getElementById('volume-main-plot');
        const subPlotsInput = document.getElementById('volume-sub-plots');
        const coreConflictInput = document.getElementById('volume-core-conflict');
        const characterStateInput = document.getElementById('volume-character-state');
        const volumeSelect = document.getElementById('volume-settings-select');
        
        if (worldSettingInput) worldSettingInput.value = '';
        if (specialRulesInput) specialRulesInput.value = '';
        if (mainCharactersInput) mainCharactersInput.value = '';
        if (characterRelationsInput) characterRelationsInput.value = '';
        if (mainPlotInput) mainPlotInput.value = '';
        if (subPlotsInput) subPlotsInput.value = '';
        if (coreConflictInput) coreConflictInput.value = '';
        if (characterStateInput) characterStateInput.value = '';
        if (volumeSelect) volumeSelect.value = '';

        this.updateProgressIndicator();
    }

    updateCharCount(textarea, maxLength) {
        const charCount = textarea.value.length;
        const charCountElement = textarea.nextElementSibling;
        
        if (charCountElement && charCountElement.classList.contains('char-count')) {
            charCountElement.textContent = charCount + ' / ' + maxLength;
            charCountElement.classList.remove('warning', 'error');
            
            if (charCount > maxLength * 0.9) {
                charCountElement.classList.add('warning');
            }
            if (charCount > maxLength) {
                charCountElement.classList.add('error');
            }
        }
    }

    updateProgressIndicator() {
        const sections = ['world', 'characters', 'plot', 'state'];
        
        sections.forEach(section => {
            const progressItem = document.querySelector(`.progress-item[data-section="${section}"]`);
            if (!progressItem) return;

            const card = document.querySelector(`.settings-card[data-section="${section}"]`);
            if (!card) return;

            const textareas = card.querySelectorAll('textarea');
            let hasContent = false;
            
            textareas.forEach(textarea => {
                if (textarea.value.trim()) {
                    hasContent = true;
                }
            });

            progressItem.classList.remove('completed', 'active');
            if (hasContent) {
                progressItem.classList.add('completed');
            }
        });
    }

    bindSettingsCardEvents() {
        const cards = document.querySelectorAll('.settings-card');
        
        cards.forEach(card => {
            const header = card.querySelector('.card-header-custom');
            if (!header) return;

            header.removeEventListener('click', this.toggleCard);
            header.addEventListener('click', () => this.toggleCard(card));

            const textareas = card.querySelectorAll('textarea');
            textareas.forEach(textarea => {
                const maxLength = this.getMaxLengthForField(textarea.id);
                if (maxLength) {
                    textarea.removeEventListener('input', this.handleTextareaInput);
                    textarea.addEventListener('input', () => {
                        this.updateCharCount(textarea, maxLength);
                        this.updateProgressIndicator();
                    });
                    this.updateCharCount(textarea, maxLength);
                }
            });
        });

        const progressItems = document.querySelectorAll('.progress-item');
        progressItems.forEach(item => {
            item.addEventListener('click', () => {
                const section = item.getAttribute('data-section');
                const card = document.querySelector(`.settings-card[data-section="${section}"]`);
                if (card) {
                    card.classList.remove('collapsed');
                    card.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            });
        });
    }

    toggleCard(card) {
        card.classList.toggle('collapsed');
    }

    getMaxLengthForField(fieldId) {
        const maxLengths = {
            'volume-world-setting': 500,
            'volume-special-rules': 300,
            'volume-main-characters': 800,
            'volume-character-relations': 500,
            'volume-main-plot': 500,
            'volume-sub-plots': 500,
            'volume-core-conflict': 300,
            'volume-character-state': 500
        };
        return maxLengths[fieldId] || null;
    }

    updateVolumeStats() {
        const volumes = storage.loadVolumes();
        const totalVolumes = volumes.length;
        
        let totalChapters = 0;
        let totalWords = 0;
        let completedChapters = 0;
        
        volumes.forEach(volume => {
            const chapterCount = volume.chapters ? volume.chapters.length : 0;
            const wordCount = volume.wordCount || chapterCount * 3300;
            const completed = this.calculateCompletedChapters(volume);
            
            totalChapters += chapterCount;
            totalWords += wordCount;
            completedChapters += completed;
        });
        
        const completionRate = totalChapters > 0 ? Math.round((completedChapters / totalChapters) * 100) : 0;
        const totalWordsK = (totalWords / 10000).toFixed(1);
        
        const totalVolumesElement = document.getElementById('total-volumes');
        const totalChaptersElement = document.getElementById('total-chapters');
        const totalWordsElement = document.getElementById('total-words');
        const completionRateElement = document.getElementById('completion-rate');
        
        if (totalVolumesElement) totalVolumesElement.textContent = totalVolumes;
        if (totalChaptersElement) totalChaptersElement.textContent = totalChapters;
        if (totalWordsElement) totalWordsElement.textContent = totalWordsK + ' 万';
        if (completionRateElement) completionRateElement.textContent = completionRate + '%';
    }

    calculateCompletedChapters(volume) {
        if (!volume || !volume.chapters || volume.chapters.length === 0) {
            return 0;
        }

        const chapters = storage.loadForMode('medium-length', 'chapters', {});
        let completedCount = 0;

        volume.chapters.forEach(chapterNum => {
            if (chapters[chapterNum] && chapters[chapterNum].length > 0) {
                completedCount++;
            }
        });

        return completedCount;
    }

    saveVolume() {
        const titleInput = document.getElementById('volume-title');
        const summaryInput = document.getElementById('volume-summary');
        const chapterCountInput = document.getElementById('volume-chapter-count');
        const startChapterInput = document.getElementById('volume-start-chapter');
        const minWordsInput = document.getElementById('volume-min-words');
        const maxWordsInput = document.getElementById('volume-max-words');
        
        const title = titleInput ? titleInput.value : '';
        const summary = summaryInput ? summaryInput.value : '';
        const chapterCount = chapterCountInput ? parseInt(chapterCountInput.value) : 0;
        const startChapter = startChapterInput ? parseInt(startChapterInput.value) : 1;
        const minWords = minWordsInput ? parseInt(minWordsInput.value) : 2000;
        const maxWords = maxWordsInput ? parseInt(maxWordsInput.value) : 4000;
        
        if (!title) {
            this.showMessage('请输入卷标题', 'error');
            return;
        }
        
        if (isNaN(chapterCount) || chapterCount < 1) {
            this.showMessage('请输入有效的章节数量', 'error');
            return;
        }
        
        if (isNaN(startChapter) || startChapter < 1) {
            this.showMessage('请输入有效的开始章节', 'error');
            return;
        }

        if (isNaN(minWords) || minWords < 500) {
            this.showMessage('最小字数不能少于500', 'error');
            return;
        }

        if (isNaN(maxWords) || maxWords < minWords) {
            this.showMessage('最大字数不能小于最小字数', 'error');
            return;
        }
        
        const endChapter = startChapter + chapterCount - 1;
        
        const chapters = [];
        for (let i = startChapter; i <= endChapter; i++) {
            chapters.push(i);
        }
        
        const volumeData = {
            title: title,
            summary: summary || '',
            chapters: chapters,
            startChapter: startChapter,
            endChapter: endChapter,
            status: 'planning',
            wordCount: chapterCount * ((minWords + maxWords) / 2),
            minWords: minWords,
            maxWords: maxWords
        };
        
        storage.saveVolume(volumeData);
        this.renderVolumeList();
        this.updateVolumeSelect();
        this.updateVolumeSelectGenerate();
        this.cancelVolume();
        this.showMessage('卷创建成功！现在可以设置卷级别设定', 'success');
        
        if (typeof app !== 'undefined') {
            this.updateVolumeSettingsSelect();
            app.navigateTo('volume-settings');
        }
    }

    cancelVolume() {
        const titleInput = document.getElementById('volume-title');
        const summaryInput = document.getElementById('volume-summary');
        const chapterCountInput = document.getElementById('volume-chapter-count');
        const startChapterInput = document.getElementById('volume-start-chapter');
        const minWordsInput = document.getElementById('volume-min-words');
        const maxWordsInput = document.getElementById('volume-max-words');
        
        if (titleInput) titleInput.value = '';
        if (summaryInput) summaryInput.value = '';
        if (chapterCountInput) chapterCountInput.value = '50';
        if (startChapterInput) startChapterInput.value = '1';
        if (minWordsInput) minWordsInput.value = '2000';
        if (maxWordsInput) maxWordsInput.value = '4000';
    }

    useBuiltInTemplate() {
        if (!confirm('确定要使用内置模板吗？这将覆盖当前已填写的内容。')) {
            return;
        }

        const template = this.getBuiltInTemplate();
        this.fillSettingsFromTemplate(template);
        this.showMessage('内置模板应用成功！', 'success');
    }

    getBuiltInTemplate() {
        return {
            worldSetting: `本卷故事发生在凡间，是修仙世界的底层位面。凡间灵气稀薄，只有少数灵脉之地适合修行。

地理环境：
- 东荒大陆：本卷主要活动区域，分为十大州
- 青云州：主角出生地，灵气中等，有三大修仙宗门
- 落霞山：青云州著名灵脉，青云宗所在地
- 荒古森林：充满妖兽的危险之地，是历练的好去处

势力分布：
- 青云宗：青云州正道领袖，以剑道闻名
- 血煞门：魔道宗门，行事阴险，擅长毒术和血道
- 散修联盟：散修组织，互相扶持，对抗宗门压迫

修行体系：
- 炼气期：1-9层，凡间最高境界
- 筑基期：突破凡间极限，可飞升仙界
- 灵根：决定修行天赋，分为天地玄黄四等`,
            specialRules: `1. 灵气限制：凡间灵气浓度仅为仙界的1/100，修炼速度极慢
2. 禁空规则：炼气期修士无法长时间飞行，只能短距离滑翔
3. 宗门保护：凡间宗门受天道庇护，不可随意灭门，否则会招致天劫
4. 灵石货币：灵石是主要交易货币，品质分为下中上极品
5. 秘境限制：凡间秘境每百年开启一次，每次只能进入炼气期修士`,
            mainCharacters: `主角：林风
- 身份：青云宗外门弟子
- 性格：坚韧不拔，重情重义，聪明但不失谨慎
- 外貌：身材修长，面容清秀，眼神坚毅
- 背景：孤儿，被青云宗长老收养，觉醒天品火灵根
- 本卷变化：从废柴变成天才，最终突破筑基期

反派：张狂
- 身份：血煞门少主
- 性格：傲慢自大，心狠手辣，好色贪婪
- 外貌：身材魁梧，面容阴鸷，眼神凶狠
- 背景：血煞门门主之子，拥有地品血灵根
- 本卷作用：主要对手，多次陷害主角

配角：苏雪
- 身份：青云宗内门弟子
- 性格：温柔善良，聪慧过人，外柔内刚
- 外貌：容貌绝美，气质出尘，如仙子下凡
- 背景：青云宗宗主之女，拥有天品冰灵根
- 本卷作用：主角的引路人，后期成为道侣`,
            characterRelations: `主角与苏雪：
- 开始：陌生，苏雪是高高在上的内门弟子
- 发展：苏雪发现主角天赋，暗中帮助
- 结果：成为道侣，共同踏上仙界之路

主角与张狂：
- 开始：无冤无仇
- 发展：因争夺秘境名额结仇，多次冲突
- 结果：主角斩杀张狂，与血煞门结下死仇`,
            mainPlot: `主角林风在青云宗外门觉醒天品火灵根，从废柴变成天才。在苏雪和老黄的帮助下，主角快速成长，参加宗门大比获得第一名。之后进入荒古森林历练，收服妖王黑风，获得上古传承。最终在血煞门围攻青云宗时，主角力挽狂澜，斩杀张狂，突破筑基期，准备飞升仙界。

详细剧情：
1. 觉醒篇（1-5章）：主角觉醒天赋，震惊宗门，成为内门弟子
2. 成长篇（6-15章）：主角刻苦修炼，学习炼丹术，实力快速提升
3. 大比篇（16-20章）：参加宗门大比，击败各路天才，获得第一名
4. 历练篇（21-25章）：进入荒古森林历练，收服妖王黑风
5. 传承篇（26-28章）：发现上古洞府，获得传承和宝物
6. 决战篇（29-30章）：血煞门围攻青云宗，主角力挽狂澜，突破筑基期`,
            subPlots: `支线一：炼丹师之路
- 主角跟随老黄学习炼丹术
- 参加炼丹师考核，成为三品炼丹师
- 炼制丹药帮助宗门弟子，积累人脉
- 最终炼制出极品筑基丹，为突破做准备

支线二：秘境探险
- 主角获得进入青云秘境的名额
- 在秘境中发现上古遗迹
- 获得神秘功法《九转金身诀》
- 遭遇血煞门埋伏，反杀敌人

支线三：宗门阴谋
- 发现宗门内有内鬼勾结血煞门
- 主角暗中调查，收集证据
- 揭露内鬼身份，帮助宗门清除隐患
- 获得宗门高层赏识，地位提升`,
            coreConflict: `主要冲突：主角 vs 张狂
- 冲突原因：争夺秘境名额和苏雪的好感
- 冲突升级：多次明争暗斗，互相下黑手
- 冲突高潮：宗门大比决战，主角击败张狂
- 冲突结局：血煞门围攻时，主角斩杀张狂

次要冲突：主角 vs 宗门规则
- 冲突原因：主角天赋太强，引起宗门长老忌惮
- 冲突表现：长老暗中打压主角，限制资源
- 冲突解决：主角实力碾压，长老不敢轻举妄动`,
            characterState: `主角：林风
- 开始状态：
  - 修为：炼气期三层
  - 功法：青云诀（黄品下阶）
  - 武技：基础剑法
  - 灵宠：无
  - 装备：普通铁剑，破旧长袍
  - 炼丹术：未入门

- 结束状态：
  - 修为：筑基期一层
  - 功法：九转金身诀（地品上阶）、青云诀（大成）
  - 武技：青云剑诀（大成）、烈火掌（精通）
  - 灵宠：黑风（半步筑基期妖狼）
  - 装备：青云剑（灵器）、流云袍（法器）、储物戒（空间10立方米）
  - 炼丹术：三品炼丹师
  - 特殊能力：天品火灵根、上古传承`
        };
    }

    fillSettingsFromTemplate(settings) {
        const worldSettingInput = document.getElementById('volume-world-setting');
        const specialRulesInput = document.getElementById('volume-special-rules');
        const mainCharactersInput = document.getElementById('volume-main-characters');
        const characterRelationsInput = document.getElementById('volume-character-relations');
        const mainPlotInput = document.getElementById('volume-main-plot');
        const subPlotsInput = document.getElementById('volume-sub-plots');
        const coreConflictInput = document.getElementById('volume-core-conflict');
        const characterStateInput = document.getElementById('volume-character-state');
        
        if (worldSettingInput && settings.worldSetting) {
            worldSettingInput.value = settings.worldSetting;
            this.updateCharCount(worldSettingInput, 500);
        }
        if (specialRulesInput && settings.specialRules) {
            specialRulesInput.value = settings.specialRules;
            this.updateCharCount(specialRulesInput, 300);
        }
        if (mainCharactersInput && settings.mainCharacters) {
            mainCharactersInput.value = settings.mainCharacters;
            this.updateCharCount(mainCharactersInput, 800);
        }
        if (characterRelationsInput && settings.characterRelations) {
            characterRelationsInput.value = settings.characterRelations;
            this.updateCharCount(characterRelationsInput, 500);
        }
        if (mainPlotInput && settings.mainPlot) {
            mainPlotInput.value = settings.mainPlot;
            this.updateCharCount(mainPlotInput, 500);
        }
        if (subPlotsInput && settings.subPlots) {
            subPlotsInput.value = settings.subPlots;
            this.updateCharCount(subPlotsInput, 500);
        }
        if (coreConflictInput && settings.coreConflict) {
            coreConflictInput.value = settings.coreConflict;
            this.updateCharCount(coreConflictInput, 300);
        }
        if (characterStateInput && settings.characterState) {
            characterStateInput.value = settings.characterState;
            this.updateCharCount(characterStateInput, 500);
        }

        this.updateProgressIndicator();
    }

    deleteVolume(volumeId) {
        if (!confirm('确定要删除这个卷吗？删除后不可恢复。')) return;

        storage.deleteVolume(volumeId);
        this.renderVolumeList();
        this.updateVolumeSelect();
        this.updateVolumeSelectGenerate();
        this.showMessage('卷删除成功！', 'success');
    }

    loadVolumeForOutline(volumeId) {
        const volume = storage.loadVolume(volumeId);
        if (!volume) return;
        
        const coreIdeaInput = document.getElementById('volume-core-idea');
        const outlineCountInput = document.getElementById('volume-outline-count');
        const viewExistingOutlineBtn = document.getElementById('btn-view-existing-outline');
        
        if (coreIdeaInput) coreIdeaInput.value = volume.summary || '';
        if (outlineCountInput) outlineCountInput.value = volume.chapters.length;
        
        if (viewExistingOutlineBtn) {
            if (volume.outline) {
                viewExistingOutlineBtn.style.display = 'inline-block';
            } else {
                viewExistingOutlineBtn.style.display = 'none';
            }
        }
    }

    loadVolumeForGenerate(volumeId) {
        const volume = storage.loadVolume(volumeId);
        if (!volume) return;
        
        const currentVolumeIdInput = document.getElementById('current-volume-id');
        if (currentVolumeIdInput) {
            currentVolumeIdInput.value = volumeId;
        } else {
            const input = document.createElement('input');
            input.type = 'hidden';
            input.id = 'current-volume-id';
            input.value = volumeId;
            document.body.appendChild(input);
        }

        this.renderChapterSelectionList(volume);
    }

    renderChapterSelectionList(volume) {
        const container = document.getElementById('chapter-selection-list');
        if (!container) return;

        const chapters = volume.chapters || [];
        const outlines = storage.loadForMode('medium-length', 'outlines', []);
        const chapterContents = storage.loadForMode('medium-length', 'chapters', {});

        let html = '';
        chapters.forEach(chapterNum => {
            const outline = outlines[chapterNum - 1];
            const title = outline ? outline.title : '第' + chapterNum + '章';
            const hasContent = chapterContents[chapterNum] !== undefined && chapterContents[chapterNum] !== null && chapterContents[chapterNum] !== '';
            const status = hasContent ? 'completed' : 'pending';
            const statusText = hasContent ? '已完成' : '待生成';

            html += '<label class="checkbox-label">';
            html += '<input type="checkbox" class="chapter-checkbox" value="' + chapterNum + '">';
            html += '<div class="chapter-info">';
            html += '<span class="chapter-number">第' + chapterNum + '章</span>';
            html += '<span class="chapter-title">' + title + '</span>';
            html += '<span class="chapter-status ' + status + '">' + statusText + '</span>';
            html += '</div>';
            html += '</label>';
        });

        container.innerHTML = html;

        container.querySelectorAll('.chapter-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                this.updateSelectAllCheckbox();
                this.updateSelectionCount();
            });
        });

        this.updateSelectionCount();
    }

    updateSelectAllCheckbox() {
        const selectAllCheckbox = document.getElementById('select-all-chapters');
        const chapterCheckboxes = document.querySelectorAll('.chapter-checkbox');
        
        if (selectAllCheckbox && chapterCheckboxes.length > 0) {
            const allChecked = Array.from(chapterCheckboxes).every(cb => cb.checked);
            selectAllCheckbox.checked = allChecked;
        }
    }

    toggleAllChapters(checked) {
        const chapterCheckboxes = document.querySelectorAll('.chapter-checkbox');
        chapterCheckboxes.forEach(checkbox => {
            checkbox.checked = checked;
        });
        
        setTimeout(() => {
            this.updateSelectAllCheckbox();
            this.updateSelectionCount();
        }, 50);
    }

    filterChapters(searchText) {
        const chapterLabels = document.querySelectorAll('.chapter-selection-list .checkbox-label');
        const text = searchText.toLowerCase().trim();

        chapterLabels.forEach(label => {
            const title = label.querySelector('.chapter-title').textContent.toLowerCase();
            const number = label.querySelector('.chapter-number').textContent.toLowerCase();
            
            if (text === '' || title.includes(text) || number.includes(text)) {
                label.style.display = 'flex';
            } else {
                label.style.display = 'none';
            }
        });
    }

    filterChaptersByStatus(button) {
        const filterButtons = document.querySelectorAll('.filter-btn');
        filterButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');

        const filter = button.getAttribute('data-filter');
        const chapterLabels = document.querySelectorAll('.chapter-selection-list .checkbox-label');

        chapterLabels.forEach(label => {
            const statusElement = label.querySelector('.chapter-status');
            const status = statusElement ? statusElement.classList.contains(filter) : false;

            if (filter === 'all' || status) {
                label.style.display = 'flex';
            } else {
                label.style.display = 'none';
            }
        });
    }

    updateSelectionCount() {
        const selectedCount = document.querySelectorAll('.chapter-checkbox:checked').length;
        const totalCount = document.querySelectorAll('.chapter-checkbox').length;
        
        const selectedCountElement = document.getElementById('selected-count');
        const totalCountElement = document.getElementById('total-count');
        
        if (selectedCountElement) {
            selectedCountElement.textContent = selectedCount;
        }
        if (totalCountElement) {
            totalCountElement.textContent = totalCount;
        }
    }

    viewExistingOutline() {
        const volumeSelect = document.getElementById('volume-select');
        const volumeId = volumeSelect ? parseInt(volumeSelect.value) : null;
        
        if (!volumeId) {
            this.showMessage('请先选择一个卷', 'error');
            return;
        }

        const volume = storage.loadVolume(volumeId);
        if (!volume || !volume.outline) {
            this.showMessage('该卷还没有大纲', 'warning');
            return;
        }

        this.showOutlineResult({ volumeOutline: volume.outline });
        document.getElementById('volume-outline-result').style.display = 'block';
    }

    editOutline() {
        const volumeSelect = document.getElementById('volume-select');
        const volumeId = volumeSelect ? parseInt(volumeSelect.value) : null;
        
        if (!volumeId) {
            this.showMessage('请先选择一个卷', 'error');
            return;
        }

        const volume = storage.loadVolume(volumeId);
        if (!volume || !volume.outline) {
            this.showMessage('该卷还没有大纲', 'warning');
            return;
        }

        const editorText = document.getElementById('volume-outline-editor-text');
        if (editorText) {
            editorText.value = JSON.stringify(volume.outline, null, 2);
        }

        document.getElementById('volume-outline-result').style.display = 'none';
        document.getElementById('volume-outline-editor').style.display = 'block';
    }

    saveOutlineEdit() {
        const volumeSelect = document.getElementById('volume-select');
        const volumeId = volumeSelect ? parseInt(volumeSelect.value) : null;
        
        if (!volumeId) {
            this.showMessage('请先选择一个卷', 'error');
            return;
        }

        const editorText = document.getElementById('volume-outline-editor-text');
        if (!editorText) return;

        try {
            const outline = JSON.parse(editorText.value);
            const volume = storage.loadVolume(volumeId);
            if (volume) {
                volume.outline = outline;
                storage.saveVolume(volume);
                this.showMessage('大纲修改已保存！', 'success');
                this.cancelOutlineEdit();
                this.showOutlineResult({ volumeOutline: outline });
                document.getElementById('volume-outline-result').style.display = 'block';
            }
        } catch (error) {
            this.showMessage('JSON格式错误，请检查输入', 'error');
        }
    }

    cancelOutlineEdit() {
        document.getElementById('volume-outline-editor').style.display = 'none';
        const volumeSelect = document.getElementById('volume-select');
        const volumeId = volumeSelect ? parseInt(volumeSelect.value) : null;
        
        if (volumeId) {
            const volume = storage.loadVolume(volumeId);
            if (volume && volume.outline) {
                this.showOutlineResult({ volumeOutline: volume.outline });
                document.getElementById('volume-outline-result').style.display = 'block';
            }
        }
    }

    exportOutline() {
        const volumeSelect = document.getElementById('volume-select');
        const volumeId = volumeSelect ? parseInt(volumeSelect.value) : null;
        
        if (!volumeId) {
            this.showMessage('请先选择一个卷', 'error');
            return;
        }

        const volume = storage.loadVolume(volumeId);
        if (!volume || !volume.outline) {
            this.showMessage('该卷还没有大纲', 'warning');
            return;
        }

        const outline = volume.outline;
        let content = '第' + volumeId + '卷：' + volume.title + ' 大纲\n\n';
        content += '====================\n\n';
        content += '【卷级主要剧情】\n' + (outline.majorPlot || '无') + '\n\n';
        content += '【关键冲突】\n';
        if (outline.keyConflicts && outline.keyConflicts.length > 0) {
            outline.keyConflicts.forEach((conflict, index) => {
                content += (index + 1) + '. ' + conflict + '\n';
            });
        }
        content += '\n【角色成长】\n';
        if (outline.characterArcs && outline.characterArcs.length > 0) {
            outline.characterArcs.forEach((arc, index) => {
                content += (index + 1) + '. ' + arc + '\n';
            });
        }
        content += '\n【章节大纲】\n';
        if (outline.chapterOutlines && outline.chapterOutlines.length > 0) {
            outline.chapterOutlines.forEach(chapter => {
                content += '第' + chapter.chapterNumber + '章：' + chapter.title + '\n';
                content += '  ' + (chapter.summary || '') + '\n\n';
            });
        }

        this.downloadFile('volume-' + volumeId + '-outline.txt', content);
        this.showMessage('大纲已导出！', 'success');
    }

    deleteOutline() {
        const volumeSelect = document.getElementById('volume-select');
        const volumeId = volumeSelect ? parseInt(volumeSelect.value) : null;
        
        if (!volumeId) {
            this.showMessage('请先选择一个卷', 'error');
            return;
        }

        const volume = storage.loadVolume(volumeId);
        if (!volume || !volume.outline) {
            this.showMessage('该卷还没有大纲', 'warning');
            return;
        }

        if (!confirm('确定要删除这个卷的大纲吗？删除后不可恢复。')) return;

        volume.outline = null;
        storage.saveVolume(volume);
        document.getElementById('volume-outline-result').style.display = 'none';
        this.showMessage('大纲已删除！', 'success');
    }

    regenerateVolumeContent() {
        const volumeSelect = document.getElementById('volume-select-generate');
        const volumeId = volumeSelect ? parseInt(volumeSelect.value) : null;
        
        if (!volumeId) {
            this.showMessage('请先选择一个卷', 'error');
            return;
        }

        if (!confirm('确定要重新生成选中的章节吗？这将覆盖现有内容。')) return;

        this.generateVolumeChapters(true);
    }

    exportChapters() {
        const currentVolumeIdInput = document.getElementById('current-volume-id');
        const volumeId = currentVolumeIdInput ? parseInt(currentVolumeIdInput.value) : null;
        
        if (!volumeId) {
            this.showMessage('请先选择一个卷', 'error');
            return;
        }

        const volume = storage.loadVolume(volumeId);
        if (!volume) {
            this.showMessage('卷不存在', 'error');
            return;
        }

        const chapters = volume.chapters || [];
        if (chapters.length === 0) {
            this.showMessage('该卷没有章节', 'warning');
            return;
        }

        let content = '第' + volumeId + '卷：' + volume.title + '\n\n';
        content += '====================\n\n';

        const chapterContents = storage.loadForMode('medium-length', 'chapters', {});
        chapters.forEach(chapterNum => {
            const chapterContent = chapterContents[chapterNum];
            if (chapterContent) {
                content += '第' + chapterNum + '章\n\n';
                content += chapterContent + '\n\n';
                content += '====================\n\n';
            }
        });

        this.downloadFile('volume-' + volumeId + '-chapters.txt', content);
        this.showMessage('章节已导出！', 'success');
    }

    downloadFile(filename, content) {
        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    getStatusText(status) {
        const statusMap = {
            planning: '规划中',
            writing: '创作中',
            completed: '已完成'
        };
        return statusMap[status] || '未知';
    }

    getStatusClass(status) {
        const classMap = {
            planning: 'status-planning',
            writing: 'status-writing',
            completed: 'status-completed'
        };
        return classMap[status] || '';
    }

    generateVolumeOutline() {
        const volumeSelect = document.getElementById('volume-select');
        const coreIdeaInput = document.getElementById('volume-core-idea');
        
        const volumeId = volumeSelect ? parseInt(volumeSelect.value) : null;
        if (!volumeId) {
            this.showMessage('请先选择一个卷', 'error');
            return;
        }

        const volume = storage.loadVolume(volumeId);
        if (!volume) {
            this.showMessage('卷不存在', 'error');
            return;
        }

        const outlineSummary = coreIdeaInput ? coreIdeaInput.value : '';
        if (!outlineSummary) {
            this.showMessage('请输入卷级核心创意', 'error');
            return;
        }

        const btn = document.getElementById('btn-generate-volume-outline');
        const originalText = btn ? btn.innerHTML : '';
        if (btn) {
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 生成中...';
            btn.disabled = true;
        }

        this.callAiForVolumeOutline(volume, outlineSummary)
            .then((outlineResult) => {
                if (outlineResult) {
                    this.saveVolumeOutline(volumeId, outlineResult);
                    this.showMessage('卷级大纲生成成功！', 'success');
                    this.showOutlineResult(outlineResult);
                    
                    const viewExistingOutlineBtn = document.getElementById('btn-view-existing-outline');
                    if (viewExistingOutlineBtn) {
                        viewExistingOutlineBtn.style.display = 'inline-block';
                    }
                }
            })
            .catch((error) => {
                console.error('生成卷级大纲失败:', error);
                this.showMessage('生成卷级大纲失败: ' + error.message, 'error');
            })
            .finally(() => {
                if (btn) {
                    btn.innerHTML = originalText;
                    btn.disabled = false;
                }
            });
    }

    showOutlineResult(outlineResult) {
        const resultContainer = document.getElementById('volume-outline-result');
        const contentContainer = resultContainer ? resultContainer.querySelector('.result-content') : null;
        
        if (!resultContainer || !contentContainer) return;
        
        const outline = outlineResult.volumeOutline;
        if (!outline) return;
        
        let html = '<div class="outline-result">';
        html += '<h5>卷级主要剧情</h5>';
        html += '<p>' + (outline.majorPlot || '无') + '</p>';
        html += '<h5>关键冲突</h5>';
        html += '<ul>';
        if (outline.keyConflicts && outline.keyConflicts.length > 0) {
            outline.keyConflicts.forEach(conflict => {
                html += '<li>' + conflict + '</li>';
            });
        } else {
            html += '<li>无</li>';
        }
        html += '</ul>';
        html += '<h5>角色成长</h5>';
        html += '<ul>';
        if (outline.characterArcs && outline.characterArcs.length > 0) {
            outline.characterArcs.forEach(arc => {
                html += '<li>' + arc + '</li>';
            });
        } else {
            html += '<li>无</li>';
        }
        html += '</ul>';
        html += '<h5>章节大纲</h5>';
        html += '<div class="chapter-outline-preview">';
        if (outline.chapterOutlines && outline.chapterOutlines.length > 0) {
            outline.chapterOutlines.forEach(chapter => {
                html += '<div class="chapter-preview-item">';
                html += '<strong>第' + chapter.chapterNumber + '章：' + chapter.title + '</strong>';
                html += '<p>' + (chapter.summary || '') + '</p>';
                html += '</div>';
            });
        } else {
            html += '<p>无章节大纲</p>';
        }
        html += '</div>';
        html += '<h5>人物关系</h5>';
        html += '<p>' + (outline.characterRelations || '无') + '</p>';
        html += '</div>';
        
        contentContainer.innerHTML = html;
        resultContainer.style.display = 'block';
    }

    showGenerateResult(volume, completedCount) {
        const resultContainer = document.getElementById('volume-generate-result');
        const contentContainer = resultContainer ? resultContainer.querySelector('.result-content') : null;
        
        if (!resultContainer || !contentContainer) return;
        
        const totalChapters = volume.chapters.length;
        const completionRate = Math.round((completedCount / totalChapters) * 100);
        
        let html = '<div class="generate-result">';
        html += '<h5>生成完成</h5>';
        html += '<p>第' + volume.id + '卷《' + volume.title + '》</p>';
        html += '<div class="result-stats">';
        html += '<div class="stat-item">';
        html += '<span class="stat-label">总章节数</span>';
        html += '<span class="stat-value">' + totalChapters + '</span>';
        html += '</div>';
        html += '<div class="stat-item">';
        html += '<span class="stat-label">已生成</span>';
        html += '<span class="stat-value">' + completedCount + '</span>';
        html += '</div>';
        html += '<div class="stat-item">';
        html += '<span class="stat-label">完成率</span>';
        html += '<span class="stat-value">' + completionRate + '%</span>';
        html += '</div>';
        html += '</div>';
        html += '</div>';
        
        contentContainer.innerHTML = html;
        resultContainer.style.display = 'block';
    }

    async callAiForVolumeOutline(volume, summary) {
        const project = storage.loadProjectForMode('medium-length');
        const settings = storage.loadSettingsForMode('medium-length');
        const chapterCount = volume.chapters.length;

        let context = '';
        
        const charState = settings.characterState || [];
        if (charState.length > 0) {
            const charStr = charState.map(c => c.key + ': ' + c.value).join(', ');
            context += '\n【当前角色状态】\n' + charStr + '\n';
        }
        
        const world = settings.worldSettings || {};
        if (Object.keys(world).length > 0) {
            context += '\n【世界观设定】\n' + JSON.stringify(world) + '\n';
        }
        
        const charInfo = settings.characterInfo || [];
        if (charInfo.length > 0) {
            const charInfoStr = charInfo.map(c => 
                '姓名：' + c.name + '\n角色：' + (c.role || '') + '\n性格：' + (c.personality || '') + '\n外貌：' + (c.appearance || '') + '\n背景：' + (c.background || '')
            ).join('\n---\n');
            context += '\n【重要角色信息】\n' + charInfoStr + '\n';
        }

        const volumeSettings = storage.loadVolumeSettings(volume.id);
        if (volumeSettings) {
            if (volumeSettings.worldSetting) {
                context += '\n【本卷世界观设定】\n' + volumeSettings.worldSetting + '\n';
            }
            if (volumeSettings.specialRules) {
                context += '\n【本卷特殊规则】\n' + volumeSettings.specialRules + '\n';
            }
            if (volumeSettings.mainCharacters) {
                context += '\n【本卷主要角色】\n' + volumeSettings.mainCharacters + '\n';
            }
            if (volumeSettings.characterRelations) {
                context += '\n【本卷角色关系变化】\n' + volumeSettings.characterRelations + '\n';
            }
            if (volumeSettings.mainPlot) {
                context += '\n【本卷主线剧情】\n' + volumeSettings.mainPlot + '\n';
            }
            if (volumeSettings.subPlots) {
                context += '\n【本卷支线剧情】\n' + volumeSettings.subPlots + '\n';
            }
            if (volumeSettings.coreConflict) {
                context += '\n【本卷核心冲突】\n' + volumeSettings.coreConflict + '\n';
            }
            if (volumeSettings.characterState) {
                context += '\n【本卷角色状态变化】\n' + volumeSettings.characterState + '\n';
            }
        }

        const prompt = '你是一个专业的网文策划，擅长设计宏大的剧情架构和紧凑的章节安排。\n\n请根据以下信息，为小说《' + project.name + '》的第' + volume.id + '卷《' + volume.title + '》设计一个详细的卷级大纲。\n\n【卷级信息】\n卷名：' + volume.title + '\n卷级概述：' + summary + '\n章节数量：' + chapterCount + '章\n章节范围：第' + volume.startChapter + '章 - 第' + volume.endChapter + '章\n小说分类：' + project.category + context + '\n\n【设计要求】\n1. **一卷为一个大副本/大剧情**：设计一个完整的大目标，包含多个小目标和障碍\n2. **章节分配合理**：将剧情合理分配到' + chapterCount + '个章节中\n3. **剧情节奏紧凑**：包含起承转合，有高潮和转折点\n4. **人物成长**：体现主角的成长和变化\n5. **钩子设计**：每卷结尾要有钩子，引出下一卷的剧情\n\n【输出格式】\n请以JSON格式输出，包含以下内容：\n{\n  "volumeOutline": {\n    "majorPlot": "卷级主要剧情概述",\n    "keyConflicts": ["关键冲突1", "关键冲突2", "关键冲突3"],\n    "characterArcs": ["角色成长1", "角色成长2"],\n    "characterRelations": "人物关系概述",\n    "chapterOutlines": [\n      {\n        "chapterNumber": ' + volume.startChapter + ',\n        "title": "章节标题",\n        "summary": "章节概述"\n      }\n    ]\n  }\n}\n\n请确保JSON格式正确，内容详细合理。';

        try {
            const response = await this.callAi(prompt);
            const jsonStr = this.extractJson(response);
            if (jsonStr) {
                return JSON.parse(jsonStr);
            }
            throw new Error('无法解析AI响应');
        } catch (error) {
            console.error('生成卷级大纲时出错:', error);
            throw new Error('生成卷级大纲失败: ' + error.message);
        }
    }

    saveVolumeOutline(volumeId, outlineResult) {
        const volume = storage.loadVolume(volumeId);
        if (!volume) return;

        volume.outline = outlineResult.volumeOutline;
        storage.saveVolume(volume);

        if (outlineResult.volumeOutline && outlineResult.volumeOutline.chapterOutlines) {
            this.generateChapterOutlines(volume, outlineResult.volumeOutline.chapterOutlines);
        }
    }

    generateChapterOutlines(volume, chapterOutlines) {
        let outlines = storage.loadForMode('medium-length', 'outlines', []);

        chapterOutlines.forEach(chapterOutline => {
            const chapterNumber = chapterOutline.chapterNumber;
            const outlineIndex = chapterNumber - 1;

            const newOutline = {
                title: chapterOutline.title,
                summary: chapterOutline.summary,
                plot: chapterOutline.summary,
                conflict: '',
                emotion: ''
            };

            if (outlineIndex >= outlines.length) {
                outlines.push(newOutline);
            } else {
                outlines[outlineIndex] = newOutline;
            }
        });

        storage.saveForMode('medium-length', 'outlines', outlines);

        this.renderVolumeChapterList();
    }

    async generateVolumeChapters(isRegenerate = false) {
        const currentVolumeIdInput = document.getElementById('current-volume-id');
        let volumeId = currentVolumeIdInput ? parseInt(currentVolumeIdInput.value) : null;
        
        if (!volumeId) {
            const volumeSelect = document.getElementById('volume-select');
            if (volumeSelect && volumeSelect.value) {
                volumeId = parseInt(volumeSelect.value);
            } else {
                this.showMessage('请先选择一个卷', 'error');
                return;
            }
        }

        const volume = storage.loadVolume(volumeId);
        if (!volume) {
            this.showMessage('卷不存在', 'error');
            return;
        }

        const chapters = volume.chapters || [];
        if (chapters.length === 0) {
            this.showMessage('该卷没有章节，请先设置章节范围', 'error');
            return;
        }

        const chapterCheckboxes = document.querySelectorAll('.chapter-checkbox:checked');
        const selectedChapters = Array.from(chapterCheckboxes).map(cb => parseInt(cb.value));
        
        if (selectedChapters.length === 0) {
            this.showMessage('请至少选择一个章节', 'error');
            return;
        }

        const confirmMessage = isRegenerate 
            ? '确定要重新生成选中的 ' + selectedChapters.length + ' 个章节吗？这将覆盖现有内容。'
            : '确定要生成选中的 ' + selectedChapters.length + ' 个章节内容吗？\n\n可能需要较长时间。';
        
        if (!confirm(confirmMessage)) {
            return;
        }

        this.showMessage('开始生成第' + volume.id + '卷的章节内容...', 'info');

        const progressContainer = document.getElementById('volume-generate-progress');
        const progressFill = document.getElementById('generate-progress-fill');
        const progressPercent = document.getElementById('generate-progress-percent');
        const progressText = document.getElementById('generate-progress-text');
        const progressDetails = document.getElementById('generate-progress-details');
        const progressChaptersList = document.getElementById('progress-chapters-list');
        
        if (progressContainer) progressContainer.style.display = 'block';
        if (progressFill) progressFill.style.width = '0%';
        if (progressPercent) progressPercent.textContent = '0%';
        if (progressText) progressText.textContent = '准备中...';
        if (progressDetails) progressDetails.innerHTML = '';
        
        const outlines = storage.loadForMode('medium-length', 'outlines', []);
        
        if (progressChaptersList) {
            progressChaptersList.innerHTML = '';
            selectedChapters.forEach(chapterNum => {
                const outline = outlines[chapterNum - 1];
                const title = outline ? outline.title : '第' + chapterNum + '章';
                const item = document.createElement('div');
                item.className = 'progress-chapter-item pending';
                item.id = 'progress-chapter-' + chapterNum;
                item.innerHTML = `
                    <span class="progress-chapter-number">第${chapterNum}章</span>
                    <span class="progress-chapter-title">${title}</span>
                    <span class="progress-chapter-status pending">待生成</span>
                `;
                progressChaptersList.appendChild(item);
            });
        }
        
        let isCancelled = false;

        try {
            const project = storage.loadProjectForMode('medium-length');
            let completedCount = 0;
            let successCount = 0;
            let failedChapters = [];

            for (let i = 0; i < selectedChapters.length; i++) {
                if (isCancelled) break;

                const chapterNum = selectedChapters[i];
                const outline = outlines[chapterNum - 1];

                if (!outline) {
                    failedChapters.push(chapterNum);
                    this.showMessage('第' + chapterNum + '章没有大纲，跳过生成', 'warning');
                    this.updateChapterProgress(chapterNum, 'failed', '无大纲');
                    completedCount++;
                    continue;
                }

                const progressPercentage = Math.round((completedCount / selectedChapters.length) * 100);
                
                if (progressFill) progressFill.style.width = progressPercentage + '%';
                if (progressPercent) progressPercent.textContent = progressPercentage + '%';
                if (progressText) progressText.textContent = '正在生成第' + chapterNum + '章（' + completedCount + '/' + selectedChapters.length + '）';
                
                this.updateChapterProgress(chapterNum, 'generating', '生成中...');
                
                if (progressDetails) {
                    progressDetails.innerHTML = '<div>已完成：' + successCount + ' 章</div>';
                    if (failedChapters.length > 0) {
                        progressDetails.innerHTML += '<div style="color: #e74c3c; margin-top: 5px;">失败：' + failedChapters.join(', ') + '</div>';
                    }
                }

                try {
                    const result = await this.generateSingleChapter(chapterNum, outline, project, volume);
                    completedCount++;
                    
                    if (result) {
                        successCount++;
                        this.updateChapterProgress(chapterNum, 'completed', '已完成');
                    } else {
                        failedChapters.push(chapterNum);
                        this.updateChapterProgress(chapterNum, 'failed', '生成失败');
                    }
                } catch (error) {
                    console.error('生成第' + chapterNum + '章出错:', error);
                    failedChapters.push(chapterNum);
                    completedCount++;
                    this.updateChapterProgress(chapterNum, 'failed', '错误: ' + error.message);
                }

                if (progressDetails) {
                    progressDetails.innerHTML = '<div>已完成：' + successCount + ' 章</div>';
                    if (failedChapters.length > 0) {
                        progressDetails.innerHTML += '<div style="color: #e74c3c; margin-top: 5px;">失败：' + failedChapters.join(', ') + '</div>';
                    }
                }

                if (i < selectedChapters.length - 1) {
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }
            }

            if (!isCancelled) {
                const message = '生成完成！成功 ' + successCount + ' 个章节';
                this.showMessage(message, successCount > 0 ? 'success' : 'warning');

                this.renderVolumeChapterList();

                const updatedVolume = storage.loadVolume(volumeId);
                const totalCompletedChapters = this.calculateCompletedChapters(updatedVolume);
                if (totalCompletedChapters === chapters.length) {
                    updatedVolume.status = 'completed';
                    storage.saveVolume(updatedVolume);
                    this.renderVolumeList();
                } else if (totalCompletedChapters > 0) {
                    updatedVolume.status = 'writing';
                    storage.saveVolume(updatedVolume);
                    this.renderVolumeList();
                }

                this.showGenerateResult(updatedVolume, totalCompletedChapters);
                this.renderChapterSelectionList(updatedVolume);
            }
        } catch (error) {
            console.error('批量生成失败:', error);
            this.showMessage('批量生成失败: ' + error.message, 'error');
        } finally {
            if (progressContainer) {
                setTimeout(() => {
                    progressContainer.style.display = 'none';
                }, 3000);
            }
        }
    }

    async generateSingleChapter(chapterNum, outline, project, volume) {
        try {
            console.log('开始生成第' + chapterNum + '章...');
            console.log('大纲信息:', outline);
            console.log('项目信息:', project);
            console.log('卷信息:', volume);

            const settings = storage.loadSettingsForMode('medium-length');
            console.log('设置信息:', settings);
            
            if (!project || !project.name) {
                console.error('项目信息不完整');
                return false;
            }

            if (!outline || !outline.title || !outline.summary) {
                console.error('大纲信息不完整:', outline);
                return false;
            }
            
            let context = '';
            
            const charState = settings.characterState || [];
            if (charState.length > 0) {
                const charStr = charState.map(c => c.key + ': ' + c.value).join(', ');
                context += '\n【当前角色状态】\n' + charStr + '\n';
            }
            
            const world = settings.worldSettings || {};
            if (Object.keys(world).length > 0) {
                context += '\n【世界观设定】\n' + JSON.stringify(world) + '\n';
            }
            
            const charInfo = settings.characterInfo || [];
            if (charInfo.length > 0) {
                const charInfoStr = charInfo.map(c => 
                    '姓名：' + c.name + '\n角色：' + (c.role || '') + '\n性格：' + (c.personality || '') + '\n外貌：' + (c.appearance || '') + '\n背景：' + (c.background || '')
                ).join('\n---\n');
                context += '\n【重要角色信息】\n' + charInfoStr + '\n';
            }

            if (volume) {
                const volumeSettings = storage.loadVolumeSettings(volume.id);
                console.log('卷设置:', volumeSettings);
                
                if (volumeSettings) {
                    if (volumeSettings.worldSetting) {
                        context += '\n【本卷世界观设定】\n' + volumeSettings.worldSetting + '\n';
                    }
                    if (volumeSettings.specialRules) {
                        context += '\n【本卷特殊规则】\n' + volumeSettings.specialRules + '\n';
                    }
                    if (volumeSettings.mainCharacters) {
                        context += '\n【本卷主要角色】\n' + volumeSettings.mainCharacters + '\n';
                    }
                    if (volumeSettings.characterRelations) {
                        context += '\n【本卷角色关系变化】\n' + volumeSettings.characterRelations + '\n';
                    }
                    if (volumeSettings.mainPlot) {
                        context += '\n【本卷主线剧情】\n' + volumeSettings.mainPlot + '\n';
                    }
                    if (volumeSettings.subPlots) {
                        context += '\n【本卷支线剧情】\n' + volumeSettings.subPlots + '\n';
                    }
                    if (volumeSettings.coreConflict) {
                        context += '\n【本卷核心冲突】\n' + volumeSettings.coreConflict + '\n';
                    }
                    if (volumeSettings.characterState) {
                        context += '\n【本卷角色状态变化】\n' + volumeSettings.characterState + '\n';
                    }
                }
            }

            const minWords = volume && volume.minWords ? volume.minWords : (project.minWords || 2000);
            const maxWords = volume && volume.maxWords ? volume.maxWords : (project.maxWords || 4000);
            
            const prompt = '你是一个专业的网文作家，擅长细腻的描写、紧凑的剧情和抓人的节奏。\n请根据以下信息撰写小说正文。\n\n【基础信息】\n书名：' + project.name + '\n分类：' + (project.category || '未知') + '\n本章标题：' + outline.title + '\n本章大纲：' + outline.summary + context + '\n\n【作者设定】\n' + (project.authorRole || '') + '\n\n【创作规则】\n' + (project.rules || '') + '\n\n【写作指令】\n1. **严格字数控制**：请撰写第' + chapterNum + '章的正文。本章字数**必须**在 ' + minWords + ' 到 ' + maxWords + ' 字之间。\n2. **细节即字数**：为了达到字数要求，请详细描写环境、人物动作、心理活动和对话细节。\n3. **严禁总结**：禁止以任何形式总结前文或本章，禁止出现"总而言之"、"于是"等大幅跳跃。\n4. **完整输出**：请直接输出正文内容，确保内容在要求的长度范围内独立成章。\n直接输出正文内容。';

            console.log('准备调用AI，prompt长度:', prompt.length);

            const response = await this.callAi(prompt);
            const content = response.trim();
            
            console.log('AI返回内容长度:', content.length);
            
            if (!content || content.length < 10) {
                console.error('生成第' + chapterNum + '章失败: 内容为空或过短');
                return false;
            }
            
            storage.saveChapterForMode('medium-length', chapterNum, content, outline.title);
            console.log('第' + chapterNum + '章已保存，内容长度：', content.length);
            
            return true;
        } catch (error) {
            console.error('生成第' + chapterNum + '章失败:', error);
            console.error('错误详情:', error.message, error.stack);
            return false;
        }
    }

    async callAi(prompt, temperature, maxRetries = 3) {
        if (temperature === undefined) temperature = 0.7;
        
        const config = apiConfig.getActiveConfig();
        if (!config) {
            throw new Error('API未配置');
        }

        if (config.id !== 'local' && (!config.apiKey || config.apiKey.trim() === '')) {
            throw new Error('请先配置API Key');
        }

        if (!config.model || config.model.trim() === '') {
            throw new Error('请先配置模型名称');
        }

        let lastError = null;
        
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                return await this._callAiSingle(prompt, temperature, config);
            } catch (error) {
                lastError = error;
                console.error(`API调用失败 (尝试 ${attempt}/${maxRetries}):`, error);
                
                if (attempt < maxRetries) {
                    const delay = Math.pow(2, attempt) * 1000;
                    console.log(`等待 ${delay}ms 后重试...`);
                    await new Promise(resolve => setTimeout(resolve, delay));
                }
            }
        }
        
        throw lastError;
    }

    async _callAiSingle(prompt, temperature, config) {
        let data;
        let headers = {
            'Content-Type': 'application/json'
        };

        if (config.id !== 'local' && config.apiKey) {
            headers['Authorization'] = 'Bearer ' + config.apiKey;
        }

        if (config.id === 'local') {
            data = {
                model: config.model,
                messages: [
                    { role: 'system', content: 'You are a professional web novel planner and architect.' },
                    { role: 'user', content: prompt }
                ],
                stream: false,
                options: {
                    temperature: temperature
                }
            };
        } else {
            data = {
                model: config.model,
                messages: [
                    { role: 'system', content: 'You are a professional web novel planner and architect.' },
                    { role: 'user', content: prompt }
                ],
                temperature: temperature
            };
        }

        const response = await fetch(config.endpoint, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(data),
            timeout: 60000
        });

        if (!response.ok) {
            let errorMessage = 'API Error: ' + response.status;
            if (response.status === 401) {
                errorMessage = 'API Key无效或过期，请重新配置API Key';
            } else if (response.status === 402) {
                errorMessage = 'API配额不足或需要付费，请检查账户余额或升级套餐';
            } else if (response.status === 403) {
                errorMessage = '访问被拒绝，请检查API Key是否正确或是否有权限访问该模型';
            } else if (response.status === 404) {
                errorMessage = 'API端点不存在，请检查配置的API端点是否正确';
            } else if (response.status === 429) {
                errorMessage = '请求过于频繁，请稍后重试';
            } else if (response.status === 500 || response.status === 502 || response.status === 503) {
                errorMessage = '服务器错误，请稍后重试或联系API提供商';
            }
            throw new Error(errorMessage);
        }

        const result = await response.json();

        if (config.id === 'local') {
            if (result.message && result.message.content) {
                return result.message.content;
            } else if (result.content) {
                return result.content;
            } else if (result.choices && result.choices[0] && result.choices[0].message) {
                return result.choices[0].message.content;
            } else {
                throw new Error('API返回格式错误');
            }
        } else {
            if (result.choices && result.choices[0] && result.choices[0].message) {
                return result.choices[0].message.content;
            } else if (result.message && result.message.content) {
                return result.message.content;
            } else if (result.content) {
                return result.content;
            } else {
                throw new Error('API返回格式错误');
            }
        }
    }

    extractJson(text) {
        const match = text.match(/\{[\s\S]*\}/);
        return match ? match[0] : null;
    }

    showMessage(message, type) {
        if (type === undefined) type = 'info';
        
        const messageElement = document.getElementById('volume-message');
        if (messageElement) {
            messageElement.innerText = message;
            messageElement.className = 'volume-message ' + type;
            messageElement.style.display = 'block';

            const timeout = type === 'error' ? 5000 : 3000;
            setTimeout(() => {
                messageElement.style.display = 'none';
            }, timeout);
        } else {
            const tempMessage = document.createElement('div');
            tempMessage.style.cssText = 'position: fixed; top: 20px; right: 20px; padding: 15px 20px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); z-index: 9999; opacity: 0; transition: opacity 0.3s ease; display: flex; align-items: center; gap: 10px; font-family: Arial, sans-serif; font-size: 14px; max-width: 400px;';
            
            if (type === 'success') {
                tempMessage.style.backgroundColor = '#d4edda';
                tempMessage.style.color = '#155724';
                tempMessage.innerHTML = '<i class="fas fa-check-circle"></i><span>' + message + '</span>';
            } else if (type === 'error') {
                tempMessage.style.backgroundColor = '#f8d7da';
                tempMessage.style.color = '#721c24';
                tempMessage.innerHTML = '<i class="fas fa-exclamation-circle"></i><span>' + message + '</span>';
            } else {
                tempMessage.style.backgroundColor = '#d1ecf1';
                tempMessage.style.color = '#0c5460';
                tempMessage.innerHTML = '<i class="fas fa-info-circle"></i><span>' + message + '</span>';
            }

            document.body.appendChild(tempMessage);

            setTimeout(() => {
                tempMessage.style.opacity = '1';
            }, 10);

            const timeout = type === 'error' ? 5000 : 3000;
            setTimeout(() => {
                tempMessage.style.opacity = '0';
                setTimeout(() => {
                    if (document.body.contains(tempMessage)) {
                        document.body.removeChild(tempMessage);
                    }
                }, 300);
            }, timeout);
        }
    }

    renderVolumeChapterList(query = '') {
        const container = document.getElementById('volume-chapter-list');
        const outlines = storage.loadForMode('medium-length', 'outlines', []);
        const chapters = storage.loadForMode('medium-length', 'chapters', {});
        const volumes = storage.loadVolumes();

        if (!container) return;

        if (outlines.length === 0) {
            container.innerHTML = '<div style="padding:10px; color:#666;">请先生成卷大纲</div>';
            return;
        }

        const chapterToVolume = {};
        volumes.forEach(volume => {
            volume.chapters.forEach(chapterNum => {
                chapterToVolume[chapterNum] = volume;
            });
        });

        let html = '';
        outlines.forEach((outline, index) => {
            const idx = index + 1;
            const title = outline.title || '';

            if (query && !title.toLowerCase().includes(query.toLowerCase()) && !`第${idx}章`.includes(query)) {
                return;
            }

            const hasContent = chapters[idx] && chapters[idx].length > 0;
            const statusIcon = hasContent ? '<i class="fas fa-check-circle" style="color:var(--success-color)"></i>' : '<i class="far fa-circle"></i>';

            const volume = chapterToVolume[idx];
            const volumeInfo = volume ? `<span class="chapter-volume">第${volume.id}卷：${volume.title}</span>` : '';

            html += `
                <div class="chapter-item" data-index="${idx}">
                    <div class="chapter-info">
                        ${statusIcon} 第${idx}章：${title}
                        ${volumeInfo}
                    </div>
                    <div class="chapter-actions">
                        <button class="btn-icon-small btn-view" title="查看本地文件" style="display: ${hasContent ? 'flex' : 'none'}">
                            <i class="fas fa-file-alt"></i>
                        </button>
                        <button class="btn-icon-small btn-delete" title="删除本章内容" style="display: ${hasContent ? 'flex' : 'none'}">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                        <button class="btn-icon-small btn-locate" title="定位文章位置">
                            <i class="fas fa-crosshairs"></i>
                        </button>
                    </div>
                </div>
            `;
        });

        if (html === '' && query) {
            html = '<div style="padding:10px; color:#666; text-align:center;">未找到匹配章节</div>';
        }

        container.innerHTML = html;

        container.querySelectorAll('.chapter-item').forEach(item => {
            const idx = parseInt(item.getAttribute('data-index'));
            const outline = outlines[idx - 1];

            item.querySelector('.btn-view')?.addEventListener('click', (e) => {
                e.stopPropagation();
                const filePath = storage.getChapterPathForMode('medium-length', idx, outline.title);
                if (filePath && typeof require !== 'undefined') {
                    try {
                        const { shell } = require('electron');
                        shell.openPath(filePath);
                    } catch (err) {
                        console.error('Failed to open file via electron shell:', err);
                        alert('打开文件失败，请手动到项目目录查看: ' + filePath);
                    }
                } else {
                    alert('当前环境不支持直接打开文件，路径: ' + filePath);
                }
            });

            item.querySelector('.btn-delete')?.addEventListener('click', (e) => {
                e.stopPropagation();
                if (confirm(`确定要删除"第${idx}章：${outline.title}"的内容吗？删除后不可恢复。`)) {
                    const chapters = storage.loadForMode('medium-length', 'chapters', {});
                    if (chapters[idx]) {
                        delete chapters[idx];
                        storage.saveForMode('medium-length', 'chapters', chapters);
                        this.renderVolumeChapterList(query);
                        if (document.getElementById('volume-gen-chapter-index').value == idx) {
                            this.resetVolumeEditor();
                        }
                    }
                }
            });
        });

        const activeIdx = document.getElementById('volume-gen-chapter-index').value;
        if (activeIdx) {
            document.querySelector(`.chapter-item[data-index="${activeIdx}"]`)?.classList.add('active');
        }
    }

    locateVolumeChapter(index) {
        const chapters = storage.loadForMode('medium-length', 'chapters', {});
        if (chapters[index]) {
            this.loadVolumeChapter(index);
            const display = document.getElementById('volume-gen-content-display');
            display.style.backgroundColor = 'rgba(3, 218, 198, 0.1)';
            setTimeout(() => {
                display.style.backgroundColor = '';
            }, 500);
        } else {
            alert(`第${index}章尚未生成内容。`);
        }
    }

    loadVolumeChapter(index) {
        document.querySelectorAll('.chapter-item').forEach(el => el.classList.remove('active'));
        document.querySelector(`.chapter-item[data-index="${index}"]`)?.classList.add('active');

        document.getElementById('volume-gen-chapter-index').value = index;

        const chapters = storage.loadForMode('medium-length', 'chapters', {});
        const content = chapters[index] || '';
        document.getElementById('volume-gen-content-display').innerText = content;

        this.updateVolumeWordCount(content);

        document.getElementById('volume-gen-status-text').innerText = content ? '已加载内容' : '暂无内容（可开始生成）';
    }

    resetVolumeEditor() {
        document.getElementById('volume-gen-chapter-index').value = '';
        document.getElementById('volume-gen-content-display').innerText = '';
        document.getElementById('volume-gen-status-text').innerText = '就绪';
        document.getElementById('volume-gen-word-count').innerText = '0 字';
    }

    updateVolumeWordCount(text) {
        const count = text.trim().length;
        document.getElementById('volume-gen-word-count').innerText = `${count} 字`;
    }

    async startVolumeGeneration() {
        if (this.isGenerating) {
            this.showMessage('正在生成中，请稍候...', 'warning');
            return;
        }

        const chapterIndex = document.getElementById('volume-gen-chapter-index').value;
        const outlines = storage.loadForMode('medium-length', 'outlines', []);

        if (!chapterIndex) {
            this.showMessage('请选择一个章节', 'error');
            return;
        }

        const index = parseInt(chapterIndex);

        if (index > outlines.length) {
            this.showMessage(`无效的章节号。请输入1到${outlines.length}之间的数字。`, 'error');
            return;
        }

        this.isGenerating = true;
        this.abortController = new AbortController();

        const currentOutline = outlines[index - 1];
        const project = storage.loadProjectForMode('medium-length');
        const settings = storage.loadSettingsForMode('medium-length');

        const useState = document.getElementById('volume-gen-use-state').checked;
        const useWorld = document.getElementById('volume-gen-use-world').checked;
        const useOutline = document.getElementById('volume-gen-use-outline').checked;
        const useContext = document.getElementById('volume-gen-use-context').checked;
        const updateState = document.getElementById('volume-gen-update-state').checked;
        const mode = document.querySelector('input[name="volume-gen-mode"]:checked').value;

        let context = '';

        if (useContext && index > 1) {
            const prevContents = storage.loadForMode('medium-length', 'chapters', {});
            const prevContent = prevContents[index - 1] || '';
            if (prevContent) {
                const prevSummary = prevContent.substring(Math.max(0, prevContent.length - 800));
                context += `\n【上文回顾】\n...${prevSummary}\n`;
            }
        }

        if (useState) {
            const chars = settings.characterState || [];
            if (chars.length > 0) {
                const charStr = chars.map(c => `${c.key}: ${c.value}`).join(', ');
                context += `\n【当前角色状态】\n${charStr}\n`;
            }
        }

        if (useWorld) {
            const world = settings.worldSettings || {};
            context += `\n【世界观设定】\n${JSON.stringify(world)}\n`;
        }

        const charInfo = settings.characterInfo || [];
        if (charInfo.length > 0) {
            const charInfoStr = charInfo.map(c =>
                `姓名：${c.name}\n角色：${c.role || ''}\n性格：${c.personality || ''}\n外貌：${c.appearance || ''}\n背景：${c.background || ''}`
            ).join('\n---\n');
            context += `\n【重要角色信息】\n${charInfoStr}\n`;
        }

        let additionalInstructions = "";

        if (mode === 'plan') {
            additionalInstructions += "\n重要：在正式写作正文前，请先输出一个简短的【本章细纲】，梳理情节脉络，然后再进行正文写作。\n";
        }

        if (updateState) {
            additionalInstructions += "\n【状态更新指令】\n如果本章中角色状态（如等级、物品、状态等）发生变化，请在文章末尾以JSON格式输出更新后的状态列表，格式例如：\n```json\n{\"state_updates\": [{\"key\": \"等级\", \"value\": \"练气四层\"}]}\n```\n";
        }

        const outlineContent = useOutline ? `本章大纲：${currentOutline.summary}` : "本章大纲：(已忽略)";

        const prompt = `
你是一个专业的网文作家，擅长细腻的描写、紧凑的剧情和抓人的节奏。
请根据以下信息撰写小说正文。

【基础信息】
书名：${project.name}
分类：${project.category}
本章标题：${currentOutline.title}
${outlineContent}

【作者设定】
${project.authorRole}

【创作规则】
${project.rules}

${context}

【写作指令】
1. **严格字数控制**：请撰写第${index}章的正文。本章字数**必须**在 ${project.minWords} 到 ${project.maxWords} 字之间。**字数不足是严重的质量问题。**
2. **细节即字数**：为了达到字数要求，请详细描写环境、人物动作、心理活动和对话细节。不要跳过任何情节，深度展开每一分钟的剧情。
3. **严禁总结**：禁止以任何形式总结前文或本章，禁止出现"总而言之"、"于是"等大幅跳跃。
4. **完整输出**：请直接输出正文内容，确保内容在要求的长度范围内独立成章。
直接输出正文内容。
${additionalInstructions}
`;

        const btn = document.getElementById('btn-start-volume-gen');
        const stopBtn = document.getElementById('btn-stop-volume-gen');
        const editorContainer = document.getElementById('volume-editor-container');
        const display = document.getElementById('volume-gen-content-display');
        const status = document.getElementById('volume-gen-status-text');
        const progressBar = document.getElementById('volume-gen-progress-bar');
        const progressPercent = document.getElementById('volume-progress-percent');

        storage.savePromptForMode('medium-length', index, prompt, currentOutline.title);

        const targetWords = project.minWords || 2000;
        let generatedText = "";

        btn.disabled = true;
        stopBtn.disabled = false;
        status.innerText = '正在生成...';
        display.innerText = '';

        editorContainer.classList.add('generating');
        progressBar.style.width = '0%';
        progressPercent.innerText = '0%';

        try {
            await this.streamAi(prompt, (chunk) => {
                generatedText += chunk;

                let progress = Math.min(99, Math.round((generatedText.length / targetWords) * 100));
                progressBar.style.width = `${progress}%`;
                progressPercent.innerText = `${progress}%`;

                this.updateVolumeWordCount(generatedText);
            });

            progressBar.style.width = '100%';
            progressPercent.innerText = '100%';

            const { cleanContent, stateUpdates, plan } = this.extractAndCleanStateUpdates(generatedText);

            storage.saveGenLogForMode('medium-length', index, generatedText, currentOutline.title);

            if (plan) {
                storage.savePlanForMode('medium-length', index, plan, currentOutline.title);
            }

            if (stateUpdates.length > 0) {
                stateUpdates.forEach(update => {
                    storage.saveStateUpdateForMode('medium-length', index, update);
                });
            }

            display.innerText = cleanContent;
            this.updateVolumeWordCount(cleanContent);

            storage.saveChapterForMode('medium-length', index, cleanContent, currentOutline.title);
            status.innerText = '生成完成 (已自动保存原始记录)';
            this.renderVolumeChapterList();

        } catch (e) {
            console.error(e);
            const config = apiConfig.getActiveConfig();
            const isLocal = config.id === 'local';
            
            let errorMessage = e.message;
            
            if (isLocal) {
                if (errorMessage.includes('fetch') || errorMessage.includes('network')) {
                    errorMessage = '无法连接到本地模型服务，请确保已安装并启动了Ollama。\n\n下载地址：https://ollama.com/\n启动命令：ollama serve';
                } else if (errorMessage.includes('404')) {
                    errorMessage = '模型未找到，请检查模型名称是否正确。\n\n可用模型列表：\n- llama3 (推荐)\n- llama3.1\n- mistral\n- qwen2';
                } else if (errorMessage.includes('500')) {
                    errorMessage = '本地模型服务出错，请检查模型文件是否完整。\n\n尝试重新下载模型：ollama pull llama3';
                } else if (errorMessage.includes('timeout')) {
                    errorMessage = '本地模型响应超时，请尝试：\n1. 增加等待时间\n2. 使用更小的模型 (如 llama3:8b)\n3. 检查系统资源占用';
                } else if (errorMessage.includes('memory') || errorMessage.includes('RAM')) {
                    errorMessage = '内存不足，请尝试：\n1. 使用更小的模型 (如 llama3:8b)\n2. 关闭其他占用内存的程序\n3. 增加系统交换空间';
                }
            }
            
            status.innerText = '生成出错';
            alert('生成出错:\n\n' + errorMessage);
        } finally {
            this.isGenerating = false;
            this.abortController = null;
            btn.disabled = false;
            const stopBtn = document.getElementById('btn-stop-volume-gen');
            if (stopBtn) stopBtn.disabled = true;
            setTimeout(() => {
                editorContainer.classList.remove('generating');
            }, 500);
        }
    }

    stopVolumeGeneration() {
        if (this.abortController) {
            this.abortController.abort();
            this.abortController = null;
        }
        this.isGenerating = false;
        
        const startBtn = document.getElementById('btn-start-volume-gen');
        const stopBtn = document.getElementById('btn-stop-volume-gen');
        const editorContainer = document.getElementById('volume-editor-container');
        const progressContainer = document.getElementById('volume-gen-progress-container');
        const statusText = document.getElementById('volume-gen-status-text');
        
        if (startBtn) startBtn.disabled = false;
        if (stopBtn) stopBtn.disabled = true;
        if (editorContainer) editorContainer.classList.remove('generating');
        if (progressContainer) progressContainer.style.display = 'none';
        if (statusText) statusText.innerText = '已停止';
        
        this.showMessage('已停止生成', 'info');
    }

    extractAndCleanStateUpdates(text) {
        let cleanContent = text;
        const stateUpdates = [];
        let plan = "";

        const jsonRegex = /```json\s*([\s\S]*?)\s*```/g;
        let match;
        while ((match = jsonRegex.exec(text)) !== null) {
            try {
                const jsonStr = match[1];
                const data = JSON.parse(jsonStr);
                if (data.state_updates) {
                    stateUpdates.push(data);
                }
            } catch (e) {
                console.error('Failed to parse state update JSON:', e);
            }
        }

        cleanContent = cleanContent.replace(jsonRegex, '').trim();

        const outlinePatterns = [
            /【本章细纲】[\s\S]*?正文[:：]?\s*/i,
            /本章细纲[:：]?[\s\S]*?正文[:：]?\s*/i,
            /第\d+章细纲[:：]?[\s\S]*?正文[:：]?\s*/i
        ];

        outlinePatterns.forEach(pattern => {
            const planMatch = cleanContent.match(pattern);
            if (planMatch) {
                plan = planMatch[0].trim();
            }
            cleanContent = cleanContent.replace(pattern, '').trim();
        });

        return { cleanContent, stateUpdates, plan };
    }

    async streamAi(prompt, onChunk) {
        const config = apiConfig.getActiveConfig();
        if (!config) throw new Error('API未配置');

        const isLocal = config.id === 'local';
        let headers = {
            'Content-Type': 'application/json'
        };

        if (!isLocal && config.apiKey) {
            headers['Authorization'] = `Bearer ${config.apiKey}`;
        }

        try {
            const response = await fetch(config.endpoint, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify({
                    model: config.model,
                    messages: [{ role: 'user', content: prompt }],
                    temperature: isLocal ? 0.7 : 0.8,
                    max_tokens: isLocal ? 4000 : 8000,
                    stream: true
                }),
                signal: this.abortController?.signal
            });

            if (!response.ok) {
                if (isLocal && response.status === 404) {
                    throw new Error('本地模型服务未运行，请确保Ollama已启动且端口正确。');
                }
                let errorMessage = `API Error: ${response.status}`;
                if (response.status === 401) {
                    errorMessage = 'API Key无效或过期，请重新配置API Key';
                } else if (response.status === 402) {
                    errorMessage = 'API配额不足或需要付费，请检查账户余额或升级套餐';
                } else if (response.status === 403) {
                    errorMessage = '访问被拒绝，请检查API Key是否正确或是否有权限访问该模型';
                } else if (response.status === 404) {
                    errorMessage = 'API端点不存在，请检查配置的API端点是否正确';
                } else if (response.status === 429) {
                    errorMessage = '请求过于频繁，请稍后重试';
                } else if (response.status === 500 || response.status === 502 || response.status === 503) {
                    errorMessage = '服务器错误，请稍后重试或联系API提供商';
                }
                throw new Error(errorMessage);
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value);
                const lines = chunk.split('\n');

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        const data = line.slice(6);
                        if (data === '[DONE]') continue;

                        try {
                            const parsed = JSON.parse(data);
                            let content = '';
                            if (parsed.choices && parsed.choices[0] && parsed.choices[0].delta && parsed.choices[0].delta.content) {
                                content = parsed.choices[0].delta.content;
                            } else if (parsed.message && parsed.message.content) {
                                content = parsed.message.content;
                            }
                            if (content) {
                                onChunk(content);
                            }
                        } catch (e) {
                        }
                    }
                }
            }
        } catch (error) {
            if (error.name === 'AbortError') {
                throw new Error('生成已停止');
            }
            throw error;
        }
    }

    saveNovelName() {
        const novelNameInput = document.getElementById('volume-novel-name');
        const novelName = novelNameInput ? novelNameInput.value.trim() : '';

        if (!novelName) {
            this.showMessage('请输入小说名称', 'error');
            return;
        }

        try {
            storage.saveProjectForMode('medium-length', { name: novelName });
            this.showMessage('小说名称保存成功！', 'success');
            this.updateNovelSelect();
        } catch (e) {
            console.error('Failed to save novel name:', e);
            this.showMessage('保存失败：' + e.message, 'error');
        }
    }

    createNovel() {
        const novelNameInput = document.getElementById('volume-novel-name');
        const novelName = novelNameInput ? novelNameInput.value.trim() : '';

        if (!novelName) {
            this.showMessage('请输入小说名称', 'error');
            return;
        }

        try {
            const created = storage.createProjectForMode('medium-length', novelName);
            if (!created) {
                this.showMessage('创建小说项目失败', 'error');
                return;
            }

            storage.saveProjectForMode('medium-length', { name: novelName });
            this.showMessage('小说项目创建成功！', 'success');
            this.updateNovelSelect();
            this.renderVolumeList();
            this.updateVolumeSelect();
            this.updateVolumeSelectGenerate();
            this.updateVolumeSettingsSelect();
            this.updateVolumeStats();
            this.renderVolumeChapterList();
        } catch (e) {
            console.error('Failed to create novel:', e);
            this.showMessage('创建失败：' + e.message, 'error');
        }
    }

    switchNovel(novelName) {
        try {
            storage.switchProject(novelName, 'medium-length');
            this.showMessage(`已切换到小说：${novelName}`, 'success');
            this.renderVolumeList();
            this.updateVolumeSelect();
            this.updateVolumeSelectGenerate();
            this.updateVolumeSettingsSelect();
            this.updateVolumeStats();
            this.renderVolumeChapterList();
        } catch (e) {
            console.error('Failed to switch novel:', e);
            this.showMessage('切换失败：' + e.message, 'error');
        }
    }

    renderVolumeContentList(query = '') {
        const container = document.getElementById('volume-content-list');
        if (!container) return;

        const chapters = storage.loadChaptersForMode('medium-length');
        const volumes = storage.loadVolumesForMode('medium-length');

        if (!chapters || Object.keys(chapters).length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-book-open" style="font-size: 48px; margin-bottom: 15px; opacity: 0.3;"></i>
                    <p style="color: var(--text-secondary);">暂无章节内容</p>
                    <p style="font-size: 12px; color: var(--text-secondary); margin-top: 5px;">请先在卷生成页面生成章节</p>
                </div>
            `;
            return;
        }

        let html = '';
        Object.keys(chapters).sort((a, b) => parseInt(a) - parseInt(b)).forEach(chapterNum => {
            const chapter = chapters[chapterNum];
            const chapterIndex = parseInt(chapterNum);
            
            if (query && !chapter.includes(query)) {
                return;
            }

            const volume = volumes.find(v => v.chapters && v.chapters.includes(chapterIndex));
            const volumeName = volume ? volume.title : '未分配';
            const wordCount = chapter.length;
            const preview = chapter.substring(0, 80);
            const date = new Date().toLocaleDateString('zh-CN');

            html += `
                <div class="chapter-item enhanced" data-chapter="${chapterNum}" onclick="volumeGenerator.loadVolumeContent(${chapterNum})">
                    <div class="chapter-header">
                        <div class="chapter-number">第${chapterNum}章</div>
                        <div class="chapter-volume">${volumeName}</div>
                        <div class="chapter-word-count">${wordCount}字</div>
                    </div>
                    <div class="chapter-preview">${preview}...</div>
                    <div class="chapter-footer">
                        <span class="chapter-date"><i class="fas fa-calendar-alt"></i> ${date}</span>
                        <span class="chapter-status"><i class="fas fa-check-circle"></i> 已生成</span>
                    </div>
                </div>
            `;
        });

        container.innerHTML = html;
    }

    loadVolumeContent(chapterNum) {
        const chapters = storage.loadChaptersForMode('medium-length');
        const content = chapters[chapterNum];

        if (!content) {
            this.showMessage('章节内容不存在', 'error');
            return;
        }

        const viewer = document.getElementById('volume-content-viewer');
        if (!viewer) return;

        const paragraphs = content.split('\n').filter(p => p.trim());
        const paragraphsHtml = paragraphs.map(p => `<p>${p}</p>`).join('');

        viewer.innerHTML = `
            <div class="chapter-content">
                <h3>第${chapterNum}章</h3>
                <div class="chapter-text">${paragraphsHtml}</div>
            </div>
        `;

        document.querySelectorAll('#volume-content-list .chapter-item').forEach(item => {
            item.classList.remove('active');
        });
        const activeItem = document.querySelector(`#volume-content-list .chapter-item[data-chapter="${chapterNum}"]`);
        if (activeItem) {
            activeItem.classList.add('active');
        }
    }

    exportVolumeContent() {
        const chapters = storage.loadChaptersForMode('medium-length');
        const volumes = storage.loadVolumesForMode('medium-length');
        const project = storage.loadProjectForMode('medium-length');

        if (!chapters || Object.keys(chapters).length === 0) {
            this.showMessage('暂无章节内容可导出', 'error');
            return;
        }

        let content = `${project.name || '小说'}\n\n`;
        content += '='.repeat(50) + '\n\n';

        Object.keys(chapters).sort((a, b) => parseInt(a) - parseInt(b)).forEach(chapterNum => {
            const chapterIndex = parseInt(chapterNum);
            const volume = volumes.find(v => v.chapters && v.chapters.includes(chapterIndex));
            const volumeName = volume ? volume.title : '未分配';

            content += `第${chapterNum}章 [${volumeName}]\n`;
            content += '-'.repeat(30) + '\n';
            content += chapters[chapterNum] + '\n\n';
        });

        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${project.name || '小说'}_完整内容.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        this.showMessage('导出成功！', 'success');
    }

    updateNovelSelect() {
        const select = document.getElementById('volume-novel-select');
        const nameInput = document.getElementById('volume-novel-name');
        if (!select || !nameInput) return;

        try {
            const projects = storage.listProjects('medium-length');
            const currentProject = storage.loadProjectForMode('medium-length');

            select.innerHTML = '<option value="">选择已有小说</option>';
            projects.forEach(name => {
                const option = document.createElement('option');
                option.value = name;
                option.textContent = name;
                if (currentProject && currentProject.name === name) {
                    option.selected = true;
                }
                select.appendChild(option);
            });

            if (currentProject && currentProject.name) {
                nameInput.value = currentProject.name;
            }
        } catch (e) {
            console.error('Failed to update novel select:', e);
        }
    }

    updateVolumeCharacterSelect() {
        const select = document.getElementById('volume-character-select');
        if (!select) return;

        const volumes = storage.loadVolumesForMode('medium-length');
        select.innerHTML = '<option value="">请选择一个卷</option>';
        volumes.forEach(volume => {
            const option = document.createElement('option');
            option.value = volume.id;
            option.textContent = volume.title;
            select.appendChild(option);
        });
    }

    loadVolumeCharacterRelations(volumeId) {
        const container = document.getElementById('character-relations-container');
        if (!container) return;

        const volume = storage.loadVolume(volumeId);
        if (!volume) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-exclamation-circle" style="font-size: 48px; margin-bottom: 15px; opacity: 0.3;"></i>
                    <p style="color: var(--text-secondary);">卷不存在</p>
                </div>
            `;
            return;
        }

        const relations = volume.characterRelations || [];
        if (relations.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-users" style="font-size: 48px; margin-bottom: 15px; opacity: 0.3;"></i>
                    <p style="color: var(--text-secondary);">暂无人物关系</p>
                    <p style="font-size: 12px; color: var(--text-secondary); margin-top: 5px;">点击"添加关系"按钮开始添加</p>
                </div>
            `;
            return;
        }

        let html = '<div class="character-relations-grid">';
        relations.forEach((relation, index) => {
            html += `
                <div class="character-relation-card">
                    <div class="relation-header">
                        <span class="relation-type">${relation.type || '未知关系'}</span>
                        <div class="relation-actions">
                            <button class="btn btn-sm btn-icon btn-edit" onclick="volumeGenerator.editCharacterRelation(${volumeId}, ${index})">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn btn-sm btn-icon btn-delete" onclick="volumeGenerator.deleteCharacterRelation(${volumeId}, ${index})">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                    <div class="relation-content">
                        <div class="relation-characters">
                            <div class="character-tag">${relation.character1}</div>
                            <i class="fas fa-arrow-right relation-arrow"></i>
                            <div class="character-tag">${relation.character2}</div>
                        </div>
                        <div class="relation-description">${relation.description || ''}</div>
                    </div>
                </div>
            `;
        });
        html += '</div>';
        container.innerHTML = html;
    }

    editCharacterRelation(volumeId, index) {
        const volume = storage.loadVolume(volumeId);
        if (!volume || !volume.characterRelations || !volume.characterRelations[index]) {
            this.showMessage('关系不存在', 'error');
            return;
        }

        const relation = volume.characterRelations[index];
        this.openModal(volumeId, relation, index);
    }

    addCharacterRelation() {
        const select = document.getElementById('volume-character-select');
        const volumeId = select ? parseInt(select.value) : null;
        
        if (!volumeId) {
            this.showMessage('请先选择一个卷', 'error');
            return;
        }

        this.openModal(volumeId);
    }

    openModal(volumeId, relation = null, index = -1) {
        const modal = document.getElementById('character-relation-modal');
        const title = document.getElementById('modal-title');
        const volumeIdInput = document.getElementById('modal-volume-id');
        const indexInput = document.getElementById('modal-relation-index');
        const character1Input = document.getElementById('modal-character1');
        const character2Input = document.getElementById('modal-character2');
        const typeSelect = document.getElementById('modal-relation-type');
        const descriptionInput = document.getElementById('modal-relation-description');

        if (!modal || !title || !volumeIdInput || !indexInput || !character1Input || !character2Input || !typeSelect || !descriptionInput) {
            console.error('Modal elements not found');
            return;
        }

        volumeIdInput.value = volumeId;
        indexInput.value = index;

        // 处理从HTML传递的关系数据
        if (typeof relation === 'string') {
            try {
                relation = JSON.parse(relation.replace(/&quot;/g, '"'));
            } catch (e) {
                console.error('Failed to parse relation:', e);
                relation = null;
            }
        }

        if (relation && typeof relation === 'object') {
            title.textContent = '编辑人物关系';
            character1Input.value = relation.character1 || '';
            character2Input.value = relation.character2 || '';
            typeSelect.value = relation.type || '朋友';
            descriptionInput.value = relation.description || '';
        } else {
            title.textContent = '添加人物关系';
            character1Input.value = '';
            character2Input.value = '';
            typeSelect.value = '朋友';
            descriptionInput.value = '';
        }

        modal.style.display = 'block';
        character1Input.focus();

        // 添加背景点击关闭功能
        modal.onclick = (e) => {
            if (e.target === modal) {
                this.closeModal();
            }
        };
    }

    closeModal() {
        const modal = document.getElementById('character-relation-modal');
        if (modal) {
            modal.style.display = 'none';
            // 移除点击事件监听器
            modal.onclick = null;
        }
    }

    saveCharacterRelation() {
        const volumeIdInput = document.getElementById('modal-volume-id');
        const indexInput = document.getElementById('modal-relation-index');
        const character1Input = document.getElementById('modal-character1');
        const character2Input = document.getElementById('modal-character2');
        const typeSelect = document.getElementById('modal-relation-type');
        const descriptionInput = document.getElementById('modal-relation-description');

        if (!volumeIdInput || !indexInput || !character1Input || !character2Input || !typeSelect || !descriptionInput) {
            console.error('Modal elements not found');
            return;
        }

        const volumeId = parseInt(volumeIdInput.value);
        const index = parseInt(indexInput.value);
        const character1 = character1Input.value.trim();
        const character2 = character2Input.value.trim();
        const type = typeSelect.value;
        const description = descriptionInput.value.trim();

        if (!character1 || !character2) {
            this.showMessage('请输入两个角色的名称', 'error');
            return;
        }

        const volume = storage.loadVolume(volumeId);
        if (!volume) {
            this.showMessage('卷不存在', 'error');
            return;
        }

        if (!volume.characterRelations) {
            volume.characterRelations = [];
        }

        const relation = {
            character1,
            character2,
            type,
            description
        };

        if (index >= 0) {
            volume.characterRelations[index] = relation;
            this.showMessage('人物关系编辑成功！', 'success');
        } else {
            volume.characterRelations.push(relation);
            this.showMessage('人物关系添加成功！', 'success');
        }

        storage.saveVolume(volume);
        this.closeModal();
        this.loadVolumeCharacterRelations(volumeId);
    }

    // 改进界面交互体验和响应式设计已完成

    deleteCharacterRelation(volumeId, index) {
        if (!confirm('确定要删除这个人物关系吗？')) {
            return;
        }

        const volume = storage.loadVolume(volumeId);
        if (!volume || !volume.characterRelations) {
            this.showMessage('删除失败', 'error');
            return;
        }

        volume.characterRelations.splice(index, 1);
        storage.saveVolume(volume);
        this.showMessage('人物关系已删除', 'success');
        this.loadVolumeCharacterRelations(volumeId);
    }

    exportCharacterRelations() {
        const select = document.getElementById('volume-character-select');
        const volumeId = select ? parseInt(select.value) : null;
        
        if (!volumeId) {
            this.showMessage('请先选择一个卷', 'error');
            return;
        }

        const volume = storage.loadVolume(volumeId);
        if (!volume || !volume.characterRelations || volume.characterRelations.length === 0) {
            this.showMessage('暂无人物关系可导出', 'error');
            return;
        }

        let content = `《${volume.title}》人物关系\n\n`;
        content += '='.repeat(50) + '\n\n';

        volume.characterRelations.forEach((relation, index) => {
            content += `${index + 1}. ${relation.character1} - ${relation.character2}\n`;
            content += `   关系类型：${relation.type}\n`;
            if (relation.description) {
                content += `   描述：${relation.description}\n`;
            }
            content += '\n';
        });

        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${volume.title}_人物关系.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        this.showMessage('导出成功！', 'success');
    }

    async generateCharacterRelationsByAI() {
        const select = document.getElementById('volume-character-select');
        const volumeId = select ? parseInt(select.value) : null;
        
        if (!volumeId) {
            this.showMessage('请先选择一个卷', 'error');
            return;
        }

        const volume = storage.loadVolume(volumeId);
        if (!volume) {
            this.showMessage('卷不存在', 'error');
            return;
        }

        this.showMessage('正在AI生成人物关系...', 'info');

        try {
            const relations = await this.callAiForCharacterRelations(volume);
            if (relations && relations.length > 0) {
                volume.characterRelations = relations;
                storage.saveVolume(volume);
                this.loadVolumeCharacterRelations(volumeId);
                this.showMessage(`成功生成 ${relations.length} 组人物关系！`, 'success');
            } else {
                this.showMessage('AI生成人物关系失败，请重试', 'error');
            }
        } catch (error) {
            console.error('AI生成人物关系失败:', error);
            this.showMessage('AI生成失败: ' + error.message, 'error');
        }
    }

    async callAiForCharacterRelations(volume) {
        const project = storage.loadProjectForMode('medium-length');
        const volumeSettings = storage.loadVolumeSettings(volume.id);

        let context = '';
        
        if (volumeSettings) {
            if (volumeSettings.mainCharacters) {
                context += '\n【本卷主要角色】\n' + volumeSettings.mainCharacters + '\n';
            }
            if (volumeSettings.characterRelations) {
                context += '\n【本卷角色关系变化】\n' + volumeSettings.characterRelations + '\n';
            }
            if (volumeSettings.mainPlot) {
                context += '\n【本卷主线剧情】\n' + volumeSettings.mainPlot + '\n';
            }
        }

        const prompt = `你是一个专业的网文策划师，擅长设计复杂的人物关系网络和丰富的配角体系。\n\n请根据以下信息，为小说《${project.name || '未知小说'}》的第${volume.id}卷《${volume.title}》生成详细的人物关系。\n\n【卷信息】\n卷名：${volume.title}\n卷概述：${volume.summary || '暂无概述'}\n\n${context}\n\n【生成要求】
1. 生成8-12组人物关系，包括主要角色之间的关系
2. 主动添加2-4个配角角色，这些配角应该：
   - 有鲜明的个性和背景
   - 与主角有 meaningful的互动
   - 能够推动剧情发展
   - 丰富故事的层次感
   - 为剧情增加冲突或喜剧元素
3. 每组关系需要包含：
   - 人物A名称
   - 人物B名称
   - 关系类型（如：朋友、敌人、恋人、师徒、兄弟、姐妹、亲属、同事、其他）
   - 详细的关系描述
4. 关系类型要多样化，不要重复太多
5. 关系描述要具体，包含人物之间的互动和情感
6. 要符合卷的剧情设定
7. 配角的加入要自然合理，能够让读者感到故事更加丰富和真实
8. 考虑配角与主角之间的互动如何影响主角的成长和剧情发展\n\n【输出格式】\n请以JSON格式输出，包含一个relations数组，每个元素格式如下：\n{\n  "character1": "人物A名称",\n  "character2": "人物B名称",\n  "type": "关系类型",\n  "description": "详细描述"\n}\n\n示例输出：\n{\n  "relations": [\n    {\n      "character1": "林风",\n      "character2": "苏雪",\n      "type": "恋人",\n      "description": "林风是青云宗外门弟子，苏雪是内门弟子，两人在宗门大比中相识，苏雪被林风的天赋和毅力吸引，逐渐产生感情，最终成为道侣。"\n    },\n    {\n      "character1": "林风",\n      "character2": "张狂",\n      "type": "敌人",\n      "description": "张狂是血煞门少主，与林风争夺秘境名额和苏雪的好感，多次明争暗斗，最终成为死敌。"\n    }\n  ]\n}\n\n请确保JSON格式正确，内容详细合理。`;

        try {
            const response = await this.callAi(prompt);
            const jsonStr = this.extractJson(response);
            if (jsonStr) {
                const result = JSON.parse(jsonStr);
                if (result.relations && Array.isArray(result.relations)) {
                    return result.relations;
                }
            }
            throw new Error('无法解析AI响应');
        } catch (error) {
            throw error;
        }
    }

    addCharacterRelationStyles() {
        if (document.getElementById('character-relation-styles')) return;

        const style = document.createElement('style');
        style.id = 'character-relation-styles';
        style.textContent = `
            /* 人物关系网格布局 */
            .character-relations-grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
                gap: 20px;
                margin-top: 20px;
            }

            /* 人物关系卡片样式 */
            .character-relation-card {
                background: var(--card-bg);
                border: 1px solid var(--border-color);
                border-radius: 8px;
                padding: 20px;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                transition: all 0.3s ease;
            }

            .character-relation-card:hover {
                box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
                transform: translateY(-2px);
            }

            /* 卡片头部 */
            .relation-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 15px;
                padding-bottom: 10px;
                border-bottom: 1px solid var(--border-color);
            }

            .relation-type {
                font-weight: 600;
                color: var(--accent-color);
                font-size: 14px;
            }

            .relation-actions {
                display: flex;
                gap: 8px;
            }

            .btn-edit {
                color: var(--primary-color);
            }

            .btn-edit:hover {
                background-color: rgba(3, 169, 244, 0.1);
            }

            .btn-delete {
                color: var(--danger-color);
            }

            .btn-delete:hover {
                background-color: rgba(244, 67, 54, 0.1);
            }

            /* 卡片内容 */
            .relation-content {
                display: flex;
                flex-direction: column;
                gap: 12px;
            }

            .relation-characters {
                display: flex;
                align-items: center;
                gap: 12px;
                flex-wrap: wrap;
            }

            .character-tag {
                background: var(--accent-light);
                color: var(--accent-color);
                padding: 6px 12px;
                border-radius: 16px;
                font-size: 14px;
                font-weight: 500;
            }

            .relation-arrow {
                color: var(--text-secondary);
                font-size: 12px;
            }

            .relation-description {
                font-size: 14px;
                color: var(--text-secondary);
                line-height: 1.5;
                margin-top: 5px;
            }

            /* 模态框样式 */
            .modal {
                display: none;
                position: fixed;
                z-index: 1000;
                left: 0;
                top: 0;
                width: 100%;
                height: 100%;
                overflow: auto;
                background-color: rgba(0, 0, 0, 0.5);
            }

            .modal-content {
                background-color: var(--card-bg);
                margin: 15% auto;
                padding: 0;
                border: 1px solid var(--border-color);
                border-radius: 8px;
                width: 90%;
                max-width: 500px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                animation: modalFadeIn 0.3s ease;
            }

            @keyframes modalFadeIn {
                from { opacity: 0; transform: translateY(-20px); }
                to { opacity: 1; transform: translateY(0); }
            }

            .modal-header {
                padding: 20px;
                border-bottom: 1px solid var(--border-color);
                display: flex;
                justify-content: space-between;
                align-items: center;
            }

            .modal-header h3 {
                margin: 0;
                font-size: 18px;
                color: var(--text-primary);
            }

            .btn-close {
                background: none;
                border: none;
                font-size: 20px;
                cursor: pointer;
                color: var(--text-secondary);
                padding: 0;
                width: 30px;
                height: 30px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 4px;
            }

            .btn-close:hover {
                background-color: var(--hover-bg);
                color: var(--text-primary);
            }

            .modal-body {
                padding: 20px;
            }

            .modal-footer {
                padding: 20px;
                border-top: 1px solid var(--border-color);
                display: flex;
                justify-content: flex-end;
                gap: 10px;
            }

            /* 表单样式 */
            #character-relation-form .form-group {
                margin-bottom: 15px;
            }

            #character-relation-form label {
                display: block;
                margin-bottom: 5px;
                font-weight: 500;
                color: var(--text-primary);
            }

            #character-relation-form input,
            #character-relation-form select,
            #character-relation-form textarea {
                width: 100%;
                padding: 10px;
                border: 1px solid var(--border-color);
                border-radius: 4px;
                background-color: var(--input-bg);
                color: var(--text-primary);
                font-size: 14px;
            }

            #character-relation-form input:focus,
            #character-relation-form select:focus,
            #character-relation-form textarea:focus {
                outline: none;
                border-color: var(--accent-color);
                box-shadow: 0 0 0 2px rgba(3, 169, 244, 0.1);
            }

            #character-relation-form textarea {
                resize: vertical;
                min-height: 80px;
            }

            /* 响应式设计 */
            @media (max-width: 768px) {
                .character-relations-grid {
                    grid-template-columns: 1fr;
                }

                .modal-content {
                    margin: 20% auto;
                    width: 95%;
                }

                .relation-header {
                    flex-direction: column;
                    align-items: flex-start;
                    gap: 10px;
                }

                .relation-actions {
                    align-self: flex-end;
                }
            }
        `;

        document.head.appendChild(style);
    }

    initCharacterRelationStyles() {
        this.addCharacterRelationStyles();
    }

    updateChapterProgress(chapterNum, status, statusText) {
        const item = document.getElementById('progress-chapter-' + chapterNum);
        if (!item) return;

        item.className = 'progress-chapter-item ' + status;
        const statusElement = item.querySelector('.progress-chapter-status');
        if (statusElement) {
            statusElement.className = 'progress-chapter-status ' + status;
            statusElement.textContent = statusText;
        }
    }
}

const volumeGenerator = new VolumeGenerator();
