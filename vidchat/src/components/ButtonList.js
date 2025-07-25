import React from 'react'
import Button from './Button'


const categories = [
  { name: 'All', categoryId: null },
  { name: 'Film & Animation', categoryId: '1' },
  { name: 'Pets & Animals', categoryId: '15' },
  { name: 'Sports', categoryId: '17' },
  { name: 'Gaming', categoryId: '20' },
  { name: 'People & Blogs', categoryId: '22' },
  { name: 'Comedy', categoryId: '23' },
  { name: 'Entertainment', categoryId: '24' },
  { name: 'News & Politics', categoryId: '25' },
  { name: 'Howto & Style', categoryId: '26' },
];
const ButtonList = () => {
  return (
    <div className="fixed top-20 left-0 right-0 z-40 flex overflow-x-auto space-x-2 p-2 bg-white dark:bg-gray-800 ml-48 ">
       {categories.map((cat, index) => (
        <Button key={index} name={cat.name} categoryId={cat.categoryId} />
      ))}
    </div>
  )
}

export default ButtonList
