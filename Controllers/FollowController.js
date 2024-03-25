const express = require("express");
const User = require("../Models/UserModel");
const {
  followUser,
  getFollowingUsersList,
  getFollowerUsersList,
  unfollowUser,
} = require("../Models/FollowModel");
const FollowRouter = express.Router();

FollowRouter.post("/follow-user", async (req, res) => {
  const followerUserId = req.session.user.userId;
  const { followingUserId } = req.body;
  // console.log(followerUserId, followingUserId);

  if (followerUserId.toString() === followingUserId.toString()) {
    return res.send({
      status: 400,
      message: "You cannot follow yourself",
    });
  }

  try {
    await User.verifyUserId({ userId: followerUserId });
  } catch (error) {
    return res.send({
      status: 400,
      message: "Follower User id not found",
    });
  }

  try {
    await User.verifyUserId({ userId: followingUserId });
  } catch (error) {
    return res.send({
      status: 400,
      message: "Following User id not found",
    });
  }

  try {
    const followDb = await followUser({ followerUserId, followingUserId });
    return res.send({
      status: 200,
      message: "Followed successfully",
      data: followDb,
    });
  } catch (err) {
    return res.send({
      status: 500,
      message: "Database error",
      err,
    });
  }
});

FollowRouter.get("/following-list", async (req, res) => {
  const followerUserId = req.session.user.userId;
  const SKIP = parseInt(req.query.skip) || 0;

  try {
    await User.verifyUserId({ userId: followerUserId });
  } catch (err) {
    return res.send({
      status: 404,
      message: "User not found",
      err,
    });
  }

  try {
    const followingUsersList = await getFollowingUsersList({
      followerUserId,
      SKIP,
    });
    return res.send({
      status: 200,
      message: "List retrieved successfully",
      data: followingUsersList,
    });
  } catch (err) {
    console.log(err);
    return res.send({
      status: 500,
      message: "Database error",
      err,
    });
  }
});

FollowRouter.get("/follower-list", async (req, res) => {
  const followingUserId = req.session.user.userId;
  const SKIP = Number(req.query.skip) || 0;

  try {
    User.verifyUserId({ userId: followingUserId });
  } catch (err) {
    return res.send({
      status: 400,
      message: "User not found",
      err,
    });
  }

  try {
    const followerUsersList = await getFollowerUsersList({
      followingUserId,
      SKIP,
    });
    return res.send({
      status: 200,
      message: "Followers list retrieved successfully",
      data: followerUsersList,
    });
  } catch (err) {
    return res.send({
      status: 500,
      message: "Database Error",
      err,
    });
  }
  res.send("Working");
});

FollowRouter.post("/unfollow-user", async (req, res) => {
  const followerUserId = req.session.user.userId;
  const { followingUserId } = req.body;
  // console.log(followerUserId, followingUserId);

  if (followerUserId.toString() === followingUserId.toString()) {
    return res.send({
      status: 400,
      message: "You cannot unfollow yourself",
    });
  }

  try {
    await User.verifyUserId({ userId: followerUserId });
  } catch (error) {
    return res.send({
      status: 400,
      message: "Follower User id not found",
    });
  }

  try {
    await User.verifyUserId({ userId: followingUserId });
  } catch (error) {
    return res.send({
      status: 400,
      message: "Following User id not found",
    });
  }

  try {
    const deletedData = await unfollowUser({ followerUserId, followingUserId });
    return res.send({
      status: 200,
      message: "Unfollowed successfully",
      data: deletedData,
    });
  } catch (err) {
    return res.send({
      status: 500,
      message: "Database Error",
      err,
    });
  }

  res.send("Working");
});

module.exports = FollowRouter;

// Follows
// test   -->  test1, test2, test3, test4(Unfollowed)
// test1  -->  test2, test3, test4
// test2  -->  test3, test4
// test3  -->  test4
// test4  -->  test
