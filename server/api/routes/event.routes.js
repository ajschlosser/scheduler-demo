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
eventRouter.post('/', async (req, res, next) => {
  let newEvent = new Event(
    req.body.start,
    req.body.end,
    req.body.title,
    {
      allDay: req.body.allDay,
      users: req.body.users
    }
  );
  try
  {
    const r = await createEvent(newEvent);
    if (req.body.users)
    {
      await req.body.users.forEach(
        async user_id =>
          await linkEventToUser(newEvent.event_id, user_id)
      );
    }
    res.status(201).json({ ...newEvent, id: r.insertId });
  }
  catch (err)
  {
    next(err);
  }
});

// Get all events in a range
eventRouter.get('/', async (req, res, next) => {
  const { start, end } = req.query;
  if (!start || !end)
  {
    res.sendStatus(400);
  }
  try {
    const r = await getEventsInRange(start, end);
    res.json(getResponseHandler(r));
  }
  catch (err)
  {
    next(err);
  }
});

// Get an existing event by id
eventRouter.get('/:id', async (req, res, next) => {
  try {
    const r = await getEventById(req.params.id);
    res.json(getResponseHandler(r));
  }
  catch (err)
  {
    next(err);
  }
});

// Update an existing event by id
eventRouter.put('/:id', async (req, res, next) => {
  try {
    await updateEventById(req.params.id, req.body);
    if (req.body.users)
    {
      await updateEventUsers(req.params.id, req.body.users);
    }
    res.sendStatus(204);    
  }
  catch (err)
  {
    next(err);
  }
});

// Delete an existing event by id
eventRouter.delete('/:id', async (req, res, next) => {
  try {
    const r = deleteEventById(req.params.id);
    res.json(getResponseHandler(r));
  }
  catch (err)
  {
    next(err);
  }
});

module.exports = eventRouter;