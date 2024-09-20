import Link from 'next/link'

import { Button } from '@/app/ui/components/button'
import Post from '@/app/ui/components/posts/Post'
import { connectToDB, getPosts } from '@/app/lib/data'
import { auth } from '../../../../auth.config'

export default async function Page() {
  const client = await connectToDB()
  const posts = await getPosts()
  const session = await auth()

  return (
    <>
      {client && <p className='text-sky-500'>Connected to database</p>}

      {session?.user && (
        <Link href='/blog/post/insert'>
          <Button className='outline outline-1  border-sky-700 text-sky-700 hover:bg-sky-700 hover:text-white my-5 py-2 px-4 rounded'>
            New +
          </Button>
        </Link>
      )}

      <h1>Posts</h1>
      {posts?.map(post => (
        <Post key={post.id} {...post} />
      ))}
    </>
  )
}
