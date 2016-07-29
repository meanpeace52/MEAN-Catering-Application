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
import Comment from './comment.model';
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
    for (let key in updates) {
      entity[key] = updates[key];
      delete updates[key];
    }
    var updated = _.mergeWith(entity, updates);
    //mailer.notifyComment(updated, 'updated');
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

// Gets a list of Comments
export function index(req, res) {
  return Comment.find(req.body).exec()
    .then(respondWithResult(res))
    .catch(handleError(res));
}

export function thread(req, res) {
  let query = { $query: {}, $orderby: { createDate : -1 } },
      today = new Date().toISOString();

  //comment: {
  //  _id,
  //  name,
  //  userId,
  //  offerId //thread
  //  userName,
  //  text,
  //  level,
  //  repyTo //parent id
  //}

  return Comment.find(query)
     .aggregate([{
        $group: {
          _id: "$replyTo",
          comments: { $push: "$$ROOT" }
        }
      }]).exec().then((comments) => {
        console.log('comments', comments);
        //comments.forEach((comment, i) => {
        //  comments[i] = comments[i].toObject();
        //
        //})
      })
      .then(respondWithResult(res))
      .catch(handleError(res));
 });
}

// Gets a single Thing from the DB
export function show(req, res) {
  return Comment.findById(req.params.id).exec()
    .then(handleEntityNotFound(res))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Creates a new Thing in the DB
export function create(req, res) {
  return Comment.create(req.body)
    .then(respondWithResult(res, 201))
    .catch(handleError(res));
}

// Updates an existing Thing in the DB
export function update(req, res) {
  if (req.body._id) {
    delete req.body._id;
  }

  return Comment.findById(req.params.id).exec()
    .then(handleEntityNotFound(res))
    .then(saveUpdates(req.body))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Deletes a Thing from the DB
export function destroy(req, res) {
  return Comment.findById(req.params.id).exec()
    .then(handleEntityNotFound(res))
    .then(removeEntity(res))
    .catch(handleError(res));
}
