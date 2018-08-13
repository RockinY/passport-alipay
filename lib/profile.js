/**
 * Parse profile.
 *
 * @param {Object|String} json
 * @return {Object}
 * @api private
 */
exports.parse = function(json) {
  if ('string' == typeof json) {
    json = JSON.parse(json);
  }
  
  var profile = {};
  profile.id = String(json.user_id);
  profile.displayName = json.nick_name;
  profile.avatar = json.avatar;
  profile.photos = [{ value: json.avatar }];
  return profile;
};