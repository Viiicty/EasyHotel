import { useState, useEffect } from 'react'
import { Card, Form, Input, Select, Button, Row, Col, Space, message, Divider, Radio, TimePicker } from 'antd'
import {
  UploadOutlined,
  SaveOutlined,
  StarOutlined
} from '@ant-design/icons'

const { TextArea } = Input

const API_BASE = 'http://localhost:8888'

function HotelInfo() {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)

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
        openedDate: values.opened_date,
        lat: values.lat,
        lng: values.lng,
        facilities: values.facilities || [],
        tags: values.tags || [],
        checkInTime: values.check_in_time,
        checkOutTime: values.check_out_time,
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
        openedDate: values.opened_date,
        lat: values.lat,
        lng: values.lng,
        facilities: values.facilities || [],
        tags: values.tags || [],
        checkInTime: values.check_in_time,
        checkOutTime: values.check_out_time,
        cancelPolicy: values.cancel_policy,
        changePolicy: values.change_policy,
        extraBedPolicy: values.extra_bed_policy,
      }

      const submissionData = {
        hotelId: null,
        payloadJson: JSON.stringify({
          hotel: hotelData
        }),
        status: 'PENDING'
      }

      const response = await fetch(`${API_BASE}/hotel-submission`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(submissionData)
      })

      const result = await response.json()

      if (response.ok && result.code === 200) {
        message.success('提交审核成功')
        clearDraft()
        form.resetFields()
      } else {
        message.error(result.message || '提交失败')
      }
    } catch (error) {
      console.error('Submit error:', error)
      if (error.errorFields) {
        message.error('请填写所有必填字段')
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
          }}
        >
          <Divider orientation="left">基础信息</Divider>

          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Form.Item
                label="酒店名称（中文）"
                name="name_zh"
                rules={[{ required: true, message: '请输入酒店名称' }]}
              >
                <Input placeholder="请输入酒店中文名称" />
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
                <Select placeholder="请选择城市">
                  <Select.Option value="beijing">北京</Select.Option>
                  <Select.Option value="shanghai">上海</Select.Option>
                  <Select.Option value="hangzhou">杭州</Select.Option>
                  <Select.Option value="guangzhou">广州</Select.Option>
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

          <Row gutter={[16, 16]}>
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

          <Form.Item label="酒店设施">
            <Select mode="tags" placeholder="请选择酒店设施" style={{ width: '100%' }} name="facilities">
              <Select.Option value="wifi">免费 WiFi</Select.Option>
              <Select.Option value="parking">免费停车场</Select.Option>
              <Select.Option value="swimming">游泳池</Select.Option>
              <Select.Option value="gym">健身房</Select.Option>
              <Select.Option value="restaurant">餐厅</Select.Option>
              <Select.Option value="spa">SPA</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item label="快捷标签">
            <Select mode="tags" placeholder="请选择快捷标签" style={{ width: '100%' }} name="tags">
              <Select.Option value="family">亲子酒店</Select.Option>
              <Select.Option value="luxury">豪华酒店</Select.Option>
              <Select.Option value="business">商务酒店</Select.Option>
              <Select.Option value="airport">近机场</Select.Option>
              <Select.Option value="subway">近地铁</Select.Option>
            </Select>
          </Form.Item>

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

export default HotelInfo
