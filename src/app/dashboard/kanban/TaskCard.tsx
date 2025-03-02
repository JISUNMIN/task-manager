import React from 'react';

type TaskCardProps = {
  title: string;
  description: string;
};

const TaskCard: React.FC<TaskCardProps> = ({ title, description }) => {
  return (
    <div className="bg-gray-100 p-4 rounded-lg shadow-md mb-4">
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="text-sm text-gray-700">{description}</p>
    </div>
  );
};

export default TaskCard;
