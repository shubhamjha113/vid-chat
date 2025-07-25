import React from "react";

const commentsData = [
  {
    name: "Aarav",
    text: "This video is 🔥🔥🔥",
    replies: [],
  },
  {
    name: "Riya",
    text: "Wow! Learned something new today 😍",
    replies: [
      {
        name: "Kabir",
        text: "Totally agree with you!",
        replies: [],
      },
      {
        name: "Sneha",
        text: "I thought I was the only one who noticed that 😅",
        replies: [
          {
            name: "Yash",
            text: "Happens to me every time lol 😂",
            replies: [
              {
                name: "Tanya",
                text: "Same here! Replay button is broken 🔁",
                replies: [
                  {
                    name: "Dev",
                    text: "Came here from Instagram, anyone else? 🤔",
                    replies: [
                      {
                        name: "Diya",
                        text: "Yes! Insta reels brought me here 💃",
                        replies: [],
                      },
                    ],
                  },
                  {
                    name: "Rohan",
                    text: "This deserves way more views 💯",
                    replies: [],
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
  {
    name: "Kavya",
    text: "Such a wholesome moment 😊",
    replies: [],
  },
  {
    name: "Aditya",
    text: "Back here for the 3rd time today 😂",
    replies: [],
  },
  {
    name: "Meera",
    text: "Why isn’t this viral yet? 👀",
    replies: [],
  },
  {
    name: "Shaurya",
    text: "This needs to be in trending!",
    replies: [],
  },
];


const Comment = ({ data }) => {
  const { name, text } = data;
  return (
    <div className="flex shadow-sm bg-gray-100 dark:bg-gray-800 p-2 rounded-lg my-2">
      <img
        className="w-12 h-12"
        alt="user"
        src={`https://ui-avatars.com/api/?name=${name}&background=random&rounded=true`}
      />
      <div className="px-3">
        <p className="font-bold">{name}</p>
        <p>{text}</p>
      </div>
    </div>
  );
};

const CommentsList = ({ comments }) => {
  // Disclaimer: Don't use indexes as keys
  return comments.map((comment, index) => (
    <div key={index}>
      <Comment data={comment} />
      <div className="pl-5 border-l-2 border-black dark:border-gray-500 ml-5">
        <CommentsList comments={comment.replies} />
      </div>
    </div>
  ));
};

const CommentsContainer = () => {
  return (
    <div className="m-5 p-2 bg-white dark:bg-gray-900 text-black dark:text-white rounded-lg">
      <h1 className="text-2xl font-bold">Comments: </h1>
      <CommentsList comments={commentsData} />
    </div>
  );
};

export default CommentsContainer;
