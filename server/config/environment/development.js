'use strict';

// Development specific configuration
// ==================================
module.exports = {
  //domain: 'http://localhost:8080/',
  domain: 'http://dev.cateringninja.com:8080/',

  // MongoDB connection options
  mongo: {
    //uri: 'mongodb://localhost/catering'
    uri: 'mongodb://ninja_root:ninja3141@130.211.148.121:27017/catering'
  },

  // Seed database on startup
  seedDB: false,

  mailgun: {
    api_key: 'key-11f4fceec484b3d96fbd07dd91b9ff58',
    domain: 'mg.cateringninja.com',
    from: 'catering@cateringninja.com'
  },

  payments: {
    TAXCLOUD: {
      API_LOGIN_ID: '36DF64D0',
      API_KEY: 'E1A33450-A519-4379-8FF8-CBA269A17640'
    },
    DWOLLA: {
      //local
      /*KEY: 'uGQTHG1Yp1dvagz9yejNwGXMbzsQ0mfHfNpF7CPqY9QA7W48Ot',
      SECRET: 'YxmlcmAXhCOn4utGrQMZMfK8X1SoxSVUBODDJWOTIuhtkIMV5a',
      ACCOUNT_ID: 'f8615f27-0783-4078-97db-d8d7ce3ae368',
      ACCESS_TOKEN: '0IDUpXJtXo21YYJueOd45HzZ2FvrVBF3xE1zyTmTRXP3nG4QkW',
      REFRESH_TOKEN: 'BtL6PAAtC5v26KtYHMpOK9VSqdSYsSV5oL7awWmsiOVBcbZ7fD'  */
      //dev
      KEY: '2jKQn8aERXipDkCuNYG8TKMKPqpGB4KjuK1Gevrw74ZITIK6Ew',
      SECRET: 'tWsvZmICKSRpbGbO0WWRKBVXb4B03j35XpI5ifrP1LJJJ5HExy',
      ACCOUNT_ID: 'f8615f27-0783-4078-97db-d8d7ce3ae368', //eabd60f1-8fbc-4ed9-b09a-b213bdc9d092
      ACCESS_TOKEN: 'ZT23sJndZj9OHRME4pm6qAZXkNWonkBfgdZvmAVS4glfkhJJ91',
      REFRESH_TOKEN: 'QNE9juhsyxEOYV9LyMM5OuxAWQIHmcxm6jlt8Eo5fiMxjXJiOw'
    },
    STRIPE: {
      SECRET_KEY: 'sk_test_FgAfCdq6QKhuGwWsHuk0yz7h',
      PUBLIC_KEY: 'pk_test_sPCubetxhsItqcr1nkZOHQfM'
    }
  }

};
