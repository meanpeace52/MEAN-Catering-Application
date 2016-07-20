'use strict';

// Production specific configuration
// =================================
module.exports = {
  // Server IP
  ip:     process.env.OPENSHIFT_NODEJS_IP ||
          process.env.IP ||
          undefined,

  // Server port
  port:   process.env.OPENSHIFT_NODEJS_PORT ||
          process.env.PORT ||
          8080,

  // MongoDB connection options
  mongo: {
    uri:  process.env.MONGODB_URI ||
          process.env.MONGOHQ_URL ||
          process.env.OPENSHIFT_MONGODB_DB_URL +
          process.env.OPENSHIFT_APP_NAME ||
          'mongodb://localhost/catering'
  },

  mailgun: {
    api_key: 'key-11f4fceec484b3d96fbd07dd91b9ff58',
    domain: 'mg.cateringninja.com',
    from: 'catering@cateringninja.com'
  },

  payments: {
    DWOLLA: {
      KEY: process.env.DWOLLA_KEY,
      SECRET: process.env.DWOLLA_SECRET,
      ACCOUNT_ID: process.env.DWOLLA_ACCOUNT_ID,
      ACCESS_TOKEN: process.env.DWOLLA_ACCESS_TOKEN
    },
    STRIPE: {
      SECRET_KEY: process.env.STRIPE_SECRET_KEY,
      PUBLIC_KEY: process.env.STRIPE_PUBLIC_KEY
    }
  }
};
