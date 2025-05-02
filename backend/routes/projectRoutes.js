const express = require('express');
const router = express.Router();
const projectService = require('../services/projectService');
const { authenticateToken } = require('../middleware/auth');

// Get all projects
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const projects = await projectService.getAllProjects(userId);
    res.json(projects);
  } catch (error) {
    console.error('Error in GET /projects:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get a project by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const project = await projectService.getProjectById(req.params.id, userId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    res.json(project);
  } catch (error) {
    console.error('Error in GET /projects/:id:', error);
    res.status(500).json({ message: error.message });
  }
});

// Create a new project
router.post('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const project = await projectService.createProject(req.body, userId);
    res.status(201).json(project);
  } catch (error) {
    console.error('Error in POST /projects:', error);
    res.status(400).json({ message: error.message });
  }
});

// Update a project
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const project = await projectService.updateProject(req.params.id, req.body, userId);
    res.json(project);
  } catch (error) {
    console.error('Error in PUT /projects/:id:', error);
    res.status(400).json({ message: error.message });
  }
});

// Delete a project
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    await projectService.deleteProject(req.params.id, userId);
    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Error in DELETE /projects/:id:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 