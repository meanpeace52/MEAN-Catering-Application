'use strict';

// Development specific configuration
// ==================================
module.exports = {

  // MongoDB connection options
  mongo: {
    uri: 'mongodb://localhost/catering'
  },

  // Seed database on startup
  seedDB: true,

  mailgun: {
    api_key: 'key-11f4fceec484b3d96fbd07dd91b9ff58',
    domain: 'mg.cateringninja.com',
    from: 'catering@cateringninja.com'
  },

  payments: {
    DWOLLA: {
      KEY: '2jKQn8aERXipDkCuNYG8TKMKPqpGB4KjuK1Gevrw74ZITIK6Ew',
      SECRET: 'tWsvZmICKSRpbGbO0WWRKBVXb4B03j35XpI5ifrP1LJJJ5HExy',
      ACCOUNT_ID: 'f8615f27-0783-4078-97db-d8d7ce3ae368',
      ACCESS_TOKEN: 'ozXPnlbOePqgiaUKFMOsgBH9xsl2upuOwxCg7C6K6PNgFIzyCt'
    },
    STRIPE: {
      SECRET_KEY: 'sk_test_FgAfCdq6QKhuGwWsHuk0yz7h',
      PUBLIC_KEY: 'pk_test_sPCubetxhsItqcr1nkZOHQfM'
    }
  }

};
