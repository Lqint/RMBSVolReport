# RMBSVolReport
Provide a simple and easy-to-use solution for generationg an annual report for your volunteer organization.

# 2025 人大商院青协年度报告系统

## 项目概述

这是一个基于 Flask + Swiper 的志愿者年度报告生成系统，用于展示志愿者的年度活动数据和成就，包括服务时长、活动类型分布、参与活动记录等。系统采用现代化的滑动页面设计，提供了丰富的交互效果和视觉体验。

## 技术栈

### 后端
- **Flask** - Python Web 框架
- **Pandas** - 数据处理和分析
- **NumPy** - 数值计算

### 前端
- **HTML5 + CSS3** - 页面结构和样式
- **JavaScript (ES Modules)** - 交互逻辑
- **Swiper** - 滑动页面库
- **Chart.js** - 数据可视化
- **html2canvas** - 海报生成

## 项目结构

```
Annual_report/
├── app.py                 # Flask 应用主文件
├── data/                  # 数据文件夹
│   ├── volunteer_records.csv  # 志愿者活动记录
│   └── org_stats.json     # 协会统计数据
├── photos/                # 活动照片
├── static/                # 静态资源
│   ├── css/               # 样式文件
│   │   ├── style.css      # 旧版主样式文件
│   │   └── styles/        # 模块化样式文件
│   └── js/                # JavaScript 文件
│       ├── main.js        # 旧版主脚本文件
│       └── src/           # 模块化脚本文件
│           ├── api/       # API 请求
│           ├── features/  # 功能模块
│           ├── slides/    # 动态页面生成
│           ├── swiper/    # Swiper 初始化
│           └── utils/     # 工具函数
└── templates/             # HTML 模板
    └── annual_report.html # 主页面模板
```

## 安装和运行

### 环境要求
- Python 3.8+
- pip 包管理器

### 安装步骤

1. **安装依赖**
   ```bash
   pip install flask pandas numpy
   ```

2. **运行应用**
   ```bash
   python app.py
   ```

3. **访问应用**
   在浏览器中输入 `http://127.0.0.1:4399/annual_report`

## 功能说明

1. **首页展示** - 展示报告标题和主题
2. **点亮微光游戏** - 互动游戏，点击图标收集温暖
3. **档案调阅** - 输入姓名和学号获取个人报告
4. **年度能力评定** - 展示志愿者的核心能力领域和各项活动时长
5. **独家记忆** - 展示志愿者的年度里程碑事件
6. **志愿足迹** - 热力图展示全年参与活动的月份分布
7. **时光掠影** - 展示志愿者参与的活动照片
8. **星火相聚** - 展示共同参与活动的其他志愿者
9. **年度画像** - 生成志愿者的年度标签和证书
10. **生成证书** - 生成并下载年度志愿者证书

## 核心功能实现

### 数据处理
- 从 CSV 文件中读取志愿者活动记录
- 按活动类型统计服务时长
- 生成雷达图数据
- 计算活跃天数和里程碑事件

### 前端交互
- Swiper 滑动页面效果
- 盖章动画效果
- 热力图交互
- 游戏互动
- 海报生成和下载

## 开发说明

### 静态资源管理
- 样式文件采用模块化设计，位于 `static/css/styles/` 目录
- JavaScript 文件采用 ES Modules 模块化设计，位于 `static/js/src/` 目录
- 主样式文件已从 `style.css` 迁移到 `styles/main.css`

### API 接口
- `/api/get_annual_data` - POST 请求，获取志愿者年度数据
  - 参数：`name` (姓名), `phone` (学号)
  - 返回：志愿者年度报告数据

### 数据文件格式

#### volunteer_records.csv
```csv
姓名,学号,活动名称,活动类型,活动日期,服务时长,活动封面图
张三,2022201638,支教活动,支教,2025-03-15,8,teaching.jpg
李四,2022201682,环保活动,环保,2025-04-20,6,eco.jpg
```

#### org_stats.json
```json
{
  "total_org_hours": "12580",
  "total_events": "86",
  "total_people": "1200+",
  "public_gallery": [],
  "dept_summaries": {
    "支教": "这一年，我们用粉笔和笑声点亮了三省五地的课堂。",
    "关怀": "这一年，我们陪伴了无数个孤独的黄昏和清晨。",
    "环保": "这一年，我们用行动让星河更清澈。",
    "心之旅": "这一年，我们在一次次对话中，拥抱彼此的情绪。"
  },
  "dept_letters": {
    "支教": [
      "见字如面，小小的粉笔，曾在你的指尖跳舞。",
      "因为有你，那些偏远的教室，多了一束温柔的光。"
    ]
  }
}
```

## 注意事项

1. 确保 `data/volunteer_records.csv` 文件格式正确，包含必要的字段
2. 确保 `photos/` 目录中包含活动封面图
3. 首次运行时，系统会自动加载数据文件
4. 开发模式下，Flask 会自动重启应用以应用代码更改

## 浏览器兼容性

- Chrome (推荐)
- Firefox
- Safari
- Edge
