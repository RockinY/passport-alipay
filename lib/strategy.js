'use strict';

var util = require('util');
var passport = require('passport-strategy');
var debug = require('debug')('passport-alipay');

var Alipay = require('./alipay');
var JSON = require('json3');

function AlipayStrategy(options, verify) {
    options = options || {};

    if (!verify) {
        throw new TypeError('AlipayStrategy required a verify callback');
    }

    if (typeof verify !== 'function') {
        throw new TypeError('_verify must be function');
    }

    if (!options.app_id || !options.alipay_public_key || !options.private_key) {
        throw new TypeError('AlipayStrategy requires app configurations');
    }

    passport.Strategy.call(this, options, verify);

    this.name = options.name || 'Alipay';

    this._verify = verify;
    this._oauth = new Alipay(options);
    this._app_id = options.app_id;
    this._scope = options.scope || 'auth_user';
    this._state = options.state || 'ALIPAY';
    this._callbackURL = options.callbackURL;
    this._passReqToCallback = options.passReqToCallback;
}

/**
 * Inherit from 'passort.Strategy'
 */
util.inherits(AlipayStrategy, passport.Strategy);

AlipayStrategy.prototype.authenticate = function (req, options) {
    var self = this;

    if (!req._passport) {
        return self.error(new Error('passport.initialize() middleware not in use'));
    }

    options = options || {};

    // 获取auth_code,并校验相关参数的合法性
    if (req.query && req.query.state && !req.query.auth_code) {
        return self.fail(401);
    }

    // 获取auth_code授权成功
    if (req.query && req.query.auth_code) {
        var scope = options.scope || self._scope || 'auth_user';
        var auth_code = req.query.auth_code;
        
        debug('Alipay callback -> \n %s', req.url);

        self._oauth.getAccessToken(auth_code, function (err, params) {
            // 校验完成信息
            function verified(err, user, info) {
                if (err) {
                    return self.error(err);
                }
                if (!user) {
                    return self.fail(info);
                }
                self.success(user, info);
            }

            if (err) {
                return self.error(err);
            }

            debug('fetch accessToken -> \n %s', JSON.stringify(params));

            if (~scope.indexOf('auth_base')) {
                var profile = {
					id: params.user_id,
                    user_id: params.user_id
                };

                try {
                    if (self._passReqToCallback) {
                        self._verify(req, params['access_token'], params['refresh_token'], profile, verified);
                    } else {
                        self._verify(params['access_token'], params['refresh_token'], profile, verified);
                    }
                } catch (ex) {
                    return self.error(ex);
                }
            } else {
                self._oauth.getUser(params['access_token'], function (err, profile) {
                    if (err) {
                        debug('fetch user info by access_token error ->', err.message);
                        return self.error(err);
                    }
					
					profile.id = profile.user_id;

                    debug('fetch user info -> \n %s', JSON.stringify(profile));

                    try {
                        if (self._passReqToCallback) {
                            self._verify(req, params['access_token'], params['refresh_token'], profile, verified);
                        } else {
                            self._verify(params['access_token'], params['refresh_token'], profile, verified);
                        }
                    } catch (ex) {
                        return self.error(ex);
                    }
                });
            }
        });
    } else {
        if (options.failureRedirect) {
            self.redirect(options.failureRedirect, 302);
        } else {
            var app_id = options.app_id || self._app_id;
            var scope = options.scope || self._scope || 'auth_user';
            var state = options.state || self._state || 'ALIPAY';
            var callbackURL = options.callbackURL || self._callbackURL;

            var url = 'https://openauth.alipay.com/oauth2/publicAppAuthorize.htm?app_id=' + app_id + '&scope=' + scope + '&state=' + state + '&redirect_uri=' + encodeURIComponent(callbackURL);
            debug('redirect -> \n%s', url);

            self.redirect(url, 302);
        }   
    }
};

module.exports = AlipayStrategy;
