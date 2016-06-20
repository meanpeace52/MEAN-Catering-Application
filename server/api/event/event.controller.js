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
    query = {showToCaterers: req.body.showToCaterers, selectedCaterers: {$elemMatch: {$eq: req.body.sentTo } } }
  }
  return Event.find(query).exec()
    .then(respondWithResult(res))
    .catch(handleError(res));
}

//filteredList
//getState
//isUpdated
//isSentTo

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
