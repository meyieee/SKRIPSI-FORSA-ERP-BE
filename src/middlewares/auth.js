const isLogin = (req, res, next) => {

    console.log("req.session:",req.session)
    if (req.session.user == null || req.session.user == undefined) {
        console.log("there is no user in this session");
    } else {
      next();
    }
  }

module.exports = isLogin;
