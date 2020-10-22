const express = require('express');
const userRouter = express.Router();
const { User } = require('../models/user.model');
const {
  createUser,
  getUsers,
  getUserById,
  updateUserById,
  deleteUserById
} = require('../controllers/user.controller');
const { getUserEvents } = require('../controllers/event.controller');
const {
  dayjs,
  getResponseHandler
} = require('../../util');

// Get all user resources
userRouter.get('/', (req, res, next) => {
  getUsers()
    .then(getResponseHandler)
    .then(r => res.json(r))
    .catch(next);
});

// Create a new user resource
userRouter.post('/', (req, res, next) => {
  let newUser = new User({ ...req.body });
  createUser(newUser)
    .then(async r => {
      if (req.body.users)
      {
        await req.body.users.forEach(async user_id => { await linkEventToUser(newEvent.event_id, user_id); });
      }
      res.status(201).json({ ...newUser, id: r.insertId });
    })
    .catch(next);
});

// Get a single user resource by id
userRouter.get('/:id', (req, res, next) => {
  getUserById(req.params.id)
    .then(getResponseHandler)
    .then(r => res.json(r))
    .catch(next);
});

// Update a single user resource by id
userRouter.put('/:id', (req, res, next) => {
  updateUserById(req.params.id, req.body)
    .then(r => {
      res.sendStatus(204);
    })
    .catch(next);
});

// Delete a single user resource by id
userRouter.delete('/:id', (req, res, next) => {
  deleteUserById(req.params.id)
    .then(r => {
      res.sendStatus(204);
    })
    .catch(next);
});

// Get all event resources associated with a user id
userRouter.get('/:id/events', (req, res, next) => {
  console.log('here');
  let { start, end } = req.query;
  if (start) start = dayjs(start).startOf('day');
  if (end) end = dayjs(end).endOf('day');
  getUserEvents({ id: req.params.id, range: { start, end } })
    .then(getResponseHandler)
    .then(r => res.json(r))
    .catch(next);
});

module.exports = userRouter;