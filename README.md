# passport-alipay2

蚂蚁开放平台现在只支持RSA2的签名方式，新版本对此进行了相应升级。

## Getting Start

### Configuration

Be careful that you should use private ky begin with `-----BEGIN PRIVATE KEY-----` and public key begin with `-----BEGIN PUBLIC KEY-----`.
Which is pkcs8 standard.

```js
// You if have problem with env config, make sure your final env looks like the following
❯ node
> require('dotenv').config()
> process.env.ALIPAY_OAUTH_PUBLIC_KEY.replace(/\\n/g, "\n")

'-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9 ... PfRncH/Hf\nyQIDAQAB\n-----END PUBLIC KEY-----'
```

### Use your strategy

```js
passport.use(
  new AlipayStrategy(
    {
      app_id: process.env.ALIPAY_OAUTH_CLIENT_ID,
      alipay_public_key: process.env.ALIPAY_OAUTH_PUBLIC_KEY,
      private_key: process.env.ALIPAY_OAUTH_PRIVATE_KEY,
      callbackURL: `${baseUrl}/auth/alipay/callback`,
      scope: 'auth_user',
      passReqToCallback: true
    },
    async (req, accessToken, refreshToken, profile, done) => {
      // Do your job here
    }
  )
)
```

### The profile sample

```js
{
  id: 1,
  displayName: 'Yunshe',
  avatar: 'http://test.avatar',
  _json: {
    "code": "10000",
    "msg": "Success",
    "user_id": "2088102104794936",
    "avatar": "http://tfsimg.alipay.com/images/partner/T1uIxXXbpXXXXXXXX",
    "user_type": "1",
    "user_status": "T",
    "is_certified": "T",
    "province": "安徽省",
    "city": "安庆",
    "nick_name": "支付宝小二",
    "is_student_certified": "T",
    "gender": "F"
  }
}
```
