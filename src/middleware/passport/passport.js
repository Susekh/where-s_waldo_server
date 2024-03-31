import passport from "passport";
import LocalStrategy from "passport-local"
import userModel from "../../models/user.model.js"
import { bcrypt } from "../../controller/auth.controller.js";


passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await userModel.findOne({ username: username });
        if (!user) {
          return done(null, false, { message: "Incorrect username" });
        }
        const match = await bcrypt.compare(password, user.password);
        if (!match) {
          // passwords do not match!
          return done(null, false, { message: "Incorrect password" })
        }
        return done(null, user);
      } catch(err) {
        return done(err);
      }
    })
  );
  
  
  passport.serializeUser((user, done) => {
    done(null, user._id);
  });
  
  passport.deserializeUser(async (_id, done) => {
    try {
      const user = await userModel.findById(_id);
      done(null, user);
    } catch(err) {
      done(err);
    }
  });




  export default passport