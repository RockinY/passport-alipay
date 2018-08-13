'use strict';

var crypto = require('crypto');
var moment = require('moment');

var iconv = require('iconv-lite');
var request = require('request');

var Promise = require('bluebird');
var NodeRSA = require('node-rsa');

var ALIPAY_GATEWAY = 'https://openapi.alipay.com/gateway.do';

function createPromiseCallback() {
    var cb;
    var promise = new Promise(function (resolve, reject) {
        cb = function (err, data) {
            if (err) return reject(err);
            return resolve(data);
        };
    });
    cb.promise = promise;
    return cb;
};

// 除去数组中的空值和签名参数
var paramsFilter = function (params) {
    var result = {};
    if (!params) {
        return result;
    }
    for (var k in params) {
        if (!params[k] || params[k] === '' || k === 'sign') {
            continue;
        }
        result[k] = params[k];
    }
    return result;
};

// 将所有参数按照“参数=参数值”的模式用“&”字符拼接成字符串
var toQueryString = function (params) {
    var result = '';
    var sortKeys = Object.keys(params).sort();
    for (var i in sortKeys) {
        result += sortKeys[i] + '=' + params[sortKeys[i]] + '&';
    }
    if (result.length > 0) {
        return result.slice(0, -1);
    } else {
        return result;
    }
};

var Alipay = function (options) {
    this._options = options;
    return this;
};

Alipay.prototype._encryptedParams = function (params) {
    var qs = toQueryString(paramsFilter(params));
    var key = new NodeRSA(this._options.alipay_public_key, {
        encryptionScheme: 'pkcs8'
    });
    var encrypted = key.encrypt(qs, 'base64');
    return encrypted;
};

Alipay.prototype._decryptedParams = function (toDecrypt) {
    var key = new NodeRSA(this._options.private_key, {
        encryptionScheme: 'pkcs8'
    });
    var decrypted = key.decrypt(toDecrypt, 'utf8');
    return decrypted;
};

Alipay.prototype._generateSign = function (params) {
    var qs = toQueryString(paramsFilter(params));
    var signed = crypto.createSign('RSA-SHA256').update(new Buffer(qs, 'utf8')).sign(this._options.private_key, 'base64');
    return signed;
};

Alipay.prototype._verifySign = function (params, signature) {
    var qs = toQueryString(paramsFilter(params));
    var verified = crypto.createVerify('RSA-SHA256').update(new Buffer(qs, 'utf8')).verify(this._options.alipay_public_key, signature, 'base64');
    return verified;
};

Alipay.prototype.getAccessToken = function (code, cb) {
    cb = cb || createPromiseCallback();

    var self = this;

    var params = {
        app_id: self._options.app_id,
        method: 'alipay.system.oauth.token',
        format: 'JSON',
        charset: 'gbk',
        sign_type: 'RSA2',
        timestamp: moment().format('YYYY-MM-DD HH:mm:ss'),
        version: '1.0',
        grant_type: 'authorization_code',
        code: code
    };
    params.sign = self._generateSign(params);

    request({
        url: ALIPAY_GATEWAY,
        method: 'POST',
        form: params,
        encoding: null
    }, function (err, response, body) {
        if (err) {
            cb(err)
        } else {
            var data = JSON.parse(iconv.decode(body, 'GBK'));
			
            if (data.error_response) {
                cb(new Error(data.error_response.msg));
            } else {
                cb(null, data.alipay_system_oauth_token_response || {});
            }
        }
    });

    return cb.promise;
};

Alipay.prototype.getUser = function (token, cb) {
    cb = cb || createPromiseCallback();

    var self = this;

    var params = {
        app_id: self._options.app_id,
        method: 'alipay.user.info.share',
        format: 'JSON',
        charset: 'gbk',
        sign_type: 'RSA2',
        timestamp: moment().format('YYYY-MM-DD HH:mm:ss'),
        version: '1.0',
        auth_token: token
    };
    params.sign = self._generateSign(params);

    request({
        url: ALIPAY_GATEWAY,
        method: 'POST',
        form: params,
        encoding: null
    }, function (err, response, body) {
        if (err) {
            cb(err)
        } else {
            var data = JSON.parse(iconv.decode(body, 'GBK'));
			
            if (data.error_response) {
                cb(new Error(data.error_response.msg));
            } else {
                cb(null, data.alipay_user_info_share_response || {});
            }
        }
    });

    return cb.promise;
};

module.exports = Alipay;
