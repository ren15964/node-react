import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Form, Input, Button, Card, Space, message, Tag, Radio, Select } from 'antd'
import { ArrowLeftOutlined } from '@ant-design/icons'
import request from '../utils/request'
import { useAuth } from '../context/useAuth'
import { fetchCategories } from '../api/category'
import { fetchTags } from '../api/tag'

function ArticleEdit() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = !!id
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [optionsLoading, setOptionsLoading] = useState(false)
  const [categories, setCategories] = useState([])
  const [tags, setTags] = useState([])
  const [articleMeta, setArticleMeta] = useState(null)
  const { userInfo } = useAuth()

  useEffect(() => {
    const loadOptions = async () => {
      setOptionsLoading(true)

      try {
        const [categoryRes, tagRes] = await Promise.all([fetchCategories(), fetchTags()])
        setCategories(categoryRes.data)
        setTags(tagRes.data)
      } catch (err) {
        message.error(err.response?.data?.message || '加载文章配置失败')
      } finally {
        setOptionsLoading(false)
      }
    }

    loadOptions()
  }, [])

  useEffect(() => {
    if (!isEdit) {
      form.setFieldsValue({
        status: 'draft',
        categoryId: null,
        tagIds: []
      })
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
          content: article.content || '',
          status: article.status,
          categoryId: article.category_id ?? null,
          tagIds: article.tags?.map((tag) => tag.id) || []
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
      const payload = {
        ...values,
        categoryId: values.categoryId || null,
        tagIds: values.tagIds || []
      }

      if (isEdit) {
        await request.put('/api/articles/' + id, payload)
        message.success('文章更新成功')
      } else {
        await request.post('/api/articles', payload)
        message.success(payload.status === 'published' ? '文章发布成功' : '草稿保存成功')
      }

      navigate('/articles')
    } catch (err) {
      const msg = err.response?.data?.message || '操作失败'
      message.error(msg)
    } finally {
      setLoading(false)
    }
  }

  const categoryOptions = categories.map((category) => ({
    label: category.name,
    value: category.id
  }))

  const tagOptions = tags.map((tag) => ({
    label: tag.name,
    value: tag.id
  }))

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
            <Tag color={articleMeta.status === 'published' ? 'green' : 'orange'}>
              {articleMeta.status === 'published' ? '已发布' : '草稿'}
            </Tag>
            <Tag color="blue">作者：{articleMeta.author_name || '未知作者'}</Tag>
            <Tag color="geekblue">分类：{articleMeta.category_name || '未分类'}</Tag>
            <Space size={[4, 4]} wrap>
              {(articleMeta.tags || []).map((tag) => (
                <Tag key={tag.id}>{tag.name}</Tag>
              ))}
            </Space>
            <Tag color="default">
              创建时间：{new Date(articleMeta.created_at).toLocaleString('zh-CN')}
            </Tag>
          </Space>
        )}

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{ status: 'draft', categoryId: null, tagIds: [] }}
        >
          <Form.Item
            label="文章标题"
            name="title"
            rules={[{ required: true, message: '请输入文章标题' }]}
          >
            <Input placeholder="请输入文章标题" />
          </Form.Item>

          <Form.Item label="文章分类" name="categoryId">
            <Select
              allowClear
              placeholder="请选择文章分类"
              options={categoryOptions}
              loading={optionsLoading}
            />
          </Form.Item>

          <Form.Item label="文章标签" name="tagIds">
            <Select
              mode="multiple"
              allowClear
              placeholder="请选择文章标签"
              options={tagOptions}
              loading={optionsLoading}
              maxCount={10}
            />
          </Form.Item>

          <Form.Item
            label="发布状态"
            name="status"
            rules={[{ required: true, message: '请选择文章状态' }]}
          >
            <Radio.Group
              options={[
                { label: '草稿', value: 'draft' },
                { label: '已发布', value: 'published' }
              ]}
              optionType="button"
              buttonStyle="solid"
            />
          </Form.Item>

          <Form.Item label="文章内容" name="content">
            <Input.TextArea placeholder="请输入文章内容" rows={12} showCount />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading}>
                {isEdit ? '保存修改' : '保存文章'}
              </Button>
              <Button onClick={() => navigate(isEdit ? '/articles/' + id : '/articles')}>取消</Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  )
}

export default ArticleEdit
