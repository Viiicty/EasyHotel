import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
from datetime import datetime, timedelta

# 项目数据
project_name = "Easy Hotel项目周期"
tasks = [
    {
        "name": "业务逻辑需求理解拆分",
        "start": datetime(2026, 2, 3),
        "end": datetime(2026, 2, 4),
        "color": "#3498db"
    },
    {
        "name": "设计数据库Pdmaner建模",
        "start": datetime(2026, 2, 4),
        "end": datetime(2026, 2, 5),
        "color": "#e74c3c"
    },
    {
        "name": "酒店及房型审核模块",
        "start": datetime(2026, 2, 5),
        "end": datetime(2026, 2, 9),
        "color": "#f39c12"
    },
    {
        "name": "酒店上线、图片接口、轮播大图",
        "start": datetime(2026, 2, 9),
        "end": datetime(2026, 2, 11),
        "color": "#9b59b6"
    },
    {
        "name": "小程序首页、列表、详情、登录",
        "start": datetime(2026, 2, 11),
        "end": datetime(2026, 2, 15),
        "color": "#1abc9c"
    },
    {
        "name": "登录、房价房态模块",
        "start": datetime(2026, 2, 15),
        "end": datetime(2026, 2, 28),
        "color": "#2ecc71"
    },
    {
        "name": "联调测试",
        "start": datetime(2026, 2, 21),
        "end": datetime(2026, 2, 24),
        "color": "#34495e"
    },
    {
        "name": "测试上线",
        "start": datetime(2026, 2, 24),
        "end": datetime(2026, 2, 28),
        "color": "#e91e63"
    }
]

# 创建图表
fig, ax = plt.subplots(figsize=(14, 8))

# 设置中文字体
plt.rcParams['font.sans-serif'] = ['SimHei', 'Microsoft YaHei', 'Arial Unicode MS']
plt.rcParams['axes.unicode_minus'] = False

# 设置背景色
ax.set_facecolor('#f8f9fa')

# 绘制任务条
for i, task in enumerate(tasks):
    start_date = task["start"]
    end_date = task["end"]
    duration = (end_date - start_date).days + 1
    
    # 绘制任务条
    ax.barh(i, duration, left=start_date, height=0.6, 
            color=task["color"], alpha=0.8, edgecolor='white', linewidth=1)
    
    # 添加任务名称
    ax.text(start_date + timedelta(days=duration/2), i, task["name"], 
            va='center', ha='center', fontsize=10, color='white', fontweight='bold')
    
    # 添加日期标注
    ax.text(start_date, i + 0.35, start_date.strftime('%m/%d'), 
            va='center', ha='left', fontsize=8, color='#666')
    ax.text(end_date, i + 0.35, end_date.strftime('%m/%d'), 
            va='center', ha='right', fontsize=8, color='#666')

# 设置Y轴
ax.set_yticks(range(len(tasks)))
ax.set_yticklabels([task["name"] for task in tasks], fontsize=10)
ax.invert_yaxis()

# 设置X轴（日期范围）
start_date = datetime(2026, 2, 3)
end_date = datetime(2026, 2, 28)

# 设置X轴刻度
ax.set_xlim(start_date - timedelta(days=0.5), end_date + timedelta(days=0.5))

# 手动设置X轴刻度
tick_dates = []
for day in range(3, 29):
    tick_dates.append(datetime(2026, 2, day))

ax.set_xticks(tick_dates)
ax.set_xticklabels([d.strftime('%m/%d') for d in tick_dates], rotation=45, ha='right')

# 添加网格线
ax.grid(True, axis='x', linestyle='--', alpha=0.3, color='#ccc')
ax.set_axisbelow(True)

# 设置标题和标签
ax.set_title(project_name, fontsize=16, fontweight='bold', pad=20)
ax.set_xlabel('日期', fontsize=12, fontweight='bold')
ax.set_ylabel('任务', fontsize=12, fontweight='bold')

# 调整布局
plt.tight_layout()

# 保存图片
plt.savefig('Easy_Hotel_项目周期甘特图.png', dpi=300, bbox_inches='tight', 
            facecolor='white', edgecolor='none')

print("甘特图已生成：Easy_Hotel_项目周期甘特图.png")

# 显示图表
plt.show()
