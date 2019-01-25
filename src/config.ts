const isProd = process.env.NODE_ENV === 'production';
const Config = {
  isProd,
  host: `${isProd ? 'https://test' : 'http://test.frp'}.noonme.com`,
  port: 3000,
  cookie: 'test_G$1fjgEXFf4ITw9',
  session: {
    name: 'metestizu',
    secret: 'test_xHdd_FEd1233wXw',
    resave: false,
    saveUninitialized: false,
  },
};

export default Config;
