const express = require('express');
const userRouter = express.Router();
const { User } = require('../models/user.model');
const {
  createUser,
  getUsers,
  getUserById,
  updateUserById,
  deleteUserById,
  linkEventToUser
} = require('../controllers/user.controller');
const { getUserEvents } = require('../controllers/event.controller');
const {
  dayjs,
  getResponseHandler
} = require('../../util');

// Get all user resources
userRouter.get('/', async (req, res, next) => {
  try
  {
    const r = await getUsers();
    res.json(getResponseHandler(r));
  }
  catch (err)
  {
    next(err);
  }
});

// Create a new user resource
userRouter.post('/', async (req, res, next) => {
  try
  {
    let newUser = new User({ ...req.body });
    const r = await createUser(newUser);
    if (req.body.users)
    {
      await req.body.events.forEach(
        async event_id =>
          await linkEventToUser(event_id, newUser.user_id)
      );
    }
    res.status(201).json({ ...newUser, id: r.insertId });
  }
  catch (err)
  {
    next(err);
  }
});

// Get a single user resource by id
userRouter.get('/:id', async (req, res, next) => {
  try
  {
    const r = await getUserById(req.params.id);
    res.json(getResponseHandler(r));
  }
  catch (err)
  {
    next(err);
  }
});

// Update a single user resource by id
userRouter.put('/:id', async (req, res, next) => {
  try
  {
    await updateUserById(req.params.id, req.body)
    res.sendStatus(204);
  }
  catch (err)
  {
    next(err);
  }
});

// Delete a single user resource by id
userRouter.delete('/:id', async (req, res, next) => {
  try
  {
    await deleteUserById(req.params.id)
    res.sendStatus(204);
  }
  catch (err)
  {
    next(err);
  }
});

// Get all event resources associated with a user id
userRouter.get('/:id/events', async (req, res, next) => {
  let { start, end } = req.query;
  if (start)
    start = dayjs(start).startOf('day');
  if (end)
    end = dayjs(end).endOf('day');
  try
  {
    const r = await getUserEvents({ id: req.params.id, range: { start, end } })
    res.json(getResponseHandler(r));
  }
  catch (err)
  {
    next(err);
  }
});

module.exports = userRouter;