# passport-alipay2

蚂蚁开放平台现在只支持RSA2的签名方式，新版本对此进行了相应升级。

### Getting Start

#### Configuration

Be careful that you should use private ky begin with `-----BEGIN PRIVATE KEY-----` and public key begin with `-----BEGIN PUBLIC KEY-----`.
Which is pkcs8 standard.

```bash
ALIPAY_OAUTH_CLIENT_ID=2018XXXXXXXXXX2
ALIPAY_OAUTH_PRIVATE_KEY='-----BEGIN PRIVATE KEY-----
MIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQDvgQ24ZGISAyKZ
...
XXXX
XXXX
...
zHtJiyvYntukp0tB5PWQWiMtCfoEyKUUbp1YrUPofG4yYd3BDApv2Rn7dhQCtbgH
xw0S4cX/BvgxXYmc+KKxXA==
-----END PRIVATE KEY-----'
ALIPAY_OAUTH_PUBLIC_KEY='-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA74ENuGRiEgMimWqCVOZq
...
XXXX
XXXX
...
yQIDAQAB
-----END PUBLIC KEY-----'
```

#### Use your strategy

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
