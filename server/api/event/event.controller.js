/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/things              ->  index
 * POST    /api/things              ->  create
 * GET     /api/things/:id          ->  show
 * PUT     /api/things/:id          ->  update
 * DELETE  /api/things/:id          ->  destroy
 */

'use strict';

import _ from 'lodash';
import Event from './event.model';
import Offer from '../offer/offer.model';
import User from '../user/user.model';
var Promise = require('bluebird');
var  mailer = require('../mailer/mailer');

function respondWithResult(res, statusCode) {
  statusCode = statusCode || 200;
  return function(entity) {
    if (entity) {
      res.status(statusCode).json(entity);
    }
  };
}

function saveUpdates(updates) {
  return function(entity) {
    let isBrandNew = (entity.status == 'draft' && updates.status == 'sent');

    for (let key in updates) {
      entity[key] = updates[key];
      delete updates[key];
    }
    var updated = _.mergeWith(entity, updates);
    if (updated.showToCaterers && !isBrandNew) mailer.notifyEvent(updated, 'updated');
    if (isBrandNew) mailer.notifyEvent(updated, 'created');
    return updated.save()
      .then(updated => {
        return updated;
      });
  };
}

function removeEntity(res) {
  return function(entity) {
    if (entity) {
      return entity.remove()
        .then(() => {
          res.status(204).end();
        });
    }
  };
}

function handleEntityNotFound(res) {
  return function(entity) {
    if (!entity) {
      res.status(404).end();
      return null;
    }
    return entity;
  };
}

function handleError(res, statusCode) {
  statusCode = statusCode || 500;
  return function(err) {
    res.status(statusCode).send(err);
  };
}

// Gets a list of Events
export function index(req, res) {
  let query = {};
  if (req.body.userId) {
    query = {userId: req.body.userId}
  } else if (req.body.showToCaterers) {
    query = {showToCaterers: req.body.showToCaterers }
  }
  //else if (req.body.showToCaterers && req.body.sentTo) {
  //  query = {showToCaterers: req.body.showToCaterers, selectedCaterers: {$elemMatch: {$eq: req.body.sentTo } } }
  //}

  return Event.find(query).exec()
    .then(respondWithResult(res))
    .catch(handleError(res));
}

export function dataset(req, res) {
  let query = {},
    isUser = (req.body.userId ? true : false),
    isCaterer = (req.body.catererId ? true : false),
    isAdmin = !isUser && !isCaterer,
    today = new Date(new Date().setHours(0, 0, 0, 0)) /*.toISOString()*/;

  if (isUser) {
    query = {
      userId: req.body.userId
    }
  } else if (isCaterer) {
    query = {
      showToCaterers: req.body.showToCaterers /*, selectedCaterers: {$elemMatch: {$eq: req.body.sentTo } }*/
    }
    if (req.body.foodTypes && req.body.foodTypes.length) {
      query.foodTypes = { $in: req.body.foodTypes }
    }
    if (req.body.serviceTypes && req.body.serviceTypes.length) {
      query.serviceTypes = { $in: req.body.serviceTypes }
    }
  }

  if (!isAdmin) query.date = { $gte: today };

  if (req.body.confirmedDate && req.body.createDate && req.body.status) {
    let newExpression = {},
      confirmedExpression = {};

    newExpression.createDate = { $gte: new Date(req.body.createDate)/*.toISOString()*/ };

    confirmedExpression.confirmedDate = { $gte: new Date(req.body.confirmedDate)/*.toISOString()*/ };
    confirmedExpression.status = req.body.status;

    query = { $or: [ _.merge(newExpression, query), _.merge(confirmedExpression, query) ] };
  } else {
    if (req.body.confirmedDate) query.confirmedDate = { $gte: new Date(req.body.confirmedDate)/*.toISOString()*/ };
    if (req.body.createDate) query.createDate = { $gte: new Date(req.body.createDate)/*.toISOString()*/ };
    if (req.body.status) query.status = req.body.status;
  }

  if (!req.body.status) query.status = { $not: /(cancelled)/};

  return Event.find(query).exec().then((events) => {
    let eventPromises = [];
    events.forEach((event, i) => {
      events[i] = events[i].toObject();
      if (isCaterer && event.selectedCaterers.length && _.indexOf(event.selectedCaterers, req.body.catererId) == -1)
      {
        _.pull(events, event);
      } else {
        let total = { eventId: '' + event._id, status: { $not: /(draft)/} },
          catererQuery = { eventId: '' + event._id, catererId: req.body.catererId},
          adminQuery = {eventId: '' + event._id, status: 'confirmed'};
        if (isAdmin) {
          eventPromises.push(Offer.find(adminQuery).exec().then((offers) => {
            events[i].offers = offers;
            //if (isAdmin) events[i].offer = offers[0];
            return events[i];
          }));
        } else if (isCaterer) {

          eventPromises.push(Offer.find(total).exec()
            .then((offersTotal) => {
              events[i].offersTotal = offersTotal.length;
            })
            .then(() => {
              return Offer.find(catererQuery).exec();
            })
            .then((offers) => {
              events[i].offers = offers;
              //console.log(events[i]);
              return events[i];
            }));

        } else {
          eventPromises.push(Offer.find(total).exec().then((offers) => {
            events[i].offers = offers;
            return events[i];
          }));
        }
      }
    });

    return Promise.all(eventPromises).then(() => {
        return events;
     }).then(respondWithResult(res))
      .catch(handleError(res));

 });
}

// Gets a list of Events
export function filteredList(req, res) {
  return Event.find(req.body).exec()
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Gets a list of Events
export function getState(req, res) {
  return Event.findById(req.params.id).exec()
    .then(handleEntityNotFound(res))
    .then(respondWithResult({status: res.data.status}))
    .catch(handleError(res));
}

export function isSentTo(req, res) {
  return Event.findById(req.params.id).exec()
    .then(handleEntityNotFound(res))
    .then(respondWithResult({status: res.data.sentTo}))
    .catch(handleError(res));
}

export function isUpdated(req, res) {
  return Event.findById(req.params.id).exec()
    .then(handleEntityNotFound(res))
    .then(respondWithResult({status: res.data.isUpdated}))
    .catch(handleError(res));
}

// Gets a single Thing from the DB
export function show(req, res) {
  return Event.findById(req.params.id).exec()
    .then(handleEntityNotFound(res))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Creates a new Thing in the DB
export function create(req, res) {
  return Event.create(req.body)
    .then((res) => {
      if (req.body.showToCaterers) mailer.notifyEvent(req.body, 'created');
      return res;
    })
    .then(respondWithResult(res, 201))
    .catch(handleError(res));
}

// Updates an existing Thing in the DB
export function update(req, res) {
  if (req.body._id) {
    delete req.body._id;
  }

  return Event.findById(req.params.id).exec()
    .then(handleEntityNotFound(res))
    .then(saveUpdates(req.body))
    .then((res) => {
      return res;
    })
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Deletes a Thing from the DB
export function destroy(req, res) {
  return Event.findById(req.params.id).exec()
    .then(handleEntityNotFound(res))
    .then(removeEntity(res))
    .catch(handleError(res));
}
