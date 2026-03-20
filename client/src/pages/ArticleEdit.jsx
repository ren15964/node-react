import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Form, Input, Button, Card, Space, message } from 'antd'
import { ArrowLeftOutlined } from '@ant-design/icons'
import request from '../utils/request'

function ArticleEdit() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = !!id
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isEdit) {
      const fetchArticle = async () => {
        try {
          const res = await request.get('/api/articles/' + id)
          form.setFieldsValue({
            title: res.data.title,
            content: res.data.content || ''
          })
        } catch (err) {
          message.error('加载文章失败')
        }
      }
      fetchArticle()
    }
  }, [id, isEdit, form])

  const handleSubmit = async (values) => {
    setLoading(true)
    try {
      if (isEdit) {
        await request.put('/api/articles/' + id, values)
        message.success('文章更新成功')
      } else {
        await request.post('/api/articles', values)
        message.success('文章发布成功')
      }
      navigate('/articles')
    } catch (err) {
      const msg = err.response?.data?.message || '操作失败'
      message.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <Button
        type="link"
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate('/articles')}
        className="mb-4 px-0 text-gray-500"
      >
        返回列表
      </Button>

      <Card title={<span className="text-lg">{isEdit ? '编辑文章' : '发布文章'}</span>}>
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            label="文章标题"
            name="title"
            rules={[{ required: true, message: '请输入文章标题' }]}
          >
            <Input placeholder="请输入文章标题" />
          </Form.Item>

          <Form.Item label="文章内容" name="content">
            <Input.TextArea placeholder="请输入文章内容" rows={12} showCount />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading}>
                {isEdit ? '保存修改' : '发布文章'}
              </Button>
              <Button onClick={() => navigate('/articles')}>取消</Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  )
}

export default ArticleEdit
