class ApiConfig {
    constructor() {
        this.autoSaveTimeout = null;
        this.autoSaveDelay = 1000;
        this.isSaving = false;
        
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
            this.init();
        }
    }

    init() {
        // 确保storage对象存在
        if (typeof storage === 'undefined') {
            console.warn('Storage not loaded yet, waiting...');
            setTimeout(() => this.init(), 100);
            return;
        }
        
        this.loadConfig();
        this.bindEvents();
    }

    bindEvents() {
        document.getElementById('btn-save-api').addEventListener('click', () => this.saveConfig());

        // Auto-save on input changes
        this.bindAutoSaveEvents();

        // Handle switch toggles (radio behavior)
        document.querySelectorAll('.api-item .switch input').forEach(input => {
            input.addEventListener('change', (e) => {
                if (e.target.checked) {
                    // Uncheck others
                    document.querySelectorAll('.api-item .switch input').forEach(other => {
                        if (other !== e.target) other.checked = false;
                    });

                    // Visual update
                    document.querySelectorAll('.api-item').forEach(item => item.classList.remove('active'));
                    e.target.closest('.api-item').classList.add('active');
                }
                
                // Auto-save on switch toggle
                this.triggerAutoSave();
            });
        });

        // Local model specific events
        const localModelSelect = document.getElementById('api-model-local');
        const localModelCustomInput = document.getElementById('api-model-local-custom');
        
        if (localModelSelect && localModelCustomInput) {
            localModelSelect.addEventListener('change', (e) => {
                if (e.target.value === 'custom') {
                    localModelCustomInput.disabled = false;
                    localModelCustomInput.focus();
                } else {
                    localModelCustomInput.disabled = true;
                }
            });

            localModelCustomInput.addEventListener('input', (e) => {
                if (localModelSelect.value === 'custom' && e.target.value) {
                    // Store custom model name in a data attribute
                    localModelSelect.dataset.customModel = e.target.value;
                }
            });
        }

        // Local model detection
        const localModelCheck = document.getElementById('local-model-check');
        if (localModelCheck) {
            localModelCheck.addEventListener('change', (e) => {
                const localModelsList = document.getElementById('local-models-list');
                if (e.target.checked) {
                    localModelsList.style.display = 'block';
                    this.detectLocalModels();
                } else {
                    localModelsList.style.display = 'none';
                }
            });
        }

        // Local model test button
        const testButton = document.getElementById('btn-test-local');
        if (testButton) {
            testButton.addEventListener('click', async () => {
                const originalText = testButton.innerHTML;
                testButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 测试中...';
                testButton.disabled = true;

                try {
                    // 测试Ollama服务是否运行
                    const response = await fetch('http://localhost:11434/api/tags', {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        timeout: 5000 // 添加5秒超时
                    });

                    if (response.ok) {
                        const data = await response.json();
                        const modelCount = data.models ? data.models.length : 0;
                        alert(`本地服务连接成功！\n\n已检测到 ${modelCount} 个模型。\n\n推荐模型：llama3 或 qwen2:1.5b`);
                    } else {
                        alert('连接失败，请确保Ollama已安装并启动。\n\n下载地址：https://ollama.com/\n启动命令：ollama serve');
                    }
                } catch (error) {
                    let errorMessage = '无法连接到本地服务：';
                    if (error.message.includes('Failed to fetch') || error.message.includes('网络错误')) {
                        errorMessage += '\n\nOllama服务可能未运行或端口被占用。\n\n请执行以下步骤：\n1. 下载并安装Ollama：https://ollama.com/\n2. 打开终端/命令行\n3. 运行命令：ollama serve\n4. 保持服务运行后再测试';
                    } else {
                        errorMessage += '\n\n' + error.message + '\n\n请确保已安装Ollama并运行：ollama serve';
                    }
                    alert(errorMessage);
                } finally {
                    testButton.innerHTML = originalText;
                    testButton.disabled = false;
                }
            });
        }

        // Download model button
        const downloadButton = document.getElementById('btn-download-model');
        if (downloadButton) {
            downloadButton.addEventListener('click', () => {
                const recommendedModels = [
                    'llama3 (推荐，综合能力强)',
                    'qwen2:1.5b (微型，适合快速测试)',
                    'llama3:8b (轻量版，平衡速度与质量)',
                    'qwen2:7b (平衡版)'
                ];

                const message = `推荐下载模型：\n\n${recommendedModels.join('\n')}\n\n请在终端/命令行中执行以下命令：\n\nollama pull llama3\n\n或下载微型模型进行快速测试：\n\nollama pull qwen2:1.5b`;

                alert(message);
                
                if (confirm('是否打开Ollama官方网站查看更多模型？')) {
                    window.open('https://ollama.com/library', '_blank');
                }
            });
        }
    }

    loadConfig() {
        const config = storage.loadApiConfig();
        if (!config || !config.apis) return;

        const populate = (id, defaultModel, defaultEndpoint) => {
            const api = config.apis[id] || {};
            const modelEl = document.getElementById(`api-model-${id}`);
            const endEl = document.getElementById(`api-endpoint-${id}`);

            if (modelEl) modelEl.value = api.model || defaultModel;
            if (endEl) endEl.value = api.endpoint || defaultEndpoint;

            // Handle custom model for local
            if (id === 'local') {
                const customModelInput = document.getElementById('api-model-local-custom');
                if (customModelInput) {
                    customModelInput.value = api.customModel || '';
                    if (api.model && !['llama3', 'llama3:8b', 'llama3.1', 'llama3.1:8b', 'mistral', 'mistral:7b', 'qwen2', 'qwen2:7b', 'qwen2:1.5b', 'gemma2', 'phi3', 'deepseek-coder-v2', 'zephyr', 'codellama'].includes(api.model)) {
                        modelEl.value = 'custom';
                        customModelInput.disabled = false;
                        customModelInput.value = api.model;
                    }
                }
            }
        };

        // --- 2026 最新主流模型配置 ---
        // DeepSeek 系列 (V3 为通用，R1 为推理)
        populate('deepseek', 'deepseek-chat', 'https://api.deepseek.com/v1/chat/completions');
        populate('deepseek-r1', 'deepseek-reasoner', 'https://api.deepseek.com/v1/chat/completions');
        
        // OpenAI 系列 (含推理模型 o1/o3-mini)
        populate('openai', 'gpt-4o', 'https://api.openai.com/v1/chat/completions');
        populate('openai-o1', 'o1', 'https://api.openai.com/v1/chat/completions');

        // Anthropic Claude (通常建议使用中转或官方接口)
        populate('claude', 'claude-3-5-sonnet-latest', 'https://api.anthropic.com/v1/messages');

        // Google Gemini
        populate('gemini', 'gemini-2.0-flash', 'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions');

        // 国产主流
        populate('moonshot', 'moonshot-v1-auto', 'https://api.moonshot.cn/v1/chat/completions');
        populate('zhipu', 'glm-4-plus', 'https://open.bigmodel.cn/api/paas/v4/chat/completions');
        populate('qwen', 'qwen-max-latest', 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions');
        populate('doubao', 'doubao-pro-128k', 'https://ark.cn-beijing.volces.com/api/v3/chat/completions');

        // 第三方聚合与本地
        populate('siliconflow', 'deepseek-ai/DeepSeek-V3', 'https://api.siliconflow.cn/v1/chat/completions');
        populate('local', 'llama3', 'http://localhost:11434/v1/chat/completions');
        populate('local-legacy', 'llama3', 'http://localhost:11434/api/chat'); // 旧版Ollama API

        // Set Active Selectors
        const activeId = config.activeId || 'deepseek';
        const selectors = {
            'deepseek': '#page-api-config .api-item[data-id="deepseek"] input[type="checkbox"]',
            'deepseek-r1': '#page-api-config .api-item[data-id="deepseek-r1"] input[type="checkbox"]',
            'openai': '#page-api-config .api-item[data-id="openai"] input[type="checkbox"]',
            'openai-o1': '#page-api-config .api-item[data-id="openai-o1"] input[type="checkbox"]',
            'claude': '#page-api-config .api-item[data-id="claude"] input[type="checkbox"]',
            'moonshot': '#page-api-config .api-item[data-id="moonshot"] input[type="checkbox"]',
            'zhipu': '#page-api-config .api-item[data-id="zhipu"] input[type="checkbox"]',
            'qwen': '#page-api-config .api-item[data-id="qwen"] input[type="checkbox"]',
            'doubao': '#page-api-config .api-item[data-id="doubao"] input[type="checkbox"]',
            'gemini': '#page-api-config .api-item[data-id="gemini"] input[type="checkbox"]',
            'local': '#page-api-config .api-item[data-id="local"] input[type="checkbox"]',
            'siliconflow': '#page-api-config .api-item[data-id="siliconflow"] input[type="checkbox"]'
        };

        const activeSelector = selectors[activeId];
        if (activeSelector) {
            const activeInput = document.querySelector(activeSelector);
            if (activeInput) {
                activeInput.checked = true;
                document.querySelectorAll('.api-item').forEach(item => item.classList.remove('active'));
                activeInput.closest('.api-item').classList.add('active');
            }
        }
    }

    saveConfig() {
        // Use auto-save without indicator for manual save
        this.autoSave(false);
        // Show success message for manual save
        const indicator = document.getElementById('auto-save-indicator');
        if (!indicator) {
            this.showAutoSaveIndicator();
        }
        const finalIndicator = document.getElementById('auto-save-indicator');
        if (finalIndicator) {
            finalIndicator.innerHTML = '<i class="fas fa-check-circle"></i> 配置已保存';
            finalIndicator.style.background = 'linear-gradient(135deg, #10b981, #059669)';
            
            setTimeout(() => {
                finalIndicator.style.animation = 'slideOutRight 0.3s ease';
                setTimeout(() => {
                    finalIndicator.style.display = 'none';
                }, 300);
            }, 2000);
        }
    }

    getActiveConfig() {
        // 从页面获取当前激活的API
        let activeId = 'deepseek';
        document.querySelectorAll('.api-item').forEach(item => {
            if (item.querySelector('input[type="checkbox"]').checked) {
                activeId = item.getAttribute('data-id');
            }
        });

        // 获取API数据
        const getApiData = (id, name) => {
            const modelEl = document.getElementById(`api-model-${id}`);
            const endEl = document.getElementById(`api-endpoint-${id}`);
            
            let modelValue = '';
            let customModel = '';
            
            if (id === 'local' && modelEl) {
                if (modelEl.value === 'custom') {
                    const customInput = document.getElementById('api-model-local-custom');
                    modelValue = customInput ? customInput.value : '';
                    customModel = modelValue;
                } else {
                    modelValue = modelEl.value;
                }
            } else if (modelEl) {
                modelValue = modelEl.value;
            }
            
            return {
                id: id,
                name: name,
                enabled: activeId === id,
                model: modelValue,
                customModel: customModel,
                endpoint: endEl ? endEl.value : ''
            };
        };

        // 获取当前激活的API配置
        const activeConfig = getApiData(activeId, '');
        
        // 本地模型不需要API Key
        if (activeId !== 'local') {
            // 获取当前激活API的API Key
            const apiKeyInput = document.getElementById(`api-key-${activeId}`);
            if (apiKeyInput) {
                activeConfig.apiKey = apiKeyInput.value;
            }
        }

        return activeConfig;
    }

    async detectLocalModels() {
        const display = document.getElementById('local-models-display');
        if (!display) return;

        display.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 正在检测本地模型...';

        try {
            const response = await fetch('http://localhost:11434/api/tags', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                },
                timeout: 5000 // 添加5秒超时
            });

            if (response.ok) {
                const data = await response.json();
                const models = data.models || [];

                if (models.length === 0) {
                    display.innerHTML = '<span class="text-muted">未检测到本地模型，请安装Ollama并下载模型</span>';
                } else {
                    // 自动选择第一个模型
                    const firstModel = models[0].name;
                    const modelSelect = document.getElementById('api-model-local');
                    
                    // 检查模型是否在选项中
                    let modelOptionExists = false;
                    for (let option of modelSelect.options) {
                        if (option.value === firstModel) {
                            modelOptionExists = true;
                            break;
                        }
                    }
                    
                    if (modelOptionExists) {
                        modelSelect.value = firstModel;
                        const customInput = document.getElementById('api-model-local-custom');
                        if (customInput) {
                            customInput.disabled = true;
                            modelSelect.dataset.customModel = firstModel;
                        }
                    } else {
                        // 如果模型不在选项中，使用自定义模式
                        modelSelect.value = 'custom';
                        const modelInput = document.getElementById('api-model-local-custom');
                        if (modelInput) {
                            modelInput.disabled = false;
                            modelInput.value = firstModel;
                            modelSelect.dataset.customModel = firstModel;
                        }
                    }
                    
                    let html = '<div style="max-height: 200px; overflow-y: auto;">';
                    models.forEach((model, index) => {
                        const isSelected = model.name === firstModel;
                        html += `
                            <div style="padding: 8px; border-bottom: 1px solid var(--border-color); cursor: pointer; ${isSelected ? 'background-color: rgba(3, 218, 198, 0.1);' : ''}" 
                                 onclick="document.getElementById('api-model-local').value = '${model.name}'; const customInput = document.getElementById('api-model-local-custom'); if (customInput) { customInput.disabled = true; } alert('已选择模型: ${model.name}')">
                                ${isSelected ? '<i class="fas fa-check-circle" style="color: var(--success-color);"></i> ' : ''}
                                <strong>${model.name}</strong>
                                ${index === 0 ? ' <span style="color: var(--success-color); font-weight: bold;">(已自动选择)</span>' : ''}
                                <small style="display: block; color: var(--text-muted);">
                                    尺寸: ${model.details.param_size || '未知'} | 格式: ${model.details.format || '未知'}
                                </small>
                            </div>
                        `;
                    });
                    html += '</div>';
                    display.innerHTML = html;
                    
                    // 显示成功提示
                    setTimeout(() => {
                        alert(`检测完成！\n\n找到 ${models.length} 个本地模型。\n\n已自动选择第一个模型: ${firstModel}`);
                    }, 500);
                }
            } else {
                display.innerHTML = '<span class="text-muted">连接失败，请确保Ollama正在运行</span>';
            }
        } catch (error) {
            let errorMessage = '检测失败: ';
            if (error.message.includes('Failed to fetch') || error.message.includes('网络错误')) {
                errorMessage += 'Ollama服务可能未运行，请先启动Ollama服务';
            } else {
                errorMessage += error.message;
            }
            display.innerHTML = `<span class="text-muted">${errorMessage}</span>`;
        }
    }

    bindAutoSaveEvents() {
        // Bind auto-save to all input fields
        const inputSelectors = [
            '#page-api-config input[type="text"]',
            '#page-api-config input[type="password"]',
            '#page-api-config select'
        ];

        inputSelectors.forEach(selector => {
            document.querySelectorAll(selector).forEach(input => {
                input.addEventListener('input', () => this.triggerAutoSave());
                input.addEventListener('change', () => this.triggerAutoSave());
            });
        });
    }

    triggerAutoSave() {
        // Clear existing timeout
        if (this.autoSaveTimeout) {
            clearTimeout(this.autoSaveTimeout);
        }

        // Set new timeout for auto-save
        this.autoSaveTimeout = setTimeout(() => {
            this.autoSave();
        }, this.autoSaveDelay);
    }

    autoSave(showIndicator = true) {
        if (this.isSaving) return;
        
        this.isSaving = true;
        if (showIndicator) {
            this.showAutoSaveIndicator();
        }

        // Perform save without alert
        let activeId = 'deepseek';
        document.querySelectorAll('.api-item').forEach(item => {
            if (item.querySelector('input[type="checkbox"]').checked) {
                activeId = item.getAttribute('data-id');
            }
        });

        const getApiData = (id, name) => {
            const modelEl = document.getElementById(`api-model-${id}`);
            const endEl = document.getElementById(`api-endpoint-${id}`);
            const keyEl = document.getElementById(`api-key-${id}`);
            
            let modelValue = '';
            let customModel = '';
            
            if (id === 'local' && modelEl) {
                if (modelEl.value === 'custom') {
                    const customInput = document.getElementById('api-model-local-custom');
                    modelValue = customInput ? customInput.value : '';
                    customModel = modelValue;
                } else {
                    modelValue = modelEl.value;
                }
            } else if (modelEl) {
                modelValue = modelEl.value;
            }
            
            return {
                id: id,
                name: name,
                enabled: activeId === id,
                model: modelValue,
                customModel: customModel,
                endpoint: endEl ? endEl.value : '',
                apiKey: keyEl ? keyEl.value : ''
            };
        };

        const config = {
            activeId: activeId,
            apis: {
                deepseek: getApiData('deepseek', 'DeepSeek-V3'),
                'deepseek-r1': getApiData('deepseek-r1', 'DeepSeek-R1'),
                openai: getApiData('openai', 'OpenAI GPT-4o'),
                'openai-o1': getApiData('openai-o1', 'OpenAI o1'),
                claude: getApiData('claude', 'Claude 3.5'),
                moonshot: getApiData('moonshot', 'Kimi'),
                zhipu: getApiData('zhipu', '智谱 GLM'),
                qwen: getApiData('qwen', '通义千问'),
                doubao: getApiData('doubao', '字节豆包'),
                gemini: getApiData('gemini', 'Google Gemini'),
                local: getApiData('local', 'Local (Ollama)'),
                siliconflow: getApiData('siliconflow', '硅基流动')
            }
        };

        if (storage.saveApiConfig(config)) {
            if (showIndicator) {
                this.showAutoSaveSuccess();
            }
        } else {
            if (showIndicator) {
                this.showAutoSaveError();
            }
        }

        this.isSaving = false;
    }

    showAutoSaveIndicator() {
        let indicator = document.getElementById('auto-save-indicator');
        if (!indicator) {
            indicator = document.createElement('div');
            indicator.id = 'auto-save-indicator';
            indicator.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: linear-gradient(135deg, var(--accent-color), #7c3aed);
                color: white;
                padding: 12px 24px;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(98, 0, 234, 0.3);
                z-index: 9999;
                font-size: 14px;
                font-weight: 500;
                display: flex;
                align-items: center;
                gap: 8px;
                animation: slideInRight 0.3s ease;
            `;
            document.body.appendChild(indicator);
        }
        indicator.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 正在保存...';
        indicator.style.display = 'flex';
    }

    showAutoSaveSuccess() {
        const indicator = document.getElementById('auto-save-indicator');
        if (indicator) {
            indicator.innerHTML = '<i class="fas fa-check-circle"></i> 已自动保存';
            indicator.style.background = 'linear-gradient(135deg, #10b981, #059669)';
            
            setTimeout(() => {
                indicator.style.animation = 'slideOutRight 0.3s ease';
                setTimeout(() => {
                    indicator.style.display = 'none';
                }, 300);
            }, 2000);
        }
    }

    showAutoSaveError() {
        const indicator = document.getElementById('auto-save-indicator');
        if (indicator) {
            indicator.innerHTML = '<i class="fas fa-exclamation-circle"></i> 保存失败';
            indicator.style.background = 'linear-gradient(135deg, #ef4444, #dc2626)';
            
            setTimeout(() => {
                indicator.style.animation = 'slideOutRight 0.3s ease';
                setTimeout(() => {
                    indicator.style.display = 'none';
                }, 300);
            }, 2000);
        }
    }
}

const apiConfig = new ApiConfig();