// Hàm trích xuất cookie generic
const cookieExtractor = (req, cookieName) => {
  let token = null;
  if (req && req.cookies) {
    token = req.cookies[cookieName];
  }
  return token;
};

module.exports = cookieExtractor;
