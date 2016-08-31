let config = require('../../config/environment');
let Promise = require('bluebird');
let request = require('request-promise');
let mongoose = require('mongoose');

class PaymentsStatisticsController {



  summary(req, res) {
    console.log('REQUEST', req.body);
    let isCaterer = !!req.body.catererId;

    let query = {
      status: 'completed',
      paymentStatus: 'completed'
    };

    console.log('QUERY', query);

    return mongoose.model('Event').aggregate([
      {
        $match: query
      },
      {
        $group: {
          _id: '$datePaid',
          events: {
            $addToSet: '$_id'
          },
          date: {
            $first: '$datePaid'
          }
        }
      }
    ]).exec().then((list) => {

      let promises = [];

      list.forEach((item, index) => {
        let query = {
          eventId: {
            $in: item.events
          }
        };
        if (isCaterer) {
          query.catererId = req.body.catererId;
        };

        promises.push(mongoose.model('Offer').find(query).then((offers) => {
          list[index].summary = 0;
          offers.forEach((offer) => {
            list[index].summary += (((offer.invoice.service + offer.invoice.tax) * (100 - offer.invoice.commission)/100) - offer.invoice.adjustment.client) || 0;
          });
        }));

      });

      return Promise.all(promises).then(() => list.filter(item => item.summary > 0));
    })
      .then(respondWithResult(res))
      .catch(handleError(res));
  }

}

function respondWithResult(res, statusCode) {
  statusCode = statusCode || 200;
  return function(entity) {
    if (entity) {
      console.log('Entity', entity);
      res.status(statusCode).json(entity);
    }
  };
}

function handleError(res, statusCode) {
  statusCode = statusCode || 500;
  return function(err) {
    res.status(statusCode).send(err);
  };
}

module.exports = new PaymentsStatisticsController();
