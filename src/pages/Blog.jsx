import React from 'react';

const blogs = [
  {
    title: 'Master Shipping Route Optimization',
    date: 'January 10, 2025',
    description:
      'Take control of your logistics! Learn actionable strategies to optimize routes and boost efficiency.',
    image: '/image/blog1.jpg',
  },
  {
    title: 'AI & Automation: The Next Era of Logistics',
    date: 'March 25, 2025',
    description:
      'Explore how AI and automation are reshaping supply chains and creating smarter logistics solutions.',
    image: '/image/manufacturing.jpeg',
  },
  {
    title: 'Sustainable Logistics Practices',
    date: 'May 5, 2025',
    description:
      'Discover eco-friendly logistics strategies that reduce carbon footprints and promote sustainability.',
    image: '/image/blog3.jpeg',
  },
];

const Blog = () => {
  return (
    <div className="min-h-screen bg-gray-100 py-14 px-4 md:px-12 lg:px-24">
      {/* Heading */}
      <h2 className="text-4xl font-bold text-center text-red-800 mb-10">
        Our <span className="text-yellow-500">Blogs</span>
      </h2>

      {/* Blog Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        {blogs.map((blog, index) => (
          <div
            key={index}
            className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
          >
            {/* Image */}
            <img
              src={blog.image}
              alt={blog.title}
              className="w-full h-70 object-cover"
            />

            {/* Text Content */}
            <div className="p-5 space-y-2">
              <p className="text-sm text-gray-500">{blog.date}</p>
              <h3 className="text-xl font-semibold text-gray-800">
                {blog.title}
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                {blog.description}
              </p>

            
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Blog;
