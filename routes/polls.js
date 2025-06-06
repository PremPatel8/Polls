const express = require('express');
const { ObjectId } = require('mongodb');
const { validatePoll, validateUpdatePoll } = require('../utils/validation');
const router = express.Router();

// GET /polls - Get all polls with pagination and search
router.get('/', async (req, res) => {
  try {
    const db = req.app.locals.db;
    const collection = db.collection('polls');
    
    // Parse query parameters
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 3));
    const skip = (page - 1) * limit;
    const search = req.query.search?.trim();

    // Build query
    let query = {};
    if (search) {
      query = { question: { $regex: search, $options: 'i' } };
    }

    // Execute queries
    const [polls, totalCount] = await Promise.all([
      collection
        .find(query)
        .sort({ created_at: -1 })
        .skip(skip)
        .limit(limit)
        .toArray(),
      collection.countDocuments(query)
    ]);

    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / limit);

    res.json({
      data: polls,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    console.error('Error fetching polls:', error);
    res.status(500).json({
      error: 'Failed to fetch polls'
    });
  }
});

// GET /polls/:id - Get a single poll by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate ObjectId
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        error: 'Invalid poll ID'
      });
    }

    const db = req.app.locals.db;
    const collection = db.collection('polls');
    
    const poll = await collection.findOne({ _id: new ObjectId(id) });
    
    if (!poll) {
      return res.status(404).json({
        error: 'Poll not found'
      });
    }

    res.json({ data: poll });
  } catch (error) {
    console.error('Error fetching poll:', error);
    res.status(500).json({
      error: 'Failed to fetch poll'
    });
  }
});

// POST /polls - Create a new poll
router.post('/', async (req, res) => {
  try {
    // Validate request body
    const validation = validatePoll(req.body);
    if (!validation.isValid) {
      return res.status(400).json({
        error: 'Validation error',
        details: validation.errors
      });
    }

    const db = req.app.locals.db;
    const collection = db.collection('polls');
    
    const now = Math.floor(Date.now() / 1000);
    const pollDocument = {
      created_at: now,
      updated_at: now,
      question: validation.data.question.trim(),
      options: validation.data.options.map(option => option.trim())
    };

    const result = await collection.insertOne(pollDocument);
    
    // Fetch the created poll
    const createdPoll = await collection.findOne({ _id: result.insertedId });

    res.status(201).json({
      message: 'Poll created successfully',
      data: createdPoll
    });
  } catch (error) {
    console.error('Error creating poll:', error);
    res.status(500).json({
      error: 'Failed to create poll'
    });
  }
});

// PUT /polls/:id - Update a poll
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate ObjectId
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        error: 'Invalid poll ID'
      });
    }

    // Validate request body
    const validation = validateUpdatePoll(req.body);
    if (!validation.isValid) {
      return res.status(400).json({
        error: 'Validation error',
        details: validation.errors
      });
    }

    const db = req.app.locals.db;
    const collection = db.collection('polls');
    
    // Check if poll exists
    const existingPoll = await collection.findOne({ _id: new ObjectId(id) });
    if (!existingPoll) {
      return res.status(404).json({
        error: 'Poll not found'
      });
    }

    // Prepare update document
    const updateDoc = {
      updated_at: Math.floor(Date.now() / 1000)
    };

    if (validation.data.question !== undefined) {
      updateDoc.question = validation.data.question.trim();
    }

    if (validation.data.options !== undefined) {
      updateDoc.options = validation.data.options.map(option => option.trim());
    }

    // Update the poll
    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: updateDoc },
      { returnDocument: 'after' }
    );

    res.json({
      message: 'Poll updated successfully',
      data: result.value
    });
  } catch (error) {
    console.error('Error updating poll:', error);
    res.status(500).json({
      error: 'Failed to update poll'
    });
  }
});

// DELETE /polls/:id - Delete a poll
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate ObjectId
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        error: 'Invalid poll ID'
      });
    }

    const db = req.app.locals.db;
    const collection = db.collection('polls');
    
    // Check if poll exists and delete it
    const result = await collection.findOneAndDelete({ _id: new ObjectId(id) });

    if (!result) {
      return res.status(404).json({
        error: 'Poll not found'
      });
    }

    res.json({
      message: 'Poll deleted successfully',
      data: result.value
    });
  } catch (error) {
    console.error('Error deleting poll:', error);
    res.status(500).json({
      error: 'Failed to delete poll'
    });
  }
});

module.exports = router;