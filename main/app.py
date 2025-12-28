from flask import Flask, render_template, request, jsonify, send_from_directory, url_for
import os
import re
import json
from datetime import datetime
from collections import defaultdict, Counter

import pandas as pd

app = Flask(__name__)

# ====== 配置区 ======
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PHOTO_FOLDER = os.path.join(BASE_DIR, 'photos')
DATA_FOLDER = os.path.join(BASE_DIR, 'data')
CSV_PATH = os.path.join(DATA_FOLDER, 'volunteer_records.csv')
ORG_STATS_PATH = os.path.join(DATA_FOLDER, 'org_stats.json')

# 活动类型映射到雷达图维度
TYPE_KEYS = {
    '支教': 'teaching',
    '关怀': 'care',
    '环保': 'eco',
    '心之旅': 'mind',
    '其他': 'others'
}

# 活动类型 → 活跃天数权重（可以按需调）
ACTIVE_DAYS_WEIGHT = {
    '线上支教': 35,
    '夏令营': 14,
    '返乡实践': 7,
    'Buddy': 48,
    '蒲公英': 28,
    "商火": 30
}

# 处理numpy类型数据
import numpy as np
from flask.json.provider import DefaultJSONProvider

class NumpyJSONProvider(DefaultJSONProvider):
    def default(self, o):
        if isinstance(o, (np.integer,)):
            return int(o)
        if isinstance(o, (np.floating,)):
            return float(o)
        if isinstance(o, (np.ndarray,)):
            return o.tolist()
        return super().default(o)

app.json = NumpyJSONProvider(app)



# ====== 启动时加载数据 ======
df_records = None      # 志愿流水账
org_stats = None       # 协会年度公共数据 & 部门文案 & 致信文案


def normalize_phone(phone: str) -> str:
    """只保留数字，去掉空格、- 等"""
    return re.sub(r'\D', '', str(phone))


def load_data():
    global df_records, org_stats

    # 1. 加载 CSV
    df = pd.read_csv(CSV_PATH, dtype=str)  # 全部先读成 str，后面再转
    df = df.rename(columns={
        '姓名': 'name',
        '学号': 'phone',
        '活动名称': 'activity_name',
        '活动类型': 'activity_type',
        '活动日期': 'activity_date',
        '服务时长': 'hours',
        '活动封面图': 'cover_img'
    })

    # 清洗手机号
    df['phone'] = df['phone'].map(normalize_phone)

    # 活动日期转 datetime
    df['activity_date'] = pd.to_datetime(df['activity_date'], errors='coerce')

    # 服务时长转 float
    df['hours'] = pd.to_numeric(df['hours'], errors='coerce').fillna(0.0)

    df_records = df

    # 2. 加载协会公共数据（总时长、总活动数、部门文案、致信文案等）
    if os.path.exists(ORG_STATS_PATH):
        with open(ORG_STATS_PATH, 'r', encoding='utf-8') as f:
            data = json.load(f)
    else:
        # 没填就给一份默认的兜底数据，后续可以改成读文件
        data = {
            "total_org_hours": "12580",
            "total_events": "86",
            "total_people": "1200+",
            "public_gallery": [],
            "dept_summaries": {  # 四个部门 50 字总结，用于小游戏弹窗
                "支教": "这一年，我们用粉笔和笑声点亮了三省五地的课堂。",
                "关怀": "这一年，我们陪伴了无数个孤独的黄昏和清晨。",
                "环保": "这一年，我们用行动让星河更清澈。",
                "心之旅": "这一年，我们在一次次对话中，拥抱彼此的情绪。"
            },
            "dept_letters": {  # 不同主力部门给志愿者的信（分行展示）
                "支教": [
                    "见字如面，小小的粉笔，曾在你的指尖跳舞。",
                    "因为有你，那些偏远的教室，多了一束温柔的光。"
                ],
                "关怀": [
                    "你走进的每一间屋子，都悄悄改变了那里的空气。",
                    "你握住的每一只手，都把冬天拉近了春天。"
                ],
                "环保": [
                    "你弯下腰捡起的一片片垃圾，是守护星河的最初一步。",
                    "山川湖海，会记得你轻轻的守护。"
                ],
                "心之旅": [
                    "你愿意听别人说话的样子，本身就是一种很温柔的力量。",
                    "愿你也被温柔以待，在倾听别人的同时，好好照顾自己。"
                ],
                "其他": [
                    "你可能已经忘记那些被你填满的周末，但时光记得。",
                    "谢谢你在忙碌的日子里，仍然愿意把时间留给公益。"
                ]
            }
        }
    org_stats = data


load_data()


# ====== 工具函数：统计 & 组装报告 ======

def get_user_records(name: str, phone: str):
    """根据姓名 + 手机号筛选该同学的所有记录"""
    if not name or not phone:
        return pd.DataFrame([])

    phone_norm = normalize_phone(phone)
    mask = (df_records['name'] == name) & (df_records['phone'] == phone_norm)
    return df_records[mask].sort_values('activity_date')


def calc_type_hours(df_user: pd.DataFrame):
    """按活动类型统计总时长，返回：{teaching: xx, care: xx, ...}, main_type"""
    stats = {v: 0.0 for v in TYPE_KEYS.values()}

    for _, row in df_user.iterrows():
        t = str(row['activity_type'] or '').strip()
        hours = float(row['hours'] or 0)
        key = TYPE_KEYS.get(t, 'others')
        stats[key] += hours

    # 主力类型：时长最多的那个维度
    main_type_key = max(stats, key=stats.get)
    # 反向映射回中文名
    main_type_cn = None
    for cn, en in TYPE_KEYS.items():
        if en == main_type_key:
            main_type_cn = cn
            break
    if not main_type_cn:
        main_type_cn = "其他"

    # 小数处理
    stats = {k: round(v, 1) for k, v in stats.items()}

    return stats, main_type_cn


def calc_active_days(df_user: pd.DataFrame):
    """根据活动类型估算活跃天数"""
    days = 0
    for _, row in df_user.iterrows():
        t = str(row['activity_type'] or '').strip()
        name = str(row['activity_name'] or '').strip()

        # 优先看名称里有没有“夏令营”等关键词
        if '夏令营' in name:
            days += ACTIVE_DAYS_WEIGHT.get('夏令营', 1)
        elif t in ACTIVE_DAYS_WEIGHT:
            days += ACTIVE_DAYS_WEIGHT[t]
        else:
            days += ACTIVE_DAYS_WEIGHT.get('其他', 1)

    # 为防止特别夸张，简单做一个上限
    return min(days, 365)


def calc_month_stats(df_user: pd.DataFrame):
    """按月份统计服务时长，用于“志愿足迹”折线图/柱状图"""
    month_hours = defaultdict(float)
    for _, row in df_user.iterrows():
        date = row['activity_date']
        if pd.isna(date):
            continue
        month = date.strftime('%Y-%m')  # e.g. 2024-03
        month_hours[month] += float(row['hours'] or 0)

    # 排序输出
    result = [
        {"month": m, "hours": round(h, 1)}
        for m, h in sorted(month_hours.items())
    ]
    return result


def generate_tags(df_user: pd.DataFrame, total_hours: float, main_type_cn: str):
    """
    升级版标签生成：返回 [{"name": "标签名", "desc": "解释文案"}, ...]
    """
    # 默认兜底
    default_tags = [
        {"name": "星火初燃", "desc": "这是你志愿旅程的起点，星星之火，终将燎原。"},
        {"name": "全能帮手", "desc": "哪里需要去哪里，你是团队中不可或缺的万能砖。"},
        {"name": "新手上路", "desc": "欢迎加入志愿大家庭，未来的路我们一起走。"},
        {"name": "冬日限定", "desc": "在这个冬天，你留下了温暖的足迹。"}
    ]

    if df_user is None or df_user.empty:
        return default_tags[:4]

    # ---- 基础数据准备 (保持原有逻辑) ----
    df = df_user.copy()
    df['activity_type'] = df['activity_type'].astype(str).fillna("").str.strip()
    df['activity_name'] = df['activity_name'].astype(str).fillna("").str.strip()
    df['_hours_f'] = pd.to_numeric(df.get('hours', 0), errors='coerce').fillna(0.0)

    event_cnt = int(len(df))
    uniq_types = sorted(set([t for t in df['activity_type'].tolist() if t]))
    type_cnt = len(uniq_types)

    # 计算月份
    df_valid_date = df[df['activity_date'].notna()].copy()
    if not df_valid_date.empty:
        df_valid_date['_month'] = df_valid_date['activity_date'].dt.strftime('%Y-%m')
        active_months = int(df_valid_date['_month'].nunique())
    else:
        active_months = 0

    # 计算主力和占比
    stats_map, _ = calc_type_hours(df)  # 假设 calc_type_hours 存在
    total_by_type = sum(stats_map.values()) if stats_map else 0.0
    main_key = TYPE_KEYS.get(main_type_cn, 'others')
    main_share = float(stats_map.get(main_key, 0.0)) / float(total_by_type) if total_by_type > 0 else 0

    # 季节计算
    season_hours = {"春": 0.0, "夏": 0.0, "秋": 0.0, "冬": 0.0}
    for _, row in df.iterrows():
        date = row.get('activity_date')
        if pd.isna(date): continue
        m = int(date.month)
        h = float(row.get('_hours_f', 0.0) or 0.0)
        if m in [3, 4, 5]:
            season_hours["春"] += h
        elif m in [6, 7, 8]:
            season_hours["夏"] += h
        elif m in [9, 10, 11]:
            season_hours["秋"] += h
        else:
            season_hours["冬"] += h
    best_season = max(season_hours, key=season_hours.get) if season_hours else "冬"

    # ---- 候选池构建 (tag, weight, description) ----
    candidates = []

    # 1. 荣誉/时长类
    if total_hours >= 200:
        candidates.append(
            ("星河守望者", 100, f"累计志愿时长达到 {int(total_hours)} 小时。你不仅是参与者，更是这片星河的守望者。"))
    elif total_hours >= 120:
        candidates.append(("百时守护", 90, f"累计志愿时长突破 100 小时。百尺竿头，感谢你长久的坚持。"))
    elif total_hours >= 60:
        candidates.append(("志愿达人", 80, f"累计志愿时长 {int(total_hours)} 小时。你已经是商院青协的中坚力量！"))
    elif total_hours >= 30:
        candidates.append(("温暖续航", 70, "你的爱心如同电池，持续为需要帮助的人提供能量。"))
    elif total_hours >= 10:
        candidates.append(("萤火拾光", 60, "点点萤火，汇聚成光。感谢你贡献的每一分钟。"))
    else:
        candidates.append(("星火初燃", 50, "这是你志愿旅程的起点，星星之火，终将燎原。"))

    # 2. 角色/方向类
    role_map = {
        '支教': ('点灯人', '你主要投身于支教项目。愿做那一盏灯，照亮孩子们前行的路。'),
        '关怀': ('暖心天使', '你主要投身于社会关怀。温柔如你，总是把老人和孩子放在心上。'),
        '环保': ('环保先锋', '你主要投身于环保项目。守护碧水蓝天，你一直在行动。'),
        '心之旅': ('心灵向导', '你主要投身于心理服务。善于倾听，用温暖的话语治愈心灵。'),
        '其他': ('全能帮手', '不限领域，哪里需要去哪里，你是最可靠的伙伴。')
    }
    r_tag, r_desc = role_map.get(main_type_cn, role_map['其他'])
    candidates.append((r_tag, 85, r_desc))

    # 3. 属性类
    if main_share >= 0.75 and total_hours >= 20:
        candidates.append(("专精玩家", 65, f"你在{main_type_cn}领域投入了超过 75% 的精力，是当之无愧的专家。"))
    elif type_cnt >= 3:
        candidates.append(("多栖玩家", 70, "涉猎广泛，多种类型的志愿活动中都能看到你的身影。"))

    if event_cnt >= 8:
        candidates.append(("高频出没", 75, f"这一年你参加了 {event_cnt} 场活动，简直是志愿活动的“钉子户”！"))
    elif active_months >= 6:
        candidates.append(("月更达人", 72, "一年中有超过 6 个月都在做志愿，你的坚持令人动容。"))
    elif active_months >= 4:
        candidates.append(("持续发光", 58, "每个季度都能看到你的身影，感谢你的持续付出。"))

    # 4. 季节类
    season_desc = {
        "春": "春风十里不如你，你在春季的活跃度最高。",
        "夏": "烈日炎炎，挡不住你的热情，你在夏季最为活跃。",
        "秋": "金秋时节，收获满满，你在秋季留下了最多的足迹。",
        "冬": "寒冬腊月，你是温暖的火光，你在冬季最为活跃。"
    }
    season_tag_map = {
        "春": "春风送暖", "夏": "夏立蝉鸣", "秋": "金秋行动", "冬": "冬日融融"
    }
    candidates.append((season_tag_map.get(best_season, f"{best_season}日限定"), 40, season_desc.get(best_season, "")))

    # 5. 关键词彩蛋
    names_join = " ".join(df['activity_name'].tolist())
    keyword_tags = [
        (r"商火相传", "薪火引路人", 60, "商火相传限定称号。你是新生的引路人，接过传承的火炬，用陪伴温暖了他们的初秋。"),
        (r"夏令营", "筑梦师", 62, "何处是中国·筑梦夏令营限定称号。感谢你为孩子们筑起了梦想的城堡。"),
        (r"支教|课堂|授课", "课堂派", 52, "活跃在三尺讲台，传播知识的种子。"),
        (r"探访|陪伴|慰问", "陪伴系", 52, "你的陪伴，是这一年最长情的告白。"),
        (r"环保|巡河|净滩", "地球合伙人", 52, "为了蔚蓝澄净的世界，你一直在努力。"),
    ]
    for pattern, tag, w, desc in keyword_tags:
        if re.search(pattern, names_join):
            candidates.append((tag, w, desc))

    # ---- 筛选逻辑 ----
    # 1. 按权重排序
    candidates.sort(key=lambda x: -x[1])

    # 2. 去重 (保留权重最高的那个)
    unique_candidates = []
    seen_names = set()
    for name, w, desc in candidates:
        if name not in seen_names:
            unique_candidates.append({"name": name, "desc": desc})
            seen_names.add(name)

    # 3. 必选策略 (保证有段位或角色) + 补齐
    final_tags = []

    # 优先找一个高权重的(通常是段位或角色)
    if unique_candidates:
        final_tags.append(unique_candidates.pop(0))

    # 补齐到 4 个
    final_tags.extend(unique_candidates[:4])  # 之前已经pop了一个，所以再取3个

    # 如果不足4个 (极端情况)，用默认补
    while len(final_tags) < 5:
        for d in default_tags:
            if d['name'] not in [t['name'] for t in final_tags]:
                final_tags.append(d)
                if len(final_tags) >= 5: break

    return final_tags[:5]


def generate_milestones(df_user: pd.DataFrame, total_hours: float):
    """
    生成更多条里程碑（会自动根据数据“有则展示、无则跳过”）：
    - 初次相遇
    - 连续投入（按 ACTIVE_DAYS_WEIGHT 推算该活动持续天数）
    - 高光时刻：单次服务时长最高
    - 深度项目：单次持续天数最高
    - 里程碑：累计时长首次达成（1/10/30/50/100，可按需改）
    - 高频活动：参与次数最多的活动
    - 多元参与：参与 >=3 类活动
    - 最忙月份：某月累计时长最高
    - 暖心收官
    """
    milestones = []
    if df_user.empty:
        return milestones

    # 确保按日期排序（你的上游 get_user_records 已排序，这里再保险）
    df_user = df_user.sort_values('activity_date').copy()

    def fmt_date(dt):
        return dt.strftime('%Y.%m.%d') if (dt is not None and not pd.isna(dt)) else ""

    def safe_str(x):
        return str(x) if x is not None and not pd.isna(x) else ""

    def expand_to_daily_rows(df_sorted: pd.DataFrame) -> pd.DataFrame:
        """
        把每条活动按持续天数线性摊到每天：
        - activity_date 视为结束日
        - start_date = end_date - (est_days - 1)
        - 每天 hours = 总 hours / est_days
        返回字段：
        - day: 这一天的日期
        - hours_day: 这一天分摊到的小时数
        - activity_name/activity_type: 原活动信息（用于里程碑文案引用）
        """
        rows = []
        for _, row in df_sorted.iterrows():
            end_dt = row.get('activity_date')
            if pd.isna(end_dt):
                continue

            est_days = int(row.get('_est_days', 1) or 1)
            est_days = max(est_days, 1)

            total_h = float(row.get('_hours_f', 0.0) or 0.0)
            h_day = total_h / est_days if est_days > 0 else 0.0

            # 结束日记录的是最后一天，所以往前推 est_days-1 天
            start_dt = end_dt - pd.Timedelta(days=(est_days - 1))

            for i in range(est_days):
                day = start_dt + pd.Timedelta(days=i)
                rows.append({
                    "day": day.normalize(),
                    "hours_day": h_day,
                    "activity_name": safe_str(row.get("activity_name")),
                    "activity_type": safe_str(row.get("activity_type")),
                    "end_date": end_dt.normalize(),
                })

        df_daily = pd.DataFrame(rows)
        if df_daily.empty:
            return df_daily

        df_daily = df_daily.sort_values("day").reset_index(drop=True)
        return df_daily

    def estimate_days(row) -> int:
        """
        按 ACTIVE_DAYS_WEIGHT 推算“该活动持续天数”：
        """
        t = safe_str(row.get('activity_type', '')).strip()
        n = safe_str(row.get('activity_name', '')).strip()
        if '夏令营' in n:
            return int(ACTIVE_DAYS_WEIGHT.get('夏令营', 1))
        if t in ACTIVE_DAYS_WEIGHT:
            return int(ACTIVE_DAYS_WEIGHT.get(t, 1))
        return int(ACTIVE_DAYS_WEIGHT.get('其他', 1))

    # ---- 1) 初次相遇 ----
    first = df_user.iloc[0]
    milestones.append({
        "date": fmt_date(first.get('activity_date')),
        "title": "志愿启程",
        "content": f"那一天，你在「{safe_str(first.get('activity_name'))}」留下了第一条志愿记录。"
    })

    # ---- 2) 连续投入：若某条活动推算天数 > 1，则记录“持续 X 天” ----
    df_user['_est_days'] = df_user.apply(estimate_days, axis=1)
    df_multi_day = df_user[df_user['_est_days'] > 1]
    df_daily = expand_to_daily_rows(df_user)

    if not df_multi_day.empty:
        row = df_multi_day.iloc[0]  # 第一条“多日活动”
        milestones.append({
            "date": fmt_date(row.get('activity_date')),
            "title": "连续投入",
            "content": f"在「{safe_str(row.get('activity_name'))}」中，你持续投入了 {int(row['_est_days'])} 天，把热爱变成了坚持。"
        })

    # ---- 3) 高光时刻：单次服务时长最高（改表述，不再“一口气”）----
    # 注意：df_user['hours'] 在 load_data 里已转数值；这里再保险转 float
    df_user['_hours_f'] = pd.to_numeric(df_user.get('hours', 0), errors='coerce').fillna(0.0)
    idx_max_h = df_user['_hours_f'].idxmax()
    max_h_row = df_user.loc[idx_max_h]
    if float(max_h_row['_hours_f']) > 0:
        d = int(max_h_row['_est_days']) if '_est_days' in max_h_row else estimate_days(max_h_row)
        h = float(max_h_row['_hours_f'])
        # 让文案更符合“多日活动”的语境
        if d > 1:
            content = f"在「{safe_str(max_h_row.get('activity_name'))}」这段 {d} 天的旅程里，你累计贡献了 {h:g} 小时，真的很燃！"
        else:
            content = f"在「{safe_str(max_h_row.get('activity_name'))}」中，你贡献了 {h:g} 小时，这是你的高光时刻。"
        milestones.append({
            "date": fmt_date(max_h_row.get('activity_date')),
            "title": "高光时刻",
            "content": content
        })

    # ---- 4) 深度项目：单次持续天数最高 ----
    idx_max_d = df_user['_est_days'].idxmax()
    max_d_row = df_user.loc[idx_max_d]
    if int(max_d_row['_est_days']) > 1:
        milestones.append({
            "date": fmt_date(max_d_row.get('activity_date')),
            "title": "深度项目",
            "content": f"你在「{safe_str(max_d_row.get('activity_name'))}」中持续投入 {int(max_d_row['_est_days'])} 天，热忱与耐心都在路上发光。"
        })

    # ---- 5) 里程碑：累计时长首次达成（档位可调）----
    # 你可以按需改这里的档位
    thresholds = [1, 10, 30, 50, 100]
    title_map = {
        1: "点亮第一小时",
        10: "十时成就",
        50: "半百见证",
        100: "百时成就"
    }

    cum = 0.0
    reached = set()

    if not df_daily.empty:
        for _, drow in df_daily.iterrows():
            cum += float(drow.get("hours_day", 0.0) or 0.0)
            for th in thresholds:
                if th not in reached and cum >= th:
                    milestones.append({
                        "date": fmt_date(drow.get("day")),
                        "title": title_map.get(th, f"{th}小时里程碑"),
                        "content": f"在「{safe_str(drow.get('activity_name'))}」的过程中，你的累计时长首次达到 {th} 小时。"
                    })
                    reached.add(th)
            if len(reached) == len(thresholds):
                break

    # ---- 6) 高频活动：参与次数最多的活动名 ----
    # 适合你这种“同一个活动多人多次”的流水数据
    name_counts = df_user['activity_name'].astype(str).value_counts()
    if not name_counts.empty and int(name_counts.iloc[0]) >= 3:
        top_name = name_counts.index[0]
        top_cnt = int(name_counts.iloc[0])
        # 取该活动第一次出现的日期
        first_idx = df_user[df_user['activity_name'].astype(str) == top_name].index[0]
        milestones.append({
            "date": fmt_date(df_user.loc[first_idx].get('activity_date')),
            "title": "高频参与",
            "content": f"你在「{top_name}」中共出现了 {top_cnt} 次，热爱不是三分钟，而是反复奔赴。"
        })

    # ---- 7) 多元参与：活动类型 >= 3（日期=达成第3个不同类型的那天）----
    type_set = set([safe_str(x).strip() for x in df_user.get('activity_type', []).tolist()
                    if safe_str(x).strip()])

    if len(type_set) >= 3:
        types_seen = set()
        third_type_date = None

        # df_user 已按 activity_date 排序；这里按时间推进，找到“第3个不同类型”首次出现的日期
        for _, row in df_user.iterrows():
            t = safe_str(row.get('activity_type', '')).strip()
            if not t:
                continue
            before = len(types_seen)
            types_seen.add(t)
            if before < 3 and len(types_seen) == 3:
                third_type_date = row.get('activity_date')
                break

        milestones.append({
            "date": fmt_date(third_type_date),  # 达成第3个不同类型的日期
            "title": "多元参与",
            "content": f"这一年，你跨越了 {len(type_set)} 类志愿方向，温暖不止一种形状。"
        })

    # ---- 8) 最忙月份：该月累计时长最高 ----
    # 需要 activity_date 非空
    if not df_daily.empty:
        df_daily["_month"] = df_daily["day"].dt.strftime("%Y-%m")
        month_sum = df_daily.groupby("_month")["hours_day"].sum().sort_values(ascending=False)
        if not month_sum.empty and float(month_sum.iloc[0]) > 0:
            best_month = month_sum.index[0]
            best_hours = float(month_sum.iloc[0])
            milestones.append({
                "date": "",
                "title": "最忙的月份",
                "content": f"{best_month} 你累计服务 {best_hours:g} 小时——那个月，你一定很闪亮。"
            })

    # ---- 9) 暖心收官：最后一次记录（改为“最后一段旅程”更贴合多日活动）----
    last = df_user.iloc[-1]
    last_days = int(last.get('_est_days', 1))
    if last_days > 1:
        end_text = f"这是本年度最后一段「{safe_str(last.get('activity_name'))}」旅程（持续 {last_days} 天），为你的志愿时光画上温暖句号。"
    else:
        end_text = f"这是本年度最后一次「{safe_str(last.get('activity_name'))}」，为你的志愿时光画上一个温暖的句号。"

    milestones.append({
        "date": fmt_date(last.get('activity_date')),
        "title": "暖心收官",
        "content": end_text
    })

    # ---- 去重：按 (title, date) ----
    seen = set()
    uniq = []
    for m in milestones:
        key = (m.get('title', ''), m.get('date', ''))
        if key not in seen:
            seen.add(key)
            uniq.append(m)

    # 可选：限制数量，避免太长（比如最多 8 条）
    return uniq[:8]



def pick_activities_gallery(df_user: pd.DataFrame, max_num=6):
    """时光掠影：选出若干活动 + 封面图（自动补全 URL）"""
    activities = []

    for _, row in df_user.sort_values('activity_date', ascending=False).iterrows():
        img_name = row['cover_img'] if isinstance(row['cover_img'], str) and row['cover_img'] else None

        # 自动拼接 URL
        if img_name:
            img_url = url_for('serve_image', filename=img_name)
        else:
            img_url = None

        activities.append({
            "type": row['activity_type'],
            "title": row['activity_name'],
            "date": row['activity_date'].strftime('%Y.%m') if not pd.isna(row['activity_date']) else "",
            "img": img_url
        })

        if len(activities) >= max_num:
            break

    return activities



def calc_co_volunteers(df_user: pd.DataFrame, max_num=300):
    """共同行志愿者：同场活动的其他姓名（简单版本）"""
    if df_user.empty:
        return []

    # 找到这些活动名
    activity_names = df_user['activity_name'].dropna().unique().tolist()
    mask = df_records['activity_name'].isin(activity_names)
    df_related = df_records[mask]

    # 所有和 TA 同场出现过的名字（排除自己）
    target_name = df_user.iloc[0]['name']
    names = df_related['name'].tolist()
    names = [n for n in names if n != target_name]

    # 统计出现次数，按热度取前 N 个
    count = Counter(names)
    co = [n for n, _ in count.most_common(max_num)]
    return co


def pick_dept_letter(main_type_cn: str):
    """根据主力部门选择一封信"""
    dept_key = main_type_cn if main_type_cn in org_stats.get('dept_letters', {}) else "其他"
    letter_lines = org_stats.get('dept_letters', {}).get(dept_key, [])
    if not letter_lines:
        letter_lines = [
            "见字如面。",
            "这一年，你在人群里默默发光。愿你也被温柔以待。"
        ]
    return letter_lines


def build_user_report(name: str, phone: str):
    """核心：把一位志愿者的所有内容拼成前端需要的 JSON"""
    df_user = get_user_records(name, phone)
    if df_user.empty:
        # 非志愿者 / 没记录
        guest_data = {
            "is_volunteer": False,
            "name": "未来的伙伴",
            "org_data": org_stats
        }
        return guest_data

    total_hours = round(df_user['hours'].sum(), 1)

    radar_stats, main_type_cn = calc_type_hours(df_user)
    total_days = calc_active_days(df_user)
    month_stats = calc_month_stats(df_user)
    tags = generate_tags(df_user, total_hours, main_type_cn)
    milestones = generate_milestones(df_user, total_hours)
    activities = pick_activities_gallery(df_user)
    co_volunteers = calc_co_volunteers(df_user)
    letter_content = pick_dept_letter(main_type_cn)

    user_data = {
        "is_volunteer": True,
        "name": name,
        "totalHours": total_hours,
        "mainType": main_type_cn,
        "stats": radar_stats,             # 雷达图
        "tags": tags,                     # 个性化称号标签
        "activities": activities,         # 时光掠影
        "co_volunteers": co_volunteers,   # 星火相聚
        "org_data": org_stats,            # 公共数据 & 文案
        "total_days": total_days,         # 活跃天数估算
        "milestones": milestones,         # 年度里程碑
        "month_stats": month_stats,       # 志愿足迹（按月）
        "letter_content": letter_content  # 一封信（按行分段）
    }
    return user_data


# ====== Flask 路由 ======

@app.route('/media/images/<path:filename>')
def serve_image(filename):
    return send_from_directory(PHOTO_FOLDER, filename)


@app.route('/')
def hello_world():
    return 'Hello World!'


@app.route('/annual_report')
def annual_report_page():
    return render_template('annual_report.html')


@app.route('/api/get_annual_data', methods=['POST'])
def get_annual_data():
    data = request.get_json() or {}
    name = (data.get('name') or '').strip()
    phone = (data.get('phone') or '').strip()

    try:
        user_data = build_user_report(name, phone)
        return jsonify({"success": True, "data": user_data})
    except Exception as e:
        import traceback
        traceback.print_exc()  # ← 打印完整错误堆栈
        return jsonify({"success": False, "error": str(e)}), 500


if __name__ == '__main__':
    # 调试阶段可以开启 debug，线上记得关掉
    app.run(port=4399, debug=True)
