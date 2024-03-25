const FollowSchema = require("../Schemas/FollowSchema");
const UserSchema = require("../Schemas/UserSchema");
const { LIMIT } = require("../privateConstants");

const followUser = ({ followerUserId, followingUserId }) => {
  return new Promise(async (resolve, reject) => {
    try {
      const followExists = await FollowSchema.findOne({
        followerUserId,
        followingUserId,
      });
      if (followExists) {
        reject("You are already following the user");
      }
      const followObj = new FollowSchema({
        followerUserId,
        followingUserId,
        creationDateTime: Date.now(),
      });
      const followDb = await followObj.save();
      resolve(followDb);
    } catch (err) {
      reject(err);
    }
  });
};

const getFollowingUsersList = ({ followerUserId, SKIP }) => {
  return new Promise(async (resolve, reject) => {
    try {
      const followingUsersList = await FollowSchema.aggregate([
        {
          $match: { followerUserId },
        },
        {
          $sort: { creationDateTime: -1 },
        },
        {
          $facet: {
            data: [{ $skip: SKIP }, { $limit: LIMIT }],
          },
        },
      ]);

      //populate the data
      // const followingUserData = await FollowSchema.find({
      //   followerUserId,
      // }).populate("followingUserId");

      const followingUserIdList = followingUsersList[0].data.map(
        (item) => item.followingUserId
      );

      const followingUserDetails = await UserSchema.aggregate([
        {
          $match: {
            _id: {
              $in: followingUserIdList,
            },
          },
        },
      ]);
      resolve(followingUserDetails.reverse());
    } catch (err) {
      reject(err);
    }
  });
};

const getFollowerUsersList = ({ followingUserId, SKIP }) => {
  return new Promise(async (resolve, reject) => {
    try {
      const followersUserList = await FollowSchema.aggregate([
        {
          $match: { followingUserId },
        },
        {
          $sort: { creationDateTime: -1 },
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
      const followerUserIdsList = followersUserList[0].data.map(
        (item) => item.followerUserId
      );

      const followerUserDetails = await UserSchema.aggregate([
        {
          $match: {
            _id: { $in: followerUserIdsList },
          },
        },
      ]);

      resolve(followerUserDetails.reverse());
    } catch (err) {
      reject(err);
    }
  });
};

const unfollowUser = ({ followerUserId, followingUserId }) => {
  return new Promise(async (resolve, reject) => {
    try {
      const deletedData = await FollowSchema.findOneAndDelete({
        followerUserId,
        followingUserId,
      });
      resolve(deletedData);
    } catch (err) {
      reject(err);
    }
  });
};

module.exports = {
  followUser,
  getFollowingUsersList,
  getFollowerUsersList,
  unfollowUser,
};
