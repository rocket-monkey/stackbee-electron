import jwt from 'jsonwebtoken';
import User from '../../../../shared/db/schema/user';
import config from '../../../../internals/config';

export const authenticate = (req, res) => {

  // find the user
  User.findOne({
    name: req.body.name
  }, (err, user) => {

    if (err) throw err;

    if (!user) {
      res.json({ success: false, message: 'Authentication failed. User not found.' });
    } else if (user) {

      // check if password matches
      user.authenticate(req.body.password, (authRes) => {
        if (!authRes) {
          res.json({ success: false, message: 'Authentication failed. Wrong password.' });
        } else {

          // if user is found and password is right
          // create a token
          var token = jwt.sign({
            name: user.name,
            email: user.email,
            roles: user.roles,
          }, config.secret, {
            expiresIn: 60*60*24 // expires in 24 hours
          });

          // return the information including token as JSON
          res.json({
            success: true,
            message: 'Enjoy your token!',
            token: token
          });
        }
      });

    }

  });
}