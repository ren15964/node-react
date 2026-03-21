import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Form, Input, Button, Card, Space, message, Tag } from 'antd'
import { ArrowLeftOutlined } from '@ant-design/icons'
import request from '../utils/request'
import { useAuth } from '../context/useAuth'

function ArticleEdit() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = !!id
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [articleMeta, setArticleMeta] = useState(null)
  const { userInfo } = useAuth()

  useEffect(() => {
    if (!isEdit) {
      return
    }

    const fetchArticle = async () => {
      try {
        const res = await request.get('/api/articles/' + id)
        const article = res.data

        if (userInfo && article.author_id !== userInfo.id) {
          message.error('你只能编辑自己创建的文章')
          navigate('/articles/' + id, { replace: true })
          return
        }

        setArticleMeta(article)
        form.setFieldsValue({
          title: article.title,
          content: article.content || ''
        })
      } catch (err) {
        message.error(err.response?.data?.message || '加载文章失败')
        navigate('/articles', { replace: true })
      }
    }

    fetchArticle()
  }, [form, id, isEdit, navigate, userInfo])

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
        onClick={() => navigate(isEdit ? '/articles/' + id : '/articles')}
        className="mb-4 px-0 text-gray-500"
      >
        {isEdit ? '返回详情' : '返回列表'}
      </Button>

      <Card title={<span className="text-lg">{isEdit ? '编辑文章' : '发布文章'}</span>}>
        {articleMeta && (
          <Space className="mb-4" wrap>
            <Tag color="blue">作者：{articleMeta.author_name || '未知作者'}</Tag>
            <Tag color="default">
              创建时间：{new Date(articleMeta.created_at).toLocaleString('zh-CN')}
            </Tag>
          </Space>
        )}

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
              <Button onClick={() => navigate(isEdit ? '/articles/' + id : '/articles')}>
                取消
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  )
}

export default ArticleEdit
