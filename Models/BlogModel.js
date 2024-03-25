const BlogSchema = require("../Schemas/BlogSchema");
const { LIMIT } = require("../privateConstants");
const ObjectId = require("mongodb").ObjectId;

const createBlog = ({ title, textBody, creationDateTime, userId }) => {
  return new Promise(async (resolve, reject) => {
    const blogObj = new BlogSchema({
      title,
      textBody,
      creationDateTime,
      userId,
    });
    try {
      const blogDb = await blogObj.save();
      resolve(blogDb);
    } catch (err) {
      reject(err);
    }
  });
};

const getAllBlogs = ({ SKIP }) => {
  return new Promise(async (resolve, reject) => {
    try {
      const blogDb = await BlogSchema.aggregate([
        {
          $sort: { creationDateTime: -1 }, // Descending
        },
        {
          $facet: {
            data: [
              {
                $skip: SKIP,
              },
              {
                $limit: LIMIT,
              },
            ],
          },
        },
      ]);
      resolve(blogDb[0].data);
    } catch (err) {
      reject(err);
    }
  });
};

const getMyBlogs = ({ SKIP, userId }) => {
  return new Promise(async (resolve, reject) => {
    try {
      const blogDb = await BlogSchema.aggregate([
        {
          $match: { userId },
        },
        {
          $sort: { creationDateTime: -1 }, // Descending
        },
        {
          $facet: {
            data: [
              {
                $skip: SKIP,
              },
              {
                $limit: LIMIT,
              },
            ],
          },
        },
      ]);
      resolve(blogDb[0].data);
    } catch (err) {
      reject(err);
    }
  });
};

const getBlogWithId = ({ blogId }) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!ObjectId.isValid(blogId)) {
        reject("Invalid Blog ID format");
      }
      const blogDb = await BlogSchema.findOne({ _id: blogId });
      if (!blogDb) {
        reject("Blog does not exist for the given Blog ID");
      }
      resolve(blogDb);
    } catch (err) {
      reject(err);
    }
  });
};

const updateBlog = ({title, textBody, blogId}) =>{
  return new Promise(async(resolve, reject) =>{
    let newBlogData = {};
    newBlogData.title = title;
    newBlogData.textBody = textBody;
    try{
      const prevBlog = await BlogSchema.findOneAndUpdate({_id: blogId}, newBlogData);
      resolve(prevBlog);
    }
    catch(err){
      reject(err);
    }
  })
}

const deleteBlog = ({blogId}) =>{
  return new Promise(async(resolve, reject) =>{
    try{
      const deletedBlog = await BlogSchema.findOneAndDelete({_id: blogId});
      resolve(deleteBlog);
    }
    catch(err){
      reject(err);
    }
  })
}

module.exports = { createBlog, getAllBlogs, getMyBlogs, getBlogWithId, updateBlog, deleteBlog };
