import { useState, useEffect } from 'react'
import { Card, Form, Input, Select, Button, Row, Col, Space, message, Divider, Radio, TimePicker, Upload, Spin, Collapse, Checkbox } from 'antd'
import dayjs from 'dayjs'
import {
  UploadOutlined,
  SaveOutlined,
  StarOutlined,
  PlusOutlined,
  AimOutlined
} from '@ant-design/icons'
import LocationPicker from '../../components/LocationPicker'

const { TextArea } = Input
const { Panel } = Collapse

const API_BASE = '/api'

const facilityCategories = [
  {
    key: 'dining',
    label: '餐饮',
    items: [
      { value: 'wifi', label: '免费 WiFi' },
      { value: 'parking', label: '免费停车场' },
      { value: 'swimming', label: '游泳池' },
      { value: 'gym', label: '健身房' },
      { value: 'restaurant', label: '餐厅' },
      { value: 'spa', label: 'SPA' },
      { value: 'bar', label: '酒吧' },
      { value: 'coffee', label: '咖啡厅' },
      { value: 'breakfast', label: '免费早餐' }
    ]
  },
  {
    key: 'service',
    label: '服务',
    items: [
      { value: 'laundry', label: '洗衣服务' },
      { value: 'dry_cleaning', label: '干洗服务' },
      { value: 'ironing', label: '熨衣服务' },
      { value: 'shuttle', label: '班车服务' },
      { value: 'airport_shuttle', label: '机场班车' },
      { value: 'car_rental', label: '租车服务' },
      { value: 'bike_rental', label: '自行车租赁' }
    ]
  },
  {
    key: 'business',
    label: '商务',
    items: [
      { value: 'meeting_room', label: '会议室' },
      { value: 'banquet', label: '宴会厅' },
      { value: 'conference', label: '会议中心' },
      { value: 'business_center', label: '商务中心' }
    ]
  },
  {
    key: 'front_desk',
    label: '前台',
    items: [
      { value: 'front_24h', label: '24小时前台' },
      { value: 'checkin_24h', label: '24小时入住' },
      { value: 'luggage_storage', label: '行李寄存' },
      { value: 'concierge', label: '礼宾服务' },
      { value: 'currency_exchange', label: '外币兑换' },
      { value: 'atm', label: 'ATM取款机' }
    ]
  },
  {
    key: 'equipment',
    label: '设备',
    items: [
      { value: 'safe', label: '保险箱' },
      { value: 'elevator', label: '电梯' },
      { value: 'disabled_access', label: '无障碍设施' },
      { value: 'wheelchair', label: '轮椅通道' },
      { value: 'air_conditioning', label: '空调' },
      { value: 'heating', label: '暖气' }
    ]
  },
  {
    key: 'kitchen',
    label: '厨房',
    items: [
      { value: 'mini_bar', label: '迷你吧' },
      { value: 'refrigerator', label: '冰箱' },
      { value: 'kitchen', label: '厨房' },
      { value: 'kitchenette', label: '小厨房' },
      { value: 'microwave', label: '微波炉' },
      { value: 'toaster', label: '烤面包机' },
      { value: 'kettle', label: '电水壶' },
      { value: 'cooking', label: '烹饪设施' },
      { value: 'dishwasher', label: '洗碗机' },
      { value: 'tea_coffee', label: '茶/咖啡设备' }
    ]
  },
  {
    key: 'entertainment',
    label: '娱乐',
    items: [
      { value: 'tv', label: '电视' },
      { value: 'cable_tv', label: '有线电视' },
      { value: 'satellite_tv', label: '卫星电视' },
      { value: 'streaming', label: '流媒体服务' },
      { value: 'phone', label: '电话' },
      { value: 'fax', label: '传真' },
      { value: 'printer', label: '打印机' },
      { value: 'scanner', label: '扫描仪' },
      { value: 'photocopy', label: '复印服务' },
      { value: 'internet', label: '上网服务' },
      { value: 'wired_internet', label: '有线网络' },
      { value: 'computer', label: '电脑' },
      { value: 'projector', label: '投影仪' },
      { value: 'screen', label: '投影幕布' },
      { value: 'whiteboard', label: '白板' },
      { value: 'video_conf', label: '视频会议' },
      { value: 'audio_visual', label: '视听设备' }
    ]
  },
  {
    key: 'toiletries',
    label: '洗漱用品',
    items: [
      { value: 'hairdryer', label: '吹风机' },
      { value: 'bathrobe', label: '浴袍' },
      { value: 'slippers', label: '拖鞋' },
      { value: 'toiletries', label: '洗漱用品' },
      { value: 'towel', label: '毛巾' },
      { value: 'bath_towel', label: '浴巾' },
      { value: 'shampoo', label: '洗发水' },
      { value: 'conditioner', label: '护发素' },
      { value: 'body_wash', label: '沐浴露' },
      { value: 'soap', label: '香皂' },
      { value: 'toothbrush', label: '牙刷' },
      { value: 'comb', label: '梳子' },
      { value: 'razor', label: '剃须刀' },
      { value: 'shaving_cream', label: '剃须膏' },
      { value: 'cotton_swabs', label: '棉签' },
      { value: 'cotton_balls', label: '化妆棉' },
      { value: 'nail_clipper', label: '指甲刀' },
      { value: 'sewing_kit', label: '针线包' },
      { value: 'shoe_shine', label: '擦鞋服务' },
      { value: 'shoe_polish', label: '鞋油' },
      { value: 'laundry_bag', label: '洗衣袋' },
      { value: 'shopping_bag', label: '购物袋' },
      { value: 'umbrella', label: '雨伞' },
      { value: 'raincoat', label: '雨衣' },
      { value: 'sunscreen', label: '防晒霜' },
      { value: 'mosquito_repellent', label: '驱蚊剂' },
      { value: 'insect_repellent', label: '驱虫剂' }
    ]
  },
  {
    key: 'sports',
    label: '运动',
    items: [
      { value: 'golf', label: '高尔夫球场' },
      { value: 'tennis', label: '网球场' },
      { value: 'basketball', label: '篮球场' },
      { value: 'volleyball', label: '排球场' },
      { value: 'badminton', label: '羽毛球场' },
      { value: 'table_tennis', label: '乒乓球' },
      { value: 'billiards', label: '台球' },
      { value: 'bowling', label: '保龄球' },
      { value: 'squash', label: '壁球' }
    ]
  },
  {
    key: 'fitness',
    label: '健身',
    items: [
      { value: 'yoga', label: '瑜伽' },
      { value: 'pilates', label: '普拉提' },
      { value: 'aerobics', label: '有氧运动' },
      { value: 'zumba', label: '尊巴舞' },
      { value: 'dance', label: '舞蹈课程' },
      { value: 'meditation', label: '冥想' }
    ]
  },
  {
    key: 'spa',
    label: 'SPA',
    items: [
      { value: 'massage', label: '按摩' },
      { value: 'facial', label: '面部护理' },
      { value: 'body_treatment', label: '身体护理' },
      { value: 'manicure', label: '美甲' },
      { value: 'pedicure', label: '足疗' },
      { value: 'hair_salon', label: '美发沙龙' },
      { value: 'beauty_salon', label: '美容沙龙' },
      { value: 'steam_room', label: '蒸汽房' },
      { value: 'sauna', label: '桑拿' },
      { value: 'hot_tub', label: '热水浴缸' },
      { value: 'cold_plunge', label: '冷水池' },
      { value: 'hydrotherapy', label: '水疗' },
      { value: 'aromatherapy', label: '芳香疗法' },
      { value: 'reflexology', label: '足底按摩' },
      { value: 'acupuncture', label: '针灸' },
      { value: 'traditional_medicine', label: '传统医学' },
      { value: 'herbal_medicine', label: '草药治疗' },
      { value: 'nutritionist', label: '营养师' },
      { value: 'personal_trainer', label: '私人教练' },
      { value: 'fitness_class', label: '健身课程' }
    ]
  },
  {
    key: 'outdoor',
    label: '户外活动',
    items: [
      { value: 'swimming_lesson', label: '游泳课程' },
      { value: 'tennis_lesson', label: '网球课程' },
      { value: 'golf_lesson', label: '高尔夫课程' },
      { value: 'ski_lesson', label: '滑雪课程' },
      { value: 'surf_lesson', label: '冲浪课程' },
      { value: 'dive_lesson', label: '潜水课程' },
      { value: 'kayak_lesson', label: '皮划艇课程' },
      { value: 'sail_lesson', label: '帆船课程' },
      { value: 'horse_riding', label: '骑马' },
      { value: 'hiking', label: '徒步' },
      { value: 'biking', label: '骑行' },
      { value: 'fishing', label: '钓鱼' },
      { value: 'boating', label: '划船' },
      { value: 'sailing', label: '帆船' },
      { value: 'surfing', label: '冲浪' },
      { value: 'diving', label: '潜水' },
      { value: 'snorkeling', label: '浮潜' },
      { value: 'water_skiing', label: '水上滑水' },
      { value: 'jet_ski', label: '喷气滑雪' },
      { value: 'parasailing', label: '帆伞' },
      { value: 'kiteboarding', label: '风筝冲浪' },
      { value: 'windsurfing', label: '帆板' },
      { value: 'rafting', label: '漂流' },
      { value: 'canoeing', label: '独木舟' },
      { value: 'kayaking', label: '皮划艇' },
      { value: 'stand_up_paddle', label: '立桨冲浪' }
    ]
  },
  {
    key: 'safety',
    label: '安全',
    items: [
      { value: 'first_aid', label: '急救包' },
      { value: 'fire_extinguisher', label: '灭火器' },
      { value: 'smoke_detector', label: '烟雾探测器' },
      { value: 'carbon_monoxide', label: '一氧化碳探测器' },
      { value: 'fire_alarm', label: '火灾报警器' },
      { value: 'sprinkler', label: '喷淋系统' },
      { value: 'emergency_exit', label: '紧急出口' },
      { value: 'emergency_light', label: '应急照明' },
      { value: 'security_camera', label: '监控摄像头' },
      { value: 'security_guard', label: '保安' },
      { value: 'key_card', label: '房卡' },
      { value: 'electronic_lock', label: '电子锁' },
      { value: 'safe_deposit', label: '贵重物品保管' }
    ]
  },
  {
    key: 'room_service',
    label: '客房服务',
    items: [
      { value: 'room_service', label: '客房服务' },
      { value: 'wake_up_call', label: '叫醒服务' },
      { value: 'turndown_service', label: '开夜床服务' },
      { value: 'housekeeping', label: '客房清洁' },
      { value: 'daily_housekeeping', label: '每日清洁' },
      { value: 'weekly_housekeeping', label: '每周清洁' },
      { value: 'request_cleaning', label: '按需清洁' },
      { value: 'bed_change', label: '换床单' },
      { value: 'towel_change', label: '换毛巾' },
      { value: 'toiletries_replenish', label: '补充洗漱用品' },
      { value: 'minibar_replenish', label: '补充迷你吧' },
      { value: 'water_replenish', label: '补充饮用水' }
    ]
  },
  {
    key: 'info',
    label: '信息服务',
    items: [
      { value: 'newspaper', label: '报纸' },
      { value: 'magazine', label: '杂志' },
      { value: 'guidebook', label: '旅游指南' },
      { value: 'map', label: '地图' },
      { value: 'tour_info', label: '旅游信息' },
      { value: 'ticket_booking', label: '票务预订' },
      { value: 'restaurant_reservation', label: '餐厅预订' },
      { value: 'spa_reservation', label: 'SPA预订' },
      { value: 'gym_reservation', label: '健身房预订' },
      { value: 'pool_reservation', label: '游泳池预订' },
      { value: 'court_reservation', label: '球场预订' }
    ]
  }
]

const tagCategories = [
  {
    key: 'view',
    label: '景观',
    items: [
      { value: 'beachfront', label: '海滨酒店' },
      { value: 'ocean_view', label: '海景房' },
      { value: 'mountain_view', label: '山景房' },
      { value: 'city_view', label: '城市景观' },
      { value: 'garden_view', label: '花园景观' },
      { value: 'lake_view', label: '湖景房' },
      { value: 'river_view', label: '江景房' },
      { value: 'park_view', label: '公园景观' },
      { value: 'skyline', label: '天际线景观' }
    ]
  },
  {
    key: 'feature',
    label: '特色',
    items: [
      { value: 'rooftop', label: '屋顶酒吧' },
      { value: 'terrace', label: '露台' },
      { value: 'balcony', label: '阳台' },
      { value: 'patio', label: '庭院' },
      { value: 'garden', label: '花园' },
      { value: 'courtyard', label: '中庭' },
      { value: 'historic', label: '历史建筑' },
      { value: 'modern', label: '现代设计' },
      { value: 'boutique', label: '精品酒店' },
      { value: 'design', label: '设计酒店' },
      { value: 'art', label: '艺术酒店' },
      { value: 'eco', label: '生态酒店' },
      { value: 'green', label: '绿色酒店' },
      { value: 'sustainable', label: '可持续酒店' },
      { value: 'organic', label: '有机酒店' }
    ]
  },
  {
    key: 'dietary',
    label: '饮食',
    items: [
      { value: 'vegan', label: '素食友好' },
      { value: 'gluten_free', label: '无麸质' },
      { value: 'halal', label: '清真食品' },
      { value: 'kosher', label: '犹太洁食' }
    ]
  },
  {
    key: 'pet',
    label: '宠物',
    items: [
      { value: 'pet_friendly', label: '宠物友好' },
      { value: 'dog_friendly', label: '狗狗友好' },
      { value: 'cat_friendly', label: '猫咪友好' }
    ]
  },
  {
    key: 'accessibility',
    label: '无障碍',
    items: [
      { value: 'smoke_free', label: '无烟酒店' },
      { value: 'allergy_friendly', label: '过敏友好' },
      { value: 'wheelchair_accessible', label: '轮椅无障碍' },
      { value: 'hearing_impaired', label: '听力障碍友好' },
      { value: 'visually_impaired', label: '视力障碍友好' },
      { value: 'autism_friendly', label: '自闭症友好' }
    ]
  },
  {
    key: 'guest_type',
    label: '客群',
    items: [
      { value: 'family', label: '亲子酒店' },
      { value: 'luxury', label: '豪华酒店' },
      { value: 'business', label: '商务酒店' },
      { value: 'airport', label: '近机场' },
      { value: 'subway', label: '近地铁' },
      { value: 'love', label: '适合情侣' },
      { value: 'car', label: '接送机服务' },
      { value: 'elderly_friendly', label: '老年友好' },
      { value: 'child_friendly', label: '儿童友好' },
      { value: 'teen_friendly', label: '青少年友好' },
      { value: 'adult_only', label: '成人专用' },
      { value: 'women_only', label: '女性专用' },
      { value: 'men_only', label: '男性专用' },
      { value: 'lgbt_friendly', label: 'LGBT友好' }
    ]
  },
  {
    key: 'occasion',
    label: '场合',
    items: [
      { value: 'honeymoon', label: '蜜月酒店' },
      { value: 'wedding', label: '婚礼场地' },
      { value: 'anniversary', label: '纪念日' },
      { value: 'birthday', label: '生日派对' },
      { value: 'bachelor_party', label: '单身派对' },
      { value: 'bachelorette_party', label: '新娘派对' },
      { value: 'reunion', label: '家庭聚会' },
      { value: 'corporate_event', label: '企业活动' },
      { value: 'team_building', label: '团队建设' },
      { value: 'retreat', label: '静修' }
    ]
  },
  {
    key: 'events',
    label: '活动',
    items: [
      { value: 'workshop', label: '研讨会' },
      { value: 'seminar', label: '研讨会' },
      { value: 'conference', label: '会议' },
      { value: 'exhibition', label: '展览' },
      { value: 'trade_show', label: '贸易展' },
      { value: 'fashion_show', label: '时装秀' },
      { value: 'concert', label: '音乐会' },
      { value: 'performance', label: '演出' },
      { value: 'theater', label: '剧院' },
      { value: 'cinema', label: '电影院' }
    ]
  },
  {
    key: 'nightlife',
    label: '夜生活',
    items: [
      { value: 'nightlife', label: '夜生活' },
      { value: 'casino', label: '赌场' },
      { value: 'nightclub', label: '夜店' },
      { value: 'karaoke', label: '卡拉OK' },
      { value: 'live_music', label: '现场音乐' },
      { value: 'dj', label: 'DJ表演' },
      { value: 'comedy', label: '喜剧表演' },
      { value: 'magic_show', label: '魔术表演' },
      { value: 'acrobatics', label: '杂技表演' }
    ]
  },
  {
    key: 'culture',
    label: '文化',
    items: [
      { value: 'cultural_show', label: '文化表演' },
      { value: 'traditional_show', label: '传统表演' },
      { value: 'folk_show', label: '民俗表演' },
      { value: 'dance_show', label: '舞蹈表演' },
      { value: 'music_show', label: '音乐表演' },
      { value: 'art_exhibition', label: '艺术展览' },
      { value: 'sculpture_exhibition', label: '雕塑展览' },
      { value: 'photography_exhibition', label: '摄影展览' }
    ]
  },
  {
    key: 'market',
    label: '市场',
    items: [
      { value: 'craft_market', label: '手工艺市场' },
      { value: 'flea_market', label: '跳蚤市场' },
      { value: 'farmers_market', label: '农贸市场' },
      { value: 'food_market', label: '食品市场' },
      { value: 'night_market', label: '夜市' }
    ]
  },
  {
    key: 'food_drink',
    label: '餐饮',
    items: [
      { value: 'street_food', label: '街头美食' },
      { value: 'food_court', label: '美食广场' },
      { value: 'hawker_center', label: '小贩中心' },
      { value: 'coffee_shop', label: '咖啡店' },
      { value: 'tea_house', label: '茶馆' },
      { value: 'bakery', label: '面包店' },
      { value: 'pastry_shop', label: '糕点店' },
      { value: 'ice_cream', label: '冰淇淋店' },
      { value: 'juice_bar', label: '果汁吧' },
      { value: 'smoothie_bar', label: '冰沙吧' }
    ]
  },
  {
    key: 'bars',
    label: '酒吧',
    items: [
      { value: 'wine_bar', label: '葡萄酒吧' },
      { value: 'whiskey_bar', label: '威士忌吧' },
      { value: 'cocktail_bar', label: '鸡尾酒吧' },
      { value: 'beer_garden', label: '啤酒花园' }
    ]
  },
  {
    key: 'breweries',
    label: '酒厂',
    items: [
      { value: 'brewery', label: '酿酒厂' },
      { value: 'distillery', label: '蒸馏厂' },
      { value: 'winery', label: '酒庄' },
      { value: 'vineyard', label: '葡萄园' }
    ]
  },
  {
    key: 'farms',
    label: '农场',
    items: [
      { value: 'olive_grove', label: '橄榄园' },
      { value: 'orchard', label: '果园' },
      { value: 'farm', label: '农场' },
      { value: 'ranch', label: '牧场' }
    ]
  },
  {
    key: 'tours',
    label: '游览',
    items: [
      { value: 'vineyard_tour', label: '葡萄园游览' },
      { value: 'winery_tour', label: '酒庄游览' },
      { value: 'brewery_tour', label: '酿酒厂游览' },
      { value: 'distillery_tour', label: '蒸馏厂游览' },
      { value: 'farm_tour', label: '农场游览' },
      { value: 'orchard_tour', label: '果园游览' }
    ]
  },
  {
    key: 'classes',
    label: '课程',
    items: [
      { value: 'cooking_class', label: '烹饪课程' }
    ]
  },
  {
    key: 'tastings',
    label: '品鉴',
    items: [
      { value: 'wine_tasting', label: '品酒' },
      { value: 'beer_tasting', label: '品啤酒' },
      { value: 'cheese_tasting', label: '品奶酪' },
      { value: 'chocolate_tasting', label: '品巧克力' },
      { value: 'coffee_tasting', label: '品咖啡' },
      { value: 'tea_tasting', label: '品茶' },
      { value: 'olive_oil_tasting', label: '品橄榄油' },
      { value: 'honey_tasting', label: '品蜂蜜' },
      { value: 'jam_tasting', label: '品果酱' },
      { value: 'preserves_tasting', label: '品果脯' }
    ]
  },
  {
    key: 'cuisine',
    label: '菜系',
    items: [
      { value: 'local_food', label: '当地美食' },
      { value: 'regional_cuisine', label: '地方菜系' },
      { value: 'international_cuisine', label: '国际菜系' },
      { value: 'fusion_cuisine', label: '融合菜系' },
      { value: 'molecular_cuisine', label: '分子料理' }
    ]
  },
  {
    key: 'ingredients',
    label: '食材',
    items: [
      { value: 'farm_to_table', label: '农场到餐桌' },
      { value: 'sea_to_table', label: '海洋到餐桌' },
      { value: 'organic_ingredients', label: '有机食材' },
      { value: 'local_ingredients', label: '当地食材' }
    ]
  },
  {
    key: 'menu',
    label: '菜单',
    items: [
      { value: 'seasonal_menu', label: '季节菜单' },
      { value: 'daily_specials', label: '每日特色菜' },
      { value: 'chef_special', label: '主厨特色菜' },
      { value: 'tasting_menu', label: '品鉴菜单' },
      { value: 'prix_fixe', label: '固定套餐' },
      { value: 'buffet', label: '自助餐' },
      { value: 'brunch', label: '早午餐' },
      { value: 'high_tea', label: '下午茶' },
      { value: 'afternoon_tea', label: '下午茶' },
      { value: 'sunset_drinks', label: '日落饮品' },
      { value: 'happy_hour', label: '欢乐时光' },
      { value: 'late_night', label: '深夜餐饮' }
    ]
  },
  {
    key: 'dining_service',
    label: '用餐服务',
    items: [
      { value: 'room_service_24h', label: '24小时客房服务' },
      { value: 'in_room_dining', label: '客房用餐' },
      { value: 'private_dining', label: '私人用餐' }
    ]
  },
  {
    key: 'dining_location',
    label: '用餐环境',
    items: [
      { value: 'outdoor_dining', label: '户外用餐' },
      { value: 'rooftop_dining', label: '屋顶用餐' },
      { value: 'garden_dining', label: '花园用餐' },
      { value: 'beach_dining', label: '海滩用餐' },
      { value: 'pool_dining', label: '泳池用餐' },
      { value: 'lakeside_dining', label: '湖畔用餐' },
      { value: 'riverside_dining', label: '江边用餐' },
      { value: 'mountain_dining', label: '山间用餐' },
      { value: 'forest_dining', label: '森林用餐' },
      { value: 'desert_dining', label: '沙漠用餐' },
      { value: 'island_dining', label: '海岛用餐' },
      { value: 'cruise_dining', label: '游轮用餐' },
      { value: 'train_dining', label: '火车用餐' },
      { value: 'plane_dining', label: '飞机用餐' }
    ]
  }
]

// 城市列表
const cityOptions = [
  { value: 'beijing', label: '北京' },
  { value: 'shanghai', label: '上海' },
  { value: 'guangzhou', label: '广州' },
  { value: 'shenzhen', label: '深圳' },
  { value: 'chengdu', label: '成都' },
  { value: 'chongqing', label: '重庆' },
  { value: 'hangzhou', label: '杭州' },
  { value: 'wuhan', label: '武汉' },
  { value: 'xian', label: '西安' },
  { value: 'tianjin', label: '天津' },
  { value: 'suzhou', label: '苏州' },
  { value: 'nanjing', label: '南京' },
  { value: 'zhengzhou', label: '郑州' },
  { value: 'changsha', label: '长沙' },
  { value: 'dongguan', label: '东莞' },
  { value: 'shenyang', label: '沈阳' },
  { value: 'qingdao', label: '青岛' },
  { value: 'hefei', label: '合肥' },
  { value: 'foshan', label: '佛山' },
  { value: 'ningbo', label: '宁波' },
  { value: 'xiamen', label: '厦门' },
  { value: 'fuzhou', label: '福州' },
  { value: 'wuxi', label: '无锡' },
  { value: 'jinan', label: '济南' },
  { value: 'dalian', label: '大连' },
  { value: 'haerbin', label: '哈尔滨' },
  { value: 'changchun', label: '长春' },
  { value: 'kunming', label: '昆明' },
  { value: 'guiyang', label: '贵阳' },
  { value: 'nanning', label: '南宁' },
  { value: 'lanzhou', label: '兰州' },
  { value: 'xining', label: '西宁' },
  { value: 'yinchuan', label: '银川' },
  { value: 'wulumuqi', label: '乌鲁木齐' },
  { value: 'lasa', label: '拉萨' },
  { value: 'taiyuan', label: '太原' },
  { value: 'shijiazhuang', label: '石家庄' },
  { value: 'tangshan', label: '唐山' },
  { value: 'baotou', label: '包头' },
  { value: 'huhehaote', label: '呼和浩特' },
  { value: 'shenyang', label: '沈阳' },
  { value: 'dalian', label: '大连' },
  { value: 'changchun', label: '长春' },
  { value: 'jilin', label: '吉林' },
  { value: 'haerbin', label: '哈尔滨' },
  { value: 'qiqihaer', label: '齐齐哈尔' },
  { value: 'jixi', label: '鸡西' },
  { value: 'hegang', label: '鹤岗' },
  { value: 'shuangyashan', label: '双鸭山' },
  { value: 'daqing', label: '大庆' },
  { value: 'yichun', label: '伊春' },
  { value: 'jiamusi', label: '佳木斯' },
  { value: 'qitaihe', label: '七台河' },
  { value: 'mudanjiang', label: '牡丹江' },
  { value: 'hegang', label: '鹤岗' },
  { value: 'heihe', label: '黑河' },
  { value: 'suihua', label: '绥化' },
  { value: 'nanjing', label: '南京' },
  { value: 'wuxi', label: '无锡' },
  { value: 'xuzhou', label: '徐州' },
  { value: 'changzhou', label: '常州' },
  { value: 'suzhou', label: '苏州' },
  { value: 'nantong', label: '南通' },
  { value: 'lianyungang', label: '连云港' },
  { value: 'huaian', label: '淮安' },
  { value: 'yancheng', label: '盐城' },
  { value: 'yangzhou', label: '扬州' },
  { value: 'zhenjiang', label: '镇江' },
  { value: 'taizhou', label: '泰州' },
  { value: 'suqian', label: '宿迁' },
  { value: 'hangzhou', label: '杭州' },
  { value: 'ningbo', label: '宁波' },
  { value: 'wenzhou', label: '温州' },
  { value: 'jiaxing', label: '嘉兴' },
  { value: 'huzhou', label: '湖州' },
  { value: 'shaoxing', label: '绍兴' },
  { value: 'jinhua', label: '金华' },
  { value: 'quzhou', label: '衢州' },
  { value: 'zhoushan', label: '舟山' },
  { value: 'taizhou', label: '台州' },
  { value: 'lishui', label: '丽水' },
  { value: 'hefei', label: '合肥' },
  { value: 'wuhu', label: '芜湖' },
  { value: 'bengbu', label: '蚌埠' },
  { value: 'huainan', label: '淮南' },
  { value: 'maanshan', label: '马鞍山' },
  { value: 'huaibei', label: '淮北' },
  { value: 'tongling', label: '铜陵' },
  { value: 'anqing', label: '安庆' },
  { value: 'huangshan', label: '黄山' },
  { value: 'chuzhou', label: '滁州' },
  { value: 'fuyang', label: '阜阳' },
  { value: 'suzhou', label: '宿州' },
  { value: 'luan', label: '六安' },
  { value: 'bozhou', label: '亳州' },
  { value: 'chizhou', label: '池州' },
  { value: 'xuancheng', label: '宣城' },
  { value: 'fuzhou', label: '福州' },
  { value: 'xiamen', label: '厦门' },
  { value: 'putian', label: '莆田' },
  { value: 'sanming', label: '三明' },
  { value: 'quanzhou', label: '泉州' },
  { value: 'zhangzhou', label: '漳州' },
  { value: 'nanping', label: '南平' },
  { value: 'longyan', label: '龙岩' },
  { value: 'ningde', label: '宁德' },
  { value: 'nanchang', label: '南昌' },
  { value: 'jingdezhen', label: '景德镇' },
  { value: 'pingxiang', label: '萍乡' },
  { value: 'jiujiang', label: '九江' },
  { value: 'xinyu', label: '新余' },
  { value: 'yingtan', label: '鹰潭' },
  { value: 'ganzhou', label: '赣州' },
  { value: 'jian', label: '吉安' },
  { value: 'yichun', label: '宜春' },
  { value: 'fuzhou', label: '抚州' },
  { value: 'shangrao', label: '上饶' },
  { value: 'jinan', label: '济南' },
  { value: 'qingdao', label: '青岛' },
  { value: 'zibo', label: '淄博' },
  { value: 'zaozhuang', label: '枣庄' },
  { value: 'dongying', label: '东营' },
  { value: 'yantai', label: '烟台' },
  { value: 'weifang', label: '潍坊' },
  { value: 'jining', label: '济宁' },
  { value: 'taian', label: '泰安' },
  { value: 'weihai', label: '威海' },
  { value: 'rizhao', label: '日照' },
  { value: 'linyi', label: '临沂' },
  { value: 'dezhou', label: '德州' },
  { value: 'liaocheng', label: '聊城' },
  { value: 'binzhou', label: '滨州' },
  { value: 'heze', label: '菏泽' },
  { value: 'zhengzhou', label: '郑州' },
  { value: 'kaifeng', label: '开封' },
  { value: 'luoyang', label: '洛阳' },
  { value: 'pingdingshan', label: '平顶山' },
  { value: 'anyang', label: '安阳' },
  { value: 'hebi', label: '鹤壁' },
  { value: 'xinxiang', label: '新乡' },
  { value: 'jiaozuo', label: '焦作' },
  { value: 'puyang', label: '濮阳' },
  { value: 'xuchang', label: '许昌' },
  { value: 'luohe', label: '漯河' },
  { value: 'sanmenxia', label: '三门峡' },
  { value: 'nanyang', label: '南阳' },
  { value: 'shangqiu', label: '商丘' },
  { value: 'xinyang', label: '信阳' },
  { value: 'zhoukou', label: '周口' },
  { value: 'zhumadian', label: '驻马店' },
  { value: 'wuhan', label: '武汉' },
  { value: 'huangshi', label: '黄石' },
  { value: 'shiyan', label: '十堰' },
  { value: 'yichang', label: '宜昌' },
  { value: 'xiangyang', label: '襄阳' },
  { value: 'ezhou', label: '鄂州' },
  { value: 'jingmen', label: '荆门' },
  { value: 'xiaogan', label: '孝感' },
  { value: 'jingzhou', label: '荆州' },
  { value: 'huanggang', label: '黄冈' },
  { value: 'xianning', label: '咸宁' },
  { value: 'suizhou', label: '随州' },
  { value: 'enshi', label: '恩施' },
  { value: 'changsha', label: '长沙' },
  { value: 'zhuzhou', label: '株洲' },
  { value: 'xiangtan', label: '湘潭' },
  { value: 'hengyang', label: '衡阳' },
  { value: 'shaoyang', label: '邵阳' },
  { value: 'yueyang', label: '岳阳' },
  { value: 'changde', label: '常德' },
  { value: 'zhangjiajie', label: '张家界' },
  { value: 'yiyang', label: '益阳' },
  { value: 'chenzhou', label: '郴州' },
  { value: 'yongzhou', label: '永州' },
  { value: 'huaihua', label: '怀化' },
  { value: 'loudi', label: '娄底' },
  { value: 'xiangxi', label: '湘西' },
  { value: 'guangzhou', label: '广州' },
  { value: 'shaoguan', label: '韶关' },
  { value: 'shenzhen', label: '深圳' },
  { value: 'zhuhai', label: '珠海' },
  { value: 'shantou', label: '汕头' },
  { value: 'foshan', label: '佛山' },
  { value: 'jiangmen', label: '江门' },
  { value: 'zhanjiang', label: '湛江' },
  { value: 'maoming', label: '茂名' },
  { value: 'zhaoqing', label: '肇庆' },
  { value: 'huizhou', label: '惠州' },
  { value: 'meizhou', label: '梅州' },
  { value: 'shanwei', label: '汕尾' },
  { value: 'heyuan', label: '河源' },
  { value: 'yangjiang', label: '阳江' },
  { value: 'qingyuan', label: '清远' },
  { value: 'dongguan', label: '东莞' },
  { value: 'zhongshan', label: '中山' },
  { value: 'chaozhou', label: '潮州' },
  { value: 'jieyang', label: '揭阳' },
  { value: 'yunfu', label: '云浮' },
  { value: 'nanning', label: '南宁' },
  { value: 'liuzhou', label: '柳州' },
  { value: 'guilin', label: '桂林' },
  { value: 'wuzhou', label: '梧州' },
  { value: 'beihai', label: '北海' },
  { value: 'fangchenggang', label: '防城港' },
  { value: 'qinzhou', label: '钦州' },
  { value: 'guigang', label: '贵港' },
  { value: 'yulin', label: '玉林' },
  { value: 'baise', label: '百色' },
  { value: 'hezhou', label: '贺州' },
  { value: 'hechi', label: '河池' },
  { value: 'laibin', label: '来宾' },
  { value: 'chongzuo', label: '崇左' },
  { value: 'haikou', label: '海口' },
  { value: 'sanya', label: '三亚' },
  { value: 'sansha', label: '三沙' },
  { value: 'danzhou', label: '儋州' },
  { value: 'chengdu', label: '成都' },
  { value: 'zigong', label: '自贡' },
  { value: 'panzhihua', label: '攀枝花' },
  { value: 'luzhou', label: '泸州' },
  { value: 'deyang', label: '德阳' },
  { value: 'mianyang', label: '绵阳' },
  { value: 'guangyuan', label: '广元' },
  { value: 'suining', label: '遂宁' },
  { value: 'neijiang', label: '内江' },
  { value: 'leshan', label: '乐山' },
  { value: 'nanchong', label: '南充' },
  { value: 'meishan', label: '眉山' },
  { value: 'yibin', label: '宜宾' },
  { value: 'guangan', label: '广安' },
  { value: 'dazhou', label: '达州' },
  { value: 'yaan', label: '雅安' },
  { value: 'bazhong', label: '巴中' },
  { value: 'ziyang', label: '资阳' },
  { value: 'aba', label: '阿坝' },
  { value: 'ganzi', label: '甘孜' },
  { value: 'liangshan', label: '凉山' },
  { value: 'guiyang', label: '贵阳' },
  { value: 'liupanshui', label: '六盘水' },
  { value: 'zunyi', label: '遵义' },
  { value: 'anshun', label: '安顺' },
  { value: 'bijie', label: '毕节' },
  { value: 'tongren', label: '铜仁' },
  { value: 'qianxinan', label: '黔西南' },
  { value: 'qiandongnan', label: '黔东南' },
  { value: 'qiannan', label: '黔南' },
  { value: 'kunming', label: '昆明' },
  { value: 'qujing', label: '曲靖' },
  { value: 'yuxi', label: '玉溪' },
  { value: 'baoshan', label: '保山' },
  { value: 'zhaotong', label: '昭通' },
  { value: 'lijiang', label: '丽江' },
  { value: 'puer', label: '普洱' },
  { value: 'lincang', label: '临沧' },
  { value: 'chuxiong', label: '楚雄' },
  { value: 'honghe', label: '红河' },
  { value: 'wenshan', label: '文山' },
  { value: 'xishuangbanna', label: '西双版纳' },
  { value: 'dali', label: '大理' },
  { value: 'dehong', label: '德宏' },
  { value: 'nujiang', label: '怒江' },
  { value: 'diqing', label: '迪庆' },
  { value: 'lasa', label: '拉萨' },
  { value: 'changdu', label: '昌都' },
  { value: 'shannan', label: '山南' },
  { value: 'shigatse', label: '日喀则' },
  { value: 'nagqu', label: '那曲' },
  { value: 'ali', label: '阿里' },
  { value: 'linzhi', label: '林芝' },
  { value: 'xian', label: '西安' },
  { value: 'tongchuan', label: '铜川' },
  { value: 'baoji', label: '宝鸡' },
  { value: 'xianyang', label: '咸阳' },
  { value: 'weinan', label: '渭南' },
  { value: 'yanan', label: '延安' },
  { value: 'hanzhong', label: '汉中' },
  { value: 'yulin', label: '榆林' },
  { value: 'ankang', label: '安康' },
  { value: 'shangluo', label: '商洛' },
  { value: 'lanzhou', label: '兰州' },
  { value: 'jiayuguan', label: '嘉峪关' },
  { value: 'jinchang', label: '金昌' },
  { value: 'baiyin', label: '白银' },
  { value: 'tianshui', label: '天水' },
  { value: 'wuwei', label: '武威' },
  { value: 'zhangye', label: '张掖' },
  { value: 'pingliang', label: '平凉' },
  { value: 'jiuquan', label: '酒泉' },
  { value: 'qingyang', label: '庆阳' },
  { value: 'dingxi', label: '定西' },
  { value: 'longnan', label: '陇南' },
  { value: 'linxia', label: '临夏' },
  { value: 'gannan', label: '甘南' },
  { value: 'xining', label: '西宁' },
  { value: 'haidong', label: '海东' },
  { value: 'haibei', label: '海北' },
  { value: 'huangnan', label: '黄南' },
  { value: 'hainan', label: '海南' },
  { value: 'guoluo', label: '果洛' },
  { value: 'yushu', label: '玉树' },
  { value: 'haixi', label: '海西' },
  { value: 'yinchuan', label: '银川' },
  { value: 'shizuishan', label: '石嘴山' },
  { value: 'wuzhong', label: '吴忠' },
  { value: 'guyuan', label: '固原' },
  { value: 'zhongwei', label: '中卫' },
  { value: 'wulumuqi', label: '乌鲁木齐' },
  { value: 'kelamayi', label: '克拉玛依' },
  { value: 'turpan', label: '吐鲁番' },
  { value: 'hami', label: '哈密' },
  { value: 'changji', label: '昌吉' },
  { value: 'bortala', label: '博尔塔拉' },
  { value: 'bayingolin', label: '巴音郭楞' },
  { value: 'aksu', label: '阿克苏' },
  { value: 'kezilesu', label: '克孜勒苏' },
  { value: 'kashgar', label: '喀什' },
  { value: 'hetian', label: '和田' },
  { value: 'ili', label: '伊犁' },
  { value: 'tacheng', label: '塔城' },
  { value: 'altay', label: '阿勒泰' },
  { value: 'shihezi', label: '石河子' },
  { value: 'alashan', label: '阿拉尔' },
  { value: 'tumushuke', label: '图木舒克' },
  { value: 'wujiaqu', label: '五家渠' },
  { value: 'beitun', label: '北屯' },
  { value: 'tiemenguan', label: '铁门关' },
  { value: 'shuanghe', label: '双河' },
  { value: 'kokdala', label: '可克达拉' },
  { value: 'kunyu', label: '昆玉' },
  { value: 'huyanghe', label: '胡杨河' },
  { value: 'taipei', label: '台北' },
  { value: 'xinbei', label: '新北' },
  { value: 'taoyuan', label: '桃园' },
  { value: 'taichung', label: '台中' },
  { value: 'tainan', label: '台南' },
  { value: 'kaohsiung', label: '高雄' },
  { value: 'keelung', label: '基隆' },
  { value: 'hsinchu', label: '新竹' },
  { value: 'chiayi', label: '嘉义' },
  { value: 'hongkong', label: '香港' },
  { value: 'macau', label: '澳门' }
]

function HotelInfo() {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [coverImageFile, setCoverImageFile] = useState(null)
  const [coverImageUrl, setCoverImageUrl] = useState('')
  const [coverImageLoading, setCoverImageLoading] = useState(false)

  const getToken = () => {
    return localStorage.getItem('token')
  }

  const loadDraft = () => {
    const draft = localStorage.getItem('hotel_draft')
    if (draft) {
      try {
        const draftData = JSON.parse(draft)
        form.setFieldsValue(draftData)
        message.info('已加载上次保存的草稿')
      } catch (error) {
        console.error('Failed to load draft:', error)
      }
    }
  }

  useEffect(() => {
    loadDraft()
  }, [])

  const saveDraft = () => {
    const formData = form.getFieldsValue()
    const draftData = {
      ...formData,
      savedAt: new Date().toISOString()
    }
    localStorage.setItem('hotel_draft', JSON.stringify(draftData))
    message.success('草稿已保存')
  }

  const clearDraft = () => {
    localStorage.removeItem('hotel_draft')
    form.resetFields()
    message.success('已一键清除所有数据')
  }

  const handleCoverImageChange = (info) => {
    console.log("info.file",info.file)
    if (info.file.status === 'done') {
      const responseUrl = info.file.response?.filename || info.file.response?.data?.url || info.file.response
      if (responseUrl) {
        setCoverImageUrl(responseUrl)
        setCoverImageFile(info.file.originFileObj)
        message.success('图片上传成功')
      }
      setCoverImageLoading(false)
    } else if (info.file.status === 'uploading') {
      setCoverImageLoading(true)
    } else if (info.file.status === 'error') {
      message.error('图片上传失败')
      setCoverImageLoading(false)
    }
  }

  const handleCoverImageBeforeUpload = (file) => {
    const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png'
    if (!isJpgOrPng) {
      message.error('只能上传 JPG/PNG 格式的图片!')
      return false
    }
    const isLt8M = file.size / 1024 / 1024 < 8
    if (!isLt8M) {
      message.error('图片大小不能超过 8MB!')
      return false
    }
    
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => {
      setCoverImageUrl(reader.result)
      setCoverImageFile(file)
    }
    return false
  }

  const beforeUpload = (file) => {
    const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png'
    if (!isJpgOrPng) {
      message.error('只能上传 JPG/PNG 格式的图片!')
    }
    const isLt8M = file.size / 1024 / 1024 < 8
    if (!isLt8M) {
      message.error('图片大小不能超过 8MB!')
    }
    return isJpgOrPng && isLt8M
  }

  const saveDraftToBackend = async () => {
    try {
      const values = await form.validateFields()
      setLoading(true)
      
      const token = getToken()
      console.log('formData:', values)
      
      const hotelData = {
        nameZh: values.name_zh,
        nameEn: values.name_en,
        cityCode: values.city,
        starLevel: values.star_level,
        address: values.address,
        openedDate: values.opened_date ? new Date(values.opened_date).toISOString() : null,
        lat: values.lat,
        lng: values.lng,
        facilities: values.facilities || [],
        tags: values.tags || [],
        checkInTime: values.check_in_time ? dayjs().format('YYYY-MM-DD') + ' ' + values.check_in_time.format('HH:mm') : null,
        checkOutTime: values.check_out_time ? dayjs().format('YYYY-MM-DD') + ' ' + values.check_out_time.format('HH:mm') : null,
        cancelPolicy: values.cancel_policy,
        changePolicy: values.change_policy,
        extraBedPolicy: values.extra_bed_policy,
        status: 'DRAFT',
      }

      const response = await fetch(`${API_BASE}/hotel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(hotelData)
      })

      const result = await response.json()

      if (response.ok) {
        const hotelId = result.data?.id || result.id
        
        if (!hotelId) {
          console.error('Hotel ID not found in response:', result)
          message.error('酒店保存成功，但无法获取酒店ID')
          setLoading(false)
          return
        }
        
        if (coverImageFile) {
          const formData = new FormData()
          formData.append('file', coverImageFile)
          formData.append('hotelId', hotelId)
          
          const coverResponse = await fetch(`${API_BASE}/upload/hotelcover`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`
            },
            body: formData
          })
          
          if (!coverResponse.ok) {
            message.warning('酒店保存成功，但封面上传失败')
          }
        }
        
        message.success('草稿已保存到后台')
        clearDraft()
        form.resetFields()
      } else {
        message.error(result.message || '保存失败')
      }
    } catch (error) {
      console.error('Save draft error:', error)
      if (error.errorFields) {
        message.error('请填写所有必填字段')
      } else {
        message.error('网络错误')
      }
    } finally {
      setLoading(false)
    }
  }

  const submitToReview = async () => {
    try {
      const values = await form.validateFields()
      setLoading(true)
      
      const token = getToken()

      const hotelData = {
        nameZh: values.name_zh,
        nameEn: values.name_en,
        cityCode: values.city,
        starLevel: values.star_level,
        address: values.address,
        openedDate: values.opened_date ? new Date(values.opened_date).toISOString() : null,
        lat: values.lat,
        lng: values.lng,
        facilities: values.facilities || [],
        tags: values.tags || [],
        checkInTime: values.check_in_time ? dayjs().format('YYYY-MM-DD') + ' ' + values.check_in_time.format('HH:mm') : null,
        checkOutTime: values.check_out_time ? dayjs().format('YYYY-MM-DD') + ' ' + values.check_out_time.format('HH:mm') : null,
        cancelPolicy: values.cancel_policy,
        changePolicy: values.change_policy,
        extraBedPolicy: values.extra_bed_policy,
        status: 'PENDING',
      }

      const response = await fetch(`${API_BASE}/hotel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(hotelData)
      })

      const result = await response.json()

      console.log('Create hotel response:', result)

      if (response.ok) {
        const hotelId = result.id || result.data?.id
        console.log('Hotel created successfully, hotelId:', hotelId)
        
        if (!hotelId) {
          console.error('Hotel ID not found in response:', result)
          message.error('酒店创建成功，但无法获取酒店ID')
          setLoading(false)
          return
        }
        
        if (coverImageFile) {
          const formData = new FormData()
          formData.append('file', coverImageFile)
          formData.append('hotelId', hotelId)
          console.log('Uploading cover image, hotelId:', hotelId, 'file:', coverImageFile.name)
          
          const coverResponse = await fetch(`${API_BASE}/upload/hotelcover`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`
            },
            body: formData
          })
          
          console.log('Cover upload response status:', coverResponse.status)
          
          if (!coverResponse.ok) {
            const errorText = await coverResponse.text()
            console.error('Cover upload failed:', errorText)
            message.warning('酒店提交成功，但封面上传失败')
          } else {
            console.log('Cover upload successful')
          }
        }
        
        message.success('提交审核成功')
        clearDraft()
        form.resetFields()
      } else {
        message.error(result.message || '提交失败')
      }
    } catch (error) {
      console.error('Submit error:', error)
      if (error.errorFields && error.errorFields.length > 0) {
        console.error('验证失败的字段:', error.errorFields)
        const fieldNames = error.errorFields.map(field => field.name.join('.')).join(', ')
        message.error(`请填写以下必填字段: ${fieldNames}`)
      } else {
        message.error('网络错误')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <Card title="录入一个新房源" bordered={false}>
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            name_zh: '',
            name_en: '',
            city: '',
            star_level: 3,
            address: '',
            opened_date: '',
            check_in_time: dayjs('14:00', 'HH:mm'),
            check_out_time: dayjs('12:00', 'HH:mm'),
            cancel_policy: 'free',
            change_policy: 'free',
            extra_bed_policy: 'allow'
          }}
        >
          <Divider orientation="left">基础信息</Divider>

          <Form.Item label="酒店精选封面" name="cover_image">
            <Space direction="vertical" style={{ width: '100%' }}>
              <Upload
                name="file"
                listType="picture-card"
                className="cover-uploader"
                showUploadList={false}
                beforeUpload={handleCoverImageBeforeUpload}
                style={coverUploaderStyle}
              >
                {coverImageLoading ? (
                  <div>
                    <Spin size="large" />
                    <div style={{ marginTop: 8 }}>上传中...</div>
                  </div>
                ) : coverImageUrl ? (
                  <img src={coverImageUrl} alt="封面" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div>
                    <PlusOutlined style={{ fontSize: 32 }} />
                    <div style={{ marginTop: 8 }}>上传封面</div>
                  </div>
                )}
              </Upload>
              {coverImageUrl && (
                <div style={{ marginTop: 12 }}>
                  <Space>
                    <span style={{ fontSize: 12, color: '#666' }}>图片预览：</span>
                    <img 
                      src={coverImageUrl} 
                      alt="封面预览" 
                      style={{ 
                        width: 100, 
                        height: 100, 
                        objectFit: 'cover', 
                        border: '1px solid #d9d9d9',
                        borderRadius: '4px'
                      }} 
                    />
                    <Button 
                      type="link" 
                      size="small" 
                      danger
                      onClick={() => {
                        setCoverImageUrl('')
                        setCoverImageFile(null)
                      }}
                    >
                      删除
                    </Button>
                  </Space>
                </div>
              )}
            </Space>
          </Form.Item>

          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Form.Item
                label="酒店名称（中文）"
                name="name_zh"
                rules={[{ required: true, message: '请输入酒店名称' }]}
              >
                <Input 
                  placeholder="请输入酒店中文名称" 
                  suffix={
                    <LocationPicker 
                      form={form} 
                      fieldNames={{ lat: 'lat', lng: 'lng', city: 'city', address: 'address' }} 
                    />
                  }
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="酒店名称（英文）"
                name="name_en"
                rules={[{ required: true, message: '请输入酒店英文名称' }]}
              >
                <Input placeholder="请输入酒店英文名称" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={[16, 16]}>
            <Col span={8}>
              <Form.Item
                label="城市"
                name="city"
                rules={[{ required: true, message: '请选择城市' }]}
              >
                <Select placeholder="请选择城市" showSearch optionFilterProp="label">
                  {cityOptions.map(city => (
                    <Select.Option key={city.value} value={city.value} label={city.label}>
                      {city.label}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="星级"
                name="star_level"
                rules={[{ required: true, message: '请选择星级' }]}
              >
                <Select placeholder="请选择星级">
                  <Select.Option value={1}>
                    <Space>
                      <StarOutlined />
                      <span>一星级</span>
                    </Space>
                  </Select.Option>
                  <Select.Option value={2}>
                    <Space>
                      <StarOutlined />
                      <StarOutlined />
                      <span>二星级</span>
                    </Space>
                  </Select.Option>
                  <Select.Option value={3}>
                    <Space>
                      <StarOutlined />
                      <StarOutlined />
                      <StarOutlined />
                      <span>三星级</span>
                    </Space>
                  </Select.Option>
                  <Select.Option value={4}>
                    <Space>
                      <StarOutlined />
                      <StarOutlined />
                      <StarOutlined />
                      <StarOutlined />
                      <span>四星级</span>
                    </Space>
                  </Select.Option>
                  <Select.Option value={5}>
                    <Space>
                      <StarOutlined />
                      <StarOutlined />
                      <StarOutlined />
                      <StarOutlined />
                      <StarOutlined />
                      <span>五星级</span>
                    </Space>
                  </Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="开业时间"
                name="opened_date"
                rules={[{ required: true, message: '请选择开业时间' }]}
              >
                <Input type="date" placeholder="请选择开业时间" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="地址"
            name="address"
            rules={[{ required: true, message: '请输入地址' }]}
          >
            <TextArea rows={3} placeholder="请输入酒店地址" />
          </Form.Item>

          <Row gutter={[16, 16]} align="middle">
            <Col span={12}>
              <Form.Item
                label="经度"
                name="lng"
              >
                <Input placeholder="请输入经度" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="纬度"
                name="lat"
              >
                <Input placeholder="请输入纬度" />
              </Form.Item>
            </Col>
          </Row>

          <Collapse defaultActiveKey={['facilities']} style={{ marginBottom: '24px' }}>
            <Panel header="酒店设施" key="facilities">
              <Form.Item 
                name="facilities" 
                style={{ marginBottom: 0 }}
                rules={[
                  {
                    validator: (_, value) => {
                      if (value && value.length > 5) {
                        return Promise.reject(new Error('酒店设施最多选择5个'))
                      }
                      return Promise.resolve()
                    }
                  }
                ]}
              >
                <Checkbox.Group style={{ width: '100%' }}>
                  <div style={{ maxHeight: '600px', overflowY: 'auto', border: '1px solid #d9d9d9', borderRadius: '6px', padding: '16px', background: '#fafafa' }}>
                    {facilityCategories.map(category => (
                      <div key={category.key} style={{ marginBottom: '20px' }}>
                        <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '12px', color: '#1890ff', borderBottom: '1px solid #e8e8e8', paddingBottom: '8px' }}>
                          {category.label}
                        </div>
                        <Row gutter={[16, 8]}>
                          {category.items.map(item => (
                            <Col span={8} key={item.value}>
                              <Checkbox value={item.value}>{item.label}</Checkbox>
                            </Col>
                          ))}
                        </Row>
                      </div>
                    ))}
                  </div>
                </Checkbox.Group>
              </Form.Item>
            </Panel>
          </Collapse>

          <Collapse defaultActiveKey={['tags']} style={{ marginBottom: '24px' }}>
            <Panel header="快捷标签" key="tags">
              <Form.Item 
                name="tags" 
                style={{ marginBottom: 0 }}
                rules={[
                  {
                    validator: (_, value) => {
                      if (value && value.length > 3) {
                        return Promise.reject(new Error('快捷标签最多选择3个'))
                      }
                      return Promise.resolve()
                    }
                  }
                ]}
              >
                <Checkbox.Group style={{ width: '100%' }}>
                  <div style={{ maxHeight: '600px', overflowY: 'auto', border: '1px solid #d9d9d9', borderRadius: '6px', padding: '16px', background: '#fafafa' }}>
                    {tagCategories.map(category => (
                      <div key={category.key} style={{ marginBottom: '20px' }}>
                        <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '12px', color: '#1890ff', borderBottom: '1px solid #e8e8e8', paddingBottom: '8px' }}>
                          {category.label}
                        </div>
                        <Row gutter={[16, 8]}>
                          {category.items.map(item => (
                            <Col span={8} key={item.value}>
                              <Checkbox value={item.value}>{item.label}</Checkbox>
                            </Col>
                          ))}
                        </Row>
                      </div>
                    ))}
                  </div>
                </Checkbox.Group>
              </Form.Item>
            </Panel>
          </Collapse>

          <Divider orientation="left">政策规则</Divider>

          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Form.Item label="入住时间" name="check_in_time" rules={[{ required: true, message: '请选择入住时间' }]}>
                <TimePicker style={{ width: '100%' }} format="HH:mm" placeholder="请选择入住时间" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="离店时间" name="check_out_time" rules={[{ required: true, message: '请选择离店时间' }]}>
                <TimePicker style={{ width: '100%' }} format="HH:mm" placeholder="请选择离店时间" />
              </Form.Item>
            </Col>
          </Row>

          <Divider>取消政策</Divider>
          <Form.Item label="取消政策" name="cancel_policy" rules={[{ required: true, message: '请选择取消政策' }]}>
            <Radio.Group>
              <Radio value="free">免费取消</Radio>
              <Radio value="24h">入住前24小时可取消</Radio>
              <Radio value="48h">入住前48小时可取消</Radio>
              <Radio value="none">不可取消</Radio>
            </Radio.Group>
          </Form.Item>

          <Divider>修改政策</Divider>
          <Form.Item label="修改政策" name="change_policy" rules={[{ required: true, message: '请选择修改政策' }]}>
            <Radio.Group>
              <Radio value="free">免费修改</Radio>
              <Radio value="24h">入住前24小时可修改</Radio>
              <Radio value="48h">入住前48小时可修改</Radio>
              <Radio value="none">不可修改</Radio>
            </Radio.Group>
          </Form.Item>

          <Divider>加床政策</Divider>
          <Form.Item label="加床政策" name="extra_bed_policy" rules={[{ required: true, message: '请选择加床政策' }]}>
            <Radio.Group>
              <Radio value="allow">允许免费加床</Radio>
              <Radio value="charge">允许收费加床</Radio>
              <Radio value="none">不允许加床</Radio>
            </Radio.Group>
          </Form.Item>

          <Form.Item label="特殊说明">
            <TextArea rows={4} placeholder="请输入特殊说明" name="special_notes" />
          </Form.Item>

          <Divider />

          <div style={{ textAlign: 'center', marginTop: '24px' }}>
            <Space size="large">
              <Button onClick={saveDraftToBackend} loading={loading} icon={<SaveOutlined />}>
                保存草稿
              </Button>
              <Button type="primary" onClick={submitToReview} loading={loading} icon={<UploadOutlined />}>
                提交审核
              </Button>
            </Space>
          </div>
        </Form>

        <Divider />

        <div style={{ textAlign: 'right' }}>
          <Button onClick={clearDraft} danger>
            一键清除
          </Button>
        </div>
      </Card>
    </div>
  )
}

const coverUploaderStyle = {
  width: '100%',
  height: '200px',
  border: '1px dashed #d9d9d9',
  borderRadius: '8px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  overflow: 'hidden'
}

export default HotelInfo
