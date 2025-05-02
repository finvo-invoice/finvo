import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import './Timeline.css';

const Timeline = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { currentUser } = useAuth();

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        // TODO: Implement actual API call to fetch projects
        // This is mock data for now
        const mockProjects = [
          {
            id: 1,
            name: 'Website Redesign',
            startDate: '2024-01-01',
            endDate: '2024-03-31',
            status: 'in-progress',
            milestones: [
              { id: 1, title: 'Design Phase', date: '2024-01-15', completed: true },
              { id: 2, title: 'Development', date: '2024-02-15', completed: true },
              { id: 3, title: 'Testing', date: '2024-03-15', completed: false },
              { id: 4, title: 'Launch', date: '2024-03-31', completed: false }
            ]
          },
          {
            id: 2,
            name: 'Mobile App Development',
            startDate: '2024-02-01',
            endDate: '2024-05-31',
            status: 'in-progress',
            milestones: [
              { id: 1, title: 'Requirements Gathering', date: '2024-02-15', completed: true },
              { id: 2, title: 'UI/UX Design', date: '2024-03-15', completed: false },
              { id: 3, title: 'Development Phase 1', date: '2024-04-15', completed: false },
              { id: 4, title: 'Testing & Launch', date: '2024-05-31', completed: false }
            ]
          }
        ];
        
        setProjects(mockProjects);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch projects');
        setLoading(false);
      }
    };

    fetchProjects();
  }, [currentUser]);

  if (loading) {
    return <div className="timeline-loading">Loading projects...</div>;
  }

  if (error) {
    return <div className="timeline-error">{error}</div>;
  }

  return (
    <div className="timeline-page">
      <div className="timeline-header">
        <h1>Project Timeline</h1>
        <p>Track your project milestones and progress</p>
      </div>

      <div className="timeline-content">
        {projects.map(project => (
          <div key={project.id} className="project-timeline">
            <div className="project-header">
              <h2>{project.name}</h2>
              <span className={`status ${project.status}`}>
                {project.status.replace('-', ' ')}
              </span>
            </div>

            <div className="timeline">
              {project.milestones.map((milestone, index) => (
                <div key={milestone.id} className="milestone">
                  <div className={`milestone-dot ${milestone.completed ? 'completed' : ''}`} />
                  <div className="milestone-content">
                    <h3>{milestone.title}</h3>
                    <p>{new Date(milestone.date).toLocaleDateString()}</p>
                  </div>
                  {index < project.milestones.length - 1 && (
                    <div className={`milestone-line ${milestone.completed ? 'completed' : ''}`} />
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Timeline; 