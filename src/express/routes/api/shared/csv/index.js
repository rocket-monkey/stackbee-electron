import {
  saveEntries,
} from './utils';

const userIsKnown = (user) => {
  if (!user.email || user.email === null || user.email === '') {
    return false;
  }

  if (!user.emailVerified) {
    return false;
  }

  // TODO: check if the user has bought the module for that!

  return true;
};

export default (req, res, next) => {
  if (req.decoded.email !== 'admin@stackbee.io') {
    return res.status(403).send({
      success: false,
      message: 'Only stackbee.io admin can access this route!'
    });
  }

  let success = true;
  const user = req.body.user;
  const entries = req.body.entries;
  const itemsCount = entries.length;

  // check if we know the user
  if (userIsKnown(user)) {
    // save the entries to our mongodb!
    try {
      while (entries.length > 0) {
        saveEntries(entries);
      }
      console.log(`Successfully processed ${itemsCount} items for csv-post!`);
      res.send({
        success: true,
        itemsCount,
      });
    } catch (err) {
      res.send({ success: false, reason: err });
    }
  } else {
    console.error('Unkown user tried to "post-csv"!', user);
    res.send({ success: false, reason: 'unknown user' });
  }
};

