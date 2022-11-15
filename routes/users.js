const express = require("express");
const router = express.Router();
const { nanoid } = require("nanoid");

const idLength = 8;

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - username
 *         - coins
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated id of the user
 *         username:
 *           type: string
 *           description: name chosen by the user
 *         coins:
 *           type: int
 *           description: balance of coins the user has
 *       example:
 *         id: d5fE_asz
 *         username: Random User
 *         coins : 71
 *     SendCoin:
 *       type: object
 *       required:
 *         - id
 *         - coins
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated id of the user to whom we are sending the coins
 *         coins:
 *           type: int
 *           description: coins the user wants to send
 *       example:
 *         id: d5fE_asz
 *         coins : 71
 */

/**
 * @swagger
 * tags:
 *   name: Coins Exchange
 *   description: The coin managing APIs
 */

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Returns the list of all the users
 *     tags: [Coins Exchange]
 *     responses:
 *       200:
 *         description: The list of the users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 */

router.get("/", (req, res) => {
  const users = req.app.db.get("users");

  res.send(users);
});

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Get the user by id
 *     tags: [Coins Exchange]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The user id
 *     responses:
 *       200:
 *         description: The user by id
 *         contens:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: The user was not found
 */

router.get("/:id", (req, res) => {
  const user = req.app.db.get("users").find({ id: req.params.id }).value();

  if (!user) {
    res.sendStatus(404);
  }

  res.send(user);
});

/**
 * @swagger
 * /users:
 *   post:
 *     summary: Create a new user
 *     tags: [Coin Exchange]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       200:
 *         description: The user was successfully created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       500:
 *         description: Some server error
 */

router.post("/", (req, res) => {
  try {
    const user = {
      id: nanoid(idLength),
      username: req.body.username,
      coins: 100,
    };

    req.app.db.get("users").push(user).write();

    res.send(user);
  } catch (error) {
    return res.status(500).send(error);
  }
});

/**
 * @swagger
 * /users/{id}:
 *  put:
 *    summary: send the user by the id
 *    tags: [Coins Exchange]
 *    parameters:
 *      - in: path
 *        name: id
 *        schema:
 *          type: string
 *        required: true
 *        description: The sender's id
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/SendCoin'
 *    responses:
 *      200:
 *        description: The user was updated
 *      404:
 *        description: The user was not found
 *      500:
 *        description: Some error happened
 */

router.put("/:id", (req, res) => {
  try {
    let sender_id = req.params.id;
    let receiver_id = req.body.id;
    let coinsToSend = req.body.coins;
    if (sender_id.trim() === receiver_id.trim())
      throw new Error("Cant send coins to yourself");
    let sender = req.app.db.get("users").find({ id: sender_id }).value();

    if (sender.coins < coinsToSend)
      throw new Error("Sender doesnt have enough coins");

    let receiver = req.app.db.get("users").find({ id: receiver_id }).value();

    console.log({ sender, receiver, coinsToSend });
    receiver.coins += coinsToSend;
    sender.coins -= coinsToSend;
    console.log({ sender, receiver });

    req.app.db.find({ id: sender_id }).assign(sender).write();
    req.app.db.find({ id: receiver_id }).assign(receiver).write();
    res.send({ sender, receiver });
  } catch (error) {
    return res.status(500).send(error);
  }
});

module.exports = router;
