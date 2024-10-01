'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { useRouter } from 'next/navigation'
import { getSession } from 'next-auth/react'

import { User } from '../../../lib/definition'

export default function Page() {
  const router = useRouter()
  const PROMPT =
    'You are a creative blog writer. write a 50-word blog post about the title below. You can write anything you want, but it must be at least 50 words long. The title is: '
  const [generating, setGenerating] = useState(false)
  const [content, setContent] = useState('')
  const [user, setUser] = useState<User | null>(null)
  const [formData, setFormData] = useState({
    id: '',
    title: '',
    content: '',
    date: new Date().toISOString().slice(0, 10)
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }))
  }

  const handleSubmit = (e: React.ChangeEvent<HTMLFormElement>) => {
    e.preventDefault()
    const uuid = uuidv4()
    fetch(
      `/api/posts?id=${uuid}&title=${formData.title}&author=${user?.name}&content=${content || formData.content}&date=${
        formData.date
      }`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ ...formData, id: uuid })
      }
    )
      .then(() => {
        // Clear form fields
        setFormData({
          id: '',
          title: '',
          content: '',
          date: ''
        })
        router.push('/blog/posts')
      })
      .catch(console.error)
  }

  const generateContent = async () => {
    setGenerating(true)

    if (!formData?.title) {
      setGenerating(false)
      return false
    }

    const requestParams = {
      model: 'text-davinci-003',
      messages: [
        { role: 'system', content: PROMPT + formData?.title },
        { role: 'user', content: formData?.title }
      ]
    }

    const maxRetries = 3
    let retries = 0

    while (retries < maxRetries) {
      try {
        // More info: https://platform.openai.com/docs/guides/chat-completions/response-format
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.OPEN_AI_KEY}`
          },
          body: JSON.stringify(requestParams)
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(`API request failed: ${errorData.error?.message || response.statusText}`)
        }

        const data = await response.json()
        setContent(data.choices[0].message.content)
        console.log(data.choices[0].message.content)
        setGenerating(false)
        return
      } catch (error) {
        console.error(`Attempt ${retries + 1} failed:`, error)
        retries++
        if (retries < maxRetries) {
          const backoffTime = Math.pow(2, retries) * 1000 // Exponential backoff
          console.log(`Retrying in ${backoffTime}ms...`)
          await new Promise(resolve => setTimeout(resolve, backoffTime))
        }
      }
    }

    console.error('Max retries reached. Unable to generate content.')
    setGenerating(false)
  }

  useEffect(() => {
    console.log('API KEY', process.env.OPEN_AI_KEY)
    getSession().then(session => {
      setUser(session?.user || null)

      if (!session?.user) {
        router.push('/blog/posts')
      }
    })
  }, [])

  const postContent = useMemo(() => {
    return content || formData.content
  }, [content, formData.content])

  return (
    <div className='bg-white p-8 rounded shadow'>
      <h2 className='text-2xl mb-4 text-sky-700'>New Blog Post</h2>
      <form onSubmit={handleSubmit} className='space-y-4'>
        <div>
          <label htmlFor='title' className='block font-medium'>
            Title:
          </label>
          <input
            type='text'
            id='title'
            name='title'
            value={formData.title}
            onChange={handleChange}
            className='w-full border-2 border-sky-100 p-2 rounded-md focus:border-sky-200 focus:outline-none'
          />
        </div>
        <div>
          <label htmlFor='content' className='block font-medium'>
            Content:
          </label>
          <textarea
            id='content'
            name='content'
            rows={4}
            value={postContent}
            onChange={handleChange}
            className='w-full border-2 border-sky-100 p-2 rounded-md focus:border-sky-200 focus:outline-none'
          ></textarea>
          {generating && <p className='text-sky-700 my-1'>Generating content...</p>}
          <button
            onClick={generateContent}
            type='button'
            className='text-white px-4 py-2 rounded-md bg-sky-600  hover:bg-sky-700'
          >
            Generate Content
          </button>
        </div>
        <div>
          <label htmlFor='date' className='block font-medium'>
            Date:
          </label>
          <input
            type='text'
            id='date'
            name='date'
            value={formData.date}
            readOnly
            className='w-full border-2 border-sky-100 p-2 rounded-md focus:border-sky-200 focus:outline-none'
          />
        </div>
        <div>
          <button type='submit' className='text-white px-4 py-2 rounded-md bg-sky-600  hover:bg-sky-700'>
            Submit
          </button>
        </div>
      </form>
    </div>
  )
}
