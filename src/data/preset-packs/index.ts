import { childrenPortraitPack } from './children-portrait'
import type { PresetPack, WorkflowTemplate } from '../../types/generation'

const plannedPresetPacks: PresetPack[] = [
  {
    id: 'product-main-image',
    title: '商品主图',
    description: '面向电商 SKU 的主图、场景图和卖点视觉，规划中。',
    category: 'product',
    availability: 'planned',
    audience: '电商运营、品牌视觉团队、独立卖家',
    recommendedInputs: ['商品实拍图', '品牌色与材质说明', '目标平台尺寸'],
    qualityGuidelines: ['主体清晰', '材质可信', '避免虚假卖点'],
    presets: [],
  },
  {
    id: 'avatar-foundation',
    title: '头像套图',
    description: '面向个人品牌、职场形象和社交头像的批量套图，规划中。',
    category: 'avatar',
    availability: 'planned',
    audience: '创作者、知识博主、职场用户',
    recommendedInputs: ['清晰半身照', '职业或风格关键词'],
    qualityGuidelines: ['身份一致', '表情自然', '背景不过度抢戏'],
    presets: [],
  },
  {
    id: 'festival-campaign-poster',
    title: '节日海报',
    description: '面向节日营销、活动预热和门店物料的海报主题，规划中。',
    category: 'campaign',
    availability: 'planned',
    audience: '营销运营、门店设计、电商活动团队',
    recommendedInputs: ['主题关键词', '主视觉元素', '活动信息'],
    qualityGuidelines: ['层级清楚', '文案空间充足', '避免廉价装饰'],
    presets: [],
  },
  {
    id: 'social-cover-pack',
    title: '社媒封面',
    description: '面向小红书、视频号、公众号等渠道封面图，规划中。',
    category: 'editorial',
    availability: 'planned',
    audience: '内容运营、自媒体创作者、品牌编辑',
    recommendedInputs: ['内容标题', '人物或产品图', '渠道比例'],
    qualityGuidelines: ['首屏识别强', '标题留白稳定', '缩略图可读'],
    presets: [],
  },
]

export const presetPacks: PresetPack[] = [
  { ...childrenPortraitPack, availability: 'available' },
  ...plannedPresetPacks,
]

export const workflowTemplates: WorkflowTemplate[] = [
  {
    id: 'portrait-studio-batch',
    title: '影楼批量出片',
    description: '从同一参考图生成多组儿童写真风格，用于快速出样和客户初筛。',
    category: 'children-portrait',
    recommendedPackId: 'children-portrait-foundation',
    expectedOutput: '多风格候选图 + 精选结果清单',
  },
  {
    id: 'commerce-sku-main',
    title: '电商 SKU 主图',
    description: '围绕单个商品生成多套主图方向，适合后续接入商品主题包。',
    category: 'product',
    recommendedPackId: 'product-main-image',
    expectedOutput: '主图候选 + 平台尺寸 metadata',
  },
  {
    id: 'personal-avatar-set',
    title: '个人头像套图',
    description: '围绕同一人物生成职业、社媒和轻写真头像方向。',
    category: 'avatar',
    recommendedPackId: 'avatar-foundation',
    expectedOutput: '头像候选 + 风格标签',
  },
]

export const allPresets = presetPacks.flatMap((pack) => pack.presets)
