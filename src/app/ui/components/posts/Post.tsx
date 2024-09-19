import React from 'react'
import Link from 'next/link'

interface Props {
  id: string
  title: string
  content: string
  date: string
}

export default function Post({ id, title, content, date }: Props): JSX.Element {
  return (
    <div key={id} className='border border-gray-200 p-4 my-4'>
      <Link href={`/blog/post/${id}`}>
        <h2 className='font-semibold text-lg'>{title}</h2>
      </Link>
      <p className='text-gray-500'>{date}</p>
      <p>{content}</p>
    </div>
  )
}
