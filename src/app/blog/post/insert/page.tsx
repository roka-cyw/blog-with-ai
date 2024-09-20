'use client'

import React, { useState, useEffect } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { useRouter } from 'next/navigation'
import { getSession } from 'next-auth/react'

import { User } from '../../../lib/definition'

export default function Page() {
  const router = useRouter()
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
      `/api/posts?id=${uuid}&title=${formData.title}&author=${user?.name}&content=${formData.content}&date=${formData.date}`,
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

  useEffect(() => {
    getSession().then(session => setUser(session?.user || null))
  }, [])

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
            value={formData.content}
            onChange={handleChange}
            className='w-full border-2 border-sky-100 p-2 rounded-md focus:border-sky-200 focus:outline-none'
          ></textarea>
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
