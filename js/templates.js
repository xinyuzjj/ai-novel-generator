// Extracted from prompt-templates.json and outline-templates.json
const APP_TEMPLATES = {
    "categories": {
        "xuanhuan": {
            "id": "xuanhuan",
            "name": "玄幻小说",
            "description": "修仙、异界、魔法等玄幻题材",
            "author_role": "你是玄幻作家，擅长构建独特世界观和修炼体系。",
            "creation_rules": "【玄幻特色】修炼突破要有身体感受和代价，战斗要有策略不只比法术大，世界观要有独创元素",
            "state_update_guide": "追踪：修炼等级、功法进度、法宝品级、宗门地位、仇敌名单。直接输出JSON。",
            "type_hints": "境界术语自然融入，修炼有身体感受（元气流动、经脉胀痛），家族/宗门内部有派系差异"
        },
        "dushi": {
            "id": "dushi",
            "name": "都市小说",
            "description": "都市生活、商战、情感等现代题材",
            "author_role": "你是都市小说作家，擅长描写现代生活的真实质感。",
            "creation_rules": "【都市特色】生活细节真实（地铁/外卖/加班），情感细腻不矫情，自然使用网络梗和谐音字（尼玛/花擦/我去）",
            "state_update_guide": "追踪：资产规模、公司发展、人脉关系、社会地位。直接输出JSON。",
            "type_hints": "具体品牌/地点/价格，现代社交元素（微信/朋友圈），职场有专业术语和潜规则"
        },
        "xianxia": {
            "id": "xianxia",
            "name": "仙侠小说",
            "description": "修仙、飞升、仙界等仙侠题材",
            "author_role": "你是仙侠作家，擅长营造超脱意境和人间烟火气的平衡。",
            "creation_rules": "【仙侠特色】修仙者也有人间烟火气，渡劫要九死一生不走过场，古风韵味但不堆砌文言",
            "state_update_guide": "追踪：修为境界、道行深浅、仙术掌握、法宝炼化、道侣关系。直接输出JSON。",
            "type_hints": "仙术/渡劫有规则和代价，古风韵味但不堆砌文言，修仙者也有人间烟火气"
        },
        "lishi": {
            "id": "lishi",
            "name": "历史小说",
            "description": "历史架空、穿越历史等题材",
            "author_role": "你是历史小说作家，擅长还原历史质感和权谋博弈。",
            "creation_rules": "【历史/穿越特色】现代思维与古代环境碰撞要自然，金手指有限制不能太顺，服饰礼仪官职要准确用古代俚语",
            "state_update_guide": "追踪：官职品级、势力范围、军队实力、政治地位、人物关系。直接输出JSON。",
            "type_hints": "服饰礼仪官职准确用词符合时代，历史人物有血肉不脸谱化，权谋有层次"
        },
        "kehuan": {
            "id": "kehuan",
            "name": "科幻小说",
            "description": "星际、未来科技、末世等科幻题材",
            "author_role": "你是科幻作家，科技是外壳，人性是内核。",
            "creation_rules": "【科幻特色】科技设定自洽有依据，术语融入剧情不堆砌，有人文思考（伦理/人性/文明）",
            "state_update_guide": "追踪：科技等级、装备配置、星际探索、势力版图、科研成果。直接输出JSON。",
            "type_hints": "科技设定自洽有依据，术语融入剧情不堆砌，有人文思考（伦理/人性/文明）"
        },
        "wuxia": {
            "id": "wuxia",
            "name": "武侠小说",
            "description": "江湖、武功、侠义等武侠题材",
            "author_role": "你是武侠作家，侠之大者为国为民，快意恩仇笑傲江湖。",
            "creation_rules": "【武侠特色】江湖烟火气（酒馆/镖局/客栈），武功招式有画面感和独创性，恩怨情仇有因有果",
            "state_update_guide": "追踪：武功境界、内力深度、招式掌握、江湖地位、恩怨关系。直接输出JSON。",
            "type_hints": "江湖烟火气（酒馆/镖局/客栈），武功招式有画面感，恩怨情仇有因有果"
        },
        "yanqing": {
            "id": "yanqing",
            "name": "言情小说",
            "description": "现代言情、古代言情等情感题材",
            "author_role": "你是言情作家，擅长描写细腻的心动瞬间。",
            "creation_rules": "【言情特色】用独特细节展示心动不总说心跳脸红，暧昧期最好看（欲言又止/若即若离），感情发展要自然",
            "state_update_guide": "追踪：好感度变化、关系进展、重要时刻、情感危机。直接输出JSON。",
            "type_hints": "关系暧昧不明说用细节暗示，身体接触有生理反应（心跳、脸红、呼吸），情感进展有反复和试探"
        },
        "xuanyi": {
            "id": "xuanyi",
            "name": "悬疑小说",
            "description": "推理、侦探、恐怖等悬疑题材",
            "author_role": "你是悬疑作家，线索公平、推理严密、反转震撼。",
            "creation_rules": "【悬疑特色】开篇抛出谜团悬念层层递进，真线索隐藏假线索误导但都公平，反转要有伏笔支撑",
            "state_update_guide": "追踪：线索列表、嫌疑人档案、案件进度、已揭露真相。直接输出JSON。",
            "type_hints": "线索埋设看似无关，信息差（读者知道≠角色知道），反转前文有伏笔但不明显"
        },
        "youxi": {
            "id": "youxi",
            "name": "游戏小说",
            "description": "网游、电竞、游戏异界等题材",
            "author_role": "你是游戏小说作家，升级成就感、装备获得感、PK刺激感。",
            "creation_rules": "【游戏特色】游戏机制合理自洽数值平衡，升级装备获得有仪式感，战斗操作有细节配合有默契",
            "state_update_guide": "追踪：等级属性、装备列表、技能树、公会信息、游戏进度。直接输出JSON。"
        },
        "qihuan": {
            "id": "qihuan",
            "name": "奇幻小说",
            "description": "西方魔幻、龙与地下城等奇幻题材",
            "author_role": "你是奇幻作家，宏大世界观、史诗般冒险。",
            "creation_rules": "【奇幻特色】魔法体系有独创性和限制，种族有灵魂不是换皮人类，冒险有使命感力量有代价",
            "state_update_guide": "追踪：魔法等级、装备神器、技能法术、冒险进度、队伍成员。直接输出JSON。"
        },
        "junshi": {
            "id": "junshi",
            "name": "军事小说",
            "description": "军事战争、特种兵、抗战等题材",
            "author_role": "你是军事作家，铁血军魂、战友情深。",
            "creation_rules": "【军事特色】战术装备编制准确符合常识，战场描写有临场感，军人也有恐惧和挣扎战友情有细节",
            "state_update_guide": "追踪：军衔职务、战斗经验、装备配置、战友关系、任务记录。直接输出JSON。"
        },
        "xianshi": {
            "id": "xianshi",
            "name": "现实小说",
            "description": "职场励志、社会纪实、生活情感等题材",
            "author_role": "你是现实题材作家，真实的故事最动人。",
            "creation_rules": "【现实特色】情节符合现实逻辑不过度戏剧化，人物有优点有缺点成长有过程，传递正能量但自然不做作",
            "state_update_guide": "追踪：职业发展、人际关系、生活状态、情感进展、成长轨迹。直接输出JSON。"
        },
        "erciyuan": {
            "id": "erciyuan",
            "name": "二次元小说",
            "description": "动漫同人、轻小说、原创动漫等题材",
            "author_role": "你是轻小说作家，热血战斗、萌系角色、有趣日常。",
            "creation_rules": "【二次元特色】角色有标签但更要有深度不是扁平人设，搞笑自然不刻意堆梗，战斗要燃必杀技要帅",
            "state_update_guide": "追踪：能力等级、角色关系、好感度、技能觉醒、剧情进度。直接输出JSON。"
        },
        "tiyu": {
            "id": "tiyu",
            "name": "体育小说",
            "description": "篮球、足球、电竞体育等题材",
            "author_role": "你是体育作家，拼搏汗水、团队荣耀、突破极限。",
            "creation_rules": "【体育特色】规则战术术语准确，比赛描写有临场感和紧张感，从菜鸟到高手有过程个人与团队关系是核心",
            "state_update_guide": "追踪：技术等级、体能数据、比赛战绩、团队关系、荣誉成就。直接输出JSON。"
        },
        "lingyi": {
            "id": "lingyi",
            "name": "灵异小说",
            "description": "恐怖惊悚、灵异探险、超自然现象等题材",
            "author_role": "你是灵异作家，恐惧来自未知和细节。",
            "creation_rules": "【灵异特色】恐怖氛围慢慢铺垫不一上来就吓人，用细节制造恐惧（脚步声/影子/温度变化），未知比已知更恐怖",
            "state_update_guide": "追踪：灵异能力、遭遇事件、线索收集、精神状态、危险等级。直接输出JSON。"
        },
        "tongren": {
            "id": "tongren",
            "name": "同人小说",
            "description": "影视同人、游戏同人、动漫同人等题材",
            "author_role": "你是同人作家，尊重原作，给粉丝想看的内容。",
            "creation_rules": "【同人特色】角色性格说话方式还原原作不违背基本设定，粉丝想看的互动要安排上，角色要对味",
            "state_update_guide": "追踪：角色关系、剧情进度、原作元素运用。直接输出JSON。"
        },
        "professional": {
            "id": "professional",
            "name": "【大神】专业架构",
            "description": "资深小说架构师 & 影视分镜大师模式",
            "author_role": "Role: 资深类型小说架构师 & 影视分镜大师\n\nProfile\n你集合了严谨的结构化设计能力、敏锐的都市情感洞察力以及深厚的心理学功底。擅长“冰山理论”写作，拒绝悬浮，专注于垂直细分领域。",
            "creation_rules": "1. 题材限定：仅限 [架空世界+都市情感 / 都市异能 / 悬疑推理] 三选一。\n2. 垂直深耕：不要大杂烩，必须在一个细分设定上做深。\n3. 反套路：标题必须包含“反常细节”的钩子。\n4. 场景切片化：按分镜逻辑创作，调动感官感。（Scene Slicing）\n5. 300字法则：每隔约300字，必须出现一个小反转、一个违和的细节。\n6. 冰山理论：对话简洁，潜台词丰富，表现情绪而非说明情绪。",
            "state_update_guide": "追踪：反派阴谋进度、角色心理创伤值、核心物证及其象征意义、情绪波动曲线。直接输出JSON。",
            "type_hints": "每段不超过80字，保持移动端阅读流畅感。结尾钩子必留极致悬念。"
        },
        "urban_emotion": {
            "id": "urban_emotion",
            "name": "都市情感(深度)",
            "description": "基于专业架构的都市情感赛道",
            "author_role": "资深都市情感小说架构师，深谙都市生活的真实质感与复杂人性。",
            "creation_rules": "情感剥笋式推进，拒绝无脑宠溺或狗血，聚焦都市男女的灵魂博弈。",
            "state_update_guide": "追踪：关系深度、信任指数、核心冲突点、生活质感锚点。直接输出JSON。"
        }
    },
    "outline_system": {
        "task_description": "你是小说策划编辑，为每章设计大纲，确保情节自然发展、人物立体真实。",
        "outline_components": [
            "主要情节：200-300字，详细描述起承转合",
            "关键冲突：核心矛盾、应对方式、结果",
            "情感曲线：开头→中间→结尾的情绪变化"
        ],
        "output_format": "【第N章】章节标题(2-15字，有画面感或悬念)\n\n注意：章节编号必须用【】括起来，例如【第1章】、【第2章】\n\n**主要情节：**（200-300字）\n\n**关键冲突：**（矛盾-应对-结果）\n\n**情感曲线：**（开头→中间→结尾）\n\n**章节钩子：**（结尾悬念）\n\n**本章边界：**（可选，本章需要规避的情节）"
    },
    "outline_requirements": {
        "xuanhuan": ["设定要有独特元素，避免套路化", "修炼突破要有铺垫和代价", "人物要立体，有成长有变化"],
        "xianxia": ["场景营造超脱感（云海、剑光、道韵）", "渡劫要惊心动魄、九死一生", "道侣情缘要有修仙韵味"],
        "dushi": ["情节要符合现实逻辑", "人物要立体，有缺点有成长", "场景要有真实的城市细节"],
        "default": ["情节发展要自然，有铺垫有过渡", "人物要立体，有成长有变化", "结尾要有吸引力"]
    },
    "preset_settings": {
        "xuanhuan": {
            "characterState": [
                { "key": "金手指", "value": "修仙模拟器系统" },
                { "key": "系统功能", "value": "每日签到、任务奖励、商城兑换" },
                { "key": "特殊能力", "value": "百倍悟性" },
                { "key": "当前修为", "value": "练气三层" },
                { "key": "积分", "value": "100" }
            ],
            "worldSettings": {
                "修炼体系": "练气(1-9层)-筑基-金丹-元婴-化神-炼虚-合体-大乘",
                "货币体系": "灵石(下/中/上/极品)",
                "宗门等级": "九品至一品",
                "当前地图": "青云宗外门"
            },
            "characterInfo": [
                { "name": "林风", "gender": "男", "age": "16", "role": "主角", "personality": "坚韧不拔、重情重义", "appearance": "剑眉星目、气质沉稳", "background": "散修出身，意外获得上古传承" },
                { "name": "苏婉儿", "gender": "女", "age": "15", "role": "女主", "personality": "冰清玉洁、外冷内热", "appearance": "倾国倾城、气质出尘", "background": "天剑宗圣女，天赋异禀" }
            ]
        },
        "dushi": {
            "characterState": [
                { "key": "金手指", "value": "神级选择系统" },
                { "key": "系统功能", "value": "每日三次选择机会，必出最优结果" },
                { "key": "当前资产", "value": "3500元" },
                { "key": "特殊技能", "value": "过目不忘" },
                { "key": "幸运值", "value": "MAX" }
            ],
            "worldSettings": {
                "社会背景": "2024年平行世界蓝星",
                "科技水平": "与现代一致",
                "特殊设定": "存在少量异能者/系统拥有者(如适用)"
            },
            "characterInfo": [
                { "name": "陈阳", "gender": "男", "age": "25", "role": "主角", "personality": "聪明果断、不甘平凡", "appearance": "阳光帅气、身材匀称", "background": "普通大学毕业生，机缘巧合获得系统" },
                { "name": "林诗雨", "gender": "女", "age": "24", "role": "女主", "personality": "独立自强、温柔善良", "appearance": "清纯可人、气质优雅", "background": "公司白领，与主角青梅竹马" }
            ]
        },
        "xianxia": {
            "characterState": [
                { "key": "金手指", "value": "时间回溯" },
                { "key": "特殊能力", "value": "可回溯三次重大选择" },
                { "key": "当前道行", "value": "五十年" },
                { "key": "仙缘", "value": "上古传承记忆" },
                { "key": "气运", "value": "紫金" }
            ],
            "worldSettings": {
                "六界": "神、仙、人、妖、魔、鬼",
                "天条": "仙凡不得通婚",
                "飞升条件": "渡过九九天劫"
            },
            "characterInfo": [
                { "name": "云逸", "gender": "男", "age": "不详", "role": "主角", "personality": "超脱洒脱、重情重义", "appearance": "白衣飘飘、仙风道骨", "background": "凡人修仙，历经磨难飞升仙界" },
                { "name": "月华仙子", "gender": "女", "age": "不详", "role": "女主", "personality": "冰清玉洁、痴情专一", "appearance": "绝世容颜、气质超凡", "background": "月宫仙子，与主角前世有缘" }
            ]
        },
        "lishi": {
            "characterState": [
                { "key": "官职", "value": "七品县令" },
                { "key": "爵位", "value": "无" },
                { "key": "声望", "value": "籍籍无名" },
                { "key": "私兵", "value": "0" },
                { "key": "库银", "value": "五十两" }
            ],
            "worldSettings": {
                "朝代": "架空大周王朝",
                "政治体制": "三省六部制",
                "外部威胁": "北狄、南蛮"
            },
            "characterInfo": [
                { "name": "李明远", "gender": "男", "age": "28", "role": "主角", "personality": "智谋过人、胸怀天下", "appearance": "儒雅俊朗、气度不凡", "background": "现代穿越者，熟知历史" },
                { "name": "柳如烟", "gender": "女", "age": "18", "role": "女主", "personality": "聪慧机敏、温婉贤淑", "appearance": "倾城倾国、书香气质", "background": "相府千金，才女佳人" }
            ]
        },
        "kehuan": {
            "characterState": [
                { "key": "基因等级", "value": "F级" },
                { "key": "精神力", "value": "120" },
                { "key": "机甲", "value": "民用工程机(破旧)" },
                { "key": "信用点", "value": "500" }
            ],
            "worldSettings": {
                "星际文明": "银河联邦",
                "科技树": "曲率引擎、强人工智能、基因飞升",
                "敌对势力": "虫族、智械叛乱"
            }
        },
        "wuxia": {
            "characterState": [
                { "key": "内力", "value": "十年" },
                { "key": "兵器", "value": "精钢剑" },
                { "key": "轻功", "value": "草上飞" },
                { "key": "江湖名号", "value": "初出茅庐" },
                { "key": "银两", "value": "二十两" }
            ],
            "worldSettings": {
                "武学境界": "三流、二流、一流、后天、先天、宗师",
                "主要门派": "少林、武当、峨眉、魔教",
                "兵器谱": "百晓生兵器谱"
            }
        },
        "yanqing": {
            "characterState": [
                { "key": "心情", "value": "期待" },
                { "key": "妆容", "value": "素颜" },
                { "key": "穿着", "value": "白色连衣裙" },
                { "key": "好感度(男主)", "value": "0" }
            ],
            "worldSettings": {
                "故事背景": "现代大都市/豪门世家",
                "社会关系": "家族联姻/校园恋爱"
            },
            "characterInfo": [
                { "name": "顾晨曦", "gender": "女", "age": "22", "role": "女主", "personality": "独立坚强、内心柔软", "appearance": "清纯可人、气质出众", "background": "普通家庭出身，努力奋斗" },
                { "name": "陆景琛", "gender": "男", "age": "28", "role": "男主", "personality": "霸道深情、外冷内热", "appearance": "俊美无俦、气场强大", "background": "豪门继承人，商业天才" }
            ]
        },
        "xuanyi": {
            "characterState": [
                { "key": "SAN值", "value": "90/100" },
                { "key": "手持道具", "value": "手电筒" },
                { "key": "当前线索", "value": "0" },
                { "key": "生命状态", "value": "轻微惊吓" }
            ],
            "worldSettings": {
                "诡异规则": "天黑别回头、不要回应呼唤",
                "神秘力量": "克苏鲁/民间怪谈"
            }
        },
        "youxi": {
            "characterState": [
                { "key": "等级", "value": "LV.1" },
                { "key": "职业", "value": "见习战士" },
                { "key": "生命值", "value": "100/100" },
                { "key": "攻击力", "value": "10" },
                { "key": "幸运", "value": "999(隐藏)" }
            ],
            "worldSettings": {
                "游戏类型": "全息虚拟网游",
                "开服时间": "2030年",
                "货币兑换": "1金币=100现实币"
            }
        },
        "qihuan": {
            "characterState": [
                { "key": "职业", "value": "见习魔法师" },
                { "key": "魔力", "value": "微弱" },
                { "key": "元素亲和", "value": "火" },
                { "key": "契约兽", "value": "火史莱姆" }
            ],
            "worldSettings": {
                "魔法等级": "学徒-正式-大魔导-圣域-神级",
                "种族": "人类、精灵、矮人、兽人、龙",
                "大陆": "艾泽拉斯大陆"
            }
        },
        "junshi": {
            "characterState": [
                { "key": "军衔", "value": "列兵" },
                { "key": "职务", "value": "步枪手" },
                { "key": "枪法", "value": "优秀" },
                { "key": "体能", "value": "良好" }
            ],
            "worldSettings": {
                "特种部队": "狼牙特战旅",
                "作战环境": "边境丛林",
                "敌对势力": "跨国雇佣兵"
            }
        },
        "xianshi": {
            "characterState": [
                { "key": "职业", "value": "外卖员" },
                { "key": "存款", "value": "-5000(负债)" },
                { "key": "健康", "value": "亚健康" },
                { "key": "心情", "value": "迷茫" }
            ],
            "worldSettings": {
                "时代背景": "2024年",
                "社会热点": "就业难、房价、养老"
            }
        },
        "erciyuan": {
            "characterState": [
                { "key": "能力", "value": "矢量操作(LV.1)" },
                { "key": "学园都市排名", "value": "无" },
                { "key": "好感度(御坂)", "value": "陌生" }
            ],
            "worldSettings": {
                "能力体系": "LV0-LV5(绝对能力者)-LV6(绝对能力者进化)",
                "舞台": "学园都市"
            }
        },
        "tiyu": {
            "characterState": [
                { "key": "位置", "value": "控球后卫" },
                { "key": "身高", "value": "185cm" },
                { "key": "臂展", "value": "195cm" },
                { "key": "三分球", "value": "B-" },
                { "key": "控球", "value": "A" }
            ],
            "worldSettings": {
                "联赛": "NBA/CBA",
                "选秀顺位": "首轮末尾",
                "目标": "总冠军"
            }
        },
        "lingyi": {
            "characterState": [
                { "key": "灵视", "value": "阴阳眼(封印中)" },
                { "key": "护身符", "value": "祖传玉佩" },
                { "key": "阳气", "value": "虚弱" }
            ],
            "worldSettings": {
                "禁忌": "半夜照镜子、玩笔仙",
                "鬼怪等级": "游魂、厉鬼、红衣、鬼王"
            }
        },
        "tongren": {
            "characterState": [
                { "key": "身份", "value": "宇智波遗孤" },
                { "key": "查克拉", "value": "中忍水平" },
                { "key": "忍术", "value": "豪火球之术" },
                { "key": "写轮眼", "value": "一勾玉" }
            ],
            "worldSettings": {
                "世界": "火影忍者",
                "时间线": "木叶60年",
                "外挂": "无限查克拉系统"
            }
        },
        "duanpian": {
            "characterState": [
                { "key": "主角", "value": "老王" },
                { "key": "核心矛盾", "value": "借钱" }
            ],
            "worldSettings": {
                "背景": "当代农村/城市角落"
            }
        }
    }
};
