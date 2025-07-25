import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setCategory } from '../utils/categorySlice';

const Button = ({ name, categoryId }) => {
  const dispatch = useDispatch();
  const selectedCategory = useSelector((state) => state.category.selectedCategory);

  const handleClick = () => {
    dispatch(setCategory({ name, categoryId }));
  };

  return (
    <button
      className={`px-4 py-1 font-medium rounded-lg whitespace-nowrap
        ${selectedCategory.name === name
          ? 'bg-black text-white dark:bg-white dark:text-black'
          : 'bg-gray-200 text-black dark:bg-gray-700 dark:text-white'}
        hover:bg-white hover:text-black dark:hover:bg-gray-600 dark:hover:text-white transition-all duration-200`}
      onClick={handleClick}
    >
      {name}
    </button>
  );
};

export default Button;
