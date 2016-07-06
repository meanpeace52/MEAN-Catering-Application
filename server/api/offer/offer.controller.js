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
import Offer from './offer.model';
import Event from '../event/event.model';

function respondWithResult(res, statusCode) {
  statusCode = statusCode || 200;
  return function(entity) {
    if (entity) {
      res.status(statusCode).json(entity);
    }
  };
}

function saveEventUpdates(updates) {
  return function(entity) {
    console.log('event', entity);
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
  let query = {eventId: req.body.eventId};
  if (req.body.catererId) {
    query.catererId = req.body.catererId
  }

  return Offer.find(query).exec()
    .then(respondWithResult(res))
    .catch(handleError(res));
}

export function filteredList(req, res) {
  return Offer.find(req.body).exec()
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Gets a list of Events
export function getState(req, res) {
  return Offer.findById(req.params.id).exec()
    .then(handleEntityNotFound(res))
    .then(respondWithResult({status: res.data.status}))
    .catch(handleError(res));
}

export function isUpdated(req, res) {
  return Offer.findById(req.params.id).exec()
    .then(handleEntityNotFound(res))
    .then(respondWithResult({status: res.data.isUpdated}))
    .catch(handleError(res));
}

// Gets a single Offer from the DB
export function show(req, res) {
  return Offer.findById(req.params.id).exec()
    .then(handleEntityNotFound(res))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Creates a new Thing in the DB
export function create(req, res) {
  return Offer.create(req.body)
    .then(respondWithResult(res, 201))
    .catch(handleError(res));
}

// Updates an existing Thing in the DB
export function update(req, res) {
  if (req.body._id) {
    delete req.body._id;
  }

  if (req.body.eventId && (req.body.status == 'accepted' || req.body.status == 'confirmed')) {
    let updates = {status: req.body.status};
    if (updates.status = 'confirmed') {
      updates.confirmedBy = req.body.userId;
    }
    Event.findById(req.body.eventId).exec()
      .then(saveEventUpdates(updates));
  }
  return Offer.findById(req.params.id).exec()
    .then(handleEntityNotFound(res))
    .then(saveUpdates(req.body))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

export function cancelAll(req, res) {
  return Offer.update(req.body, { status: 'cancelled' }, { multi: true }).exec()
    .then((res) => {
      respondWithResult(res);
    })
    .catch(handleError(res));
}

// Deletes a Thing from the DB
export function destroy(req, res) {
  return Offer.findById(req.params.id).exec()
    .then(handleEntityNotFound(res))
    .then(removeEntity(res))
    .catch(handleError(res));
}
