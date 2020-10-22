const express = require('express');
const eventRouter = express.Router();
const { Event } = require('../models/event.model');
const {
  updateEventUsers,
  getEventById,
  getEventsInRange,
  updateEventById,
  deleteEventById,
  createEvent,
  linkEventToUser
} = require('../controllers/event.controller');
const {
  getResponseHandler
} = require('../../util');

// Create a new event
eventRouter.post('/', (req, res, next) => {
  let newEvent = new Event(
    req.body.start,
    req.body.end,
    req.body.title,
    { allDay: req.body.allDay, users: req.body.users }
  );
  createEvent(newEvent)
    .then(async r => {
      if (req.body.users)
      {
        await req.body.users.forEach(async user_id => { await linkEventToUser(newEvent.event_id, user_id); });
      }
      res.status(201).json({ ...newEvent, id: r.insertId });
    })
    .catch(next);
});

// Get all events in a range
eventRouter.get('/', (req, res, next) => {
  let { start, end } = req.query;
  if (!start || !end)
  {
    res.sendStatus(400);
  }
  getEventsInRange(start, end)
    .then(getResponseHandler)
    .then(r => res.json(r))
    .catch(next);
});

// Get an existing event by id
eventRouter.get('/:id', (req, res, next) => {
  getEventById(req.params.id)
    .then(getResponseHandler)
    .then(r => res.json(r))
    .catch(next);
});

// Update an existing event by id
eventRouter.put('/:id', (req, res, next) => {
  updateEventById(req.params.id, req.body)
    .then(async r => {
      if (req.body.users)
      {
        await updateEventUsers(req.params.id, req.body.users);
      }
      res.sendStatus(204);
    })
    .catch(next);
});

// Delete an existing event by id
eventRouter.delete('/:id', (req, res, next) => {
  deleteEventById(req.params.id)
    .then(r => res.json(r))
    .catch(next);
});

module.exports = eventRouter;