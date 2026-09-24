const express = require('express');
const { body } = require('express-validator');
const taskController = require('../controllers/taskController');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

const taskValidation = [
  body('title').trim().notEmpty().withMessage('Title is required')
    .isLength({ max: 100 }).withMessage('Title cannot exceed 100 characters'),
  body('description').optional().trim()
    .isLength({ max: 500 }).withMessage('Description cannot exceed 500 characters'),
  body('status').optional().isIn(['todo', 'inprogress', 'completed'])
    .withMessage('Invalid status'),
  body('priority').optional().isIn(['low', 'medium', 'high'])
    .withMessage('Invalid priority')
];

router.use(auth);

router.get('/stats', taskController.getTaskStats);
router.post('/', taskValidation, validate, taskController.createTask);
router.get('/', taskController.getAllTasks);
router.get('/:id', taskController.getTaskById);
router.put('/:id', taskValidation, validate, taskController.updateTask);
router.delete('/:id', taskController.deleteTask);

module.exports = router;