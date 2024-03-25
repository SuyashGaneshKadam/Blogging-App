const express = require("express");
const { BlogDataValidate } = require("../Utils/BlogUtil");
const {
  createBlog,
  getAllBlogs,
  getMyBlogs,
  getBlogWithId,
  updateBlog,
  deleteBlog,
} = require("../Models/BlogModel");
const User = require("../Models/UserModel");
const rateLimiting = require("../Middlewares/RateLimiting");

const BlogRouter = express.Router();

BlogRouter.post("/create-blog", rateLimiting, async (req, res) => {
  const { title, textBody } = req.body;
  const userId = req.session.user.userId;
  const creationDateTime = Date.now();
  //   console.log(title, textBody, userId, creationDateTime);

  //   Data Validation
  try {
    await BlogDataValidate(req.body);
  } catch (err) {
    return res.send({
      status: 400,
      err,
    });
  }

  //   Saving Blog
  try {
    const userDb = await createBlog({
      title,
      textBody,
      userId,
      creationDateTime,
    });
    return res.send({
      status: 201,
      message: "Blog created successfully",
      data: userDb,
    });
  } catch (err) {
    return res.send({
      status: 500,
      message: "Database error",
      err,
    });
  }
});

BlogRouter.get("/get-blogs", async (req, res) => {
  const SKIP = parseInt(req.query.skip) || 0;

  try {
    const allBlogs = await getAllBlogs({ SKIP });
    if (allBlogs.length === 0) {
      return res.send({
        status: 404,
        message: SKIP === 0 ? "No Blogs found" : "No more blogs",
      });
    }
    return res.send({
      status: 200,
      message: "Read success",
      data: allBlogs,
    });
  } catch (err) {
    return res.send({
      status: 500,
      message: "Database error",
      err,
    });
  }
});

BlogRouter.get("/my-blogs", async (req, res) => {
  const SKIP = parseInt(req.query.skip) || 0;
  const userId = req.session.user.userId;
  // console.log(SKIP, userId);

  try {
    const myBlogs = await getMyBlogs({ SKIP, userId });
    if (myBlogs.length === 0) {
      return res.send({
        status: 400,
        message: SKIP === 0 ? "No Blogs found" : "No more blogs",
      });
    }
    return res.send({
      status: 200,
      message: "Read success",
      data: myBlogs,
    });
  } catch (err) {
    // console.log(error);
    return res.send({
      status: 500,
      message: "Database error",
      err,
    });
  }
});

BlogRouter.post("/edit-blog", async (req, res) => {
  // (1)Data Validation (2)Verify User ID (3)Find Blog (4)Compare ownership (5)Check time if > 30mins (6)Edit the Blog
  const { title, textBody } = req.body.data;
  const blogId = req.body.blogId;
  const { userId } = req.session.user;
  //   console.log(title, textBody, blogId, userId);

  try {
    // 1. Data Validation
    await BlogDataValidate({ title, textBody });

    // 2. Verify User ID
    await User.verifyUserId({ userId });
  } catch (err) {
    return res.send({
      status: 400,
      message: "Data error",
      err,
    });
  }

  try {
    // 3. Find Blog
    const blogDb = await getBlogWithId({ blogId });
    // console.log(blogDb);

    // 4. Compare ownership
    if (!userId.equals(blogDb.userId)) {
      return res.send({
        status: 403,
        message: "You are not authorized to edit this blog",
      });
    }

    // 5. Check if 30mins have passed after creating the blog
    const diff = (Date.now() - blogDb.creationDateTime) / (1000 * 60);
    if (diff > 30) {
      return res.send({
        status: 400,
        message: "Blogs cannot be edited after 30 minutes of creation",
      });
    }

    // 6. Edit the Blog
    const prevBlog = await updateBlog({ title, textBody, blogId });
    return res.send({
      status: 200,
      message: "Blog updated successfully",
      data: prevBlog,
    });
  } catch (err) {
    return res.send({
      status: 500,
      message: "Database error",
      err,
    });
  }
});

BlogRouter.post("/delete-blog", async (req, res) => {
  const { blogId } = req.body;
  const { userId } = req.session.user;
  // console.log(blogId, userId);

  // 1. Blog ID validation
  if (!blogId.trim()) {
    return res.send({
      status: 400,
      message: "Missing Blog ID",
    });
  }

  // 2. Verifying user
  try {
    await User.verifyUserId({ userId });
  } catch (err) {
    return res.send({
      status: 400,
      err,
    });
  }

  try {
    // 3. Find blog
    const blogDb = await getBlogWithId({ blogId });

    // 4. Check ownership
    if (!userId.equals(blogDb.userId)) {
      return res.send({
        status: 403,
        message: "You are not authorized to delete this blog",
      });
    }

    // 5. Delete blog
    const deletedBlog = await deleteBlog({blogId});
    return res.send({
        status: 200,
        message: "Blog deleted successfully",
        data: deletedBlog
    })
  } catch (err) {
    return res.send({
      status: 500,
      message: "Database error",
      err,
    });
  }
});

module.exports = BlogRouter;
