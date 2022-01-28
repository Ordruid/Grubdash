const path = require('path');
const dishes = require(path.resolve('src/data/dishes-data'));
const nextId = require('../utils/nextId');


function validateDishProperties(req, res, next) {
  const { data: { name, description, price, image_url } = {} } = req.body;

  if (name === undefined || name === '') {
    return next({ status: 400, message: 'Dish must include a name' });
  }
  if (description === undefined || description === '') {
    return next({ status: 400, message: 'Dish must include a description' });
  }
  if (price === undefined) {
    return next({ status: 400, message: 'Dish must include a price' });
  }
  if (price <= 0 || typeof price !== 'number' || Number.isNaN(price)) {
    return next({
      status: 400,
      message: 'Dish must have a price that is an integer greater than 0',
    });
  }
  if (image_url === undefined || image_url === '')
    return next({
      status: 400,
      message: 'Dish must include a image_url',
    });
  const newDish = {
    data: {
      name,
      description,
      price,
      image_url,
    },
  };
  res.locals.newDish = newDish;
  next();
}

function validateDishId(req, res, next) {
  const { data: { id } = {} } = req.body;
  const { dishId } = req.params;
  const index = dishes.findIndex((dish) => dish.id === dishId);
  res.locals.index = index;
  res.locals.dishId = dishId;

  if (index === -1) {
    return next({
      status: 404,
      message: `Dish does not exist: ${dishId}`,
    });
  } else if (id) {
    dishes[index].id === id
      ? next()
      : next({
          status: 400,
          message: `Dish id does not match route id. Dish: ${id}, Route: ${dishId}`,
        });
  } else {
    next();
  }
}


function create(req, res) {
  const newDishWithId = { ...res.locals.newDish.data, id: nextId() };
  dishes.push(newDishWithId);
  res.status(201).json({ data: newDishWithId });
}

function read(req, res) {
  const { index } = res.locals;
  res.status(200).json({ data: dishes[index] });
}

function update(req, res) {
  const { index, dishId } = res.locals;
  const {
    data: { id, ...rest },
  } = req.body;

  dishes[index] = { ...rest, id: dishId };
  res.status(200).json({
    data: {
      id: dishId,
      ...rest,
    },
  });
}


function list(req, res) {
  res.status(200).json({
    data: dishes,
  });
}

module.exports = {
  create: [validateDishProperties, create],
  read: [validateDishId, read],
  update: [validateDishId, validateDishProperties, update],
  list,
};