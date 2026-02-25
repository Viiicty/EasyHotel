import { useState } from 'react'
import { Button, Space, message, Modal, List } from 'antd'
import { AimOutlined, EnvironmentOutlined, CheckCircleOutlined } from '@ant-design/icons'

const API_BASE = '/api'

const cityPinyinMap = {
  '北京': 'beijing',
  '上海': 'shanghai',
  '广州': 'guangzhou',
  '深圳': 'shenzhen',
  '成都': 'chengdu',
  '重庆': 'chongqing',
  '杭州': 'hangzhou',
  '武汉': 'wuhan',
  '西安': 'xian',
  '天津': 'tianjin',
  '苏州': 'suzhou',
  '南京': 'nanjing',
  '郑州': 'zhengzhou',
  '长沙': 'changsha',
  '东莞': 'dongguan',
  '沈阳': 'shenyang',
  '青岛': 'qingdao',
  '合肥': 'hefei',
  '佛山': 'foshan',
  '宁波': 'ningbo',
  '厦门': 'xiamen',
  '福州': 'fuzhou',
  '无锡': 'wuxi',
  '济南': 'jinan',
  '大连': 'dalian',
  '哈尔滨': 'haerbin',
  '长春': 'changchun',
  '昆明': 'kunming',
  '贵阳': 'guiyang',
  '南宁': 'nanning',
  '兰州': 'lanzhou',
  '西宁': 'xining',
  '银川': 'yinchuan',
  '乌鲁木齐': 'wulumuqi',
  '拉萨': 'lasa',
  '太原': 'taiyuan',
  '石家庄': 'shijiazhuang',
  '唐山': 'tangshan',
  '包头': 'baotou',
  '呼和浩特': 'huhehaote',
  '吉林': 'jilin',
  '齐齐哈尔': 'qiqihaer',
  '鸡西': 'jixi',
  '鹤岗': 'hegang',
  '双鸭山': 'shuangyashan',
  '大庆': 'daqing',
  '伊春': 'yichun',
  '佳木斯': 'jiamusi',
  '七台河': 'qitaihe',
  '牡丹江': 'mudanjiang',
  '黑河': 'heihe',
  '绥化': 'suihua',
  '徐州': 'xuzhou',
  '常州': 'changzhou',
  '南通': 'nantong',
  '连云港': 'lianyungang',
  '淮安': 'huaian',
  '盐城': 'yancheng',
  '扬州': 'yangzhou',
  '镇江': 'zhenjiang',
  '泰州': 'taizhou',
  '宿迁': 'suqian',
  '温州': 'wenzhou',
  '嘉兴': 'jiaxing',
  '湖州': 'huzhou',
  '绍兴': 'shaoxing',
  '金华': 'jinhua',
  '衢州': 'quzhou',
  '舟山': 'zhoushan',
  '台州': 'taizhou',
  '丽水': 'lishui',
  '芜湖': 'wuhu',
  '蚌埠': 'bengbu',
  '淮南': 'huainan',
  '马鞍山': 'maanshan',
  '淮北': 'huaibei',
  '铜陵': 'tongling',
  '安庆': 'anqing',
  '黄山': 'huangshan',
  '滁州': 'chuzhou',
  '阜阳': 'fuyang',
  '六安': 'luan',
  '亳州': 'bozhou',
  '池州': 'chizhou',
  '宣城': 'xuancheng',
  '莆田': 'putian',
  '三明': 'sanming',
  '泉州': 'quanzhou',
  '漳州': 'zhangzhou',
  '南平': 'nanping',
  '龙岩': 'longyan',
  '宁德': 'ningde',
  '南昌': 'nanchang',
  '景德镇': 'jingdezhen',
  '萍乡': 'pingxiang',
  '九江': 'jiujiang',
  '新余': 'xinyu',
  '鹰潭': 'yingtan',
  '赣州': 'ganzhou',
  '吉安': 'jian',
  '宜春': 'yichun',
  '抚州': 'fuzhou',
  '上饶': 'shangrao',
  '淄博': 'zibo',
  '枣庄': 'zaozhuang',
  '东营': 'dongying',
  '烟台': 'yantai',
  '潍坊': 'weifang',
  '济宁': 'jining',
  '泰安': 'taian',
  '威海': 'weihai',
  '日照': 'rizhao',
  '临沂': 'linyi',
  '德州': 'dezhou',
  '聊城': 'liaocheng',
  '滨州': 'binzhou',
  '菏泽': 'heze',
  '开封': 'kaifeng',
  '洛阳': 'luoyang',
  '平顶山': 'pingdingshan',
  '安阳': 'anyang',
  '新乡': 'xinxiang',
  '焦作': 'jiaozuo',
  '濮阳': 'puyang',
  '许昌': 'xuchang',
  '漯河': 'luohe',
  '三门峡': 'sanmenxia',
  '南阳': 'nanyang',
  '商丘': 'shangqiu',
  '信阳': 'xinyang',
  '周口': 'zhoukou',
  '驻马店': 'zhumadian',
  '黄石': 'huangshi',
  '十堰': 'shiyan',
  '宜昌': 'yichang',
  '襄阳': 'xiangyang',
  '鄂州': 'ezhou',
  '荆门': 'jingmen',
  '孝感': 'xiaogan',
  '荆州': 'jingzhou',
  '黄冈': 'huanggang',
  '咸宁': 'xianning',
  '随州': 'suizhou',
  '恩施': 'enshi',
  '株洲': 'zhuzhou',
  '湘潭': 'xiangtan',
  '衡阳': 'hengyang',
  '邵阳': 'shaoyang',
  '岳阳': 'yueyang',
  '常德': 'changde',
  '张家界': 'zhangjiajie',
  '益阳': 'yiyang',
  '郴州': 'chenzhou',
  '永州': 'yongzhou',
  '怀化': 'huaihua',
  '娄底': 'loudi',
  '湘西': 'xiangxi',
  '韶关': 'shaoguan',
  '珠海': 'zhuhai',
  '汕头': 'shantou',
  '江门': 'jiangmen',
  '湛江': 'zhanjiang',
  '茂名': 'maoming',
  '肇庆': 'zhaoqing',
  '惠州': 'huizhou',
  '梅州': 'meizhou',
  '汕尾': 'shanwei',
  '河源': 'heyuan',
  '阳江': 'yangjiang',
  '清远': 'qingyuan',
  '中山': 'zhongshan',
  '潮州': 'chaozhou',
  '揭阳': 'jieyang',
  '云浮': 'yunfu',
  '柳州': 'liuzhou',
  '梧州': 'wuzhou',
  '北海': 'beihai',
  '防城港': 'fangchenggang',
  '钦州': 'qinzhou',
  '贵港': 'guigang',
  '玉林': 'yulin',
  '百色': 'baise',
  '贺州': 'hezhou',
  '河池': 'hechi',
  '来宾': 'laibin',
  '崇左': 'chongzuo',
  '海口': 'haikou',
  '三亚': 'sanya',
  '三沙': 'sansha',
  '儋州': 'danzhou',
  '自贡': 'zigong',
  '攀枝花': 'panzhihua',
  '泸州': 'luzhou',
  '德阳': 'deyang',
  '绵阳': 'mianyang',
  '广元': 'guangyuan',
  '遂宁': 'suining',
  '内江': 'neijiang',
  '乐山': 'leshan',
  '南充': 'nanchong',
  '眉山': 'meishan',
  '宜宾': 'yibin',
  '广安': 'guangan',
  '达州': 'dazhou',
  '雅安': 'yaan',
  '巴中': 'bazhong',
  '资阳': 'ziyang',
  '阿坝': 'aba',
  '甘孜': 'ganzi',
  '凉山': 'liangshan',
  '六盘水': 'liupanshui',
  '遵义': 'zunyi',
  '安顺': 'anshun',
  '毕节': 'bijie',
  '铜仁': 'tongren',
  '黔西南': 'qianxinan',
  '黔东南': 'qiandongnan',
  '黔南': 'qiannan',
  '曲靖': 'qujing',
  '玉溪': 'yuxi',
  '保山': 'baoshan',
  '昭通': 'zhaotong',
  '普洱': 'puer',
  '临沧': 'lincang',
  '楚雄': 'chuxiong',
  '红河': 'honghe',
  '文山': 'wenshan',
  '西双版纳': 'xishuangbanna',
  '大理': 'dali',
  '德宏': 'dehong',
  '怒江': 'nujiang',
  '迪庆': 'diqing',
  '昌都': 'changdu',
  '山南': 'shannan',
  '日喀则': 'shigatse',
  '那曲': 'nagqu',
  '阿里': 'ali',
  '林芝': 'linzhi',
  '铜川': 'tongchuan',
  '宝鸡': 'baoji',
  '咸阳': 'xianyang',
  '渭南': 'weinan',
  '延安': 'yanan',
  '汉中': 'hanzhong',
  '榆林': 'yulin',
  '安康': 'ankang',
  '商洛': 'shangluo',
  '嘉峪关': 'jiayuguan',
  '金昌': 'jinchang',
  '白银': 'baiyin',
  '天水': 'tianshui',
  '武威': 'wuwei',
  '张掖': 'zhangye',
  '平凉': 'pingliang',
  '酒泉': 'jiuquan',
  '庆阳': 'qingyang',
  '定西': 'dingxi',
  '陇南': 'longnan',
  '临夏': 'linxia',
  '甘南': 'gannan',
  '海东': 'haidong',
  '海北': 'haibei',
  '黄南': 'huangnan',
  '海南': 'hainan',
  '果洛': 'guoluo',
  '玉树': 'yushu',
  '海西': 'haixi',
  '石嘴山': 'shizuishan',
  '吴忠': 'wuzhong',
  '固原': 'guyuan',
  '中卫': 'zhongwei',
  '克拉玛依': 'kelamayi',
  '吐鲁番': 'turpan',
  '哈密': 'hami',
  '昌吉': 'changji',
  '博尔塔拉': 'bortala',
  '巴音郭楞': 'bayingolin',
  '阿克苏': 'aksu',
  '克孜勒苏': 'kezilesu',
  '喀什': 'kashgar',
  '和田': 'hetian',
  '伊犁': 'ili',
  '塔城': 'tacheng',
  '阿勒泰': 'altay',
  '石河子': 'shihezi',
  '阿拉尔': 'alashan',
  '图木舒克': 'tumushuke',
  '五家渠': 'wujiaqu',
  '北屯': 'beitun',
  '铁门关': 'tiemenguan',
  '双河': 'shuanghe',
  '可克达拉': 'kokdala',
  '昆玉': 'kunyu',
  '胡杨河': 'huyanghe',
  '台北': 'taipei',
  '新北': 'xinbei',
  '桃园': 'taoyuan',
  '台中': 'taichung',
  '台南': 'tainan',
  '高雄': 'kaohsiung',
  '基隆': 'keelung',
  '新竹': 'hsinchu',
  '嘉义': 'chiayi',
  '香港': 'hongkong',
  '澳门': 'macau'
}

function LocationPicker({ form, fieldNames = { lat: 'lat', lng: 'lng', city: 'city', address: 'address' } }) {
  const [locating, setLocating] = useState(false)
  const [poiResults, setPoiResults] = useState([])
  const [showPoiModal, setShowPoiModal] = useState(false)

  const handleSmartLocation = async () => {
    const formData = form.getFieldsValue()
    
    if (!formData[fieldNames.address] && !formData.name_zh && !formData.name_en) {
      message.warning('请先输入地址或酒店名称')
      return
    }

    setLocating(true)

    try {
      if (formData[fieldNames.address]) {
        await geocodeAddress(formData[fieldNames.address])
      } else if (formData.name_zh || formData.name_en) {
        const hotelName = formData.name_zh || formData.name_en
        await searchHotelByName(hotelName, formData[fieldNames.city])
      }
    } catch (error) {
      console.error('定位失败:', error)
      message.error('定位失败，请手动填写')
    } finally {
      setLocating(false)
    }
  }

  const geocodeAddress = async (address) => {
    try {
      const url = `${API_BASE}/mini/hotel/geocode?address=${encodeURIComponent(address)}`
      
      const response = await fetch(url)
      const result = await response.json()

      if (response.ok && result.code === 200 && result.data.geocodes && result.data.geocodes.length > 0) {
        const geocode = result.data.geocodes[0]
        const { location, formatted_address, addressComponent } = geocode
        
        const [lng, lat] = location.split(',')
        
        form.setFieldsValue({
          [fieldNames.lat]: lat,
          [fieldNames.lng]: lng
        })

        if (addressComponent) {
          const city = addressComponent.city || addressComponent.province
          const cityPinyin = cityPinyinMap[city] || ''
          
          if (fieldNames.city && cityPinyin) {
            form.setFieldValue(fieldNames.city, cityPinyin)
          }
          if (fieldNames.address && formatted_address) {
            form.setFieldValue(fieldNames.address, formatted_address)
          }
        }

        message.success('地址定位成功')
      } else {
        message.warning('未找到该地址，请检查地址是否正确')
      }
    } catch (error) {
      console.error('地理编码失败:', error)
      message.error('地址定位失败，请手动填写')
    }
  }

  const searchHotelByName = async (name, cityCode) => {
    try {
      let url = `${API_BASE}/mini/hotel/search-poi?keyword=${encodeURIComponent(name)}`
      
      if (cityCode) {
        url += `&city=${encodeURIComponent(cityCode)}`
      }
      
      const response = await fetch(url)
      const result = await response.json()

      if (response.ok && result.code === 200 && result.data.pois && result.data.pois.length > 0) {
        setPoiResults(result.data.pois)
        setShowPoiModal(true)
      } else {
        message.warning('未找到匹配的酒店，请检查名称是否正确')
      }
    } catch (error) {
      console.error('POI搜索失败:', error)
      message.error('酒店名称搜索失败，请手动填写')
    }
  }

  const handlePoiSelect = (poi) => {
    const { location, address, pname, cityname, adname } = poi
    
    const [lng, lat] = location.split(',')
    
    form.setFieldsValue({
      [fieldNames.lat]: lat,
      [fieldNames.lng]: lng
    })

    if (fieldNames.address) {
      const formattedAddress = address || `${adname}${pname}`
      form.setFieldsValue({
        [fieldNames.address]: formattedAddress
      })
    }

    if (fieldNames.city && cityname) {
      const cityPinyin = cityPinyinMap[cityname] || ''
      if (cityPinyin) {
        form.setFieldsValue({
          [fieldNames.city]: cityPinyin
        })
      }
    }

    setShowPoiModal(false)
    setPoiResults([])
    message.success('定位成功')
  }

  return (
    <>
      <Button 
        icon={<AimOutlined />} 
        onClick={handleSmartLocation}
        loading={locating}
      >
        {locating ? '定位中...' : '智能定位'}
      </Button>

      <Modal
        title="选择酒店"
        open={showPoiModal}
        onCancel={() => {
          setShowPoiModal(false)
          setPoiResults([])
        }}
        footer={null}
        width={600}
      >
        <List
          dataSource={poiResults}
          renderItem={(poi) => (
            <List.Item
              key={poi.id}
              onClick={() => handlePoiSelect(poi)}
              style={{ cursor: 'pointer' }}
              actions={[
                <Button 
                  type="link" 
                  icon={<CheckCircleOutlined />}
                  onClick={() => handlePoiSelect(poi)}
                >
                  选择
                </Button>
              ]}
            >
              <List.Item.Meta
                title={poi.name}
                description={
                  <div>
                    <div>{poi.address || `${poi.adname}${poi.pname}`}</div>
                    <div style={{ fontSize: '12px', color: '#999' }}>
                      {poi.cityname} {poi.adname}
                    </div>
                  </div>
                }
              />
            </List.Item>
          )}
        />
      </Modal>
    </>
  )
}

export default LocationPicker
