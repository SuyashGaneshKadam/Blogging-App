const validateEmail = (email) => {
    return String(email)
      .toLowerCase()
      .match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      );
  };
  
  const validateRegisterData = ({ name, email, username, password }) => {
    return new Promise((resolve, reject) => {
      if (!name.trim() || !email.trim() || !username.trim() || !password.trim()) {
        reject("Missing user data");
      }
  
      if (typeof email !== "string") reject("Email is not a text");
      if (typeof password !== "string") reject("Password is not a text");
      if (typeof username !== "string") reject("Username is not a text");
      if (typeof name !== "string") reject("Name is not a text");
  
      if (username.length < 3 || username.length > 50)
        reject("Username length should be 3-50 characters");
  
      if (!validateEmail(email)) reject("Email format is incorrect");
      resolve();
    });
  };
  
  module.exports = { validateRegisterData };